import { getStripe } from "./client";

interface CreateCheckoutParams {
  priceId: string;
  customerEmail: string;
  orderId: string;
  packId: string;
  workshopIds: string[];
  masterclassIds?: string[];
}

export async function createCheckoutSession(params: CreateCheckoutParams) {
  const session = await getStripe().checkout.sessions.create({
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
    },
  });

  return session;
}
