"use server";

import { asUserId } from "@social/shared";
import { redirect } from "next/navigation";

import type { SnapshotPeriod } from "@/domains/analytics";
import { AnalyticsService } from "@/domains/analytics";
import type {
  AccountOverviewRow,
  AnalyzeSummary,
  PostPerformanceRow,
} from "@/domains/publishing";
import { PublishingService } from "@/domains/publishing";
import { WorkspaceService } from "@/domains/workspace";
import { getCachedSession } from "@/lib/better-auth/session";
import { analyticsRepository } from "@/lib/repositories/analytics";
import { publishingRepository } from "@/lib/repositories/publishing";
import { workspaceRepository } from "@/lib/repositories/workspace";
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

/**
 * Server Action untuk halaman `/analyze` — Account Overview (T-046.1,
 * KSP-07 Analyze → Dashboard). Dikonsumsi UI bar `Progress` T-046.2 (Mark
 * UI Engineer), pola pemanggilan ulang saat selector period diganti sama
 * dengan `getPostPerformanceAction` di atas.
 *
 * Composition root cross-domain ganda: `PublishingService` disuplai
 * `AnalyticsService` sebagai `PostMetricsPort` (`publishing -> analytics`,
 * pola sama `getPostPerformanceAction`) DAN `WorkspaceService` sebagai
 * `ConnectedAccountsPort` (`publishing -> workspace`, arah yang SUDAH legal
 * di `application-layer.md` — "verifikasi ConnectedAccount"). Orkestrasi
 * tipis saja: resolve workspace context, wire service, delegasikan. Semua
 * logic (agregasi per akun, kriteria "belum ada data" T-046) hidup di
 * `PublishingService.getAccountOverview`, bukan di sini.
 */
export async function getAccountOverviewAction(
  period: SnapshotPeriod,
): Promise<AccountOverviewRow[]> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const publishingService = new PublishingService(
    publishingRepository,
    new AnalyticsService(analyticsRepository),
    new WorkspaceService(workspaceRepository),
  );

  return publishingService.getAccountOverview(
    workspaceId,
    period,
    asUserId(session.user.id),
  );
}

/**
 * Server Action untuk halaman `/analyze` — Summary row 3 stat card
 * (T-047.1, KSP-07 Analyze → Dashboard). Dikonsumsi UI `StatTile` T-047.2
 * (Mark UI Engineer), pola pemanggilan ulang saat selector period diganti
 * sama dengan `getPostPerformanceAction`/`getAccountOverviewAction` di atas.
 *
 * Composition root LEBIH SEDERHANA dari `getAccountOverviewAction` — tidak
 * ada `WorkspaceService`/`ConnectedAccountsPort` karena
 * `PublishingService.getAnalyzeSummary` tidak membutuhkannya (lihat catatan
 * `AnalyzeSummary`). `AnalyticsService` tetap disuplai sebagai
 * `PostMetricsPort` (`publishing -> analytics`, pola sama dua action di
 * atas) karena `getAnalyzeSummary` reuse `getPostPerformance`. Orkestrasi
 * tipis saja: resolve workspace context, wire service, delegasikan.
 */
export async function getAnalyzeSummaryAction(
  period: SnapshotPeriod,
): Promise<AnalyzeSummary> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const publishingService = new PublishingService(
    publishingRepository,
    new AnalyticsService(analyticsRepository),
  );

  return publishingService.getAnalyzeSummary(
    workspaceId,
    period,
    asUserId(session.user.id),
  );
}
