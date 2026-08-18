import {
  asConnectedAccountId,
  asPostId,
  asPostTargetId,
  asUserId,
  asWorkspaceId,
  type ConnectedAccountId,
  ContentStatus,
} from "@social/shared";
import type {
  IPublishingRepository,
  PublishingPostRecord,
  PublishingScheduleRecord,
} from "@/domains/publishing";
import type { Prisma, PublishingPost } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma/client";
import {
  setCurrentUserId,
  withCurrentUser,
} from "@/lib/prisma/with-current-user";

/**
 * Sentinel internal — dilempar di dalam `$transaction` supaya semua
 * mutasi (termasuk `updateMany` status Draft/ReadyToSchedule → Scheduled
 * yang sudah terjadi) ikut di-rollback saat guard ownership gagal.
 * Return `null` biasa (tanpa throw) TIDAK cukup: Prisma tetap commit
 * transaksi kalau callback selesai normal, jadi post bisa "setengah"
 * ter-Scheduled tanpa target yang valid. Tidak diexport — murni detail
 * implementasi repository ini.
 */
class ScheduleOwnershipGuardFailed extends Error {}

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
    const post = await withCurrentUser(authorId, (tx) =>
      tx.publishingPost.create({
        data: {
          workspaceId,
          authorId,
          caption,
        },
      }),
    );

    return mapPost(post);
  },

  async listDrafts({ workspaceId }, userId) {
    const posts = await withCurrentUser(userId, (tx) =>
      tx.publishingPost.findMany({
        where: {
          workspaceId,
          status: ContentStatus.Draft,
          deletedAt: null,
        },
        orderBy: { updatedAt: "desc" },
      }),
    );

    return posts.map(mapPost);
  },

  async findDraftById({ workspaceId, postId }, userId) {
    const post = await withCurrentUser(userId, (tx) =>
      tx.publishingPost.findFirst({
        where: {
          id: postId,
          workspaceId,
          deletedAt: null,
        },
      }),
    );

    return post ? mapPost(post) : null;
  },

  async updateDraftCaption({ workspaceId, postId, caption }, userId) {
    const post = await withCurrentUser(userId, async (tx) => {
      const { count } = await tx.publishingPost.updateMany({
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

      return tx.publishingPost.findUniqueOrThrow({
        where: { id: postId },
      });
    });

    return post ? mapPost(post) : null;
  },

  async schedulePost({ workspaceId, postId, scheduledAt, targets }, userId) {
    let result;
    try {
      result = await prisma.$transaction(async (tx) => {
        // `setCurrentUserId` (bukan `withCurrentUser`) karena method ini
        // sudah punya transaksi sendiri (guard ownership anti-IDOR di
        // bawah wajib atomik dengan updateMany status) — `withCurrentUser`
        // akan membuka transaksi kedua yang terpisah, memecah atomicity.
        await setCurrentUserId(tx, userId);

        const { count } = await tx.publishingPost.updateMany({
          where: {
            id: postId,
            workspaceId,
            status: {
              in: [ContentStatus.Draft, ContentStatus.ReadyToSchedule],
            },
            deletedAt: null,
          },
          data: { status: ContentStatus.Scheduled, scheduledAt },
        });

        if (count === 0) {
          return null;
        }

        // Guard ownership (anti-IDOR) — `connectedAccountId` datang dari
        // caller (Server Action, dan nanti Route Handler /api/v1 AL-D08)
        // dan WAJIB diverifikasi milik `workspaceId` yang sama di sini,
        // bukan hanya di layer atas (`actions.ts`), supaya caller lain
        // tidak bisa menjadwalkan post ke akun media sosial milik
        // workspace lain (cross-tenant IDOR) kalau lupa mereplikasi guard
        // itu.
        const uniqueConnectedAccountIds = Array.from(
          new Set(targets.map((target) => target.connectedAccountId)),
        );
        const ownedAccountCount = await tx.workspaceConnectedAccount.count({
          where: {
            id: { in: uniqueConnectedAccountIds },
            workspaceId,
          },
        });
        if (ownedAccountCount !== uniqueConnectedAccountIds.length) {
          // Setidaknya satu connectedAccountId bukan milik workspace ini —
          // batalkan seluruh transaksi (termasuk updateMany status di atas)
          // lewat throw, bukan return null, supaya tidak commit.
          throw new ScheduleOwnershipGuardFailed();
        }

        await tx.publishingPostTarget.deleteMany({ where: { postId } });

        await tx.publishingPostTarget.createMany({
          data: targets.map((target) => ({
            postId,
            connectedAccountId: target.connectedAccountId,
            platform: target.platform,
            contentFormat: target.contentFormat,
            platformOptions: (target.platformOptions ?? undefined) as
              Prisma.InputJsonValue | undefined,
            status: "pending",
          })),
        });

        const post = await tx.publishingPost.findUniqueOrThrow({
          where: { id: postId },
        });
        const createdTargets = await tx.publishingPostTarget.findMany({
          where: { postId },
          select: { id: true, connectedAccountId: true },
        });

        return { post, createdTargets };
      });
    } catch (error) {
      if (error instanceof ScheduleOwnershipGuardFailed) {
        return null;
      }
      throw error;
    }

    if (!result) {
      return null;
    }

    const record: PublishingScheduleRecord = {
      ...mapPost(result.post),
      targets: result.createdTargets.map((target) => ({
        id: asPostTargetId(target.id),
        connectedAccountId: asConnectedAccountId(target.connectedAccountId),
      })),
    };

    return record;
  },

  async updateTargetOutcome(
    { postTargetId, outstandJobId, status, publishedUrl, error },
    userId,
  ) {
    await withCurrentUser(userId, (tx) =>
      tx.publishingPostTarget.update({
        where: { id: postTargetId },
        data: { outstandJobId, status, publishedUrl, error },
      }),
    );
  },

  async publishNow({ workspaceId, postId, targets }, userId) {
    let result;
    try {
      result = await prisma.$transaction(async (tx) => {
        // Sama alasan dengan `schedulePost` — guard ownership anti-IDOR di
        // bawah wajib atomik dengan updateMany status, jadi tidak bisa
        // memakai `withCurrentUser` (transaksi terpisah).
        await setCurrentUserId(tx, userId);

        const { count } = await tx.publishingPost.updateMany({
          where: {
            id: postId,
            workspaceId,
            status: {
              in: [ContentStatus.Draft, ContentStatus.ReadyToSchedule],
            },
            deletedAt: null,
          },
          data: { status: ContentStatus.Published, publishedAt: new Date() },
        });

        if (count === 0) {
          return null;
        }

        const uniqueConnectedAccountIds = Array.from(
          new Set(targets.map((target) => target.connectedAccountId)),
        );
        const ownedAccountCount = await tx.workspaceConnectedAccount.count({
          where: {
            id: { in: uniqueConnectedAccountIds },
            workspaceId,
          },
        });
        if (ownedAccountCount !== uniqueConnectedAccountIds.length) {
          throw new ScheduleOwnershipGuardFailed();
        }

        await tx.publishingPostTarget.deleteMany({ where: { postId } });

        await tx.publishingPostTarget.createMany({
          data: targets.map((target) => ({
            postId,
            connectedAccountId: target.connectedAccountId,
            platform: target.platform,
            contentFormat: target.contentFormat,
            platformOptions: (target.platformOptions ?? undefined) as
              Prisma.InputJsonValue | undefined,
            status: "pending",
          })),
        });

        const post = await tx.publishingPost.findUniqueOrThrow({
          where: { id: postId },
        });
        const createdTargets = await tx.publishingPostTarget.findMany({
          where: { postId },
          select: { id: true, connectedAccountId: true },
        });

        return { post, createdTargets };
      });
    } catch (error) {
      if (error instanceof ScheduleOwnershipGuardFailed) {
        return null;
      }
      throw error;
    }

    if (!result) {
      return null;
    }

    const record: PublishingScheduleRecord = {
      ...mapPost(result.post),
      targets: result.createdTargets.map((target) => ({
        id: asPostTargetId(target.id),
        connectedAccountId: asConnectedAccountId(target.connectedAccountId),
      })),
    };

    return record;
  },

  async countScheduledByAccount({ workspaceId, connectedAccountIds }, userId) {
    const rows = await withCurrentUser(userId, (tx) =>
      tx.publishingPostTarget.groupBy({
        by: ["connectedAccountId"],
        where: {
          connectedAccountId: { in: connectedAccountIds },
          post: {
            workspaceId,
            status: ContentStatus.Scheduled,
            deletedAt: null,
          },
        },
        _count: { _all: true },
      }),
    );

    return new Map(
      rows.map((row) => [
        asConnectedAccountId(row.connectedAccountId),
        row._count._all,
      ]),
    ) as Map<ConnectedAccountId, number>;
  },
};
