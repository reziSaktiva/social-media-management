import { asPostId, asUserId } from "@social/shared";
import { notFound, redirect } from "next/navigation";

import { AnalyticsService } from "@/domains/analytics";
import type { PostMetricsRecord } from "@/domains/analytics";
import { PublishingService } from "@/domains/publishing";
import type { HistoryItemRecord } from "@/domains/publishing";
import { getCachedSession } from "@/lib/better-auth/session";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";
import { analyticsRepository } from "@/lib/repositories/analytics";
import { publishingRepository } from "@/lib/repositories/publishing";
import { NotFoundError } from "@/lib/utils/errors";

import { HistoryDetail } from "./components/HistoryDetail";

/**
 * `/publish/history/[postId]` (T-034.3, KSP-D10) — entry point tipis:
 * resolve `postId`, panggil `PublishingService.getHistoryById` langsung
 * (RSC boleh memanggil Application Service tanpa Server Action perantara
 * kalau tidak ada mutasi/composition cross-domain, sama pola
 * `invite/[token]/page.tsx`). `NotFoundError` (post tidak ada, bukan milik
 * workspace ini, atau belum berstatus terminal Published/Failed — invariant
 * ditegakkan di repository, lihat `IPublishingRepository.getHistoryById`)
 * diterjemahkan ke halaman 404 Next.js bawaan (`notFound()`) di sini —
 * satu-satunya tempat yang boleh menerjemahkan error domain ke response
 * (AGENTS.md #5).
 */
export default async function Page({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }
  const userId = asUserId(session.user.id);

  const publishingService = new PublishingService(publishingRepository);
  const analyticsService = new AnalyticsService(analyticsRepository);

  // T-043.3: metrik per target akun ditampilkan di samping "Hasil per Akun"
  // yang sudah ada. `getPostMetrics` SUDAH ADA (T-040.1) — tidak butuh
  // repository/service baru. Diambil paralel dengan `getHistoryById`
  // (tidak saling bergantung).
  let item: HistoryItemRecord;
  let metrics: PostMetricsRecord[];
  try {
    [item, metrics] = await Promise.all([
      publishingService.getHistoryById(workspaceId, asPostId(postId), userId),
      analyticsService.getPostMetrics(asPostId(postId)),
    ]);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  return <HistoryDetail item={item} metrics={metrics} />;
}
