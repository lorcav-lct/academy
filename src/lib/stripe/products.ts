import { getStripe } from "./client";
import { getProductBySlug, resolveStripePriceId } from "@/lib/constants/packs";

/**
 * Trova lo Stripe Product ID a partire dallo slug.
 *
 * 1. Lookup primario via `metadata.slug` (product creati via
 *    setup-stripe-{packs,masterclasses}.mjs lo settano).
 * 2. Fallback: risolve il Price ID da `PRODUCTS` (packs.ts) e recupera
 *    `price.product`. Necessario per prodotti creati manualmente in Dashboard
 *    (es. `sostieni-progetto`) che non hanno `metadata.slug` settato.
 *    Quando il fallback va a segno, fa backfill di `metadata.slug` sul product
 *    Stripe così le lookup successive usano il path veloce.
 */
export async function findStripeProductBySlug(
  slug: string,
): Promise<string | null> {
  const stripe = getStripe();

  for await (const product of stripe.products.list({
    active: true,
    limit: 100,
  })) {
    if (product.metadata?.slug === slug) return product.id;
  }

  const product = getProductBySlug(slug);
  if (!product) return null;
  const priceId = resolveStripePriceId(product);
  if (!priceId) return null;

  try {
    const price = await stripe.prices.retrieve(priceId);
    const productId =
      typeof price.product === "string" ? price.product : price.product.id;
    if (!productId) return null;

    stripe.products.update(productId, { metadata: { slug } }).catch(() => {
      // best-effort: se l'update fallisce, la prossima call rifarà il fallback
    });

    return productId;
  } catch {
    return null;
  }
}
