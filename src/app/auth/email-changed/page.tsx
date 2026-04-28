import Link from "next/link";

const PAGE_BG = "#f5f3ef";
const TEXT_PRIMARY = "#111111";
const TEXT_SECONDARY = "rgba(17,17,17,0.62)";
const TEXT_TERTIARY = "rgba(17,17,17,0.42)";
const DIVIDER = "rgba(17,17,17,0.1)";

export default function EmailChangedPage() {
  return (
    <section
      className="relative min-h-screen pt-32 pb-24 md:pt-36 md:pb-32"
      style={{ background: PAGE_BG, color: TEXT_PRIMARY }}
    >
      <div className="mx-auto w-full max-w-[640px] px-6 md:px-10">
        <p className="mb-8 font-mono text-[0.7rem] font-black tracking-[0.34em] uppercase text-academy-orange">
          — Email aggiornata
        </p>

        <h1
          className="text-[clamp(2.4rem,5.6vw,4.6rem)] font-black leading-[0.96] tracking-[-0.025em]"
          style={{ color: TEXT_PRIMARY }}
        >
          Indirizzo
        </h1>
        <h1 className="mt-1 text-[clamp(2.4rem,5.6vw,4.6rem)] font-black leading-[0.96] tracking-[-0.025em] text-academy-orange">
          aggiornato.
        </h1>

        <p
          className="mt-8 max-w-lg text-[1rem] leading-[1.7]"
          style={{ color: TEXT_SECONDARY }}
        >
          Il tuo indirizzo email è stato modificato con successo. Per
          continuare, esegui un nuovo accesso con il nuovo indirizzo.
        </p>

        <div className="mt-12">
          <Link
            href="/auth/login"
            className="group relative inline-flex h-14 w-full items-center justify-center overflow-hidden bg-academy-orange px-8 font-mono text-[0.78rem] font-black tracking-[0.32em] uppercase text-[#111111] transition-all duration-300 hover:bg-academy-orange-light md:w-auto md:px-10"
          >
            <span className="relative z-10">Accedi con la nuova email</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
              aria-hidden
              className="relative z-10 ml-3 transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M4 2 L9 7 L4 12" />
            </svg>
          </Link>
        </div>

        <div className="mt-14 h-px w-full" style={{ background: DIVIDER }} />

        <p
          className="mt-8 font-mono text-[0.62rem] font-bold tracking-[0.28em] uppercase"
          style={{ color: TEXT_TERTIARY }}
        >
          Cohort 001 · Founding Edition
        </p>
      </div>
    </section>
  );
}
