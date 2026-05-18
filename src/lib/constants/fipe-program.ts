/**
 * Programma corso FIPE — "Istruttore Sala Pesi e Pesistica · Personal Trainer I Livello".
 * Riconoscimento ufficiale FIPE rilasciato nei pack PRO ed ELITE.
 *
 * Struttura: 3 weekend in presenza, 6 giornate (5 didattiche + 1 di esame finale),
 * 16h teoria + 24h pratica.
 */

export interface FipeLesson {
  hours: number;
  title: string;
}

export interface FipeDay {
  day: number;
  dayLabel: string;
  isExam?: boolean;
  lessons: FipeLesson[];
}

export interface FipeWeekend {
  weekend: number;
  label: string;
  days: FipeDay[];
}

export const FIPE_COURSE_TITLE =
  "Istruttore Sala Pesi e Pesistica · Personal Trainer I Livello";

export const FIPE_PROGRAM_HEADING = "PROGRAMMA CORSO X LACERTOSUS";

export const FIPE_PROGRAM_META = {
  weekends: 3,
  daysTotal: 6,
  hoursTheory: 16,
  hoursPractice: 24,
  hoursTotal: 40,
};

export const FIPE_WEEKENDS: FipeWeekend[] = [
  {
    weekend: 1,
    label: "1° weekend",
    days: [
      {
        day: 1,
        dayLabel: "1° giorno",
        lessons: [
          {
            hours: 2,
            title:
              "Sistemi energetici, apparato respiratorio e cardiovascolare",
          },
          {
            hours: 3,
            title: "Principi generali dell'allenamento",
          },
          {
            hours: 3,
            title: "Anatomia applicata agli esercizi della sala pesi",
          },
        ],
      },
      {
        day: 2,
        dayLabel: "2° giorno",
        lessons: [
          {
            hours: 2,
            title: "Elementi di mobilità articolare e flessibilità muscolare",
          },
          {
            hours: 2,
            title: "Fisiologia dell'esercizio e adattamenti all'allenamento",
          },
          {
            hours: 4,
            title: "Programmazione dell'allenamento",
          },
        ],
      },
    ],
  },
  {
    weekend: 2,
    label: "2° weekend",
    days: [
      {
        day: 3,
        dayLabel: "3° giorno",
        lessons: [
          { hours: 2, title: "Approccio al calisthenics" },
          {
            hours: 3,
            title:
              "Esecuzione degli esercizi complementari con manubri e bilanciere",
          },
          {
            hours: 3,
            title: "Utilizzo e regolazione delle macchine isotoniche e cardio",
          },
        ],
      },
      {
        day: 4,
        dayLabel: "4° giorno",
        lessons: [
          {
            hours: 2,
            title:
              "Costruzione di mini-circuiti base e gestione dell'attivazione",
          },
          {
            hours: 2,
            title: "Valutazioni semplici di mobilità e postura",
          },
          { hours: 1, title: "Allenamento al femminile" },
          {
            hours: 3,
            title:
              "Allenamento funzionale: organizzazione e gestione di una classe",
          },
        ],
      },
    ],
  },
  {
    weekend: 3,
    label: "3° weekend",
    days: [
      {
        day: 5,
        dayLabel: "5° giorno",
        lessons: [
          { hours: 4, title: "Kettlebell training" },
          {
            hours: 4,
            title:
              "Esecuzione e didattica degli esercizi fondamentali (squat / panca / stacco)",
          },
        ],
      },
      {
        day: 6,
        dayLabel: "6° giorno",
        isExam: true,
        lessons: [{ hours: 0, title: "Esame finale" }],
      },
    ],
  },
];

export function getWeekendHours(weekend: FipeWeekend): number {
  return weekend.days.reduce(
    (sum, d) => sum + d.lessons.reduce((s, l) => s + (l.hours || 0), 0),
    0,
  );
}
