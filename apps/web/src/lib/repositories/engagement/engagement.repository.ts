import {
  asConnectedAccountId,
  asInboxItemId,
  asPostId,
  asReplyId,
  asUserId,
  asWorkspaceId,
  type SocialPlatform,
} from "@social/shared";
import type {
  IEngagementRepository,
  EngagementInboxItemRecord,
  EngagementReplyRecord,
  InboxItemStatus,
} from "@/domains/engagement";
import type {
  EngagementInboxItem,
  EngagementReply,
} from "@/generated/prisma/client";
import { withCurrentUser } from "@/lib/prisma/with-current-user";

function mapInboxItem(item: EngagementInboxItem): EngagementInboxItemRecord {
  return {
    id: asInboxItemId(item.id),
    workspaceId: asWorkspaceId(item.workspaceId),
    connectedAccountId: asConnectedAccountId(item.connectedAccountId),
    platform: item.platform as SocialPlatform,
    type: item.type,
    externalId: item.externalId,
    authorHandle: item.authorHandle,
    content: item.content,
    status: item.status as InboxItemStatus,
    postId: item.postId ? asPostId(item.postId) : null,
    receivedAt: item.receivedAt,
    readAt: item.readAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function mapReply(reply: EngagementReply): EngagementReplyRecord {
  return {
    id: asReplyId(reply.id),
    inboxItemId: asInboxItemId(reply.inboxItemId),
    userId: asUserId(reply.userId),
    content: reply.content,
    outstandReplyId: reply.outstandReplyId,
    status: reply.status,
    sentAt: reply.sentAt,
    createdAt: reply.createdAt,
    updatedAt: reply.updatedAt,
  };
}

export const engagementRepository: IEngagementRepository = {
  async listInboxItems(
    { workspaceId, connectedAccountId, platform, status },
    userId,
  ) {
    const items = await withCurrentUser(userId, (tx) =>
      tx.engagementInboxItem.findMany({
        where: {
          workspaceId,
          ...(connectedAccountId ? { connectedAccountId } : {}),
          ...(platform ? { platform } : {}),
          ...(status ? { status } : {}),
        },
        orderBy: { receivedAt: "desc" },
      }),
    );

    return items.map(mapInboxItem);
  },

  async findInboxItemById({ workspaceId, inboxItemId }, userId) {
    const item = await withCurrentUser(userId, (tx) =>
      tx.engagementInboxItem.findFirst({
        where: { id: inboxItemId, workspaceId },
      }),
    );

    return item ? mapInboxItem(item) : null;
  },

  async upsertInboxItem(
    {
      workspaceId,
      connectedAccountId,
      platform,
      type,
      externalId,
      authorHandle,
      content,
      receivedAt,
    },
    userId,
  ) {
    return withCurrentUser(userId, async (tx) => {
      // `findUnique` DULU (dalam transaksi yang sama dengan `upsert` di
      // bawah) supaya "apakah baris ini baru dibuat" atomik, bukan
      // diasumsikan dari `createdAt === updatedAt` (rapuh terhadap clock
      // skew/rounding) — dibutuhkan T-051 untuk menghitung
      // `newCommentsCount` (notifikasi aggregate JOB-03).
      const existing = await tx.engagementInboxItem.findUnique({
        where: {
          workspaceId_connectedAccountId_externalId: {
            workspaceId,
            connectedAccountId,
            externalId,
          },
        },
        select: { id: true },
      });

      const item = await tx.engagementInboxItem.upsert({
        where: {
          workspaceId_connectedAccountId_externalId: {
            workspaceId,
            connectedAccountId,
            externalId,
          },
        },
        create: {
          workspaceId,
          connectedAccountId,
          platform,
          type,
          externalId,
          authorHandle,
          content,
          receivedAt,
        },
        update: {
          authorHandle,
          content,
        },
      });

      return { item: mapInboxItem(item), isNew: existing === null };
    });
  },

  async markInboxItemStatus({ workspaceId, inboxItemId, status }, userId) {
    const item = await withCurrentUser(userId, async (tx) => {
      const { count } = await tx.engagementInboxItem.updateMany({
        where: { id: inboxItemId, workspaceId },
        data: {
          status,
          ...(status === "done" ? { readAt: new Date() } : {}),
        },
      });

      if (count === 0) {
        return null;
      }

      return tx.engagementInboxItem.findUniqueOrThrow({
        where: { id: inboxItemId },
      });
    });

    return item ? mapInboxItem(item) : null;
  },

  async createReply({ inboxItemId, userId: authorId, content }, userId) {
    const reply = await withCurrentUser(userId, (tx) =>
      tx.engagementReply.create({
        data: {
          inboxItemId,
          userId: authorId,
          content,
        },
      }),
    );

    return mapReply(reply);
  },

  async listRepliesByInboxItemId(inboxItemId, userId) {
    const replies = await withCurrentUser(userId, (tx) =>
      tx.engagementReply.findMany({
        where: { inboxItemId },
        orderBy: { sentAt: "asc" },
      }),
    );

    return replies.map(mapReply);
  },
};
