"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/providers/theme-provider";
import { Logo } from "@/components/layout/logo";
import {
  IconHome,
  IconBag,
  IconTicket,
  IconLogout,
} from "@/app/account/_components/icons";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { href: "/percorso", label: "Il Percorso", num: "01" },
  { href: "/pack", label: "Pack", num: "02" },
  { href: "/masterclass", label: "Masterclass", num: "03" },
  { href: "/docenti", label: "Docenti", num: "04" },
];

/* ─── User Avatar + Dropdown ─── */
function UserAvatar({
  user,
  onLogout,
  isDark,
}: {
  user: User;
  onLogout: () => void;
  isDark: boolean;
}) {
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

  const menuItems = [
    { href: "/account", label: "Dashboard", Icon: IconHome },
    { href: "/account/orders", label: "Ordini", Icon: IconBag },
    { href: "/account/tickets", label: "Ticket", Icon: IconTicket },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="group flex items-center gap-2.5"
        aria-label="Menu utente"
      >
        <div className="flex h-[42px] w-[42px] items-center justify-center bg-academy-orange/15 text-xs font-bold tracking-wider text-academy-orange transition-all duration-300 group-hover:bg-academy-orange/25">
          {initials}
        </div>
        <svg
          className={cn(
            "h-3 w-3 transition-transform duration-200",
            isDark ? "text-academy-gray-300" : "text-academy-gray-500",
            open && "rotate-180",
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
          "absolute right-0 top-full mt-3 w-64 shadow-[0_10px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-all duration-200",
          isDark
            ? "border border-white/[0.08] bg-academy-dark/95"
            : "border border-black/[0.08] bg-white/97",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        {/* Header con avatar */}
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3.5",
            isDark
              ? "border-b border-white/[0.06]"
              : "border-b border-black/[0.06]",
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-academy-orange/15 text-[12px] font-bold tracking-wider text-academy-orange">
            {initials}
          </div>
          <div className="min-w-0">
            <p
              className={cn(
                "truncate text-[13px] font-bold leading-tight",
                isDark ? "text-academy-gray-100" : "text-academy-gray-800",
              )}
            >
              {fullName}
            </p>
            <p
              className={cn(
                "mt-0.5 truncate text-[11px] leading-tight",
                isDark ? "text-academy-gray-400" : "text-academy-gray-500",
              )}
            >
              {user.email}
            </p>
          </div>
        </div>

        {/* Voci nav */}
        <div className="py-2">
          {menuItems.map(({ href, label, Icon }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors",
                isDark
                  ? "text-academy-gray-300 hover:bg-academy-orange/10 hover:text-academy-orange"
                  : "text-academy-gray-600 hover:bg-academy-orange/10 hover:text-academy-orange",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <div
          className={cn(
            "py-2",
            isDark
              ? "border-t border-white/[0.06]"
              : "border-t border-black/[0.06]",
          )}
        >
          <button
            onClick={onLogout}
            className={cn(
              "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold transition-colors",
              isDark
                ? "text-academy-gray-400 hover:bg-red-500/10 hover:text-red-400"
                : "text-academy-gray-500 hover:bg-red-500/5 hover:text-red-600",
            )}
          >
            <IconLogout className="h-[18px] w-[18px] shrink-0" />
            <span>Esci</span>
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
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  // Track mobile breakpoint (matches navbar's `min-[981px]:flex` desktop cutoff)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 980px)");
    setIsMobileViewport(mq.matches);
    const onChange = () => setIsMobileViewport(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  // Over-hero mode: routes with a hardcoded dark cinematic hero force dark-bg
  // treatment regardless of the user's theme preference, while above the fold.
  // - "/"                              home hero (cinematic dark)
  // - "/percorso/[function|strength|science]"  block detail hero (dark gradient + grid)
  const isBlockDetailRoute =
    pathname === "/percorso/function" ||
    pathname === "/percorso/strength" ||
    pathname === "/percorso/science";
  const isMasterclassRoute =
    pathname === "/masterclass" || pathname.startsWith("/masterclass/");
  const isDarkHeroRoute =
    isBlockDetailRoute || pathname === "/docenti" || isMasterclassRoute;
  const overHeroDark = (pathname === "/" || isDarkHeroRoute) && !scrolled;
  // Mobile navbar has a dark gradient background always → nav text is white always.
  const onDarkBg = overHeroDark || isMobileViewport;
  const isDark = onDarkBg ? true : theme === "dark";

  /* ── Entrance animation ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: -90, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", delay: 0.15 },
      );
    });
    return () => ctx.revert();
  }, []);

  /* ── Scroll: backdrop + hide-on-down / show-on-up ──
     On home, while #perche (next section after hero) has not yet reached the top
     of the viewport, the navbar stays fully visible and transparent. After that
     point it resumes normal hide-on-scroll-down / show-on-scroll-up behavior. */
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    let ready = false;
    const readyTimer = setTimeout(() => {
      ready = true;
    }, 1300);

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;

        // Gate: are we past the hero? (#perche has reached viewport top)
        const perche = document.getElementById("perche");
        const pastHero = perche
          ? perche.getBoundingClientRect().top <= 0
          : true;

        setScrolled(pastHero && y > 30);

        if (ready && !document.documentElement.dataset.pathActive) {
          const header = headerRef.current;
          // Mobile: always visible, no hide-on-scroll-down
          const mobile = window.matchMedia("(max-width: 980px)").matches;
          if (mobile) {
            gsap.to(header, {
              yPercent: 0,
              opacity: 1,
              duration: 0.38,
              ease: "power2.out",
              overwrite: "auto",
            });
          } else if (!pastHero) {
            // Inside hero: always visible, transparent
            gsap.to(header, {
              yPercent: 0,
              opacity: 1,
              duration: 0.38,
              ease: "power2.out",
              overwrite: "auto",
            });
          } else if (y < 80) {
            gsap.to(header, {
              yPercent: 0,
              opacity: 1,
              duration: 0.38,
              ease: "power2.out",
              overwrite: "auto",
            });
          } else if (y > lastY + 4) {
            gsap.to(header, {
              yPercent: -110,
              duration: 0.42,
              ease: "power3.inOut",
              overwrite: "auto",
            });
          } else if (y < lastY - 4) {
            gsap.to(header, {
              yPercent: 0,
              opacity: 1,
              duration: 0.38,
              ease: "power3.out",
              overwrite: "auto",
            });
          }
        }
        lastY = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      clearTimeout(readyTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* ── Auth ── */
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null),
    );
    return () => subscription.unsubscribe();
  }, []);

  /* ── Lock body scroll while mobile menu is open ── */
  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
    };
  }, [mobileOpen]);

  /* ── Mobile open ── */
  function openMenu() {
    if (isAnimating) return;
    setIsAnimating(true);
    setMobileOpen(true);

    const overlay = overlayRef.current;
    if (!overlay) return;

    const items = overlay.querySelectorAll<HTMLElement>(".nav-overlay-item");
    gsap.set(items, { x: -50, opacity: 0 });

    gsap
      .timeline({ onComplete: () => setIsAnimating(false) })
      .fromTo(
        overlay,
        { clipPath: "circle(0% at 93% 4%)" },
        {
          clipPath: "circle(150% at 93% 4%)",
          duration: 0.75,
          ease: "expo.inOut",
        },
      )
      .to(
        items,
        { x: 0, opacity: 1, stagger: 0.07, duration: 0.55, ease: "expo.out" },
        "-=0.35",
      );
  }

  /* ── Mobile close ── */
  function closeMenu() {
    if (isAnimating) return;
    setIsAnimating(true);

    const overlay = overlayRef.current;
    if (!overlay) return;

    const items = overlay.querySelectorAll<HTMLElement>(".nav-overlay-item");

    gsap
      .timeline({
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
        "-=0.1",
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
        style={{
          opacity: 0,
          ...(isMobileViewport && !overHeroDark
            ? {
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                background: "rgba(255,255,255,0.55)",
                borderBottom: "1px solid rgba(0,0,0,0.05)",
              }
            : null),
        }}
        className={cn(
          "fixed top-0 left-0 right-0 z-[60] transition-colors duration-500",
          isMobileViewport
            ? "bg-transparent"
            : scrolled
              ? "navbar-scrolled-bg"
              : "bg-transparent",
        )}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-[5%] py-5 md:px-10">
          {/* Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/"
              className={cn(
                "group inline-flex items-center transition-opacity duration-300 hover:opacity-80",
                /* Mobile drawer is always white, so force a dark logo while open.
                   - over hero (home above fold): dark bg → white logo
                   - mobile non-hero: bg is hardcoded white-translucent → dark logo
                   - desktop non-hero: .navbar-scrolled-bg adapts to theme */
                mobileOpen
                  ? "text-[#111]"
                  : overHeroDark
                    ? "text-white"
                    : isMobileViewport
                      ? "text-[#111]"
                      : theme === "dark"
                        ? "text-academy-gray-100"
                        : "text-[#111]",
              )}
            >
              <Logo width={170} />
            </Link>
          </div>

          {/* Desktop links */}
          <div
            ref={linksContainerRef}
            className="relative hidden items-center gap-10 min-[981px]:flex"
            onMouseLeave={handleLinksLeave}
          >
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
                      : onDarkBg
                        ? "text-white hover:text-academy-orange"
                        : isDark
                          ? "text-academy-gray-300 hover:text-academy-orange"
                          : "text-[#444] hover:text-academy-orange",
                  )}
                >
                  <span
                    className={cn(
                      "mb-0.5 text-[12px] font-bold tracking-[0.3em] uppercase transition-colors",
                      active
                        ? "text-academy-orange"
                        : onDarkBg
                          ? "text-white/80 group-hover:text-academy-orange"
                          : isDark
                            ? "text-academy-gray-400 group-hover:text-academy-orange"
                            : "text-[#888] group-hover:text-academy-orange",
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
          <div className="hidden items-center gap-4 min-[981px]:flex shrink-0">
            {user ? (
              <UserAvatar user={user} onLogout={handleLogout} isDark={isDark} />
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className={cn(
                    "text-sm font-medium tracking-wider uppercase transition-colors",
                    onDarkBg
                      ? "text-white hover:text-academy-orange"
                      : isDark
                        ? "text-academy-gray-400 hover:text-academy-gray-100"
                        : "text-[#555] hover:text-[#111]",
                  )}
                >
                  Accedi
                </Link>
                <Link
                  href="/auth/register"
                  className="group relative overflow-hidden border border-academy-orange px-6 py-2.5 text-[12px] font-black tracking-[0.22em] text-academy-orange uppercase transition-colors duration-300 hover:text-academy-dark"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-academy-orange transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-x-100" />
                  <span className="relative">Iscriviti Ora</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile right cluster — Menu only (WhatsApp moved to floating CTA) */}
          <div className="flex items-center gap-2.5 min-[981px]:hidden">
            {/* Menu button — square 44×44, icon only */}
            <button
              onClick={mobileOpen ? closeMenu : openMenu}
              className="flex items-center justify-center transition-all duration-200 active:scale-95 shrink-0"
              style={{
                width: "44px",
                height: "44px",
                background: mobileOpen ? "transparent" : "#F09226",
                border: mobileOpen
                  ? "1.5px solid rgba(239,68,68,0.55)"
                  : "1.5px solid #F09226",
              }}
              aria-label={mobileOpen ? "Chiudi menu" : "Apri menu"}
            >
              {mobileOpen ? (
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                  <path
                    d="M2 2l12 12M14 2L2 14"
                    stroke="#ef4444"
                    strokeWidth="2.2"
                    strokeLinecap="square"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 18 14"
                  width="18"
                  height="14"
                  fill="none"
                  stroke="#111111"
                  strokeWidth="2"
                  strokeLinecap="square"
                >
                  <path d="M1 2h16M1 7h16M1 12h11" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile fullscreen overlay (always light, body-scroll locked) ── */}
      <div
        ref={overlayRef}
        aria-hidden={!mobileOpen}
        className={cn(
          "fixed inset-0 z-[55] min-[981px]:hidden bg-white overflow-hidden overscroll-contain",
          !mobileOpen && "pointer-events-none",
        )}
        style={{ clipPath: "circle(0% at 93% 4%)" }}
        onTouchMove={(e) => e.preventDefault()}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute right-0 top-0 h-[40vh] w-[40vw] bg-academy-orange/[0.04] blur-[100px]" />
          <div className="absolute left-0 bottom-0 h-[30vh] w-[30vw] bg-academy-orange/[0.02] blur-[120px]" />
        </div>

        <div className="relative flex h-full flex-col justify-between px-[8%] pb-14 pt-28">
          <nav className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="nav-overlay-item group flex items-baseline gap-5 py-6 border-b border-black/6"
              >
                <span className="w-8 shrink-0 text-xs font-bold tracking-[0.3em] text-academy-orange/40 uppercase">
                  {link.num}
                </span>
                <span className="text-[2.5rem] font-black leading-none tracking-tight uppercase transition-colors duration-200 group-hover:text-academy-orange text-[#111]">
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

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
                  className="text-left text-sm font-medium text-red-500/80"
                >
                  Esci
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  onClick={closeMenu}
                  className="flex items-center justify-center border border-academy-orange py-4 text-[12px] font-black tracking-[0.22em] text-academy-orange uppercase"
                >
                  Iscriviti Ora
                </Link>
                <Link
                  href="/auth/login"
                  onClick={closeMenu}
                  className="text-center text-xs font-medium tracking-widest uppercase text-[#666]"
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
