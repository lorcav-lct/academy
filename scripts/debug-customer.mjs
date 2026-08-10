/**
 * Read-only compact diagnostic for a customer: profile, orders, tickets.
 * Usage: node scripts/debug-customer.mjs <email> [<email>...]
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

for (const email of process.argv.slice(2)) {
  console.log("\n=== " + email + " ===");
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, role")
    .ilike("email", email);
  console.log("PROFILE:", JSON.stringify(profiles));

  const ids = (profiles ?? []).map((p) => p.id);
  const { data: byUser } = ids.length
    ? await supabase.from("orders").select("*").in("user_id", ids)
    : { data: [] };
  const { data: byEmail } = await supabase
    .from("orders")
    .select("*")
    .ilike("billing_email", email);
  const all = [...(byUser ?? []), ...(byEmail ?? [])]
    .filter((o, i, a) => a.findIndex((x) => x.id === o.id) === i)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  for (const o of all) {
    console.log(
      JSON.stringify({
        id: o.id,
        created: o.created_at,
        status: o.status,
        plan: o.payment_plan,
        pack: o.pack_id,
        addons: o.selected_workshop_ids,
        amount: o.amount_cents,
        agreed: o.agreed_total_cents,
        balanceDiscount: o.balance_discount_cents,
        commercialCode: o.commercial_promo_code,
        externalCents: o.external_payment_cents,
        externalMethod: o.external_payment_method,
        settledExt: o.settled_externally,
        fulfilled: o.fulfilled_at,
        balanceOrder: o.balance_order_id,
        isTest: o.is_test,
        session: o.stripe_checkout_session_id,
        pi: o.stripe_payment_intent_id,
      }),
    );
  }

  const orderIds = all.map((o) => o.id);
  if (orderIds.length) {
    const { data: tickets } = await supabase
      .from("tickets")
      .select("id, order_id, course_id, is_used, created_at")
      .in("order_id", orderIds);
    console.log("TICKETS:", JSON.stringify(tickets));
  }
}
