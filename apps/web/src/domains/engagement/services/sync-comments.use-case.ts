import {
  NotificationType,
  type ConnectedAccountId,
  type IOutstandAdapter,
  type UserId,
  type WorkspaceId,
} from "@social/shared";
import type { IEngagementRepository } from "../repositories/engagement.repository";

/**
 * Port lokal cross-domain `engagement` → `notification` (JOB-03 langkah 4,
 * `background-jobs.md`) — pola sama `NotificationPort` di
 * `OutstandWebhookProcessor` (`domains/publishing`). `engagement` TIDAK
 * mengimpor `NotificationService` konkret; composition root (job route)
 * menyuplai instance lewat constructor. Opsional — kalau tidak disuplai,
 * langkah notifikasi di-skip diam-diam (bukan throw), supaya use-case ini
 * tetap bisa jalan/di-test tanpa notification wiring lengkap.
 */
interface NotificationPort {
  notify(input: {
    workspaceId: WorkspaceId;
    userId: UserId;
    type: NotificationType;
    title: string;
    body: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }): Promise<unknown>;
}

/**
 * Port lokal cross-domain `engagement` → `workspace` (dependency arah ini
 * SUDAH legal — `application-layer.md` § "Peta Dependency Antar Domain":
 * "BC-05 Engagement ──→ BC-02 Workspace (filter per ConnectedAccount)").
 * Comments Inbox bisa diakses ketiga role (Owner/Admin/Creator,
 * `roles-permissions.md`) dan tidak ada "pemilik" tunggal seperti post —
 * notifikasi aggregate (langkah 4 JOB-03) karena itu di-fan-out ke SETIAP
 * member aktif workspace, bukan satu user (keputusan implementasi backend,
 * bukan ambiguitas UI/produk). `engagement` TIDAK mengimpor
 * `WorkspaceService` konkret — pola sama `ConnectedAccountsPort` di
 * `PublishingService`. Opsional — kalau tidak disuplai, notifikasi
 * di-skip (sama seperti `NotificationPort` tidak disuplai).
 */
interface WorkspaceMembersPort {
  listActiveMembers(
    workspaceId: WorkspaceId,
    userId: UserId,
  ): Promise<{ userId: UserId }[]>;
}

export interface SyncCommentsPayload {
  workspaceId: WorkspaceId;
  connectedAccountId: ConnectedAccountId;
  outstandAccountId: string;
}

export interface SyncCommentsResult {
  newCommentsCount: number;
}

/**
 * JOB-03 Engagement Sync (`background-jobs.md`, T-051) — logic sync MURNI
 * untuk SATU `ConnectedAccount`, dipisahkan dari job scheduling/self-reschedule
 * (itu tanggung jawab `EngagementSyncJobHandler`, BUKAN use-case ini) supaya
 * method `sync` bisa di-reuse LANGSUNG oleh manual refresh (T-052, tidak
 * self-reschedule) tanpa duplikasi logic sync.
 *
 * **`userId` untuk `withCurrentUser`/RLS:** job periodik (dipanggil lewat
 * `EngagementSyncJobHandler`) tidak punya Better Auth session per-request —
 * `userId` yang dipakai diteruskan APA ADANYA oleh caller (`sync` menerima
 * `userId` sebagai parameter terpisah dari `payload`, BUKAN bagian dari
 * payload JOB-03 resmi di `background-jobs.md`) — keputusan "user/service
 * account mana yang dipakai" ada di composition root (job route), bukan di
 * use-case ini (lihat catatan `EngagementSyncJobHandler`).
 */
export class SyncCommentsUseCase {
  constructor(
    private readonly repository: IEngagementRepository,
    private readonly adapter: IOutstandAdapter,
    private readonly notification?: NotificationPort,
    private readonly workspaceMembers?: WorkspaceMembersPort,
  ) {}

  async sync(
    payload: SyncCommentsPayload,
    userId: UserId,
  ): Promise<SyncCommentsResult> {
    const { workspaceId, connectedAccountId, outstandAccountId } = payload;

    // JOB-03 dokumentasi: "Memanggil `OutstandAdapter.fetchComments(outstandAccountId, cursor?)`"
    // dipanggil berulang sampai `nextCursor` habis dalam SATU run sync
    // (`background-jobs.md` § JOB-03 catatan `FetchCommentsResult`). Fake
    // adapter (T-051) selalu mengembalikan `nextCursor: null` (tidak
    // mensimulasikan pagination bertingkat), tapi loop di sini tetap benar
    // untuk real adapter nanti.
    let cursor: string | undefined;
    let newCommentsCount = 0;

    do {
      const { comments, nextCursor } = await this.adapter.fetchComments(
        outstandAccountId,
        cursor,
      );

      for (const comment of comments) {
        const { isNew } = await this.repository.upsertInboxItem(
          {
            workspaceId,
            connectedAccountId,
            platform: comment.platform,
            type: "comment",
            externalId: comment.outstandCommentId,
            authorHandle: comment.authorHandle,
            content: comment.content,
            receivedAt: comment.receivedAt,
          },
          userId,
        );

        if (isNew) {
          newCommentsCount += 1;
        }
      }

      cursor = nextCursor ?? undefined;
    } while (cursor !== undefined);

    if (newCommentsCount > 0) {
      await this.notifyNewComments(workspaceId, newCommentsCount, userId);
    }

    return { newCommentsCount };
  }

  /**
   * Notifikasi aggregate SATU KALI (bukan per-komentar, JOB-03 langkah 4)
   * ke setiap member aktif workspace. Diam-diam skip (tidak throw) kalau
   * salah satu port opsional tidak disuplai — lihat catatan
   * `NotificationPort`/`WorkspaceMembersPort` di atas.
   */
  private async notifyNewComments(
    workspaceId: WorkspaceId,
    newCommentsCount: number,
    userId: UserId,
  ): Promise<void> {
    if (!this.notification || !this.workspaceMembers) {
      return;
    }

    const members = await this.workspaceMembers.listActiveMembers(
      workspaceId,
      userId,
    );

    await Promise.all(
      members.map((member) =>
        this.notification?.notify({
          workspaceId,
          userId: member.userId,
          type: NotificationType.EngagementNewComments,
          title: "Komentar baru masuk",
          body:
            newCommentsCount === 1
              ? "1 komentar baru menunggu balasan di Comments Inbox."
              : `${newCommentsCount} komentar baru menunggu balasan di Comments Inbox.`,
        }),
      ),
    );
  }
}
