'use client';

import { motion } from 'framer-motion';
import { PAY_ON_DELIVERY_LABEL } from '@/lib/catalog';
import { EASE, SectionHeading } from './ui';

const STEPS = [
  {
    title: 'Choose your package',
    text: 'Pick one, two or three bottles and fill in your delivery details. It takes about two minutes.',
  },
  {
    title: 'A rider calls & delivers',
    text: `We call you right away to confirm, then deliver to your door. ${PAY_ON_DELIVERY_LABEL}.`,
  },
  {
    title: 'We guide the dosage',
    text: 'One of our health professionals will contact you to explain how much your child should take each day.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          align="left"
          eyebrow="How to take it"
          title={
            <>
              Simple from order <em>to daily routine</em>
            </>
          }
        />
        <ol className="grid border-t border-line md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.1 }}
              className="border-b border-line py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0"
            >
              <span className="font-serif text-xl italic text-leaf">Step {i + 1}</span>
              <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-ink">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-ink/60">{s.text}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
