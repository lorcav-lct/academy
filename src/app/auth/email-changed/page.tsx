import Link from "next/link";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";

export default function EmailChangedPage() {
  return (
    <section className="flex min-h-screen items-center pt-24">
      <SectionContainer>
        <div className="mx-auto max-w-md text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center bg-green-500/10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-8 w-8 text-green-400"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mb-3 text-2xl font-black">
            Email <GradientText>Aggiornata</GradientText>
          </h1>
          <p className="mb-2 text-academy-gray-300">
            Il tuo indirizzo email è stato modificato con successo.
          </p>
          <p className="mb-8 text-sm text-academy-gray-500">
            Accedi nuovamente con il tuo nuovo indirizzo email per continuare.
          </p>
          <Link
            href="/auth/login"
            className="inline-block bg-academy-orange px-8 py-3 text-sm font-bold text-academy-dark transition-all hover:brightness-110"
          >
            Accedi con la Nuova Email
          </Link>
        </div>
      </SectionContainer>
    </section>
  );
}
