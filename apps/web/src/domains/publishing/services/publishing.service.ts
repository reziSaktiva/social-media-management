import type {
  ConnectedAccountId,
  PostId,
  UserId,
  WorkspaceId,
} from "@social/shared";
import { NotFoundError } from "@/lib/utils/errors";
import type {
  IPublishingRepository,
  PublishingPostRecord,
} from "../repositories/publishing.repository";

export class PublishingService {
  constructor(private readonly repository: IPublishingRepository) {}

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

  async listDrafts(workspaceId: WorkspaceId): Promise<PublishingPostRecord[]> {
    return this.repository.listDrafts({ workspaceId });
  }

  async getDraftById(
    workspaceId: WorkspaceId,
    postId: PostId,
  ): Promise<PublishingPostRecord> {
    const post = await this.repository.findDraftById({ workspaceId, postId });
    if (!post) {
      throw new NotFoundError("Draft tidak ditemukan.");
    }
    return post;
  }

  async updateDraft(input: {
    workspaceId: WorkspaceId;
    postId: PostId;
    caption: string;
  }): Promise<PublishingPostRecord> {
    const post = await this.repository.updateDraftCaption({
      workspaceId: input.workspaceId,
      postId: input.postId,
      caption: input.caption.trim(),
    });
    if (!post) {
      throw new NotFoundError("Draft tidak ditemukan.");
    }
    return post;
  }

  /**
   * Batch count post terjadwal per akun (T-012.2) — dipakai
   * `WorkspaceService.listSidebarChannels` lewat `ScheduledCountsPort`.
   * Skip query kalau tidak ada akun yang perlu dihitung.
   */
  async countScheduledByAccount(
    workspaceId: WorkspaceId,
    connectedAccountIds: ConnectedAccountId[],
  ): Promise<Map<ConnectedAccountId, number>> {
    if (connectedAccountIds.length === 0) {
      return new Map();
    }
    return this.repository.countScheduledByAccount({
      workspaceId,
      connectedAccountIds,
    });
  }
}
