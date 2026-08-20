"use server";

import { asPostId, asUserId } from "@social/shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { CancelScheduleUseCase } from "@/domains/publishing";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/lib/utils/errors";
import { getCachedSession } from "@/lib/better-auth/session";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";
import { getOutstandAdapter } from "@/lib/adapters/outstand";
import { publishingRepository } from "@/lib/repositories/publishing";

function toActionError(error: unknown): { error: string } {
  if (
    error instanceof AuthorizationError ||
    error instanceof NotFoundError ||
    error instanceof ValidationError ||
    error instanceof ConflictError
  ) {
    return { error: error.message };
  }
  throw error;
}

/**
 * Cancel Schedule (T-030, T-032.4) — dipanggil dari dialog konfirmasi Tier 2
 * (AlertDialog, pola `MembersTable.tsx`) di halaman Queue. Business logic
 * (RBAC, guard status Scheduled, panggilan
 * `OutstandAdapter.cancelScheduledPost` per target) hidup di
 * `CancelScheduleUseCase.execute` — action ini hanya wiring: resolve
 * workspace context/session (termasuk `role` yang sudah tervalidasi oleh
 * `proxy.ts` per request), delegasikan ke use-case, lalu revalidate halaman
 * Queue supaya card yang dibatalkan langsung hilang dari daftar tanpa perlu
 * refresh manual.
 */
export async function cancelScheduleAction(
  postId: string,
): Promise<{ error?: string }> {
  const { workspaceId, role } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  try {
    await new CancelScheduleUseCase(
      publishingRepository,
      getOutstandAdapter(),
    ).execute({
      workspaceId,
      postId: asPostId(postId),
      actorRole: role,
      actingUserId: asUserId(session.user.id),
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/publish/queue");
  return {};
}
