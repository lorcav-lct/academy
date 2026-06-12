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
  /** `deposit` = caparra da 500€: usa il price caparra, niente sconti e niente
   *  `pack_id` nei metadata (così il webhook NON genera ticket). Default `full`. */
  paymentPlan?: "full" | "deposit";
  /** Su una sessione di SALDO: id dell'ordine caparra da chiudere al pagamento. */
  depositOrderId?: string | null;
}

export async function createCheckoutSession(params: CreateCheckoutParams) {
  const isDeposit = params.paymentPlan === "deposit";

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
      // On a deposit session pack_id is intentionally empty so the webhook does
      // not issue tickets; the linked bundle lives in deposit_pack_id instead.
      pack_id: isDeposit ? "" : params.packId,
      deposit_pack_id: isDeposit ? params.packId : "",
      payment_plan: isDeposit ? "deposit" : "full",
      deposit_order_id: params.depositOrderId ?? "",
      // A deposit session carries NO ticketable slugs: this makes it impossible
      // for the webhook to ever issue tickets for a caparra, regardless of the
      // payment_plan gate. The masterclass selection is persisted on the deposit
      // order itself (by the checkout route) for the later balance flow.
      workshop_ids: JSON.stringify(isDeposit ? [] : params.workshopIds),
      masterclass_ids: JSON.stringify(
        isDeposit ? [] : (params.masterclassIds ?? []),
      ),
      promotion_code: params.promotionCodeId ?? "",
      coupon: params.couponId ?? "",
    },
  };

  // No discounts on the caparra itself.
  if (isDeposit) {
    return getStripe().checkout.sessions.create(sessionParams);
  }

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
