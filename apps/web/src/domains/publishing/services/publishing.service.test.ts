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
import { NotFoundError } from "@/lib/utils/errors";
import type {
  IPublishingRepository,
  PublishingPostRecord,
  QueueItemRecord,
} from "../repositories/publishing.repository";
import { PublishingService } from "./publishing.service";

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
    listQueue: async () => [],
    cancelSchedule: async () => null,
    ...overrides,
  };
}

describe("PublishingService.saveDraft", () => {
  it("delegates to the repository with a trimmed caption", async () => {
    let received: Parameters<IPublishingRepository["createDraft"]>[0] | null =
      null;
    const service = new PublishingService(
      createFakeRepository({
        createDraft: async (input) => {
          received = input;
          return {
            id: asPostId("post-1"),
            workspaceId: input.workspaceId,
            authorId: input.authorId,
            caption: input.caption,
            status: ContentStatus.Draft,
            createdAt: new Date(0),
            updatedAt: new Date(0),
          };
        },
      }),
    );

    await service.saveDraft({
      workspaceId: WORKSPACE_ID,
      authorId: AUTHOR_ID,
      caption: "  Hello world  ",
    });

    expect(received).toEqual({
      workspaceId: WORKSPACE_ID,
      authorId: AUTHOR_ID,
      caption: "Hello world",
    });
  });

  it("allows an empty caption", async () => {
    const service = new PublishingService(createFakeRepository());

    const post = await service.saveDraft({
      workspaceId: WORKSPACE_ID,
      authorId: AUTHOR_ID,
      caption: "   ",
    });

    expect(post.caption).toBe("");
    expect(post.status).toBe(ContentStatus.Draft);
  });
});

describe("PublishingService.listDrafts", () => {
  it("delegates to the repository", async () => {
    const drafts: PublishingPostRecord[] = [
      {
        id: asPostId("post-1"),
        workspaceId: WORKSPACE_ID,
        authorId: AUTHOR_ID,
        caption: "Hello",
        status: ContentStatus.Draft,
        createdAt: new Date(0),
        updatedAt: new Date(0),
      },
    ];
    const service = new PublishingService(
      createFakeRepository({ listDrafts: async () => drafts }),
    );

    await expect(service.listDrafts(WORKSPACE_ID, AUTHOR_ID)).resolves.toBe(
      drafts,
    );
  });
});

describe("PublishingService.getDraftById", () => {
  it("throws NotFoundError when the repository returns null", async () => {
    const service = new PublishingService(createFakeRepository());

    await expect(
      service.getDraftById(WORKSPACE_ID, asPostId("post-1"), AUTHOR_ID),
    ).rejects.toThrow(NotFoundError);
  });

  it("returns the draft when found", async () => {
    const draft: PublishingPostRecord = {
      id: asPostId("post-1"),
      workspaceId: WORKSPACE_ID,
      authorId: AUTHOR_ID,
      caption: "Hello",
      status: ContentStatus.Draft,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    };
    const service = new PublishingService(
      createFakeRepository({ findDraftById: async () => draft }),
    );

    await expect(
      service.getDraftById(WORKSPACE_ID, asPostId("post-1"), AUTHOR_ID),
    ).resolves.toBe(draft);
  });
});

describe("PublishingService.updateDraft", () => {
  it("trims the caption before delegating to the repository", async () => {
    let received:
      Parameters<IPublishingRepository["updateDraftCaption"]>[0] | null = null;
    const service = new PublishingService(
      createFakeRepository({
        updateDraftCaption: async (input) => {
          received = input;
          return {
            id: input.postId,
            workspaceId: input.workspaceId,
            authorId: AUTHOR_ID,
            caption: input.caption,
            status: ContentStatus.Draft,
            createdAt: new Date(0),
            updatedAt: new Date(0),
          };
        },
      }),
    );

    await service.updateDraft(
      {
        workspaceId: WORKSPACE_ID,
        postId: asPostId("post-1"),
        caption: "  Hello world  ",
      },
      AUTHOR_ID,
    );

    expect(received).toEqual({
      workspaceId: WORKSPACE_ID,
      postId: asPostId("post-1"),
      caption: "Hello world",
    });
  });

  it("throws NotFoundError when the repository returns null", async () => {
    const service = new PublishingService(createFakeRepository());

    await expect(
      service.updateDraft(
        {
          workspaceId: WORKSPACE_ID,
          postId: asPostId("post-1"),
          caption: "Hello",
        },
        AUTHOR_ID,
      ),
    ).rejects.toThrow(NotFoundError);
  });
});

describe("PublishingService.countScheduledByAccount", () => {
  it("returns an empty Map without calling the repository when input is empty", async () => {
    let calls = 0;
    const service = new PublishingService(
      createFakeRepository({
        countScheduledByAccount: async () => {
          calls += 1;
          return new Map();
        },
      }),
    );

    const result = await service.countScheduledByAccount(
      WORKSPACE_ID,
      [],
      AUTHOR_ID,
    );

    expect(result).toEqual(new Map());
    expect(calls).toBe(0);
  });

  it("delegates to the repository for non-empty input", async () => {
    const connectedAccountIds = [
      asConnectedAccountId("conn-1"),
      asConnectedAccountId("conn-2"),
    ];
    const expected = new Map([
      [connectedAccountIds[0]!, 3],
      [connectedAccountIds[1]!, 0],
    ]);
    let received:
      Parameters<IPublishingRepository["countScheduledByAccount"]>[0] | null =
      null;
    const service = new PublishingService(
      createFakeRepository({
        countScheduledByAccount: async (input) => {
          received = input;
          return expected;
        },
      }),
    );

    const result = await service.countScheduledByAccount(
      WORKSPACE_ID,
      connectedAccountIds,
      AUTHOR_ID,
    );

    expect(result).toBe(expected);
    expect(received).toEqual({
      workspaceId: WORKSPACE_ID,
      connectedAccountIds,
    });
  });
});

function createQueueItem(
  overrides: Partial<QueueItemRecord> = {},
): QueueItemRecord {
  return {
    id: asPostId("post-1"),
    caption: "Hello",
    scheduledAt: new Date("2026-07-14T10:00:00Z"),
    createdAt: new Date("2026-07-13T00:00:00Z"),
    targets: [
      {
        id: asPostTargetId("target-1"),
        connectedAccountId: asConnectedAccountId("conn-1"),
        platform: SocialPlatform.Instagram,
        contentFormat: ContentFormat.Post,
        accountHandle: "@raka",
      },
    ],
    ...overrides,
  };
}

describe("PublishingService.listQueue", () => {
  it("mengembalikan array kosong kalau tidak ada post terjadwal", async () => {
    const service = new PublishingService(
      createFakeRepository({ listQueue: async () => [] }),
    );

    await expect(service.listQueue(WORKSPACE_ID, AUTHOR_ID)).resolves.toEqual(
      [],
    );
  });

  it("mengelompokkan beberapa item dalam satu tanggal ke satu grup", async () => {
    const itemA = createQueueItem({
      id: asPostId("post-1"),
      scheduledAt: new Date("2026-07-14T09:00:00Z"),
    });
    const itemB = createQueueItem({
      id: asPostId("post-2"),
      scheduledAt: new Date("2026-07-14T15:00:00Z"),
    });
    const service = new PublishingService(
      createFakeRepository({ listQueue: async () => [itemA, itemB] }),
    );

    const groups = await service.listQueue(WORKSPACE_ID, AUTHOR_ID);

    expect(groups).toEqual([{ date: "2026-07-14", items: [itemA, itemB] }]);
  });

  it("mengelompokkan item ke beberapa grup tanggal terpisah, urutan ascending", async () => {
    const itemDay1 = createQueueItem({
      id: asPostId("post-1"),
      scheduledAt: new Date("2026-07-14T09:00:00Z"),
    });
    const itemDay2 = createQueueItem({
      id: asPostId("post-2"),
      scheduledAt: new Date("2026-07-15T09:00:00Z"),
    });
    let received: Parameters<IPublishingRepository["listQueue"]>[0] | null =
      null;
    const service = new PublishingService(
      createFakeRepository({
        listQueue: async (input) => {
          received = input;
          return [itemDay1, itemDay2];
        },
      }),
    );

    const groups = await service.listQueue(WORKSPACE_ID, AUTHOR_ID);

    expect(groups).toEqual([
      { date: "2026-07-14", items: [itemDay1] },
      { date: "2026-07-15", items: [itemDay2] },
    ]);
    expect(received).toEqual({ workspaceId: WORKSPACE_ID });
  });
});
