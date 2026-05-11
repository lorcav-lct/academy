import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { CookiePreferencesLink } from "@/components/layout/cookie-preferences-link";
import { PUBLIC_WORKSHOPS as WORKSHOPS } from "@/lib/constants/workshops";

const footerLinks = {
  percorso: [
    { href: "/percorso", label: "Il Percorso" },
    { href: "/percorso/function", label: "FUNCTION" },
    { href: "/percorso/strength", label: "STRENGTH" },
    { href: "/percorso/science", label: "SCIENCE" },
  ],
  workshop: WORKSHOPS.map((w) => ({
    href: `/masterclass/${w.slug}`,
    label: w.title,
  })),
  info: [
    { href: "/pack", label: "Pack & Prezzi" },
    { href: "/auth/login", label: "Accedi" },
    { href: "/auth/register", label: "Registrati" },
  ],
  legal: [
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/cookie-policy", label: "Cookie Policy" },
    { href: "#", label: "Condizioni di vendita" },
    { href: "#", label: "Diritto di recesso" },
  ],
};

export function Footer() {
  return (
    <footer className="themed-section section-bg-alt border-t border-academy-orange/10">
      <div className="mx-auto max-w-[1440px] px-[5%] md:px-10 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div>
            <div className="mb-5 inline-flex text-academy-gray-100">
              <Logo width={180} />
            </div>
            <p className="text-sm leading-relaxed text-academy-gray-400">
              Formiamo professionisti. Formiamo imprenditori. Formiamo il tuo
              futuro.
            </p>
          </div>

          {/* Percorso */}
          <div>
            <h4 className="mb-4 text-xs font-bold tracking-[0.2em] text-academy-orange uppercase">
              Percorso
            </h4>
            <ul className="space-y-2">
              {footerLinks.percorso.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-academy-gray-400 transition-colors hover:text-academy-orange"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Masterclass */}
          <div>
            <h4 className="mb-4 text-xs font-bold tracking-[0.2em] text-academy-orange uppercase">
              Masterclass
            </h4>
            <ul className="space-y-2">
              {footerLinks.workshop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-academy-gray-400 transition-colors hover:text-academy-orange"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="mb-4 text-xs font-bold tracking-[0.2em] text-academy-orange uppercase">
              Informazioni
            </h4>
            <ul className="space-y-2">
              {footerLinks.info.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-academy-gray-400 transition-colors hover:text-academy-orange"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legali */}
          <div>
            <h4 className="mb-4 text-xs font-bold tracking-[0.2em] text-academy-orange uppercase">
              Legali
            </h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-academy-gray-400 transition-colors hover:text-academy-orange"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <CookiePreferencesLink />
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-academy-gray-400">
              &copy; {new Date().getFullYear()} Lacertosus Academy. Tutti i
              diritti riservati.
            </p>
            <p className="text-xs text-academy-gray-400">
              Un progetto{" "}
              <span className="font-semibold text-academy-orange">
                Lacertosus
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
