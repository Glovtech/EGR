import { NextResponse } from "next/server";
import { Resend } from "resend";
import { CURRENCY, DELIVERY_DAYS, PRODUCT_NAME, REGIONS, getPackage, normalizeGhanaPhone } from "@/lib/catalog";

// Created on first request so builds don't need RESEND_API_KEY
let resend: Resend | null = null;
const getResend = () => (resend ??= new Resend(process.env.RESEND_API_KEY));

const clean = (v: unknown, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

const makeOrderRef = () =>
  "EGR-" +
  Date.now().toString(36).toUpperCase().slice(-5) +
  Math.random().toString(36).slice(2, 5).toUpperCase();

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Honeypot: real users never fill this hidden field
    if (clean(body.company)) {
      return NextResponse.json({ success: true, orderRef: makeOrderRef() });
    }

    const name = clean(body.name, 100);
    const location = clean(body.location, 200);
    const note = clean(body.note, 1000);
    const phone = normalizeGhanaPhone(clean(body.phone, 20));
    const altPhoneRaw = clean(body.altPhone, 20);
    const altPhone = altPhoneRaw ? normalizeGhanaPhone(altPhoneRaw) : "";
    const region = clean(body.region, 40);
    const deliveryDay = clean(body.deliveryDay, 20);
    // Price always comes from the catalog, never from the client
    const pkg = getPackage(clean(body.packageId, 20));

    if (!name || !location || !pkg) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ error: "Please enter a valid Ghana phone number" }, { status: 400 });
    }
    if (altPhone === null) {
      return NextResponse.json({ error: "Please enter a valid second phone number" }, { status: 400 });
    }
    if (!REGIONS.includes(region)) {
      return NextResponse.json({ error: "Please select your region" }, { status: 400 });
    }
    if (!(DELIVERY_DAYS as readonly string[]).includes(deliveryDay)) {
      return NextResponse.json({ error: "Please choose a delivery day" }, { status: 400 });
    }
    // Pay-on-delivery commitment: both confirmations are required
    if (body.readyToPay !== true || body.canAfford !== true) {
      return NextResponse.json(
        { error: "Please confirm you're ready to receive and pay on delivery" },
        { status: 400 }
      );
    }

    const orderRef = makeOrderRef();

    // Plain text email (good for inbox deliverability)
    const emailText = `
NEW ORDER FROM EVERGREEN REMEDY GHANA
Reference: ${orderRef}

Customer Details:
-----------------
Name: ${name}
Phone: ${phone}
Second phone: ${altPhone || "Not provided"}
Region: ${region}
Exact location: ${location}

Order Details:
--------------
Product: ${PRODUCT_NAME}
Package: ${pkg.label}
Quantity: ${pkg.quantity}
Price: ${CURRENCY}${pkg.price}
Delivery: ${pkg.freeDelivery ? "Free nationwide" : "Standard"}
Deliver: ${deliveryDay}
Payment: Pay on delivery (customer confirmed ready to pay)

Additional Note:
${note || "No additional notes"}

-----------------
Submitted via the Evergreen Remedy Ghana website.
    `.trim();

    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY is not set");
      return NextResponse.json({ error: "Ordering is temporarily unavailable" }, { status: 500 });
    }

    const { error } = await getResend().emails.send({
      from: "Evergreen Remedy Ghana <onboarding@resend.dev>", // or your verified domain sender
      to: ["supplegenixsaleshub@gmail.com"],
      subject: `New Order ${orderRef} - ${pkg.label} - ${region} - Deliver ${deliveryDay}`,
      text: emailText,
    });

    if (error) {
      console.error("❌ Resend send error:", error);
      return NextResponse.json({ error: "Failed to send order" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderRef,
      price: pkg.price,
      message: "Order sent successfully",
    });
  } catch (error) {
    console.error("❌ Unexpected server error:", error);
    return NextResponse.json({ error: "Server error occurred" }, { status: 500 });
  }
}
