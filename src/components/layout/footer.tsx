import Link from "next/link";

const footerLinks = {
  percorso: [
    { href: "/percorso", label: "Il Percorso" },
    { href: "/corsi/corpus", label: "CORPUS" },
    { href: "/corsi/vis", label: "VIS" },
    { href: "/corsi/victor", label: "VICTOR" },
  ],
  workshop: [
    { href: "/masterclass/master-hyrox", label: "Master Hyrox" },
    { href: "/masterclass/master-calcio", label: "Master Calcio" },
    { href: "/masterclass/master-functional", label: "Master Functional" },
    { href: "/masterclass/master-endurance", label: "Master Endurance" },
  ],
  info: [
    { href: "/pack", label: "Pack & Prezzi" },
    { href: "/auth/login", label: "Accedi" },
    { href: "/auth/register", label: "Registrati" },
  ],
};

export function Footer() {
  return (
    <footer className="themed-section section-bg-alt border-t border-academy-orange/10">
      <div className="mx-auto max-w-[1440px] px-[5%] md:px-10 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center border-2 border-academy-orange bg-academy-orange/10">
                <span className="text-sm font-black text-academy-orange">L</span>
              </div>
              <span className="text-sm font-bold tracking-[0.15em] text-academy-gray-100 uppercase">
                Academy
              </span>
            </div>
            <p className="text-sm leading-relaxed text-academy-gray-400">
              Formiamo professionisti. Formiamo imprenditori. Formiamo il tuo futuro.
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
        </div>

        <div className="mt-12 border-t border-white/5 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-academy-gray-500">
              &copy; {new Date().getFullYear()} Lacertosus Academy. Tutti i diritti riservati.
            </p>
            <p className="text-xs text-academy-gray--600">
              Un progetto{" "}
              <span className="font-semibold text-academy-orange">Lacertosus</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
