import { mkdir, readdir, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC_DIR = join(ROOT, "public", "ACADEMY-FILES", "docenti-edit");
const OUT_DIR = join(ROOT, "public", "docenti");

const FILE_TO_SLUG = {
  "ANTONIOSQUILLANTE.png": "antonio-squillante",
  "CORATELLAGIUSEPPE.png": "giuseppe-coratella",
  "GUIDOBELLI.png": "guido-belli",
  "SamueleMarcora.png": "samuele-marcora",
  "pierluigimauro.png": "pierluigi-mauro",
  "marcomagnani.png": "marco-magnani",
  "RiccardoAimini.png": "riccardo-aimini",
};

const fmtKB = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

await mkdir(OUT_DIR, { recursive: true });

const entries = await readdir(SRC_DIR);
let totalIn = 0;
let totalOut = 0;
let converted = 0;

for (const file of entries) {
  const slug = FILE_TO_SLUG[file];
  if (!slug) continue;
  const input = join(SRC_DIR, file);
  const output = join(OUT_DIR, `${slug}.webp`);
  const inStat = await stat(input);
  await sharp(input).webp({ quality: 82, effort: 6 }).toFile(output);
  const outStat = await stat(output);
  totalIn += inStat.size;
  totalOut += outStat.size;
  converted++;
  const ratio = ((1 - outStat.size / inStat.size) * 100).toFixed(1);
  console.log(
    `✓ ${file} → ${slug}.webp  (${fmtKB(inStat.size)} → ${fmtKB(outStat.size)}, -${ratio}%)`,
  );
}

const unmapped = entries.filter(
  (f) => !FILE_TO_SLUG[f] && /\.(png|jpe?g)$/i.test(f),
);
if (unmapped.length) {
  console.log(`\n⚠ Skipped (no slug mapping): ${unmapped.join(", ")}`);
}

console.log(
  `\nConverted ${converted} file(s). Total: ${fmtKB(totalIn)} → ${fmtKB(totalOut)} (-${(
    (1 - totalOut / totalIn) *
    100
  ).toFixed(1)}%)`,
);
