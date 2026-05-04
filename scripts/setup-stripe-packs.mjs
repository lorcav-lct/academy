/**
 * Crea su Stripe i Product + Price per i bundle pack (START / PRO / ELITE).
 * - Currency EUR, tax_behavior inclusive (IVA inclusa nel prezzo)
 * - Tax code: Training services (txcd_20030000)
 * - Idempotente: se trova già un product con lo stesso name, lo riusa.
 *   Se trova un price attivo non conforme (importo o tax_behavior diverso),
 *   lo archivia e ne crea uno nuovo.
 *
 * Run: node scripts/setup-stripe-packs.mjs
 */

import Stripe from "stripe";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function loadEnv() {
  const envPath = path.join(ROOT, ".env.local");
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2];
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = val;
  }
}
loadEnv();

const SECRET = process.env.STRIPE_SECRET_KEY;
if (!SECRET) {
  console.error("STRIPE_SECRET_KEY mancante in .env.local");
  process.exit(1);
}

const stripe = new Stripe(SECRET, { apiVersion: "2024-12-18.acacia" });

const TAX_CODE = "txcd_20030000"; // Training services

const PACKS = [
  {
    slug: "start",
    productName: "Pack START — Lacertosus Academy",
    description:
      "Pack START · Il percorso completo Lacertosus Academy: 3 blocchi formativi (FUNCTION + STRENGTH + SCIENCE), 9 mesi in presenza, attestazione Functional Strength Master Coach, materiale didattico digitale, accesso alla community.",
    amountCents: 330000, // €3.300
    statementDescriptor: "LACERTOSUS START",
  },
  {
    slug: "pro",
    productName: "Pack PRO — Lacertosus Academy",
    description:
      "Pack PRO · Il percorso completo + Certificazione Personal Trainer FIPE × Lacertosus + 2 Masterclass a scelta tra le 9 disponibili. 9 mesi in presenza, attestazione Functional Strength Master Coach, materiale didattico digitale, accesso alla community.",
    amountCents: 470000, // €4.700
    statementDescriptor: "LACERTOSUS PRO",
  },
  {
    slug: "elite",
    productName: "Pack ELITE — Lacertosus Academy",
    description:
      "Pack ELITE · L'esperienza completa con vitto e alloggio inclusi per tutta la durata. Percorso completo + FIPE × Lacertosus + 2 Masterclass + accesso prioritario alla community. 9 mesi in presenza.",
    amountCents: 700000, // €7.000
    statementDescriptor: "LACERTOSUS ELITE",
  },
];

async function findProductByName(name) {
  for await (const product of stripe.products.list({
    active: true,
    limit: 100,
  })) {
    if (product.name === name) return product;
  }
  return null;
}

async function getOrCreateProduct(p) {
  const existing = await findProductByName(p.productName);
  if (existing) {
    console.log(`  ↳ trovato product esistente: ${existing.id}`);
    // Update description and metadata to keep them in sync
    await stripe.products.update(existing.id, {
      description: p.description,
      tax_code: TAX_CODE,
      metadata: { slug: p.slug, type: "bundle" },
      statement_descriptor: p.statementDescriptor,
    });
    return existing;
  }
  const product = await stripe.products.create({
    name: p.productName,
    description: p.description,
    tax_code: TAX_CODE,
    metadata: { slug: p.slug, type: "bundle" },
    statement_descriptor: p.statementDescriptor,
  });
  console.log(`  ↳ creato product:   ${product.id}`);
  return product;
}

async function createPrice(productId, amountCents) {
  const price = await stripe.prices.create({
    product: productId,
    currency: "eur",
    unit_amount: amountCents,
    tax_behavior: "inclusive",
  });
  console.log(`  ↳ creato price:     ${price.id} (€${amountCents / 100})`);
  return price;
}

async function getActivePrice(productId) {
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 10,
  });
  return prices.data[0] ?? null;
}

const results = {};

for (const p of PACKS) {
  console.log(`\n[${p.slug}] ${p.productName}`);
  const product = await getOrCreateProduct(p);

  let price = await getActivePrice(product.id);
  if (
    !price ||
    price.unit_amount !== p.amountCents ||
    price.tax_behavior !== "inclusive" ||
    price.currency !== "eur"
  ) {
    if (price) {
      await stripe.prices.update(price.id, { active: false });
      console.log(`  ↳ archiviato price non conforme: ${price.id}`);
    }
    price = await createPrice(product.id, p.amountCents);
  } else {
    console.log(`  ↳ price attivo già conforme:    ${price.id}`);
  }

  results[p.slug] = {
    productId: product.id,
    priceId: price.id,
    amountCents: p.amountCents,
  };
}

console.log("\n\n=== RISULTATI ===");
console.log(JSON.stringify(results, null, 2));

const outPath = path.join(ROOT, "scripts", ".stripe-pack-ids.json");
fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
console.log(`\nMapping salvato in: ${outPath}`);
