"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  DEFAULT_THEME_MODE,
  THEME_COOKIE_MAX_AGE,
  THEME_COOKIE_NAME,
  type ThemeMode,
} from "@/lib/theme/theme-cookie";

// T-098/T-099: `TooltipProvider` shadcn (dipasang sekali di root, per
// instruksi CLI shadcn saat `tooltip` di-install) — dibutuhkan oleh
// `Tooltip` yang dipakai WorkspaceSideNav/ChannelsSection/NotificationBell
// (T-098) dan ConnectPlatformMenu/tombol disabled Danger Zone (T-099)
// setelah migrasi dari `IconButton tooltip=...` Astryx.
import { TooltipProvider } from "@/components/ui/tooltip";
// T-102.6: `Toaster` sonner dipasang sekali di root supaya `toast()` bisa
// dipanggil dari mana saja (mis. `QueueScreen.tsx` Cancel Schedule), sama
// seperti pola `TooltipProvider` di atas. `theme` di-pass dari `mode`
// context ini sendiri karena `components/ui/sonner.tsx` sengaja tidak
// pakai `next-themes` (project sudah punya mekanisme tema sendiri).
import { Toaster } from "@/components/ui/sonner";

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

  // Persist only the committed mode, after render, so uncommitted/aborted
  // state updates never write a theme cookie.
  useEffect(() => {
    persistThemeMode(mode);
  }, [mode]);

  // shadcn/ui pakai strategi class `dark` di elemen root (`@custom-variant
  // dark (&:is(.dark *))`, globals.css) — bukan lagi provider `Theme`
  // Astryx. `<html>` sudah dapat class yang benar di render pertama dari
  // RootLayout (Server Component, baca cookie yang sama), jadi baris ini
  // hanya menjaga class tetap sinkron saat `toggleMode()` dipanggil di
  // client tanpa reload (ADR-097 poin 9, mengamendemen ADR-055 — mekanisme
  // toggle tetap ada, `ThemeModeContext`/`useThemeMode` custom ini tidak
  // berubah).
  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

  const themeModeValue = useMemo<ThemeModeContextValue>(
    () => ({
      mode,
      toggleMode: () =>
        setMode((current) => (current === "light" ? "dark" : "light")),
    }),
    [mode],
  );

  return (
    <ThemeModeContext.Provider value={themeModeValue}>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster theme={mode} />
    </ThemeModeContext.Provider>
  );
}
