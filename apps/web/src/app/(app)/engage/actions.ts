"use server";

import {
  SocialPlatform,
  asConnectedAccountId,
  asInboxItemId,
  asUserId,
} from "@social/shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  EngagementService,
  RefreshInboxUseCase,
  SyncCommentsUseCase,
  type EngagementInboxItemRecord,
  type EngagementReplyRecord,
  type InboxItemDetail,
  type InboxItemFilter,
  type InboxItemStatus,
} from "@/domains/engagement";
import { MediaService, type MediaItemRecord } from "@/domains/media";
import { NotificationService } from "@/domains/notification";
import { WorkspaceService } from "@/domains/workspace";
import { getOutstandAdapter } from "@/lib/adapters/outstand";
import { supabaseMediaStorageAdapter } from "@/lib/adapters/media-storage/supabase-media-storage-adapter";
import { getCachedSession } from "@/lib/better-auth/session";
import { engagementRepository } from "@/lib/repositories/engagement";
import { mediaRepository } from "@/lib/repositories/media";
import { notificationRepository } from "@/lib/repositories/notification";
import { publishingRepository } from "@/lib/repositories/publishing";
import { workspaceRepository } from "@/lib/repositories/workspace";
import { toActionError } from "@/lib/utils/errors";
import { createActiveWorkspaceMembersPort } from "@/lib/workspace/active-members-port";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";

/**
 * Manual refresh Comments Inbox (T-052, `background-jobs.md` § JOB-03).
 * Reuse `SyncCommentsUseCase.sync` — logic sync (fetch+upsert+notify) yang
 * SAMA dipakai `EngagementSyncJobHandler` (job periodik 30 menit) — tapi
 * DIPANGGIL LANGSUNG dari sini, tanpa lewat handler, karena refresh manual
 * bukan job periodik: sync sekali untuk seluruh `ConnectedAccount` aktif
 * workspace ini, lalu selesai — TIDAK enqueue job baru/self-reschedule.
 *
 * Data engagement TIDAK memakai Supabase Realtime (ADR-023 membatasinya
 * hanya untuk tabel `notifications`) — ini satu-satunya cara halaman
 * `/engage` bisa dapat data terbaru tanpa menunggu siklus cron.
 *
 * **Refactor (Temuan #2 review Ridwan Architecture Reviewer):** orkestrasi
 * "ambil daftar akun aktif, loop sync tiap akun, akumulasi
 * `newCommentsCount`" sebelumnya ada LANGSUNG di Server Action ini
 * (melanggar AGENTS.md #5 — entry point tanpa business logic). Sekarang
 * dipindahkan ke `RefreshInboxUseCase.refreshAll`
 * (`domains/engagement/services/refresh-inbox.use-case.ts`), pola sama
 * `SyncCommentsUseCase`. Entry point ini murni wiring: resolve
 * workspace/session, rakit dependency konkret (composition root, pola sama
 * `/api/jobs/run/route.ts`) — `WorkspaceService` instance dipassing
 * LANGSUNG sebagai `ConnectedAccountsPort` use-case (structural typing,
 * `listConnectedAccounts` sudah punya shape yang dibutuhkan) — lalu
 * delegasi SATU panggilan ke `refreshAll`. Signature return
 * (`{ error?, newCommentsCount? }`) dan behavior (toast jumlah komentar
 * baru, `revalidatePath("/engage")`) TIDAK berubah dari sebelumnya.
 */
export async function refreshInboxAction(): Promise<{
  error?: string;
  newCommentsCount?: number;
}> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }
  const userId = asUserId(session.user.id);

  const workspaceService = new WorkspaceService(workspaceRepository);
  const syncCommentsUseCase = new SyncCommentsUseCase(
    engagementRepository,
    getOutstandAdapter(),
    publishingRepository,
    new NotificationService(notificationRepository),
    createActiveWorkspaceMembersPort(),
  );
  const refreshInboxUseCase = new RefreshInboxUseCase(
    syncCommentsUseCase,
    workspaceService,
  );

  try {
    const { newCommentsCount } = await refreshInboxUseCase.refreshAll(
      workspaceId,
      userId,
    );
    revalidatePath("/engage");
    return { newCommentsCount };
  } catch (error) {
    return toActionError(error);
  }
}

/** Filter opsional untuk `listInboxAction` — bentuk primitif (input dari client), dipetakan ke `InboxItemFilter` (branded types) sebelum diteruskan ke service. */
export interface ListInboxActionFilter {
  connectedAccountId?: string;
  platform?: string;
  status?: InboxItemStatus;
}

/**
 * Comments Inbox — daftar inbox item milik workspace aktif (T-053).
 * Murni wiring (AGENTS.md #5): resolve workspace/session, petakan filter
 * primitif dari client ke `InboxItemFilter` (branded types), lalu delegasi
 * ke `EngagementService.listInbox` — filtering/sorting sudah jadi tanggung
 * jawab repository (T-050), tidak ditambahkan lagi di sini.
 */
export async function listInboxAction(
  filter?: ListInboxActionFilter,
): Promise<{ data?: EngagementInboxItemRecord[]; error?: string }> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }
  const userId = asUserId(session.user.id);

  const engagementService = new EngagementService(
    engagementRepository,
    getOutstandAdapter(),
    publishingRepository,
    workspaceRepository,
  );

  try {
    const inboxFilter: InboxItemFilter = {
      workspaceId,
      ...(filter?.connectedAccountId && {
        connectedAccountId: asConnectedAccountId(filter.connectedAccountId),
      }),
      ...(filter?.platform && {
        platform: filter.platform as SocialPlatform,
      }),
      ...(filter?.status && { status: filter.status }),
    };
    const data = await engagementService.listInbox(inboxFilter, userId);
    return { data };
  } catch (error) {
    return toActionError(error);
  }
}

/** Thumbnail post asli (T-056, KI-065) — media PERTAMA saja (kotak "Post asal" menampilkan satu thumbnail, bukan galeri), pola sama `.thumb`/`.popover-thumb` di Claude Design. `url` di sini adalah URL Supabase Storage aplikasi kita (`MediaItemRecord.url`, sama field yang dipakai `getDraftAction`/`Modal.tsx` untuk preview) — BUKAN `outstandMediaUrl`/`resolveOutstandPostMedia` (itu untuk menyiapkan upload ke Outstand sebelum publish, bukan untuk menampilkan media yang sudah ada di storage kita sendiri). */
export interface InboxDetailThumbnailDto {
  url: string;
  type: MediaItemRecord["type"];
}

/** Snapshot post asli (T-056, KI-065) siap-render — `mediaIds` domain diganti `thumbnail` tunggal yang sudah di-resolve URL-nya. */
export interface InboxDetailPostSnapshotDto {
  caption: string;
  platformPostUrl: string | null;
  thumbnail: InboxDetailThumbnailDto | null;
}

/** `InboxItemDetail` domain + `postSnapshot` yang sudah dipetakan ke bentuk siap-render (T-056). */
export type InboxItemDetailDto = Omit<InboxItemDetail, "postSnapshot"> & {
  postSnapshot: InboxDetailPostSnapshotDto | null;
};

/**
 * Detail satu inbox item + seluruh balasannya (T-053; T-056/KI-065 menambah
 * `postSnapshot` siap-render untuk kotak "Post asal"). Murni wiring —
 * resolve workspace/session, delegasi ke
 * `EngagementService.getInboxItemDetail` untuk data domain, lalu (kalau
 * `postSnapshot.mediaIds` tidak kosong) resolve media PERTAMA ke URL
 * tampil lewat `MediaService.listByIds` (domain `media`, BC-08) — pola
 * sama `getDraftAction` (`draft-editor/actions.ts`): kombinasi dua
 * Application Service lalu dipetakan jadi DTO siap-konsumsi client, BUKAN
 * keputusan bisnis baru (AGENTS.md #5).
 */
export async function getInboxItemDetailAction(
  inboxItemId: string,
): Promise<{ data?: InboxItemDetailDto; error?: string }> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }
  const userId = asUserId(session.user.id);

  const engagementService = new EngagementService(
    engagementRepository,
    getOutstandAdapter(),
    publishingRepository,
    workspaceRepository,
  );

  try {
    const detail = await engagementService.getInboxItemDetail(
      { workspaceId, inboxItemId: asInboxItemId(inboxItemId) },
      userId,
    );

    let thumbnail: InboxDetailThumbnailDto | null = null;
    const firstMediaId = detail.postSnapshot?.mediaIds[0];
    if (firstMediaId) {
      // `supabaseMediaStorageAdapter` disuplai (bug fix QA T-056,
      // 2026-10-06) — komentar inbox bisa dilihat lama setelah post
      // dipublish, jadi `url` yang di-cache dari waktu upload media hampir
      // pasti sudah expired; `MediaService.listByIds` meregenerate signed
      // URL baru dari `storagePath` setiap panggilan supaya thumbnail
      // "Post asal" selalu valid.
      const mediaService = new MediaService(
        mediaRepository,
        supabaseMediaStorageAdapter,
      );
      const [mediaItem] = await mediaService.listByIds(
        { workspaceId, mediaIds: [firstMediaId] },
        userId,
      );
      if (mediaItem?.url) {
        thumbnail = { url: mediaItem.url, type: mediaItem.type };
      }
    }

    const data: InboxItemDetailDto = {
      ...detail,
      postSnapshot: detail.postSnapshot
        ? {
            caption: detail.postSnapshot.caption,
            platformPostUrl: detail.postSnapshot.platformPostUrl,
            thumbnail,
          }
        : null,
    };
    return { data };
  } catch (error) {
    return toActionError(error);
  }
}

/**
 * Tandai satu inbox item sebagai "done" (T-053). Murni wiring — resolve
 * workspace/session, delegasi ke `EngagementService.markAsDone`, lalu
 * `revalidatePath("/engage")` (pola sama `refreshInboxAction`).
 */
export async function markAsDoneAction(
  inboxItemId: string,
): Promise<{ data?: EngagementInboxItemRecord; error?: string }> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }
  const userId = asUserId(session.user.id);

  const engagementService = new EngagementService(
    engagementRepository,
    getOutstandAdapter(),
    publishingRepository,
    workspaceRepository,
  );

  try {
    const data = await engagementService.markAsDone(
      { workspaceId, inboxItemId: asInboxItemId(inboxItemId) },
      userId,
    );
    revalidatePath("/engage");
    return { data };
  } catch (error) {
    return toActionError(error);
  }
}

/**
 * Balas komentar dari dalam aplikasi (T-054, `integration-layer.md`
 * § "Reply via Outstand API", ADR-019/ADR-040, KI-071). Murni wiring —
 * resolve workspace/session (RBAC: seluruh role member aktif workspace boleh
 * membalas, `roles-permissions.md` tidak membedakan akses Engagement per
 * role — tidak ada gating tambahan di sini selain member aktif, pola sama
 * Server Action lain), rakit `EngagementService` dengan `getOutstandAdapter()`
 * + `publishingRepository` (`PublishingPostReferencePort`) +
 * `workspaceRepository` (`ConnectedAccountHandlePort` — lookup handle per
 * id untuk `accountUsername`, KI-071), delegasi ke `EngagementService.reply`
 * (validasi `content` kosong/whitespace-only ada di service, bukan di sini —
 * konsisten dengan `IdentityService.updateProfile`), lalu
 * `revalidatePath("/engage")` (pola sama `markAsDoneAction`).
 */
export async function replyToCommentAction(
  inboxItemId: string,
  content: string,
): Promise<{ data?: EngagementReplyRecord; error?: string }> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }
  const userId = asUserId(session.user.id);

  const engagementService = new EngagementService(
    engagementRepository,
    getOutstandAdapter(),
    publishingRepository,
    workspaceRepository,
  );

  try {
    const data = await engagementService.reply(
      { workspaceId, inboxItemId: asInboxItemId(inboxItemId), content },
      userId,
    );
    revalidatePath("/engage");
    return { data };
  } catch (error) {
    return toActionError(error);
  }
}
