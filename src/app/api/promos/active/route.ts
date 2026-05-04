/**
 * Endpoint pubblico — promo live raggruppate.
 * Risposta: {
 *   promos: {
 *     byType:  { pack?: PromoRow, masterclass?: PromoRow },
 *     bySlug:  { [slug]: PromoRow }
 *   }
 * }
 */
import { NextResponse } from "next/server";
import { getActivePromosBundle } from "@/lib/promos/server";

export const revalidate = 60;

export async function GET() {
  const promos = await getActivePromosBundle();
  return NextResponse.json({ promos });
}
