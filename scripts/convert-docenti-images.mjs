import { mkdir, readdir, stat } from "node:fs/promises";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC_DIR = join(ROOT, "public", "ACADEMY-FILES", "docenti-edit");
const OUT_DIR = join(ROOT, "public", "docenti");

// Single mapping table — filenames are matched case-insensitively against keys.
const FILE_TO_SLUG = {
  // Initial batch
  "antoniosquillante.png": "antonio-squillante",
  "coratellagiuseppe.png": "giuseppe-coratella",
  "guidobelli.png": "guido-belli",
  "samuelemarcora.png": "samuele-marcora",
  "marcomagnani.png": "marco-magnani",
  "riccardoaimini.png": "riccardo-aimini",
  // 30-04 batch
  "alexlodovisi.png": "alex-lodovisi",
  "andreaquarto.png": "andrea-quarto",
  "angelozullo.png": "angelo-zullo",
  "fabriziobramati.png": "fabrizio-bramati",
  "francescocampa.png": "francesco-campa",
  "lucacerri.png": "luca-cerri",
  "massimilianofebbi.png": "massimiliano-febbi",
  "matteoromanazzi.png": "matteo-romanazzi",
  "matteoseghedoni.png": "matteo-seghedoni",
  "riccardocapello.png": "riccardo-capello",
  "sandrobartolomei.png": "sandro-bartolomei",
  "tommasomazzia.png": "tommaso-mazzia",
  // 31-04 batch
  "annadesi.png": "anna-desi",
  "rosalbaromano.png": "rosalba-romano",
  "piattitennis.png": "piatti-tennis-center",
  "ettoredellacasa.png": "enrico-dellacasa", // filename typo: maps to Enrico Della Casa
  "ettoremendicino.png": "ettore-mendicino",
  "giacomozennaro.png": "giacomo-zennaro",
  "gionataraffaelli.png": "gionata-raffaelli",
  "ivanivanov.png": "ivan-ivanov",
  "ivanpellizzari.png": "ivan-pellizzari",
  "lucacollino.png": "luca-collino",
  "lucabondi.png": "luca-bondi",
  // marcobani.png from 31-04 superseded by 08-05/Marco_Bani.png
  "marco_bani.png": "marco-bani",
  "margheritafonsato.png": "margherita-fonsato",
  "oscarberti.png": "oscar-berti",
  "simonedoti.png": "simone-doti",
};

const fmtKB = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

await mkdir(OUT_DIR, { recursive: true });

let totalIn = 0;
let totalOut = 0;
let converted = 0;
const skipped = [];

for await (const input of walk(SRC_DIR)) {
  const base = basename(input).toLowerCase();
  const slug = FILE_TO_SLUG[base];
  if (!slug) {
    if (/\.(png|jpe?g)$/i.test(base)) skipped.push(input);
    continue;
  }
  const output = join(OUT_DIR, `${slug}.webp`);
  const inStat = await stat(input);
  await sharp(input).webp({ quality: 82, effort: 6 }).toFile(output);
  const outStat = await stat(output);
  totalIn += inStat.size;
  totalOut += outStat.size;
  converted++;
  const ratio = ((1 - outStat.size / inStat.size) * 100).toFixed(1);
  const rel = input.replace(SRC_DIR, "").replace(/^[\\/]/, "");
  console.log(
    `✓ ${rel} → ${slug}.webp  (${fmtKB(inStat.size)} → ${fmtKB(outStat.size)}, -${ratio}%)`,
  );
}

if (skipped.length) {
  console.log(
    `\n⚠ Skipped (no slug mapping):\n  ${skipped
      .map((s) => s.replace(SRC_DIR, "").replace(/^[\\/]/, ""))
      .join("\n  ")}`,
  );
}

console.log(
  `\nConverted ${converted} file(s). Total: ${fmtKB(totalIn)} → ${fmtKB(totalOut)} (-${(
    (1 - totalOut / totalIn) *
    100
  ).toFixed(1)}%)`,
);
