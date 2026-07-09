/**
 * Admin API — gestione visibilità + modalità sconti masterclass (site_settings).
 * GET   → visibility map corrente + salesMode + ruolo chiamante
 * PATCH → aggiorna { visibility?: { slug: boolean }, salesMode?: boolean } (admin only)
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getMasterclassVisibility,
  setMasterclassVisibility,
  type MasterclassVisibilityMap,
} from "@/lib/settings/masterclass-visibility";
import {
  getMasterclassSalesMode,
  setMasterclassSalesMode,
} from "@/lib/settings/sales-mode";

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

export async function GET() {
  const auth = await requireStaff();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const admin = createAdminClient();
  const [visibility, salesMode] = await Promise.all([
    getMasterclassVisibility(admin),
    getMasterclassSalesMode(admin),
  ]);
  return NextResponse.json({ visibility, salesMode, role: auth.role });
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
  const hasVisibility = body?.visibility !== undefined;
  const hasSalesMode = body?.salesMode !== undefined;

  if (!hasVisibility && !hasSalesMode) {
    return NextResponse.json(
      { error: "Nessun campo da aggiornare ('visibility' o 'salesMode')" },
      { status: 400 },
    );
  }
  if (
    hasVisibility &&
    (typeof body.visibility !== "object" || Array.isArray(body.visibility))
  ) {
    return NextResponse.json(
      { error: "Campo 'visibility' deve essere un oggetto { slug: boolean }" },
      { status: 400 },
    );
  }
  if (hasSalesMode && typeof body.salesMode !== "boolean") {
    return NextResponse.json(
      { error: "Campo 'salesMode' deve essere un boolean" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  if (hasVisibility) {
    const visibility: MasterclassVisibilityMap = {};
    for (const [k, v] of Object.entries(body.visibility)) {
      if (typeof v === "boolean") visibility[k] = v;
    }
    const result = await setMasterclassVisibility(admin, visibility);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  }

  if (hasSalesMode) {
    const result = await setMasterclassSalesMode(admin, body.salesMode);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  }

  const [updated, salesMode] = await Promise.all([
    getMasterclassVisibility(admin),
    getMasterclassSalesMode(admin),
  ]);
  return NextResponse.json({ visibility: updated, salesMode });
}
