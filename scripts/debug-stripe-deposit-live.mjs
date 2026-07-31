/**
 * Read-only diagnostic on Stripe LIVE for the deposit balance coupons.
 *
 * Never writes. Reads the key from the STRIPE_LIVE_READ_KEY env var only
 * (never from .env.local, never printed).
 *
 * Usage (PowerShell):
 *   $env:STRIPE_LIVE_READ_KEY = "rk_live_..."; node scripts/debug-stripe-deposit-live.mjs
 */
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const key = process.env.STRIPE_LIVE_READ_KEY;
if (!key) {
  console.error("Missing STRIPE_LIVE_READ_KEY env var");
  process.exit(1);
}
const stripe = new Stripe(key);

for (const line of readFileSync(
  new URL("../.env.local", import.meta.url),
  "utf8",
).split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const safe = async (label, fn) => {
  try {
    return await fn();
  } catch (err) {
    console.log(`  !! ${label}: ${err.type ?? "error"} — ${err.message}`);
    return null;
  }
};

// ── Open deposits (caparra paid, balance not settled) ────────────────────
const { data: deposits, error } = await supabase
  .from("orders")
  .select(
    "id, billing_email, pack_id, created_at, deposit_promo_code, deposit_promotion_code_id, selected_workshop_ids",
  )
  .eq("payment_plan", "deposit")
  .eq("status", "paid")
  .eq("is_test", false)
  .is("balance_order_id", null)
  .order("created_at");
if (error) throw error;

console.log(`\n=== OPEN DEPOSITS (${deposits.length}) ===`);
const now = Math.floor(Date.now() / 1000);

for (const d of deposits) {
  console.log(
    `\n- ${d.billing_email} | ${d.pack_id} | ${d.created_at.slice(0, 10)} | code=${d.deposit_promo_code}`,
  );
  if (!d.deposit_promotion_code_id) {
    console.log("  (no promotion code id on order)");
    continue;
  }
  const pc = await safe("promotion_code", () =>
    stripe.promotionCodes.retrieve(d.deposit_promotion_code_id, {
      expand: ["coupon"],
    }),
  );
  if (!pc) continue;
  console.log(
    `  promo: active=${pc.active} times_redeemed=${pc.times_redeemed}/${pc.max_redemptions ?? "-"} expires_at=${
      pc.expires_at
        ? new Date(pc.expires_at * 1000).toISOString().slice(0, 16)
        : "-"
    }${pc.expires_at && pc.expires_at < now ? " ** EXPIRED **" : ""}`,
  );
  const c = pc.coupon;
  console.log(
    `  coupon ${c.id}: valid=${c.valid} deleted=${c.deleted ?? false} amount_off=${c.amount_off} ${c.currency} redeem_by=${
      c.redeem_by
        ? new Date(c.redeem_by * 1000).toISOString().slice(0, 16)
        : "-"
    }`,
  );
  const applies = c.applies_to?.products ?? null;
  console.log(
    `  applies_to.products: ${applies ? applies.join(", ") : "(any product)"}`,
  );
  if (applies) {
    for (const pid of applies) {
      const prod = await safe(`product ${pid}`, () =>
        stripe.products.retrieve(pid),
      );
      if (prod)
        console.log(
          `    - ${pid} name="${prod.name}" active=${prod.active} slug=${prod.metadata?.slug ?? "-"}`,
        );
    }
  }
}

// ── Live prices referenced by packs.ts ───────────────────────────────────
// packs.ts is TypeScript (not importable from plain node): scrape the live ids.
const packsSrc = readFileSync(
  new URL("../src/lib/constants/packs.ts", import.meta.url),
  "utf8",
);
const livePriceIds = Array.from(
  new Set(packsSrc.match(/live:\s*"(price_[A-Za-z0-9]+)"/g) ?? []),
).map((s) => s.match(/(price_[A-Za-z0-9]+)/)[1]);

console.log(`\n=== LIVE PRICES FROM packs.ts (${livePriceIds.length}) ===`);
for (const id of livePriceIds) {
  const price = await safe(`price ${id}`, () =>
    stripe.prices.retrieve(id, { expand: ["product"] }),
  );
  if (price)
    console.log(
      `- ${id} active=${price.active} amount=${price.unit_amount} product=${price.product.id} ("${price.product.name}") productActive=${price.product.active}`,
    );
}
