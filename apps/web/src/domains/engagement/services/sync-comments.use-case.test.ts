import {
  asConnectedAccountId,
  asUserId,
  asWorkspaceId,
  SocialPlatform,
} from "@social/shared";
import type { IOutstandAdapter, InboxCommentData } from "@social/shared";
import { describe, expect, it, vi } from "vitest";
import type { IEngagementRepository } from "../repositories/engagement.repository";
import type { EngagementInboxItemRecord } from "../types";
import { SyncCommentsUseCase } from "./sync-comments.use-case";

const WORKSPACE_ID = asWorkspaceId("workspace-1");
const CONNECTED_ACCOUNT_ID = asConnectedAccountId("account-1");
const USER_ID = asUserId("user-1");
const OUTSTAND_ACCOUNT_ID = "outstand-account-1";

function makeComment(index: number): InboxCommentData {
  return {
    outstandCommentId: `comment-${index}`,
    outstandAccountId: OUTSTAND_ACCOUNT_ID,
    platform: SocialPlatform.Instagram,
    authorHandle: `@user${index}`,
    content: `Komentar ke-${index}`,
    outstandPostId: null,
    receivedAt: new Date(0),
  };
}

function createFakeAdapter(
  fetchComments: IOutstandAdapter["fetchComments"],
): IOutstandAdapter {
  return {
    connectAccount: async () => ({ redirectUrl: "/unused" }),
    uploadMediaWorkingCopy: async () => ({
      outstandMediaId: "unused",
      outstandMediaUrl: "https://fake.outstand.local/media/unused",
      expiresAt: new Date(),
    }),
    resolveConnectCallback: async () => ({
      outstandAccountId: "unused",
      platform: "instagram" as never,
      handle: "unused",
      status: "active",
    }),
    schedulePost: async () => ({ outstandPostId: "unused" }),
    publishNow: async () => ({ outstandPostId: "unused" }),
    fetchPostOutcome: async () => [],
    cancelScheduledPost: async () => undefined,
    deletePost: async () => undefined,
    fetchPostMetrics: async () => ({
      impressions: 0,
      reach: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      clicks: null,
      engagementRate: 0,
    }),
    fetchWorkspaceMetrics: async () => ({
      totalPosts: 0,
      totalReach: 0,
      totalEngagements: 0,
      avgEngagementRate: 0,
    }),
    fetchComments,
    replyToComment: async () => ({ outstandReplyId: "fake-reply" }),
  };
}

function createFakeRepository(
  overrides: Partial<IEngagementRepository> = {},
): IEngagementRepository {
  return {
    listInboxItems: async () => [],
    findInboxItemById: async () => null,
    upsertInboxItem: async () => ({
      item: {} as EngagementInboxItemRecord,
      isNew: true,
    }),
    markInboxItemStatus: async () => null,
    createReply: async () => {
      throw new Error("not used in this test");
    },
    listRepliesByInboxItemId: async () => [],
    ...overrides,
  };
}

describe("SyncCommentsUseCase.sync", () => {
  it("mengupsert setiap komentar hasil fetchComments dan menghitung yang benar-benar baru", async () => {
    const upsertedExternalIds: string[] = [];
    const repository = createFakeRepository({
      upsertInboxItem: async (input) => {
        upsertedExternalIds.push(input.externalId);
        return {
          item: {} as EngagementInboxItemRecord,
          isNew: true,
        };
      },
    });
    const adapter = createFakeAdapter(async () => ({
      comments: [makeComment(1), makeComment(2)],
      nextCursor: null,
    }));
    const useCase = new SyncCommentsUseCase(repository, adapter);

    const result = await useCase.sync(
      {
        workspaceId: WORKSPACE_ID,
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        outstandAccountId: OUTSTAND_ACCOUNT_ID,
      },
      USER_ID,
    );

    expect(result).toEqual({ newCommentsCount: 2 });
    expect(upsertedExternalIds).toEqual(["comment-1", "comment-2"]);
  });

  it("idempoten — sync kedua untuk komentar yang sama tidak menghitung komentar baru", async () => {
    // Simulasikan state persisten sederhana: sekali externalId pernah
    // di-upsert, panggilan berikutnya untuk externalId yang sama
    // mengembalikan isNew: false (persis perilaku implementasi Prisma
    // nyata, yang membedakan lewat findUnique SEBELUM upsert).
    const seen = new Set<string>();
    const repository = createFakeRepository({
      upsertInboxItem: async (input) => {
        const isNew = !seen.has(input.externalId);
        seen.add(input.externalId);
        return { item: {} as EngagementInboxItemRecord, isNew };
      },
    });
    const adapter = createFakeAdapter(async () => ({
      comments: [makeComment(1), makeComment(2)],
      nextCursor: null,
    }));
    const useCase = new SyncCommentsUseCase(repository, adapter);
    const payload = {
      workspaceId: WORKSPACE_ID,
      connectedAccountId: CONNECTED_ACCOUNT_ID,
      outstandAccountId: OUTSTAND_ACCOUNT_ID,
    };

    const first = await useCase.sync(payload, USER_ID);
    const second = await useCase.sync(payload, USER_ID);

    expect(first).toEqual({ newCommentsCount: 2 });
    expect(second).toEqual({ newCommentsCount: 0 });
  });

  it("mengikuti nextCursor sampai habis (pagination)", async () => {
    const cursorsRequested: (string | undefined)[] = [];
    const fetchComments = vi
      .fn<IOutstandAdapter["fetchComments"]>()
      .mockImplementationOnce(async (_accountId, cursor) => {
        cursorsRequested.push(cursor);
        return { comments: [makeComment(1)], nextCursor: "page-2" };
      })
      .mockImplementationOnce(async (_accountId, cursor) => {
        cursorsRequested.push(cursor);
        return { comments: [makeComment(2)], nextCursor: null };
      });
    const repository = createFakeRepository();
    const adapter = createFakeAdapter(fetchComments);
    const useCase = new SyncCommentsUseCase(repository, adapter);

    const result = await useCase.sync(
      {
        workspaceId: WORKSPACE_ID,
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        outstandAccountId: OUTSTAND_ACCOUNT_ID,
      },
      USER_ID,
    );

    expect(result).toEqual({ newCommentsCount: 2 });
    expect(cursorsRequested).toEqual([undefined, "page-2"]);
    expect(fetchComments).toHaveBeenCalledTimes(2);
  });

  it("mengirim SATU notifikasi aggregate per member aktif kalau ada komentar baru (bukan per-komentar)", async () => {
    const notify = vi.fn<
      (input: { userId: string; body: string }) => Promise<undefined>
    >(async () => undefined);
    const repository = createFakeRepository();
    const adapter = createFakeAdapter(async () => ({
      comments: [makeComment(1), makeComment(2), makeComment(3)],
      nextCursor: null,
    }));
    const memberA = asUserId("member-a");
    const memberB = asUserId("member-b");
    const useCase = new SyncCommentsUseCase(
      repository,
      adapter,
      { notify },
      {
        listActiveMembers: async () => [
          { userId: memberA },
          { userId: memberB },
        ],
      },
    );

    await useCase.sync(
      {
        workspaceId: WORKSPACE_ID,
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        outstandAccountId: OUTSTAND_ACCOUNT_ID,
      },
      USER_ID,
    );

    expect(notify).toHaveBeenCalledTimes(2);
    const notifiedUserIds = notify.mock.calls.map((call) => call[0].userId);
    expect(notifiedUserIds.sort()).toEqual([memberA, memberB].sort());
    for (const call of notify.mock.calls) {
      expect(call[0].body).toContain("3 komentar baru");
    }
  });

  it("tidak throw dan tidak mengirim notifikasi kalau port notifikasi/workspace member tidak disuplai", async () => {
    const repository = createFakeRepository();
    const adapter = createFakeAdapter(async () => ({
      comments: [makeComment(1)],
      nextCursor: null,
    }));
    const useCase = new SyncCommentsUseCase(repository, adapter);

    const result = await useCase.sync(
      {
        workspaceId: WORKSPACE_ID,
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        outstandAccountId: OUTSTAND_ACCOUNT_ID,
      },
      USER_ID,
    );

    expect(result).toEqual({ newCommentsCount: 1 });
  });

  it("tidak mengirim notifikasi kalau tidak ada komentar baru sama sekali", async () => {
    const notify = vi.fn(async () => undefined);
    const repository = createFakeRepository({
      upsertInboxItem: async () => ({
        item: {} as EngagementInboxItemRecord,
        isNew: false,
      }),
    });
    const adapter = createFakeAdapter(async () => ({
      comments: [makeComment(1)],
      nextCursor: null,
    }));
    const useCase = new SyncCommentsUseCase(
      repository,
      adapter,
      { notify },
      {
        listActiveMembers: async () => [{ userId: asUserId("member-a") }],
      },
    );

    const result = await useCase.sync(
      {
        workspaceId: WORKSPACE_ID,
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        outstandAccountId: OUTSTAND_ACCOUNT_ID,
      },
      USER_ID,
    );

    expect(result).toEqual({ newCommentsCount: 0 });
    expect(notify).not.toHaveBeenCalled();
  });
});
