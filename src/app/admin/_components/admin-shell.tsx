"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  IconHome,
  IconBag,
  IconScan,
  IconLayout,
  IconLogout,
  IconUser,
  IconExternal,
} from "./icons";

interface NavItem {
  href: string;
  label: string;
  Icon: (p: { className?: string }) => React.ReactElement;
  match: (path: string) => boolean;
}

const NAV: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    Icon: IconHome,
    match: (p) => p === "/admin",
  },
  {
    href: "/admin/orders",
    label: "Ordini",
    Icon: IconBag,
    match: (p) => p.startsWith("/admin/orders"),
  },
  {
    href: "/admin/scanner",
    label: "Scanner",
    Icon: IconScan,
    match: (p) => p.startsWith("/admin/scanner"),
  },
  {
    href: "/admin/contenuti",
    label: "Contenuti",
    Icon: IconLayout,
    match: (p) =>
      p.startsWith("/admin/contenuti") || p.startsWith("/admin/hero"),
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setEmail(user.email || "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();
      setName(
        profile?.full_name ||
          (user.user_metadata?.full_name as string) ||
          user.email?.split("@")[0] ||
          "Admin",
      );
      setRole(profile?.role || "admin");
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initials = name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-20 pb-24 lg:pt-24 lg:pb-0">
      {/* ─── Mobile sticky header ─── */}
      <div className="sticky top-20 z-30 -mt-px flex items-center justify-between gap-3 border-y border-black/[0.06] bg-white/95 px-[5%] py-3 backdrop-blur-md lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-academy-orange/15 text-[12px] font-bold tracking-wider text-academy-orange">
            {initials || <IconUser className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[13px] font-bold text-academy-gray-800 leading-tight">
                {name || "Caricamento..."}
              </p>
              {role && (
                <span className="shrink-0 bg-academy-orange/15 px-1.5 py-px text-[9px] font-bold tracking-wider text-academy-orange uppercase">
                  {role}
                </span>
              )}
            </div>
            <p className="truncate text-[11px] text-academy-gray-500 leading-tight">
              {email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex shrink-0 items-center gap-1.5 border border-black/[0.08] bg-white px-3 py-2 text-[10px] font-bold tracking-wider text-academy-gray-600 uppercase transition-colors active:bg-black/[0.04]"
          aria-label="Esci"
        >
          <IconLogout className="h-3.5 w-3.5" />
          Esci
        </button>
      </div>

      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-[5%] py-6 md:px-10 lg:flex-row lg:gap-10 lg:py-12">
        {/* ─── Desktop sidebar ─── */}
        <aside className="hidden lg:sticky lg:top-28 lg:block lg:h-[calc(100vh-8rem)] lg:w-72 lg:shrink-0">
          <div className="flex items-center gap-3 border border-black/[0.08] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-academy-orange/15 text-sm font-bold tracking-wider text-academy-orange">
              {initials || <IconUser className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-bold text-academy-gray-800">
                  {name || "Caricamento..."}
                </p>
                {role && (
                  <span className="shrink-0 bg-academy-orange/15 px-1.5 py-px text-[9px] font-bold tracking-wider text-academy-orange uppercase">
                    {role}
                  </span>
                )}
              </div>
              <p className="truncate text-[12px] text-academy-gray-500">
                {email}
              </p>
            </div>
          </div>

          <nav className="mt-3">
            <p className="mb-2 px-1 text-[10px] font-bold tracking-[0.25em] text-academy-gray-500 uppercase">
              Gestione
            </p>
            <ul className="space-y-1">
              {NAV.map((item) => {
                const active = item.match(pathname);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 border px-4 py-3 text-sm font-semibold transition-all",
                        active
                          ? "border-academy-orange/30 bg-academy-orange/10 text-academy-orange"
                          : "border-transparent text-academy-gray-600 hover:border-black/[0.06] hover:bg-white hover:text-academy-gray-800",
                      )}
                    >
                      <item.Icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0",
                          active
                            ? "text-academy-orange"
                            : "text-academy-gray-500 group-hover:text-academy-gray-700",
                        )}
                      />
                      <span>{item.label}</span>
                      {active && (
                        <span className="ml-auto h-1.5 w-1.5 bg-academy-orange" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="my-4 h-px bg-black/[0.06]" />

            <Link
              href="/"
              className="group flex w-full items-center gap-3 border border-transparent px-4 py-3 text-sm font-semibold text-academy-gray-500 transition-all hover:border-black/[0.06] hover:bg-white hover:text-academy-gray-800"
            >
              <IconExternal className="h-[18px] w-[18px] shrink-0" />
              <span>Vai al sito</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 border border-transparent px-4 py-3 text-sm font-semibold text-academy-gray-500 transition-all hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-600"
            >
              <IconLogout className="h-[18px] w-[18px] shrink-0" />
              <span>Esci</span>
            </button>
          </nav>
        </aside>

        {/* ─── Content ─── */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>

      {/* ─── Mobile bottom tab bar ─── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.08] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md shadow-[0_-2px_20px_rgba(0,0,0,0.06)] lg:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-4">
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold tracking-wider uppercase transition-colors",
                    active
                      ? "text-academy-orange"
                      : "text-academy-gray-500 active:text-academy-gray-800",
                  )}
                >
                  {active && (
                    <span className="absolute top-0 left-1/2 h-0.5 w-10 -translate-x-1/2 bg-academy-orange" />
                  )}
                  <item.Icon
                    className={cn(
                      "h-5 w-5 transition-transform",
                      active && "scale-110",
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
