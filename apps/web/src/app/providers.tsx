"use client";

import { createContext, useContext, useMemo, useState } from "react";

import { LinkProvider } from "@astryxdesign/core/Link";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
import Link from "next/link";

import {
  DEFAULT_THEME_MODE,
  THEME_COOKIE_MAX_AGE,
  THEME_COOKIE_NAME,
  type ThemeMode,
} from "@/lib/theme/theme-cookie";

type ThemeModeContextValue = {
  mode: ThemeMode;
  toggleMode: () => void;
};

// `initialMode` berasal dari cookie yang dibaca RSC di root layout, jadi
// server dan client merender mode yang sama — tidak ada hydration mismatch
// dan tidak ada flash tema salah saat reload (ADR-055).
const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within Providers");
  }
  return context;
}

function persistThemeMode(mode: ThemeMode) {
  document.cookie = `${THEME_COOKIE_NAME}=${mode}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`;
}

export function Providers({
  children,
  initialMode = DEFAULT_THEME_MODE,
}: {
  children: React.ReactNode;
  initialMode?: ThemeMode;
}) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  const themeModeValue = useMemo<ThemeModeContextValue>(
    () => ({
      mode,
      toggleMode: () =>
        setMode((current) => {
          const next = current === "light" ? "dark" : "light";
          persistThemeMode(next);
          return next;
        }),
    }),
    [mode],
  );

  return (
    <ThemeModeContext.Provider value={themeModeValue}>
      <Theme mode={mode} theme={neutralTheme}>
        <LinkProvider component={Link}>{children}</LinkProvider>
      </Theme>
    </ThemeModeContext.Provider>
  );
}
