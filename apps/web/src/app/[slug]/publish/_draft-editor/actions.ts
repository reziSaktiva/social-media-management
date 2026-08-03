"use server";

import type { SocialPlatform } from "@social/shared";
import { asPostId, asUserId } from "@social/shared";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ScheduleTargetRequest } from "@/domains/publishing";
import {
  PublishingService,
  resolveScheduleTargets,
  SchedulePostsUseCase,
} from "@/domains/publishing";
import { WorkspaceService } from "@/domains/workspace";
import { auth } from "@/lib/better-auth/auth";
import { getOutstandAdapter } from "@/lib/adapters/outstand";
import { publishingRepository } from "@/lib/repositories/publishing";
import { workspaceRepository } from "@/lib/repositories/workspace";

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

/**
 * Alias dari `ScheduleTargetRequest` domain publishing (bukan definisi
 * terpisah) — actions.ts sebagai entry point reuse tipe dari domain,
 * bukan sebaliknya.
 */
export type ScheduleDraftTargetInput = ScheduleTargetRequest;

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
  const workspaceService = new WorkspaceService(workspaceRepository);

  // Pastikan caption terbaru dari editor sudah persist sebelum dijadwalkan —
  // baik untuk "New Post" yang belum pernah di-save (belum ada postId)
  // maupun draft existing yang diedit tanpa klik "Save as Draft" dulu.
  // Independen dari `listConnectedAccounts` di bawah — jalankan berbarengan
  // lewat Promise.all daripada await berurutan.
  const [post, connectedAccounts] = await Promise.all([
    input.postId
      ? publishingService.updateDraft({
          workspaceId: workspace.id,
          postId: asPostId(input.postId),
          caption: input.caption,
        })
      : publishingService.saveDraft({
          workspaceId: workspace.id,
          authorId: asUserId(session.user.id),
          caption: input.caption,
        }),
    workspaceService.listConnectedAccounts(workspace.id),
  ]);
  const targets = resolveScheduleTargets(connectedAccounts, input.targets);

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
