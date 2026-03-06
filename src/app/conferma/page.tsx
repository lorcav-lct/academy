import { Suspense } from "react";
import { ConfermaContent } from "./conferma-content";

export default function ConfermaPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center pt-24 text-academy-gray-400">Caricamento...</div>}>
      <ConfermaContent />
    </Suspense>
  );
}
