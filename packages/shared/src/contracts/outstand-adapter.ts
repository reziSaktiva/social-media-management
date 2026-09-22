/**
 * Kontrak Anti-Corruption Layer (ACL) untuk Outstand — promosi dari
 * `apps/web/src/domains/publishing/adapters/outstand-adapter.ts` (ADR-059)
 * ke `packages/shared` karena lebih dari satu domain (Publishing, Analytics)
 * membutuhkan kontrak yang sama sekarang (lihat ADR baru pasca ADR-078,
 * dicatat oleh Gibran Project Manager).
 *
 * Ini murni tipe/interface — tanpa implementasi maupun business logic —
 * konsisten dengan batasan `packages/shared` (ID, enum, value object).
 * Implementasi konkret (Fake maupun real HTTP client nanti) tetap hidup di
 * luar package ini, di `apps/web/src/lib/adapters/outstand/`.
 *
 * **Redesain (ADR baru, 2026-08-26)** — kontrak `schedulePost`/`publishNow`
 * di bawah ini MENGGANTI bentuk lama (1 call per target, `publishedUrl`
 * instan). Setelah membaca dokumentasi resmi Outstand (`create-a-post`),
 * ditemukan mismatch: Outstand menerima SEMUA target/akun dalam SATU call
 * (`accounts: array<string>`) dan mengembalikan SATU `post.id` — bukan satu
 * job per akun, dan response create-post TIDAK mengonfirmasi hasil publish
 * per akun secara sinkron (bahkan untuk publish langsung tanpa jadwal).
 * Status/outcome per akun baru tersedia belakangan lewat `get-post-details`
 * (`fetchPostOutcome`, lihat di bawah) atau webhook (T-026). Method yang
 * tersedia mengikuti daftar resmi di
 * `product-discovery/05-architecture/integration-layer.md` (bagian
 * "OutstandAdapter"), tapi hanya method yang SUDAH dibutuhkan kode nyata
 * yang dideklarasikan di sini (YAGNI, sama seperti keputusan ADR-059).
 *
 * **`fetchComments`/`replyToComment` (T-051/T-054, Engagement MVP)** —
 * ditambahkan saat domain `engagement` mulai diimplementasikan. Nama dan
 * signature persis mengikuti narasi resmi di `integration-layer.md`
 * ("OutstandAdapter", JOB-03 Engagement Sync):
 * `fetchComments(outstandAccountId, cursor?)` dan
 * `replyToComment(outstandCommentId, text)`.
 *
 * **`connectAccount`/`exchangeConnectCode` (ADR-105, 2026-09-11)** —
 * ditambahkan untuk T-015.3 (Reconnect flow) yang ternyata membutuhkan
 * alur redirect OAuth yang sama dengan T-013.1/T-013.2 (Connect Account,
 * belum diimplementasikan sama sekali sebelumnya). `integration-layer.md`
 * menyebut "Request OAuth URL" sebagai langkah narasi terpisah tapi tidak
 * mendefinisikan method-nya eksplisit di tabel kontrak — ADR-105
 * mendesain split 2-method ini (bukan menebak liar) dan menjadi kontrak
 * resmi untuk keduanya.
 *
 * **`uploadMediaWorkingCopy` (ADR-106, 2026-09-14)** — ditambahkan untuk
 * T-024.3 (media upload working copy Draft Editor). BEDA dari
 * `connectAccount`/`exchangeConnectCode`: ketiga langkah narasi Outstand
 * Media API (request upload URL → PUT bytes → confirm) murni
 * server-to-server tanpa redirect browser, jadi digabung menjadi SATU
 * method alih-alih split 2 method — lihat ADR-106 untuk perbandingan
 * eksplisit dengan alasan split ADR-105.
 */
import type { ContentFormat, SocialPlatform } from "../enums";

/**
 * Satu target akun dalam SATU call `schedulePost`/`publishNow`. Outstand
 * `create-a-post` menerima array `accounts` dan menghasilkan SATU post-level
 * id untuk seluruh target — `contentFormat`/`platformOptions` tetap per
 * target karena bisa berbeda per akun (ADR-039, Content Format per akun
 * tujuan, mis. Reel di Instagram + Post biasa di Facebook dalam satu aksi
 * publish yang sama).
 */
export interface OutstandPostTargetInput {
  outstandAccountId: string;
  contentFormat: ContentFormat;
  platformOptions?: Record<string, unknown>;
}

export interface ScheduleOutstandPostInput {
  targets: OutstandPostTargetInput[];
  caption: string;
  scheduledAt: Date;
}

export interface ScheduleOutstandPostResult {
  /** Satu id post-level dari Outstand, mencakup SEMUA target dalam `targets`. */
  outstandPostId: string;
}

/**
 * Publish Now (T-029, ADR-047) — sama dengan `ScheduleOutstandPostInput`
 * tanpa `scheduledAt`, karena aksi ini tayang langsung tanpa jeda jadwal.
 * Ini murni beda niat domain (dan RBAC-nya, ADR-074) — bukan endpoint
 * Outstand yang berbeda. Di Outstand asli, `create-a-post` dengan
 * `scheduledAt` kosong = publish langsung; ACL (implementasi konkret di
 * `apps/web/src/lib/adapters/outstand/`) yang menyembunyikan detail ini,
 * domain internal tetap memanggil dua method terpisah supaya tipe input
 * tetap ketat sesuai niat (`PublishNowOutstandPostInput` sengaja tidak
 * punya field `scheduledAt` untuk dilupakan) dan Cancel Schedule hanya
 * relevan untuk hasil `schedulePost`, bukan `publishNow`.
 */
export interface PublishNowOutstandPostInput {
  targets: OutstandPostTargetInput[];
  caption: string;
}

export interface PublishNowOutstandPostResult {
  /** Satu id post-level dari Outstand, mencakup SEMUA target dalam `targets`. */
  outstandPostId: string;
}

/**
 * Status satu target (akun) di dalam satu Outstand post — dikenal belakangan
 * (async), baik lewat polling `fetchPostOutcome` maupun webhook (T-026).
 * `pending` berarti Outstand belum menyelesaikan publish ke akun ini.
 */
export type OutstandPostTargetStatus = "pending" | "published" | "failed";

/**
 * Outcome satu target (akun) di dalam satu Outstand post — dipetakan dari
 * `socialAccounts[]` pada response `get-post-details`/`list-posts` Outstand.
 * `platformPostId` adalah ID post di platform aslinya (mis. ID media
 * Instagram) — BEDA dari `outstandPostId` (ID post di sisi Outstand).
 */
export interface PostTargetOutcome {
  outstandAccountId: string;
  status: OutstandPostTargetStatus;
  error: string | null;
  platformPostId: string | null;
  platformPostUrl: string | null;
  publishedAt: Date | null;
}

/**
 * Period yang dikenali Outstand untuk `fetchWorkspaceMetrics`
 * (`background-jobs.md` JOB-04 payload) — vocabulary eksternal Outstand,
 * SENGAJA dibedakan dari `SnapshotPeriod` domain internal analytics
 * (`weekly` | `monthly`, lihat `apps/web/src/domains/analytics/types.ts`).
 * `AnalyticsIngestionUseCase` (domain analytics) yang memetakan salah satu
 * ke yang lain — ACL tidak boleh bocor ke bahasa domain begitu saja,
 * sebaliknya juga tidak.
 */
export type OutstandMetricsPeriod = "last_7_days" | "last_30_days";

/**
 * Connect Account (T-013.1/T-013.2 Connect Account, T-015.3 Reconnect,
 * ADR-105) — input untuk meminta OAuth URL. `integration-layer.md`
 * ("Alur Connect Account", langkah 1-2) menyebut "Request OAuth URL"
 * sebagai langkah terpisah dari "exchange code" tapi tidak mendefinisikan
 * method-nya secara eksplisit di tabel kontrak — ADR-105 menutup gap ini
 * dengan split 2-method, mengikuti pola yang sudah ada di kontrak ini
 * (`schedulePost`/`publishNow` = inisiasi, `fetchPostOutcome` = resolve
 * belakangan).
 *
 * `redirectAccountId` diisi HANYA untuk reconnect akun existing (T-015.3,
 * akun `expired`/`disconnected` yang diulang OAuth-nya) — kosong berarti
 * connect akun baru (T-013). Field ini murni diteruskan lewat `state` ke
 * callback supaya `WorkspaceService` tahu harus UPDATE
 * `ConnectedAccount` yang sudah ada, bukan CREATE baru — adapter sendiri
 * tidak membuat keputusan domain itu.
 */
export interface ConnectAccountInput {
  workspaceId: string;
  platform: SocialPlatform;
  redirectAccountId?: string;
}

export interface ConnectAccountResult {
  /**
   * URL tujuan redirect browser user. Pada Fake adapter (ADR-059/ADR-105),
   * URL ini loopback ke callback route KITA SENDIRI
   * (`/api/integrations/outstand/callback`) alih-alih domain eksternal
   * Outstand — lihat ADR-105 untuk alasan (arsitektur Route Handler
   * callback tetap teruji sebelum real adapter T-025 masuk).
   */
  redirectUrl: string;
}

/**
 * Exchange Connect Code (T-013.1/T-013.2, T-015.3, ADR-105) — dipanggil
 * Route Handler `/api/integrations/outstand/callback` (Prabowo Feature
 * Engineer, di luar scope method ini) setelah Outstand (atau Fake,
 * loopback) mengarahkan balik dengan `code`+`state`.
 */
export interface ExchangeConnectCodeInput {
  code: string;
  state: string;
}

/**
 * Hasil exchange code — dipetakan langsung ke field `ConnectedAccount`
 * yang disimpan `WorkspaceService` (`integration-layer.md`, "Data yang
 * disimpan pada ConnectedAccount"). `status` selalu `"active"` di sini —
 * value lain (`expired`/`disconnected`) hanya muncul belakangan lewat
 * webhook/aksi disconnect, bukan hasil connect yang baru saja berhasil.
 */
export interface ConnectedAccountData {
  outstandAccountId: string;
  platform: SocialPlatform;
  handle: string;
  status: "active";
}

/**
 * Media upload working copy (T-024.3, ADR-040 poin 4, ADR-106) — dipanggil
 * SEBELUM `schedulePost`/`publishNow` untuk setiap media original (Supabase
 * Storage, T-024.2) yang akan disertakan pada sebuah post. Original media
 * TETAP menjadi milik aplikasi di bucket private Supabase Storage
 * (`integration-layer.md` IL-D07) — method ini murni membungkus 3 langkah
 * narasi Outstand Media API (request upload URL → `PUT` bytes → confirm
 * upload) menjadi SATU panggilan ACL, karena ketiga langkah itu murni
 * server-to-server (tidak ada redirect browser yang perlu diuji terpisah
 * seperti `connectAccount`/`exchangeConnectCode`, ADR-105) — lihat ADR-106
 * untuk perbandingan eksplisit split-2-method vs gabungan ini.
 *
 * `fileBuffer` adalah bytes media original yang sudah diambil caller dari
 * Supabase Storage (mis. lewat signed URL `MediaItem.url`) — adapter tidak
 * mengenal Supabase sama sekali, konsisten dengan batasan ACL.
 */
export interface UploadMediaWorkingCopyInput {
  fileBuffer: Buffer;
  mimeType: string;
}

/**
 * Hasil dipetakan langsung ke field `MediaItem.outstandMediaId`/
 * `outstandMediaUrl`/`outstandExpiresAt` (skema sudah mengantisipasi field
 * ini sejak T-024.1) — persistensinya sendiri di luar scope method ini
 * (tanggung jawab use-case pemanggil, T-024.4/T-025.5).
 */
export interface UploadMediaWorkingCopyResult {
  outstandMediaId: string;
  outstandMediaUrl: string;
  expiresAt: Date;
}

/**
 * NOTE (2026-08-26, dicatat sebagai gap diketahui, bukan diimplementasikan
 * penuh di sini — di luar scope redesain ini, lihat draft ADR): dokumentasi
 * resmi Outstand `get-post-analytics` sebenarnya mengembalikan metrics
 * PER-AKUN sekaligus `aggregated_metrics` di root untuk SATU `outstandPostId`
 * — bentuk yang lebih kaya daripada satu `FetchPostMetricsResult` flat di
 * bawah. Kontrak ini TIDAK diubah sekarang (scope redesain ini murni publish
 * flow); parameter berganti nama dari `outstandJobId` (dulu per-target, ID
 * yang sekarang sudah tidak ada) menjadi `outstandPostId` (post-level, sesuai
 * model baru) supaya tetap kompilasi dan konsisten penamaan, tapi caller
 * (`AnalyticsIngestionUseCase.syncPostMetrics`) masih memanggil sekali per
 * target dengan `outstandPostId` yang sama untuk semua target satu post —
 * revisi penuh (array per-akun + aggregate) didokumentasikan sebagai
 * follow-up T-041, bukan bagian ADR ini.
 */
export interface FetchPostMetricsResult {
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number | null;
  engagementRate: number;
}

export interface FetchWorkspaceMetricsResult {
  totalPosts: number;
  totalReach: number;
  totalEngagements: number;
  avgEngagementRate: number;
}

/**
 * Satu komentar external Outstand (Engagement MVP, T-051) — dipetakan ke
 * `EngagementInboxItem` oleh `EngagementService` saat upsert (external
 * comment ID = `outstandCommentId`, dedup key bersama `outstandAccountId`).
 * `outstandPostId` nullable — Outstand bisa mengembalikan komentar yang
 * postnya sudah dihapus/tidak terlacak di sisi kita (IL-D09, comments-only
 * MVP, tanpa DM/mention).
 */
export interface InboxCommentData {
  outstandCommentId: string;
  outstandAccountId: string;
  platform: SocialPlatform;
  authorHandle: string;
  content: string;
  outstandPostId: string | null;
  receivedAt: Date;
}

/**
 * Hasil `fetchComments` — dipaginasi (`nextCursor`, `null` berarti halaman
 * terakhir). JOB-03 (`background-jobs.md`) memanggil ini berulang per
 * `ConnectedAccount` sampai `nextCursor` habis dalam satu run sync.
 */
export interface FetchCommentsResult {
  comments: InboxCommentData[];
  nextCursor: string | null;
}

/**
 * Hasil `replyToComment` — dipetakan ke `EngagementReply.outstandReplyId`
 * (T-054).
 */
export interface ReplyToCommentResult {
  outstandReplyId: string;
}

/**
 * Anti-Corruption Layer contract untuk Outstand (integration-layer.md,
 * ADR-040, redesain ADR baru 2026-08-26). Domain internal (Publishing,
 * Analytics, dst.) hanya mengenal interface ini — implementasi konkret
 * (real HTTP client maupun Fake) hidup di luar domain
 * (`apps/web/src/lib/adapters/outstand/`), dipilih lewat factory
 * `getOutstandAdapter`.
 */
export interface IOutstandAdapter {
  /**
   * Connect Account (T-013.1/T-013.2, T-015.3 Reconnect, ADR-105) —
   * langkah 1 dari alur 2-tahap OAuth (`integration-layer.md`, "Alur
   * Connect Account"): minta URL redirect OAuth. Dipanggil
   * `WorkspaceService` saat user klik "Connect Account" (T-013) atau
   * "Reconnect" (T-015.3, dengan `redirectAccountId` diisi). Tidak
   * membuat/mengubah `ConnectedAccount` apa pun — itu terjadi belakangan
   * di `exchangeConnectCode` setelah callback.
   */
  connectAccount(input: ConnectAccountInput): Promise<ConnectAccountResult>;

  /**
   * Connect Account (T-013.1/T-013.2, T-015.3 Reconnect, ADR-105) —
   * langkah 2 dari alur 2-tahap OAuth: tukar `code`+`state` (dari
   * callback) dengan data akun final. Dipanggil Route Handler
   * `/api/integrations/outstand/callback` (di luar scope kontrak ini).
   * `WorkspaceService` yang memutuskan CREATE (connect baru) vs UPDATE
   * (reconnect) `ConnectedAccount` berdasarkan `redirectAccountId` yang
   * dibawa lewat `state` — bukan tanggung jawab adapter.
   */
  exchangeConnectCode(
    input: ExchangeConnectCodeInput,
  ): Promise<ConnectedAccountData>;

  /**
   * Media upload working copy (T-024.3, ADR-040 poin 4, ADR-106) — minta
   * Outstand meng-host working copy satu media original, dipanggil sebelum
   * `schedulePost`/`publishNow` untuk post yang menyertakan media.
   * `PublishingService` yang bertanggung jawab mengambil `fileBuffer` dari
   * Supabase Storage dan mengisi `PostTarget`/caption dengan
   * `outstandMediaUrl` hasil method ini — adapter tidak menyimpan apa pun,
   * hanya membentuk working copy sekali panggil.
   */
  uploadMediaWorkingCopy(
    input: UploadMediaWorkingCopyInput,
  ): Promise<UploadMediaWorkingCopyResult>;

  /**
   * Publishing (ADR-059, redesain 2026-08-26) — SATU call untuk SEMUA
   * target/akun tujuan post ini, sesuai kontrak resmi Outstand
   * `create-a-post` (`accounts: array<string>`, satu `post.id` untuk semua
   * target). Tidak mengembalikan outcome per akun — itu tanggung jawab
   * `fetchPostOutcome` (polling) atau webhook `post.published`/`post.error`
   * (T-026).
   */
  schedulePost(
    input: ScheduleOutstandPostInput,
  ): Promise<ScheduleOutstandPostResult>;

  /**
   * Publishing (T-029, ADR-047, redesain 2026-08-26) — publish langsung
   * tanpa jadwal ("Publish Now"), SATU call untuk semua target sama seperti
   * `schedulePost`. Fake adapter (ADR-059) tetap always-success instan,
   * tapi sekarang hanya mengembalikan `outstandPostId` — caller yang
   * membutuhkan outcome per akun instan (mis. `publishedUrl` untuk UI)
   * memanggil `fetchPostOutcome(outstandPostId)` segera setelah ini,
   * bukan menerimanya langsung dari hasil `publishNow`.
   */
  publishNow(
    input: PublishNowOutstandPostInput,
  ): Promise<PublishNowOutstandPostResult>;

  /**
   * Publishing (redesain 2026-08-26, menggantikan model lama tanpa method
   * ini) — resolve status per akun BELAKANGAN untuk satu `outstandPostId`.
   * Dipetakan dari `socialAccounts[]` pada response `get-post-details`
   * Outstand. Dipakai untuk polling SEKARANG (webhook T-026 belum ada) dan
   * tetap relevan setelah webhook ada (webhook bisa memicu pembacaan ini
   * alih-alih membawa payload lengkap, sesuai IL-D11 di
   * `integration-layer.md`). Nama method ini sudah dipakai di
   * `integration-layer.md` (bagian "OutstandAdapter", sebelum redesain) —
   * dipertahankan sengaja supaya T-026 (webhook, belum dikerjakan) tidak
   * perlu rework nama method saat diimplementasikan nanti.
   *
   * **`expectedOutstandAccountIds` (bug fix T-027, root-cause — dikonfirmasi
   * King Rezi via `AskUserQuestion` setelah temuan QA Najwa):** parameter
   * WAJIB berisi daftar `outstandAccountId` yang caller harapkan punya
   * outcome untuk `outstandPostId` ini. Ditambahkan karena implementasi
   * SEBELUMNYA membiarkan `FakeOutstandAdapter` "mengingat" set akun per
   * `outstandPostId` lewat `Map` in-memory level-modul yang diisi saat
   * `schedulePost`/`publishNow` dipanggil — ini SALAH untuk T-027 (job
   * runner Railway Cron): `schedulePost()` dipanggil dari Server Action,
   * `fetchPostOutcome()` dipanggil BELAKANGAN (bisa berjam-jam/berhari-hari)
   * dari Route Handler TERPISAH (`/api/jobs/run`) — dibuktikan lewat
   * inspeksi `.next/server` build production (Turbopack) bahwa Next.js
   * membundle Route Handler dan Server Action/RSC page sebagai CHUNK
   * TERPISAH yang masing-masing mendapat SALINAN modul `FakeOutstandAdapter`
   * sendiri (module-level state TIDAK dijamin sama), dan bahkan seandainya
   * dijamin sama (mis. `globalThis` caching), memori proses tidak survive
   * restart Railway (auto-deploy tiap push, DI-D05) di antara waktu
   * schedule dan waktu due post yang bisa berjeda lama.
   *
   * Real Outstand API TIDAK butuh parameter ini secara fungsional (server
   * mereka sudah tahu account list persis dari `create-a-post` yang
   * disimpan di sisi mereka, durable) — real adapter (T-025, belum ada)
   * boleh mengabaikannya atau memakainya untuk validasi/filter defensif.
   * Untuk Fake (ADR-059), parameter ini membuat method jadi PURE FUNCTION
   * dari `(outstandPostId, expectedOutstandAccountIds)` — tidak butuh
   * state/memori lintas panggilan sama sekali.
   */
  fetchPostOutcome(
    outstandPostId: string,
    expectedOutstandAccountIds: string[],
  ): Promise<PostTargetOutcome[]>;

  /**
   * Publishing (T-030, ADR-049 Tier 2, redesain 2026-08-26) — batalkan
   * SELURUH post yang sudah dijadwalkan di Outstand ("Cancel Schedule").
   * `outstandPostId` adalah external reference post-level dari
   * `PublishingPost.outstandPostId` (BUKAN per-target lagi — Outstand tidak
   * punya konsep "job per akun" untuk dibatalkan satu-satu; membatalkan
   * post berarti membatalkan seluruh target sekaligus). Tidak mengembalikan
   * apa pun (`void`): repository sudah menjadi source of truth begitu post
   * kembali ke status Draft, panggilan ini murni membersihkan sisi
   * Outstand supaya job yang dibatalkan tidak tetap tayang di sana.
   */
  cancelScheduledPost(outstandPostId: string): Promise<void>;

  /**
   * Retry manual (T-034.4, ADR-092) — Outstand tidak punya endpoint retry
   * resmi; rekomendasi dokumentasi resminya adalah hapus post yang gagal
   * (`delete-a-post-from-social-networks`) lalu buat post baru
   * (`create-a-post`), bukan re-trigger job yang sama. Method ini memetakan
   * langkah "hapus" itu.
   *
   * **Keputusan scope (dikonfirmasi King Rezi, bukan asumsi):** retry hanya
   * me-recreate TARGET yang gagal (satu akun), BUKAN seluruh post — target
   * lain di post yang sama yang sudah `published` tidak disentuh. Karena
   * itu, `accountIds` opsional membatasi penghapusan ke akun tertentu saja
   * di dalam `outstandPostId`; kosongkan untuk menghapus seluruh post
   * (dipakai jalur lain di luar retry, kalau ada). Recreate target yang
   * gagal memakai `publishNow`/`schedulePost` yang sudah ada (dipanggil
   * dengan array `targets` berisi 1 target) — TIDAK ada method create baru
   * di kontrak ini untuk itu.
   *
   * Best-effort di level use-case (pola sama seperti `cancelScheduledPost`:
   * kegagalan panggilan ini di real adapter nanti cukup di-log oleh
   * pemanggil, bukan dilempar ke user) — tapi di level adapter, method ini
   * tetap boleh throw error seperti method lain kalau real adapter (T-025)
   * gagal memanggil Outstand; pemanggil (use-case publishing) yang
   * menentukan bagaimana error itu ditangani.
   */
  deletePost(outstandPostId: string, accountIds?: string[]): Promise<void>;

  /**
   * Analytics (T-041) — metrik satu post yang sudah dipublikasikan.
   * `outstandPostId` adalah external reference post-level dari
   * `PublishingPost.outstandPostId` (redesain 2026-08-26 — dulu per-target
   * `outstandJobId` yang sudah tidak ada di model baru). Lihat catatan gap
   * di `FetchPostMetricsResult` — bentuk hasil belum direvisi mengikuti
   * `aggregated_metrics`/per-akun Outstand, follow-up T-041.
   */
  fetchPostMetrics(outstandPostId: string): Promise<FetchPostMetricsResult>;

  /**
   * Analytics (T-041) — metrik agregat satu connected account untuk
   * `period` tertentu. `outstandAccountId` adalah external reference dari
   * `WorkspaceConnectedAccount`.
   */
  fetchWorkspaceMetrics(
    outstandAccountId: string,
    period: OutstandMetricsPeriod,
  ): Promise<FetchWorkspaceMetricsResult>;

  /**
   * Engagement Sync (JOB-03, T-051) — ambil komentar baru untuk satu
   * `ConnectedAccount`, dipaginasi lewat `cursor` (kosong = halaman
   * pertama). Dipanggil `EngagementSyncJobHandler` (periodik 30 menit) dan
   * manual refresh (T-052) — keduanya lewat use-case yang sama
   * (`integration-layer.md` § "Engagement Data Sync").
   */
  fetchComments(
    outstandAccountId: string,
    cursor?: string,
  ): Promise<FetchCommentsResult>;

  /**
   * Reply dari dalam aplikasi (T-054) — dipanggil `EngagementService`
   * setelah RBAC check lolos. `outstandCommentId` adalah external
   * reference dari `InboxCommentData`/`EngagementInboxItem.externalId`.
   */
  replyToComment(
    outstandCommentId: string,
    text: string,
  ): Promise<ReplyToCommentResult>;
}
