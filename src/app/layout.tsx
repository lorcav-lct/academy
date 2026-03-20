import type { Metadata } from "next";
import { Saira } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const saira = Saira({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-saira",
  display: "swap",
});

// Anti-FOUC: runs synchronously before first paint.
// Sets data-theme based on localStorage or local time (dark 22:30–04:30).
const ANTI_FOUC = `(function(){var K='lacertosus-theme';var s=null;try{s=localStorage.getItem(K);}catch(e){}var n=new Date(),m=n.getHours()*60+n.getMinutes(),d=m>=1350||m<270;var t=(s==='light'||s==='dark')?s:(d?'dark':'light');document.documentElement.setAttribute('data-theme',t);})();`;

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
    <html lang="it" className={saira.variable} data-theme="dark" suppressHydrationWarning>
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
