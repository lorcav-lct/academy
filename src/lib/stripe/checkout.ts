import type Stripe from "stripe";
import { getStripe } from "./client";

interface CreateCheckoutParams {
  priceId: string;
  customerEmail: string;
  orderId: string;
  packId: string;
  workshopIds: string[];
  masterclassIds?: string[];
  /** Promotion code id (`promo_...`) — sconto user-entered. */
  promotionCodeId?: string | null;
  /** Coupon id auto-applicato (es. promo di lancio). Ha precedenza su
   *  `promotionCodeId` perché Stripe non permette stacking di sconti. */
  couponId?: string | null;
  /** Path relativo a `NEXT_PUBLIC_BASE_URL` per il redirect di cancellazione.
   *  Default: `/pack`. Usato per prodotti hidden che non vivono lì. */
  cancelPath?: string;
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
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}${params.cancelPath ?? "/pack"}`,
    metadata: {
      order_id: params.orderId,
      pack_id: params.packId,
      workshop_ids: JSON.stringify(params.workshopIds),
      masterclass_ids: JSON.stringify(params.masterclassIds ?? []),
      promotion_code: params.promotionCodeId ?? "",
      coupon: params.couponId ?? "",
    },
  };

  // `discounts` and `allow_promotion_codes` are mutually exclusive on Stripe.
  // Priorità: coupon auto-applicato > promotion code utente > campo Stripe nativo.
  if (params.couponId) {
    sessionParams.discounts = [{ coupon: params.couponId }];
  } else if (params.promotionCodeId) {
    sessionParams.discounts = [{ promotion_code: params.promotionCodeId }];
  } else {
    sessionParams.allow_promotion_codes = true;
  }

  return getStripe().checkout.sessions.create(sessionParams);
}
