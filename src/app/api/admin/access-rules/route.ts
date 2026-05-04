import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRODUCTS } from "@/lib/constants/packs";

type ProductAccessRule = {
  product_slug: string;
  product_type: "bundle" | "workshop";
  label: string;
  max_entries: number | null;
  active: boolean;
  updated_at: string;
};

const ACCESS_PRODUCTS = PRODUCTS.filter(
  (p) => p.type === "bundle" || p.type === "workshop",
);

function defaultEntriesForProduct(type: string): number {
  return type === "bundle" ? 6 : 1;
}

function normalizeMaxEntries(value: unknown): number | null | "invalid" {
  if (value === null || value === "") return null;
  if (typeof value !== "number") return "invalid";
  const normalized = Math.trunc(value);
  if (!Number.isFinite(normalized) || normalized <= 0) return "invalid";
  return normalized;
}

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

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("product_access_rules")
    .select("*")
    .order("product_type", { ascending: true })
    .order("label", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const bySlug = new Map(
    ((data ?? []) as unknown as ProductAccessRule[]).map((rule) => [
      rule.product_slug,
      rule,
    ]),
  );

  const rules = ACCESS_PRODUCTS.map((product) => {
    const existing = bySlug.get(product.slug);
    return (
      existing ?? {
        product_slug: product.slug,
        product_type: product.type as "bundle" | "workshop",
        label: product.name,
        max_entries: defaultEntriesForProduct(product.type),
        active: true,
        updated_at: new Date(0).toISOString(),
      }
    );
  });

  return NextResponse.json({ rules, role: auth.role });
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
  const { updates } = body ?? {};

  if (Array.isArray(updates)) {
    const rows = [];
    for (const item of updates) {
      const productSlug = item?.product_slug;
      if (typeof productSlug !== "string" || !productSlug.trim()) {
        return NextResponse.json(
          { error: "product_slug richiesto" },
          { status: 400 },
        );
      }

      const product = ACCESS_PRODUCTS.find((p) => p.slug === productSlug);
      if (!product) {
        return NextResponse.json(
          { error: `Prodotto non valido: ${productSlug}` },
          { status: 400 },
        );
      }

      const normalizedMax = normalizeMaxEntries(item.max_entries);
      if (normalizedMax === "invalid") {
        return NextResponse.json(
          { error: "Ingressi deve essere un numero positivo o illimitato" },
          { status: 400 },
        );
      }

      rows.push({
        product_slug: product.slug,
        product_type: product.type,
        label: product.name,
        max_entries: normalizedMax,
        active: item.active !== false,
        updated_at: new Date().toISOString(),
      });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("product_access_rules")
      .upsert(rows, { onConflict: "product_slug" })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rules: data });
  }

  const { product_slug, max_entries, active } = body ?? {};

  if (typeof product_slug !== "string" || !product_slug.trim()) {
    return NextResponse.json({ error: "product_slug richiesto" }, { status: 400 });
  }

  const product = ACCESS_PRODUCTS.find((p) => p.slug === product_slug);
  if (!product) {
    return NextResponse.json({ error: "Prodotto non valido" }, { status: 400 });
  }

  const normalizedMax = normalizeMaxEntries(max_entries);
  if (normalizedMax === "invalid") {
    return NextResponse.json(
      { error: "Ingressi deve essere un numero positivo o illimitato" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("product_access_rules")
    .upsert(
      {
        product_slug: product.slug,
        product_type: product.type,
        label: product.name,
        max_entries: normalizedMax,
        active: active !== false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "product_slug" },
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rule: data });
}
