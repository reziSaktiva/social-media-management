import {
  getAnalyzeSummaryAction,
  getPostPerformanceAction,
} from "./analyze-actions";
import { AnalyzeDashboard } from "./components/AnalyzeDashboard";

import type { SnapshotPeriod } from "@/domains/analytics";

const DEFAULT_PERIOD: SnapshotPeriod = "weekly";

/**
 * `/analyze` (T-043.2, KSP-07) — entry point tipis: panggil
 * `getAnalyzeSummaryAction` + `getPostPerformanceAction` (Server Action,
 * `./analyze-actions`, sudah ada dari T-043.1) paralel via `Promise.all`,
 * render `AnalyzeDashboard` (pola sama `page.tsx` Dashboard Home T-042.3).
 *
 * Scope halaman ini HANYA page head + Summary row + Post Performance table
 * (rancangan dikunci Claude Design `templates/analyze-dashboard.html`,
 * komentar SYNCED 2026-09-18) — Account Overview (T-045.2) dan Engagement
 * Summary (T-044) sengaja TIDAK dirender, keduanya scope task terpisah yang
 * belum giliran.
 */
export default async function Page() {
  const [summary, rows] = await Promise.all([
    getAnalyzeSummaryAction(DEFAULT_PERIOD),
    getPostPerformanceAction(),
  ]);

  return (
    <AnalyzeDashboard
      initialPeriod={DEFAULT_PERIOD}
      summary={summary}
      rows={rows}
    />
  );
}
