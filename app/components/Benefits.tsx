'use client';

import { motion } from 'framer-motion';
import { EASE, SectionHeading } from './ui';

const BENEFITS = [
  {
    title: 'DHA',
    desc: 'A key building block of the brain. Supports normal brain function.',
  },
  {
    title: 'EPA',
    desc: 'An omega-3 that supports overall wellbeing.',
  },
  {
    title: 'Easy daily routine',
    desc: 'One simple habit alongside healthy meals and good sleep.',
  },
  {
    title: 'Trusted by parents',
    desc: 'Real feedback from real families — read what they say below.',
  },
];

export default function Benefits() {
  return (
    <section id="benefits" className="bg-mint py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          align="left"
          eyebrow="Why parents choose it"
          title={
            <>
              Small softgel. <em>Simple habit.</em>
            </>
          }
        />
        <div className="grid gap-px overflow-hidden rounded-[2rem] bg-ink/10 md:grid-cols-2">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }}
              className="group relative bg-mint p-8 transition-colors duration-500 hover:bg-white md:p-12"
            >
              <span className="font-serif text-xl italic text-leaf">0{i + 1}</span>
              <h3 className="mt-10 font-display text-3xl font-semibold tracking-[-0.03em] text-ink md:text-4xl">
                {b.title}
              </h3>
              <p className="mt-3 max-w-sm leading-relaxed text-ink/60">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
