import {
  asConnectedAccountId,
  asUserId,
  asWorkspaceId,
  MemberRole,
  SocialPlatform,
} from "@social/shared";
import type { IOutstandAdapter, ImportJobOutcome } from "@social/shared";
import { describe, expect, it, vi } from "vitest";
import type {
  IImportJobRepository,
  ImportSyncJobPayload,
  ImportSyncJobRecord,
} from "../repositories/import-job.repository";
import { ImportPostsProcessUseCase } from "./import-posts-process.use-case";
import { ImportPostsTriggerUseCase } from "./import-posts-trigger.use-case";

const WORKSPACE_ID = asWorkspaceId("workspace-1");
const CONNECTED_ACCOUNT_ID = asConnectedAccountId("account-1");
const ACTING_USER_ID = asUserId("user-1");
const OUTSTAND_ACCOUNT_ID = "outstand-account-1";

function createFakeImportJobRepository(
  overrides: Partial<IImportJobRepository> = {},
): IImportJobRepository {
  let jobCounter = 0;
  return {
    createImportSyncJob: vi.fn(
      async (payload: ImportSyncJobPayload): Promise<ImportSyncJobRecord> => ({
        id: `job-${++jobCounter}`,
        payload,
        status: "pending",
        createdAt: new Date(),
      }),
    ),
    markImportSyncJobStatus: vi.fn(async () => undefined),
    hasActiveImportSyncJob: vi.fn(async () => false),
    countManualImportSyncJobsSince: vi.fn(async () => 0),
    ...overrides,
  };
}

function createFakeOutstandAdapter(
  overrides: Partial<IOutstandAdapter> = {},
): IOutstandAdapter {
  return {
    connectAccount: async () => ({ redirectUrl: "/unused" }),
    resolveConnectCallback: async () => ({
      outstandAccountId: "unused",
      platform: SocialPlatform.Instagram,
      handle: "unused",
      status: "active",
    }),
    listPendingFacebookPages: async () => ({ pages: [] }),
    confirmFacebookPagesConnection: async () => ({ accounts: [] }),
    listPinterestBoards: async () => [],
    uploadMediaWorkingCopy: async () => ({
      outstandMediaId: "unused",
      outstandMediaUrl: "https://fake.outstand.local/media/unused",
      expiresAt: new Date(),
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
    fetchComments: async () => ({ comments: [] }),
    replyToComment: async () => ({ outstandReplyId: "unused" }),
    importPosts: vi.fn(async () => ({ importJobId: "fake-import-job" })),
    fetchImportJobStatus: vi.fn(async (): Promise<ImportJobOutcome> => ({
      status: "completed",
      posts: [],
      error: null,
    })),
    ...overrides,
  };
}

function createFakeWatermarkPort() {
  return { updateImportWatermark: vi.fn(async () => undefined) };
}

function createProcessUseCase(insertedCount = 0) {
  const repository = {
    upsertImportedPosts: vi.fn(async () => ({
      insertedCount,
      skippedDuplicateCount: 0,
    })),
  } as never;
  return new ImportPostsProcessUseCase(repository);
}

describe("ImportPostsTriggerUseCase.triggerAuto (T-090.3, ADR-093 poin 7)", () => {
  it("creates a job, calls importPosts/fetchImportJobStatus, processes posts, and updates both watermarks", async () => {
    const importJobs = createFakeImportJobRepository();
    const outstandAdapter = createFakeOutstandAdapter();
    const watermark = createFakeWatermarkPort();
    const processUseCase = createProcessUseCase(3);

    const useCase = new ImportPostsTriggerUseCase(
      importJobs,
      outstandAdapter,
      watermark,
      processUseCase,
    );

    const result = await useCase.triggerAuto({
      workspaceId: WORKSPACE_ID,
      connectedAccountId: CONNECTED_ACCOUNT_ID,
      outstandAccountId: OUTSTAND_ACCOUNT_ID,
      platform: SocialPlatform.Instagram,
      actingUserId: ACTING_USER_ID,
    });

    expect(result.outcome).toBe("triggered");
    expect(result.importedCount).toBe(3);
    expect(importJobs.createImportSyncJob).toHaveBeenCalledWith(
      expect.objectContaining({ trigger: "auto" }),
    );
    expect(outstandAdapter.importPosts).toHaveBeenCalledWith(
      OUTSTAND_ACCOUNT_ID,
      expect.objectContaining({ limit: 100 }),
    );
    // Dipanggil dua kali: sekali saat request mulai (lastImportRequestedAt),
    // sekali saat sukses selesai (lastImportedUntil) — ADR-093 poin 6.
    expect(watermark.updateImportWatermark).toHaveBeenCalledTimes(2);
    expect(watermark.updateImportWatermark).toHaveBeenNthCalledWith(1, {
      connectedAccountId: CONNECTED_ACCOUNT_ID,
      lastImportRequestedAt: expect.any(Date),
      actingUserId: ACTING_USER_ID,
    });
    expect(watermark.updateImportWatermark).toHaveBeenNthCalledWith(2, {
      connectedAccountId: CONNECTED_ACCOUNT_ID,
      lastImportedUntil: expect.any(Date),
      actingUserId: ACTING_USER_ID,
    });
    expect(importJobs.markImportSyncJobStatus).toHaveBeenCalledWith(
      expect.any(String),
      "done",
    );
  });

  it("marks the job failed and does not update lastImportedUntil when fetchImportJobStatus does not resolve completed", async () => {
    const importJobs = createFakeImportJobRepository();
    const outstandAdapter = createFakeOutstandAdapter({
      fetchImportJobStatus: async () => ({
        status: "failed",
        posts: [],
        error: "Outstand down",
      }),
    });
    const watermark = createFakeWatermarkPort();
    const processUseCase = createProcessUseCase();

    const useCase = new ImportPostsTriggerUseCase(
      importJobs,
      outstandAdapter,
      watermark,
      processUseCase,
    );

    const result = await useCase.triggerAuto({
      workspaceId: WORKSPACE_ID,
      connectedAccountId: CONNECTED_ACCOUNT_ID,
      outstandAccountId: OUTSTAND_ACCOUNT_ID,
      platform: SocialPlatform.Instagram,
      actingUserId: ACTING_USER_ID,
    });

    expect(result.outcome).toBe("failed");
    expect(result.message).toMatch(/Outstand down/);
    expect(importJobs.markImportSyncJobStatus).toHaveBeenCalledWith(
      expect.any(String),
      "failed",
      expect.stringContaining("Outstand down"),
    );
    // Hanya 1 call (request mulai) — TIDAK ada update lastImportedUntil
    // karena job gagal (ADR-093 poin 7).
    expect(watermark.updateImportWatermark).toHaveBeenCalledTimes(1);
    // Bug fix 2026-10-08 (RLS silent no-op di `updateImportWatermark` Prisma
    // real — lihat docstring `IWorkspaceRepository.updateImportWatermark`) —
    // pastikan `actingUserId` dari input `triggerAuto` diteruskan apa adanya
    // ke port, bukan cuma field watermark-nya.
    expect(watermark.updateImportWatermark).toHaveBeenCalledWith(
      expect.objectContaining({ actingUserId: ACTING_USER_ID }),
    );
  });
});

describe("ImportPostsTriggerUseCase — guard concurrent-import (ADR-093 poin 8)", () => {
  it("rejects (outcome rejected_concurrent) without creating a job or calling the adapter when an active job already exists for the account", async () => {
    const importJobs = createFakeImportJobRepository({
      hasActiveImportSyncJob: vi.fn(async () => true),
    });
    const outstandAdapter = createFakeOutstandAdapter();
    const watermark = createFakeWatermarkPort();
    const processUseCase = createProcessUseCase();

    const useCase = new ImportPostsTriggerUseCase(
      importJobs,
      outstandAdapter,
      watermark,
      processUseCase,
    );

    const result = await useCase.triggerAuto({
      workspaceId: WORKSPACE_ID,
      connectedAccountId: CONNECTED_ACCOUNT_ID,
      outstandAccountId: OUTSTAND_ACCOUNT_ID,
      platform: SocialPlatform.Instagram,
      actingUserId: ACTING_USER_ID,
    });

    expect(result.outcome).toBe("rejected_concurrent");
    expect(importJobs.createImportSyncJob).not.toHaveBeenCalled();
    expect(outstandAdapter.importPosts).not.toHaveBeenCalled();
    expect(watermark.updateImportWatermark).not.toHaveBeenCalled();
  });
});

describe("ImportPostsTriggerUseCase.triggerManual (T-090.3, ADR-093 poin 9)", () => {
  function baseManualInput(
    overrides: Partial<
      Parameters<ImportPostsTriggerUseCase["triggerManual"]>[0]
    > = {},
  ): Parameters<ImportPostsTriggerUseCase["triggerManual"]>[0] {
    return {
      actorRole: MemberRole.Owner,
      workspaceId: WORKSPACE_ID,
      connectedAccountId: CONNECTED_ACCOUNT_ID,
      outstandAccountId: OUTSTAND_ACCOUNT_ID,
      platform: SocialPlatform.Instagram,
      actingUserId: ACTING_USER_ID,
      lastImportedUntil: null,
      lastImportRequestedAt: null,
      ...overrides,
    };
  }

  it("rejects with AuthorizationError-equivalent throw for a Creator (RBAC Owner/Admin only)", async () => {
    const useCase = new ImportPostsTriggerUseCase(
      createFakeImportJobRepository(),
      createFakeOutstandAdapter(),
      createFakeWatermarkPort(),
      createProcessUseCase(),
    );

    await expect(
      useCase.triggerManual(baseManualInput({ actorRole: MemberRole.Creator })),
    ).rejects.toThrow(/Owner atau Admin/);
  });

  it("rejects (outcome rejected_cap) when the workspace already used its manual sync this week — dominant guard, checked before cooldown", async () => {
    const importJobs = createFakeImportJobRepository({
      countManualImportSyncJobsSince: vi.fn(async () => 1),
    });
    const useCase = new ImportPostsTriggerUseCase(
      importJobs,
      createFakeOutstandAdapter(),
      createFakeWatermarkPort(),
      createProcessUseCase(),
    );

    const result = await useCase.triggerManual(
      baseManualInput({ lastImportRequestedAt: new Date(0) }),
    );

    expect(result.outcome).toBe("rejected_cap");
    expect(importJobs.createImportSyncJob).not.toHaveBeenCalled();
  });

  it("rejects (outcome rejected_cooldown) when lastImportRequestedAt was less than 24h ago", async () => {
    const importJobs = createFakeImportJobRepository();
    const useCase = new ImportPostsTriggerUseCase(
      importJobs,
      createFakeOutstandAdapter(),
      createFakeWatermarkPort(),
      createProcessUseCase(),
    );

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const result = await useCase.triggerManual(
      baseManualInput({ lastImportRequestedAt: oneHourAgo }),
    );

    expect(result.outcome).toBe("rejected_cooldown");
    expect(importJobs.createImportSyncJob).not.toHaveBeenCalled();
  });

  it("succeeds (outcome triggered) for Owner/Admin when cap and cooldown both pass, using lastImportedUntil as since", async () => {
    const importJobs = createFakeImportJobRepository();
    const outstandAdapter = createFakeOutstandAdapter();
    const watermark = createFakeWatermarkPort();
    const watermarkDate = new Date("2026-09-01T00:00:00Z");

    const useCase = new ImportPostsTriggerUseCase(
      importJobs,
      outstandAdapter,
      watermark,
      createProcessUseCase(1),
    );

    const result = await useCase.triggerManual(
      baseManualInput({
        actorRole: MemberRole.Admin,
        lastImportedUntil: watermarkDate,
        lastImportRequestedAt: null,
      }),
    );

    expect(result.outcome).toBe("triggered");
    expect(outstandAdapter.importPosts).toHaveBeenCalledWith(
      OUTSTAND_ACCOUNT_ID,
      expect.objectContaining({ since: watermarkDate }),
    );
    // Bug fix 2026-10-08 (RLS silent no-op — lihat docstring
    // `IWorkspaceRepository.updateImportWatermark`) — `actingUserId` dari
    // input `triggerManual` wajib diteruskan ke port di KEDUA call
    // (`lastImportRequestedAt` saat mulai, `lastImportedUntil` saat selesai).
    expect(watermark.updateImportWatermark).toHaveBeenCalledTimes(2);
    expect(watermark.updateImportWatermark).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ actingUserId: ACTING_USER_ID }),
    );
    expect(watermark.updateImportWatermark).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ actingUserId: ACTING_USER_ID }),
    );
  });
});

describe("ImportPostsTriggerUseCase.triggerPeriodicForAccounts (T-090.3)", () => {
  it("processes each account independently and isolates one account's failure from the others", async () => {
    const importJobs = createFakeImportJobRepository();
    const outstandAdapter = createFakeOutstandAdapter({
      importPosts: vi.fn(async (outstandAccountId: string) => {
        if (outstandAccountId === "outstand-fails") {
          throw new Error("boom");
        }
        return { importJobId: `job-for-${outstandAccountId}` };
      }),
    });
    const useCase = new ImportPostsTriggerUseCase(
      importJobs,
      outstandAdapter,
      createFakeWatermarkPort(),
      createProcessUseCase(2),
    );

    const okAccountId = asConnectedAccountId("account-ok");
    const failAccountId = asConnectedAccountId("account-fail");

    const results = await useCase.triggerPeriodicForAccounts([
      {
        workspaceId: WORKSPACE_ID,
        connectedAccountId: okAccountId,
        outstandAccountId: "outstand-ok",
        platform: SocialPlatform.Instagram,
        lastImportedUntil: null,
        actingUserId: ACTING_USER_ID,
      },
      {
        workspaceId: WORKSPACE_ID,
        connectedAccountId: failAccountId,
        outstandAccountId: "outstand-fails",
        platform: SocialPlatform.Facebook,
        lastImportedUntil: null,
        actingUserId: ACTING_USER_ID,
      },
    ]);

    expect(results.get(okAccountId)?.outcome).toBe("triggered");
    expect(results.get(failAccountId)?.outcome).toBe("failed");
    expect(results.get(failAccountId)?.message).toMatch(/boom/);
  });
});
