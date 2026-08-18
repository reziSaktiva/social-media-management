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
import type { IOutstandAdapter } from "../adapters/outstand-adapter";
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
    countScheduledByAccount: async () => new Map(),
    ...overrides,
  };
}

function createFakeOutstandAdapter(
  overrides: Partial<IOutstandAdapter> = {},
): IOutstandAdapter {
  return {
    schedulePost: async () => ({ outstandJobId: "fake-job" }),
    publishNow: async () => ({
      outstandJobId: "fake-job",
      publishedUrl: "https://fake.outstand.local/posts/fake-job",
    }),
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

  it("happy path: publishes 2 valid targets and records outstandJobId + publishedUrl per target", async () => {
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
    const repository = createFakeRepository({
      publishNow: async () => publishRecord,
      updateTargetOutcome: async (input) => {
        outcomes.push(input);
      },
    });
    const adapter = createFakeOutstandAdapter({
      publishNow: async ({ outstandAccountId }) => ({
        outstandJobId: `fake-${outstandAccountId}`,
        publishedUrl: `https://fake.outstand.local/posts/fake-${outstandAccountId}`,
      }),
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
    expect(outcomes).toEqual(
      expect.arrayContaining([
        {
          postTargetId: asPostTargetId("target-1"),
          outstandJobId: "fake-outstand-acc-1",
          status: "published",
          publishedUrl: "https://fake.outstand.local/posts/fake-outstand-acc-1",
        },
        {
          postTargetId: asPostTargetId("target-2"),
          outstandJobId: "fake-outstand-acc-2",
          status: "published",
          publishedUrl: "https://fake.outstand.local/posts/fake-outstand-acc-2",
        },
      ]),
    );
    expect(outcomes).toHaveLength(2);
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
        return {
          outstandJobId: "should-not-happen",
          publishedUrl: "https://should-not-happen",
        };
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
        return {
          outstandJobId: "should-not-happen",
          publishedUrl: "https://should-not-happen",
        };
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
        return {
          outstandJobId: "should-not-happen",
          publishedUrl: "https://should-not-happen",
        };
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
