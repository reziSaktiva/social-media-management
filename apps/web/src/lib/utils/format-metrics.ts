/**
 * Shared formatters untuk metrik analytics (code review PR #127) — sebelumnya
 * masing-masing didefinisikan ulang identik di `DashboardHome.tsx`,
 * `CalendarPostPopover.tsx`, `AnalyzeDashboard.tsx`, `PostPerformanceTable.tsx`,
 * dan `HistoryDetail.tsx`. Satu sumber di sini supaya perubahan format (mis.
 * locale, pembulatan) tidak perlu disinkronkan manual ke banyak file.
 */

/** Formats a 0-1 rate as an Indonesian-locale percentage, e.g. `0.0625` -> `"6.3%"`. */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/** Formats a raw count with Indonesian thousands separators, e.g. `12000` -> `"12.000"`. */
export function formatCount(value: number): string {
  return value.toLocaleString("id-ID");
}
