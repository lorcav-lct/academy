import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Anti-FOUC: runs synchronously before first paint.
// Sets data-theme based on localStorage or local hour (dark after 18:00).
const ANTI_FOUC = `(function(){var K='lacertosus-theme',DH=18;var s=null;try{s=localStorage.getItem(K);}catch(e){}var t=(s==='light'||s==='dark')?s:(new Date().getHours()>=DH?'dark':'light');document.documentElement.setAttribute('data-theme',t);})();`;

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
    <html lang="it" className={inter.variable} data-theme="dark" suppressHydrationWarning>
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        {/* Anti-FOUC: must run before any CSS paint */}
        <script dangerouslySetInnerHTML={{ __html: ANTI_FOUC }} />
      </head>
      <body className="min-h-screen bg-academy-dark antialiased">
        <ThemeProvider>
          <Navbar />
          <main className="relative">{children}</main>
          <Footer />
          <ScrollProgress />
        </ThemeProvider>
      </body>
    </html>
  );
}
