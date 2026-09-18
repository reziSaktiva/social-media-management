/** Domain-specific types for analytics. */

import type {
  ConnectedAccountId,
  PostId,
  SocialPlatform,
} from "@social/shared";

/**
 * Periode agregasi `WorkspaceSnapshot` (domain-model.md BC-06). Hanya
 * dipakai di dalam domain analytics — belum ada BC lain yang
 * mengonsumsinya, jadi tetap di sini (bukan `packages/shared`) sampai ada
 * kebutuhan cross-domain nyata.
 */
export type SnapshotPeriod = "weekly" | "monthly";

/**
 * Ringkasan Dashboard Home (T-042.2, KSP-01-F04 Analytics Snapshot) —
 * gabungan angka dari `AnalyticsWorkspaceSnapshot` (`totalPosts`,
 * `totalEngagements`, `avgEngagementRate`) dengan `activeAccounts`, yang
 * berasal dari domain `workspace` (cross-domain lewat `ActiveAccountsPort`
 * di `AnalyticsService`, bukan import Prisma/domain lain langsung —
 * AGENTS.md #7). Dikembalikan oleh `AnalyticsService.getDashboardSummary`;
 * `null` berarti belum ada snapshot untuk `period` ini sama sekali, dipakai
 * caller untuk merender empty state (T-042.4).
 */
export interface DashboardSummary {
  totalPosts: number;
  totalEngagements: number;
  avgEngagementRate: number;
  activeAccounts: number;
}

/**
 * Satu baris tabel Post Performance `/analyze` (T-043.1/T-043.2, digabung
 * dari post `Published` (`publishing`, via `PostInfoPort`) + metrik per
 * target akun (`AnalyticsPostMetric`, via `getPostMetricsByPosts`).
 * Dikembalikan oleh `AnalyticsService.getPostPerformance`.
 *
 * `hasMetrics: false` menandai post yang sudah `Published` tapi belum
 * punya baris metrik ter-ingest sama sekali (job ingestion T-041 belum
 * jalan untuk post ini) — UI (T-043.4) WAJIB merender ini sebagai "belum
 * ada data", BUKAN sebagai reach/engagementRate = 0 (beda makna: 0 berarti
 * metrik nyata dengan nilai nol, bukan ketiadaan data).
 */
export interface PostPerformanceRow {
  postId: PostId;
  caption: string;
  publishedAt: Date | null;
  connectedAccountId: ConnectedAccountId | null;
  platform: SocialPlatform | null;
  reach: number | null;
  engagementRate: number | null;
  hasMetrics: boolean;
}
