import type { Metadata } from "next";
import { CookiePreferencesLink } from "@/components/layout/cookie-preferences-link";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Informativa estesa sull'uso dei cookie tecnici e di analisi su Lacertosus Academy.",
  robots: { index: false, follow: true },
};

const LAST_UPDATED = "11 maggio 2026";
const CONTACT_EMAIL = "academy@lacertosus.com";

export default function CookiePolicyPage() {
  return (
    <main className="themed-section min-h-screen py-20">
      <div className="mx-auto max-w-3xl px-[5%] md:px-10">
        <header className="mb-12 border-b border-academy-orange/20 pb-8">
          <p className="mb-2 text-xs font-bold tracking-[0.2em] text-academy-orange uppercase">
            Informativa Cookie
          </p>
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Cookie Policy
          </h1>
          <p className="mt-3 text-sm text-academy-gray-400">
            Ultimo aggiornamento: {LAST_UPDATED}
          </p>
        </header>

        <article className="prose-policy space-y-8 text-academy-gray-300">
          <section>
            <h2>1. Cosa sono i cookie</h2>
            <p>
              I cookie sono piccoli file di testo che i siti visitati salvano
              sul tuo dispositivo per memorizzare informazioni utili al
              funzionamento del sito o all&apos;analisi del traffico.
            </p>
          </section>

          <section>
            <h2>2. Cookie utilizzati su questo sito</h2>

            <h3 className="mt-6 font-bold text-academy-gray-100">
              Cookie strettamente necessari
            </h3>
            <p>
              Indispensabili per il corretto funzionamento del sito. Senza
              questi cookie alcune funzionalità (autenticazione, carrello,
              checkout, preferenze tema) non sarebbero disponibili. Non
              richiedono consenso.
            </p>
            <ul>
              <li>
                <strong>Supabase Auth</strong>: sessione utente (
                <code>sb-*</code>).
              </li>
              <li>
                <strong>Stripe</strong>: gestione sicura del checkout (
                <code>__stripe_*</code>).
              </li>
              <li>
                <strong>cc_cookie</strong>: memorizza le tue preferenze sui
                cookie.
              </li>
              <li>
                <strong>Tema</strong>: ricorda la modalità chiaro/scuro
                selezionata.
              </li>
            </ul>

            <h3 className="mt-6 font-bold text-academy-gray-100">
              Cookie di analisi
            </h3>
            <p>
              Utilizzati per raccogliere in forma aggregata e anonima dati su
              come gli utenti navigano il sito. Vengono attivati solo previo tuo
              consenso esplicito.
            </p>
            <p>
              Al momento il sito non installa cookie di analisi finché non lo
              farai diventare necessario tramite gli strumenti previsti (PostHog
              o equivalenti). Qualora venissero attivati, comparirebbe il
              relativo dettaglio in questa sezione.
            </p>
          </section>

          <section>
            <h2>3. Cookie di terze parti</h2>
            <p>
              Alcune funzionalità (es. pagamenti tramite Stripe, video Vimeo
              embeddati) possono impostare cookie tecnici di terze parti
              necessari al loro funzionamento. Per maggiori informazioni
              consulta le rispettive privacy policy:
            </p>
            <ul>
              <li>
                <a
                  href="https://stripe.com/it/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-academy-orange underline"
                >
                  Stripe — Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="https://vimeo.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-academy-orange underline"
                >
                  Vimeo — Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-academy-orange underline"
                >
                  Supabase — Privacy Policy
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2>4. Come gestire le preferenze</h2>
            <p>
              Puoi modificare in qualsiasi momento le tue preferenze tramite il
              link{" "}
              <CookiePreferencesLink className="text-academy-orange underline">
                Preferenze cookie
              </CookiePreferencesLink>{" "}
              presente in fondo a ogni pagina, o disattivare i cookie
              direttamente dalle impostazioni del browser.
            </p>
            <p>
              Disabilitando i cookie strettamente necessari alcune funzionalità
              del sito potrebbero non funzionare correttamente.
            </p>
          </section>

          <section>
            <h2>5. Contatti</h2>
            <p>
              Per qualsiasi domanda relativa a questa Cookie Policy puoi
              scriverci a{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-academy-orange underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
