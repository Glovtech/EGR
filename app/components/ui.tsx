'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

export const EASE = [0.22, 1, 0.36, 1] as const;

export const Logo = () => (
  <span className="flex items-center gap-2">
    <svg viewBox="0 0 40 40" className="h-7 w-7 shrink-0" aria-hidden>
      <path d="M8 34 C8 18 18 6 34 5 C34 22 24 32 8 34Z" fill="var(--leaf)" />
      <path d="M8 34 C15 25 22 17 30 10" stroke="var(--paper)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
    <span className="font-display text-[17px] font-semibold tracking-tight text-ink">
      Evergreen <span className="font-serif text-lg font-normal italic text-leaf">Remedy</span>
    </span>
  </span>
);

export const WhatsAppIcon = ({ className = 'h-6 w-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.01c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.45 9.43M20.08 3.92A11.3 11.3 0 0 0 12.05.6C5.8.6.7 5.69.7 11.95c0 2 .52 3.95 1.52 5.67L.6 23.4l5.92-1.55a11.3 11.3 0 0 0 5.42 1.38h.01c6.25 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.32-8.02" />
  </svg>
);

export const Reveal = ({
  children,
  delay = 0,
  y = 24,
  ...rest
}: { children: ReactNode; delay?: number; y?: number } & HTMLMotionProps<'div'>) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.9, ease: EASE, delay }}
    {...rest}
  >
    {children}
  </motion.div>
);

export const Eyebrow = ({ children }: { children: ReactNode }) => (
  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-leaf">{children}</span>
);

// Large display heading; wrap accent words in <em> to get the italic serif treatment
export const Display = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <h2
    className={`font-display text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-ink text-balance md:text-6xl [&_em]:font-serif [&_em]:font-normal [&_em]:tracking-normal [&_em]:text-leaf ${className}`}
  >
    {children}
  </h2>
);

export const SectionHeading = ({
  eyebrow,
  title,
  sub,
  align = 'center',
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: ReactNode;
  align?: 'center' | 'left';
}) => (
  <Reveal className={`mb-14 max-w-3xl md:mb-20 ${align === 'center' ? 'mx-auto text-center' : ''}`}>
    <Eyebrow>{eyebrow}</Eyebrow>
    <Display className="mt-5">{title}</Display>
    {sub && <p className="mt-5 text-lg text-ink/60 md:text-xl">{sub}</p>}
  </Reveal>
);
