"use client";

import { useEffect } from "react";
import * as CookieConsent from "vanilla-cookieconsent";
import "vanilla-cookieconsent/dist/cookieconsent.css";

/**
 * GDPR cookie consent banner + preferences modal.
 *
 * Categories:
 * - necessary: always on (auth session, checkout cart, theme)
 * - analytics: PostHog & similar (currently not active in the project)
 *
 * Trigger the preferences modal anywhere via:
 *   <a href="#" data-cc="show-preferencesModal">Preferenze cookie</a>
 */
export function CookieConsentProvider() {
  useEffect(() => {
    CookieConsent.run({
      guiOptions: {
        consentModal: {
          layout: "box",
          position: "bottom right",
          equalWeightButtons: false,
          flipButtons: false,
        },
        preferencesModal: {
          layout: "box",
          equalWeightButtons: false,
          flipButtons: false,
        },
      },
      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
        },
        analytics: {
          enabled: false,
          readOnly: false,
          autoClear: {
            cookies: [{ name: /^_ga/ }, { name: "_gid" }, { name: /^ph_/ }],
          },
        },
      },
      language: {
        default: "it",
        translations: {
          it: {
            consentModal: {
              title: "Utilizziamo i cookie",
              description:
                "Usiamo cookie tecnici per il corretto funzionamento del sito e, previo tuo consenso, cookie di analisi per migliorare l'esperienza. Puoi accettarli tutti, rifiutarli o personalizzare le scelte.",
              acceptAllBtn: "Accetta tutti",
              acceptNecessaryBtn: "Rifiuta",
              showPreferencesBtn: "Personalizza",
              footer:
                '<a href="/privacy-policy">Privacy Policy</a>\n<a href="/cookie-policy">Cookie Policy</a>',
            },
            preferencesModal: {
              title: "Preferenze cookie",
              acceptAllBtn: "Accetta tutti",
              acceptNecessaryBtn: "Rifiuta",
              savePreferencesBtn: "Salva preferenze",
              closeIconLabel: "Chiudi",
              sections: [
                {
                  title: "Cookie strettamente necessari",
                  description:
                    "Indispensabili per il funzionamento del sito (autenticazione, carrello, preferenze tema). Non possono essere disattivati.",
                  linkedCategory: "necessary",
                },
                {
                  title: "Cookie di analisi",
                  description:
                    "Ci aiutano a capire come gli utenti usano il sito in forma aggregata e anonima. Disattivabili senza compromettere l'esperienza.",
                  linkedCategory: "analytics",
                },
                {
                  title: "Maggiori informazioni",
                  description:
                    'Per qualsiasi domanda sulla nostra politica sui cookie consulta la nostra <a href="/cookie-policy">Cookie Policy</a> o contattaci.',
                },
              ],
            },
          },
        },
      },
    });
  }, []);

  return null;
}
