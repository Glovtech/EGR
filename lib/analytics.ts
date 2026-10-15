import { PRODUCT_NAME, type Package } from './catalog';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

// Both helpers no-op when a tag hasn't loaded (ad blockers, GA ID not set)
const fb = (event: string, params?: Record<string, unknown>) => {
  try {
    window.fbq?.('track', event, params);
  } catch {
    /* ignore */
  }
};
const ga = (event: string, params?: Record<string, unknown>) => {
  try {
    window.gtag?.('event', event, params);
  } catch {
    /* ignore */
  }
};

const item = (pkg: Package) => ({
  item_id: pkg.id,
  item_name: PRODUCT_NAME,
  item_variant: pkg.label,
  price: pkg.price,
  quantity: 1,
});

// One call per business event, mapped to Meta's and GA4's recommended names
export const analytics = {
  beginCheckout(pkg: Package) {
    fb('InitiateCheckout', { value: pkg.price, currency: 'GHS', content_name: pkg.label });
    ga('begin_checkout', { value: pkg.price, currency: 'GHS', items: [item(pkg)] });
  },
  checkoutStep(step: 'details_complete', pkg: Package) {
    ga('add_shipping_info', { value: pkg.price, currency: 'GHS', items: [item(pkg)], step });
  },
  lead(pkg: Package, orderRef: string) {
    fb('Lead', { value: pkg.price, currency: 'GHS', content_name: pkg.label, num_items: pkg.quantity });
    // Pay-on-delivery order request — recorded as a lead, not a purchase
    ga('generate_lead', { value: pkg.price, currency: 'GHS', order_ref: orderRef, package: pkg.label });
  },
  whatsappClick(placement: string) {
    fb('Contact', { content_name: placement });
    ga('whatsapp_click', { placement });
  },
  callClick(placement: string) {
    fb('Contact', { content_name: placement });
    ga('phone_click', { placement });
  },
  videoSoundOn() {
    ga('video_sound_on', { video: 'hero_ad' });
  },
};
