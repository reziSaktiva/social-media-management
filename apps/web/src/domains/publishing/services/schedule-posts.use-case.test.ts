import {
  asConnectedAccountId,
  asPostId,
  asPostTargetId,
  asUserId,
  asWorkspaceId,
  ContentFormat,
  ContentStatus,
  SocialPlatform,
} from "@social/shared";
import { describe, expect, it } from "vitest";
import { ConflictError } from "@/lib/utils/errors";
import type { IOutstandAdapter } from "../adapters/outstand-adapter";
import { PublishingDomainError } from "../errors";
import type {
  IPublishingRepository,
  PublishingPostRecord,
  PublishingScheduleRecord,
} from "../repositories/publishing.repository";
import { SchedulePostsUseCase } from "./schedule-posts.use-case";

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

describe("SchedulePostsUseCase.execute", () => {
  const POST_ID = asPostId("post-1");
  const SCHEDULED_AT = new Date("2026-08-10T10:00:00Z");
  const CONNECTED_ACCOUNT_1 = asConnectedAccountId("conn-1");
  const CONNECTED_ACCOUNT_2 = asConnectedAccountId("conn-2");
  // Akun ini sengaja TIDAK ada di "owned set" repository palsu di bawah —
  // mensimulasikan connectedAccountId yang sebenarnya milik workspace lain
  // (skenario IDOR, temuan review Ridwan Architecture Reviewer).
  const FOREIGN_CONNECTED_ACCOUNT = asConnectedAccountId("conn-foreign");

  function baseScheduleRecord(
    targets: PublishingScheduleRecord["targets"],
  ): PublishingScheduleRecord {
    return {
      id: POST_ID,
      workspaceId: WORKSPACE_ID,
      authorId: AUTHOR_ID,
      caption: "Hello world",
      status: ContentStatus.Scheduled,
      createdAt: new Date(0),
      updatedAt: new Date(0),
      targets,
    };
  }

  it("happy path: schedules 2 valid targets with ONE adapter call for all targets, persists the shared outstandPostId, and marks each target scheduled", async () => {
    const scheduleRecord = baseScheduleRecord([
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
    let schedulePostCallCount = 0;
    const repository = createFakeRepository({
      schedulePost: async () => scheduleRecord,
      updateTargetOutcome: async (input) => {
        outcomes.push(input);
      },
      setOutstandPostId: async (input) => {
        outstandPostIdCalls.push(input);
      },
    });
    const adapter = createFakeOutstandAdapter({
      schedulePost: async ({ targets }) => {
        schedulePostCallCount += 1;
        expect(targets).toHaveLength(2);
        return { outstandPostId: "fake-post-shared" };
      },
    });

    const useCase = new SchedulePostsUseCase(repository, adapter);

    const result = await useCase.execute({
      workspaceId: WORKSPACE_ID,
      postId: POST_ID,
      scheduledAt: SCHEDULED_AT,
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
      actingUserId: AUTHOR_ID,
    });

    expect(result).toBe(scheduleRecord);
    // SATU call ke adapter untuk semua target (redesain 2026-08-26) —
    // bukan 1 call per target seperti model lama.
    expect(schedulePostCallCount).toBe(1);
    expect(outstandPostIdCalls).toEqual([
      {
        workspaceId: WORKSPACE_ID,
        postId: POST_ID,
        outstandPostId: "fake-post-shared",
      },
    ]);
    expect(outcomes).toEqual(
      expect.arrayContaining([
        { postTargetId: asPostTargetId("target-1"), status: "scheduled" },
        { postTargetId: asPostTargetId("target-2"), status: "scheduled" },
      ]),
    );
    expect(outcomes).toHaveLength(2);
  });

  it("all targets are marked failed and the post is marked Failed when the single adapter call rejects", async () => {
    const scheduleRecord = baseScheduleRecord([
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
    let markPostFailedCalled = false;
    const repository = createFakeRepository({
      schedulePost: async () => scheduleRecord,
      updateTargetOutcome: async (input) => {
        outcomes.push(input);
      },
      markPostFailed: async () => {
        markPostFailedCalled = true;
      },
    });
    const adapter = createFakeOutstandAdapter({
      schedulePost: async () => {
        throw new Error("Outstand unreachable");
      },
    });
    const useCase = new SchedulePostsUseCase(repository, adapter);

    await useCase.execute({
      workspaceId: WORKSPACE_ID,
      postId: POST_ID,
      scheduledAt: SCHEDULED_AT,
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
      actingUserId: AUTHOR_ID,
    });

    expect(outcomes).toEqual(
      expect.arrayContaining([
        {
          postTargetId: asPostTargetId("target-1"),
          status: "failed",
          error: "Outstand unreachable",
        },
        {
          postTargetId: asPostTargetId("target-2"),
          status: "failed",
          error: "Outstand unreachable",
        },
      ]),
    );
    expect(markPostFailedCalled).toBe(true);
  });

  it("rejects a content format not allowed for the platform before calling repository or adapter", async () => {
    let repositoryCalled = false;
    let adapterCalled = false;
    const repository = createFakeRepository({
      schedulePost: async () => {
        repositoryCalled = true;
        return null;
      },
    });
    const adapter = createFakeOutstandAdapter({
      schedulePost: async () => {
        adapterCalled = true;
        return { outstandPostId: "should-not-happen" };
      },
    });
    const useCase = new SchedulePostsUseCase(repository, adapter);

    await expect(
      useCase.execute({
        workspaceId: WORKSPACE_ID,
        postId: POST_ID,
        scheduledAt: SCHEDULED_AT,
        targets: [
          {
            connectedAccountId: CONNECTED_ACCOUNT_1,
            // TikTok tidak termasuk Instagram/Facebook/Pinterest di matriks
            // ADR-039 — hanya Post yang diizinkan, Story harus ditolak.
            platform: SocialPlatform.TikTok,
            contentFormat: ContentFormat.Story,
            outstandAccountId: "outstand-acc-1",
          },
        ],
        actingUserId: AUTHOR_ID,
      }),
    ).rejects.toThrow(PublishingDomainError);

    expect(repositoryCalled).toBe(false);
    expect(adapterCalled).toBe(false);
  });

  it("throws when the repository guard rejects the post (not Draft/ReadyToSchedule)", async () => {
    const repository = createFakeRepository({
      schedulePost: async () => null,
    });
    const adapter = createFakeOutstandAdapter();
    const useCase = new SchedulePostsUseCase(repository, adapter);

    await expect(
      useCase.execute({
        workspaceId: WORKSPACE_ID,
        postId: POST_ID,
        scheduledAt: SCHEDULED_AT,
        targets: [
          {
            connectedAccountId: CONNECTED_ACCOUNT_1,
            platform: SocialPlatform.Instagram,
            contentFormat: ContentFormat.Post,
            outstandAccountId: "outstand-acc-1",
          },
        ],
        actingUserId: AUTHOR_ID,
      }),
    ).rejects.toThrow(ConflictError);
  });

  it("rejects when a connectedAccountId does not belong to the workspace (IDOR guard) — no target inserted, adapter never called", async () => {
    // Repository palsu ini meniru guard ownership yang sebenarnya hidup di
    // publishing.repository.ts (Prisma): kalau salah satu connectedAccountId
    // di targets bukan bagian dari "owned set" workspace ini, transaksi
    // dibatalkan dan schedulePost mengembalikan null — sama seperti guard
    // status Draft/ReadyToSchedule yang gagal.
    const ownedAccountIds = new Set([CONNECTED_ACCOUNT_1]);
    let adapterCalled = false;
    let updateTargetOutcomeCalled = false;
    const repository = createFakeRepository({
      schedulePost: async ({ targets }) => {
        const allOwned = targets.every((target) =>
          ownedAccountIds.has(target.connectedAccountId),
        );
        if (!allOwned) {
          return null;
        }
        return {
          id: POST_ID,
          workspaceId: WORKSPACE_ID,
          authorId: AUTHOR_ID,
          caption: "Hello world",
          status: ContentStatus.Scheduled,
          createdAt: new Date(0),
          updatedAt: new Date(0),
          targets: [
            {
              id: asPostTargetId("target-1"),
              connectedAccountId: CONNECTED_ACCOUNT_1,
            },
          ],
        };
      },
      updateTargetOutcome: async () => {
        updateTargetOutcomeCalled = true;
      },
    });
    const adapter = createFakeOutstandAdapter({
      schedulePost: async () => {
        adapterCalled = true;
        return { outstandPostId: "should-not-happen" };
      },
    });
    const useCase = new SchedulePostsUseCase(repository, adapter);

    await expect(
      useCase.execute({
        workspaceId: WORKSPACE_ID,
        postId: POST_ID,
        scheduledAt: SCHEDULED_AT,
        targets: [
          {
            connectedAccountId: CONNECTED_ACCOUNT_1,
            platform: SocialPlatform.Instagram,
            contentFormat: ContentFormat.Post,
            outstandAccountId: "outstand-acc-1",
          },
          {
            // Milik workspace lain — harus membuat seluruh permintaan ditolak,
            // bukan hanya target ini.
            connectedAccountId: FOREIGN_CONNECTED_ACCOUNT,
            platform: SocialPlatform.Facebook,
            contentFormat: ContentFormat.Post,
            outstandAccountId: "outstand-acc-foreign",
          },
        ],
        actingUserId: AUTHOR_ID,
      }),
    ).rejects.toThrow(ConflictError);

    expect(adapterCalled).toBe(false);
    expect(updateTargetOutcomeCalled).toBe(false);
  });
});
