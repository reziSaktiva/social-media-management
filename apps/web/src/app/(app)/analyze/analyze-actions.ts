"use server";

import { asUserId, ContentStatus } from "@social/shared";
import { redirect } from "next/navigation";

import type {
  PostPerformanceRow,
  SnapshotPeriod,
  WorkspaceSnapshotRecord,
} from "@/domains/analytics";
import { AnalyticsService } from "@/domains/analytics";
import { PublishingService } from "@/domains/publishing";
import { getCachedSession } from "@/lib/better-auth/session";
import { analyticsRepository } from "@/lib/repositories/analytics";
import { publishingRepository } from "@/lib/repositories/publishing";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";

/**
 * Server Action untuk ringkasan `/analyze` (Total Posts, Total Reach,
 * Engagement Rate — T-043.1). SAMA PERSIS dengan Analytics Snapshot
 * Dashboard Home (T-042.2) — wrapper tipis ke
 * `AnalyticsService.getWorkspaceSnapshot`, tidak butuh `WorkspaceService`
 * (tidak ada kebutuhan `activeAccounts` di sini).
 */
export async function getAnalyzeSummaryAction(
  period: SnapshotPeriod,
): Promise<WorkspaceSnapshotRecord | null> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const analyticsService = new AnalyticsService(analyticsRepository);

  return analyticsService.getWorkspaceSnapshot(workspaceId, period);
}

// Cap `listHistory` (code review PR #127) — tanpa ini, Post Performance
// menarik SELURUH riwayat `Published` workspace tanpa batas pada setiap
// kunjungan `/analyze`. 500 post terbaru cukup untuk tabel yang disortir
// client-side ini; `listHistory` sendiri tetap tanpa batas untuk caller lain
// (`limit` opsional, default `undefined`) — lihat
// `IPublishingRepository.listHistory`.
const POST_PERFORMANCE_LIMIT = 500;

/**
 * Server Action untuk Post Performance table `/analyze` (T-043.1). Wire
 * `AnalyticsService` dengan `PostInfoPort` yang diimplementasikan inline di
 * sini (composition root cross-domain analytics -> publishing, AGENTS.md
 * #7) — memanggil `PublishingService.listHistory` dengan
 * `statuses: [ContentStatus.Published]` saja (post `Failed` sengaja
 * dikecualikan, tidak punya metrik nyata untuk ditampilkan).
 */
export async function getPostPerformanceAction(): Promise<
  PostPerformanceRow[]
> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const userId = asUserId(session.user.id);
  const publishingService = new PublishingService(publishingRepository);

  const analyticsService = new AnalyticsService(
    analyticsRepository,
    undefined,
    {
      listPublishedPosts: async (workspaceIdArg, userIdArg) => {
        const history = await publishingService.listHistory(
          {
            workspaceId: workspaceIdArg,
            statuses: [ContentStatus.Published],
            limit: POST_PERFORMANCE_LIMIT,
          },
          userIdArg,
        );
        return history.map((item) => ({
          id: item.id,
          caption: item.caption,
          publishedAt: item.publishedAt,
        }));
      },
    },
  );

  return analyticsService.getPostPerformance(workspaceId, userId);
}
