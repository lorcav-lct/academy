import { Suspense } from "react";
import { CheckoutContent } from "./checkout-content";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center pt-24 text-academy-gray-400">Caricamento...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
