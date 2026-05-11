"use client";

import type { ReactNode } from "react";
import { showPreferences } from "vanilla-cookieconsent";

const DEFAULT_CLASS =
  "text-sm text-academy-gray-400 transition-colors hover:text-academy-orange";

export function CookiePreferencesLink({
  children = "Preferenze cookie",
  className = DEFAULT_CLASS,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        showPreferences();
      }}
      className={className}
    >
      {children}
    </a>
  );
}
