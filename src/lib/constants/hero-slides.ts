export interface HeroSlide {
  id: string;
  title_white: string;
  title_orange: string;
  description: string;
  cta_label: string | null;
  cta_href: string | null;
  bg_image_url: string | null;
  sort_order: number;
  active: boolean;
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "default-1",
    title_white: "NON FORMIAMO",
    title_orange: "ISTRUTTORI.",
    description:
      "Formiamo professionisti completi e imprenditori del fitness. 9 mesi di formazione progressiva, 100% in presenza.",
    cta_label: null,
    cta_href: null,
    bg_image_url: null,
    sort_order: 0,
    active: true,
  },
  {
    id: "default-2",
    title_white: "UN PERCORSO",
    title_orange: "UNICO.",
    description:
      "Tre blocchi formativi progressivi: FUNCTION, STRENGTH, SCIENCE. Dal fondamento tecnico all'eccellenza imprenditoriale.",
    cta_label: "Scopri il Percorso",
    cta_href: "/percorso",
    bg_image_url: null,
    sort_order: 1,
    active: true,
  },
  {
    id: "default-3",
    title_white: "DUE CERTIFICAZIONI",
    title_orange: "RICONOSCIUTE.",
    description:
      "Functional Strength Master Trainer in tutti i pack. Personal Elite Trainer FIPE — riconosciuta a livello nazionale e internazionale — nei pack PRO ed ELITE.",
    cta_label: "Scopri i Pack",
    cta_href: "#pack",
    bg_image_url: null,
    sort_order: 2,
    active: true,
  },
];
