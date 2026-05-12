import type { Metadata } from "next";
import { Saira } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CookieConsentProvider } from "@/components/providers/cookie-consent";
import "./globals.css";

const saira = Saira({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-saira",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://academy.lacertosus.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lacertosus Academy | Formazione Fitness Professionale",
    template: "%s | Lacertosus Academy",
  },
  description:
    "Percorso formativo unico per professionisti e imprenditori del fitness. FUNCTION, STRENGTH, SCIENCE: 9 mesi di formazione in presenza con tre certificazioni — Functional Strength Master Trainer (CSEN), 2.0 CEU NSCA e Personal Elite Trainer FIPE.",
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
    "FIPE Personal Elite Trainer",
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
      className={saira.variable}
      data-theme="light"
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <Navbar />
          <main className="relative">{children}</main>
          <Footer />
          <WhatsAppFloat />
        </ThemeProvider>
        <CookieConsentProvider />
      </body>
    </html>
  );
}
