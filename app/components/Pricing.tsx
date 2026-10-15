'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  CONTACT,
  CURRENCY,
  PACKAGES,
  PAY_ON_DELIVERY_LABEL,
  PRODUCT_NAME,
  perBottle,
  savingsFor,
  whatsappLink,
  type Package,
} from '@/lib/catalog';
import { EASE, Reveal, SectionHeading } from './ui';

// Offer resets daily at midnight Ghana time (GMT, no DST) — a real deadline
// that's the same for every visitor, rather than a timer that restarts on reload.
const msUntilGhanaMidnight = () => {
  const now = new Date();
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return next - now.getTime();
};

const pad = (n: number) => String(n).padStart(2, '0');

function Countdown() {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setMs(msUntilGhanaMidnight());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  const s = Math.floor((ms ?? 0) / 1000);
  return (
    <Reveal className="mx-auto mb-14 flex w-fit flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-full border border-line bg-white/70 px-6 py-3 text-sm text-ink/60 backdrop-blur">
      <span className="font-semibold text-amber-600">Limited stock</span>
      <span>· Today’s offer ends in</span>
      <span className="font-display text-base font-semibold tabular-nums tracking-tight text-ink" suppressHydrationWarning>
        {ms === null ? '--:--:--' : `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`}
      </span>
    </Reveal>
  );
}

function PriceCard({ pkg, i, onOrder }: { pkg: Package; i: number; onOrder: (p: Package) => void }) {
  const save = savingsFor(pkg);
  const dark = pkg.popular;
  const features = [
    `${pkg.quantity} bottle${pkg.quantity > 1 ? 's' : ''} of ${PRODUCT_NAME}`,
    '120 softgels per bottle',
    '30–60 day supply per bottle',
    pkg.freeDelivery ? 'Free nationwide delivery' : 'Standard delivery',
    'Pay on delivery in major cities',
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, ease: EASE, delay: i * 0.1 }}
      whileHover={{ y: -6 }}
      className={`relative flex flex-col rounded-[2rem] p-7 xl:p-9 ${
        dark ? 'bg-ink text-paper shadow-[0_40px_80px_-30px_rgba(13,31,26,0.6)]' : 'bg-white text-ink'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-xl font-semibold tracking-tight">{pkg.label}</h3>
        {dark && (
          <span className="rounded-full bg-leaf px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
            Most popular
          </span>
        )}
      </div>

      <div className="mt-6 font-display text-[2.75rem] font-semibold leading-none tracking-[-0.04em] xl:text-5xl">
        {CURRENCY}
        {pkg.price.toLocaleString()}
      </div>
      <p className={`mt-2 text-sm ${dark ? 'text-paper/55' : 'text-ink/50'}`}>
        {pkg.quantity > 1 ? `${CURRENCY}${perBottle(pkg)} per bottle` : 'One bottle'}
        {save > 0 && (
          <span className={`font-serif text-base italic ${dark ? 'text-leaf-soft' : 'text-leaf'}`}>
            {' '}
            — save {CURRENCY}
            {save}
          </span>
        )}
      </p>

      <ul className={`mt-8 flex-1 divide-y border-t ${dark ? 'divide-paper/10 border-paper/10' : 'divide-line border-line'}`}>
        {features.map((f) => (
          <li key={f} className={`py-3 text-[15px] ${dark ? 'text-paper/80' : 'text-ink/70'}`}>
            {f}
          </li>
        ))}
      </ul>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onOrder(pkg)}
        className={`mt-8 w-full rounded-full py-4 font-semibold transition-colors ${
          dark ? 'bg-paper text-ink hover:bg-leaf hover:text-white' : 'bg-ink text-paper hover:bg-leaf'
        }`}
      >
        Choose {pkg.label}
      </motion.button>
    </motion.div>
  );
}

export default function Pricing({ onOrder }: { onOrder: (p: Package) => void }) {
  return (
    <section id="pricing" className="bg-mint py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Choose your package"
          title={
            <>
              Invest in your child’s <em>future</em>
            </>
          }
          sub={`Buy more, save more. Free delivery on 2+ bottles. ${PAY_ON_DELIVERY_LABEL}.`}
        />
        <Countdown />
        <div className="mx-auto grid max-w-md items-stretch gap-5 lg:max-w-none lg:grid-cols-3">
          {PACKAGES.map((p, i) => (
            <PriceCard key={p.id} pkg={p} i={i} onOrder={onOrder} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section className="px-5 py-24 md:py-36">
      <Reveal className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-ink text-balance md:text-6xl">
          Questions? <span className="font-serif font-normal italic tracking-normal text-leaf">We’re one call away.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-lg text-ink/60">
          Our team can help with orders, product questions or delivery information.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={`tel:${CONTACT.phone}`}
            className="rounded-full bg-ink px-8 py-4 font-semibold text-paper transition-colors hover:bg-leaf"
          >
            Call {CONTACT.phoneDisplay}
          </a>
          <a
            href={whatsappLink('Hi! I’d like to make an inquiry about Evergreen Remedy.')}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-ink/15 px-8 py-4 font-semibold text-ink transition-colors hover:border-ink"
          >
            Chat on WhatsApp
          </a>
        </div>
      </Reveal>
    </section>
  );
}
