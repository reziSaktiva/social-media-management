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
import type {
  CalendarItemRecord,
  CalendarItemTargetRecord,
  IPublishingRepository,
  PublishingCancelScheduleRecord,
  PublishingPostRecord,
  PublishingScheduleRecord,
  QueueItemRecord,
  WebhookPostLookupRecord,
} from "@/domains/publishing";
import type {
  Prisma,
  PublishingPost,
  PublishingPostTarget,
  WorkspaceConnectedAccount,
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
    const { count } = await withCurrentUser(userId, (tx) =>
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

    if (count === 0) {
      // `updateMany` tidak throw kalau 0 baris ter-update (mis. RLS
      // default-deny karena actingUserId sudah bukan active member) —
      // beda dari `update()` di atas yang throw P2025. Tanpa guard ini,
      // webhook route akan ACK sukses padahal status post tidak berubah.
      throw new Error(
        `markPostFailed: tidak ada baris ter-update untuk postId=${postId}, workspaceId=${workspaceId}`,
      );
    }
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

  async findPostTargetsByOutstandPostId(outstandPostId) {
    // System-context read (T-026, webhook Outstand) — bypasses per-tenant
    // RLS via a narrow SECURITY DEFINER SQL function (migration
    // `20260907120000_t026_outstand_webhook_system_lookups`), NOT
    // `withCurrentUser`, karena tidak ada acting `userId` sebelum lookup ini
    // resolve. Lihat catatan panjang di interface method ini dan di
    // migration itu sendiri untuk alasan lengkap — ini keputusan yang
    // dilaporkan ke King Rezi, bukan diputuskan diam-diam.
    const rows = await prisma.$queryRaw<WebhookPostTargetLookupRow[]>`
      SELECT * FROM "public"."webhook_find_post_targets_by_outstand_post_id"(${outstandPostId})
    `;

    if (rows.length === 0) {
      return null;
    }

    const [first] = rows;

    // Guard defensif (code review Ridwan Architecture Reviewer, T-026 —
    // defense-in-depth lapis kedua di samping partial unique index pada
    // `publishing_posts.outstand_post_id`, migration
    // `20260907130000_t026_unique_outstand_post_id`): fungsi SQL di atas
    // JOIN lintas `publishing_post_targets`, jadi kalau constraint unique
    // itu ternyata tidak menjamin apa yang diasumsikan (mis. dijalankan di
    // DB yang belum ter-migrate), baris yang di-return bisa berasal dari
    // post/workspace BERBEDA — memakai baris pertama untuk
    // `postId`/`workspaceId` tapi tetap memasukkan SEMUA baris sebagai
    // `targets` akan menulis outcome publish ke post/tenant yang salah.
    // Throw loud di sini (pola ADR-059), bukan diam-diam memakai baris
    // pertama dan mencampur target lintas tenant.
    const mismatched = rows.filter(
      (row) =>
        row.post_id !== first.post_id ||
        row.workspace_id !== first.workspace_id,
    );
    if (mismatched.length > 0) {
      throw new Error(
        `findPostTargetsByOutstandPostId: data integrity violation — ` +
          `outstand_post_id="${outstandPostId}" resolved to rows across ` +
          `multiple posts/workspaces (expected exactly one post per ` +
          `outstand_post_id, enforced by partial unique index ` +
          `publishing_posts_outstand_post_id_unique). post_id/workspace_id ` +
          `values found: ${JSON.stringify([
            ...new Set(rows.map((row) => `${row.post_id}/${row.workspace_id}`)),
          ])}`,
      );
    }

    const record: WebhookPostLookupRecord = {
      postId: asPostId(first.post_id),
      workspaceId: asWorkspaceId(first.workspace_id),
      authorId: asUserId(first.author_id),
      targets: rows.map((row) => ({
        postTargetId: asPostTargetId(row.post_target_id),
        connectedAccountId: asConnectedAccountId(row.connected_account_id),
        outstandAccountId: row.outstand_account_id,
      })),
    };

    return record;
  },
};

/** Row shape returned by the raw SQL call above — snake_case, mirrors the SQL function's RETURNS TABLE. */
interface WebhookPostTargetLookupRow {
  post_id: string;
  workspace_id: string;
  author_id: string;
  post_target_id: string;
  connected_account_id: string;
  outstand_account_id: string;
}
