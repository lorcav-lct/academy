"use client";

import { createContext, useContext, type ReactNode } from "react";

// Theme is hardcoded to "light" at runtime. Type stays bivalent so existing
// `theme === "dark"` comparisons across the codebase compile (they just return false).
type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ theme: "light", toggle: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}
