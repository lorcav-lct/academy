"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { href: "/percorso", label: "Il Percorso" },
  { href: "/pack", label: "Pack" },
  { href: "/workshop", label: "Workshop" },
];

function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fullName: string =
    (user.user_metadata?.full_name as string) || user.email || "Studente";
  const initials = fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 group"
        aria-label="Menu utente"
      >
        <div className="flex h-9 w-9 items-center justify-center border-2 border-academy-orange bg-academy-orange/10 text-sm font-black text-academy-orange transition-all group-hover:bg-academy-orange/20">
          {initials}
        </div>
        <span className="hidden text-sm font-medium text-academy-gray-300 transition-colors group-hover:text-academy-orange lg:block">
          {fullName.split(" ")[0]}
        </span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="h-3 w-3 text-academy-gray-500"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 border border-academy-orange/15 bg-academy-dark/95 backdrop-blur-xl shadow-xl"
          >
            <div className="border-b border-white/5 px-4 py-3">
              <p className="text-xs text-academy-gray-500">Accesso come</p>
              <p className="truncate text-sm font-semibold text-academy-gray-100">{user.email}</p>
            </div>
            <div className="py-1">
              <DropdownLink href="/account" onClick={() => setOpen(false)}>
                Il mio Profilo
              </DropdownLink>
              <DropdownLink href="/account/tickets" onClick={() => setOpen(false)}>
                I miei Ticket
              </DropdownLink>
              <DropdownLink href="/account" onClick={() => setOpen(false)}>
                I miei Acquisti
              </DropdownLink>
            </div>
            <div className="border-t border-white/5 py-1">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-400/10"
              >
                Esci
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropdownLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2 text-sm text-academy-gray-300 transition-colors hover:bg-academy-orange/10 hover:text-academy-orange"
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-academy-dark/90 backdrop-blur-xl border-b border-academy-orange/10"
            : "bg-transparent"
        )}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center border-2 border-academy-orange bg-academy-orange/10 transition-all group-hover:bg-academy-orange/20 group-hover:glow-orange">
              <span className="text-lg font-black text-academy-orange">L</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold tracking-[0.2em] text-academy-gray-100 uppercase">
                Lacertosus
              </span>
              <span className="ml-1 text-sm font-light tracking-[0.2em] text-academy-orange uppercase">
                Academy
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium tracking-wide text-academy-gray-300 uppercase transition-colors hover:text-academy-orange"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <UserMenu user={user} />
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-academy-gray-300 transition-colors hover:text-academy-orange"
                >
                  Accedi
                </Link>
                <Button href="/pack" size="sm">
                  Iscriviti Ora
                </Button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex flex-col gap-1.5 p-2 md:hidden"
            aria-label="Menu"
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="block h-0.5 w-6 bg-academy-gray-100"
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block h-0.5 w-6 bg-academy-gray-100"
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="block h-0.5 w-6 bg-academy-gray-100"
            />
          </button>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-academy-dark/98 backdrop-blur-xl md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-bold tracking-wider text-academy-gray-100 uppercase transition-colors hover:text-academy-orange"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="text-2xl font-bold tracking-wider text-academy-orange uppercase"
                >
                  Il mio Account
                </Link>
                <button
                  onClick={async () => {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    setMobileOpen(false);
                    window.location.href = "/";
                  }}
                  className="text-lg font-medium text-red-400"
                >
                  Esci
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-2xl font-bold tracking-wider text-academy-gray-100 uppercase transition-colors hover:text-academy-orange"
                >
                  Accedi
                </Link>
                <div onClick={() => setMobileOpen(false)}>
                  <Button href="/pack" size="lg">
                    Iscriviti Ora
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
