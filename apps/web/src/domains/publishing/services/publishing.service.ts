import { ContentStatus } from "@social/shared";
import type {
  ConnectedAccountId,
  PostId,
  UserId,
  WorkspaceId,
} from "@social/shared";
import type { PostMetricsRecord } from "@/domains/analytics";
import { NotFoundError } from "@/lib/utils/errors";
import type {
  CalendarItemRecord,
  IPublishingRepository,
  PublishingPostRecord,
} from "../repositories/publishing.repository";
import { groupQueueItemsByDate, type QueueGroup } from "./group-queue-items";
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

export class PublishingService {
  constructor(
    private readonly repository: IPublishingRepository,
    private readonly postMetrics?: PostMetricsPort,
  ) {}

  async saveDraft(input: {
    workspaceId: WorkspaceId;
    authorId: UserId;
    caption: string;
  }): Promise<PublishingPostRecord> {
    return this.repository.createDraft({
      workspaceId: input.workspaceId,
      authorId: input.authorId,
      caption: input.caption.trim(),
    });
  }

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
    },
    userId: UserId,
  ): Promise<PublishingPostRecord> {
    const post = await this.repository.updateDraftCaption(
      {
        workspaceId: input.workspaceId,
        postId: input.postId,
        caption: input.caption.trim(),
      },
      userId,
    );
    if (!post) {
      throw new NotFoundError("Draft tidak ditemukan.");
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
}
