"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/components/providers/theme-provider";

const FAQS = [
  {
    q: "Per chi è pensato il percorso?",
    a: "Per personal trainer, preparatori atletici e appassionati che vogliono costruire competenze tecniche solide e un'identità professionale credibile. Non sono richiesti titoli pregressi: il percorso parte dalle fondamenta (FUNCTION) e arriva alla strategia di business (SCIENCE).",
  },
  {
    q: "Cosa include esattamente il percorso?",
    a: "9 mesi di formazione in presenza, articolati in 3 blocchi — FUNCTION, STRENGTH, SCIENCE — per un totale di 11 weekend formativi. Posti limitati a 30 partecipanti per garantire qualità didattica e rapporto diretto con i docenti.",
  },
  {
    q: "Qual è la differenza tra START, PRO ed ELITE?",
    a: "START (€3.300) include i 3 blocchi, l'attestazione Functional Strength Master Trainer (diploma CSEN) e il riconoscimento NSCA con 2.0 CEU internazionali. PRO (€4.700) aggiunge la certificazione Personal Elite Trainer FIPE e 2 masterclass a scelta tra le 9 disponibili. ELITE (€7.000) è l'esperienza completa con vitto e alloggio inclusi per tutta la durata.",
  },
  {
    q: "Quali certificazioni ottengo al termine del percorso?",
    a: "In tutti i pack ricevi due riconoscimenti: il diploma Functional Strength Master Trainer rilasciato da CSEN (con Tesserino tecnico e iscrizione all'albo nazionale degli istruttori sportivi) e i 2.0 CEU NSCA — Lacertosus Academy è ufficialmente NSCA CEU Provider. Nei pack PRO ed ELITE si aggiunge la certificazione Personal Elite Trainer FIPE, rilasciata dalla Federazione Italiana Pesistica.",
  },
  {
    q: "Cosa significa che Lacertosus è NSCA CEU Provider?",
    a: "Significa che la NSCA — National Strength and Conditioning Association, una delle organizzazioni internazionali più autorevoli nello Strength & Conditioning — riconosce ufficialmente il percorso Academy. Completando i 9 mesi ottieni 2.0 CEU (Continuing Education Units) validi per il mantenimento delle certificazioni NSCA, l'aggiornamento professionale continuo e la spendibilità internazionale del tuo profilo. È incluso in tutti i pack, senza costi aggiuntivi.",
  },
  {
    q: "Cosa attesta il diploma CSEN Functional Strength Master Trainer?",
    a: "Attesta competenze pratiche e teoriche avanzate in Functional Training, Strength & Conditioning, valutazione del movimento e gestione del cliente. Include Diploma da Istruttore, Tesserino tecnico e iscrizione nell'albo nazionale CSEN degli istruttori sportivi riconosciuti. È immediatamente spendibile in palestre, studi e centri fitness su tutto il territorio nazionale.",
  },
  {
    q: "La certificazione FIPE Personal Elite Trainer è riconosciuta?",
    a: "Sì. È rilasciata dalla FIPE (Federazione Italiana Pesistica) ed è spendibile in palestre e strutture sportive sia in Italia sia all'estero. Dà accesso al registro nazionale dei professionisti FIPE, attesta competenze avanzate di programmazione della forza e standard internazionali, ed è il titolo che fa la differenza per ruoli di responsabilità tecnica.",
  },
  {
    q: "Posso acquistare un singolo blocco o una sola masterclass?",
    a: "Sì. Ogni blocco (FUNCTION, STRENGTH, SCIENCE) è acquistabile separatamente, così come ciascuna delle 9 masterclass specialistiche (Functional & Bulgarian, Strength, Calcio, Pallavolo, Hyrox, Rugby, Running, Sport da Combattimento, Nuoto). Le certificazioni complete (CSEN, NSCA, FIPE) sono però vincolate al percorso integrale: NSCA e Master Trainer richiedono i 3 blocchi, FIPE è inclusa nei bundle PRO ed ELITE.",
  },
  {
    q: "C'è un test d'ingresso per accedere all'Academy?",
    a: "Sì, l'accesso è a numero chiuso e prevede un test d'ingresso che valuta il livello tecnico e teorico, le competenze pregresse e l'idoneità rispetto alle esigenze del percorso. Serve a garantire la sostenibilità del percorso per ciascun partecipante e a costruire un gruppo omogeneo che massimizzi apprendimento e interazione.",
  },
  {
    q: "Dove si svolge il percorso?",
    a: "In presenza, in strutture selezionate sul territorio italiano. Le location esatte di ogni weekend vengono comunicate agli iscritti con anticipo, in modo da permettere di organizzare viaggio e alloggio (incluso nel pack ELITE).",
  },
  {
    q: "Cosa succede se non posso partecipare a un weekend?",
    a: "La presenza è fondamentale per la qualità del percorso e per l'accesso alla certificazione. In caso di assenza documentata per cause straordinarie valutiamo individualmente la possibilità di recupero nelle edizioni successive.",
  },
  {
    q: "Posso aprire un Training Hub Lacertosus dopo il percorso?",
    a: "Sì, è una delle opportunità riservate ai professionisti certificati che completano il percorso. Apre con un colloquio dedicato e un accordo con il team Lacertosus per allineare standard qualitativi e identità del brand.",
  },
];

function FaqItem({
  q,
  a,
  index,
  isDark,
}: {
  q: string;
  a: string;
  index: number;
  isDark: boolean;
}) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const th = isDark ? undefined : "#111111";
  const tb = isDark ? undefined : "#555555";
  const dividerColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";

  useEffect(() => {
    if (!bodyRef.current) return;
    if (open) {
      gsap.to(bodyRef.current, {
        maxHeight: bodyRef.current.scrollHeight + 32,
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      });
    } else {
      gsap.to(bodyRef.current, {
        maxHeight: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      });
    }
  }, [open]);

  return (
    <div
      data-faq-item
      className="last:border-0"
      style={{ borderBottom: `1px solid ${dividerColor}` }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-6 py-5 text-left transition-colors duration-200 hover:text-academy-orange"
      >
        <div className="flex items-start gap-4">
          <span className="mt-0.5 shrink-0 text-[0.75rem] font-black text-academy-orange/40">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className="text-sm font-semibold text-academy-gray-200"
            style={{ color: th }}
          >
            {q}
          </span>
        </div>
        <span
          className="mt-0.5 shrink-0 text-lg font-light text-academy-orange/60 transition-transform duration-300"
          style={{ transform: open ? "rotate(45deg)" : "none" }}
        >
          +
        </span>
      </button>

      <div
        ref={bodyRef}
        style={{ maxHeight: 0, opacity: 0, overflow: "hidden" }}
      >
        <p
          className="pb-5 pl-10 text-sm leading-relaxed text-academy-gray-400"
          style={{ color: tb }}
        >
          {a}
        </p>
      </div>
    </div>
  );
}

export function FaqSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { theme } = useTheme();
  const d = theme === "dark";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(headRef.current, {
        scrollTrigger: {
          trigger: headRef.current,
          start: "top 85%",
          once: true,
        },
        opacity: 0,
        y: 25,
        duration: 0.7,
        ease: "power3.out",
      });
      const items = listRef.current?.querySelectorAll("[data-faq-item]");
      if (items) {
        gsap.from(items, {
          scrollTrigger: {
            trigger: listRef.current,
            start: "top 78%",
            once: true,
          },
          opacity: 0,
          x: -20,
          duration: 0.45,
          stagger: 0.07,
          ease: "power2.out",
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const th = d ? undefined : "#111111";
  const tm = d ? "#c7c7cc" : "#777777";

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="themed-section relative overflow-hidden py-24 md:py-32"
    >
      <div className="absolute inset-0 section-bg-alt" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Left: header */}
          <div ref={headRef} className="md:col-span-4">
            <span className="label-tag mb-3 block">Domande Frequenti</span>
            <h2
              className="text-[clamp(1.9rem,3.5vw,3rem)] font-black leading-[1.05] tracking-tight text-academy-gray-100"
              style={{ color: th }}
            >
              Hai ancora <span className="gradient-text">domande?</span>
            </h2>
            <p
              className="mt-4 text-sm text-academy-gray-500"
              style={{ color: tm }}
            >
              Ecco le risposte alle domande più comuni. Per tutto il resto,
              contattaci direttamente.
            </p>
            <div className="mt-8">
              <a
                href="mailto:academy@lacertosus.com"
                className="text-xs font-semibold text-academy-orange underline underline-offset-4 hover:text-academy-orange-light"
              >
                academy@lacertosus.com →
              </a>
            </div>
          </div>

          {/* Right: FAQ list */}
          <div ref={listRef} className="md:col-span-8">
            {FAQS.map((faq, i) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} index={i} isDark={d} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
