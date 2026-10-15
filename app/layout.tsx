import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter, Inter_Tight } from "next/font/google";
import Script from "next/script";
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
  title: "Evergreen Remedy Ghana - Forever Arctic Sea Omega-3 for Kids",
  description:
    "Everyday Omega-3 support for your child's growing brain. Forever Arctic Sea gives children DHA and EPA, nutrients that support normal brain function as part of a balanced diet.",
  icons: {
    icon: "/egr-logo.ico",
  },
  openGraph: {
    title: "Forever Arctic Sea - Omega-3 for Kids | Evergreen Remedy Ghana",
    description:
      "Everyday Omega-3 DHA & EPA for growing children. Free delivery on 2+ bottles, pay on delivery in major cities.",
    images: ["/thumbnail.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f6f1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} ${serif.variable}`}>
      <body className="font-sans">
        {children}

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
