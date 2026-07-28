import {
  asPostId,
  asUserId,
  asWorkspaceId,
  type ContentStatus,
} from "@social/shared";
import type { IPublishingRepository } from "@/domains/publishing";
import { prisma } from "@/lib/prisma/client";

export const publishingRepository: IPublishingRepository = {
  async createDraft({ workspaceId, authorId, caption }) {
    const post = await prisma.publishingPost.create({
      data: {
        workspaceId,
        authorId,
        caption,
      },
    });

    return {
      id: asPostId(post.id),
      workspaceId: asWorkspaceId(post.workspaceId),
      authorId: asUserId(post.authorId),
      caption: post.caption,
      status: post.status as ContentStatus,
      createdAt: post.createdAt,
    };
  },
};
