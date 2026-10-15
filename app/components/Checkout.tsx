'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  CURRENCY,
  DELIVERY_DAYS,
  PACKAGES,
  PAY_ON_DELIVERY_LABEL,
  PRODUCT_NAME,
  REGIONS,
  getPackage,
  normalizeGhanaPhone,
  savingsFor,
  whatsappLink,
  type Package,
} from '@/lib/catalog';
import { EASE, track } from './ui';

type Fields = { name: string; phone: string; altPhone: string; region: string; location: string; note: string };
type Confirm = { ready: '' | 'yes' | 'no'; deliveryDay: '' | (typeof DELIVERY_DAYS)[number]; canAfford: boolean };
type Errors = Partial<Record<keyof Fields | keyof Confirm, string>>;

const EMPTY: Fields = { name: '', phone: '', altPhone: '', region: '', location: '', note: '' };
const EMPTY_CONFIRM: Confirm = { ready: '', deliveryDay: '', canAfford: false };
const DRAFT_KEY = 'egr-checkout-draft';

const validateDetails = (f: Fields): Errors => {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = 'Please enter your full name.';
  if (!normalizeGhanaPhone(f.phone)) e.phone = 'Enter a valid Ghana number, e.g. 024 412 3456.';
  if (f.altPhone.trim() && !normalizeGhanaPhone(f.altPhone)) e.altPhone = 'Enter a valid number, or leave it blank.';
  if (!REGIONS.includes(f.region)) e.region = 'Please select your region.';
  if (f.location.trim().length < 6) e.location = 'Please be specific — add an area and a landmark near you.';
  return e;
};

const validateConfirm = (c: Confirm): Errors => {
  const e: Errors = {};
  if (c.ready !== 'yes') e.ready = 'Please only order when you’re ready to receive and pay.';
  if (!c.deliveryDay) e.deliveryDay = 'Choose when the rider should deliver.';
  if (!c.canAfford) e.canAfford = 'Please confirm before placing your order.';
  return e;
};

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink/65">{label}</span>
      {children}
      <ErrorText error={error} hint={hint} />
    </label>
  );
}

function ErrorText({ error, hint }: { error?: string; hint?: string }) {
  return (
    <AnimatePresence initial={false}>
      {error ? (
        <motion.span
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-1 block text-[13px] text-red-600"
        >
          {error}
        </motion.span>
      ) : (
        hint && <span className="mt-1 block text-[13px] leading-snug text-ink/45">{hint}</span>
      )}
    </AnimatePresence>
  );
}

// Pill-style single choice (Yes/No, Today/Tomorrow)
function Choice<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { value: T; label: string }[];
  value: string;
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" className="grid grid-cols-2 gap-1 rounded-full bg-ink/5 p-1">
      {options.map((o) => (
        <button
          type="button"
          role="radio"
          aria-checked={value === o.value}
          key={o.value}
          name={name}
          onClick={() => onChange(o.value)}
          className="relative rounded-full py-2.5 text-sm font-semibold"
        >
          {value === o.value && (
            <motion.span
              layoutId={`choice-${name}`}
              className="absolute inset-0 rounded-full bg-white shadow-sm"
              transition={{ type: 'spring', stiffness: 400, damping: 34 }}
            />
          )}
          <span className={`relative ${value === o.value ? 'text-ink' : 'text-ink/50'}`}>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

const inputCls = (err?: string) =>
  `w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-ink sm:text-[15px] outline-none transition placeholder:text-ink/30 focus:ring-4 ${
    err ? 'border-red-400 focus:ring-red-100' : 'border-line focus:border-leaf focus:ring-leaf/10'
  }`;

export default function Checkout({
  open,
  packageId,
  onClose,
  onPackageChange,
}: {
  open: boolean;
  packageId: Package['id'];
  onClose: () => void;
  onPackageChange: (id: Package['id']) => void;
}) {
  const pkg = getPackage(packageId) ?? PACKAGES[1];
  const [step, setStep] = useState<1 | 2>(1);
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [confirm, setConfirm] = useState<Confirm>(EMPTY_CONFIRM);
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [triedStep, setTriedStep] = useState<{ 1: boolean; 2: boolean }>({ 1: false, 2: false });
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState<{ ref: string; pkg: Package } | null>(null);
  const [showNote, setShowNote] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const honeypot = useRef<HTMLInputElement>(null);
  const firstInput = useRef<HTMLInputElement>(null);
  const errorBox = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  // Bottom sheet on phones, centred modal from the sm breakpoint up
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Restore draft so a failed/abandoned attempt doesn't lose the customer's details
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
      if (d) setFields({ ...EMPTY, ...d, note: '' });
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      const { name, phone, altPhone, region, location } = fields;
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ name, phone, altPhone, region, location }));
    } catch {
      /* ignore */
    }
  }, [fields]);

  // Scroll lock + Esc + focus
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const t = setTimeout(() => firstInput.current?.focus({ preventScroll: true }), 450);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  // Reset to step 1 / clear the success view once the sheet has closed
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      setSuccess(null);
      setStep(1);
      setConfirm(EMPTY_CONFIRM);
      setTriedStep({ 1: false, 2: false });
      setStatus('idle');
    }, 400);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [step]);

  const detailErrors = validateDetails(fields);
  const confirmErrors = validateConfirm(confirm);
  const show = (k: keyof Fields) => (triedStep[1] || touched[k] ? detailErrors[k] : undefined);
  const showConfirm = (k: keyof Confirm) => (triedStep[2] ? confirmErrors[k] : undefined);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));
  const blur = (k: keyof Fields) => () => setTouched((t) => ({ ...t, [k]: true }));

  const goToConfirm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTriedStep((t) => ({ ...t, 1: true }));
    const firstError = Object.keys(detailErrors)[0];
    if (firstError) {
      const el = e.currentTarget.elements.namedItem(firstError) as HTMLElement | null;
      el?.focus();
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    setStep(2);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriedStep((t) => ({ ...t, 2: true }));
    if (Object.keys(confirmErrors).length || status === 'sending') return;

    setStatus('sending');
    setServerError('');
    try {
      const res = await fetch('/api/send-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fields,
          readyToPay: confirm.ready === 'yes',
          deliveryDay: confirm.deliveryDay,
          canAfford: confirm.canAfford,
          packageId: pkg.id,
          company: honeypot.current?.value ?? '',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'We couldn’t send your order. Please try again.');

      track('Lead', { value: pkg.price, currency: 'GHS', content_name: pkg.label, num_items: pkg.quantity });
      setSuccess({ ref: data.orderRef, pkg });
      setFields((f) => ({ ...f, note: '' }));
      setStatus('idle');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('error');
      setTimeout(() => errorBox.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 50);
    }
  };

  const summary = (
    <div className="rounded-2xl bg-white p-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-base font-semibold tracking-tight text-ink">{pkg.label}</p>
          <p className="mt-0.5 text-sm text-ink/50">
            {pkg.quantity} × {PRODUCT_NAME}
          </p>
        </div>
        <div className="text-right">
          {step === 2 && <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">To pay on delivery</p>}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={pkg.price}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              className="font-display text-2xl font-semibold tracking-[-0.03em] text-ink"
            >
              {CURRENCY}
              {pkg.price.toLocaleString()}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <p className="mt-3 border-t border-line pt-3 text-[13px] text-ink/55">
        {pkg.freeDelivery ? 'Free nationwide delivery' : 'Standard delivery'}
        {savingsFor(pkg) > 0 && (
          <span className="font-serif text-[15px] italic text-leaf">
            {' '}
            · you save {CURRENCY}
            {savingsFor(pkg)}
          </span>
        )}
      </p>
    </div>
  );

  const footer = (label: ReactNode, note?: ReactNode) => (
    <div className="sticky bottom-0 -mx-5 -mb-5 bg-paper/90 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
      <motion.button
        type="submit"
        whileTap={{ scale: 0.98 }}
        disabled={status === 'sending'}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-[15px] font-semibold text-paper transition-colors hover:bg-leaf disabled:cursor-wait disabled:opacity-70"
      >
        {label}
      </motion.button>
      {note && <p className="mt-2 text-center text-[11px] text-ink/45">{note}</p>}
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Checkout"
        >
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-[1.75rem] bg-paper shadow-2xl sm:max-h-[min(720px,90dvh)] sm:max-w-[440px] sm:rounded-[1.75rem]"
            initial={isDesktop ? { opacity: 0, scale: 0.96, y: 12 } : { y: '100%' }}
            animate={isDesktop ? { opacity: 1, scale: 1, y: 0 } : { y: 0 }}
            exit={isDesktop ? { opacity: 0, scale: 0.97, y: 8 } : { y: '100%' }}
            transition={{ duration: isDesktop ? 0.3 : 0.45, ease: EASE }}
          >
            <div className="relative flex h-14 shrink-0 items-center justify-between pl-5 pr-3">
              <div className="flex items-center gap-3">
                {step === 2 && !success && (
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm font-medium text-ink/55 transition hover:text-ink"
                    aria-label="Back to your details"
                  >
                    ←
                  </button>
                )}
                <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
                  {success ? 'Order received' : step === 1 ? 'Your details' : 'Confirm your order'}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {!success && <span className="text-xs font-medium text-ink/45">Step {step} of 2</span>}
                <button
                  onClick={onClose}
                  aria-label="Close checkout"
                  className="grid h-9 w-9 place-items-center rounded-full bg-ink/5 text-ink/60 transition hover:bg-ink/10 hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {!success && (
                <div className="absolute inset-x-5 bottom-0 h-[2px] overflow-hidden rounded-full bg-ink/5">
                  <motion.div
                    className="h-full bg-leaf"
                    animate={{ width: step === 1 ? '50%' : '100%' }}
                    transition={{ duration: 0.4, ease: EASE }}
                  />
                </div>
              )}
            </div>

            <div ref={scroller} className="flex-1 overflow-y-auto pt-4">
              <AnimatePresence mode="wait" initial={false}>
                {success ? (
                  <Success key="ok" orderRef={success.ref} pkg={success.pkg} name={fields.name} onClose={onClose} />
                ) : step === 1 ? (
                  <motion.form
                    key="details"
                    onSubmit={goToConfirm}
                    noValidate
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="space-y-4 px-5 pb-5"
                  >
                    {/* Package picker */}
                    <div className="grid grid-cols-3 gap-1 rounded-full bg-ink/5 p-1">
                      {PACKAGES.map((p) => (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => onPackageChange(p.id)}
                          className="relative rounded-full px-2 py-2 text-center"
                          aria-pressed={p.id === pkg.id}
                        >
                          {p.id === pkg.id && (
                            <motion.span
                              layoutId="pkg-pill"
                              className="absolute inset-0 rounded-full bg-white shadow-sm"
                              transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                            />
                          )}
                          <span className={`relative text-sm font-semibold ${p.id === pkg.id ? 'text-ink' : 'text-ink/50'}`}>
                            {p.quantity} bottle{p.quantity > 1 ? 's' : ''}
                          </span>
                        </button>
                      ))}
                    </div>

                    {summary}

                    {/* Honeypot (hidden from humans) */}
                    <input ref={honeypot} name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

                    <Field label="Full name" error={show('name')}>
                      <input
                        ref={firstInput}
                        value={fields.name}
                        name="name"
                        onChange={set('name')}
                        onBlur={blur('name')}
                        autoComplete="name"
                        placeholder="e.g. Abena Mensah"
                        className={inputCls(show('name'))}
                      />
                    </Field>

                    <Field label="Phone number (we’ll call you on this)" error={show('phone')}>
                      <input
                        type="tel"
                        inputMode="tel"
                        value={fields.phone}
                        name="phone"
                        onChange={set('phone')}
                        onBlur={blur('phone')}
                        autoComplete="tel"
                        placeholder="024 412 3456"
                        className={inputCls(show('phone'))}
                      />
                    </Field>

                    <Field
                      label="Second phone number (optional)"
                      error={show('altPhone')}
                      hint="In case we can’t reach the first one."
                    >
                      <input
                        type="tel"
                        inputMode="tel"
                        value={fields.altPhone}
                        name="altPhone"
                        onChange={set('altPhone')}
                        onBlur={blur('altPhone')}
                        placeholder="055 123 4567"
                        className={inputCls(show('altPhone'))}
                      />
                    </Field>

                    <Field label="Region" error={show('region')}>
                      <select
                        value={fields.region}
                        name="region"
                        onChange={set('region')}
                        onBlur={blur('region')}
                        className={`${inputCls(show('region'))} appearance-none bg-[url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'><path d='M1 1.5l5 5 5-5' stroke='%230d1f1a' stroke-opacity='.45' stroke-width='1.5'/></svg>")] bg-[length:12px_8px] bg-[right_1rem_center] bg-no-repeat pr-10 ${
                          fields.region ? '' : 'text-ink/35'
                        }`}
                      >
                        <option value="" disabled>
                          Select your region
                        </option>
                        {REGIONS.map((r) => (
                          <option key={r} value={r} className="text-ink">
                            {r}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      label="Exact delivery location"
                      error={show('location')}
                      hint="Our rider uses this to find you. “Accra” is not enough — add a landmark or well-known place near you."
                    >
                      <input
                        value={fields.location}
                        name="location"
                        onChange={set('location')}
                        onBlur={blur('location')}
                        autoComplete="street-address"
                        placeholder="e.g. Adum, near Kejetia Market, Kumasi"
                        className={inputCls(show('location'))}
                      />
                    </Field>

                    {showNote || fields.note ? (
                      <Field label="Note (optional)">
                        <textarea
                          value={fields.note}
                          name="note"
                          onChange={set('note')}
                          rows={2}
                          maxLength={1000}
                          autoFocus={showNote && !fields.note}
                          placeholder="Best time to call, gate colour…"
                          className={`${inputCls()} resize-none`}
                        />
                      </Field>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowNote(true)}
                        className="text-[13px] font-medium text-leaf underline-offset-4 hover:underline"
                      >
                        + Add a delivery note
                      </button>
                    )}

                    {footer('Continue', PAY_ON_DELIVERY_LABEL)}
                  </motion.form>
                ) : (
                  <motion.form
                    key="confirm"
                    onSubmit={submit}
                    noValidate
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="space-y-5 px-5 pb-5"
                  >
                    {summary}

                    <div className="rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-900">
                      <p className="font-semibold">Please read carefully before you order</p>
                      <p className="mt-1.5">
                        A rider will call you to confirm as soon as you submit, so only order if you’re ready to receive
                        and pay on delivery. Every delivery has a real cost to us — if you won’t be available, please
                        don’t confirm.
                      </p>
                    </div>

                    <div>
                      <p className="mb-1.5 text-[13px] font-medium text-ink/65">Are you ready to pay on delivery?</p>
                      <Choice
                        name="ready"
                        value={confirm.ready}
                        onChange={(v) => setConfirm((c) => ({ ...c, ready: v }))}
                        options={[
                          { value: 'yes', label: 'Yes' },
                          { value: 'no', label: 'No' },
                        ]}
                      />
                      <AnimatePresence initial={false}>
                        {confirm.ready === 'no' ? (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 text-[13px] text-ink/60"
                          >
                            No problem — come back when you’re ready, or{' '}
                            <a
                              className="font-semibold text-leaf underline"
                              target="_blank"
                              rel="noopener noreferrer"
                              href={whatsappLink(`Hi! I have a question about the ${pkg.label}.`)}
                            >
                              ask us a question on WhatsApp
                            </a>
                            .
                          </motion.p>
                        ) : (
                          <ErrorText error={showConfirm('ready')} />
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <p className="mb-1.5 text-[13px] font-medium text-ink/65">When should the rider deliver?</p>
                      <Choice
                        name="deliveryDay"
                        value={confirm.deliveryDay}
                        onChange={(v) => setConfirm((c) => ({ ...c, deliveryDay: v }))}
                        options={DELIVERY_DAYS.map((d) => ({ value: d, label: d }))}
                      />
                      <ErrorText error={showConfirm('deliveryDay')} />
                    </div>

                    <div>
                      <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-snug text-ink/75">
                        <input
                          type="checkbox"
                          checked={confirm.canAfford}
                          onChange={(e) => setConfirm((c) => ({ ...c, canAfford: e.target.checked }))}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--leaf)]"
                        />
                        I can afford this product and I’m ready to pay {CURRENCY}
                        {pkg.price.toLocaleString()} on delivery.
                      </label>
                      <ErrorText error={showConfirm('canAfford')} />
                    </div>

                    <AnimatePresence>
                      {status === 'error' && (
                        <motion.div
                          ref={errorBox}
                          role="alert"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="rounded-2xl bg-red-50 p-4 text-sm text-red-700"
                        >
                          <p className="font-semibold">{serverError}</p>
                          <p className="mt-1">
                            You can also{' '}
                            <a
                              className="font-semibold underline"
                              target="_blank"
                              rel="noopener noreferrer"
                              href={whatsappLink(
                                `Hi! I'd like to order the ${pkg.label} (${pkg.quantity} × ${PRODUCT_NAME}, ${CURRENCY}${pkg.price}).\nName: ${fields.name}\nRegion: ${fields.region}\nLocation: ${fields.location}\nDelivery: ${confirm.deliveryDay}`
                              )}
                            >
                              send this order on WhatsApp
                            </a>
                            .
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {footer(
                      status === 'sending' ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" /> Sending order…
                        </>
                      ) : (
                        'Confirm my order'
                      ),
                      'Your details are only used to process your order.'
                    )}
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Success({ orderRef, pkg, name, onClose }: { orderRef: string; pkg: Package; name: string; onClose: () => void }) {
  const first = name.trim().split(' ')[0];
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex flex-col items-center px-6 pb-6 pt-2 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="grid h-20 w-20 place-items-center rounded-full bg-leaf"
      >
        <svg viewBox="0 0 52 52" className="h-10 w-10" aria-hidden>
          <motion.path
            d="M14 27 l8 8 l16 -18"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
        </svg>
      </motion.div>

      <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight text-ink">
        Thank you{first ? `, ${first}` : ''}.
      </h3>
      <p className="mt-3 max-w-sm text-ink/60">
        Your order for the <strong className="font-semibold text-ink">{pkg.label}</strong> has been received. A rider
        will call you shortly to confirm delivery — please keep your phone close.
      </p>

      {orderRef && (
        <div className="mt-6 w-full rounded-2xl bg-white px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">Order reference</p>
          <p className="mt-1 font-mono text-xl font-semibold text-ink">{orderRef}</p>
        </div>
      )}

      <div className="mt-6 flex w-full flex-col gap-1">
        <a
          href={whatsappLink(`Hi! I just placed order ${orderRef} for the ${pkg.label} (${CURRENCY}${pkg.price}).`)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-ink py-3.5 font-semibold text-paper transition-colors hover:bg-leaf"
        >
          Speed things up on WhatsApp
        </a>
        <button onClick={onClose} className="rounded-full py-3 font-semibold text-ink/60 transition hover:bg-ink/5">
          Back to the site
        </button>
      </div>
    </motion.div>
  );
}
