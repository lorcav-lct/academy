"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/client";
import { GradientText } from "@/components/shared/gradient-text";
import {
  getCourseLabel,
  getCourseSubtitle,
  getCourseDates,
} from "@/lib/utils/account";
import {
  IconExpand,
  IconClose,
  IconCopy,
  IconCheck,
  IconCalendar,
  IconArrowRight,
  IconQR,
} from "../_components/icons";

interface Ticket {
  id: string;
  is_used: boolean;
  course_id: string | null;
  orders: { status: string } | null;
}

type Filter = "all" | "valid" | "used";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tutti" },
  { id: "valid", label: "Validi" },
  { id: "used", label: "Utilizzati" },
];

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [zoom, setZoom] = useState<Ticket | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("tickets")
        .select("id, is_used, course_id, orders(status)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        const list = (data as unknown as Ticket[]).filter(
          (t) => t.orders?.status === "paid",
        );
        setTickets(list);

        const map: Record<string, string> = {};
        await Promise.all(
          list.map(async (t) => {
            map[t.id] = await QRCode.toDataURL(t.id, {
              width: 320,
              margin: 1,
              color: { dark: "#1a1a1a", light: "#ffffff" },
            });
          }),
        );
        setQrMap(map);
      }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    document.body.style.overflow = zoom ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [zoom]);

  const counts = useMemo(
    () => ({
      all: tickets.length,
      valid: tickets.filter((t) => !t.is_used).length,
      used: tickets.filter((t) => t.is_used).length,
    }),
    [tickets],
  );

  const filtered = useMemo(() => {
    if (filter === "valid") return tickets.filter((t) => !t.is_used);
    if (filter === "used") return tickets.filter((t) => t.is_used);
    return tickets;
  }, [tickets, filter]);

  async function copyId(id: string) {
    await navigator.clipboard?.writeText(id);
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse text-sm tracking-wider text-academy-gray-500 uppercase">
          Caricamento ticket...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="mb-2 text-[11px] font-bold tracking-[0.3em] text-academy-orange uppercase">
          Accesso ai corsi
        </p>
        <h1 className="text-3xl font-black text-academy-gray-800 md:text-4xl">
          I miei <GradientText>Ticket</GradientText>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-academy-gray-500">
          Mostra il QR code al check-in di corsi e masterclass. Tocca un ticket
          per ingrandire il codice e facilitarne la scansione.
        </p>
      </header>

      {tickets.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="-mx-[5%] overflow-x-auto px-[5%] md:mx-0 md:px-0">
            <div className="flex gap-2 pb-1">
              {FILTERS.map((f) => {
                const active = filter === f.id;
                const count = counts[f.id];
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`flex shrink-0 items-center gap-2 border px-4 py-2 text-[12px] font-bold tracking-wider uppercase transition-all ${
                      active
                        ? "border-academy-orange/40 bg-academy-orange/10 text-academy-orange"
                        : "border-black/[0.08] bg-white text-academy-gray-600 hover:text-academy-gray-800"
                    }`}
                  >
                    {f.label}
                    <span
                      className={`px-1.5 text-[10px] tabular-nums ${
                        active
                          ? "bg-academy-orange/20"
                          : "bg-black/[0.04] text-academy-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="border border-black/[0.08] bg-white p-10 text-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <p className="text-sm text-academy-gray-500">
                Nessun ticket in questa categoria.
              </p>
            </div>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((ticket) => {
                const dates = getCourseDates(ticket.course_id);
                const used = ticket.is_used;
                return (
                  <li
                    key={ticket.id}
                    className={`group relative overflow-hidden border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all ${
                      used
                        ? "border-black/[0.08] opacity-70"
                        : "border-black/[0.08] hover:border-academy-orange/40 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
                    }`}
                  >
                    <div className="border-b border-black/[0.06] p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold tracking-[0.3em] text-academy-orange uppercase">
                            Lacertosus Academy
                          </p>
                          <h3 className="mt-1 truncate text-lg font-black text-academy-gray-800">
                            {getCourseLabel(ticket.course_id)}
                          </h3>
                          {getCourseSubtitle(ticket.course_id) && (
                            <p className="mt-0.5 truncate text-[12px] text-academy-gray-500">
                              {getCourseSubtitle(ticket.course_id)}
                            </p>
                          )}
                        </div>
                        <span
                          className={`flex shrink-0 items-center gap-1.5 px-2 py-1 text-[10px] font-bold tracking-wider uppercase ${
                            used
                              ? "bg-black/[0.04] text-academy-gray-500"
                              : "bg-emerald-500/10 text-emerald-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 ${
                              used ? "bg-academy-gray-500" : "bg-emerald-500"
                            }`}
                          />
                          {used ? "Usato" : "Valido"}
                        </span>
                      </div>

                      {dates.length > 0 && (
                        <div className="mt-3 flex items-center gap-1.5 text-[12px] text-academy-gray-600">
                          <IconCalendar className="h-3.5 w-3.5 text-academy-gray-500" />
                          <span>{dates.join(" · ")}</span>
                        </div>
                      )}
                    </div>

                    {/* QR */}
                    <button
                      type="button"
                      onClick={() => !used && setZoom(ticket)}
                      disabled={used}
                      className="relative block w-full bg-white p-6 transition-all enabled:hover:bg-academy-gray-100"
                      aria-label="Ingrandisci QR"
                    >
                      {qrMap[ticket.id] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={qrMap[ticket.id]}
                          alt={`QR ${ticket.course_id}`}
                          className="mx-auto h-auto w-44"
                        />
                      ) : (
                        <div className="mx-auto flex h-44 w-44 items-center justify-center bg-gray-100 text-sm text-gray-400">
                          ...
                        </div>
                      )}
                      {!used && (
                        <span className="absolute right-3 bottom-3 flex items-center gap-1 bg-academy-dark/85 px-2 py-1 text-[10px] font-bold tracking-wider text-white uppercase opacity-0 transition-opacity group-hover:opacity-100">
                          <IconExpand className="h-3 w-3" />
                          Ingrandisci
                        </span>
                      )}
                      {used && (
                        <span className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                          <span className="border-2 border-academy-gray-500 px-3 py-1 text-xs font-bold tracking-[0.3em] text-academy-gray-600 uppercase">
                            Utilizzato
                          </span>
                        </span>
                      )}
                    </button>

                    <div className="border-t border-black/[0.06] p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold tracking-[0.25em] text-academy-gray-500 uppercase">
                            Codice ticket
                          </p>
                          <p className="truncate font-mono text-[11px] text-academy-gray-600">
                            {ticket.id}
                          </p>
                        </div>
                        <button
                          onClick={() => copyId(ticket.id)}
                          className="shrink-0 border border-black/[0.1] p-1.5 text-academy-gray-500 transition-all hover:border-academy-orange/40 hover:text-academy-orange"
                          aria-label="Copia codice"
                          title="Copia codice"
                        >
                          {copied === ticket.id ? (
                            <IconCheck className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <IconCopy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {/* QR zoom modal */}
      {zoom && qrMap[zoom.id] && (
        <div
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden border border-black/[0.08] bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] text-academy-orange uppercase">
                  Check-in
                </p>
                <p className="mt-0.5 text-sm font-bold text-academy-gray-800">
                  {getCourseLabel(zoom.course_id)}
                </p>
              </div>
              <button
                onClick={() => setZoom(null)}
                className="border border-black/[0.1] p-2 text-academy-gray-500 transition-colors hover:border-black/30 hover:text-academy-gray-800"
                aria-label="Chiudi"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-white p-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrMap[zoom.id]}
                alt="QR ingrandito"
                className="mx-auto h-auto w-full max-w-sm"
              />
            </div>

            <div className="border-t border-black/[0.06] bg-academy-gray-200/40 px-5 py-4 text-center">
              <p className="text-[11px] font-bold tracking-[0.25em] text-academy-gray-500 uppercase">
                Mostra al check-in
              </p>
              <p className="mt-1 font-mono text-[11px] break-all text-academy-gray-600">
                {zoom.id}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center border border-black/[0.08] bg-white p-12 text-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="mb-5 flex h-16 w-16 items-center justify-center bg-black/[0.04] text-academy-gray-500">
        <IconQR className="h-8 w-8" />
      </div>
      <p className="text-base font-bold text-academy-gray-800">
        Nessun ticket ancora
      </p>
      <p className="mt-1 max-w-sm text-sm text-academy-gray-500">
        Una volta completato un acquisto, qui troverai i ticket QR per accedere
        ai corsi e alle masterclass.
      </p>
      <Link
        href="/pack"
        className="mt-6 inline-flex items-center gap-1.5 bg-academy-orange px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase hover:brightness-110"
      >
        Esplora i Pack
        <IconArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
