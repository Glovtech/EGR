import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter, Inter_Tight } from "next/font/google";
import Script from "next/script";
import { CONTACT, PACKAGES, PRODUCT_NAME } from "@/lib/catalog";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import Analytics from "./components/Analytics";
import "./globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-inter" });
const display = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: "400",
  style: ["normal", "italic"],
});

const PIXEL_ID = "840496878444318";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  icons: {
    icon: "/egr-logo.ico",
  },
  // Share image comes from app/opengraph-image.tsx
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    locale: "en_GH",
    title: "Forever Arctic Sea - Omega-3 for Kids | Evergreen Remedy Ghana",
    description:
      "Everyday Omega-3 DHA & EPA for growing children. Free delivery on 2+ bottles, pay on delivery in major cities.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Forever Arctic Sea - Omega-3 for Kids | Evergreen Remedy Ghana",
    description: "Everyday Omega-3 DHA & EPA for growing children. Pay on delivery in major cities.",
  },
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION && {
    verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION },
  }),
};

export const viewport: Viewport = {
  themeColor: "#f7f6f1",
};

// Structured data: who sells it and what's on offer (prices from the shared catalog)
const prices = PACKAGES.map((p) => p.price);
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/egr-logo.ico`,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: CONTACT.phone,
        contactType: "sales",
        areaServed: "GH",
        availableLanguage: ["en"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": `${SITE_URL}/#org` },
      inLanguage: "en-GH",
    },
    {
      "@type": "Product",
      "@id": `${SITE_URL}/#product`,
      name: PRODUCT_NAME,
      description:
        "Omega-3 food supplement with DHA and EPA from fish and squid oils, blended with olive oil. 120 softgels per bottle.",
      image: [`${SITE_URL}/fp1.png`, `${SITE_URL}/product.png`],
      brand: { "@type": "Brand", name: "Forever Living" },
      category: "Dietary Supplements",
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "GHS",
        lowPrice: Math.min(...prices),
        highPrice: Math.max(...prices),
        offerCount: PACKAGES.length,
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/#pricing`,
        seller: { "@id": `${SITE_URL}/#org` },
        areaServed: "GH",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GH" className={`${body.variable} ${display.variable} ${serif.variable}`}>
      <body className="font-sans">
        {children}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />

        <Analytics />

        {/* Meta Pixel */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>

        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            alt=""
            src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          />
        </noscript>
      </body>
    </html>
  );
}
