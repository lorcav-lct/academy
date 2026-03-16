export interface Teacher {
  initials: string;
  name: string;
  role: string;
  color: string;
  image_url?: string;
}

export const TEACHERS: Teacher[] = [
  { initials: "ML", name: "Marco Lacertosus", role: "Fondatore & Head Coach",      color: "#F09226" },
  { initials: "GF", name: "Giacomo Ferrari",  role: "Forza & Condizionamento",      color: "#D4AF37" },
  { initials: "AS", name: "Andrea Sabbatini", role: "Nutrizione Sportiva",           color: "#C0C0C0" },
  { initials: "CR", name: "Chiara Russo",     role: "Mobilità & Recovery",           color: "#CD7F32" },
  { initials: "LP", name: "Luca Palumbo",     role: "Business & Marketing",          color: "#F09226" },
];
