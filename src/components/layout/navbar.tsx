"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/percorso", label: "Il Percorso" },
  { href: "/pack", label: "Pack" },
  { href: "/workshop", label: "Workshop" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
            <Button href="/pack" size="sm">
              Iscriviti Ora
            </Button>
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
            <div onClick={() => setMobileOpen(false)}>
              <Button href="/pack" size="lg">
                Iscriviti Ora
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
