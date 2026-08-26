import {
  asConnectedAccountId,
  asPostId,
  asPostTargetId,
  asUserId,
  asWorkspaceId,
  ContentFormat,
  ContentStatus,
  MemberRole,
  SocialPlatform,
} from "@social/shared";
import { describe, expect, it } from "vitest";
import { AuthorizationError, ConflictError } from "@/lib/utils/errors";
import type {
  IOutstandAdapter,
  PostTargetOutcome,
} from "../adapters/outstand-adapter";
import { PublishingDomainError } from "../errors";
import type {
  IPublishingRepository,
  PublishingPostRecord,
  PublishingScheduleRecord,
} from "../repositories/publishing.repository";
import { PublishNowUseCase } from "./publish-now.use-case";

const WORKSPACE_ID = asWorkspaceId("workspace-1");
const AUTHOR_ID = asUserId("user-1");

function createFakeRepository(
  overrides: Partial<IPublishingRepository> = {},
): IPublishingRepository {
  return {
    createDraft: async ({
      workspaceId,
      authorId,
      caption,
    }): Promise<PublishingPostRecord> => ({
      id: asPostId("post-1"),
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
    cancelSchedule: async () => null,
    markPostFailed: async () => undefined,
    ...overrides,
  };
}

function publishedOutcome(outstandAccountId: string): PostTargetOutcome {
  return {
    outstandAccountId,
    status: "published",
    error: null,
    platformPostId: `platform-${outstandAccountId}`,
    platformPostUrl: `https://fake.outstand.local/posts/${outstandAccountId}`,
    publishedAt: new Date(0),
  };
}

function failedOutcome(
  outstandAccountId: string,
  error: string,
): PostTargetOutcome {
  return {
    outstandAccountId,
    status: "failed",
    error,
    platformPostId: null,
    platformPostUrl: null,
    publishedAt: null,
  };
}

function createFakeOutstandAdapter(
  overrides: Partial<IOutstandAdapter> = {},
): IOutstandAdapter {
  return {
    schedulePost: async () => ({ outstandPostId: "fake-post" }),
    publishNow: async () => ({ outstandPostId: "fake-post" }),
    fetchPostOutcome: async () => [],
    cancelScheduledPost: async () => undefined,
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
    ...overrides,
  };
}

describe("PublishNowUseCase.execute", () => {
  const POST_ID = asPostId("post-1");
  const CONNECTED_ACCOUNT_1 = asConnectedAccountId("conn-1");
  const CONNECTED_ACCOUNT_2 = asConnectedAccountId("conn-2");
  const FOREIGN_CONNECTED_ACCOUNT = asConnectedAccountId("conn-foreign");

  function basePublishRecord(
    targets: PublishingScheduleRecord["targets"],
  ): PublishingScheduleRecord {
    return {
      id: POST_ID,
      workspaceId: WORKSPACE_ID,
      authorId: AUTHOR_ID,
      caption: "Hello world",
      status: ContentStatus.Published,
      createdAt: new Date(0),
      updatedAt: new Date(0),
      targets,
    };
  }

  it("happy path: ONE adapter call for both targets, persists the shared outstandPostId, then resolves per-account outcome via fetchPostOutcome", async () => {
    const publishRecord = basePublishRecord([
      {
        id: asPostTargetId("target-1"),
        connectedAccountId: CONNECTED_ACCOUNT_1,
      },
      {
        id: asPostTargetId("target-2"),
        connectedAccountId: CONNECTED_ACCOUNT_2,
      },
    ]);

    const outcomes: Parameters<
      IPublishingRepository["updateTargetOutcome"]
    >[0][] = [];
    const outstandPostIdCalls: Parameters<
      IPublishingRepository["setOutstandPostId"]
    >[0][] = [];
    let publishNowCallCount = 0;
    const repository = createFakeRepository({
      publishNow: async () => publishRecord,
      updateTargetOutcome: async (input) => {
        outcomes.push(input);
      },
      setOutstandPostId: async (input) => {
        outstandPostIdCalls.push(input);
      },
    });
    const adapter = createFakeOutstandAdapter({
      publishNow: async ({ targets }) => {
        publishNowCallCount += 1;
        expect(targets).toHaveLength(2);
        return { outstandPostId: "fake-post-shared" };
      },
      fetchPostOutcome: async (outstandPostId) => {
        expect(outstandPostId).toBe("fake-post-shared");
        return [
          publishedOutcome("outstand-acc-1"),
          publishedOutcome("outstand-acc-2"),
        ];
      },
    });

    const useCase = new PublishNowUseCase(repository, adapter);

    const result = await useCase.execute({
      workspaceId: WORKSPACE_ID,
      postId: POST_ID,
      targets: [
        {
          connectedAccountId: CONNECTED_ACCOUNT_1,
          platform: SocialPlatform.Instagram,
          contentFormat: ContentFormat.Post,
          outstandAccountId: "outstand-acc-1",
        },
        {
          connectedAccountId: CONNECTED_ACCOUNT_2,
          platform: SocialPlatform.Facebook,
          contentFormat: ContentFormat.Reel,
          outstandAccountId: "outstand-acc-2",
        },
      ],
      actorRole: MemberRole.Creator,
      actingUserId: AUTHOR_ID,
    });

    expect(result).toBe(publishRecord);
    // SATU call ke adapter untuk semua target (redesain 2026-08-26).
    expect(publishNowCallCount).toBe(1);
    expect(outstandPostIdCalls).toEqual([
      {
        workspaceId: WORKSPACE_ID,
        postId: POST_ID,
        outstandPostId: "fake-post-shared",
      },
    ]);
    expect(outcomes).toEqual(
      expect.arrayContaining([
        {
          postTargetId: asPostTargetId("target-1"),
          status: "published",
          platformPostId: "platform-outstand-acc-1",
          platformPostUrl: "https://fake.outstand.local/posts/outstand-acc-1",
          error: undefined,
        },
        {
          postTargetId: asPostTargetId("target-2"),
          status: "published",
          platformPostId: "platform-outstand-acc-2",
          platformPostUrl: "https://fake.outstand.local/posts/outstand-acc-2",
          error: undefined,
        },
      ]),
    );
    expect(outcomes).toHaveLength(2);
  });

  it("marks the post Failed when the single adapter call rejects (all targets fail together, bug fix 2026-08-26)", async () => {
    const publishRecord = basePublishRecord([
      {
        id: asPostTargetId("target-1"),
        connectedAccountId: CONNECTED_ACCOUNT_1,
      },
      {
        id: asPostTargetId("target-2"),
        connectedAccountId: CONNECTED_ACCOUNT_2,
      },
    ]);

    let markPostFailedCalls = 0;
    const repository = createFakeRepository({
      publishNow: async () => publishRecord,
      updateTargetOutcome: async () => undefined,
      markPostFailed: async (input) => {
        markPostFailedCalls += 1;
        expect(input).toEqual({
          workspaceId: WORKSPACE_ID,
          postId: POST_ID,
        });
      },
    });
    const adapter = createFakeOutstandAdapter({
      publishNow: async () => {
        throw new Error("outstand down");
      },
    });

    const useCase = new PublishNowUseCase(repository, adapter);

    await useCase.execute({
      workspaceId: WORKSPACE_ID,
      postId: POST_ID,
      targets: [
        {
          connectedAccountId: CONNECTED_ACCOUNT_1,
          platform: SocialPlatform.Instagram,
          contentFormat: ContentFormat.Post,
          outstandAccountId: "outstand-acc-1",
        },
        {
          connectedAccountId: CONNECTED_ACCOUNT_2,
          platform: SocialPlatform.Facebook,
          contentFormat: ContentFormat.Reel,
          outstandAccountId: "outstand-acc-2",
        },
      ],
      actorRole: MemberRole.Creator,
      actingUserId: AUTHOR_ID,
    });

    expect(markPostFailedCalls).toBe(1);
  });

  it("keeps the post Published when fetchPostOutcome reports SOME targets failed and some published (partial success)", async () => {
    const publishRecord = basePublishRecord([
      {
        id: asPostTargetId("target-1"),
        connectedAccountId: CONNECTED_ACCOUNT_1,
      },
      {
        id: asPostTargetId("target-2"),
        connectedAccountId: CONNECTED_ACCOUNT_2,
      },
    ]);

    let markPostFailedCalls = 0;
    const repository = createFakeRepository({
      publishNow: async () => publishRecord,
      updateTargetOutcome: async () => undefined,
      markPostFailed: async () => {
        markPostFailedCalls += 1;
      },
    });
    const adapter = createFakeOutstandAdapter({
      publishNow: async () => ({ outstandPostId: "fake-post-shared" }),
      fetchPostOutcome: async () => [
        publishedOutcome("outstand-acc-1"),
        failedOutcome("outstand-acc-2", "rejected by platform"),
      ],
    });

    const useCase = new PublishNowUseCase(repository, adapter);

    await useCase.execute({
      workspaceId: WORKSPACE_ID,
      postId: POST_ID,
      targets: [
        {
          connectedAccountId: CONNECTED_ACCOUNT_1,
          platform: SocialPlatform.Instagram,
          contentFormat: ContentFormat.Post,
          outstandAccountId: "outstand-acc-1",
        },
        {
          connectedAccountId: CONNECTED_ACCOUNT_2,
          platform: SocialPlatform.Facebook,
          contentFormat: ContentFormat.Reel,
          outstandAccountId: "outstand-acc-2",
        },
      ],
      actorRole: MemberRole.Creator,
      actingUserId: AUTHOR_ID,
    });

    expect(markPostFailedCalls).toBe(0);
  });

  it("keeps the post Published when ALL targets succeed (no regression)", async () => {
    const publishRecord = basePublishRecord([
      {
        id: asPostTargetId("target-1"),
        connectedAccountId: CONNECTED_ACCOUNT_1,
      },
    ]);

    let markPostFailedCalls = 0;
    const repository = createFakeRepository({
      publishNow: async () => publishRecord,
      updateTargetOutcome: async () => undefined,
      markPostFailed: async () => {
        markPostFailedCalls += 1;
      },
    });
    const adapter = createFakeOutstandAdapter({
      publishNow: async () => ({ outstandPostId: "fake-post-shared" }),
      fetchPostOutcome: async () => [publishedOutcome("outstand-acc-1")],
    });

    const useCase = new PublishNowUseCase(repository, adapter);

    await useCase.execute({
      workspaceId: WORKSPACE_ID,
      postId: POST_ID,
      targets: [
        {
          connectedAccountId: CONNECTED_ACCOUNT_1,
          platform: SocialPlatform.Instagram,
          contentFormat: ContentFormat.Post,
          outstandAccountId: "outstand-acc-1",
        },
      ],
      actorRole: MemberRole.Creator,
      actingUserId: AUTHOR_ID,
    });

    expect(markPostFailedCalls).toBe(0);
  });

  it.each([MemberRole.Owner, MemberRole.Admin, MemberRole.Creator])(
    "allows role %s (ADR-074 — sama seperti Schedule)",
    async (role) => {
      const repository = createFakeRepository({
        publishNow: async () => basePublishRecord([]),
      });
      const adapter = createFakeOutstandAdapter();
      const useCase = new PublishNowUseCase(repository, adapter);

      await expect(
        useCase.execute({
          workspaceId: WORKSPACE_ID,
          postId: POST_ID,
          targets: [],
          actorRole: role,
          actingUserId: AUTHOR_ID,
        }),
      ).resolves.toBeDefined();
    },
  );

  it("rejects a content format not allowed for the platform before calling repository or adapter", async () => {
    let repositoryCalled = false;
    let adapterCalled = false;
    const repository = createFakeRepository({
      publishNow: async () => {
        repositoryCalled = true;
        return null;
      },
    });
    const adapter = createFakeOutstandAdapter({
      publishNow: async () => {
        adapterCalled = true;
        return { outstandPostId: "should-not-happen" };
      },
    });
    const useCase = new PublishNowUseCase(repository, adapter);

    await expect(
      useCase.execute({
        workspaceId: WORKSPACE_ID,
        postId: POST_ID,
        targets: [
          {
            connectedAccountId: CONNECTED_ACCOUNT_1,
            platform: SocialPlatform.TikTok,
            contentFormat: ContentFormat.Story,
            outstandAccountId: "outstand-acc-1",
          },
        ],
        actorRole: MemberRole.Creator,
        actingUserId: AUTHOR_ID,
      }),
    ).rejects.toThrow(PublishingDomainError);

    expect(repositoryCalled).toBe(false);
    expect(adapterCalled).toBe(false);
  });

  it("throws when the repository guard rejects the post (not Draft/ReadyToSchedule)", async () => {
    const repository = createFakeRepository({
      publishNow: async () => null,
    });
    const adapter = createFakeOutstandAdapter();
    const useCase = new PublishNowUseCase(repository, adapter);

    await expect(
      useCase.execute({
        workspaceId: WORKSPACE_ID,
        postId: POST_ID,
        targets: [
          {
            connectedAccountId: CONNECTED_ACCOUNT_1,
            platform: SocialPlatform.Instagram,
            contentFormat: ContentFormat.Post,
            outstandAccountId: "outstand-acc-1",
          },
        ],
        actorRole: MemberRole.Creator,
        actingUserId: AUTHOR_ID,
      }),
    ).rejects.toThrow(ConflictError);
  });

  it("rejects when a connectedAccountId does not belong to the workspace (IDOR guard) — no target inserted, adapter never called", async () => {
    const ownedAccountIds = new Set([CONNECTED_ACCOUNT_1]);
    let adapterCalled = false;
    let updateTargetOutcomeCalled = false;
    const repository = createFakeRepository({
      publishNow: async ({ targets }) => {
        const allOwned = targets.every((target) =>
          ownedAccountIds.has(target.connectedAccountId),
        );
        if (!allOwned) {
          return null;
        }
        return basePublishRecord([
          {
            id: asPostTargetId("target-1"),
            connectedAccountId: CONNECTED_ACCOUNT_1,
          },
        ]);
      },
      updateTargetOutcome: async () => {
        updateTargetOutcomeCalled = true;
      },
    });
    const adapter = createFakeOutstandAdapter({
      publishNow: async () => {
        adapterCalled = true;
        return { outstandPostId: "should-not-happen" };
      },
    });
    const useCase = new PublishNowUseCase(repository, adapter);

    await expect(
      useCase.execute({
        workspaceId: WORKSPACE_ID,
        postId: POST_ID,
        targets: [
          {
            connectedAccountId: CONNECTED_ACCOUNT_1,
            platform: SocialPlatform.Instagram,
            contentFormat: ContentFormat.Post,
            outstandAccountId: "outstand-acc-1",
          },
          {
            connectedAccountId: FOREIGN_CONNECTED_ACCOUNT,
            platform: SocialPlatform.Facebook,
            contentFormat: ContentFormat.Post,
            outstandAccountId: "outstand-acc-foreign",
          },
        ],
        actorRole: MemberRole.Creator,
        actingUserId: AUTHOR_ID,
      }),
    ).rejects.toThrow(ConflictError);

    expect(adapterCalled).toBe(false);
    expect(updateTargetOutcomeCalled).toBe(false);
  });

  it("rejects an invalid actorRole before touching repository or adapter (T-029.1 RBAC)", async () => {
    let repositoryCalled = false;
    let adapterCalled = false;
    const repository = createFakeRepository({
      publishNow: async () => {
        repositoryCalled = true;
        return null;
      },
    });
    const adapter = createFakeOutstandAdapter({
      publishNow: async () => {
        adapterCalled = true;
        return { outstandPostId: "should-not-happen" };
      },
    });
    const useCase = new PublishNowUseCase(repository, adapter);

    await expect(
      useCase.execute({
        workspaceId: WORKSPACE_ID,
        postId: POST_ID,
        targets: [],
        // Nilai di luar 3 role sah — mensimulasikan header ter-tamper /
        // corrupt yang tidak tervalidasi runtime di `getWorkspaceContext()`.
        actorRole: "superadmin" as MemberRole,
        actingUserId: AUTHOR_ID,
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(repositoryCalled).toBe(false);
    expect(adapterCalled).toBe(false);
  });
});
