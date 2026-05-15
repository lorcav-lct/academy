/**
 * Crea su Stripe i Product + Price per le masterclass mancanti.
 * - Currency EUR, amount 49000 (€490), tax_behavior inclusive
 * - Tax code: Training services (txcd_20030000)
 * - Recupera il Price ID di "Masterclass Functional Movement & Bulgarian" (già creato manualmente)
 * - Archivia il vecchio Price Rugby (price_1T7u0LCGgXzYzpRp2XeH0tZ8) e ne crea uno nuovo a €490
 *
 * Run: node scripts/setup-stripe-masterclasses.mjs
 */

import Stripe from "stripe";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Carica STRIPE_SECRET_KEY da .env.local
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
const PRICE_AMOUNT = 49000; // €490,00

// Tutte le masterclass del catalogo (slug → metadata Stripe)
const MASTERCLASSES = [
  {
    slug: "master-functional-bulgarian",
    productName:
      "Masterclass Functional Movement & Bulgarian — Lacertosus Academy",
    description:
      "Masterclass intensiva 1-2 giornate in presenza · Ivan Ivanov + Pierluigi Mauro",
    skipCreate: true, // già creato manualmente: cerco e leggo il Price
  },
  {
    slug: "master-strength",
    productName: "Masterclass Strength Avanzato — Lacertosus Academy",
    description:
      "Masterclass intensiva 1-2 giornate in presenza · Andrea Quarto",
  },
  {
    slug: "master-calcio",
    productName: "Masterclass Calcio — Lacertosus Academy",
    description:
      "Masterclass intensiva 1-2 giornate in presenza · Luca Collino",
  },
  {
    slug: "master-volley",
    productName: "Masterclass Pallavolo — Lacertosus Academy",
    description: "Masterclass intensiva 1-2 giornate in presenza · Oscar Berti",
  },
  {
    slug: "master-tennis",
    productName: "Masterclass Tennis — Lacertosus Academy",
    description:
      "Masterclass intensiva 1-2 giornate in presenza · Piatti Tennis Center",
  },
  {
    slug: "master-rugby",
    productName: "Masterclass Rugby — Lacertosus Academy",
    description:
      "Masterclass intensiva 1-2 giornate in presenza · Trainer in definizione",
    archiveOldPrice: "price_1T7u0LCGgXzYzpRp2XeH0tZ8",
  },
  {
    slug: "master-running",
    productName: "Masterclass Running — Lacertosus Academy",
    description:
      "Masterclass intensiva 1-2 giornate in presenza · Ivan Pellizzari",
  },
  {
    slug: "master-nuoto",
    productName: "Masterclass Nuoto — Lacertosus Academy",
    description:
      "Masterclass intensiva 1-2 giornate in presenza · Marco Magnani + Riccardo Aimini",
  },
];

async function findProductByName(name) {
  // Stripe non ha filtro by name diretto; uso list paginata
  for await (const product of stripe.products.list({
    active: true,
    limit: 100,
  })) {
    if (product.name === name) return product;
  }
  return null;
}

async function getOrCreateProduct(m) {
  const existing = await findProductByName(m.productName);
  if (existing) {
    console.log(`  ↳ trovato product esistente: ${existing.id}`);
    return existing;
  }
  const product = await stripe.products.create({
    name: m.productName,
    description: m.description,
    tax_code: TAX_CODE,
    metadata: { slug: m.slug },
  });
  console.log(`  ↳ creato product: ${product.id}`);
  return product;
}

async function createPrice(productId) {
  const price = await stripe.prices.create({
    product: productId,
    currency: "eur",
    unit_amount: PRICE_AMOUNT,
    tax_behavior: "inclusive",
  });
  console.log(`  ↳ creato price:   ${price.id}`);
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

// Masterclass rimosse dal catalogo: archivia product + price attivi
const TO_ARCHIVE = [
  {
    slug: "master-hyrox",
    productId: "prod_USBv6jPq5Fg11e",
    priceId: "price_1TTHXYCGgXzYzpRpSShW9Ewg",
  },
  {
    slug: "master-sport-combattimento",
    productId: "prod_USBv9BNQrSnP3f",
    priceId: "price_1TTHXcCGgXzYzpRp6FSkEbcO",
  },
];

for (const a of TO_ARCHIVE) {
  console.log(`\n[ARCHIVE ${a.slug}]`);
  try {
    await stripe.prices.update(a.priceId, { active: false });
    console.log(`  ↳ archiviato price: ${a.priceId}`);
  } catch (err) {
    console.log(`  ↳ archive price fallito: ${err.message}`);
  }
  try {
    await stripe.products.update(a.productId, { active: false });
    console.log(`  ↳ archiviato product: ${a.productId}`);
  } catch (err) {
    console.log(`  ↳ archive product fallito: ${err.message}`);
  }
}

const results = {};

for (const m of MASTERCLASSES) {
  console.log(`\n[${m.slug}] ${m.productName}`);

  if (m.archiveOldPrice) {
    try {
      await stripe.prices.update(m.archiveOldPrice, { active: false });
      console.log(`  ↳ archiviato vecchio price: ${m.archiveOldPrice}`);
    } catch (err) {
      console.log(
        `  ↳ archive vecchio price fallito (probabilmente già archiviato): ${err.message}`,
      );
    }
  }

  const product = await getOrCreateProduct(m);

  let price = await getActivePrice(product.id);
  if (
    !price ||
    price.unit_amount !== PRICE_AMOUNT ||
    price.tax_behavior !== "inclusive"
  ) {
    if (price) {
      await stripe.prices.update(price.id, { active: false });
      console.log(`  ↳ archiviato price non conforme: ${price.id}`);
    }
    price = await createPrice(product.id);
  } else {
    console.log(`  ↳ price attivo già conforme: ${price.id}`);
  }

  results[m.slug] = { productId: product.id, priceId: price.id };
}

console.log("\n\n=== RISULTATI ===");
console.log(JSON.stringify(results, null, 2));

// Scrivi mapping su file per uso successivo
const outPath = path.join(ROOT, "scripts", ".stripe-masterclass-ids.json");
fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
console.log(`\nMapping salvato in: ${outPath}`);
