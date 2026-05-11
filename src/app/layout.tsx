import type { Metadata } from "next";
import { Saira } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { IubendaScript } from "@/components/providers/iubenda-script";
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
    "Percorso formativo unico per professionisti e imprenditori del fitness. FUNCTION, STRENGTH, SCIENCE: 9 mesi di formazione in presenza con certificazione FipexLacertosus.",
  keywords: [
    "fitness academy",
    "formazione fitness",
    "personal trainer",
    "strength conditioning",
    "functional training",
    "lacertosus",
    "certificazione fitness",
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
        {/* Iubenda cookie banner — loaded on every page */}
        <IubendaScript />
      </body>
    </html>
  );
}
