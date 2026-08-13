"use server";

import type { DashboardSummary, SnapshotPeriod } from "@/domains/analytics";
import { AnalyticsService } from "@/domains/analytics";
import { WorkspaceService } from "@/domains/workspace";
import { analyticsRepository } from "@/lib/repositories/analytics";
import { workspaceRepository } from "@/lib/repositories/workspace";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";

/**
 * Server Action untuk Dashboard Home — Analytics Snapshot (T-042.2,
 * KSP-01-F04). Menerima `period` supaya selector rentang waktu (T-042.5,
 * dikerjakan Mark UI Engineer) tinggal memanggil ulang action ini dengan
 * nilai lain, tanpa route baru.
 *
 * Orkestrasi tipis saja: resolve workspace context, wire
 * `AnalyticsService` dengan `WorkspaceService` sebagai `ActiveAccountsPort`
 * (composition root cross-domain analytics -> workspace, AGENTS.md #7 —
 * pola identik `ScheduledCountsPort` di `app/(app)/layout.tsx`), lalu
 * delegasikan ke `AnalyticsService.getDashboardSummary`. Semua logic
 * ringkasan (termasuk kapan mengembalikan `null` untuk empty state
 * T-042.4) hidup di service, bukan di sini.
 */
export async function getDashboardSummaryAction(
  period: SnapshotPeriod,
): Promise<DashboardSummary | null> {
  const { workspaceId } = await getWorkspaceContext();

  const analyticsService = new AnalyticsService(
    analyticsRepository,
    new WorkspaceService(workspaceRepository),
  );

  return analyticsService.getDashboardSummary(workspaceId, period);
}
