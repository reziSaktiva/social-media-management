import { asPostId, asUserId } from "@social/shared";
import { notFound, redirect } from "next/navigation";

import { PublishingService } from "@/domains/publishing";
import type { HistoryItemRecord } from "@/domains/publishing";
import { getCachedSession } from "@/lib/better-auth/session";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";
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

  let item: HistoryItemRecord;
  try {
    item = await publishingService.getHistoryById(
      workspaceId,
      asPostId(postId),
      userId,
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  return <HistoryDetail item={item} />;
}
