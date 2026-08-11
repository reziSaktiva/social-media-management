"use server";

import type { MemberRole } from "@social/shared";
import { asMemberId, asUserId } from "@social/shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { WorkspaceService } from "@/domains/workspace";
import { getCachedSession } from "@/lib/better-auth/session";
import { workspaceRepository } from "@/lib/repositories/workspace";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@/lib/utils/errors";

// ADR-076 (T-039.1-3): `resolveWorkspaceAndSession(slug)` lokal dihapus —
// workspaceId sekarang dari getWorkspaceContext() (header proxy.ts),
// actorUserId dari getCachedSession() (pola sama seperti saveDraftAction
// di (app)/components/draft-editor/actions.ts).

function toActionError(error: unknown): { error: string } {
  if (
    error instanceof AuthorizationError ||
    error instanceof NotFoundError ||
    error instanceof ValidationError
  ) {
    return { error: error.message };
  }
  throw error;
}

export async function removeMemberAction(
  targetMemberId: string,
): Promise<{ error?: string }> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const workspaceService = new WorkspaceService(workspaceRepository);

  try {
    await workspaceService.removeMember(
      workspaceId,
      asUserId(session.user.id),
      asMemberId(targetMemberId),
    );
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/settings/members");
  return {};
}

export async function updateMemberRoleAction(
  targetMemberId: string,
  newRole: MemberRole,
): Promise<{ error?: string }> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const workspaceService = new WorkspaceService(workspaceRepository);

  try {
    await workspaceService.updateMemberRole(
      workspaceId,
      asUserId(session.user.id),
      asMemberId(targetMemberId),
      newRole,
    );
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/settings/members");
  return {};
}
