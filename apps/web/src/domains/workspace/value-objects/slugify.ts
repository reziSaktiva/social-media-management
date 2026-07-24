const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

/**
 * Derives a URL-safe workspace slug candidate from a display name.
 * Pure domain rule — no infrastructure dependency.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(COMBINING_DIACRITICS, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}
