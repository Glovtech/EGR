// Order notification email for the sales team. Table-based HTML with inline
// styles (what email clients reliably support), plus a plain-text fallback.
import { CURRENCY, PRODUCT_NAME, type Package } from './catalog';

export type OrderEmailData = {
  orderRef: string;
  createdAt: Date;
  pkg: Package;
  name: string;
  phone: string; // normalised, +233…
  altPhone: string; // normalised or ''
  region: string;
  location: string;
  deliveryDay: string;
  note: string;
};

const C = { ink: '#0d1f1a', muted: '#5b6b66', line: '#e6e9e4', paper: '#f7f6f1', leaf: '#0f8a5f', mint: '#e3f1e8', amber: '#fff4d6' };
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const money = (n: number) => `${CURRENCY}${n.toLocaleString('en-GH')}`;
const prettyPhone = (p: string) => p.replace(/^\+233(\d{2})(\d{3})(\d{4})$/, '0$1 $2 $3');
const waLink = (p: string, text: string) => `https://wa.me/${p.replace(/^\+/, '')}?text=${encodeURIComponent(text)}`;
const mapsLink = (location: string, region: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location}, ${region}, Ghana`)}`;
const ghanaTime = (d: Date) =>
  d.toLocaleString('en-GB', { timeZone: 'Africa/Accra', dateStyle: 'medium', timeStyle: 'short' });

export function orderEmailSubject(o: OrderEmailData) {
  return `New order ${o.orderRef}: ${o.pkg.label}, ${money(o.pkg.price)}, deliver ${o.deliveryDay.toLowerCase()} (${o.region})`;
}

const row = (label: string, value: string) => `
  <tr>
    <td style="padding:10px 0;border-top:1px solid ${C.line};color:${C.muted};font-size:13px;width:38%;vertical-align:top;">${label}</td>
    <td style="padding:10px 0;border-top:1px solid ${C.line};color:${C.ink};font-size:15px;font-weight:600;vertical-align:top;">${value}</td>
  </tr>`;

const button = (href: string, label: string, bg: string, color = '#ffffff', border = bg) =>
  `<a href="${esc(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:10px 18px;border-radius:999px;border:1px solid ${border};background:${bg};color:${color};font-size:14px;font-weight:600;text-decoration:none;">${label}</a>`;

export function orderEmailHtml(o: OrderEmailData) {
  const greet = `Hello ${o.name.split(' ')[0]}, this is Evergreen Remedy Ghana about your ${o.pkg.label} order (${o.orderRef}).`;
  const phoneLinks = [
    `<a href="tel:${o.phone}" style="color:${C.ink};text-decoration:none;">${prettyPhone(o.phone)}</a>`,
    o.altPhone ? `<a href="tel:${o.altPhone}" style="color:${C.ink};text-decoration:none;">${prettyPhone(o.altPhone)}</a> <span style="color:${C.muted};font-weight:400;">(second)</span>` : '',
  ].filter(Boolean);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(orderEmailSubject(o))}</title>
</head>
<body style="margin:0;padding:0;background:${C.paper};font-family:${FONT};">
<div style="display:none;max-height:0;overflow:hidden;">${esc(`${o.name} · ${prettyPhone(o.phone)} · ${o.location}, ${o.region} · collect ${money(o.pkg.price)}`)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};">
  <tr><td align="center" style="padding:28px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

      <!-- Brand -->
      <tr><td style="padding:0 4px 16px;font-size:15px;font-weight:700;color:${C.ink};">
        <span style="display:inline-block;width:10px;height:10px;border-radius:999px;background:${C.leaf};margin-right:8px;"></span>Evergreen Remedy Ghana
      </td></tr>

      <!-- Card -->
      <tr><td style="background:#ffffff;border-radius:20px;padding:28px 24px;">
        <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${C.leaf};font-weight:700;">New order · Pay on delivery</p>
        <h1 style="margin:8px 0 4px;font-size:26px;line-height:1.2;color:${C.ink};">${esc(o.pkg.label)} for ${esc(o.name)}</h1>
        <p style="margin:0;font-size:13px;color:${C.muted};">Ref <strong style="color:${C.ink};font-family:Menlo,Consolas,monospace;">${esc(o.orderRef)}</strong> · ${esc(ghanaTime(o.createdAt))} (Ghana time)</p>

        <!-- Amount to collect -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 6px;background:${C.mint};border-radius:14px;">
          <tr>
            <td style="padding:16px 18px;">
              <p style="margin:0;font-size:12px;color:${C.muted};">Rider collects on delivery</p>
              <p style="margin:2px 0 0;font-size:30px;font-weight:800;color:${C.ink};">${money(o.pkg.price)}</p>
            </td>
            <td align="right" style="padding:16px 18px;font-size:13px;color:${C.ink};">
              ${o.pkg.quantity} × ${esc(PRODUCT_NAME)}<br>
              <span style="color:${C.muted};">${o.pkg.freeDelivery ? 'Free delivery' : 'Standard delivery'}</span>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 18px;font-size:13px;color:${C.muted};">Deliver <strong style="color:${C.ink};">${esc(o.deliveryDay.toLowerCase())}</strong>. The customer confirmed they’re ready to pay and can afford it.</p>

        <!-- Quick actions -->
        <div>
          ${button(`tel:${o.phone}`, `Call ${esc(prettyPhone(o.phone))}`, C.ink)}
          ${button(waLink(o.phone, greet), 'WhatsApp customer', '#25D366', C.ink)}
          ${button(mapsLink(o.location, o.region), 'Open in Maps', '#ffffff', C.ink, C.line)}
        </div>

        <!-- Customer & delivery -->
        <h2 style="margin:22px 0 4px;font-size:14px;color:${C.ink};">Customer</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${row('Name', esc(o.name))}
          ${row('Phone', phoneLinks.join('<br>'))}
        </table>

        <h2 style="margin:22px 0 4px;font-size:14px;color:${C.ink};">Delivery</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${row('Region', esc(o.region))}
          ${row('Exact location', esc(o.location))}
          ${row('When', esc(o.deliveryDay))}
        </table>

        ${
          o.note
            ? `<div style="margin-top:20px;padding:14px 16px;background:${C.amber};border-radius:12px;font-size:14px;color:${C.ink};">
                 <strong style="display:block;font-size:12px;color:${C.muted};margin-bottom:4px;">Customer note</strong>${esc(o.note).replace(/\n/g, '<br>')}
               </div>`
            : ''
        }
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:16px 4px;font-size:12px;line-height:1.5;color:${C.muted};">
        Sent automatically from the order form on evergreenremedyghana.com.
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export function orderEmailText(o: OrderEmailData) {
  return [
    `NEW ORDER ${o.orderRef} · PAY ON DELIVERY`,
    `${ghanaTime(o.createdAt)} (Ghana time)`,
    '',
    `COLLECT: ${money(o.pkg.price)}`,
    `Package: ${o.pkg.label} (${o.pkg.quantity} × ${PRODUCT_NAME})`,
    `Delivery: ${o.pkg.freeDelivery ? 'Free' : 'Standard'}, deliver ${o.deliveryDay.toLowerCase()}`,
    '',
    'CUSTOMER',
    `Name: ${o.name}`,
    `Phone: ${prettyPhone(o.phone)}`,
    `Second phone: ${o.altPhone ? prettyPhone(o.altPhone) : 'Not provided'}`,
    '',
    'DELIVERY',
    `Region: ${o.region}`,
    `Exact location: ${o.location}`,
    `Map: ${mapsLink(o.location, o.region)}`,
    '',
    `Note: ${o.note || 'None'}`,
    '',
    'Customer confirmed they are ready to pay on delivery and can afford it.',
    'Sent from the order form on evergreenremedyghana.com.',
  ].join('\n');
}
