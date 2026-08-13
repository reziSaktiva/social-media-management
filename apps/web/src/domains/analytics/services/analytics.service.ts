import type { PostId, WorkspaceId } from "@social/shared";
import type {
  IAnalyticsRepository,
  PostMetricsRecord,
  WorkspaceSnapshotRecord,
} from "../repositories/analytics.repository";
import type { SnapshotPeriod } from "../types";

export class AnalyticsService {
  constructor(private readonly repository: IAnalyticsRepository) {}

  /** Metrik performa per post (T-043 UI konsumsi lewat ini). */
  async getPostMetrics(postId: PostId): Promise<PostMetricsRecord[]> {
    return this.repository.findMetricsByPost(postId);
  }

  /**
   * Ringkasan analytics workspace untuk Dashboard (T-042.2). Null berarti
   * belum ada snapshot untuk `period` ini sama sekali — caller (Server
   * Component) merender empty state (T-042.4), bukan angka nol.
   */
  async getWorkspaceSnapshot(
    workspaceId: WorkspaceId,
    period: SnapshotPeriod,
  ): Promise<WorkspaceSnapshotRecord | null> {
    return this.repository.findLatestWorkspaceSnapshot(workspaceId, period);
  }
}
