/**
 * Crea su Stripe i 3 coupon per la promo di lancio pack:
 *   - START: -€800   (3300 → 2500)
 *   - PRO:   -€800   (4700 → 3900)
 *   - ELITE: -€1100  (7000 → 5900)
 *
 * Caratteristiche:
 *   - amount_off in centesimi, currency EUR
 *   - duration: once (one-time payment)
 *   - applies_to: { products: [productId] } → ristretto al singolo pack
 *   - redeem_by: timestamp 30 giugno 2026 23:59:59 +02:00 (Europe/Rome)
 *   - metadata.slug per ritrovarli facilmente
 *
 * Idempotente: cerca per metadata.slug, se esiste lo riusa (e ne aggiorna i campi
 * mutabili). I campi `amount_off`, `currency`, `applies_to` su un coupon
 * Stripe NON sono modificabili dopo creazione: se cambiano, il coupon viene
 * archiviato e ricreato.
 *
 * Run: node scripts/setup-stripe-launch-promo.mjs
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

// 30 giugno 2026, 23:59:59 ora di Roma (UTC+2 in estate)
const REDEEM_BY_UNIX = Math.floor(
  new Date("2026-06-30T23:59:59+02:00").getTime() / 1000,
);

const COUPONS = [
  {
    slug: "launch-start",
    productId: "prod_USF9tLS8nllimp",
    amountOffCents: 80000,
    name: "LANCIO Pack START — sconto €800",
  },
  {
    slug: "launch-pro",
    productId: "prod_USF9NrnZTpdzZP",
    amountOffCents: 80000,
    name: "LANCIO Pack PRO — sconto €800",
  },
  {
    slug: "launch-elite",
    productId: "prod_USF9YpnSfHHbxp",
    amountOffCents: 110000,
    name: "LANCIO Pack ELITE — sconto €1100",
  },
];

async function findCouponBySlug(slug) {
  for await (const coupon of stripe.coupons.list({ limit: 100 })) {
    if (coupon.metadata?.slug === slug) return coupon;
  }
  return null;
}

async function setupCoupon(c) {
  console.log(`\n[${c.slug}]  ${c.name}`);
  const existing = await findCouponBySlug(c.slug);

  // If found, validate that the immutable fields still match. If not, archive and recreate.
  if (existing) {
    const sameAmount = existing.amount_off === c.amountOffCents;
    const sameCurrency = existing.currency === "eur";
    const sameProduct =
      existing.applies_to?.products?.[0] === c.productId &&
      existing.applies_to?.products?.length === 1;
    const sameDuration = existing.duration === "once";
    const sameRedeemBy = existing.redeem_by === REDEEM_BY_UNIX;

    if (
      sameAmount &&
      sameCurrency &&
      sameProduct &&
      sameDuration &&
      sameRedeemBy
    ) {
      console.log(`  ↳ trovato coupon esistente conforme: ${existing.id}`);
      // Update the mutable fields only (name, metadata)
      await stripe.coupons.update(existing.id, {
        name: c.name,
        metadata: { slug: c.slug, type: "launch-pack" },
      });
      return existing;
    }

    console.log(
      `  ↳ trovato coupon non conforme (${existing.id}), lo cancello`,
    );
    await stripe.coupons.del(existing.id);
  }

  const coupon = await stripe.coupons.create({
    name: c.name,
    amount_off: c.amountOffCents,
    currency: "eur",
    duration: "once",
    applies_to: { products: [c.productId] },
    redeem_by: REDEEM_BY_UNIX,
    metadata: { slug: c.slug, type: "launch-pack" },
  });
  console.log(`  ↳ creato coupon: ${coupon.id} (-€${c.amountOffCents / 100})`);
  return coupon;
}

const results = {};

for (const c of COUPONS) {
  const coupon = await setupCoupon(c);
  results[c.slug] = {
    couponId: coupon.id,
    amountOffCents: c.amountOffCents,
    productId: c.productId,
  };
}

console.log("\n\n=== RISULTATI ===");
console.log(JSON.stringify(results, null, 2));

const outPath = path.join(ROOT, "scripts", ".stripe-launch-promo-ids.json");
fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
console.log(`\nMapping salvato in: ${outPath}`);
console.log(
  `\nScadenza promo: ${new Date(REDEEM_BY_UNIX * 1000).toISOString()}`,
);
