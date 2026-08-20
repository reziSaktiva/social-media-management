"use server";

import { MemberRole, asMemberId, asUserId } from "@social/shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { WorkspaceService } from "@/domains/workspace";
import { getCachedSession } from "@/lib/better-auth/session";
import { getServerEnv } from "@/lib/env";
import { workspaceRepository } from "@/lib/repositories/workspace";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";
import { toActionError } from "@/lib/utils/errors";

// ADR-076 (T-039.1-3): `resolveWorkspaceAndSession(slug)` lokal dihapus —
// workspaceId sekarang dari getWorkspaceContext() (header proxy.ts),
// actorUserId dari getCachedSession() (pola sama seperti saveDraftAction
// di (app)/components/draft-editor/actions.ts).

// Server Action adalah HTTP endpoint publik — annotation TypeScript `role:
// MemberRole` hilang saat runtime, jadi request yang dibuat manual (bukan
// lewat UI) bisa mengirim string apa pun. Tanpa guard ini, value asing lolos
// seluruh pengecekan service dan baru gagal di enum Prisma sebagai error
// tak tertangani, bukan pesan rapi lewat toActionError (temuan CodeRabbit
// PR #73).
function isValidMemberRole(value: unknown): value is MemberRole {
  return Object.values(MemberRole).includes(value as MemberRole);
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

/**
 * Jalur **Copy Link** (T-007.1, ADR-080) — buat invitation + susun link
 * lengkap `{baseUrl}/invite/{token}`. `baseUrl` dari `BETTER_AUTH_URL`
 * (env yang sama dipakai Better Auth `baseURL`, bukan env baru). Halaman
 * `/invite/[token]` (accept-invite flow) di luar scope T-007.1 — lihat
 * ADR-072 "future work".
 */
export async function inviteMemberAction(
  email: string,
  role: MemberRole,
): Promise<{ error?: string; token?: string; inviteLink?: string }> {
  if (!isValidMemberRole(role)) {
    return { error: "Role tidak valid." };
  }

  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const workspaceService = new WorkspaceService(workspaceRepository);

  let invitation: Awaited<ReturnType<WorkspaceService["inviteMember"]>>;
  try {
    invitation = await workspaceService.inviteMember(
      workspaceId,
      asUserId(session.user.id),
      { email, role },
    );
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/settings/members");

  const baseUrl = getServerEnv().BETTER_AUTH_URL;
  return {
    token: invitation.token,
    inviteLink: `${baseUrl}/invite/${invitation.token}`,
  };
}

export async function updateMemberRoleAction(
  targetMemberId: string,
  newRole: MemberRole,
): Promise<{ error?: string }> {
  if (!isValidMemberRole(newRole)) {
    return { error: "Role tidak valid." };
  }

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
