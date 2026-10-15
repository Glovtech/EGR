// Single source of truth for packages — used by the page and by the order API,
// so the server never trusts a price sent from the browser.

export type Package = {
  id: 'starter' | 'family' | 'value';
  label: string;
  quantity: number;
  price: number;
  popular?: boolean;
  freeDelivery?: boolean;
};

export const PRODUCT_NAME = 'Forever Arctic Sea';
export const CURRENCY = 'GH₵';
export const BASE_PRICE = 599;

export const PACKAGES: Package[] = [
  { id: 'starter', label: 'Starter Pack', quantity: 1, price: 599 },
  { id: 'family', label: 'Family Pack', quantity: 2, price: 1099, popular: true, freeDelivery: true },
  { id: 'value', label: 'Value Pack', quantity: 3, price: 1599, freeDelivery: true },
];

export const getPackage = (id: string | undefined | null) =>
  PACKAGES.find((p) => p.id === id);

export const savingsFor = (pkg: Package) => BASE_PRICE * pkg.quantity - pkg.price;

export const perBottle = (pkg: Package) => Math.round(pkg.price / pkg.quantity);

export const CONTACT = {
  phone: '+233597308155',
  phoneDisplay: '+233 597 308 155',
  whatsapp: '233597308155',
};

export const whatsappLink = (text: string) =>
  `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;

// Ghana mobile numbers: 0XXXXXXXXX or +233XXXXXXXXX / 233XXXXXXXXX (spaces/dashes allowed)
export const normalizeGhanaPhone = (raw: string): string | null => {
  const digits = raw.replace(/[\s\-()]/g, '');
  const m = digits.match(/^(?:\+?233|0)([235]\d{8})$/);
  return m ? `+233${m[1]}` : null;
};

// Payment is collected by the rider on delivery in these cities
export const PAY_ON_DELIVERY_CITIES = ['Accra', 'Kumasi', 'Takoradi', 'Tamale'];
export const PAY_ON_DELIVERY_LABEL = `Pay on delivery in ${PAY_ON_DELIVERY_CITIES.slice(0, -1).join(', ')} & ${
  PAY_ON_DELIVERY_CITIES[PAY_ON_DELIVERY_CITIES.length - 1]
}`;

export const REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Western North',
  'Central',
  'Eastern',
  'Volta',
  'Oti',
  'Northern',
  'Savannah',
  'North East',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
];

export const DELIVERY_DAYS = ['Today', 'Tomorrow'] as const;
