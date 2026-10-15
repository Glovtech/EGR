'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { BASE_PRICE, CURRENCY, PAY_ON_DELIVERY_LABEL } from '@/lib/catalog';
import StoryVideo from './StoryVideo';
import { AVERAGE_RATING } from './Testimonials';
import { EASE } from './ui';

// Words wrapped in *asterisks* get the italic serif accent
const LINES = [
  ['Everyday', 'Omega-3'],
  ['support', 'for', 'your'],
  ['child’s', '*growing*', '*brain.*'],
];

// Video-first hero: the vertical ad sits on a dark "stage" whose backdrop is a
// blurred blow-up of its own cover frame, so the 9:16 clip fills a wide layout.
export default function Hero({ onOrder }: { onOrder: () => void }) {
  let n = 0;
  return (
    <section id="top" className="px-3 pt-[76px] md:pt-[92px]">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-ink">
        {/* Backdrop */}
        <div aria-hidden className="absolute inset-0 -z-10">
          <Image src="/thumbnail.png" alt="" fill priority sizes="100vw" className="scale-125 object-cover opacity-50 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/70 to-ink lg:bg-gradient-to-r lg:from-ink/30 lg:via-ink/75 lg:to-ink" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-12 pt-4 sm:px-8 sm:pt-8 lg:grid-cols-[auto_1fr] lg:gap-16 lg:px-12 lg:py-14">
          {/* Video — first in the DOM so it leads on phones */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE }}
            className="relative mx-auto w-full max-w-[340px] lg:w-[340px]"
          >
            <StoryVideo className="ring-1 ring-white/10" label="Watch this before you order" />
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.8, ease: EASE }}
              className="absolute -right-12 top-16 hidden rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-xl xl:block"
            >
              <p className="font-serif text-2xl italic leading-none text-leaf-soft">{AVERAGE_RATING} / 5</p>
              <p className="mt-1 text-xs text-white/60">from parents across Ghana</p>
            </motion.div>
          </motion.div>

          {/* Copy */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 lg:justify-start"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300 ring-1 ring-amber-300/30">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-amber-300" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-amber-300" />
                </span>
                Limited stock
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-leaf-soft">
                Forever Arctic Sea · Omega-3 for kids
              </span>
            </motion.div>

            <h1 className="mt-5 font-display text-[2.5rem] font-semibold leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:text-[4.1rem]">
              {LINES.map((line, li) => (
                <span key={li} className="block overflow-hidden pb-[0.08em]">
                  {line.map((raw) => {
                    const i = n++;
                    const accent = raw.startsWith('*');
                    const w = raw.replaceAll('*', '');
                    return (
                      <motion.span
                        key={w}
                        className={`mr-[0.22em] inline-block last:mr-0 ${
                          accent ? 'font-serif font-normal italic tracking-normal text-leaf-soft' : ''
                        }`}
                        initial={{ y: '105%' }}
                        animate={{ y: 0 }}
                        transition={{ duration: 1, ease: EASE, delay: 0.25 + i * 0.05 }}
                      >
                        {w}
                      </motion.span>
                    );
                  })}
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.8, ease: EASE }}
              className="mx-auto mt-6 max-w-md text-base leading-relaxed text-white/65 sm:text-lg lg:mx-0"
            >
              Forever Arctic Sea gives children DHA and EPA, nutrients that support normal brain function as part of a
              balanced diet.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.95, ease: EASE }}
              className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onOrder}
                className="w-full rounded-full bg-paper px-8 py-4 font-semibold text-ink transition-colors hover:bg-leaf hover:text-white sm:w-auto"
              >
                Order now — from {CURRENCY}
                {BASE_PRICE}
              </motion.button>
              <a
                href="#pricing"
                className="px-2 py-2 font-semibold text-white/85 underline decoration-white/30 underline-offset-[6px] transition hover:text-white hover:decoration-white"
              >
                See packages
              </a>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.1 }}
              className="mx-auto mt-6 max-w-md space-y-1.5 text-sm text-white/70 lg:mx-0"
            >
              <li>{PAY_ON_DELIVERY_LABEL}</li>
              <li>Genuine Forever Living product, loved by parents across Ghana</li>
            </motion.ul>

            <motion.dl
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="mx-auto mt-10 grid max-w-md grid-cols-3 divide-x divide-white/10 border-y border-white/10 lg:mx-0"
            >
              {[
                ['120', 'softgels a bottle'],
                ['Ω-3', 'DHA + EPA'],
                ['Free', 'delivery on 2+'],
              ].map(([v, l]) => (
                <div key={l} className="px-3 py-4 lg:first:pl-0">
                  <dt className="font-display text-lg font-semibold tracking-tight text-white">{v}</dt>
                  <dd className="mt-0.5 text-xs text-white/50">{l}</dd>
                </div>
              ))}
            </motion.dl>
          </div>
        </div>
      </div>
    </section>
  );
}
