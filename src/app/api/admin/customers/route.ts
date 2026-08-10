/**
 * Customer lookup for the admin UI.
 *
 * A manual order needs an existing account: `orders.user_id` is NOT NULL and the
 * customer must be able to see the tickets in `/account`. This returns the
 * profiles matching a free-text query so the admin picks a real user instead of
 * typing an email that may not exist.
 *
 * GET /api/admin/customers?q=<email|name>
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ customers: [] });

  // Escape the LIKE wildcards so a pasted "%" doesn't match everything.
  const pattern = `%${q.replace(/[%_]/g, "\\$&")}%`;

  const { data, error } = await createAdminClient()
    .from("profiles")
    .select("id, email, full_name, phone")
    .or(`email.ilike.${pattern},full_name.ilike.${pattern}`)
    .order("email")
    .limit(10);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ customers: data ?? [] });
}
