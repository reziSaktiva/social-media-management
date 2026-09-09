"use server";

import { asConnectedAccountId, asUserId } from "@social/shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { WorkspaceService } from "@/domains/workspace";
import { getCachedSession } from "@/lib/better-auth/session";
import { workspaceRepository } from "@/lib/repositories/workspace";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";
import { toActionError } from "@/lib/utils/errors";

/**
 * Disconnect akun terhubung (T-014.2, ADR-048/ADR-049) — entry point tipis,
 * hanya resolve workspace context + session lalu memanggil
 * `WorkspaceService.disconnectAccount` (AGENTS.md #5). RBAC (Owner/Admin)
 * dan seluruh business logic sepenuhnya di Application Service, TIDAK di
 * sini. Dialog konfirmasi Tier 2 (KSP-08-F07) yang memanggil action ini
 * adalah scope T-014.3 (belum dikerjakan) — action ini sendiri tidak
 * mengasumsikan sudah dikonfirmasi, hanya mengeksekusi apa yang diminta
 * caller.
 */
export async function disconnectAccountAction(
  connectedAccountId: string,
): Promise<{ error?: string }> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const workspaceService = new WorkspaceService(workspaceRepository);

  try {
    await workspaceService.disconnectAccount(
      workspaceId,
      asUserId(session.user.id),
      asConnectedAccountId(connectedAccountId),
    );
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/settings/connected-accounts");
  return {};
}
