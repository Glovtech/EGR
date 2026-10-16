// Order validation shared by the checkout form and the order API, so both
// enforce the same rules and show customers the same messages.
import { DELIVERY_DAYS, REGIONS, normalizeGhanaPhone } from './catalog';

export type OrderDetails = {
  name: string;
  phone: string;
  altPhone: string;
  region: string;
  location: string;
  note: string;
};

export type OrderConfirm = {
  ready: '' | 'yes' | 'no';
  deliveryDay: string;
  canAfford: boolean;
};

export type DetailField = keyof OrderDetails;
export type ConfirmField = keyof OrderConfirm;
export type OrderErrors = Partial<Record<DetailField | ConfirmField, string>>;

export const LIMITS = { name: 100, phone: 20, region: 40, location: 200, note: 1000 } as const;

export const MESSAGES = {
  nameMissing: 'Please enter your full name.',
  nameShort: 'Please enter your full name (first and last name).',
  phoneMissing: 'Please enter a phone number we can call.',
  phoneInvalid: 'That doesn’t look like a Ghana number. Try e.g. 024 412 3456.',
  altPhoneInvalid: 'That doesn’t look like a Ghana number. Fix it or leave this blank.',
  altPhoneSame: 'This is the same as your first number. Add a different one, or leave it blank.',
  regionMissing: 'Please select your region.',
  locationMissing: 'Please enter where the rider should deliver.',
  locationVague: 'Please be more specific. Add an area and a landmark near you.',
  readyMissing: 'Please tell us if you’re ready to pay on delivery.',
  readyNo: 'Please only order when you’re ready to receive and pay on delivery.',
  dayMissing: 'Please choose when the rider should deliver.',
  affordMissing: 'Please tick this box to confirm your order.',
  packageInvalid: 'Please choose a package and try again.',
  badRequest: 'Something went wrong with your order details. Please refresh the page and try again.',
  sendFailed: 'We couldn’t send your order just now. Please try again in a minute, or send it to us on WhatsApp.',
  offline: 'You seem to be offline. Check your internet connection and try again.',
} as const;

export function validateDetails(d: OrderDetails): OrderErrors {
  const e: OrderErrors = {};
  const name = d.name.trim();
  if (!name) e.name = MESSAGES.nameMissing;
  else if (name.length < 2) e.name = MESSAGES.nameShort;

  const phone = normalizeGhanaPhone(d.phone);
  if (!d.phone.trim()) e.phone = MESSAGES.phoneMissing;
  else if (!phone) e.phone = MESSAGES.phoneInvalid;

  if (d.altPhone.trim()) {
    const alt = normalizeGhanaPhone(d.altPhone);
    if (!alt) e.altPhone = MESSAGES.altPhoneInvalid;
    else if (phone && alt === phone) e.altPhone = MESSAGES.altPhoneSame;
  }

  if (!REGIONS.includes(d.region)) e.region = MESSAGES.regionMissing;

  const location = d.location.trim();
  if (!location) e.location = MESSAGES.locationMissing;
  else if (location.length < 6) e.location = MESSAGES.locationVague;

  return e;
}

export function validateConfirm(c: OrderConfirm): OrderErrors {
  const e: OrderErrors = {};
  if (c.ready === '') e.ready = MESSAGES.readyMissing;
  else if (c.ready === 'no') e.ready = MESSAGES.readyNo;
  if (!(DELIVERY_DAYS as readonly string[]).includes(c.deliveryDay)) e.deliveryDay = MESSAGES.dayMissing;
  if (!c.canAfford) e.canAfford = MESSAGES.affordMissing;
  return e;
}

export const DETAIL_FIELDS: DetailField[] = ['name', 'phone', 'altPhone', 'region', 'location', 'note'];
