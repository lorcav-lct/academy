/**
 * Endpoint pubblico — promo live raggruppate per categoria.
 * Risposta: { promos: { pack?: PromoRow, masterclass?: PromoRow } }
 */
import { NextResponse } from "next/server";
import { getActivePromosByType } from "@/lib/promos/server";

export const revalidate = 60;

export async function GET() {
  const promos = await getActivePromosByType();
  return NextResponse.json({ promos });
}
