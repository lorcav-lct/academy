/**
 * Endpoint pubblico — lista delle promo live (per visualizzazione sito).
 * Ritorna mappa { slug: PromoRow } solo per le promo attualmente live.
 *
 * Cache: 60s lato Next.js (ISR). Le modifiche admin si propagano in <1 minuto.
 */
import { NextResponse } from "next/server";
import { getActivePromosMap } from "@/lib/promos/server";

export const revalidate = 60;

export async function GET() {
  const promos = await getActivePromosMap();
  return NextResponse.json({ promos });
}
