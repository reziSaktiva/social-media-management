"use server";

import { asPostId, asUserId } from "@social/shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { PublishingService } from "@/domains/publishing";
import { toActionError } from "@/lib/utils/errors";
import { getCachedSession } from "@/lib/better-auth/session";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";
import { publishingRepository } from "@/lib/repositories/publishing";

/**
 * Delete Post (T-035.2/.3, ADR-049 Tier 2) — dipanggil dari dialog
 * konfirmasi Tier 2 (`ConfirmActionDialog`, pola `disconnectAccountAction`/
 * `cancelScheduleAction`) di halaman Drafts. Business logic (RBAC, guard
 * status — HANYA post Draft yang boleh dihapus, lihat
 * `PublishingService.deletePost`) hidup sepenuhnya di Application Service —
 * action ini hanya wiring: resolve workspace context (termasuk `role` yang
 * sudah tervalidasi `proxy.ts` per request)/session, delegasikan, lalu
 * revalidate halaman Drafts supaya baris yang dihapus langsung hilang dari
 * daftar tanpa perlu refresh manual.
 */
export async function deletePostAction(
  postId: string,
): Promise<{ error?: string }> {
  const { workspaceId, role } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const publishingService = new PublishingService(publishingRepository);

  try {
    await publishingService.deletePost(
      {
        workspaceId,
        postId: asPostId(postId),
        actorRole: role,
      },
      asUserId(session.user.id),
    );
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/publish/drafts");
  return {};
}
