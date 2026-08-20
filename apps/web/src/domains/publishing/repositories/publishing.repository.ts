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

/**
 * Satu target (akun + platform) milik queue item (T-032.2, KSP-03).
 * `accountHandle` dipetakan dari `WorkspaceConnectedAccount.handle` supaya
 * UI Queue (T-032.3) tidak perlu query terpisah per akun.
 */
export interface QueueItemTargetRecord {
  id: PostTargetId;
  connectedAccountId: ConnectedAccountId;
  platform: SocialPlatform;
  contentFormat: ContentFormat;
  accountHandle: string;
}

/**
 * Satu `PublishingPost` berstatus Scheduled untuk Queue (T-032.2, KSP-03,
 * ADR-083). `targets` bisa lebih dari satu kalau post yang sama
 * dijadwalkan ke beberapa akun sekaligus — tetap 1 `QueueItemRecord` per
 * post ("1 card per schedule", T-032.0), bukan 1 record per target.
 * `createdAt` dipakai UI untuk label "Dibuat X lalu" (T-032.0 putaran 1).
 */
export interface QueueItemRecord {
  id: PostId;
  caption: string;
  scheduledAt: Date;
  createdAt: Date;
  targets: QueueItemTargetRecord[];
}

/**
 * Satu target yang ikut dibatalkan oleh `cancelSchedule` (T-030, ADR-049
 * Tier 2). `outstandJobId` dibawa keluar transaksi supaya use-case
 * (`CancelScheduleUseCase`) bisa memanggil `IOutstandAdapter.cancelScheduledPost`
 * per target SETELAH DB sudah commit — sama pola dengan `schedulePost`/
 * `publishNow` (persist dulu, network call sesudah, supaya tidak ada
 * inkonsistensi tanpa jejak DB). `null` kalau target belum pernah dapat
 * `outstandJobId` (mis. race jarang: baru saja dijadwalkan, adapter belum
 * sempat mengembalikan job id) — use-case cukup skip pemanggilan adapter
 * untuk target itu.
 */
export interface CancelledPostTargetRecord {
  outstandJobId: string | null;
}

/**
 * Hasil `cancelSchedule` — post yang sudah kembali ke status Draft, plus
 * daftar target yang barusan dihapus (untuk dibatalkan juga di sisi
 * Outstand oleh use-case).
 */
export interface PublishingCancelScheduleRecord extends PublishingPostRecord {
  cancelledTargets: CancelledPostTargetRecord[];
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
   * (`status: "failed"`) belum tentu punya job id dari Outstand.
   * `publishedUrl` hanya relevan untuk outcome Publish Now (T-029) yang
   * sukses — dipersist untuk detail post nanti (T-034). `userId` (RLS,
   * KI-026 follow-up) — acting user for `withCurrentUser`; called once per
   * target AFTER that target's `outstandAdapter.schedulePost()` /
   * `publishNow()` network call has already resolved/rejected — never
   * inside the same transaction as the network call (connection pool
   * exhaustion risk).
   */
  updateTargetOutcome(
    input: {
      postTargetId: PostTargetId;
      outstandJobId?: string;
      status: "scheduled" | "published" | "failed";
      publishedUrl?: string;
      error?: string;
    },
    userId: UserId,
  ): Promise<void>;

  /**
   * Publish Now (T-029, ADR-047) — sama pola guard dengan `schedulePost`
   * (status Draft/ReadyToSchedule → Published, ownership anti-IDOR wajib
   * dalam transaksi atomik yang sama), bedanya tidak ada `scheduledAt` dan
   * post langsung ditandai `publishedAt` alih-alih `scheduledAt`. Returns
   * `null` kalau salah satu guard gagal — caller memperlakukan sama seperti
   * `schedulePost` (`ConflictError` generik).
   *
   * `userId` (RLS, KI-026 follow-up) — acting user for `withCurrentUser`.
   * Caller (`PublishNowUseCase.execute`) MUST NOT wrap the subsequent
   * `outstandAdapter.publishNow()` network call in the same transaction
   * this opens — sama alasan seperti `schedulePost`/`updateTargetOutcome`.
   */
  publishNow(
    input: {
      workspaceId: WorkspaceId;
      postId: PostId;
      targets: SchedulePostTargetInput[];
    },
    userId: UserId,
  ): Promise<PublishingScheduleRecord | null>;

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

  /**
   * Queue (T-032.2, KSP-03, ADR-083) — semua `PublishingPost` berstatus
   * Scheduled milik workspace, diurutkan `scheduledAt` ascending. TIDAK
   * memakai model Prisma `PublishingQueueSlot` (deprecated, ADR-083) —
   * query langsung ke `PublishingPost` + `PublishingPostTarget` +
   * `WorkspaceConnectedAccount`. Grouping per tanggal dilakukan di
   * `PublishingService.listQueue` (`groupQueueItemsByDate`, pure
   * function) — bukan di query ini, supaya repository tetap murni
   * proyeksi data terurut, tidak membawa keputusan tampilan.
   *
   * `userId` (RLS, KI-026 follow-up) — acting user for `withCurrentUser`.
   */
  listQueue(
    input: { workspaceId: WorkspaceId },
    userId: UserId,
  ): Promise<QueueItemRecord[]>;

  /**
   * Cancel Schedule (T-030.1, ADR-049 Tier 2) — kebalikan dari
   * `schedulePost`: post kembali ke status Draft (`scheduledAt` di-null-kan)
   * dan seluruh `PublishingPostTarget` milik post itu dihapus (post Draft
   * tidak punya target persisten, sama seperti Draft yang belum pernah
   * dijadwalkan — lihat `schedulePost`, yang selalu `deleteMany` + recreate
   * target saat (re)schedule).
   *
   * Guard: hanya post berstatus `Scheduled` yang bisa dibatalkan. Returns
   * `null` kalau post tidak ditemukan, bukan milik `workspaceId` ini, atau
   * statusnya bukan `Scheduled` — caller memperlakukan sama seperti
   * `schedulePost`/`publishNow` (`ConflictError` generik).
   *
   * Tidak ada guard ownership akun (anti-IDOR) di sini seperti
   * `schedulePost` — method ini hanya MENGHAPUS target existing, tidak
   * memperkenalkan `connectedAccountId` baru dari input caller.
   *
   * `userId` (RLS, KI-026 follow-up) — acting user for `withCurrentUser`.
   * Caller (`CancelScheduleUseCase.execute`) MUST NOT wrap the subsequent
   * `outstandAdapter.cancelScheduledPost()` network call in the same
   * transaction this opens — sama alasan seperti `schedulePost`/
   * `updateTargetOutcome`.
   */
  cancelSchedule(
    input: { workspaceId: WorkspaceId; postId: PostId },
    userId: UserId,
  ): Promise<PublishingCancelScheduleRecord | null>;
}
