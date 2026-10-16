'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';
import { GA_ID } from '@/lib/site';

// Loads GA4 (only when NEXT_PUBLIC_GA_ID is set) and reports clicks on every
// WhatsApp / phone link from one listener, tagged with the section it sits in.
export default function Analytics() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a) return;
      const placement =
        a.dataset.placement ??
        (a.closest('[role="dialog"]') ? 'checkout' : a.closest('[id]')?.id ?? (a.closest('footer') ? 'footer' : 'page'));
      if (a.href.startsWith('https://wa.me/')) analytics.whatsappClick(placement);
      else if (a.href.startsWith('tel:')) analytics.callClick(placement);
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  if (!GA_ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
