import {
  asPostId,
  asUserId,
  asWorkspaceId,
  ContentStatus,
} from "@social/shared";
import type {
  IPublishingRepository,
  PublishingPostRecord,
} from "@/domains/publishing";
import type { PublishingPost } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma/client";

function mapPost(post: PublishingPost): PublishingPostRecord {
  return {
    id: asPostId(post.id),
    workspaceId: asWorkspaceId(post.workspaceId),
    authorId: asUserId(post.authorId),
    caption: post.caption,
    status: post.status as ContentStatus,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

export const publishingRepository: IPublishingRepository = {
  async createDraft({ workspaceId, authorId, caption }) {
    const post = await prisma.publishingPost.create({
      data: {
        workspaceId,
        authorId,
        caption,
      },
    });

    return mapPost(post);
  },

  async listDrafts({ workspaceId }) {
    const posts = await prisma.publishingPost.findMany({
      where: {
        workspaceId,
        status: ContentStatus.Draft,
        deletedAt: null,
      },
      orderBy: { updatedAt: "desc" },
    });

    return posts.map(mapPost);
  },

  async findDraftById({ workspaceId, postId }) {
    const post = await prisma.publishingPost.findFirst({
      where: {
        id: postId,
        workspaceId,
        deletedAt: null,
      },
    });

    return post ? mapPost(post) : null;
  },

  async updateDraftCaption({ workspaceId, postId, caption }) {
    const { count } = await prisma.publishingPost.updateMany({
      where: {
        id: postId,
        workspaceId,
        status: ContentStatus.Draft,
        deletedAt: null,
      },
      data: { caption },
    });

    if (count === 0) {
      return null;
    }

    const post = await prisma.publishingPost.findUniqueOrThrow({
      where: { id: postId },
    });

    return mapPost(post);
  },
};
