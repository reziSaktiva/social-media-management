"use server";

import { asUserId } from "@social/shared";
import { redirect } from "next/navigation";

import type { SnapshotPeriod } from "@/domains/analytics";
import { AnalyticsService } from "@/domains/analytics";
import type { PostPerformanceRow } from "@/domains/publishing";
import { PublishingService } from "@/domains/publishing";
import { getCachedSession } from "@/lib/better-auth/session";
import { analyticsRepository } from "@/lib/repositories/analytics";
import { publishingRepository } from "@/lib/repositories/publishing";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";

/**
 * Server Action untuk halaman `/analyze` — Post Performance (T-043.1,
 * KSP-07 Analyze → Dashboard). Dikonsumsi UI Table sortable T-043.2 (Mark
 * UI Engineer), yang tinggal memanggil ulang action ini dengan `period`
 * lain saat selector rentang waktu diganti — sama pola dengan
 * `getDashboardSummaryAction` (Dashboard Home, T-042.2).
 *
 * **Composition root dibalik (2026-09-18, refactor Temuan 1 Ridwan
 * Architecture Reviewer — circular dependency `analytics` <-> `publishing`):**
 * `getPostPerformance` sekarang hidup di `PublishingService`, dengan
 * `AnalyticsService` disuplai sebagai `PostMetricsPort` — pola identik
 * composition root History (`publish/history/[postId]/page.tsx`, T-043.3),
 * BUKAN lagi `AnalyticsService` dengan `PublishingService` sebagai
 * `PublishingHistoryPort` (arah lama yang menyebabkan circular dependency).
 * Orkestrasi tipis saja: resolve workspace context, wire service, lalu
 * delegasikan. Semua logic (join metrik + caption/akun, filter rentang
 * tanggal period, empty state, sorting) hidup di service, bukan di sini.
 */
export async function getPostPerformanceAction(
  period: SnapshotPeriod,
): Promise<PostPerformanceRow[]> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const publishingService = new PublishingService(
    publishingRepository,
    new AnalyticsService(analyticsRepository),
  );

  return publishingService.getPostPerformance(
    workspaceId,
    period,
    asUserId(session.user.id),
  );
}
