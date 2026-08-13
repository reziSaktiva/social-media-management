import type {
  ConnectedAccountId,
  ContentFormat,
  PostId,
  PostTargetId,
  SocialPlatform,
  UserId,
  WorkspaceId,
} from "@social/shared";
import type { ContentStatus } from "@social/shared";

export interface PublishingPostRecord {
  id: PostId;
  workspaceId: WorkspaceId;
  authorId: UserId;
  caption: string;
  status: ContentStatus;
  createdAt: Date;
  updatedAt: Date;
}

/** Input satu target saat menjadwalkan post — dipetakan ke `PublishingPostTarget`. */
export interface SchedulePostTargetInput {
  connectedAccountId: ConnectedAccountId;
  platform: SocialPlatform;
  contentFormat: ContentFormat;
  platformOptions?: Record<string, unknown>;
}

/** Target yang baru dibuat oleh `schedulePost` — id dibutuhkan untuk `updateTargetOutcome` per target. */
export interface ScheduledPostTargetRecord {
  id: PostTargetId;
  connectedAccountId: ConnectedAccountId;
}

export interface PublishingScheduleRecord extends PublishingPostRecord {
  targets: ScheduledPostTargetRecord[];
}

/** Repository interface — implementation (Prisma) lives in src/lib/repositories/publishing. */
export interface IPublishingRepository {
  createDraft(input: {
    workspaceId: WorkspaceId;
    authorId: UserId;
    caption: string;
  }): Promise<PublishingPostRecord>;

  /** `userId` (RLS, KI-026 follow-up) — acting user for `withCurrentUser`. */
  listDrafts(
    input: { workspaceId: WorkspaceId },
    userId: UserId,
  ): Promise<PublishingPostRecord[]>;

  /** `userId` (RLS, KI-026 follow-up) — acting user for `withCurrentUser`. */
  findDraftById(
    input: { workspaceId: WorkspaceId; postId: PostId },
    userId: UserId,
  ): Promise<PublishingPostRecord | null>;

  /**
   * Returns null when no matching draft exists in this workspace. `userId`
   * (RLS, KI-026 follow-up) — acting user for `withCurrentUser`.
   */
  updateDraftCaption(
    input: { workspaceId: WorkspaceId; postId: PostId; caption: string },
    userId: UserId,
  ): Promise<PublishingPostRecord | null>;

  /**
   * Guard ganda, keduanya wajib dalam satu transaksi atomik sebelum
   * replace `PublishingPostTarget` (delete+insert status `pending`):
   * 1. Status — post harus Draft/ReadyToSchedule (→ Scheduled).
   * 2. Ownership (anti-IDOR) — setiap `connectedAccountId` di `targets`
   *    harus terverifikasi milik `workspaceId` yang sama (implementasi
   *    Prisma: `workspaceConnectedAccount.count` di dalam transaksi).
   *    Guard ini WAJIB di layer repository — berlaku untuk semua caller,
   *    termasuk entry point yang belum ada (mis. Route Handler /api/v1
   *    AL-D08) yang mungkin tidak mereplikasi validasi di
   *    `components/draft-editor/actions.ts`.
   *
   * Returns `null` kalau salah satu guard gagal (post tidak ditemukan
   * dalam status yang valid, ATAU salah satu akun bukan milik workspace
   * ini) — tidak ada insert apa pun yang commit. Caller (`PublishingService`
   * / use-case) memperlakukan kedua kegagalan ini secara sama (error
   * generik `ConflictError`), tanpa perlu membedakan jenis guard yang gagal.
   *
   * `userId` (RLS, KI-026 follow-up) — acting user for `withCurrentUser`.
   * Caller (`SchedulePostsUseCase.execute`) MUST NOT wrap the subsequent
   * `outstandAdapter.schedulePost()` network call in the same transaction
   * this opens — see `updateTargetOutcome` below.
   */
  schedulePost(
    input: {
      workspaceId: WorkspaceId;
      postId: PostId;
      scheduledAt: Date;
      targets: SchedulePostTargetInput[];
    },
    userId: UserId,
  ): Promise<PublishingScheduleRecord | null>;

  /**
   * Update satu `PublishingPostTarget` by id dengan outcome dari
   * OutstandAdapter. `outstandJobId` opsional karena target yang gagal
   * (`status: "failed"`) belum tentu punya job id dari Outstand. `userId`
   * (RLS, KI-026 follow-up) — acting user for `withCurrentUser`; called
   * once per target AFTER that target's `outstandAdapter.schedulePost()`
   * network call has already resolved/rejected — never inside the same
   * transaction as the network call (connection pool exhaustion risk).
   */
  updateTargetOutcome(
    input: {
      postTargetId: PostTargetId;
      outstandJobId?: string;
      status: "scheduled" | "failed";
      error?: string;
    },
    userId: UserId,
  ): Promise<void>;

  /**
   * Batch count of scheduled `PublishingPostTarget` rows per
   * `connectedAccountId` — dipakai sidebar Channels (T-012.2) untuk badge
   * jumlah post terjadwal per akun. Batch via `groupBy` (bukan per-akun)
   * supaya `listSidebarChannels` tidak N+1 saat menghitung semua akun
   * sekaligus. Hanya menghitung post dengan status `Scheduled` dan
   * `deletedAt: null` (pola soft-delete konsisten dengan `listDrafts`).
   * `userId` (RLS, KI-026 follow-up) — acting user for `withCurrentUser`.
   */
  countScheduledByAccount(
    input: {
      workspaceId: WorkspaceId;
      connectedAccountIds: ConnectedAccountId[];
    },
    userId: UserId,
  ): Promise<Map<ConnectedAccountId, number>>;
}
