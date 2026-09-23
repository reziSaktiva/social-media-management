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
import { RefreshInboxUseCase } from "./refresh-inbox.use-case";
import { SyncCommentsUseCase } from "./sync-comments.use-case";

const WORKSPACE_ID = asWorkspaceId("workspace-1");
const USER_ID = asUserId("user-1");
const ACCOUNT_ACTIVE_1 = asConnectedAccountId("account-active-1");
const ACCOUNT_ACTIVE_2 = asConnectedAccountId("account-active-2");
const ACCOUNT_INACTIVE = asConnectedAccountId("account-inactive");

function makeComment(id: string): InboxCommentData {
  return {
    outstandCommentId: id,
    outstandAccountId: "unused",
    platform: SocialPlatform.Instagram,
    authorHandle: "@user",
    content: `Komentar ${id}`,
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

describe("RefreshInboxUseCase.refreshAll", () => {
  it("sync hanya ConnectedAccount berstatus active dan mengakumulasi newCommentsCount lintas akun", async () => {
    const fetchedOutstandAccountIds: string[] = [];
    const repository = createFakeRepository({
      upsertInboxItem: async () => ({
        item: {} as EngagementInboxItemRecord,
        isNew: true,
      }),
    });
    const adapter = createFakeAdapter(async (outstandAccountId) => {
      fetchedOutstandAccountIds.push(outstandAccountId);
      return {
        comments: [makeComment(`${outstandAccountId}-1`)],
        nextCursor: null,
      };
    });
    const syncCommentsUseCase = new SyncCommentsUseCase(repository, adapter);
    const useCase = new RefreshInboxUseCase(syncCommentsUseCase, {
      listConnectedAccounts: async () => [
        {
          id: ACCOUNT_ACTIVE_1,
          outstandAccountId: "outstand-active-1",
          status: "active",
        },
        {
          id: ACCOUNT_INACTIVE,
          outstandAccountId: "outstand-inactive",
          status: "reconnect-required",
        },
        {
          id: ACCOUNT_ACTIVE_2,
          outstandAccountId: "outstand-active-2",
          status: "active",
        },
      ],
    });

    const result = await useCase.refreshAll(WORKSPACE_ID, USER_ID);

    expect(result).toEqual({ newCommentsCount: 2 });
    expect(fetchedOutstandAccountIds).toEqual([
      "outstand-active-1",
      "outstand-active-2",
    ]);
  });

  it("mengembalikan newCommentsCount 0 tanpa memanggil sync kalau tidak ada akun aktif", async () => {
    const fetchComments = vi.fn<IOutstandAdapter["fetchComments"]>();
    const repository = createFakeRepository();
    const adapter = createFakeAdapter(fetchComments);
    const syncCommentsUseCase = new SyncCommentsUseCase(repository, adapter);
    const useCase = new RefreshInboxUseCase(syncCommentsUseCase, {
      listConnectedAccounts: async () => [
        {
          id: ACCOUNT_INACTIVE,
          outstandAccountId: "outstand-inactive",
          status: "reconnect-required",
        },
      ],
    });

    const result = await useCase.refreshAll(WORKSPACE_ID, USER_ID);

    expect(result).toEqual({ newCommentsCount: 0 });
    expect(fetchComments).not.toHaveBeenCalled();
  });
});
