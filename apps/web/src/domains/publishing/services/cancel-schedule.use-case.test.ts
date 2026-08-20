import {
  asPostId,
  asUserId,
  asWorkspaceId,
  ContentStatus,
  MemberRole,
} from "@social/shared";
import { describe, expect, it } from "vitest";
import { AuthorizationError, ConflictError } from "@/lib/utils/errors";
import type { IOutstandAdapter } from "../adapters/outstand-adapter";
import type {
  IPublishingRepository,
  PublishingCancelScheduleRecord,
  PublishingPostRecord,
} from "../repositories/publishing.repository";
import { CancelScheduleUseCase } from "./cancel-schedule.use-case";

const WORKSPACE_ID = asWorkspaceId("workspace-1");
const AUTHOR_ID = asUserId("user-1");
const POST_ID = asPostId("post-1");

function createFakeRepository(
  overrides: Partial<IPublishingRepository> = {},
): IPublishingRepository {
  return {
    createDraft: async ({
      workspaceId,
      authorId,
      caption,
    }): Promise<PublishingPostRecord> => ({
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
    countScheduledByAccount: async () => new Map(),
    listQueue: async () => [],
    cancelSchedule: async () => null,
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

function baseCancelRecord(
  cancelledTargets: PublishingCancelScheduleRecord["cancelledTargets"],
): PublishingCancelScheduleRecord {
  return {
    id: POST_ID,
    workspaceId: WORKSPACE_ID,
    authorId: AUTHOR_ID,
    caption: "Hello world",
    status: ContentStatus.Draft,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    cancelledTargets,
  };
}

describe("CancelScheduleUseCase.execute", () => {
  it("happy path: post kembali ke Draft, memanggil adapter.cancelScheduledPost untuk tiap target yang punya outstandJobId", async () => {
    const cancelledJobIds: string[] = [];
    const repository = createFakeRepository({
      cancelSchedule: async () =>
        baseCancelRecord([
          { outstandJobId: "fake-job-1" },
          { outstandJobId: "fake-job-2" },
        ]),
    });
    const adapter = createFakeOutstandAdapter({
      cancelScheduledPost: async (outstandJobId) => {
        cancelledJobIds.push(outstandJobId);
      },
    });

    const useCase = new CancelScheduleUseCase(repository, adapter);

    const result = await useCase.execute({
      workspaceId: WORKSPACE_ID,
      postId: POST_ID,
      actorRole: MemberRole.Creator,
      actingUserId: AUTHOR_ID,
    });

    expect(result.status).toBe(ContentStatus.Draft);
    expect(cancelledJobIds.sort()).toEqual(["fake-job-1", "fake-job-2"]);
  });

  it("skips adapter call for target tanpa outstandJobId (null)", async () => {
    let adapterCallCount = 0;
    const repository = createFakeRepository({
      cancelSchedule: async () => baseCancelRecord([{ outstandJobId: null }]),
    });
    const adapter = createFakeOutstandAdapter({
      cancelScheduledPost: async () => {
        adapterCallCount += 1;
      },
    });

    const useCase = new CancelScheduleUseCase(repository, adapter);

    await useCase.execute({
      workspaceId: WORKSPACE_ID,
      postId: POST_ID,
      actorRole: MemberRole.Creator,
      actingUserId: AUTHOR_ID,
    });

    expect(adapterCallCount).toBe(0);
  });

  it("tetap mengembalikan record sukses walau adapter.cancelScheduledPost gagal untuk satu target (best-effort)", async () => {
    const repository = createFakeRepository({
      cancelSchedule: async () =>
        baseCancelRecord([{ outstandJobId: "fake-job-1" }]),
    });
    const adapter = createFakeOutstandAdapter({
      cancelScheduledPost: async () => {
        throw new Error("Outstand sedang down");
      },
    });

    const useCase = new CancelScheduleUseCase(repository, adapter);

    await expect(
      useCase.execute({
        workspaceId: WORKSPACE_ID,
        postId: POST_ID,
        actorRole: MemberRole.Creator,
        actingUserId: AUTHOR_ID,
      }),
    ).resolves.toMatchObject({ status: ContentStatus.Draft });
  });

  it.each([MemberRole.Owner, MemberRole.Admin, MemberRole.Creator])(
    "allows role %s (ADR-074 — Scheduled → Draft diizinkan untuk ketiga role)",
    async (role) => {
      const repository = createFakeRepository({
        cancelSchedule: async () => baseCancelRecord([]),
      });
      const adapter = createFakeOutstandAdapter();
      const useCase = new CancelScheduleUseCase(repository, adapter);

      await expect(
        useCase.execute({
          workspaceId: WORKSPACE_ID,
          postId: POST_ID,
          actorRole: role,
          actingUserId: AUTHOR_ID,
        }),
      ).resolves.toBeDefined();
    },
  );

  it("rejects an invalid actorRole before touching repository or adapter", async () => {
    let repositoryCalled = false;
    let adapterCalled = false;
    const repository = createFakeRepository({
      cancelSchedule: async () => {
        repositoryCalled = true;
        return null;
      },
    });
    const adapter = createFakeOutstandAdapter({
      cancelScheduledPost: async () => {
        adapterCalled = true;
      },
    });
    const useCase = new CancelScheduleUseCase(repository, adapter);

    await expect(
      useCase.execute({
        workspaceId: WORKSPACE_ID,
        postId: POST_ID,
        // Nilai di luar 3 role sah — mensimulasikan header ter-tamper /
        // corrupt yang tidak tervalidasi runtime di `getWorkspaceContext()`.
        actorRole: "superadmin" as MemberRole,
        actingUserId: AUTHOR_ID,
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(repositoryCalled).toBe(false);
    expect(adapterCalled).toBe(false);
  });

  it("throws ConflictError when the repository guard rejects (post tidak ditemukan / bukan status Scheduled)", async () => {
    const repository = createFakeRepository({
      cancelSchedule: async () => null,
    });
    const adapter = createFakeOutstandAdapter();
    const useCase = new CancelScheduleUseCase(repository, adapter);

    await expect(
      useCase.execute({
        workspaceId: WORKSPACE_ID,
        postId: POST_ID,
        actorRole: MemberRole.Creator,
        actingUserId: AUTHOR_ID,
      }),
    ).rejects.toThrow(ConflictError);
  });
});
