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
 * Method yang tersedia mengikuti daftar resmi di
 * `product-discovery/05-architecture/integration-layer.md` (bagian
 * "OutstandAdapter"), tapi hanya method yang SUDAH dibutuhkan kode nyata
 * yang dideklarasikan di sini (YAGNI, sama seperti keputusan ADR-059) —
 * method lain (connectAccount, fetchComments, dst.) ditambahkan nanti saat
 * domain terkait benar-benar mengimplementasikannya.
 */
import type { ContentFormat } from "../enums";

export interface ScheduleOutstandPostInput {
  outstandAccountId: string;
  caption: string;
  scheduledAt: Date;
  contentFormat: ContentFormat;
  platformOptions?: Record<string, unknown>;
}

export interface ScheduleOutstandPostResult {
  outstandJobId: string;
}

/**
 * Publish Now (T-029, ADR-047) — sama dengan `ScheduleOutstandPostInput`
 * tanpa `scheduledAt`, karena aksi ini tayang langsung tanpa jeda jadwal.
 */
export interface PublishNowOutstandPostInput {
  outstandAccountId: string;
  caption: string;
  contentFormat: ContentFormat;
  platformOptions?: Record<string, unknown>;
}

export interface PublishNowOutstandPostResult {
  outstandJobId: string;
  /** URL post asli di platform — dipersist ke `PublishingPostTarget.publishedUrl` (T-034 detail post). */
  publishedUrl: string;
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
 * ADR-040). Domain internal (Publishing, Analytics, dst.) hanya mengenal
 * interface ini — implementasi konkret (real HTTP client maupun Fake)
 * hidup di luar domain (`apps/web/src/lib/adapters/outstand/`), dipilih
 * lewat factory `getOutstandAdapter`.
 */
export interface IOutstandAdapter {
  /** Publishing (ADR-059). */
  schedulePost(
    input: ScheduleOutstandPostInput,
  ): Promise<ScheduleOutstandPostResult>;

  /**
   * Publishing (T-029, ADR-047) — publish langsung tanpa jadwal ("Publish
   * Now"). Fake adapter (amandemen ADR-059, dicatat sebagai ADR baru oleh
   * Gibran Project Manager) mengembalikan hasil instan always-success,
   * sama seperti `schedulePost`.
   */
  publishNow(
    input: PublishNowOutstandPostInput,
  ): Promise<PublishNowOutstandPostResult>;

  /**
   * Analytics (T-041) — metrik satu post yang sudah dipublikasikan.
   * `outstandJobId` adalah external reference dari `PublishingPostTarget`,
   * BUKAN `PostId` internal — ACL tidak mengenal ID internal domain.
   */
  fetchPostMetrics(outstandJobId: string): Promise<FetchPostMetricsResult>;

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
