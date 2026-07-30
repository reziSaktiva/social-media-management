import type { PostId, UserId, WorkspaceId } from "@social/shared";
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

/** Repository interface — implementation (Prisma) lives in src/lib/repositories/publishing. */
export interface IPublishingRepository {
  createDraft(input: {
    workspaceId: WorkspaceId;
    authorId: UserId;
    caption: string;
  }): Promise<PublishingPostRecord>;

  listDrafts(input: {
    workspaceId: WorkspaceId;
  }): Promise<PublishingPostRecord[]>;

  findDraftById(input: {
    workspaceId: WorkspaceId;
    postId: PostId;
  }): Promise<PublishingPostRecord | null>;

  /** Returns null when no matching draft exists in this workspace. */
  updateDraftCaption(input: {
    workspaceId: WorkspaceId;
    postId: PostId;
    caption: string;
  }): Promise<PublishingPostRecord | null>;
}
