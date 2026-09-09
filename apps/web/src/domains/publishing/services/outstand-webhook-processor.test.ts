import {
  asConnectedAccountId,
  asPostId,
  asPostTargetId,
  asUserId,
  asWorkspaceId,
  ContentStatus,
  NotificationType,
} from "@social/shared";
import { describe, expect, it, vi } from "vitest";
import type {
  IOutstandAdapter,
  PostTargetOutcome,
} from "../adapters/outstand-adapter";
import type {
  IPublishingRepository,
  WebhookPostLookupRecord,
} from "../repositories/publishing.repository";
import {
  OutstandWebhookProcessor,
  type ParsedOutstandWebhookEvent,
} from "./outstand-webhook-processor";

const WORKSPACE_ID = asWorkspaceId("workspace-1");
const AUTHOR_ID = asUserId("user-author");
const OWNER_ID = asUserId("user-owner");
const POST_ID = asPostId("post-1");
const CONNECTED_ACCOUNT_ID_A = asConnectedAccountId("connected-a");
const CONNECTED_ACCOUNT_ID_B = asConnectedAccountId("connected-b");
const POST_TARGET_ID_A = asPostTargetId("target-a");
const POST_TARGET_ID_B = asPostTargetId("target-b");

function createLookup(
  overrides: Partial<WebhookPostLookupRecord> = {},
): WebhookPostLookupRecord {
  return {
    postId: POST_ID,
    workspaceId: WORKSPACE_ID,
    authorId: AUTHOR_ID,
    targets: [
      {
        postTargetId: POST_TARGET_ID_A,
        connectedAccountId: CONNECTED_ACCOUNT_ID_A,
        outstandAccountId: "outstand-account-a",
      },
      {
        postTargetId: POST_TARGET_ID_B,
        connectedAccountId: CONNECTED_ACCOUNT_ID_B,
        outstandAccountId: "outstand-account-b",
      },
    ],
    ...overrides,
  };
}

function createFakeRepository(
  overrides: Partial<IPublishingRepository> = {},
): IPublishingRepository {
  return {
    createDraft: async ({ workspaceId, authorId, caption }) => ({
      id: POST_ID,
      workspaceId,
      authorId,
      caption,
      status: ContentStatus.Draft,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    }),
    listDrafts: async () => [],
    findDraftById: async () => null,
    updateDraftCaption: async () => null,
    schedulePost: async () => null,
    publishNow: async () => null,
    updateTargetOutcome: async () => undefined,
    setOutstandPostId: async () => undefined,
    countScheduledByAccount: async () => new Map(),
    listQueue: async () => [],
    listCalendarPosts: async () => [],
    listHistory: async () => [],
    getHistoryById: async () => null,
    cancelSchedule: async () => null,
    markPostFailed: async () => undefined,
    getRetryTarget: async () => null,
    resetTargetForRetry: async () => undefined,
    setRetryOutstandPostId: async () => undefined,
    reconcilePostStatusAfterRetry: async () => undefined,
    findPostTargetsByOutstandPostId: async () => null,
    ...overrides,
  } satisfies IPublishingRepository;
}

function outcome(
  outstandAccountId: string,
  status: PostTargetOutcome["status"],
  error: string | null = null,
): PostTargetOutcome {
  return {
    outstandAccountId,
    status,
    error,
    platformPostId:
      status === "published" ? `platform-${outstandAccountId}` : null,
    platformPostUrl:
      status === "published"
        ? `https://fake.outstand.local/${outstandAccountId}`
        : null,
    publishedAt: status === "published" ? new Date(0) : null,
  };
}

function createFakeAdapter(
  fetchPostOutcome: IOutstandAdapter["fetchPostOutcome"],
): IOutstandAdapter {
  return {
    schedulePost: async () => ({ outstandPostId: "unused" }),
    publishNow: async () => ({ outstandPostId: "unused" }),
    fetchPostOutcome,
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
  };
}

describe("OutstandWebhookProcessor — post.published / post.error", () => {
  it("updates only the targets Outstand has reported and leaves the rest untouched (partial success)", async () => {
    const updateTargetOutcome = vi.fn(async () => undefined);
    const markPostFailed = vi.fn(async () => undefined);
    const repository = createFakeRepository({
      findPostTargetsByOutstandPostId: async () => createLookup(),
      updateTargetOutcome,
      markPostFailed,
    });
    const adapter = createFakeAdapter(async () => [
      outcome("outstand-account-a", "published"),
      // account-b belum dilaporkan sama sekali — biarkan status DB apa adanya.
    ]);
    const notify = vi.fn(async () => undefined);
    const processor = new OutstandWebhookProcessor(
      repository,
      adapter,
      { markAccountReconnectRequired: async () => null },
      { notify },
    );

    const event: ParsedOutstandWebhookEvent = {
      eventType: "post.published",
      outstandPostId: "outstand-post-1",
    };
    const result = await processor.process(event);

    expect(result.outcome).toBe("processed");
    expect(updateTargetOutcome).toHaveBeenCalledTimes(1);
    expect(updateTargetOutcome).toHaveBeenCalledWith(
      expect.objectContaining({
        postTargetId: POST_TARGET_ID_A,
        status: "published",
      }),
      AUTHOR_ID,
    );
    // Bukan semua target diketahui gagal (satu published, satu belum
    // diketahui) — post TIDAK ditandai Failed.
    expect(markPostFailed).not.toHaveBeenCalled();
    expect(notify).not.toHaveBeenCalled();
  });

  it("marks the post Failed and notifies the author when ALL targets are known failed (post.error)", async () => {
    const updateTargetOutcome = vi.fn(async () => undefined);
    const markPostFailed = vi.fn(async () => undefined);
    const notify = vi.fn(async () => undefined);
    const repository = createFakeRepository({
      findPostTargetsByOutstandPostId: async () => createLookup(),
      updateTargetOutcome,
      markPostFailed,
    });
    const adapter = createFakeAdapter(async () => [
      outcome("outstand-account-a", "failed", "quota exceeded"),
      outcome("outstand-account-b", "failed", "token invalid"),
    ]);
    const processor = new OutstandWebhookProcessor(
      repository,
      adapter,
      { markAccountReconnectRequired: async () => null },
      { notify },
    );

    const result = await processor.process({
      eventType: "post.error",
      outstandPostId: "outstand-post-1",
    });

    expect(result.outcome).toBe("processed");
    expect(updateTargetOutcome).toHaveBeenCalledTimes(2);
    expect(markPostFailed).toHaveBeenCalledWith(
      { workspaceId: WORKSPACE_ID, postId: POST_ID },
      AUTHOR_ID,
    );
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: WORKSPACE_ID,
        userId: AUTHOR_ID,
        type: NotificationType.PostPublishFailed,
      }),
    );
  });

  it("returns skipped_no_match when the outstandPostId is unknown (soft-deleted / stale event) instead of throwing", async () => {
    const repository = createFakeRepository({
      findPostTargetsByOutstandPostId: async () => null,
    });
    const adapter = createFakeAdapter(async () => []);
    const processor = new OutstandWebhookProcessor(repository, adapter, {
      markAccountReconnectRequired: async () => null,
    });

    const result = await processor.process({
      eventType: "post.published",
      outstandPostId: "unknown-post",
    });

    expect(result.outcome).toBe("skipped_no_match");
  });

  it("throws for a post.* event with no outstandPostId in the payload (malformed)", async () => {
    const repository = createFakeRepository();
    const adapter = createFakeAdapter(async () => []);
    const processor = new OutstandWebhookProcessor(repository, adapter, {
      markAccountReconnectRequired: async () => null,
    });

    await expect(
      processor.process({ eventType: "post.error" }),
    ).rejects.toThrow();
  });
});

describe("OutstandWebhookProcessor — account.token_expired", () => {
  it("marks the account for reconnect and notifies the workspace Owner", async () => {
    const markAccountReconnectRequired = vi.fn(async () => ({
      workspaceId: WORKSPACE_ID,
      connectedAccountId: CONNECTED_ACCOUNT_ID_A,
      ownerUserId: OWNER_ID,
    }));
    const notify = vi.fn(async () => undefined);
    const repository = createFakeRepository();
    const adapter = createFakeAdapter(async () => []);
    const processor = new OutstandWebhookProcessor(
      repository,
      adapter,
      { markAccountReconnectRequired },
      { notify },
    );

    const result = await processor.process({
      eventType: "account.token_expired",
      outstandAccountId: "outstand-account-a",
    });

    expect(result.outcome).toBe("processed");
    expect(markAccountReconnectRequired).toHaveBeenCalledWith(
      "outstand-account-a",
    );
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: WORKSPACE_ID,
        userId: OWNER_ID,
        type: NotificationType.AccountReconnectRequired,
      }),
    );
  });

  it("returns skipped_no_match when the outstandAccountId is unknown", async () => {
    const repository = createFakeRepository();
    const adapter = createFakeAdapter(async () => []);
    const processor = new OutstandWebhookProcessor(repository, adapter, {
      markAccountReconnectRequired: async () => null,
    });

    const result = await processor.process({
      eventType: "account.token_expired",
      outstandAccountId: "unknown-account",
    });

    expect(result.outcome).toBe("skipped_no_match");
  });
});

describe("OutstandWebhookProcessor — unknown event types", () => {
  it("does not throw and reports ignored_unknown_event for events outside the MVP contract", async () => {
    const repository = createFakeRepository();
    const adapter = createFakeAdapter(async () => []);
    const processor = new OutstandWebhookProcessor(repository, adapter, {
      markAccountReconnectRequired: async () => null,
    });

    const result = await processor.process({
      eventType: "comment.received",
    });

    expect(result.outcome).toBe("ignored_unknown_event");
  });
});
