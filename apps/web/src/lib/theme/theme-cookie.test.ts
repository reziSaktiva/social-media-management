import { describe, expect, it } from "vitest";

import { DEFAULT_THEME_MODE, parseThemeMode } from "./theme-cookie";

describe("parseThemeMode", () => {
  it("menerima nilai valid apa adanya", () => {
    expect(parseThemeMode("light")).toBe("light");
    expect(parseThemeMode("dark")).toBe("dark");
  });

  it("jatuh ke default saat cookie tidak ada atau tidak valid", () => {
    expect(parseThemeMode(undefined)).toBe(DEFAULT_THEME_MODE);
    expect(parseThemeMode(null)).toBe(DEFAULT_THEME_MODE);
    expect(parseThemeMode("")).toBe(DEFAULT_THEME_MODE);
    expect(parseThemeMode("Dark")).toBe(DEFAULT_THEME_MODE);
    expect(parseThemeMode("bogus")).toBe(DEFAULT_THEME_MODE);
  });
});
