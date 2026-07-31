/**
 * Read-only: inspect the live Checkout Sessions of the two blocked customers to
 * find out what consumed their -500€ promotion code redemption.
 *
 * Usage: STRIPE_LIVE_READ_KEY=rk_live_... node scripts/debug-stripe-sessions-live.mjs
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

// Customer emails come from argv — never hardcode personal data in the repo.
const EMAILS = process.argv.slice(2);
if (EMAILS.length === 0) {
  console.error(
    "Usage: node scripts/debug-stripe-sessions-live.mjs <email> [email...]",
  );
  process.exit(1);
}

const { data: orders, error } = await supabase
  .from("orders")
  .select(
    "id, billing_email, created_at, status, payment_plan, stripe_checkout_session_id",
  )
  .in("billing_email", EMAILS)
  .not("stripe_checkout_session_id", "is", null)
  .order("created_at");
if (error) throw error;

for (const o of orders) {
  console.log(
    `\n--- ${o.billing_email} | order ${o.id.slice(0, 8)} | ${o.created_at.slice(0, 16)} | db=${o.status}/${o.payment_plan}`,
  );
  try {
    const s = await stripe.checkout.sessions.retrieve(
      o.stripe_checkout_session_id,
      {
        expand: ["total_details.breakdown", "payment_intent"],
      },
    );
    console.log(
      `    status=${s.status} payment_status=${s.payment_status} amount_total=${s.amount_total} discount=${s.total_details?.amount_discount}`,
    );
    console.log(
      `    created=${new Date(s.created * 1000).toISOString().slice(0, 16)} expires=${new Date(s.expires_at * 1000).toISOString().slice(0, 16)}`,
    );
    const disc = s.total_details?.breakdown?.discounts ?? [];
    for (const d of disc)
      console.log(
        `    discount: ${d.discount?.promotion_code ?? d.discount?.coupon?.id} amount=${d.amount}`,
      );
    if (s.payment_intent)
      console.log(
        `    pi=${s.payment_intent.id} status=${s.payment_intent.status} amount=${s.payment_intent.amount}`,
      );
  } catch (err) {
    console.log(`    !! ${err.message}`);
  }
}
