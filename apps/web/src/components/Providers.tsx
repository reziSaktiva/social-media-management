"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

// `LinkProvider` (Astryx) dipertahankan sengaja (T-096.2) — komponen Astryx
// yang belum dimigrasi di route-segment lain (mis. SideNavItem di
// WorkspaceSideNav/SettingsSideNav) masih memakai `Link` internalnya untuk
// navigasi client-side lewat next/link. Melepasnya sekarang akan membuat
// komponen yang belum termigrasi itu diam-diam jatuh ke full-page reload
// (default fallback `<a>` Astryx tanpa provider) — regresi UX yang di luar
// scope T-096 (murni ganti Theme/stoneTheme, bukan LinkProvider). Hapus
// baris ini setelah T-102 cleanup (Astryx sudah tidak dipakai sama sekali).
import { LinkProvider } from "@astryxdesign/core/Link";
// `Theme` (Astryx) JUGA dipertahankan — temuan sesi ini (lihat laporan
// T-096 ke King Rezi), berbeda dari instruksi awal task ("ganti Theme/
// stoneTheme Astryx dengan pendekatan shadcn"). `Theme` bukan cuma provider
// styling kosmetik: root instance-nya men-sync atribut `data-theme` ke
// `document.documentElement`, dan SATU-SATUNYA mekanisme yang membuat
// `light-dark()` di CSS Astryx (`theme-stone/theme.css`) resolve sesuai
// mode aplikasi, bukan `prefers-color-scheme` OS mentah (`:root
// { color-scheme: light dark }` tanpa override eksplisit). Diverifikasi:
// melepas `<Theme>` membuat SELURUH komponen Astryx yang belum dimigrasi
// (mayoritas app di luar scope T-096) berhenti mengikuti toggle
// light/dark in-app — warnanya "nyangkut" mengikuti preferensi OS/browser
// apa adanya, desync dari `ThemeModeContext`. Class `dark` shadcn di bawah
// TETAP dipasang berdampingan (bukan pengganti) — dua mekanisme jalan
// paralel sampai T-102 (semua route-segment sudah shadcn, `Theme` boleh
// dilepas beneran).
import { Theme } from "@astryxdesign/core/theme";
import { stoneTheme } from "@astryxdesign/theme-stone/built";
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
      <Theme mode={mode} theme={stoneTheme}>
        <LinkProvider component={Link}>{children}</LinkProvider>
      </Theme>
    </ThemeModeContext.Provider>
  );
}
