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
 * Hasil `cancelSchedule` — post yang sudah kembali ke status Draft, plus
 * `outstandPostId` post-level yang barusan dibaca (SEBELUM dihapus) supaya
 * use-case (`CancelScheduleUseCase`) bisa memanggil
 * `IOutstandAdapter.cancelScheduledPost` SEKALI SETELAH DB sudah commit —
 * sama pola dengan `schedulePost`/`publishNow` (persist dulu, network call
 * sesudah). Redesain 2026-08-26: dulu satu `outstandJobId` per target
 * (`CancelledPostTargetRecord[]`) — sekarang satu `outstandPostId` untuk
 * SELURUH post, konsisten dengan model baru "1 call Outstand mencakup semua
 * target". `null` kalau post belum pernah dapat `outstandPostId` (mis. race
 * jarang: baru saja dijadwalkan, adapter belum sempat mengembalikan id) —
 * use-case cukup skip pemanggilan adapter.
 */
export interface PublishingCancelScheduleRecord extends PublishingPostRecord {
  outstandPostId: string | null;
}

/**
 * Satu `PublishingPost` untuk Calendar (T-033.1, KSP-02) — beda dari
 * `QueueItemRecord` (khusus status Scheduled), Calendar mencakup semua
 * status yang tampil di mockup (KSP-02-F02): Draft, In Review, Ready to
 * Schedule, Scheduled, Published, Failed. `scheduledAt`/`publishedAt`
 * dibawa mentah (bukan di-collapse ke satu field "tanggal tampil") supaya
 * caller (`PublishingService.listCalendarPosts`) yang memutuskan urutan
 * dan penempatan grid — lihat catatan gap di bawah.
 *
 * **Gap diketahui (dilaporkan ke King Rezi, bukan keputusan sepihak):**
 * post berstatus Draft/InReview/ReadyToSchedule saat ini TIDAK punya
 * `scheduledAt` maupun `publishedAt` terisi di runtime manapun (keduanya
 * hanya diisi oleh `schedulePost`/`publishNow`) — jadi query rentang
 * tanggal generik di bawah ini otomatis tidak akan mengembalikan post
 * berstatus itu sama sekali walau tidak ada filter status eksplisit.
 * Placement 3 status itu di grid Calendar (kalau memang harus muncul di
 * grid, bukan di luar grid seperti daftar Drafts terpisah) adalah
 * keputusan produk yang belum ada di baseline — perlu ADR/klarifikasi
 * sebelum T-033.3/.4 (UI grid) diimplementasikan.
 */
export interface CalendarItemRecord {
  id: PostId;
  caption: string;
  status: ContentStatus;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  targets: QueueItemTargetRecord[];
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
   * OutstandAdapter. Redesain 2026-08-26: `platformPostId`/`platformPostUrl`
   * menggantikan `outstandJobId`/`publishedUrl` lama — keduanya sekarang
   * berasal dari `IOutstandAdapter.fetchPostOutcome` (per akun, dibaca
   * belakangan), BUKAN dari hasil sinkron `schedulePost`/`publishNow` (yang
   * sekarang hanya mengembalikan `outstandPostId` post-level, dipersist
   * lewat `setOutstandPostId` di bawah). `platformPostId` opsional karena
   * target yang gagal (`status: "failed"`) belum tentu punya id platform.
   * `userId` (RLS, KI-026 follow-up) — acting user for `withCurrentUser`;
   * called once per target AFTER the post-level
   * `outstandAdapter.schedulePost()` / `publishNow()` (dan, untuk Publish
   * Now, `fetchPostOutcome()`) network call sudah resolve/reject — never
   * inside the same transaction as the network call (connection pool
   * exhaustion risk).
   */
  updateTargetOutcome(
    input: {
      postTargetId: PostTargetId;
      platformPostId?: string;
      status: "scheduled" | "published" | "failed";
      platformPostUrl?: string;
      error?: string;
    },
    userId: UserId,
  ): Promise<void>;

  /**
   * Persist `outstandPostId` post-level (redesain 2026-08-26) — dipanggil
   * SETELAH `outstandAdapter.schedulePost()`/`publishNow()` resolve dengan
   * SATU id yang mencakup semua target, sebelum (untuk Publish Now)
   * `fetchPostOutcome` dipanggil dan sebelum `updateTargetOutcome` per
   * target. Terpisah dari `updateTargetOutcome` karena field ini post-level,
   * bukan per-target. `userId` (RLS, KI-026 follow-up) — acting user for
   * `withCurrentUser`; sama seperti `updateTargetOutcome`, tidak dipanggil
   * di dalam transaksi yang sama dengan network call.
   */
  setOutstandPostId(
    input: { workspaceId: WorkspaceId; postId: PostId; outstandPostId: string },
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
   * Calendar (T-033.1, KSP-02) — post apa pun (lihat catatan gap status di
   * `CalendarItemRecord`) di mana `scheduledAt` ATAU `publishedAt` jatuh
   * dalam rentang `[from, to]` (inklusif). Rentang generik — pemanggil
   * (Week 7 hari, Month 1 bulan + hari muted, T-033.2/.3/.4) yang
   * menentukan `from`/`to`, bukan method ini. `statuses` opsional — kalau
   * tidak diisi, SEMUA status ikut (beda dari `listQueue` yang selalu
   * hardcode `Scheduled`). `connectedAccountIds` opsional — filter post
   * yang punya minimal satu target ke salah satu akun itu.
   *
   * Urutan hasil TIDAK dijamin di sini (lihat implementasi Prisma — tidak
   * ada satu kolom tanggal tunggal yang valid untuk semua status buat
   * `orderBy`) — pengurutan final ("effective date" = `scheduledAt` ??
   * `publishedAt`) dilakukan pure function di
   * `PublishingService.listCalendarPosts` (`sortCalendarItemsByEffectiveDate`),
   * sama pola dengan `groupQueueItemsByDate`.
   *
   * `userId` (RLS, KI-026 follow-up) — acting user for `withCurrentUser`.
   */
  listCalendarPosts(
    input: {
      workspaceId: WorkspaceId;
      from: Date;
      to: Date;
      connectedAccountIds?: ConnectedAccountId[];
      statuses?: ContentStatus[];
    },
    userId: UserId,
  ): Promise<CalendarItemRecord[]>;

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

  /**
   * Bug fix (2026-08-26, ditemukan saat T-033 Calendar) — dipanggil oleh
   * `PublishNowUseCase.execute` SETELAH `Promise.all` target selesai, kalau
   * SEMUA target gagal publish. Sebelum fix ini, `publishNow` sudah
   * menandai post `Published` sebelum tahu hasil per target, dan tidak ada
   * langkah yang mengoreksinya kalau semua target ternyata gagal — post
   * tetap tercatat `Published` di DB meski tidak ada satu pun target yang
   * sukses. Semantik ini konsisten dengan `post.error` webhook Outstand
   * (`product-discovery/05-architecture/integration-layer.md:269-270`):
   * "Semua target gagal setelah retry" → status domain `failed`.
   *
   * **Diperluas (redesain ACL 2026-08-26)** — sekarang juga dipanggil oleh
   * `SchedulePostsUseCase.execute` saat SATU call
   * `outstandAdapter.schedulePost` (yang sekarang mencakup semua target)
   * gagal total: karena hanya ada satu call untuk semua target, gagalnya
   * call itu berarti SEMUA target pasti gagal (all-or-nothing, beda dari
   * model lama yang per-target dan bisa partial). Where-clause karena itu
   * menerima status awal `Published` ATAU `Scheduled` — bukan hanya
   * `Published`.
   *
   * Idempoten by design (`updateMany` hanya menyentuh baris yang masih di
   * salah satu status awal itu) — aman dipanggil lebih dari sekali kalau
   * use-case di-retry. Tidak menyentuh `PublishingPostTarget` — outcome per
   * target sudah ditulis oleh `updateTargetOutcome` sebelum method ini
   * dipanggil.
   *
   * `userId` (RLS, KI-026 follow-up) — acting user for `withCurrentUser`.
   */
  markPostFailed(
    input: { workspaceId: WorkspaceId; postId: PostId },
    userId: UserId,
  ): Promise<void>;
}
