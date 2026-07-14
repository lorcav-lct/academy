import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { Lexend, Geist_Mono } from "next/font/google";
import { MetaPixelPageView } from "@/components/analytics/meta-pixel";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
// Lead capture disattivato (tab fisso "Voglio rimanere aggiornato" + popup exit-intent).
// import { LeadCaptureFloat } from "@/components/layout/lead-capture-float";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { CookieConsentProvider } from "@/components/providers/cookie-consent";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://academy.lacertosus.com";

const META_PIXEL_ID = "1739847650691729";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lacertosus Academy | Formazione Fitness Professionale",
    template: "%s | Lacertosus Academy",
  },
  description:
    "Percorso formativo unico per professionisti e imprenditori del fitness. FUNCTION, STRENGTH, SCIENCE: 9 mesi di formazione in presenza con tre certificazioni — Functional Strength Master Trainer (CSEN), 2.0 CEU NSCA e Personal Trainer FIPE.",
  keywords: [
    "fitness academy",
    "formazione fitness",
    "personal trainer",
    "strength conditioning",
    "functional training",
    "lacertosus",
    "certificazione personal trainer",
    "diploma CSEN",
    "NSCA CEU",
    "FIPE Personal Trainer",
    "Functional Strength Master Trainer",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "Lacertosus Academy",
    url: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${lexend.variable} ${geistMono.variable}`}
      data-theme="light"
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
        </Script>
        {/* End Meta Pixel Code */}
        {/* Meta Pixel noscript fallback */}
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            alt=""
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          />
        </noscript>
        <Suspense fallback={null}>
          <MetaPixelPageView />
        </Suspense>
        <ThemeProvider>
          <LenisProvider>
            <Navbar />
            <main className="relative">{children}</main>
            <Footer />
            <WhatsAppFloat />
            {/* <LeadCaptureFloat /> — disattivato */}
          </LenisProvider>
        </ThemeProvider>
        <CookieConsentProvider />
      </body>
    </html>
  );
}
