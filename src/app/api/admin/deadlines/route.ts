/**
 * Admin management of the pack/caparra deadlines (stored in site_settings).
 * GET   → current deadlines + caller role
 * PATCH → upsert the three ISO dates (admin only)
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEADLINE_KEYS, getDeadlines } from "@/lib/settings/deadlines";

async function requireStaff() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autenticato", status: 401 as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return { error: "Non autorizzato", status: 403 as const };
  }
  return { role: profile.role as string };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  return !Number.isNaN(new Date(`${value}T12:00:00`).getTime());
}

export async function GET() {
  const auth = await requireStaff();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const deadlines = await getDeadlines(createAdminClient());
  return NextResponse.json({ deadlines, role: auth.role });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireStaff();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (auth.role !== "admin") {
    return NextResponse.json({ error: "Solo admin" }, { status: 403 });
  }

  const body = await request.json();
  const fields: { key: string; value: unknown }[] = [
    { key: DEADLINE_KEYS.depositPurchase, value: body?.depositPurchase },
    { key: DEADLINE_KEYS.depositBalance, value: body?.depositBalance },
    { key: DEADLINE_KEYS.packPurchase, value: body?.packPurchase },
  ];

  for (const f of fields) {
    if (!isValidDate(f.value)) {
      return NextResponse.json(
        { error: `Data non valida per ${f.key} (formato YYYY-MM-DD)` },
        { status: 400 },
      );
    }
  }

  const admin = createAdminClient();
  const rows = fields.map((f) => ({
    key: f.key,
    value: f.value as string,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await admin
    .from("site_settings")
    .upsert(rows, { onConflict: "key" });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const deadlines = await getDeadlines(admin);
  return NextResponse.json({ deadlines });
}
