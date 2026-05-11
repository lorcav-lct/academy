import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Informativa sul trattamento dei dati personali ai sensi del Regolamento UE 2016/679 (GDPR).",
  robots: { index: false, follow: true },
};

const LAST_UPDATED = "11 maggio 2026";
const CONTACT_EMAIL = "academy@lacertosus.com";

export default function PrivacyPolicyPage() {
  return (
    <main className="themed-section min-h-screen py-20">
      <div className="mx-auto max-w-3xl px-[5%] md:px-10">
        <header className="mb-12 border-b border-academy-orange/20 pb-8">
          <p className="mb-2 text-xs font-bold tracking-[0.2em] text-academy-orange uppercase">
            Informativa Privacy
          </p>
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-academy-gray-400">
            Ultimo aggiornamento: {LAST_UPDATED}
          </p>
        </header>

        <article className="prose-policy space-y-8 text-academy-gray-300">
          <section>
            <h2>1. Titolare del trattamento</h2>
            <p>
              Il titolare del trattamento dei dati personali è{" "}
              <strong>Lacertosus</strong>. Per qualsiasi richiesta relativa alla
              presente informativa puoi contattarci all&apos;indirizzo{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-academy-orange underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2>2. Tipologie di dati raccolti</h2>
            <ul>
              <li>
                <strong>Dati di registrazione e account</strong>: nome, cognome,
                email, password (cifrata), eventuali dati anagrafici forniti.
              </li>
              <li>
                <strong>Dati di acquisto</strong>: dettagli ordine, importo,
                metodo di pagamento (gestito da Stripe — non conserviamo
                informazioni della carta).
              </li>
              <li>
                <strong>Dati di navigazione</strong>: indirizzo IP, browser,
                pagine visitate, raccolti in forma aggregata.
              </li>
              <li>
                <strong>Comunicazioni</strong>: contenuto di messaggi inviati
                tramite form, email o chat WhatsApp.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. Finalità e basi giuridiche</h2>
            <ul>
              <li>
                <strong>Erogazione del servizio</strong> (corsi, masterclass,
                ticket, area utente) — base giuridica: esecuzione del contratto.
              </li>
              <li>
                <strong>Adempimenti fiscali e contabili</strong> — base
                giuridica: obbligo di legge.
              </li>
              <li>
                <strong>Comunicazioni di servizio</strong> (conferme,
                aggiornamenti corsi) — base giuridica: esecuzione del contratto.
              </li>
              <li>
                <strong>Analisi statistiche aggregate</strong> per migliorare il
                sito — base giuridica: consenso (revocabile dalle preferenze
                cookie).
              </li>
            </ul>
          </section>

          <section>
            <h2>4. Destinatari dei dati</h2>
            <p>
              I dati possono essere trasferiti a fornitori che agiscono come
              responsabili del trattamento per nostro conto:
            </p>
            <ul>
              <li>
                <strong>Supabase</strong> (hosting database e autenticazione) —
                server UE.
              </li>
              <li>
                <strong>Stripe</strong> (gestione pagamenti) — trasferimenti
                extra-UE coperti da clausole contrattuali standard.
              </li>
              <li>
                <strong>Resend</strong> (invio email transazionali).
              </li>
              <li>
                <strong>Vercel</strong> (hosting applicazione).
              </li>
              <li>
                <strong>Make.com</strong> (automazioni interne).
              </li>
            </ul>
            <p>
              Nessun dato viene venduto o ceduto a terzi per finalità di
              marketing.
            </p>
          </section>

          <section>
            <h2>5. Conservazione dei dati</h2>
            <p>
              I dati di account e ordine sono conservati per il tempo necessario
              all&apos;erogazione del servizio e per gli adempimenti fiscali
              previsti dalla legge (10 anni per documenti contabili). I dati di
              navigazione vengono conservati fino a 14 mesi in forma aggregata.
            </p>
          </section>

          <section>
            <h2>6. Diritti dell&apos;interessato</h2>
            <p>
              Ai sensi degli articoli 15-22 del GDPR puoi in qualsiasi momento:
            </p>
            <ul>
              <li>accedere ai tuoi dati e ottenerne copia;</li>
              <li>chiederne rettifica, aggiornamento o cancellazione;</li>
              <li>limitare od opporti al trattamento;</li>
              <li>revocare il consenso prestato;</li>
              <li>
                proporre reclamo all&apos;Autorità Garante per la Protezione dei
                Dati Personali (
                <a
                  href="https://www.garanteprivacy.it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-academy-orange underline"
                >
                  garanteprivacy.it
                </a>
                ).
              </li>
            </ul>
            <p>
              Per esercitare i tuoi diritti scrivi a{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-academy-orange underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2>7. Cookie</h2>
            <p>
              Il sito utilizza cookie tecnici (necessari) e, previo tuo
              consenso, cookie di analisi. Per il dettaglio consulta la{" "}
              <a
                href="/cookie-policy"
                className="text-academy-orange underline"
              >
                Cookie Policy
              </a>
              . Puoi modificare le tue preferenze in qualsiasi momento dal link
              in fondo al sito.
            </p>
          </section>

          <section>
            <h2>8. Modifiche all&apos;informativa</h2>
            <p>
              Eventuali aggiornamenti saranno pubblicati su questa pagina con la
              relativa data di aggiornamento.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
