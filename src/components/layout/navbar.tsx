"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { href: "/percorso", label: "Il Percorso", num: "01" },
  { href: "/pack", label: "Pack", num: "02" },
  { href: "/workshop", label: "Workshop", num: "03" },
];

/* ─── User Avatar + Dropdown ─── */
function UserAvatar({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fullName =
    (user.user_metadata?.full_name as string) || user.email || "Studente";
  const initials = fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="group flex items-center gap-2.5"
        aria-label="Menu utente"
      >
        <div className="flex h-9 w-9 items-center justify-center border border-academy-orange/40 bg-academy-orange/10 text-xs font-black text-academy-orange transition-all duration-300 group-hover:border-academy-orange group-hover:bg-academy-orange/20">
          {initials}
        </div>
        <svg
          className={cn(
            "h-3 w-3 text-academy-gray-500 transition-transform duration-200",
            open && "rotate-180"
          )}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown */}
      <div
        className={cn(
          "absolute right-0 top-full mt-3 w-56 border border-white/8 bg-[#07071e]/95 shadow-2xl backdrop-blur-xl transition-all duration-200",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        )}
      >
        <div className="border-b border-white/5 px-4 py-3">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-academy-gray-500 uppercase">
            Area Riservata
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-academy-gray-200">
            {user.email}
          </p>
        </div>
        <div className="py-1">
          {[
            { href: "/account", label: "Il mio Profilo" },
            { href: "/account/tickets", label: "I miei Ticket" },
            { href: "/account", label: "I miei Acquisti" },
          ].map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-academy-gray-300 transition-colors hover:bg-academy-orange/10 hover:text-academy-orange"
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="border-t border-white/5 py-1">
          <button
            onClick={onLogout}
            className="w-full px-4 py-2.5 text-left text-sm text-red-400/70 transition-colors hover:bg-red-400/8 hover:text-red-400"
          >
            Esci
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Navbar ─── */
export function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const linksContainerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  /* ── Entrance animation ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: -90, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", delay: 0.15 }
      );
    });
    return () => ctx.revert();
  }, []);

  /* ── Scroll ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Auth ── */
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  /* ── Mobile open ── */
  function openMenu() {
    if (isAnimating) return;
    setIsAnimating(true);
    setMobileOpen(true);

    const overlay = overlayRef.current;
    if (!overlay) return;

    const items = overlay.querySelectorAll<HTMLElement>(".nav-overlay-item");
    gsap.set(items, { x: -50, opacity: 0 });

    gsap.timeline({ onComplete: () => setIsAnimating(false) })
      .fromTo(
        overlay,
        { clipPath: "circle(0% at 93% 4%)" },
        { clipPath: "circle(150% at 93% 4%)", duration: 0.75, ease: "expo.inOut" }
      )
      .to(
        items,
        { x: 0, opacity: 1, stagger: 0.07, duration: 0.55, ease: "expo.out" },
        "-=0.35"
      );
  }

  /* ── Mobile close ── */
  function closeMenu() {
    if (isAnimating) return;
    setIsAnimating(true);

    const overlay = overlayRef.current;
    if (!overlay) return;

    const items = overlay.querySelectorAll<HTMLElement>(".nav-overlay-item");

    gsap.timeline({
      onComplete: () => {
        setMobileOpen(false);
        setIsAnimating(false);
      },
    })
      .to(items, {
        x: -30,
        opacity: 0,
        stagger: 0.04,
        duration: 0.3,
        ease: "power2.in",
      })
      .to(
        overlay,
        { clipPath: "circle(0% at 93% 4%)", duration: 0.6, ease: "expo.inOut" },
        "-=0.1"
      );
  }

  /* ── Desktop link hover indicator ── */
  function handleLinkEnter(e: React.MouseEvent<HTMLAnchorElement>) {
    const indicator = indicatorRef.current;
    const container = linksContainerRef.current;
    if (!indicator || !container) return;

    const { left, width } = e.currentTarget.getBoundingClientRect();
    const containerLeft = container.getBoundingClientRect().left;

    gsap.to(indicator, {
      x: left - containerLeft,
      width,
      opacity: 1,
      duration: 0.28,
      ease: "power3.out",
    });
  }

  function handleLinksLeave() {
    gsap.to(indicatorRef.current, { opacity: 0, duration: 0.2 });
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <header
        ref={headerRef}
        style={{ opacity: 0 }} /* GSAP will animate this */
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-colors duration-500",
          scrolled
            ? "bg-academy-dark/88 backdrop-blur-2xl border-b border-white/5 shadow-[0_1px_60px_rgba(0,0,0,0.5)]"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-[5%] py-5 md:px-10">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3 shrink-0">
            <div className="relative flex h-10 w-10 items-center justify-center border border-academy-orange/50 bg-academy-orange/10 transition-all duration-300 group-hover:border-academy-orange group-hover:bg-academy-orange/20 group-hover:shadow-[0_0_24px_rgba(240,146,38,0.25)]">
              <span className="text-lg font-black text-academy-orange">L</span>
            </div>
            <div className="hidden sm:flex sm:flex-col leading-none">
              <span className="text-[11px] font-black tracking-[0.22em] text-academy-gray-100 uppercase">
                Lacertosus
              </span>
              <span className="text-[11px] font-light tracking-[0.22em] text-academy-orange uppercase">
                Academy
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div
            ref={linksContainerRef}
            className="relative hidden items-center gap-10 md:flex"
            onMouseLeave={handleLinksLeave}
          >
            {/* Sliding indicator */}
            <span
              ref={indicatorRef}
              className="pointer-events-none absolute -bottom-1 left-0 h-px bg-academy-orange opacity-0"
            />

            {NAV_LINKS.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={handleLinkEnter}
                  className={cn(
                    "group flex flex-col items-center pb-1 transition-colors duration-200",
                    active
                      ? "text-academy-orange"
                      : "text-academy-gray-300 hover:text-academy-orange"
                  )}
                >
                  <span
                    className={cn(
                      "mb-0.5 text-[9px] font-bold tracking-[0.3em] uppercase transition-colors",
                      active
                        ? "text-academy-orange/60"
                        : "text-academy-gray-600 group-hover:text-academy-orange/50"
                    )}
                  >
                    {link.num}
                  </span>
                  <span className="text-sm font-medium tracking-wider uppercase">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Desktop right */}
          <div className="hidden items-center gap-5 md:flex shrink-0">
            {user ? (
              <UserAvatar user={user} onLogout={handleLogout} />
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium tracking-wider text-academy-gray-400 uppercase transition-colors hover:text-academy-gray-100"
                >
                  Accedi
                </Link>
                {/* Outlined fill-in CTA */}
                <Link
                  href="/auth/register"
                  className="group relative overflow-hidden border border-academy-orange px-6 py-2.5 text-[11px] font-black tracking-[0.22em] text-academy-orange uppercase transition-colors duration-300 hover:text-academy-dark"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-academy-orange transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-x-100" />
                  <span className="relative">Iscriviti Ora</span>
                </Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            onClick={mobileOpen ? closeMenu : openMenu}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
            aria-label={mobileOpen ? "Chiudi menu" : "Apri menu"}
          >
            <span
              className={cn(
                "block h-px w-[22px] origin-center bg-academy-gray-100 transition-all duration-300",
                mobileOpen && "translate-y-[7px] rotate-45"
              )}
            />
            <span
              className={cn(
                "block h-px w-[22px] bg-academy-gray-100 transition-all duration-300",
                mobileOpen && "opacity-0 scale-x-0"
              )}
            />
            <span
              className={cn(
                "block h-px w-[22px] origin-center bg-academy-gray-100 transition-all duration-300",
                mobileOpen && "-translate-y-[7px] -rotate-45"
              )}
            />
          </button>
        </div>
      </header>

      {/* ── Mobile fullscreen overlay ── */}
      {/* Always in DOM so GSAP can animate it; hidden via clipPath */}
      <div
        ref={overlayRef}
        aria-hidden={!mobileOpen}
        className={cn(
          "fixed inset-0 z-40 bg-academy-darker md:hidden",
          !mobileOpen && "pointer-events-none"
        )}
        style={{ clipPath: "circle(0% at 93% 4%)" }}
      >
        {/* Ambient glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute right-0 top-0 h-[40vh] w-[40vw] bg-academy-orange/[0.04] blur-[100px]" />
          <div className="absolute left-0 bottom-0 h-[30vh] w-[30vw] bg-academy-orange/[0.02] blur-[120px]" />
        </div>

        {/* Corner bracket decoration */}
        <div className="absolute left-8 top-8 h-8 w-8 border-l border-t border-academy-orange/20" />
        <div className="absolute right-8 bottom-8 h-8 w-8 border-r border-b border-academy-orange/20" />

        {/* Content */}
        <div className="relative flex h-full flex-col justify-between px-[8%] pb-14 pt-28">
          {/* Nav links */}
          <nav className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="nav-overlay-item group flex items-baseline gap-5 border-b border-white/5 py-6"
              >
                <span className="w-8 shrink-0 text-xs font-bold tracking-[0.3em] text-academy-orange/40 uppercase">
                  {link.num}
                </span>
                <span className="text-[2.5rem] font-black leading-none tracking-tight text-academy-gray-100 uppercase transition-colors duration-200 group-hover:text-academy-orange">
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="nav-overlay-item flex flex-col gap-4">
            {user ? (
              <>
                <Link
                  href="/account"
                  onClick={closeMenu}
                  className="text-sm font-bold tracking-[0.2em] text-academy-orange uppercase"
                >
                  Area Riservata →
                </Link>
                <button
                  onClick={async () => {
                    closeMenu();
                    await handleLogout();
                  }}
                  className="text-left text-sm font-medium text-red-400/70"
                >
                  Esci
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  onClick={closeMenu}
                  className="flex items-center justify-center border border-academy-orange py-4 text-[11px] font-black tracking-[0.22em] text-academy-orange uppercase"
                >
                  Iscriviti Ora
                </Link>
                <Link
                  href="/auth/login"
                  onClick={closeMenu}
                  className="text-center text-xs font-medium tracking-widest text-academy-gray-500 uppercase"
                >
                  Hai già un account? Accedi
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
