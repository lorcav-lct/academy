"use client";

import { useEffect, useState } from "react";

/**
 * Countdown fino alla scadenza di una promo (`ends_at`).
 * Ritorna null se la data non è impostata o è già passata — così sparisce
 * da solo quando la promo scade. Parte "vuoto" in SSR per evitare hydration
 * mismatch, poi si popola lato client.
 */
export function PromoCountdown({
  endsAt,
  color,
  mutedColor,
  className,
}: {
  endsAt: string | null | undefined;
  color: string;
  mutedColor?: string;
  className?: string;
}) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!endsAt) return;
    const target = new Date(endsAt).getTime();
    if (Number.isNaN(target)) return;
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (remaining === null || remaining <= 0) return null;

  const totalSec = Math.floor(remaining / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  const segments = [
    ...(days > 0 ? [{ v: days, u: "g" }] : []),
    { v: hours, u: "h" },
    { v: mins, u: "m" },
    { v: secs, u: "s" },
  ];

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <span
        className="text-[0.55rem] font-black uppercase tracking-[0.2em]"
        style={{ color: mutedColor ?? color }}
      >
        Termina in
      </span>
      <div
        className="flex items-center gap-1 font-black tabular-nums"
        style={{ color }}
      >
        {segments.map((s, i) => (
          <span key={s.u} className="flex items-baseline">
            {i > 0 && (
              <span className="mx-0.5 opacity-40" aria-hidden>
                :
              </span>
            )}
            <span className="text-[0.9rem]">{pad(s.v)}</span>
            <span className="ml-0.5 text-[0.55rem] opacity-70">{s.u}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
