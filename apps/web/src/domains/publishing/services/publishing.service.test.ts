import {
  asPostId,
  asUserId,
  asWorkspaceId,
  ContentStatus,
} from "@social/shared";
import { describe, expect, it } from "vitest";
import { NotFoundError } from "@/lib/utils/errors";
import type {
  IPublishingRepository,
  PublishingPostRecord,
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
    updateTargetOutcome: async () => undefined,
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

    await expect(service.listDrafts(WORKSPACE_ID)).resolves.toBe(drafts);
  });
});

describe("PublishingService.getDraftById", () => {
  it("throws NotFoundError when the repository returns null", async () => {
    const service = new PublishingService(createFakeRepository());

    await expect(
      service.getDraftById(WORKSPACE_ID, asPostId("post-1")),
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
      service.getDraftById(WORKSPACE_ID, asPostId("post-1")),
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

    await service.updateDraft({
      workspaceId: WORKSPACE_ID,
      postId: asPostId("post-1"),
      caption: "  Hello world  ",
    });

    expect(received).toEqual({
      workspaceId: WORKSPACE_ID,
      postId: asPostId("post-1"),
      caption: "Hello world",
    });
  });

  it("throws NotFoundError when the repository returns null", async () => {
    const service = new PublishingService(createFakeRepository());

    await expect(
      service.updateDraft({
        workspaceId: WORKSPACE_ID,
        postId: asPostId("post-1"),
        caption: "Hello",
      }),
    ).rejects.toThrow(NotFoundError);
  });
});
