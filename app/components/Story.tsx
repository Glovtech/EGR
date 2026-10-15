'use client';

import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';
import { Eyebrow, Reveal } from './ui';

const STORY = [
  'DHA and EPA are omega-3s found mainly in oily fish. DHA is a key building block of the brain.',
  'Forever Arctic Sea brings them together in one small softgel — a simple daily habit alongside healthy meals and good sleep.',
];

// Each word darkens as the paragraph scrolls through the viewport
function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.26em] inline-block">
      {children}
    </motion.span>
  );
}

function ScrollText() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] });
  const words = STORY.join(' ¶ ').split(' ');
  return (
    <div ref={ref} className="font-display text-[1.9rem] font-medium leading-[1.2] tracking-[-0.025em] text-ink md:text-[2.75rem]">
      {words.map((w, i) =>
        w === '¶' ? (
          <span key={i} className="block h-6" />
        ) : (
          <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
            {w}
          </Word>
        )
      )}
    </div>
  );
}

export default function Story() {
  const bannerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: bannerRef, offset: ['start end', 'end start'] });
  const bannerScale = useTransform(scrollYProgress, [0, 0.5], [1.15, 1]);

  return (
    <section id="product" className="relative py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <Eyebrow>What’s inside</Eyebrow>
        </Reveal>
        <div className="mt-8 grid items-center gap-14 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16">
          <div>
            <ScrollText />
          </div>
          <Reveal y={50} className="mx-auto w-full max-w-xs sm:max-w-sm lg:max-w-none">
            <video
              className="aspect-square w-full rounded-[2rem] object-cover"
              autoPlay
              loop
              muted
              playsInline
              aria-label="Forever Arctic Sea product loop"
            >
              <source src="/product.mp4" type="video/mp4" />
            </video>
          </Reveal>
        </div>
      </div>

      <div ref={bannerRef} className="mx-auto mt-20 max-w-6xl px-5 md:mt-28">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] md:aspect-[21/9]">
          <motion.div style={{ scale: bannerScale }} className="absolute inset-0">
            <Image
              src="/fp1.png"
              alt="Forever Arctic Sea with fish, squid and olive oil — its natural sources"
              fill
              sizes="(min-width: 1152px) 1152px, 100vw"
              className="object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0 to-transparent" />
          <p className="absolute bottom-6 left-6 right-6 max-w-md font-display text-2xl font-medium leading-tight tracking-tight text-white md:bottom-10 md:left-10 md:text-4xl">
            Omega-3 from fish & squid oils, <span className="font-serif italic">blended with olive oil.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
