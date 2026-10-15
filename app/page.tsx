'use client';

import { AnimatePresence, MotionConfig, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useCallback, useState } from 'react';
import { BASE_PRICE, CONTACT, CURRENCY, getPackage, whatsappLink, type Package } from '@/lib/catalog';
import Benefits from './components/Benefits';
import Checkout from './components/Checkout';
import Gallery from './components/Gallery';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Nav from './components/Nav';
import Pricing, { Contact } from './components/Pricing';
import Story from './components/Story';
import Testimonials from './components/Testimonials';
import { Logo, WhatsAppIcon, track } from './components/ui';

export default function EvergreenRemedyWebsite() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [packageId, setPackageId] = useState<Package['id']>('family');
  const [showDock, setShowDock] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => setShowDock(y > 700));

  const openCheckout = useCallback((pkg?: Package) => {
    const chosen = pkg ?? getPackage('family')!;
    setPackageId(chosen.id);
    setCheckoutOpen(true);
    track('InitiateCheckout', { value: chosen.price, currency: 'GHS', content_name: chosen.label });
  }, []);
  const closeCheckout = useCallback(() => setCheckoutOpen(false), []);

  return (
    <MotionConfig reducedMotion="user">
      <Nav onOrder={() => openCheckout()} />

      <main>
        <Hero onOrder={() => openCheckout()} />
        <Story />
        <Benefits />
        <Gallery />
        <Testimonials />
        <HowItWorks />
        <Pricing onOrder={openCheckout} />
        <Contact />
      </main>

      <footer className="border-t border-line px-5 pb-28 pt-10 md:pb-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-ink/50 md:flex-row">
          <Logo />
          <p>
            © {new Date().getFullYear()} Evergreen Remedy Ghana ·{' '}
            <a href={`tel:${CONTACT.phone}`} className="hover:text-ink">
              {CONTACT.phoneDisplay}
            </a>
          </p>
          <p className="max-w-xs text-center text-xs md:text-right">
            Food supplement. This product is not intended to diagnose, treat, cure or prevent any disease. Results vary.
          </p>
        </div>
      </footer>

      {/* Floating WhatsApp (desktop) */}
      <motion.a
        href={whatsappLink('Hi! I’d like to place an order for Forever Arctic Sea for my child.')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: 'spring' }}
        whileHover={{ scale: 1.08 }}
        className="fixed bottom-6 right-6 z-40 hidden h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,0.6)] md:grid"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </motion.a>

      {/* Mobile glass order dock — mirrors the floating nav */}
      <AnimatePresence>
        {showDock && !checkoutOpen && (
          <motion.div
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            exit={{ y: 120 }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="fixed inset-x-3 bottom-3 z-30 flex items-center gap-2 rounded-full border border-white/60 bg-white/60 p-1.5 pl-5 shadow-[0_12px_40px_-12px_rgba(13,31,26,0.3)] backdrop-blur-2xl backdrop-saturate-150 md:hidden"
          >
            <p className="flex-1 text-sm text-ink/60">
              <span className="block font-display font-semibold leading-tight text-ink">
                from {CURRENCY}
                {BASE_PRICE}
              </span>
              <span className="block text-[11px] leading-tight">pay on delivery</span>
            </p>
            <a
              href={whatsappLink('Hi! I’d like to place an order for Forever Arctic Sea for my child.')}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp"
              className="grid h-11 w-11 place-items-center rounded-full bg-[#25D366] text-white"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
            <button onClick={() => openCheckout()} className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper">
              Order now
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Checkout open={checkoutOpen} packageId={packageId} onClose={closeCheckout} onPackageChange={setPackageId} />
    </MotionConfig>
  );
}
