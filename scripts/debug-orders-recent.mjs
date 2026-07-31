/**
 * Read-only: recent orders overview (session created? paid?) to spot a global
 * checkout breakage vs a single-customer issue.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

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

const since = process.argv[2] ?? "2026-07-20";
const { data, error } = await supabase
  .from("orders")
  .select(
    "id, created_at, billing_email, pack_id, status, payment_plan, amount_cents, stripe_checkout_session_id, deposit_promotion_code_id, balance_order_id, is_test",
  )
  .gte("created_at", since)
  .order("created_at", { ascending: true });
if (error) throw error;

for (const o of data) {
  console.log(
    [
      o.created_at.slice(0, 16),
      o.is_test ? "TEST" : "LIVE",
      o.status.padEnd(9),
      o.payment_plan?.padEnd(7),
      o.pack_id?.padEnd(28),
      (o.amount_cents / 100).toFixed(0).padStart(5),
      o.stripe_checkout_session_id ? "session:OK " : "session:NULL",
      o.billing_email,
    ].join(" | "),
  );
}
console.log("total:", data.length);
