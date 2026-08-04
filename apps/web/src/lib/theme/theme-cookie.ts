export type ThemeMode = "light" | "dark";

export const THEME_COOKIE_NAME = "theme";

// Satu tahun. Preferensi tema tidak sensitif, jadi cookie sengaja bukan
// httpOnly — client yang menulisnya saat toggle, RSC yang membacanya
// sebelum render pertama (ADR-055).
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const DEFAULT_THEME_MODE: ThemeMode = "light";

export function parseThemeMode(value: string | undefined | null): ThemeMode {
  return value === "dark" || value === "light" ? value : DEFAULT_THEME_MODE;
}
