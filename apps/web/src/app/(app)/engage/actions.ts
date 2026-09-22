"use server";

import {
  MemberStatus,
  SocialPlatform,
  asConnectedAccountId,
  asInboxItemId,
  asUserId,
} from "@social/shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  EngagementService,
  SyncCommentsUseCase,
  type EngagementInboxItemRecord,
  type EngagementReplyRecord,
  type InboxItemDetail,
  type InboxItemFilter,
  type InboxItemStatus,
} from "@/domains/engagement";
import { NotificationService } from "@/domains/notification";
import { WorkspaceService } from "@/domains/workspace";
import { getOutstandAdapter } from "@/lib/adapters/outstand";
import { getCachedSession } from "@/lib/better-auth/session";
import { engagementRepository } from "@/lib/repositories/engagement";
import { notificationRepository } from "@/lib/repositories/notification";
import { workspaceRepository } from "@/lib/repositories/workspace";
import { toActionError } from "@/lib/utils/errors";
import { getWorkspaceContext } from "@/lib/workspace/workspace-context";

/**
 * Manual refresh Comments Inbox (T-052, `background-jobs.md` § JOB-03).
 * Reuse `SyncCommentsUseCase.sync` — logic sync (fetch+upsert+notify) yang
 * SAMA dipakai `EngagementSyncJobHandler` (job periodik 30 menit) — tapi
 * DIPANGGIL LANGSUNG dari sini, tanpa lewat handler, karena refresh manual
 * bukan job periodik: sync sekali untuk seluruh `ConnectedAccount` aktif
 * workspace ini, lalu selesai — TIDAK enqueue job baru/self-reschedule.
 * `SyncCommentsUseCase` sendiri sudah tidak mensyaratkan `IJobScheduler`
 * sama sekali di constructor-nya (reschedule murni tanggung jawab
 * `EngagementSyncJobHandler.handle()` yang memanggil `sync()` lalu enqueue
 * sendiri) — jadi tidak ada penyesuaian constructor yang diperlukan untuk
 * mendukung use case ini.
 *
 * Data engagement TIDAK memakai Supabase Realtime (ADR-023 membatasinya
 * hanya untuk tabel `notifications`) — ini satu-satunya cara halaman
 * `/engage` (T-053, masih placeholder) bisa dapat data terbaru tanpa
 * menunggu siklus cron.
 *
 * Entry point ini murni wiring (AGENTS.md #5): resolve workspace/session,
 * rakit dependency konkret (composition root, pola sama
 * `/api/jobs/run/route.ts`), ambil daftar `ConnectedAccount` AKTIF lewat
 * `WorkspaceService.listConnectedAccounts` (`ConnectedAccountsPort` di
 * `publishing.service.ts`), lalu sync SETIAP akun secara berurutan
 * (menghindari beban paralel ke Outstand yang tidak perlu untuk operasi
 * yang dipicu manual/jarang) dan akumulasi `newCommentsCount`.
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
    new NotificationService(notificationRepository),
    {
      async listActiveMembers(targetWorkspaceId, actingUserId) {
        const members = await workspaceRepository.listMembers(
          targetWorkspaceId,
          actingUserId,
        );
        return members
          .filter((member) => member.status === MemberStatus.Active)
          .map((member) => ({ userId: member.userId }));
      },
    },
  );

  try {
    const accounts = await workspaceService.listConnectedAccounts(
      workspaceId,
      userId,
    );
    const activeAccounts = accounts.filter(
      (account) => account.status === "active",
    );

    let newCommentsCount = 0;
    for (const account of activeAccounts) {
      const result = await syncCommentsUseCase.sync(
        {
          workspaceId,
          connectedAccountId: account.id,
          outstandAccountId: account.outstandAccountId,
        },
        userId,
      );
      newCommentsCount += result.newCommentsCount;
    }

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

/**
 * Detail satu inbox item + seluruh balasannya (T-053). Murni wiring —
 * resolve workspace/session, delegasi ke
 * `EngagementService.getInboxItemDetail`.
 */
export async function getInboxItemDetailAction(
  inboxItemId: string,
): Promise<{ data?: InboxItemDetail; error?: string }> {
  const { workspaceId } = await getWorkspaceContext();
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }
  const userId = asUserId(session.user.id);

  const engagementService = new EngagementService(
    engagementRepository,
    getOutstandAdapter(),
  );

  try {
    const data = await engagementService.getInboxItemDetail(
      { workspaceId, inboxItemId: asInboxItemId(inboxItemId) },
      userId,
    );
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
 * § "Reply via Outstand API", ADR-019/ADR-040). Murni wiring — resolve
 * workspace/session (RBAC: seluruh role member aktif workspace boleh
 * membalas, `roles-permissions.md` tidak membedakan akses Engagement per
 * role — tidak ada gating tambahan di sini selain member aktif, pola sama
 * Server Action lain), rakit `EngagementService` dengan `getOutstandAdapter()`
 * (pola sama `refreshInboxAction`), delegasi ke `EngagementService.reply`
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
