import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getPackage, normalizeGhanaPhone } from "@/lib/catalog";
import { LIMITS, MESSAGES, validateConfirm, validateDetails, type OrderDetails } from "@/lib/order";
import { orderEmailHtml, orderEmailSubject, orderEmailText } from "@/lib/orderEmail";

// Created on first request so builds don't need RESEND_API_KEY
let resend: Resend | null = null;
const getResend = () => (resend ??= new Resend(process.env.RESEND_API_KEY));

// Sender/recipient can be changed in Vercel without a code change
const ORDER_FROM = process.env.ORDER_EMAIL_FROM || "Evergreen Remedy Ghana <onboarding@resend.dev>";
const ORDER_TO = (process.env.ORDER_EMAIL_TO || "supplegenixsaleshub@gmail.com").split(",").map((s) => s.trim());

const clean = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

const makeOrderRef = () =>
  "EGR-" + Date.now().toString(36).toUpperCase().slice(-5) + Math.random().toString(36).slice(2, 5).toUpperCase();

// `field` lets the form jump to the input that needs fixing
const fail = (error: string, status = 400, field?: string) =>
  NextResponse.json(field ? { error, field } : { error }, { status });

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return fail(MESSAGES.badRequest);

    // Honeypot: real users never fill this hidden field
    if (clean(body.company)) {
      return NextResponse.json({ success: true, orderRef: makeOrderRef() });
    }

    const details: OrderDetails = {
      name: clean(body.name, LIMITS.name),
      phone: clean(body.phone, LIMITS.phone),
      altPhone: clean(body.altPhone, LIMITS.phone),
      region: clean(body.region, LIMITS.region),
      location: clean(body.location, LIMITS.location),
      note: clean(body.note, LIMITS.note),
    };
    const ready = body.ready === "yes" || body.ready === "no" ? body.ready : "";
    const deliveryDay = clean(body.deliveryDay, 20);

    // Same rules (and messages) as the checkout form
    const errors = { ...validateDetails(details), ...validateConfirm({ ready, deliveryDay, canAfford: body.canAfford === true }) };
    const [field, message] = Object.entries(errors)[0] ?? [];
    if (field && message) return fail(message, 400, field);

    // Price always comes from the catalog, never from the client
    const pkg = getPackage(clean(body.packageId, 20));
    if (!pkg) return fail(MESSAGES.packageInvalid);

    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY is not set");
      return fail(MESSAGES.sendFailed, 503);
    }

    const order = {
      orderRef: makeOrderRef(),
      createdAt: new Date(),
      pkg,
      ...details,
      phone: normalizeGhanaPhone(details.phone)!,
      altPhone: details.altPhone ? normalizeGhanaPhone(details.altPhone)! : "",
      deliveryDay,
    };

    const { error } = await getResend().emails.send({
      from: ORDER_FROM,
      to: ORDER_TO,
      subject: orderEmailSubject(order),
      html: orderEmailHtml(order),
      text: orderEmailText(order),
    });

    if (error) {
      console.error("❌ Resend send error:", error);
      return fail(MESSAGES.sendFailed, 502);
    }

    return NextResponse.json({ success: true, orderRef: order.orderRef, price: pkg.price });
  } catch (error) {
    console.error("❌ Unexpected server error:", error);
    return fail(MESSAGES.sendFailed, 500);
  }
}
