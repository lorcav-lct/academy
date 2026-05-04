import type Stripe from "stripe";
import { getStripe } from "./client";

interface CreateCheckoutParams {
  priceId: string;
  customerEmail: string;
  orderId: string;
  packId: string;
  workshopIds: string[];
  masterclassIds?: string[];
  /** If present, applies this promotion_code (`promo_...`) and disables the
   *  Stripe-hosted promo field. If absent, the Stripe page shows the code
   *  field as fallback. */
  promotionCodeId?: string | null;
}

export async function createCheckoutSession(params: CreateCheckoutParams) {
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    customer_email: params.customerEmail,
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    automatic_tax: { enabled: true },
    tax_id_collection: { enabled: true },
    locale: "it",
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/conferma?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pack`,
    metadata: {
      order_id: params.orderId,
      pack_id: params.packId,
      workshop_ids: JSON.stringify(params.workshopIds),
      masterclass_ids: JSON.stringify(params.masterclassIds ?? []),
      promotion_code: params.promotionCodeId ?? "",
    },
  };

  // `discounts` and `allow_promotion_codes` are mutually exclusive on Stripe.
  if (params.promotionCodeId) {
    sessionParams.discounts = [{ promotion_code: params.promotionCodeId }];
  } else {
    sessionParams.allow_promotion_codes = true;
  }

  return getStripe().checkout.sessions.create(sessionParams);
}
