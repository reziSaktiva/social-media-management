import {
  asConnectedAccountId,
  asPostId,
  asPostMetricsId,
  asPostTargetId,
  asUserId,
  asWorkspaceId,
  ContentFormat,
  ContentStatus,
  type PostId,
  SocialPlatform,
} from "@social/shared";
import { describe, expect, it } from "vitest";
import type { PostMetricsRecord } from "@/domains/analytics";
import { NotFoundError } from "@/lib/utils/errors";
import type {
  CalendarItemRecord,
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
    setOutstandPostId: async () => undefined,
    countScheduledByAccount: async () => new Map(),
    listQueue: async () => [],
    listCalendarPosts: async () => [],
    cancelSchedule: async () => null,
    markPostFailed: async () => undefined,
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

function createCalendarItem(
  overrides: Partial<CalendarItemRecord> = {},
): CalendarItemRecord {
  return {
    id: asPostId("post-1"),
    caption: "Hello",
    status: ContentStatus.Scheduled,
    scheduledAt: new Date("2026-07-14T10:00:00Z"),
    publishedAt: null,
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

const FROM = new Date("2026-07-13T00:00:00Z");
const TO = new Date("2026-07-20T00:00:00Z");

describe("PublishingService.listCalendarPosts", () => {
  it("mengembalikan array kosong kalau tidak ada post dalam rentang", async () => {
    const service = new PublishingService(
      createFakeRepository({ listCalendarPosts: async () => [] }),
    );

    await expect(
      service.listCalendarPosts(
        { workspaceId: WORKSPACE_ID, from: FROM, to: TO },
        AUTHOR_ID,
      ),
    ).resolves.toEqual([]);
  });

  it("meneruskan input rentang + filter apa adanya ke repository", async () => {
    let received:
      Parameters<IPublishingRepository["listCalendarPosts"]>[0] | null = null;
    const connectedAccountIds = [asConnectedAccountId("conn-1")];
    const statuses = [ContentStatus.Scheduled, ContentStatus.Published];
    const service = new PublishingService(
      createFakeRepository({
        listCalendarPosts: async (input) => {
          received = input;
          return [];
        },
      }),
    );

    await service.listCalendarPosts(
      {
        workspaceId: WORKSPACE_ID,
        from: FROM,
        to: TO,
        connectedAccountIds,
        statuses,
      },
      AUTHOR_ID,
    );

    expect(received).toEqual({
      workspaceId: WORKSPACE_ID,
      from: FROM,
      to: TO,
      connectedAccountIds,
      statuses,
    });
  });

  it("mengurutkan hasil ascending berdasar tanggal efektif", async () => {
    const later = createCalendarItem({
      id: asPostId("post-later"),
      scheduledAt: new Date("2026-07-16T00:00:00Z"),
    });
    const earlier = createCalendarItem({
      id: asPostId("post-earlier"),
      scheduledAt: new Date("2026-07-14T00:00:00Z"),
    });
    const service = new PublishingService(
      createFakeRepository({
        listCalendarPosts: async () => [later, earlier],
      }),
    );

    const result = await service.listCalendarPosts(
      { workspaceId: WORKSPACE_ID, from: FROM, to: TO },
      AUTHOR_ID,
    );

    expect(result.map((item) => item.id)).toEqual([earlier.id, later.id]);
  });

  it("metrics selalu null untuk post non-Published, walau ada PostMetricsPort", async () => {
    const draft = createCalendarItem({
      id: asPostId("post-draft"),
      status: ContentStatus.Draft,
    });
    let portCalled = false;
    const service = new PublishingService(
      createFakeRepository({ listCalendarPosts: async () => [draft] }),
      {
        getPostMetricsByPosts: async () => {
          portCalled = true;
          return new Map();
        },
      },
    );

    const result = await service.listCalendarPosts(
      { workspaceId: WORKSPACE_ID, from: FROM, to: TO },
      AUTHOR_ID,
    );

    expect(result).toEqual([{ ...draft, metrics: null }]);
    // Tidak ada post Published — port tidak perlu dipanggil sama sekali.
    expect(portCalled).toBe(false);
  });

  it("metrics [] untuk post Published tanpa PostMetricsPort disuplai", async () => {
    const published = createCalendarItem({
      id: asPostId("post-published"),
      status: ContentStatus.Published,
      scheduledAt: null,
      publishedAt: new Date("2026-07-14T00:00:00Z"),
    });
    const service = new PublishingService(
      createFakeRepository({ listCalendarPosts: async () => [published] }),
    );

    const result = await service.listCalendarPosts(
      { workspaceId: WORKSPACE_ID, from: FROM, to: TO },
      AUTHOR_ID,
    );

    expect(result).toEqual([{ ...published, metrics: [] }]);
  });

  it("metrics diisi dari PostMetricsPort untuk post Published, batch bukan per-post", async () => {
    const publishedA = createCalendarItem({
      id: asPostId("post-a"),
      status: ContentStatus.Published,
      scheduledAt: null,
      publishedAt: new Date("2026-07-14T00:00:00Z"),
    });
    const publishedB = createCalendarItem({
      id: asPostId("post-b"),
      status: ContentStatus.Published,
      scheduledAt: null,
      publishedAt: new Date("2026-07-15T00:00:00Z"),
    });
    const scheduled = createCalendarItem({
      id: asPostId("post-c"),
      status: ContentStatus.Scheduled,
      scheduledAt: new Date("2026-07-16T00:00:00Z"),
    });
    const metricA: PostMetricsRecord = {
      id: asPostMetricsId("metric-a"),
      postId: publishedA.id,
      connectedAccountId: asConnectedAccountId("conn-1"),
      platform: SocialPlatform.Instagram,
      impressions: 100,
      reach: 80,
      likes: 10,
      comments: 2,
      shares: 1,
      clicks: null,
      engagementRate: 0.1625,
      fetchedAt: new Date(0),
    };

    let receivedPostIds: PostId[] | null = null;
    let callCount = 0;
    const service = new PublishingService(
      createFakeRepository({
        listCalendarPosts: async () => [publishedA, publishedB, scheduled],
      }),
      {
        getPostMetricsByPosts: async (postIds) => {
          callCount += 1;
          receivedPostIds = postIds;
          return new Map([[publishedA.id, [metricA]]]);
        },
      },
    );

    const result = await service.listCalendarPosts(
      { workspaceId: WORKSPACE_ID, from: FROM, to: TO },
      AUTHOR_ID,
    );

    // Batch: satu kali panggilan port untuk seluruh post Published,
    // bukan satu panggilan per post (anti N+1).
    expect(callCount).toBe(1);
    expect(receivedPostIds).toEqual([publishedA.id, publishedB.id]);

    const byId = new Map(result.map((item) => [item.id, item]));
    expect(byId.get(publishedA.id)?.metrics).toEqual([metricA]);
    expect(byId.get(publishedB.id)?.metrics).toEqual([]);
    expect(byId.get(scheduled.id)?.metrics).toBeNull();
  });
});
