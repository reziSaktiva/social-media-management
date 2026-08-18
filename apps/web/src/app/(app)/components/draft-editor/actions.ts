"use server";

import type { SocialPlatform } from "@social/shared";
import { asPostId, asUserId } from "@social/shared";
import { redirect } from "next/navigation";
import type { ScheduleTargetRequest } from "@/domains/publishing";
import {
  PublishingService,
  PublishNowUseCase,
  resolveScheduleTargets,
  SchedulePostsUseCase,
} from "@/domains/publishing";
import { WorkspaceService } from "@/domains/workspace";
import { getCachedSession } from "@/lib/better-auth/session";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";
import { getOutstandAdapter } from "@/lib/adapters/outstand";
import { publishingRepository } from "@/lib/repositories/publishing";
import { workspaceRepository } from "@/lib/repositories/workspace";

export async function saveDraftAction(
  caption: string,
): Promise<{ postId: string }> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const publishingService = new PublishingService(publishingRepository);
  const post = await publishingService.saveDraft({
    workspaceId,
    authorId: asUserId(session.user.id),
    caption,
  });

  return { postId: post.id };
}

export async function updateDraftAction(
  postId: string,
  caption: string,
): Promise<{ postId: string }> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const publishingService = new PublishingService(publishingRepository);
  const post = await publishingService.updateDraft(
    {
      workspaceId,
      postId: asPostId(postId),
      caption,
    },
    asUserId(session.user.id),
  );

  return { postId: post.id };
}

export async function getDraftAction(
  postId: string,
): Promise<{ postId: string; caption: string; status: string }> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const publishingService = new PublishingService(publishingRepository);
  const post = await publishingService.getDraftById(
    workspaceId,
    asPostId(postId),
    asUserId(session.user.id),
  );

  return { postId: post.id, caption: post.caption, status: post.status };
}

export interface ConnectedAccountDto {
  id: string;
  platform: SocialPlatform;
  handle: string;
  status: string;
}

export async function getConnectedAccountsAction(): Promise<
  ConnectedAccountDto[]
> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const workspaceService = new WorkspaceService(workspaceRepository);
  const accounts = await workspaceService.listConnectedAccounts(
    workspaceId,
    asUserId(session.user.id),
  );

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
 * hanya resolve workspace context/session, memastikan draft tersimpan,
 * resolve identitas akun yang otentik dari DB (bukan dari client), lalu
 * delegasikan ke use-case.
 */
export async function scheduleDraftAction(
  input: ScheduleDraftInput,
): Promise<{ postId: string }> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const publishingService = new PublishingService(publishingRepository);
  const workspaceService = new WorkspaceService(workspaceRepository);

  // Pastikan caption terbaru dari editor sudah persist sebelum dijadwalkan —
  // baik untuk "New Post" yang belum pernah di-save (belum ada postId)
  // maupun draft existing yang diedit tanpa klik "Save as Draft" dulu.
  // Independen dari `listConnectedAccounts` di bawah — jalankan berbarengan
  // lewat Promise.all daripada await berurutan.
  const actingUserId = asUserId(session.user.id);

  const [post, connectedAccounts] = await Promise.all([
    input.postId
      ? publishingService.updateDraft(
          {
            workspaceId,
            postId: asPostId(input.postId),
            caption: input.caption,
          },
          actingUserId,
        )
      : publishingService.saveDraft({
          workspaceId,
          authorId: actingUserId,
          caption: input.caption,
        }),
    workspaceService.listConnectedAccounts(workspaceId, actingUserId),
  ]);
  const targets = resolveScheduleTargets(connectedAccounts, input.targets);

  const scheduled = await new SchedulePostsUseCase(
    publishingRepository,
    getOutstandAdapter(),
  ).execute({
    workspaceId,
    postId: post.id,
    scheduledAt: new Date(input.scheduledAt),
    targets,
    actingUserId,
  });

  return { postId: scheduled.id };
}

export interface PublishNowInput {
  postId?: string;
  caption: string;
  targets: ScheduleDraftTargetInput[];
}

/**
 * Orkestrasi Server Action untuk tombol "Konfirmasi & Publish" (T-029,
 * ADR-047) — sengaja mengikuti struktur `scheduleDraftAction` persis
 * (persist caption terbaru dulu, resolve akun terhubung dari DB, lalu
 * delegasikan ke use-case) supaya kedua aksi publish tetap konsisten.
 * Business logic (RBAC, format-matrix, guard status+ownership, panggilan
 * OutstandAdapter) hidup di `PublishNowUseCase.execute` — action ini hanya
 * wiring: resolve workspace context/session (termasuk `role` yang sudah
 * tervalidasi oleh `proxy.ts` per request), memastikan draft tersimpan,
 * resolve identitas akun yang otentik dari DB (bukan dari client), lalu
 * delegasikan.
 */
export async function publishNowAction(
  input: PublishNowInput,
): Promise<{ postId: string }> {
  const { workspaceId, role } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const publishingService = new PublishingService(publishingRepository);
  const workspaceService = new WorkspaceService(workspaceRepository);

  const actingUserId = asUserId(session.user.id);

  const [post, connectedAccounts] = await Promise.all([
    input.postId
      ? publishingService.updateDraft(
          {
            workspaceId,
            postId: asPostId(input.postId),
            caption: input.caption,
          },
          actingUserId,
        )
      : publishingService.saveDraft({
          workspaceId,
          authorId: actingUserId,
          caption: input.caption,
        }),
    workspaceService.listConnectedAccounts(workspaceId, actingUserId),
  ]);
  const targets = resolveScheduleTargets(connectedAccounts, input.targets);

  const published = await new PublishNowUseCase(
    publishingRepository,
    getOutstandAdapter(),
  ).execute({
    workspaceId,
    postId: post.id,
    targets,
    actorRole: role,
    actingUserId,
  });

  return { postId: published.id };
}
