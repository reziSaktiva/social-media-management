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
 * yang dideklarasikan di sini (YAGNI, sama seperti keputusan ADR-059) —
 * method lain (connectAccount, fetchComments, dst.) ditambahkan nanti saat
 * domain terkait benar-benar mengimplementasikannya.
 */
import type { ContentFormat } from "../enums";

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
 * Anti-Corruption Layer contract untuk Outstand (integration-layer.md,
 * ADR-040, redesain ADR baru 2026-08-26). Domain internal (Publishing,
 * Analytics, dst.) hanya mengenal interface ini — implementasi konkret
 * (real HTTP client maupun Fake) hidup di luar domain
 * (`apps/web/src/lib/adapters/outstand/`), dipilih lewat factory
 * `getOutstandAdapter`.
 */
export interface IOutstandAdapter {
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
   */
  fetchPostOutcome(outstandPostId: string): Promise<PostTargetOutcome[]>;

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
}
