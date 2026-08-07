"use server";

import type { MemberRole } from "@social/shared";
import { asMemberId, asUserId } from "@social/shared";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { WorkspaceService } from "@/domains/workspace";
import { auth } from "@/lib/better-auth/auth";
import { workspaceRepository } from "@/lib/repositories/workspace";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@/lib/utils/errors";

async function resolveWorkspaceAndSession(slug: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const workspaceService = new WorkspaceService(workspaceRepository);
  const workspace = await workspaceService.getWorkspaceBySlug(slug);
  if (!workspace) {
    redirect("/onboarding");
  }

  return { session, workspace, workspaceService };
}

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
  slug: string,
  targetMemberId: string,
): Promise<{ error?: string }> {
  const { session, workspace, workspaceService } =
    await resolveWorkspaceAndSession(slug);

  try {
    await workspaceService.removeMember(
      workspace.id,
      asUserId(session.user.id),
      asMemberId(targetMemberId),
    );
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(`/${slug}/settings/members`);
  return {};
}

export async function updateMemberRoleAction(
  slug: string,
  targetMemberId: string,
  newRole: MemberRole,
): Promise<{ error?: string }> {
  const { session, workspace, workspaceService } =
    await resolveWorkspaceAndSession(slug);

  try {
    await workspaceService.updateMemberRole(
      workspace.id,
      asUserId(session.user.id),
      asMemberId(targetMemberId),
      newRole,
    );
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(`/${slug}/settings/members`);
  return {};
}
