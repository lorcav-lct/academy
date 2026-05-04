import { getStripe } from "./client";

/**
 * Trova lo Stripe Product ID a partire dallo slug (lookup via metadata.slug).
 * Tutti i product creati via setup-stripe-{packs,masterclasses}.mjs hanno
 * metadata.slug settato.
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
  return null;
}
