"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/components/providers/theme-provider";

const FAQS = [
  {
    q: "Quali sono i prerequisiti per iscriversi?",
    a: "Non esistono prerequisiti accademici formali. Il percorso è aperto a tutti gli appassionati e professionisti del fitness che vogliono formalizzare e approfondire le proprie competenze. È sufficiente la passione per il settore e la volontà di investire seriamente nella propria formazione.",
  },
  {
    q: "La certificazione FipexLacertosus è riconosciuta a livello nazionale?",
    a: "Sì. La certificazione è riconosciuta nel settore fitness italiano attraverso la collaborazione con FipexLacertosus, ente che opera a livello nazionale. Il titolo è spendibile per esercitare la professione come Personal Trainer e per aprire strutture affiliate.",
  },
  {
    q: "È possibile rateizzare il pagamento?",
    a: "Attualmente i prodotti sono acquistabili singolarmente, il che ti permette di seguire il percorso un blocco alla volta e gestire l'investimento nel tempo. Contattaci per ulteriori opzioni di pagamento personalizzate.",
  },
  {
    q: "Cosa succede se non posso partecipare a un weekend?",
    a: "Ogni caso viene valutato individualmente. In generale è prevista la possibilità di recupero nelle edizioni successive per eventi straordinari e documentati. Tuttavia, la presenza è fondamentale per il corretto apprendimento e per accedere alla certificazione.",
  },
  {
    q: "I workshop sono obbligatori o opzionali?",
    a: "I Master specialistici sono completamente opzionali. Puoi acquistarli singolarmente o selezionare quelli che ti interessano in base al tuo percorso professionale. Ogni Master è indipendente e si svolge in una giornata dedicata.",
  },
  {
    q: "Dove si svolge il percorso?",
    a: "Il percorso si svolge in presenza in strutture appositamente selezionate. Le location esatte vengono comunicate agli iscritti con anticipo. Il percorso è attualmente attivo in Italia.",
  },
  {
    q: "Come funziona la collaborazione con FIPE?",
    a: "FipexLacertosus conduce le sessioni di valutazione al termine di ogni blocco formativo. La collaborazione garantisce standard elevati di valutazione e il riconoscimento ufficiale del percorso nell'ecosistema professionale del fitness.",
  },
  {
    q: "È possibile aprire un Training Hub subito dopo il percorso?",
    a: "L'opportunità di aprire un Training Hub Lacertosus è disponibile per i professionisti certificati che completano il percorso completo. Il processo richiede un colloquio di valutazione e l'accordo con il team Lacertosus per garantire standard qualitativi uniformi.",
  },
];

function FaqItem({ q, a, index, isDark }: { q: string; a: string; index: number; isDark: boolean }) {
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
          <span className="text-sm font-semibold text-academy-gray-200" style={{ color: th }}>{q}</span>
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
        <p className="pb-5 pl-10 text-sm leading-relaxed text-academy-gray-400" style={{ color: tb }}>{a}</p>
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
        scrollTrigger: { trigger: headRef.current, start: "top 85%", once: true },
        opacity: 0, y: 25, duration: 0.7, ease: "power3.out",
      });
      const items = listRef.current?.querySelectorAll("[data-faq-item]");
      if (items) {
        gsap.from(items, {
          scrollTrigger: { trigger: listRef.current, start: "top 78%", once: true },
          opacity: 0, x: -20, duration: 0.45, stagger: 0.07, ease: "power2.out",
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
              Hai ancora{" "}
              <span className="gradient-text">domande?</span>
            </h2>
            <p className="mt-4 text-sm text-academy-gray-500" style={{ color: tm }}>
              Ecco le risposte alle domande più comuni. Per tutto il resto, contattaci direttamente.
            </p>
            <div className="mt-8">
              <a
                href="mailto:info@lacertosus.com"
                className="text-xs font-semibold text-academy-orange underline underline-offset-4 hover:text-academy-orange-light"
              >
                info@lacertosus.com →
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
