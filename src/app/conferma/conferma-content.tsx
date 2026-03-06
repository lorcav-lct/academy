"use client";

import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";
import { Button } from "@/components/ui/button";

export function ConfermaContent() {

  return (
    <section className="flex min-h-screen items-center pt-24">
      <SectionContainer>
        <div className="mx-auto max-w-lg text-center">
          {/* Success icon */}
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center bg-academy-orange/10 glow-orange">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-10 w-10 text-academy-orange"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="mb-4 text-4xl font-black">
            Ordine <GradientText>Confermato</GradientText>
          </h1>

          <p className="mb-4 text-lg text-academy-gray-400">
            Grazie per aver scelto Lacertosus Academy. Il tuo ordine e stato processato con successo.
          </p>

          <p className="mb-8 text-sm text-academy-gray-500">
            Riceverai una email di conferma con i tuoi QR code per il check-in.
            Puoi anche trovarli nel tuo account.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href="/account/tickets" size="lg">
              Vedi i Miei Ticket
            </Button>
            <Button href="/account" variant="secondary">
              Vai al Mio Account
            </Button>
          </div>

          <div className="mt-12 border-t border-white/5 pt-8">
            <p className="text-xs text-academy-gray-600">
              Hai domande? Contattaci a{" "}
              <span className="text-academy-orange">academy@lacertosus.com</span>
            </p>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
