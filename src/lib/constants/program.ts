/**
 * Programma Academy 2026/27 — argomenti dei tre blocchi formativi.
 * Source of truth: public/ACADEMY-FILES/programma-academy.md
 * Sintesi mostrata negli accordion del modale Pack.
 *
 * Each topic optionally references the teacher(s) who deliver that lecture
 * via `teacherSlugs` (matching `Teacher.slug` in `teachers.ts`).
 */

import { TEACHERS, type Teacher } from "./teachers";

export type ProgramBlockSlug = "function" | "strength" | "science";

export interface ProgramTopic {
  title: string;
  /** Optional teacher slugs delivering the lecture. */
  teacherSlugs?: string[];
}

export interface ProgramBlock {
  slug: ProgramBlockSlug;
  label: string;
  area: string;
  weekends: string;
  topics: ProgramTopic[];
}

export const PROGRAM_BLOCKS: ProgramBlock[] = [
  {
    slug: "function",
    label: "FUNCTION",
    area: "Functional Training",
    weekends: "2 weekend",
    topics: [
      {
        title: "Chinesiologia applicata al functional training",
        teacherSlugs: ["guido-belli"],
      },
      {
        title:
          "Metodologie avanzate per la valutazione della composizione corporea: applicazioni cliniche e sportive",
        teacherSlugs: ["francesco-campa"],
      },
      {
        title:
          "Framework concettuale aggiornato per la programmazione e il monitoraggio dell'allenamento fisico",
        teacherSlugs: ["samuele-marcora"],
      },
      {
        title:
          "Specificità dell'allenamento e adattamento del controllo posturale: basi teoriche e implicazioni applicative",
        teacherSlugs: ["marco-bani"],
      },
      {
        title:
          "Analisi biomeccanica strumentale degli esercizi: ottimizzazione della performance e prevenzione infortuni",
        teacherSlugs: ["matteo-romanazzi"],
      },
      {
        title:
          "Teoria e applicazione dell'allenamento funzionale per la general population",
        teacherSlugs: ["luca-cerri"],
      },
    ],
  },
  {
    slug: "strength",
    label: "STRENGTH",
    area: "Strength & Conditioning",
    weekends: "2 weekend",
    topics: [
      {
        title:
          "Periodizzazione dell'allenamento e cambiamenti nell'architettura muscolare",
        teacherSlugs: ["sandro-bartolomei"],
      },
      {
        title: "La complessità dell'allenamento di forza e ipertrofia",
        teacherSlugs: ["giuseppe-coratella"],
      },
      {
        title:
          "Fondamentali di squat, panca e stacco: errori, schemi motori e varianti",
        teacherSlugs: ["andrea-quarto"],
      },
      {
        title: "Strength & conditioning per lo sviluppo dell'atleta moderno",
        teacherSlugs: ["tommaso-mazzia"],
      },
      {
        title:
          "Allenamento della forza in preparazione atletica: principi di programmazione e periodizzazione",
        teacherSlugs: ["antonio-squillante"],
      },
      {
        title:
          "Forza, condizionamento, prehab e recovery per la prontezza operativa nel lungo termine",
        teacherSlugs: ["massimiliano-febbi", "angelo-zullo"],
      },
    ],
  },
  {
    slug: "science",
    label: "SCIENCE",
    area: "Performance Science & Business",
    weekends: "2 weekend",
    topics: [
      {
        title:
          "Nutrizione applicata alla performance: alimentazione per allenamento, recupero e gara",
        teacherSlugs: ["giacomo-zennaro"],
      },
      {
        title:
          "Il ruolo della prevenzione: collaborazione tra professionisti per performance e benessere",
        teacherSlugs: ["riccardo-capello"],
      },
      {
        title:
          "Psicologia del movimento: come l'attività fisica influenza mente e alimentazione",
        teacherSlugs: ["luca-bondi"],
      },
      {
        title: "Il potere della mente",
        teacherSlugs: ["rosalba-romano"],
      },
      {
        title:
          "L'importanza del recupero: strumenti per longevità e performance",
        teacherSlugs: ["simone-doti"],
      },
      {
        title: "Attività fisica e malattie neurodegenerative",
        teacherSlugs: ["margherita-fonsato"],
      },
      {
        title:
          "Gestire l'immagine: strategie di posizionamento e creazione del valore",
        teacherSlugs: ["enrico-dellacasa"],
      },
      {
        title:
          "Costruire un brand che genera valore: strategie tra marketing e business",
        teacherSlugs: ["matteo-seghedoni"],
      },
      {
        title: "Mentorship imprenditoriale per la crescita strategica",
        teacherSlugs: ["fabrizio-bramati"],
      },
      {
        title:
          "Strategia e crescita: sviluppare un progetto imprenditoriale solido",
        teacherSlugs: ["ettore-mendicino"],
      },
      {
        title: "Fare impresa oggi: strumenti e strategie per distinguersi",
        teacherSlugs: ["gionata-raffaelli", "anna-desi", "alex-lodovisi"],
      },
    ],
  },
];

export const PROGRAM_BY_SLUG: Record<ProgramBlockSlug, ProgramBlock> =
  PROGRAM_BLOCKS.reduce(
    (acc, b) => {
      acc[b.slug] = b;
      return acc;
    },
    {} as Record<ProgramBlockSlug, ProgramBlock>,
  );

/** Resolve teacher slugs on a topic to full Teacher records. */
export function getTopicTeachers(topic: ProgramTopic): Teacher[] {
  if (!topic.teacherSlugs?.length) return [];
  return topic.teacherSlugs
    .map((slug) => TEACHERS.find((t) => t.slug === slug))
    .filter((t): t is Teacher => Boolean(t));
}
