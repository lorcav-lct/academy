import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Lacertosus Academy | Formazione Fitness Professionale",
    template: "%s | Lacertosus Academy",
  },
  description:
    "Percorso formativo unico per professionisti e imprenditori del fitness. CORPUS, VIS, VICTOR: 9 mesi di formazione in presenza con certificazione FipexLacertosus.",
  keywords: [
    "fitness academy",
    "formazione fitness",
    "personal trainer",
    "strength conditioning",
    "functional training",
    "lacertosus",
    "certificazione fitness",
  ],
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "Lacertosus Academy",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={inter.variable}>
      <body className="min-h-screen bg-academy-dark antialiased">
        <Navbar />
        <main className="relative">{children}</main>
        <Footer />
        <ScrollProgress />
      </body>
    </html>
  );
}
