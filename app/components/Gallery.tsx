'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { EASE, Eyebrow } from './ui';

const SLIDES = ['/fp2.png', '/fp3.png', '/fp4.png', '/fp5.png', '/fp1.png'];

// Native scroll-snap row: swipeable on phones, trackpad-friendly on desktop
export default function Gallery() {
  const track = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = () => {
    const el = track.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth > el.scrollWidth - 8);
  };

  useEffect(update, []);

  const page = (dir: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto flex max-w-6xl items-end justify-between px-5">
        <div>
          <Eyebrow>Gallery</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.03em] text-ink md:text-4xl">
            A closer look
          </h2>
        </div>
        <div className="hidden gap-2 md:flex">
          {[
            { d: -1, label: 'Previous', glyph: '←', disabled: atStart },
            { d: 1, label: 'Next', glyph: '→', disabled: atEnd },
          ].map((b) => (
            <button
              key={b.d}
              onClick={() => page(b.d)}
              disabled={b.disabled}
              aria-label={b.label}
              className="grid h-12 w-12 place-items-center rounded-full border border-line text-lg text-ink transition hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-30"
            >
              {b.glyph}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={track}
        onScroll={update}
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 md:gap-6 scroll-px-5 md:px-[max(1.25rem,calc((100vw_-_72rem)/2_+_1.25rem))] md:scroll-px-[max(1.25rem,calc((100vw_-_72rem)/2_+_1.25rem))]"
      >
        {SLIDES.map((src, i) => (
          <motion.div
            key={src}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }}
            className="relative aspect-square w-[82vw] shrink-0 snap-start overflow-hidden rounded-[1.75rem] bg-white sm:w-[420px]"
          >
            <Image
              src={src}
              alt={`Forever Arctic Sea — image ${i + 1}`}
              fill
              sizes="(min-width: 640px) 420px, 82vw"
              className="object-cover transition-transform duration-700 hover:scale-[1.04]"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
