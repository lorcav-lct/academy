"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GradientText } from "@/components/shared/gradient-text";
import {
  getBundles,
  getProductBySlug,
  getMasterclassProducts,
} from "@/lib/constants/packs";
import {
  IconSearch,
  IconUser,
  IconUsers,
  IconArrowDown,
} from "../_components/icons";

// ─── Static class definitions (from content constants) ──────────────────────
const PERCORSO_KEY = "percorso";
const BUNDLES = getBundles(); // START · PRO · ELITE
const TIER_SLUGS = BUNDLES.map((b) => b.slug);
const MASTERCLASSES = getMasterclassProducts().filter(
  (p) => p.slug !== "sostieni-progetto",
);
const MASTERCLASS_SLUGS = new Set(MASTERCLASSES.map((m) => m.slug));

const tierLabel = (slug: string): string =>
  getProductBySlug(slug)?.name ?? slug.toUpperCase();

interface ClassDef {
  key: string;
  title: string;
  subtitle: string;
}

const CLASS_DEFS: ClassDef[] = [
  {
    key: PERCORSO_KEY,
    title: "Percorso Academy",
    subtitle: `Tutti i Pack · ${BUNDLES.map((b) => b.name).join(" · ")}`,
  },
  ...MASTERCLASSES.map((m) => ({
    key: m.slug,
    title: m.name,
    subtitle: m.subtitle ?? "Masterclass",
  })),
];

// ─── Data shapes ────────────────────────────────────────────────────────────
interface ProfileRef {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  fiscal_code: string | null;
}
interface TicketRow {
  user_id: string;
  course_id: string;
  is_used: boolean;
  created_at: string;
  orders: { is_test: boolean } | null;
  profiles: ProfileRef | null;
}
interface DepositRow {
  user_id: string;
  pack_id: string | null;
  selected_workshop_ids: unknown;
  is_test: boolean;
  created_at: string;
  balance_order_id: string | null;
  settled_externally: boolean | null;
  profiles: ProfileRef | null;
}

interface Member {
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  fiscalCode: string | null;
  tier: string | null;
  isDeposit: boolean;
  ticketUsed: boolean;
  joinedAt: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AdminClassiPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [deposits, setDeposits] = useState<DepositRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTest, setShowTest] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: ticketData }, { data: depositData }] = await Promise.all([
        supabase
          .from("tickets")
          .select(
            "user_id, course_id, is_used, created_at, orders(is_test), profiles(full_name, email, phone, fiscal_code)",
          ),
        supabase
          .from("orders")
          .select(
            "user_id, pack_id, selected_workshop_ids, is_test, created_at, balance_order_id, settled_externally, profiles(full_name, email, phone, fiscal_code)",
          )
          .eq("payment_plan", "deposit")
          .eq("status", "paid"),
      ]);
      if (ticketData) setTickets(ticketData as unknown as TicketRow[]);
      if (depositData) setDeposits(depositData as unknown as DepositRow[]);
      setLoading(false);
    }
    load();
  }, []);

  // Build members grouped by class key. Confirmed (ticket) members are added
  // first so they win the per-class dedupe over a still-open caparra.
  const membersByClass = useMemo(() => {
    const out: Record<string, Member[]> = {};
    const seen: Record<string, Set<string>> = {};

    const add = (key: string, m: Member) => {
      const set = (seen[key] ??= new Set());
      if (set.has(m.userId)) return;
      set.add(m.userId);
      (out[key] ??= []).push(m);
    };

    const build = (
      p: ProfileRef | null,
      userId: string,
      extra: Pick<Member, "tier" | "isDeposit" | "ticketUsed" | "joinedAt">,
    ): Member => ({
      userId,
      name: p?.full_name?.trim() || p?.email || "Utente",
      email: p?.email || "",
      phone: p?.phone ?? null,
      fiscalCode: p?.fiscal_code ?? null,
      ...extra,
    });

    for (const t of tickets) {
      if (!showTest && t.orders?.is_test) continue;
      const slug = t.course_id;
      if (TIER_SLUGS.includes(slug)) {
        add(
          PERCORSO_KEY,
          build(t.profiles, t.user_id, {
            tier: tierLabel(slug),
            isDeposit: false,
            ticketUsed: t.is_used,
            joinedAt: t.created_at,
          }),
        );
      } else if (MASTERCLASS_SLUGS.has(slug)) {
        add(
          slug,
          build(t.profiles, t.user_id, {
            tier: null,
            isDeposit: false,
            ticketUsed: t.is_used,
            joinedAt: t.created_at,
          }),
        );
      }
    }

    for (const d of deposits) {
      if (!showTest && d.is_test) continue;
      if (d.balance_order_id || d.settled_externally) continue; // already ticketed
      if (d.pack_id && TIER_SLUGS.includes(d.pack_id)) {
        add(
          PERCORSO_KEY,
          build(d.profiles, d.user_id, {
            tier: tierLabel(d.pack_id),
            isDeposit: true,
            ticketUsed: false,
            joinedAt: d.created_at,
          }),
        );
      }
      const sel = Array.isArray(d.selected_workshop_ids)
        ? (d.selected_workshop_ids as unknown[]).filter(
            (s): s is string => typeof s === "string",
          )
        : [];
      for (const slug of sel) {
        if (!MASTERCLASS_SLUGS.has(slug)) continue;
        add(
          slug,
          build(d.profiles, d.user_id, {
            tier: null,
            isDeposit: true,
            ticketUsed: false,
            joinedAt: d.created_at,
          }),
        );
      }
    }

    for (const key of Object.keys(out)) {
      out[key].sort((a, b) => a.name.localeCompare(b.name, "it"));
    }
    return out;
  }, [tickets, deposits, showTest]);

  const q = search.trim().toLowerCase();
  const filterMembers = (members: Member[]) =>
    q
      ? members.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            (m.fiscalCode?.toLowerCase().includes(q) ?? false),
        )
      : members;

  const totalMembers = useMemo(() => {
    const ids = new Set<string>();
    Object.values(membersByClass).forEach((list) =>
      list.forEach((m) => ids.add(m.userId)),
    );
    return ids.size;
  }, [membersByClass]);

  function toggle(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-bold tracking-[0.3em] text-academy-orange uppercase">
            Gestione
          </p>
          <h1 className="text-3xl font-black text-academy-gray-800 md:text-4xl">
            <GradientText>Classi</GradientText>
          </h1>
          <p className="mt-2 text-sm text-academy-gray-500">
            {CLASS_DEFS.length} classi · {totalMembers} iscritti{" "}
            {showTest ? "(test inclusi)" : "live"}
          </p>
        </div>
        <button
          onClick={() => setShowTest((v) => !v)}
          className={`flex items-center gap-2 border px-4 py-2.5 text-[12px] font-bold tracking-wider uppercase transition-colors ${
            showTest
              ? "border-amber-500/40 bg-amber-500/10 text-amber-700"
              : "border-black/[0.08] bg-white text-academy-gray-600 hover:text-academy-gray-800"
          }`}
          title={
            showTest
              ? "Nascondi iscritti da ordini test"
              : "Mostra anche iscritti da ordini test"
          }
        >
          {showTest ? "Test ON" : "Test OFF"}
        </button>
      </header>

      <div className="relative">
        <IconSearch className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-academy-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca un iscritto per nome, email o codice fiscale..."
          className="w-full border border-black/[0.08] bg-white py-2.5 pr-3 pl-10 text-sm text-academy-gray-800 placeholder-academy-gray-400 outline-none transition-colors focus:border-academy-orange/50"
        />
      </div>

      {loading ? (
        <div className="border border-black/[0.08] bg-white p-12 text-center text-sm text-academy-gray-500 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          Caricamento...
        </div>
      ) : (
        <ul className="space-y-3">
          {CLASS_DEFS.map((cls) => {
            const all = membersByClass[cls.key] ?? [];
            const members = filterMembers(all);
            const depositCount = members.filter((m) => m.isDeposit).length;
            const open =
              expanded.has(cls.key) || (q.length > 0 && members.length > 0);
            const isPercorso = cls.key === PERCORSO_KEY;

            return (
              <li
                key={cls.key}
                className={`border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${
                  isPercorso
                    ? "border-academy-orange/30"
                    : "border-black/[0.08]"
                }`}
              >
                <button
                  onClick={() => toggle(cls.key)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-black/[0.015]"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center ${
                      isPercorso
                        ? "bg-academy-orange/15 text-academy-orange"
                        : "bg-black/[0.04] text-academy-gray-500"
                    }`}
                  >
                    <IconUsers className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-academy-gray-800">
                      {cls.title}
                    </p>
                    <p className="truncate text-[12px] text-academy-gray-500">
                      {cls.subtitle}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {depositCount > 0 && (
                      <span className="inline-flex items-center gap-1 bg-academy-orange/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-academy-orange uppercase">
                        ◆ {depositCount} caparra
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 bg-black/[0.04] px-2.5 py-1 text-[12px] font-bold text-academy-gray-700 tabular-nums">
                      {members.length}
                      <IconUser className="h-3.5 w-3.5 text-academy-gray-500" />
                    </span>
                    <IconArrowDown
                      className={`h-4 w-4 text-academy-gray-400 transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {open && (
                  <div className="border-t border-black/[0.06]">
                    {members.length === 0 ? (
                      <p className="px-5 py-6 text-center text-[13px] text-academy-gray-400">
                        Nessun iscritto{q ? " corrisponde alla ricerca" : ""}.
                      </p>
                    ) : (
                      <ul className="divide-y divide-black/[0.04]">
                        {members.map((m) => (
                          <li
                            key={`${cls.key}-${m.userId}`}
                            className="flex items-start gap-3 px-5 py-3"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-academy-gray-800/[0.06] text-[11px] font-bold tracking-wider text-academy-gray-700">
                              {initials(m.name) || (
                                <IconUser className="h-4 w-4" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <p className="font-bold text-academy-gray-800">
                                  {m.name}
                                </p>
                                {isPercorso && m.tier && (
                                  <span className="bg-academy-gray-800 px-1.5 py-px text-[9px] font-bold tracking-wider text-white uppercase">
                                    {m.tier}
                                  </span>
                                )}
                                {m.isDeposit && (
                                  <span className="inline-flex items-center gap-1 bg-academy-orange/10 px-1.5 py-px text-[9px] font-bold tracking-wider text-academy-orange uppercase">
                                    ◆ Caparra
                                  </span>
                                )}
                                {m.ticketUsed && (
                                  <span className="bg-black/[0.05] px-1.5 py-px text-[9px] font-bold tracking-wider text-academy-gray-500 uppercase">
                                    Ticket usato
                                  </span>
                                )}
                              </div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[12px] text-academy-gray-500">
                                {m.email && <span>{m.email}</span>}
                                {m.phone && (
                                  <span className="tabular-nums">
                                    {m.phone}
                                  </span>
                                )}
                                {m.fiscalCode && (
                                  <span className="font-mono uppercase">
                                    {m.fiscalCode}
                                  </span>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
