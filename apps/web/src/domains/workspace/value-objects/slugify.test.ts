import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and joins words with hyphens", () => {
    expect(slugify("Tim Marketing Acme")).toBe("tim-marketing-acme");
  });

  it("strips accents/diacritics", () => {
    expect(slugify("Café Résumé")).toBe("cafe-resume");
  });

  it("collapses non-alphanumeric runs into a single hyphen", () => {
    expect(slugify("Acme & Co.!!  Studio")).toBe("acme-co-studio");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  -- Acme --  ")).toBe("acme");
  });

  it("truncates to a bounded length", () => {
    const long = "a".repeat(100);
    const result = slugify(long);
    expect(result.length).toBeLessThanOrEqual(60);
  });

  it("returns an empty string for input with no alphanumeric characters", () => {
    expect(slugify("!!! ??? ---")).toBe("");
  });
});
