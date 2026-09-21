import { ContentStatus } from "@social/shared";
import type {
  ConnectedAccountId,
  MediaId,
  MemberRole,
  PostId,
  SocialPlatform,
  UserId,
  WorkspaceId,
} from "@social/shared";
import type { PostMetricsRecord, SnapshotPeriod } from "@/domains/analytics";
import { ConflictError, NotFoundError } from "@/lib/utils/errors";
import { assertActorCanDeletePost } from "../rbac";
import type {
  CalendarItemRecord,
  HistoryItemRecord,
  IPublishingRepository,
  PublishingPostRecord,
} from "../repositories/publishing.repository";
import { groupQueueItemsByDate, type QueueGroup } from "./group-queue-items";
import { resolvePostPerformancePeriodRange } from "./post-performance-period-range";
import { sortCalendarItemsByEffectiveDate } from "./sort-calendar-items";

/**
 * Port lokal untuk cross-domain `publishing` → `analytics` (T-033.1,
 * KSP-02-F08, AGENTS.md #7) — pola sama seperti `ScheduledCountsPort` di
 * `WorkspaceService`/`NotificationPort`. `AnalyticsService` konkret TIDAK
 * boleh diimport ke file ini; composition root (Server Action, T-033.2)
 * menyuplai instance lewat constructor. Opsional — kalau tidak disuplai,
 * `listCalendarPosts` tetap jalan tapi `metrics` semua item Published
 * berupa array kosong (bukan error), supaya caller lama/test tanpa
 * kebutuhan metrik tidak wajib berubah.
 */
interface PostMetricsPort {
  getPostMetricsByPosts(
    postIds: PostId[],
  ): Promise<Map<PostId, PostMetricsRecord[]>>;
}

/**
 * Port lokal untuk cross-domain `publishing` → `workspace` (T-046.1,
 * AGENTS.md #7) — arah ini SUDAH legal di `application-layer.md` § Peta
 * Dependency Antar Domain ("BC-03 Publishing → BC-02 Workspace, verifikasi
 * ConnectedAccount"), jadi tidak menambah dependency baru, hanya
 * memanfaatkan yang sudah didokumentasikan. Pola sama `PostMetricsPort` di
 * atas — `WorkspaceService` konkret TIDAK boleh diimport ke file ini;
 * composition root (Server Action) menyuplai instance lewat constructor.
 * `WorkspaceService.listConnectedAccounts` cocok secara struktural (bentuk
 * return value superset dari yang dipakai di sini).
 */
interface ConnectedAccountsPort {
  listConnectedAccounts(
    workspaceId: WorkspaceId,
    userId: UserId,
  ): Promise<
    { id: ConnectedAccountId; platform: SocialPlatform; handle: string }[]
  >;
}

/**
 * Satu item Calendar hasil `PublishingService.listCalendarPosts` —
 * `CalendarItemRecord` mentah dari repository + `metrics`. `metrics`
 * bermakna dua kondisi berbeda by design (KSP-02-F08 — metrik hanya
 * relevan untuk post Published): `null` untuk post non-Published (tidak
 * pernah di-fetch sama sekali), `[]` untuk post Published yang belum
 * punya baris `PostMetrics` ter-ingest (JOB-04 belum jalan / belum ada
 * data), array berisi kalau sudah ada.
 */
export interface CalendarPostItem extends CalendarItemRecord {
  metrics: PostMetricsRecord[] | null;
}

/**
 * Satu item History (T-034.1/.3) hasil `PublishingService.getHistoryById` —
 * `HistoryItemRecord` mentah dari repository + `metrics` (T-043.3). Pola
 * sama `CalendarPostItem` di atas (T-033.1): field cross-domain
 * `publishing` -> `analytics` ditambahkan lewat interface turunan di
 * SERVICE layer, BUKAN di `HistoryItemRecord` (interface repository murni,
 * lihat `IPublishingRepository.getHistoryById`) — ditemukan Ridwan
 * Architecture Reviewer (2026-09-18, Temuan 2) sebagai pelanggaran boundary:
 * repository seharusnya tidak tahu apa-apa soal domain `analytics`.
 *
 * `metrics` semantik SAMA PERSIS dengan `CalendarPostItem.metrics`: `null`
 * untuk post non-Published (tidak pernah di-fetch), `[]` untuk post
 * Published yang belum punya baris `PostMetrics` ter-ingest, array berisi
 * kalau sudah ada.
 */
export interface HistoryDetailItem extends HistoryItemRecord {
  metrics: PostMetricsRecord[] | null;
}

/**
 * Satu baris tabel "Post Performance" `/analyze` (T-043.1, T-043.2,
 * KSP-07 — Analyze → Dashboard). Dipindahkan dari `domains/analytics/types.ts`
 * (2026-09-18, refactor Temuan 1 Ridwan Architecture Reviewer — circular
 * dependency `analytics` <-> `publishing`) — sekarang didefinisikan di sini,
 * domain yang benar-benar memanggilnya, ikut pola `CalendarPostItem`
 * (tipe cross-domain langsung di service layer, bukan file `types.ts`
 * terpisah — `publishing` tidak punya konvensi itu).
 *
 * Beda dari `PostMetricsRecord` (murni field `AnalyticsPostMetric` Prisma):
 * baris ini gabungan metrik (lewat `PostMetricsPort` yang sudah ada) +
 * `caption`/`accountHandle` dari `IPublishingRepository.listHistory`
 * (`publishing` sendiri, TANPA cross-domain untuk bagian ini —
 * `AnalyticsPostMetric` tidak punya `@relation` ke `PublishingPost`, lihat
 * schema.prisma).
 *
 * 4 kolom yang dikunci design-prep T-043: Post (`caption`), Akun
 * (`accountHandle` + `platform`), Reach (`reach`), Eng. Rate
 * (`engagementRate`) — TIDAK ada field karangan di luar yang sudah tersedia
 * di `AnalyticsPostMetric`. `postId`/`connectedAccountId` disertakan untuk
 * keperluan link/key baris di UI (T-043.2), bukan untuk ditampilkan
 * langsung.
 *
 * `reach`/`engagementRate` bisa `null` (T-043.4): post yang sudah publish
 * di rentang `period` tapi belum sempat di-ingest job cron metrik (KI-003
 * chain — Real `OutstandAdapter` T-025 belum ada) TETAP disertakan di hasil
 * `getPostPerformance`, bukan di-skip. `null` berarti belum ada baris
 * `AnalyticsPostMetric` untuk kombinasi post × akun ini — caller
 * (`AnalyzeDashboard.tsx`) merender "Belum ada data" untuk baris ini, BUKAN
 * memperlakukannya sebagai 0.
 */
export interface PostPerformanceRow {
  postId: PostId;
  connectedAccountId: ConnectedAccountId;
  caption: string;
  platform: SocialPlatform;
  accountHandle: string;
  /** `null` = belum ada `AnalyticsPostMetric` untuk post+akun ini (T-043.4). */
  reach: number | null;
  /** `null` = belum ada `AnalyticsPostMetric` untuk post+akun ini (T-043.4). */
  engagementRate: number | null;
  /**
   * `likes`/`comments` (T-044) — ditambahkan untuk kebutuhan agregasi
   * `EngagementSummary` (lihat catatan di sana), BUKAN untuk ditampilkan di
   * tabel Post Performance itu sendiri (4 kolom tetap dikunci design-prep
   * T-043: Post/Akun/Reach/Eng. Rate, tidak berubah). Null-safety SAMA
   * PERSIS pola `reach`/`engagementRate` di atas: `null` = belum ada
   * `AnalyticsPostMetric` untuk post+akun ini, BUKAN 0.
   */
  likes: number | null;
  /** Lihat catatan `likes` di atas — null-safety sama persis. */
  comments: number | null;
}

/**
 * Satu baris "Account Overview" `/analyze` (T-046.1, T-046.2, KSP-07 —
 * Analyze → Dashboard, pola `Progress` bar SUDAH dikunci "SYNCED" di
 * design-prep T-043, `templates/analyze-dashboard.html`). Dibangun di
 * `PublishingService` (bukan `AnalyticsService`) dengan alasan yang sama
 * persis seperti `PostPerformanceRow`/`getPostPerformance` di atas: butuh
 * `publishedAt`/`targets` post (dimiliki `publishing`) untuk filter rentang
 * `period` DAN metrik reach (dimiliki `analytics`, lewat `PostMetricsPort`
 * yang sudah ada) — meletakkannya di `analytics` akan butuh port baru
 * `analytics -> publishing`, yang berlawanan arah dengan `PostMetricsPort`
 * (`publishing -> analytics`) dan menciptakan circular dependency yang
 * SAMA seperti temuan kritis Ridwan Architecture Reviewer di T-043.
 *
 * Beda dari `PostPerformanceRow`: baris ini SATU per `connectedAccountId`
 * (bukan per post × akun), dan WAJIB menyertakan akun yang di period ini
 * belum punya post terpublikasi sama sekali (T-046 kriteria "belum ada
 * data") — makanya sumber utamanya adalah `ConnectedAccountsPort.
 * listConnectedAccounts` (semua akun workspace), bukan hasil agregasi
 * `getPostPerformance` semata (yang secara alami hanya berisi akun yang
 * SUDAH punya post).
 */
export interface AccountOverviewRow {
  connectedAccountId: ConnectedAccountId;
  platform: SocialPlatform;
  accountHandle: string;
  /** 0 kalau akun belum punya post terpublikasi di `period` ini. */
  totalPosts: number;
  /**
   * `null` kalau akun belum punya post di `period` ini (`totalPosts === 0`)
   * MAUPUN kalau akun punya post tapi belum satu pun ter-ingest
   * `AnalyticsPostMetric` (job cron metrik, KI-003 chain, belum sempat
   * jalan) — kedua kondisi ini sama-sama berarti "belum ada data" di UI
   * (T-046.3), berbeda dari makna 0 reach yang sah. Kalau SEBAGIAN target
   * akun ini sudah ter-ingest, `totalReach` adalah jumlah reach dari
   * target yang sudah ada datanya saja (baris tanpa data tidak menyumbang
   * 0, hanya tidak menyumbang apa-apa ke total).
   */
  totalReach: number | null;
}

/**
 * 3 stat card "Summary row" `/analyze` (T-047.1, KSP-07 — Analyze →
 * Dashboard, section `.summary-row` dikunci "SYNCED" di design-prep T-043,
 * `templates/analyze-dashboard.html`). Sengaja agregasi FLAT dari seluruh
 * `PostPerformanceRow` (granularitas post × target-akun, SAMA dengan
 * `getPostPerformance`/`getAccountOverview`), BUKAN distinct post count —
 * diverifikasi terhadap mock Claude Design (`Total Posts: 12`,
 * `Total Reach: 4.320`) yang persis sama dengan penjumlahan
 * `AccountOverviewRow` di section yang sama pada file itu.
 *
 * Sengaja TIDAK reuse `AnalyticsService.getDashboardSummary` (T-042.2) —
 * itu snapshot-based (`AnalyticsWorkspaceSnapshot`), field-nya beda
 * (`activeAccounts`, bukan Reach), dan menyuplainya butuh port baru arah
 * `analytics -> publishing` yang menciptakan circular dependency dengan
 * `PostMetricsPort` (`publishing -> analytics`, T-033.1) — persis masalah
 * yang jadi temuan kritis Ridwan Architecture Reviewer di T-043 (lihat
 * catatan `PostPerformanceRow`). Method ini hidup di `PublishingService`
 * karena alasan yang sama, reuse `getPostPerformance` langsung — tidak ada
 * query Prisma baru.
 */
export interface AnalyzeSummary {
  totalPosts: number;
  /** `null` kalau tidak ada satupun row dengan reach ter-ingest (T-043.4 pattern) — bukan 0. */
  totalReach: number | null;
  /** `null` kalau tidak ada satupun row dengan engagementRate ter-ingest — bukan 0. */
  avgEngagementRate: number | null;
}

/**
 * Card "Engagement Summary" `/analyze` (T-044, KSP-07 — Analyze →
 * Dashboard). Scope dipersempit lewat `AskUserQuestion` ke King Rezi
 * (2026-09-21) SETELAH dicek ke Claude Design (`templates/analyze-dashboard.html`)
 * — markup locked section "Engagement Summary" cuma berisi DUA angka
 * sederhana (`Komentar`, `Likes`), BUKAN versi kompleks yang diminta task
 * doc asli (`v03-analytics-mvp.md` § T-044.1-T-044.3: "komentar masuk,
 * komentar dibalas, rasio respons" dari domain `engagement` lewat public
 * API cross-domain). King Rezi memilih ikut Claude Design apa adanya.
 *
 * Konsekuensi keputusan ini:
 * - TIDAK ADA cross-domain edge baru ke `engagement` — domain itu masih
 *   stub kosong total (baru dibangun v0.4), jadi kalau tetap mengikuti
 *   T-044.1-T-044.3 apa adanya, task ini akan mandek menunggu v0.4.
 *   `likes`/`comments` yang dibutuhkan Claude Design SUDAH ADA sebagai
 *   field `AnalyticsPostMetric` (Prisma) sejak T-041 — tidak ada data baru
 *   yang perlu diambil dari mana pun.
 * - Method ini hidup di `PublishingService` (bukan `AnalyticsService`),
 *   reuse `getPostPerformance` LANGSUNG — pola identik `getAnalyzeSummary`
 *   di atas (SAMA ALASAN: butuh `publishedAt`/`targets` post milik
 *   `publishing` + metrik milik `analytics` lewat `PostMetricsPort` yang
 *   sudah ada; port baru arah `analytics -> publishing` akan menciptakan
 *   circular dependency, temuan kritis Ridwan Architecture Reviewer di
 *   T-043). TIDAK ADA query Prisma baru.
 * - ADR task doc asli (ADR-018, cross-domain lewat public API `engagement`)
 *   TIDAK dipakai untuk implementasi ini — dicatat di sini supaya jelas
 *   kenapa TIDAK ada import dari domain `engagement` di file ini, meski
 *   task doc menyebutnya. Perubahan scope ini bukan perubahan baseline
 *   (tidak mengubah arsitektur/keputusan tercatat), murni mempersempit apa
 *   yang diimplementasikan supaya cocok dengan desain yang sudah dikunci —
 *   dilaporkan ke Gibran Project Manager untuk dicatat di akhir sesi.
 */
export interface EngagementSummary {
  /** `null` kalau tidak ada satupun row dengan comments ter-ingest (T-043.4 pattern) — bukan 0. */
  totalComments: number | null;
  /** `null` kalau tidak ada satupun row dengan likes ter-ingest — bukan 0. */
  totalLikes: number | null;
}

/**
 * Status post yang dianggap "selesai" dan karenanya boleh muncul di
 * History (T-034.1, KSP-D10 · KSP-03 catatan: "begitu percobaan publish
 * selesai, item pindah ke History"). Single source of truth dipakai oleh
 * `PublishingService.listHistory` (clamp filter caller) dan implementasi
 * Prisma `getHistoryById` (guard invariant post tunggal) — lihat
 * `IPublishingRepository.listHistory`.
 */
export const HISTORY_TERMINAL_STATUSES: readonly ContentStatus[] = [
  ContentStatus.Published,
  ContentStatus.Failed,
];

export class PublishingService {
  constructor(
    private readonly repository: IPublishingRepository,
    private readonly postMetrics?: PostMetricsPort,
    private readonly connectedAccounts?: ConnectedAccountsPort,
  ) {}

  async saveDraft(input: {
    workspaceId: WorkspaceId;
    authorId: UserId;
    caption: string;
    /** T-024.4 — sudah divalidasi ownership+batas format oleh caller (`resolveDraftMediaIds`/`assertMediaCountWithinLimit`, dipanggil dari Server Action). */
    mediaIds?: MediaId[];
  }): Promise<PublishingPostRecord> {
    return this.repository.createDraft({
      workspaceId: input.workspaceId,
      authorId: input.authorId,
      caption: input.caption.trim(),
      ...(input.mediaIds !== undefined ? { mediaIds: input.mediaIds } : {}),
    });
  }

  /**
   * Drafts (T-092.5/ADR-094 poin 5, koreksi gap T-104) — initial SSR load
   * `/publish/drafts` (`page.tsx`). Delegasi murni ke
   * `IPublishingRepository.listDrafts`, yang memfilter 3 status (`Draft`,
   * `InReview`, `ReadyToSchedule`) supaya konsisten dengan kriteria
   * tampilan Drafts yang dipakai `DraftsList.tsx` (`toDraftListItem`) untuk
   * patch granular Realtime — sebelum fix ini, method ini hanya
   * mengembalikan status `Draft` sehingga post `InReview`/
   * `ReadyToSchedule` tidak muncul di initial load, hanya muncul setelah
   * event Realtime.
   */
  async listDrafts(
    workspaceId: WorkspaceId,
    userId: UserId,
  ): Promise<PublishingPostRecord[]> {
    return this.repository.listDrafts({ workspaceId }, userId);
  }

  async getDraftById(
    workspaceId: WorkspaceId,
    postId: PostId,
    userId: UserId,
  ): Promise<PublishingPostRecord> {
    const post = await this.repository.findDraftById(
      { workspaceId, postId },
      userId,
    );
    if (!post) {
      throw new NotFoundError("Draft tidak ditemukan.");
    }
    return post;
  }

  async updateDraft(
    input: {
      workspaceId: WorkspaceId;
      postId: PostId;
      caption: string;
      /**
       * T-024.4 — sudah divalidasi ownership+batas format oleh caller
       * (`resolveDraftMediaIds`/`assertMediaCountWithinLimit`). `undefined`
       * = kolom `mediaIds` tidak disentuh (lihat catatan
       * `IPublishingRepository.updateDraftCaption`).
       */
      mediaIds?: MediaId[];
    },
    userId: UserId,
  ): Promise<PublishingPostRecord> {
    const post = await this.repository.updateDraftCaption(
      {
        workspaceId: input.workspaceId,
        postId: input.postId,
        caption: input.caption.trim(),
        ...(input.mediaIds !== undefined ? { mediaIds: input.mediaIds } : {}),
      },
      userId,
    );
    if (!post) {
      throw new NotFoundError("Draft tidak ditemukan.");
    }
    return post;
  }

  /**
   * Delete Post (T-035.1, ADR-049 Tier 2) — soft delete, TIDAK PERNAH
   * memanggil API Outstand untuk menghapus post dari platform sosial (lihat
   * `IPublishingRepository.softDeletePost`). Tidak ada use-case class
   * terpisah (beda dari `CancelScheduleUseCase`/`PublishNowUseCase`) —
   * T-035.1 tidak butuh `IOutstandAdapter` sama sekali, jadi tidak ada
   * dependency wajib atau urutan operasi kritis yang perlu dijaga TypeScript
   * di call site.
   *
   * RBAC: sama dengan Cancel Schedule/Publish Now — Account Owner, Admin,
   * dan Creator (ADR-074), lihat `assertActorCanDeletePost`.
   *
   * **Guard status (koreksi 2026-09-10, sesi lanjutan T-035.2/.3):** entry
   * point Delete Post HANYA ada di Drafts (bukan Queue/History seperti
   * asumsi awal sesi T-035.1) — King Rezi mengonfirmasi eksplisit lewat
   * `AskUserQuestion`: post `Scheduled` tidak boleh dihapus langsung, harus
   * di-Cancel Schedule dulu (T-030, kembali ke `Draft`) baru bisa dihapus
   * dari Drafts. Karena itu HANYA post berstatus `ContentStatus.Draft` yang
   * boleh dihapus — status lain (`InReview`/`ReadyToSchedule`/`Scheduled`/
   * `Published`/`Failed`) ditolak `ConflictError`. Dua lapis guard (defense-
   * in-depth, pola sama `updateDraft`/`cancelSchedule`): (1) di sini, fetch
   * dulu via `findDraftById` supaya pesan error informatif tanpa menunggu
   * round-trip write; (2) di repository, `softDeletePost` query Prisma-nya
   * SENDIRI juga memfilter `status: Draft` (safety net race condition kalau
   * status berubah di antara fetch dan delete, mis. keburu di-schedule user
   * lain).
   *
   * `NotFoundError` kalau post tidak ditemukan di `workspaceId` ini atau
   * sudah di-soft-delete sebelumnya. `userId` (RLS, KI-026 follow-up) —
   * acting user untuk `withCurrentUser`.
   */
  async deletePost(
    input: {
      workspaceId: WorkspaceId;
      postId: PostId;
      /** RBAC (T-035.1, ADR-049 Tier 2) — role actor yang sudah tervalidasi. */
      actorRole: MemberRole;
    },
    userId: UserId,
  ): Promise<PublishingPostRecord> {
    assertActorCanDeletePost(input.actorRole);

    const existing = await this.repository.findDraftById(
      { workspaceId: input.workspaceId, postId: input.postId },
      userId,
    );
    if (!existing) {
      throw new NotFoundError("Post tidak ditemukan.");
    }
    if (existing.status !== ContentStatus.Draft) {
      throw new ConflictError(
        "Hanya post berstatus Draft yang bisa dihapus. Batalkan jadwal (Cancel Schedule) dulu untuk post yang sudah dijadwalkan, baru bisa dihapus dari Drafts.",
      );
    }

    const post = await this.repository.softDeletePost(
      { workspaceId: input.workspaceId, postId: input.postId },
      userId,
    );
    if (!post) {
      // Race condition (lihat catatan guard di atas): status bisa berubah
      // tepat di antara pengecekan di atas dan `updateMany` guarded ini.
      // Cek ulang supaya pesan error tidak salah menuduh "tidak ditemukan"
      // padahal post-nya masih ada, cuma sudah tidak lagi Draft.
      const recheck = await this.repository.findDraftById(
        { workspaceId: input.workspaceId, postId: input.postId },
        userId,
      );
      if (recheck && recheck.status !== ContentStatus.Draft) {
        throw new ConflictError(
          "Hanya post berstatus Draft yang bisa dihapus. Batalkan jadwal (Cancel Schedule) dulu untuk post yang sudah dijadwalkan, baru bisa dihapus dari Drafts.",
        );
      }
      throw new NotFoundError(
        "Post tidak ditemukan atau sudah dihapus sebelumnya.",
      );
    }
    return post;
  }

  /**
   * Batch count post terjadwal per akun (T-012.2) — dipakai
   * `WorkspaceService.listSidebarChannels` lewat `ScheduledCountsPort`.
   * Skip query kalau tidak ada akun yang perlu dihitung. `userId` (RLS,
   * KI-026 follow-up) — acting user untuk `withCurrentUser`.
   */
  async countScheduledByAccount(
    workspaceId: WorkspaceId,
    connectedAccountIds: ConnectedAccountId[],
    userId: UserId,
  ): Promise<Map<ConnectedAccountId, number>> {
    if (connectedAccountIds.length === 0) {
      return new Map();
    }
    return this.repository.countScheduledByAccount(
      { workspaceId, connectedAccountIds },
      userId,
    );
  }

  /**
   * Queue (T-032.2, KSP-03, ADR-083) — semua post terjadwal (status
   * Scheduled) milik workspace, dikelompokkan per tanggal kalender
   * `scheduledAt`, murni urutan ascending waktu publish (tanpa reorder
   * manual, tanpa status chip — cakupan Queue seragam Scheduled saja).
   * `userId` (RLS, KI-026 follow-up) — acting user untuk `withCurrentUser`.
   */
  async listQueue(
    workspaceId: WorkspaceId,
    userId: UserId,
  ): Promise<QueueGroup[]> {
    const items = await this.repository.listQueue({ workspaceId }, userId);
    return groupQueueItemsByDate(items);
  }

  /**
   * Calendar (T-033.1, KSP-02) — post apa pun (semua status, lihat
   * catatan gap di `CalendarItemRecord`) yang `scheduledAt`/`publishedAt`
   * jatuh dalam rentang `[from, to]`, diurutkan ascending berdasar
   * tanggal efektif (`sortCalendarItemsByEffectiveDate`). Query rentang
   * generik — caller (Week 7 hari, Month 1 bulan + hari muted) yang
   * menentukan `from`/`to`; method ini TIDAK punya logic Week/Month.
   *
   * Untuk post berstatus Published, `metrics` diisi lewat
   * `PostMetricsPort` (batch, bukan N+1) — dipetakan nanti oleh Popover
   * (T-033.8): Views→`impressions`, Reach→`reach`, Replies→`comments`,
   * Eng. Rate→`engagementRate`. Post non-Published selalu `metrics: null`
   * (tidak pernah di-fetch).
   *
   * `userId` (RLS, KI-026 follow-up) — acting user untuk `withCurrentUser`.
   */
  async listCalendarPosts(
    input: {
      workspaceId: WorkspaceId;
      from: Date;
      to: Date;
      connectedAccountIds?: ConnectedAccountId[];
      statuses?: ContentStatus[];
    },
    userId: UserId,
  ): Promise<CalendarPostItem[]> {
    const items = await this.repository.listCalendarPosts(input, userId);
    const sorted = sortCalendarItemsByEffectiveDate(items);

    const publishedPostIds = sorted
      .filter((item) => item.status === ContentStatus.Published)
      .map((item) => item.id);

    const metricsByPost =
      this.postMetrics && publishedPostIds.length > 0
        ? await this.postMetrics.getPostMetricsByPosts(publishedPostIds)
        : new Map<PostId, PostMetricsRecord[]>();

    return sorted.map((item) => ({
      ...item,
      metrics:
        item.status === ContentStatus.Published
          ? (metricsByPost.get(item.id) ?? [])
          : null,
    }));
  }

  /**
   * Granular patch Realtime Calendar (T-092.3, ADR-094 poin 5) — fetch SATU
   * record termapping untuk `postId` dari event Realtime
   * (`{postId, eventType}`, `usePublishingPostsRealtime`). Reuse post-
   * processing metrik yang sama dengan `listCalendarPosts` (batch via
   * `PostMetricsPort` kalau item Published) supaya bentuk hasil identik
   * dengan item lain di local state Calendar — screen pemanggil tidak perlu
   * tahu bedanya item dari initial load vs. hasil patch granular.
   *
   * Returns `null` kalau post tidak ditemukan di `workspaceId` ini atau
   * sudah di-soft-delete — CalendarScreen menafsirkan ini sebagai "remove
   * dari local state" (post ini sudah tidak valid lagi untuk workspace ini),
   * BUKAN error — beda dari `getDraftById`/`getHistoryById` yang throw
   * `NotFoundError` untuk kasus serupa (method-method itu dipanggil dari
   * route/aksi yang punya alur error eksplisit; method ini dipanggil dari
   * handler event Realtime yang butuh sinyal graceful, bukan exception).
   *
   * `userId` (RLS, KI-026 follow-up) — acting user for `withCurrentUser`.
   */
  async getCalendarPostById(
    workspaceId: WorkspaceId,
    postId: PostId,
    userId: UserId,
  ): Promise<CalendarPostItem | null> {
    const item = await this.repository.getCalendarPostById(
      { workspaceId, postId },
      userId,
    );
    if (!item) {
      return null;
    }

    const metrics =
      item.status === ContentStatus.Published && this.postMetrics
        ? ((await this.postMetrics.getPostMetricsByPosts([item.id])).get(
            item.id,
          ) ?? [])
        : item.status === ContentStatus.Published
          ? []
          : null;

    return { ...item, metrics };
  }

  /**
   * History (T-034.1, KSP-D10) — post yang percobaan publish-nya sudah
   * selesai (`Published`/`Failed`), beserta status/error per target,
   * diurutkan repository descending oleh `updatedAt` (proksi waktu
   * selesai, lihat catatan gap di `IPublishingRepository.listHistory`).
   *
   * `statuses` input **di-clamp** ke `HISTORY_TERMINAL_STATUSES` di sini
   * (bukan dipercaya mentah seperti `listCalendarPosts`) — invariant
   * "History = post selesai" harus tetap berlaku walau caller di masa
   * depan (mis. filter dropdown T-034.2) mengirim status lain. Kalau
   * hasil clamp kosong (semua status yang diminta bukan status terminal),
   * repository tidak dipanggil sama sekali — selalu array kosong, bukan
   * "semua status" seperti default `listCalendarPosts`.
   *
   * Method ini murni delegasi + clamp — belum ada post-processing metrik
   * seperti `listCalendarPosts` (di luar scope T-034.1; kalau UI detail
   * T-034.3 butuh metrik nanti, tambahkan `PostMetricsPort` yang sama
   * lewat constructor, bukan keputusan sepihak di sini).
   *
   * `userId` (RLS, KI-026 follow-up) — acting user untuk `withCurrentUser`.
   */
  async listHistory(
    input: {
      workspaceId: WorkspaceId;
      statuses?: ContentStatus[];
      connectedAccountIds?: ConnectedAccountId[];
    },
    userId: UserId,
  ): Promise<HistoryItemRecord[]> {
    const requestedStatuses =
      input.statuses && input.statuses.length > 0
        ? input.statuses
        : HISTORY_TERMINAL_STATUSES;
    const statuses = requestedStatuses.filter((status) =>
      HISTORY_TERMINAL_STATUSES.includes(status),
    );

    if (statuses.length === 0) {
      return [];
    }

    return this.repository.listHistory({ ...input, statuses }, userId);
  }

  /**
   * Detail satu History item (T-034.1) — dipakai composition root route
   * `/publish/history/[postId]` (UI-nya T-034.3). Sama pola dengan
   * `getDraftById`: `NotFoundError` kalau post tidak ada, bukan milik
   * `workspaceId` ini, atau statusnya bukan `Published`/`Failed` (guard
   * invariant "history = selesai" ditegakkan di repository, lihat
   * `IPublishingRepository.getHistoryById`).
   *
   * **T-043.3** — metrik post diisi lewat `PostMetricsPort` yang sama
   * dengan `listCalendarPosts`/`getCalendarPostById` (batch API, satu
   * `postId` di sini), semantik SAMA PERSIS: `[]` untuk Published tanpa
   * data ter-ingest ATAU tanpa port disuplai, `null` untuk `Failed` (tidak
   * pernah di-fetch — metrik hanya relevan untuk post yang berhasil
   * publish). Return type `HistoryDetailItem` (bukan `HistoryItemRecord`,
   * koreksi Temuan 2 Ridwan Architecture Reviewer 2026-09-18) — `metrics`
   * di-overlay DI SINI, di level service, bukan di
   * `IPublishingRepository.getHistoryById` (proyeksi data murni yang tidak
   * boleh tahu soal `analytics`). Lihat catatan `HistoryDetailItem`.
   *
   * `userId` (RLS, KI-026 follow-up) — acting user untuk `withCurrentUser`.
   */
  async getHistoryById(
    workspaceId: WorkspaceId,
    postId: PostId,
    userId: UserId,
  ): Promise<HistoryDetailItem> {
    const post = await this.repository.getHistoryById(
      { workspaceId, postId },
      userId,
    );
    if (!post) {
      throw new NotFoundError("Riwayat post tidak ditemukan.");
    }

    const metrics =
      post.status === ContentStatus.Published && this.postMetrics
        ? ((await this.postMetrics.getPostMetricsByPosts([post.id])).get(
            post.id,
          ) ?? [])
        : post.status === ContentStatus.Published
          ? []
          : null;

    return { ...post, metrics };
  }

  /**
   * Daftar performa SEMUA post workspace pada satu `period` (T-043.1, UI
   * Table "Post Performance" `/analyze` konsumsi lewat ini — T-043.2).
   *
   * **Dipindahkan dari `AnalyticsService` (2026-09-18, refactor Temuan 1
   * Ridwan Architecture Reviewer)** — versi lama di domain `analytics`
   * memanggil `publishing` lewat port lokal `PublishingHistoryPort`, padahal
   * `publishing` SUDAH lebih dulu memanggil `analytics` lewat
   * `PostMetricsPort` di atas (arah legal, T-033.1) — dua arah sekaligus
   * melanggar `application-layer.md` ("tidak ada circular dependency antar
   * Bounded Context"). Sekarang method ini hidup di `publishing`, reuse
   * `IPublishingRepository.listHistory` (lewat `this.listHistory`, sudah
   * clamp ke status terminal) + `PostMetricsPort` yang SAMA dengan
   * `getHistoryById`/`listCalendarPosts` di atas — dependency tetap SATU
   * ARAH (`publishing -> analytics`), tidak ada port baru yang dibutuhkan.
   *
   * Rentang tanggal `period` dihitung LANGSUNG dari `period` relatif ke
   * sekarang (`resolvePostPerformancePeriodRange` — "weekly" = 7 hari
   * terakhir, "monthly" = 30 hari terakhir), BUKAN lagi dari
   * `AnalyticsWorkspaceSnapshot.periodStart`/`periodEnd` seperti versi lama
   * — lihat catatan keputusan lengkap di `post-performance-period-range.ts`
   * (opsi ini dipilih dibanding memperluas `PostMetricsPort` dengan method
   * query rentang snapshot, supaya `publishing` tidak perlu tahu apa pun
   * soal `AnalyticsWorkspaceSnapshot`).
   *
   * Baris diurutkan Reach descending — default sort yang dikunci
   * design-prep T-043 (2026-09-18, `templates/analyze-dashboard.html`).
   * Sort per kolom lain (T-043.2) jadi tanggung jawab UI di client, bukan
   * di sini.
   *
   * T-043.4: post yang publish di rentang `period` TETAP disertakan di
   * hasil meski belum ada `AnalyticsPostMetric` untuk sebagian atau seluruh
   * target akunnya — job cron ingestion metrik (KI-003 chain) belum tentu
   * sudah memproses post ini. Baris dibentuk dari `post.targets` (bukan
   * dari metrik), jadi setiap target akun selalu menghasilkan satu baris;
   * `reach`/`engagementRate` diisi `null` kalau metriknya belum ada —
   * caller merender "Belum ada data" (T-043.4), bukan 0.
   *
   * `userId` (RLS, KI-026 follow-up) — acting user untuk `withCurrentUser`.
   */
  async getPostPerformance(
    workspaceId: WorkspaceId,
    period: SnapshotPeriod,
    userId: UserId,
  ): Promise<PostPerformanceRow[]> {
    if (!this.postMetrics) {
      throw new Error(
        "PublishingService.getPostPerformance requires a PostMetricsPort — none was provided to the constructor.",
      );
    }

    const { from, to } = resolvePostPerformancePeriodRange(period);
    const fromMs = from.getTime();
    const toMs = to.getTime();

    const historyItems = await this.listHistory({ workspaceId }, userId);
    const postsInRange = historyItems.filter((item) => {
      const publishedAt = item.publishedAt?.getTime();
      return (
        publishedAt !== undefined &&
        publishedAt >= fromMs &&
        publishedAt <= toMs
      );
    });

    if (postsInRange.length === 0) {
      return [];
    }

    const metricsByPost = await this.postMetrics.getPostMetricsByPosts(
      postsInRange.map((post) => post.id),
    );

    const rows: PostPerformanceRow[] = [];
    for (const post of postsInRange) {
      const metrics = metricsByPost.get(post.id);
      for (const target of post.targets) {
        // Target-level "failed" (partial failure — post tetap Published
        // kalau minimal satu target sukses) di-skip: target ini TIDAK
        // PERNAH akan punya AnalyticsPostMetric, beda dari target
        // published yang belum ter-ingest (reach: null, "Belum ada data").
        // Guard sama seperti `target.status === "published"` di
        // HistoryDetail.tsx.
        if (target.status !== "published") {
          continue;
        }
        const metric = metrics?.find(
          (m) => m.connectedAccountId === target.connectedAccountId,
        );
        rows.push({
          postId: post.id,
          connectedAccountId: target.connectedAccountId,
          caption: post.caption,
          platform: target.platform,
          accountHandle: target.accountHandle,
          reach: metric?.reach ?? null,
          engagementRate: metric?.engagementRate ?? null,
          likes: metric?.likes ?? null,
          comments: metric?.comments ?? null,
        });
      }
    }

    // Reach descending; baris `reach: null` (belum ada data, T-043.4)
    // ditaruh di akhir urutan — bukan dianggap 0 (yang akan salah
    // menempatkannya di atas reach negatif hipotetis) dan bukan exception.
    rows.sort((a, b) => {
      if (a.reach === null && b.reach === null) return 0;
      if (a.reach === null) return 1;
      if (b.reach === null) return -1;
      return b.reach - a.reach;
    });
    return rows;
  }

  /**
   * Ringkasan performa per akun/platform `/analyze` (T-046.1, KSP-07 —
   * Analyze → Dashboard, UI bar `Progress` T-046.2 konsumsi lewat ini).
   * Reuse `getPostPerformance` di atas (period range + join metrik SUDAH
   * benar di sana) lalu diagregasi per `connectedAccountId`, digabung
   * dengan daftar LENGKAP akun terhubung workspace (`ConnectedAccountsPort`)
   * supaya akun yang belum punya post di `period` ini TETAP disertakan
   * (`totalPosts: 0`, `totalReach: null` — T-046 kriteria "belum ada
   * data", BUKAN skip / BUKAN `totalReach: 0`).
   *
   * Diurutkan `totalReach` descending, sama pola default sort
   * `getPostPerformance` (baris `totalReach: null` di akhir) — konsisten
   * secara visual dengan Post Performance di halaman yang sama.
   *
   * `userId` (RLS, KI-026 follow-up) — acting user untuk `withCurrentUser`,
   * diteruskan ke kedua port.
   */
  async getAccountOverview(
    workspaceId: WorkspaceId,
    period: SnapshotPeriod,
    userId: UserId,
  ): Promise<AccountOverviewRow[]> {
    if (!this.connectedAccounts) {
      throw new Error(
        "PublishingService.getAccountOverview requires a ConnectedAccountsPort — none was provided to the constructor.",
      );
    }

    const [accounts, performanceRows] = await Promise.all([
      this.connectedAccounts.listConnectedAccounts(workspaceId, userId),
      this.getPostPerformance(workspaceId, period, userId),
    ]);

    const statsByAccount = new Map<
      ConnectedAccountId,
      { postIds: Set<PostId>; reach: number | null }
    >();

    for (const row of performanceRows) {
      const existing = statsByAccount.get(row.connectedAccountId) ?? {
        postIds: new Set<PostId>(),
        reach: null,
      };
      existing.postIds.add(row.postId);
      if (row.reach !== null) {
        existing.reach = (existing.reach ?? 0) + row.reach;
      }
      statsByAccount.set(row.connectedAccountId, existing);
    }

    const overview: AccountOverviewRow[] = accounts.map((account) => {
      const stats = statsByAccount.get(account.id);
      return {
        connectedAccountId: account.id,
        platform: account.platform,
        accountHandle: account.handle,
        totalPosts: stats?.postIds.size ?? 0,
        totalReach: stats?.reach ?? null,
      };
    });

    overview.sort((a, b) => {
      if (a.totalReach === null && b.totalReach === null) return 0;
      if (a.totalReach === null) return 1;
      if (b.totalReach === null) return -1;
      return b.totalReach - a.totalReach;
    });
    return overview;
  }

  /**
   * Summary row 3 stat card `/analyze` (T-047.1, KSP-07 — Analyze →
   * Dashboard, UI `StatTile` T-047.2 konsumsi lewat ini). Reuse
   * `getPostPerformance` di atas (period range + join metrik SUDAH benar di
   * sana) — TIDAK ada query Prisma baru, lihat catatan keputusan sumber
   * data lengkap di `AnalyzeSummary`.
   *
   * `totalPosts` = jumlah baris post × target (SAMA granularitas dengan
   * penjumlahan `totalPosts` di `getAccountOverview`) — BUKAN distinct post
   * count, sudah diverifikasi cocok dengan mock Claude Design.
   * `totalReach`/`avgEngagementRate` diakumulasi hanya dari baris yang
   * sudah ter-ingest (pola akumulasi sama seperti `statsByAccount` di
   * `getAccountOverview`) — `null` kalau tidak ada satupun baris berisi
   * nilainya, bukan 0.
   *
   * Beda dari `getAccountOverview`: method ini TIDAK butuh
   * `ConnectedAccountsPort` — summary row cuma agregat angka dari post yang
   * ADA di `period` ini, tidak perlu menyertakan akun tanpa post.
   *
   * `userId` (RLS, KI-026 follow-up) — acting user untuk `withCurrentUser`.
   */
  async getAnalyzeSummary(
    workspaceId: WorkspaceId,
    period: SnapshotPeriod,
    userId: UserId,
  ): Promise<AnalyzeSummary> {
    const rows = await this.getPostPerformance(workspaceId, period, userId);

    let reachSum: number | null = null;
    let engagementRateSum: number | null = null;
    let engagementRateCount = 0;

    for (const row of rows) {
      if (row.reach !== null) {
        reachSum = (reachSum ?? 0) + row.reach;
      }
      if (row.engagementRate !== null) {
        engagementRateSum = (engagementRateSum ?? 0) + row.engagementRate;
        engagementRateCount += 1;
      }
    }

    return {
      totalPosts: rows.length,
      totalReach: reachSum,
      avgEngagementRate:
        engagementRateSum === null
          ? null
          : engagementRateSum / engagementRateCount,
    };
  }

  /**
   * Card "Engagement Summary" `/analyze` (T-044) — lihat catatan keputusan
   * scope lengkap di `EngagementSummary`. Reuse `getPostPerformance` di
   * atas (SAMA POLA `getAnalyzeSummary`) — TIDAK ada query Prisma baru,
   * TIDAK butuh port baru (`PostMetricsPort` yang sudah disuplai constructor
   * sudah cukup, sama seperti `getAnalyzeSummary` — tidak butuh
   * `ConnectedAccountsPort`).
   *
   * Akumulasi null-safe: `totalLikes`/`totalComments` adalah jumlah dari
   * baris yang sudah ter-ingest `likes`/`comments` saja (pola sama
   * `reachSum` di `getAnalyzeSummary`) — `null` kalau tidak ada satupun
   * baris berisi nilainya, bukan 0.
   *
   * `userId` (RLS, KI-026 follow-up) — acting user untuk `withCurrentUser`.
   */
  async getEngagementSummary(
    workspaceId: WorkspaceId,
    period: SnapshotPeriod,
    userId: UserId,
  ): Promise<EngagementSummary> {
    const rows = await this.getPostPerformance(workspaceId, period, userId);

    let likesSum: number | null = null;
    let commentsSum: number | null = null;

    for (const row of rows) {
      if (row.likes !== null) {
        likesSum = (likesSum ?? 0) + row.likes;
      }
      if (row.comments !== null) {
        commentsSum = (commentsSum ?? 0) + row.comments;
      }
    }

    return {
      totalLikes: likesSum,
      totalComments: commentsSum,
    };
  }

  /**
   * Granular patch Realtime History (T-092.6, ADR-094 poin 5, 7) — fetch
   * SATU record termapping untuk `postId` dari event Realtime
   * (`{postId, eventType}`, `usePublishingPostsRealtime`). Reuse
   * `HistoryItemRecord` (targets membawa `status`/`error` per akun) —
   * **bukan** `getCalendarPostById`/`CalendarPostItem`, karena `HistoryList`
   * (`getPrimaryErrorMessage`) butuh detail per-target yang tidak ada di
   * proyeksi Calendar (`CalendarItemTargetRecord` tidak punya
   * `status`/`error`). Delegasi murni ke
   * `IPublishingRepository.getHistoryPostById` — tidak ada clamp status di
   * sini (beda dari `listHistory`), karena kriteria tampilan History
   * (`HISTORY_TERMINAL_STATUSES`) ditegakkan client-side oleh pemanggil
   * (`HistoryList`, sama pola `DraftsList`), bukan di service ini — post
   * yang statusnya berubah jadi bukan `Published`/`Failed` lagi tetap perlu
   * dikembalikan APA ADANYA supaya pemanggil bisa menafsirkannya sebagai
   * "remove dari local state", bukan salah dianggap NotFoundError.
   *
   * Returns `null` kalau post tidak ditemukan di `workspaceId` ini atau
   * sudah di-soft-delete — sama semangat `getCalendarPostById`, BUKAN
   * error (beda dari `getHistoryById` yang throw `NotFoundError`, dipakai
   * route detail yang punya alur error eksplisit).
   *
   * `userId` (RLS, KI-026 follow-up) — acting user untuk `withCurrentUser`.
   */
  async getHistoryPostById(
    workspaceId: WorkspaceId,
    postId: PostId,
    userId: UserId,
  ): Promise<HistoryItemRecord | null> {
    return this.repository.getHistoryPostById({ workspaceId, postId }, userId);
  }
}
