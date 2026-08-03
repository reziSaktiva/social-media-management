"use server";

import type { ContentFormat, SocialPlatform } from "@social/shared";
import { asConnectedAccountId, asPostId, asUserId } from "@social/shared";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PublishingService, SchedulePostsUseCase } from "@/domains/publishing";
import { WorkspaceService } from "@/domains/workspace";
import { auth } from "@/lib/better-auth/auth";
import { getOutstandAdapter } from "@/lib/adapters/outstand";
import { publishingRepository } from "@/lib/repositories/publishing";
import { workspaceRepository } from "@/lib/repositories/workspace";
import { ValidationError } from "@/lib/utils/errors";

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

  return { session, workspace };
}

export async function saveDraftAction(
  slug: string,
  caption: string,
): Promise<{ postId: string }> {
  const { session, workspace } = await resolveWorkspaceAndSession(slug);

  const publishingService = new PublishingService(publishingRepository);
  const post = await publishingService.saveDraft({
    workspaceId: workspace.id,
    authorId: asUserId(session.user.id),
    caption,
  });

  return { postId: post.id };
}

export async function updateDraftAction(
  slug: string,
  postId: string,
  caption: string,
): Promise<{ postId: string }> {
  const { workspace } = await resolveWorkspaceAndSession(slug);

  const publishingService = new PublishingService(publishingRepository);
  const post = await publishingService.updateDraft({
    workspaceId: workspace.id,
    postId: asPostId(postId),
    caption,
  });

  return { postId: post.id };
}

export async function getDraftAction(
  slug: string,
  postId: string,
): Promise<{ postId: string; caption: string; status: string }> {
  const { workspace } = await resolveWorkspaceAndSession(slug);

  const publishingService = new PublishingService(publishingRepository);
  const post = await publishingService.getDraftById(
    workspace.id,
    asPostId(postId),
  );

  return { postId: post.id, caption: post.caption, status: post.status };
}

export interface ConnectedAccountDto {
  id: string;
  platform: SocialPlatform;
  handle: string;
  status: string;
}

export async function getConnectedAccountsAction(
  slug: string,
): Promise<ConnectedAccountDto[]> {
  const { workspace } = await resolveWorkspaceAndSession(slug);

  const workspaceService = new WorkspaceService(workspaceRepository);
  const accounts = await workspaceService.listConnectedAccounts(workspace.id);

  return accounts.map((account) => ({
    id: account.id,
    platform: account.platform,
    handle: account.handle,
    status: account.status,
  }));
}

export interface ScheduleDraftTargetInput {
  connectedAccountId: string;
  contentFormat: string;
  platformOptions?: Record<string, unknown>;
}

export interface ScheduleDraftInput {
  postId?: string;
  caption: string;
  scheduledAt: string;
  targets: ScheduleDraftTargetInput[];
}

/**
 * Orkestrasi Server Action untuk tombol "Konfirmasi & Jadwalkan" (ADR-059).
 * Business logic (format-matrix, guard status+ownership, panggilan
 * OutstandAdapter) hidup di `SchedulePostsUseCase.execute` — action ini
 * hanya resolve session/workspace, memastikan draft tersimpan, resolve
 * identitas akun yang otentik dari DB (bukan dari client), lalu
 * delegasikan ke use-case.
 */
export async function scheduleDraftAction(
  slug: string,
  input: ScheduleDraftInput,
): Promise<{ postId: string }> {
  const { session, workspace } = await resolveWorkspaceAndSession(slug);

  const publishingService = new PublishingService(publishingRepository);

  // Pastikan caption terbaru dari editor sudah persist sebelum dijadwalkan —
  // baik untuk "New Post" yang belum pernah di-save (belum ada postId)
  // maupun draft existing yang diedit tanpa klik "Save as Draft" dulu.
  const post = input.postId
    ? await publishingService.updateDraft({
        workspaceId: workspace.id,
        postId: asPostId(input.postId),
        caption: input.caption,
      })
    : await publishingService.saveDraft({
        workspaceId: workspace.id,
        authorId: asUserId(session.user.id),
        caption: input.caption,
      });

  const workspaceService = new WorkspaceService(workspaceRepository);
  const connectedAccounts = await workspaceService.listConnectedAccounts(
    workspace.id,
  );
  const connectedAccountById = new Map(
    connectedAccounts.map((account) => [account.id, account]),
  );

  const targets = input.targets.map((target) => {
    const account = connectedAccountById.get(
      asConnectedAccountId(target.connectedAccountId),
    );
    if (!account) {
      throw new ValidationError(
        "Salah satu akun yang dipilih tidak ditemukan di daftar akun terhubung workspace ini.",
      );
    }

    return {
      connectedAccountId: account.id,
      platform: account.platform,
      contentFormat: target.contentFormat as ContentFormat,
      platformOptions: target.platformOptions,
      outstandAccountId: account.outstandAccountId,
    };
  });

  const scheduled = await new SchedulePostsUseCase(
    publishingRepository,
    getOutstandAdapter(),
  ).execute({
    workspaceId: workspace.id,
    postId: post.id,
    scheduledAt: new Date(input.scheduledAt),
    targets,
  });

  return { postId: scheduled.id };
}
