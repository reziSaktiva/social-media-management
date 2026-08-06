/** Formats a date in long Indonesian form (e.g. "12 Januari 2026"). */
export function formatConnectedDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
