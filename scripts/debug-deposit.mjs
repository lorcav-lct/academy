/**
 * Read-only diagnostic for a customer's deposit (caparra) order.
 * Usage: node scripts/debug-deposit.mjs <email>
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

const email = process.argv[2];
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const { data: profiles, error: pErr } = await supabase
  .from("profiles")
  .select("*")
  .ilike("email", email);
console.log("PROFILES:", pErr ?? JSON.stringify(profiles, null, 2));

const ids = (profiles ?? []).map((p) => p.id);
let orders = [];
if (ids.length) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .in("user_id", ids)
    .order("created_at", { ascending: true });
  if (error) console.log("ORDERS ERR:", error);
  orders = data ?? [];
}
const { data: byEmail } = await supabase
  .from("orders")
  .select("*")
  .ilike("billing_email", email)
  .order("created_at", { ascending: true });
const all = [...orders, ...(byEmail ?? [])].filter(
  (o, i, a) => a.findIndex((x) => x.id === o.id) === i,
);
console.log("ORDERS:", JSON.stringify(all, null, 2));

const { data: tickets } = await supabase
  .from("tickets")
  .select("*")
  .in(
    "order_id",
    all.map((o) => o.id).length
      ? all.map((o) => o.id)
      : ["00000000-0000-0000-0000-000000000000"],
  );
console.log("TICKETS:", JSON.stringify(tickets, null, 2));

const { data: settings } = await supabase.from("site_settings").select("*");
console.log("SETTINGS:", JSON.stringify(settings, null, 2));
