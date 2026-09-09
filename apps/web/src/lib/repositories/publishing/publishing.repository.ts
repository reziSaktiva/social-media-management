import {
  asConnectedAccountId,
  asPostId,
  asPostTargetId,
  asUserId,
  asWorkspaceId,
  type ConnectedAccountId,
  type ContentFormat,
  ContentStatus,
  type SocialPlatform,
} from "@social/shared";
import {
  HISTORY_TERMINAL_STATUSES,
  type CalendarItemRecord,
  type CalendarItemTargetRecord,
  type HistoryItemRecord,
  type HistoryItemTargetRecord,
  type IPublishingRepository,
  type PublishingCancelScheduleRecord,
  type PublishingPostRecord,
  type PublishingPostTargetStatus,
  type PublishingScheduleRecord,
  type QueueItemRecord,
  type RetryTargetRecord,
} from "@/domains/publishing";
import {
  Prisma,
  type PublishingPost,
  type PublishingPostTarget,
  type WorkspaceConnectedAccount,
} from "@/generated/prisma/client";
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

/**
 * Guard bug T-034.2/T-034.3 (laporan QA Najwa, 2026-09-08): kolom `id`
 * bertipe `uuid` di Postgres — `postId` dari URL segment `[postId]` yang
 * bukan format UUID valid (mis. "not-a-valid-uuid") membuat Postgres
 * menolak query dengan "invalid input syntax for type uuid" sebelum
 * sempat mengevaluasi kondisi `WHERE`, jadi Prisma melempar
 * `PrismaClientKnownRequestError` (bukan return `null` seperti kasus
 * "tidak ketemu" biasa). Konsisten pola `isRecordNotFound` di
 * `workspace.repository.ts`: treat sebagai "tidak ketemu" di sini
 * (repository), bukan dibiarkan bocor sebagai Prisma error mentah ke
 * `PublishingService` (AGENTS.md #6) — caller (`getHistoryById`) tetap
 * cukup menangani `null` seperti kasus not-found lainnya.
 */
function isInvalidIdFormat(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2007" || error.code === "P2023")
  );
}

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

type QueuePostWithTargets = PublishingPost & {
  targets: (PublishingPostTarget & {
    connectedAccount: WorkspaceConnectedAccount;
  })[];
};

function mapQueueItem(post: QueuePostWithTargets): QueueItemRecord {
  return {
    id: asPostId(post.id),
    caption: post.caption,
    // Non-null: query di bawah menyaring status Scheduled, yang hanya
    // ditetapkan bersamaan dengan `scheduledAt` (lihat `schedulePost`).
    scheduledAt: post.scheduledAt as Date,
    createdAt: post.createdAt,
    targets: post.targets.map((target) => ({
      id: asPostTargetId(target.id),
      connectedAccountId: asConnectedAccountId(target.connectedAccountId),
      platform: target.platform as SocialPlatform,
      contentFormat: target.contentFormat as ContentFormat,
      accountHandle: target.connectedAccount.handle,
    })),
  };
}

function mapCalendarItem(post: QueuePostWithTargets): CalendarItemRecord {
  return {
    id: asPostId(post.id),
    caption: post.caption,
    status: post.status as ContentStatus,
    scheduledAt: post.scheduledAt,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    targets: post.targets.map((target): CalendarItemTargetRecord => ({
      id: asPostTargetId(target.id),
      connectedAccountId: asConnectedAccountId(target.connectedAccountId),
      platform: target.platform as SocialPlatform,
      contentFormat: target.contentFormat as ContentFormat,
      accountHandle: target.connectedAccount.handle,
      platformPostUrl: target.platformPostUrl,
    })),
  };
}

function mapHistoryItem(post: QueuePostWithTargets): HistoryItemRecord {
  return {
    id: asPostId(post.id),
    caption: post.caption,
    status: post.status as ContentStatus,
    scheduledAt: post.scheduledAt,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    targets: post.targets.map((target): HistoryItemTargetRecord => ({
      id: asPostTargetId(target.id),
      connectedAccountId: asConnectedAccountId(target.connectedAccountId),
      platform: target.platform as SocialPlatform,
      contentFormat: target.contentFormat as ContentFormat,
      accountHandle: target.connectedAccount.handle,
      status: target.status as PublishingPostTargetStatus,
      platformPostUrl: target.platformPostUrl,
      error: target.error,
    })),
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
    { postTargetId, platformPostId, status, platformPostUrl, error },
    userId,
  ) {
    await withCurrentUser(userId, (tx) =>
      tx.publishingPostTarget.update({
        where: { id: postTargetId },
        data: { platformPostId, status, platformPostUrl, error },
      }),
    );
  },

  async setOutstandPostId({ workspaceId, postId, outstandPostId }, userId) {
    await withCurrentUser(userId, (tx) =>
      tx.publishingPost.updateMany({
        where: { id: postId, workspaceId },
        data: { outstandPostId },
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

  async cancelSchedule({ workspaceId, postId }, userId) {
    const result = await withCurrentUser(userId, async (tx) => {
      // Guard dulu — kalau post bukan Scheduled di workspace ini (double
      // klik, UI basi, salah workspace), keluar lebih awal tanpa membuang
      // query findMany di bawah untuk data yang tidak akan dipakai.
      const { count } = await tx.publishingPost.updateMany({
        where: {
          id: postId,
          workspaceId,
          status: ContentStatus.Scheduled,
          deletedAt: null,
        },
        data: { status: ContentStatus.Draft, scheduledAt: null },
      });

      if (count === 0) {
        return null;
      }

      // Status/error target diambil untuk log diagnostik target yang sempat
      // gagal, SEBELUM dihapus. `post.outstandPostId` (dibaca di bawah lewat
      // `findUniqueOrThrow`, sengaja TIDAK di-null-kan oleh `updateMany` di
      // atas) dibutuhkan use-case pemanggil untuk membatalkan SATU post yang
      // sama di sisi Outstand setelah transaksi ini commit (adapter call
      // tidak boleh terjadi di dalam transaksi, sama alasan dengan
      // schedulePost/publishNow) — nilai lama ini otomatis tergantikan kalau
      // post dijadwalkan ulang (`setOutstandPostId` dipanggil lagi), jadi
      // tidak masalah dibiarkan di kolom sampai itu terjadi.
      const existingTargets = await tx.publishingPostTarget.findMany({
        where: { postId },
        select: {
          platform: true,
          status: true,
          error: true,
        },
      });

      // Post kembali ke Draft tidak punya target persisten — sama seperti
      // Draft yang belum pernah dijadwalkan (schedulePost selalu
      // deleteMany + recreate saat (re)schedule). Target yang sempat
      // tercatat `failed` (partial-publish sebelum dibatalkan) kehilangan
      // baris diagnostiknya di sini — log dulu supaya tidak hilang tanpa
      // jejak sama sekali (tidak ada audit trail lain untuk kasus ini).
      const failedTargets = existingTargets.filter(
        (target) => target.status === "failed",
      );
      if (failedTargets.length > 0) {
        console.warn(
          `[cancelSchedule] postId=${postId} membatalkan ${failedTargets.length} target yang sudah berstatus "failed" sebelum sempat dibatalkan — riwayat error akan terhapus:`,
          failedTargets.map((target) => ({
            platform: target.platform,
            error: target.error,
          })),
        );
      }

      await tx.publishingPostTarget.deleteMany({ where: { postId } });

      const post = await tx.publishingPost.findUniqueOrThrow({
        where: { id: postId },
      });

      return { post, existingTargets };
    });

    if (!result) {
      return null;
    }

    const record: PublishingCancelScheduleRecord = {
      ...mapPost(result.post),
      outstandPostId: result.post.outstandPostId,
    };

    return record;
  },

  async markPostFailed({ workspaceId, postId }, userId) {
    await withCurrentUser(userId, (tx) =>
      tx.publishingPost.updateMany({
        where: {
          id: postId,
          workspaceId,
          // Redesain ACL 2026-08-26: sekarang juga dipanggil dari
          // SchedulePostsUseCase (satu call schedulePost gagal total →
          // semua target pasti gagal), bukan hanya PublishNowUseCase.
          status: { in: [ContentStatus.Published, ContentStatus.Scheduled] },
          deletedAt: null,
        },
        data: { status: ContentStatus.Failed },
      }),
    );
  },

  async listQueue({ workspaceId }, userId) {
    const posts = await withCurrentUser(userId, (tx) =>
      tx.publishingPost.findMany({
        where: {
          workspaceId,
          status: ContentStatus.Scheduled,
          deletedAt: null,
        },
        orderBy: { scheduledAt: "asc" },
        include: {
          targets: {
            include: { connectedAccount: true },
          },
        },
      }),
    );

    return posts.map(mapQueueItem);
  },

  async listCalendarPosts(
    { workspaceId, from, to, connectedAccountIds, statuses },
    userId,
  ) {
    const posts = await withCurrentUser(userId, (tx) =>
      tx.publishingPost.findMany({
        where: {
          workspaceId,
          deletedAt: null,
          ...(statuses && statuses.length > 0
            ? { status: { in: statuses } }
            : {}),
          ...(connectedAccountIds && connectedAccountIds.length > 0
            ? {
                targets: {
                  some: { connectedAccountId: { in: connectedAccountIds } },
                },
              }
            : {}),
          // Rentang generik (T-033.1) — post yang JADWALNYA ATAU HASIL
          // PUBLISHNYA jatuh di [from, to]. Draft/InReview/ReadyToSchedule
          // tidak punya scheduledAt maupun publishedAt terisi di runtime
          // manapun saat ini, jadi otomatis tidak lolos filter ini — lihat
          // catatan gap di `CalendarItemRecord`.
          OR: [
            { scheduledAt: { gte: from, lte: to } },
            { publishedAt: { gte: from, lte: to } },
          ],
        },
        include: {
          targets: {
            include: { connectedAccount: true },
          },
        },
      }),
    );

    return posts.map(mapCalendarItem);
  },

  async listHistory({ workspaceId, statuses, connectedAccountIds }, userId) {
    // `statuses` sudah di-clamp ke HISTORY_TERMINAL_STATUSES oleh
    // `PublishingService.listHistory` — repository ini murni proyeksi,
    // tidak menegakkan invariant sendiri (konsisten `listCalendarPosts`).
    const effectiveStatuses =
      statuses && statuses.length > 0 ? statuses : HISTORY_TERMINAL_STATUSES;
    const posts = await withCurrentUser(userId, (tx) =>
      tx.publishingPost.findMany({
        where: {
          workspaceId,
          deletedAt: null,
          status: { in: [...effectiveStatuses] },
          ...(connectedAccountIds && connectedAccountIds.length > 0
            ? {
                targets: {
                  some: { connectedAccountId: { in: connectedAccountIds } },
                },
              }
            : {}),
        },
        // Proksi "waktu selesai" — lihat catatan gap `failedAt` di
        // `IPublishingRepository.listHistory`.
        orderBy: { updatedAt: "desc" },
        include: {
          targets: {
            include: { connectedAccount: true },
          },
        },
      }),
    );

    return posts.map(mapHistoryItem);
  },

  async getHistoryById({ workspaceId, postId }, userId) {
    let post;
    try {
      post = await withCurrentUser(userId, (tx) =>
        tx.publishingPost.findFirst({
          where: {
            id: postId,
            workspaceId,
            deletedAt: null,
            // Invariant "history = post selesai" ditegakkan langsung di
            // sini (beda dari `listHistory`, tidak ada input `statuses`
            // untuk method single-item ini).
            status: { in: [...HISTORY_TERMINAL_STATUSES] },
          },
          include: {
            targets: {
              include: { connectedAccount: true },
            },
          },
        }),
      );
    } catch (error) {
      if (isInvalidIdFormat(error)) {
        return null;
      }
      throw error;
    }

    return post ? mapHistoryItem(post) : null;
  },

  async getRetryTarget({ workspaceId, postId, targetId }, userId) {
    const target = await withCurrentUser(userId, (tx) =>
      tx.publishingPostTarget.findFirst({
        where: {
          id: targetId,
          postId,
          post: { workspaceId, deletedAt: null },
        },
        include: { post: true, connectedAccount: true },
      }),
    );

    if (!target) {
      return null;
    }

    const record: RetryTargetRecord = {
      postId: asPostId(target.post.id),
      workspaceId: asWorkspaceId(target.post.workspaceId),
      postOutstandPostId: target.post.outstandPostId,
      caption: target.post.caption,
      targetId: asPostTargetId(target.id),
      targetStatus: target.status as PublishingPostTargetStatus,
      connectedAccountId: asConnectedAccountId(target.connectedAccountId),
      outstandAccountId: target.connectedAccount.outstandAccountId,
      platform: target.platform as SocialPlatform,
      contentFormat: target.contentFormat as ContentFormat,
      platformOptions: target.platformOptions as Record<string, unknown> | null,
    };

    return record;
  },

  async resetTargetForRetry({ targetId }, userId) {
    await withCurrentUser(userId, (tx) =>
      tx.publishingPostTarget.update({
        where: { id: targetId },
        data: {
          status: "pending",
          platformPostId: null,
          platformPostUrl: null,
          error: null,
        },
      }),
    );
  },

  async setRetryOutstandPostId({ targetId, retryOutstandPostId }, userId) {
    await withCurrentUser(userId, (tx) =>
      tx.publishingPostTarget.update({
        where: { id: targetId },
        data: { retryOutstandPostId },
      }),
    );
  },

  async reconcilePostStatusAfterRetry({ workspaceId, postId }, userId) {
    await withCurrentUser(userId, async (tx) => {
      // Idempoten by design: kalau masih ada target `failed` (retry gagal
      // lagi, atau target lain di post ini yang belum di-retry), post
      // TETAP `Failed` — tidak ada updateMany yang dieksekusi.
      const remainingFailedCount = await tx.publishingPostTarget.count({
        where: { postId, status: "failed" },
      });

      if (remainingFailedCount > 0) {
        return;
      }

      await tx.publishingPost.updateMany({
        where: {
          id: postId,
          workspaceId,
          status: ContentStatus.Failed,
          deletedAt: null,
        },
        data: { status: ContentStatus.Published },
      });
    });
  },
};
