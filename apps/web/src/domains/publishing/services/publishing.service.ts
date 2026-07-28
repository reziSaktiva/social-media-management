import type { UserId, WorkspaceId } from "@social/shared";
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
}
