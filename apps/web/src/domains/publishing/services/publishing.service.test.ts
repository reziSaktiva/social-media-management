import {
  asConnectedAccountId,
  asPostId,
  asPostMetricsId,
  asPostTargetId,
  asUserId,
  asWorkspaceId,
  ContentFormat,
  ContentStatus,
  MemberRole,
  type PostId,
  SocialPlatform,
} from "@social/shared";
import { describe, expect, it } from "vitest";
import type { PostMetricsRecord } from "@/domains/analytics";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
} from "@/lib/utils/errors";
import type {
  CalendarItemRecord,
  HistoryItemRecord,
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
    getCalendarPostById: async () => null,
    listHistory: async () => [],
    getHistoryById: async () => null,
    getHistoryPostById: async () => null,
    cancelSchedule: async () => null,
    markPostFailed: async () => undefined,
    getRetryTarget: async () => null,
    resetTargetForRetry: async () => undefined,
    setRetryOutstandPostId: async () => undefined,
    reconcilePostStatusAfterRetry: async () => undefined,
    findPostTargetsByOutstandPostId: async () => null,
    softDeletePost: async () => null,
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
    updatedAt: new Date("2026-07-13T00:00:00Z"),
    targets: [
      {
        id: asPostTargetId("target-1"),
        connectedAccountId: asConnectedAccountId("conn-1"),
        platform: SocialPlatform.Instagram,
        contentFormat: ContentFormat.Post,
        accountHandle: "@raka",
        platformPostUrl: null,
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

describe("PublishingService.getCalendarPostById", () => {
  it("mengembalikan null kalau repository tidak menemukan post (T-092.3, ADR-094 poin 5)", async () => {
    const service = new PublishingService(
      createFakeRepository({ getCalendarPostById: async () => null }),
    );

    await expect(
      service.getCalendarPostById(WORKSPACE_ID, asPostId("post-x"), AUTHOR_ID),
    ).resolves.toBeNull();
  });

  it("metrics null untuk post non-Published", async () => {
    const draft = createCalendarItem({
      id: asPostId("post-draft"),
      status: ContentStatus.Draft,
    });
    const service = new PublishingService(
      createFakeRepository({ getCalendarPostById: async () => draft }),
    );

    const result = await service.getCalendarPostById(
      WORKSPACE_ID,
      draft.id,
      AUTHOR_ID,
    );

    expect(result).toEqual({ ...draft, metrics: null });
  });

  it("metrics diisi dari PostMetricsPort untuk post Published — satu panggilan, bukan batch semua post workspace", async () => {
    const published = createCalendarItem({
      id: asPostId("post-published"),
      status: ContentStatus.Published,
      scheduledAt: null,
      publishedAt: new Date("2026-07-14T00:00:00Z"),
    });
    const metric: PostMetricsRecord = {
      id: asPostMetricsId("metric-a"),
      postId: published.id,
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
    const service = new PublishingService(
      createFakeRepository({ getCalendarPostById: async () => published }),
      {
        getPostMetricsByPosts: async (postIds) => {
          receivedPostIds = postIds;
          return new Map([[published.id, [metric]]]);
        },
      },
    );

    const result = await service.getCalendarPostById(
      WORKSPACE_ID,
      published.id,
      AUTHOR_ID,
    );

    expect(receivedPostIds).toEqual([published.id]);
    expect(result).toEqual({ ...published, metrics: [metric] });
  });

  it("metrics [] untuk post Published tanpa PostMetricsPort disuplai", async () => {
    const published = createCalendarItem({
      id: asPostId("post-published"),
      status: ContentStatus.Published,
      scheduledAt: null,
      publishedAt: new Date("2026-07-14T00:00:00Z"),
    });
    const service = new PublishingService(
      createFakeRepository({ getCalendarPostById: async () => published }),
    );

    const result = await service.getCalendarPostById(
      WORKSPACE_ID,
      published.id,
      AUTHOR_ID,
    );

    expect(result).toEqual({ ...published, metrics: [] });
  });
});

function createHistoryItem(
  overrides: Partial<HistoryItemRecord> = {},
): HistoryItemRecord {
  return {
    id: asPostId("post-1"),
    caption: "Hello",
    status: ContentStatus.Published,
    scheduledAt: null,
    publishedAt: new Date("2026-07-14T10:00:00Z"),
    createdAt: new Date("2026-07-13T00:00:00Z"),
    updatedAt: new Date("2026-07-14T10:00:00Z"),
    targets: [
      {
        id: asPostTargetId("target-1"),
        connectedAccountId: asConnectedAccountId("conn-1"),
        platform: SocialPlatform.Instagram,
        contentFormat: ContentFormat.Post,
        accountHandle: "@raka",
        status: "published",
        platformPostUrl: "https://instagram.com/p/xyz",
        error: null,
      },
    ],
    ...overrides,
  };
}

describe("PublishingService.listHistory", () => {
  it("mengembalikan array kosong kalau tidak ada riwayat", async () => {
    const service = new PublishingService(
      createFakeRepository({ listHistory: async () => [] }),
    );

    await expect(
      service.listHistory({ workspaceId: WORKSPACE_ID }, AUTHOR_ID),
    ).resolves.toEqual([]);
  });

  it("default statuses ke [Published, Failed] kalau tidak diisi caller", async () => {
    let received: Parameters<IPublishingRepository["listHistory"]>[0] | null =
      null;
    const service = new PublishingService(
      createFakeRepository({
        listHistory: async (input) => {
          received = input;
          return [];
        },
      }),
    );

    await service.listHistory({ workspaceId: WORKSPACE_ID }, AUTHOR_ID);

    expect(received).toEqual({
      workspaceId: WORKSPACE_ID,
      statuses: [ContentStatus.Published, ContentStatus.Failed],
    });
  });

  it("meneruskan connectedAccountIds apa adanya ke repository", async () => {
    let received: Parameters<IPublishingRepository["listHistory"]>[0] | null =
      null;
    const connectedAccountIds = [asConnectedAccountId("conn-1")];
    const service = new PublishingService(
      createFakeRepository({
        listHistory: async (input) => {
          received = input;
          return [];
        },
      }),
    );

    await service.listHistory(
      { workspaceId: WORKSPACE_ID, connectedAccountIds },
      AUTHOR_ID,
    );

    expect(received).toEqual({
      workspaceId: WORKSPACE_ID,
      connectedAccountIds,
      statuses: [ContentStatus.Published, ContentStatus.Failed],
    });
  });

  it("meng-clamp statuses ke subset terminal (Published/Failed) sebelum memanggil repository", async () => {
    let received: Parameters<IPublishingRepository["listHistory"]>[0] | null =
      null;
    const service = new PublishingService(
      createFakeRepository({
        listHistory: async (input) => {
          received = input;
          return [];
        },
      }),
    );

    await service.listHistory(
      {
        workspaceId: WORKSPACE_ID,
        statuses: [
          ContentStatus.Draft,
          ContentStatus.Published,
          ContentStatus.Scheduled,
        ],
      },
      AUTHOR_ID,
    );

    expect(received).toEqual({
      workspaceId: WORKSPACE_ID,
      statuses: [ContentStatus.Published],
    });
  });

  it("tidak memanggil repository sama sekali kalau semua status yang diminta bukan status terminal", async () => {
    let calls = 0;
    const service = new PublishingService(
      createFakeRepository({
        listHistory: async () => {
          calls += 1;
          return [];
        },
      }),
    );

    const result = await service.listHistory(
      { workspaceId: WORKSPACE_ID, statuses: [ContentStatus.Draft] },
      AUTHOR_ID,
    );

    expect(result).toEqual([]);
    expect(calls).toBe(0);
  });

  it("mengembalikan hasil repository apa adanya (sudah terurut, tanpa post-processing)", async () => {
    const items = [
      createHistoryItem(),
      createHistoryItem({ id: asPostId("post-2") }),
    ];
    const service = new PublishingService(
      createFakeRepository({ listHistory: async () => items }),
    );

    await expect(
      service.listHistory({ workspaceId: WORKSPACE_ID }, AUTHOR_ID),
    ).resolves.toBe(items);
  });
});

describe("PublishingService.getHistoryById", () => {
  it("throws NotFoundError when the repository returns null", async () => {
    const service = new PublishingService(createFakeRepository());

    await expect(
      service.getHistoryById(WORKSPACE_ID, asPostId("post-1"), AUTHOR_ID),
    ).rejects.toThrow(NotFoundError);
  });

  it("returns the history item when found", async () => {
    const item = createHistoryItem();
    const service = new PublishingService(
      createFakeRepository({ getHistoryById: async () => item }),
    );

    await expect(
      service.getHistoryById(WORKSPACE_ID, asPostId("post-1"), AUTHOR_ID),
    ).resolves.toBe(item);
  });
});

describe("PublishingService.deletePost", () => {
  function draftRecord(
    overrides: Partial<PublishingPostRecord> = {},
  ): PublishingPostRecord {
    return {
      id: asPostId("post-1"),
      workspaceId: WORKSPACE_ID,
      authorId: AUTHOR_ID,
      caption: "Hello",
      status: ContentStatus.Draft,
      createdAt: new Date(0),
      updatedAt: new Date(0),
      ...overrides,
    };
  }

  it("soft delete post Draft — happy path, delegates ke repository lalu mengembalikan post yang sudah dihapus", async () => {
    const existing = draftRecord();
    const deleted: PublishingPostRecord = { ...existing };
    let received:
      Parameters<IPublishingRepository["softDeletePost"]>[0] | null = null;
    const service = new PublishingService(
      createFakeRepository({
        findDraftById: async () => existing,
        softDeletePost: async (input) => {
          received = input;
          return deleted;
        },
      }),
    );

    await expect(
      service.deletePost(
        {
          workspaceId: WORKSPACE_ID,
          postId: asPostId("post-1"),
          actorRole: MemberRole.Creator,
        },
        AUTHOR_ID,
      ),
    ).resolves.toBe(deleted);
    expect(received).toEqual({
      workspaceId: WORKSPACE_ID,
      postId: asPostId("post-1"),
    });
  });

  it.each([
    ContentStatus.InReview,
    ContentStatus.ReadyToSchedule,
    ContentStatus.Scheduled,
    ContentStatus.Published,
    ContentStatus.Failed,
  ])(
    // Koreksi 2026-09-10: entry point Delete Post HANYA ada di Drafts —
    // King Rezi mengonfirmasi post Scheduled harus di-Cancel Schedule dulu
    // (kembali ke Draft) sebelum bisa dihapus, TIDAK bisa dihapus langsung
    // dari status manapun selain Draft.
    "guard: post berstatus %s DITOLAK ConflictError, TANPA memanggil softDeletePost",
    async (status) => {
      let softDeleteCalls = 0;
      const service = new PublishingService(
        createFakeRepository({
          findDraftById: async () => draftRecord({ status }),
          softDeletePost: async () => {
            softDeleteCalls += 1;
            return null;
          },
        }),
      );

      await expect(
        service.deletePost(
          {
            workspaceId: WORKSPACE_ID,
            postId: asPostId("post-1"),
            actorRole: MemberRole.Owner,
          },
          AUTHOR_ID,
        ),
      ).rejects.toThrow(ConflictError);
      expect(softDeleteCalls).toBe(0);
    },
  );

  it("throws NotFoundError kalau post tidak ditemukan sama sekali (findDraftById null)", async () => {
    const service = new PublishingService(
      createFakeRepository({ findDraftById: async () => null }),
    );

    await expect(
      service.deletePost(
        {
          workspaceId: WORKSPACE_ID,
          postId: asPostId("post-1"),
          actorRole: MemberRole.Admin,
        },
        AUTHOR_ID,
      ),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws NotFoundError kalau softDeletePost mengembalikan null walau status sudah dicek Draft (race condition safety net)", async () => {
    const service = new PublishingService(
      createFakeRepository({
        findDraftById: async () => draftRecord(),
        softDeletePost: async () => null,
      }),
    );

    await expect(
      service.deletePost(
        {
          workspaceId: WORKSPACE_ID,
          postId: asPostId("post-1"),
          actorRole: MemberRole.Admin,
        },
        AUTHOR_ID,
      ),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws AuthorizationError untuk role di luar Owner/Admin/Creator, TANPA memanggil repository", async () => {
    let calls = 0;
    const service = new PublishingService(
      createFakeRepository({
        findDraftById: async () => {
          calls += 1;
          return draftRecord();
        },
      }),
    );

    await expect(
      service.deletePost(
        {
          workspaceId: WORKSPACE_ID,
          postId: asPostId("post-1"),
          // Cast sengaja — menyimulasikan role tidak valid/di luar 3 role
          // kanonikal, sama pola pengujian dengan RBAC lain di domain ini.
          actorRole: "viewer" as MemberRole,
        },
        AUTHOR_ID,
      ),
    ).rejects.toThrow(AuthorizationError);
    expect(calls).toBe(0);
  });
});
