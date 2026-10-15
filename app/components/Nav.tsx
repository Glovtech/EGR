'use client';

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useEffect, useState } from 'react';
import { EASE, Logo } from './ui';

const LINKS = [
  { href: '#product', label: 'Product' },
  { href: '#benefits', label: 'Benefits' },
  { href: '#testimonials', label: 'Reviews' },
  { href: '#pricing', label: 'Pricing' },
];

export default function Nav({ onOrder }: { onOrder: () => void }) {
  const { scrollY } = useScroll();
  const [raised, setRaised] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  useMotionValueEvent(scrollY, 'change', (y) => setRaised(y > 24));

  useEffect(() => {
    const els = LINKS.map((l) => document.querySelector(l.href)).filter(Boolean) as Element[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Close on Esc; lock page scroll while the mobile menu is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 md:pt-5">
      {/* Dim + blur the page behind the mobile menu; tap to close */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="scrim"
            className="fixed inset-0 bg-ink/25 backdrop-blur-[2px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="relative mx-auto max-w-5xl">
        <div
          className={`rounded-full border border-white/60 bg-white/55 backdrop-blur-2xl backdrop-saturate-150 transition-shadow duration-500 ${
            raised || open
              ? 'shadow-[0_12px_40px_-12px_rgba(13,31,26,0.22)]'
              : 'shadow-[0_4px_20px_-12px_rgba(13,31,26,0.15)]'
          }`}
        >
          <div className="flex items-center justify-between py-2 pl-5 pr-2">
            <a href="#top" aria-label="Evergreen Remedy Ghana home" onClick={() => setOpen(false)}>
              <Logo />
            </a>

            <nav className="hidden items-center md:flex">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="relative rounded-full px-4 py-2 text-sm font-medium text-ink/65 transition-colors hover:text-ink"
                >
                  {active === l.href && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-ink/[0.06]"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 34,
                      }}
                    />
                  )}
                  <span className="relative">{l.label}</span>
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onOrder}
                className="hidden rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-leaf sm:block"
              >
                Order now
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpen((o) => !o)}
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                aria-controls="mobile-menu"
                className={`relative grid h-11 w-11 place-items-center rounded-full transition-colors duration-300 md:hidden ${
                  open ? 'bg-ink' : 'bg-transparent'
                }`}
              >
                {/* Burger morphs into an X */}
                <motion.span
                  className={`absolute h-[1.5px] w-5 rounded ${open ? 'bg-paper' : 'bg-ink'}`}
                  animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
                <motion.span
                  className={`absolute h-[1.5px] w-5 rounded ${open ? 'bg-paper' : 'bg-ink'}`}
                  animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile menu: a separate glass card that springs out of the burger */}
        <AnimatePresence>
          {open && (
            <motion.nav
              id="mobile-menu"
              key="menu"
              initial={{ opacity: 0, scale: 0.85, y: -12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{
                opacity: 0,
                scale: 0.92,
                y: -8,
                filter: 'blur(4px)',
                transition: { duration: 0.2, ease: EASE },
              }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              style={{ transformOrigin: 'top right' }}
              className="absolute inset-x-0 top-[calc(100%+0.5rem)] overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/75 p-2 shadow-[0_24px_60px_-20px_rgba(13,31,26,0.35)] backdrop-blur-2xl backdrop-saturate-150 md:hidden"
            >
              <motion.ul
                initial="hidden"
                animate="show"
                variants={{
                  show: {
                    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
                  },
                }}
              >
                {LINKS.map((l) => (
                  <motion.li
                    key={l.href}
                    variants={{
                      hidden: { opacity: 0, x: 24 },
                      show: {
                        opacity: 1,
                        x: 0,
                        transition: {
                          type: 'spring',
                          stiffness: 420,
                          damping: 32,
                        },
                      },
                    }}
                  >
                    <a
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-2xl font-medium tracking-tight transition-colors ${
                        active === l.href ? 'bg-ink/[0.06] text-ink' : 'text-ink/80 active:bg-ink/5'
                      }`}
                    >
                      {l.label}
                      {active === l.href && <span className="h-1.5 w-1.5 rounded-full bg-leaf" />}
                    </a>
                  </motion.li>
                ))}
                <motion.li
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        type: 'spring',
                        stiffness: 420,
                        damping: 32,
                      },
                    },
                  }}
                  className="p-1 pt-2"
                >
                  <button
                    onClick={() => {
                      setOpen(false);
                      onOrder();
                    }}
                    className="w-full rounded-full bg-ink py-3.5 font-semibold text-paper transition-colors active:bg-leaf"
                  >
                    Order now
                  </button>
                </motion.li>
              </motion.ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
