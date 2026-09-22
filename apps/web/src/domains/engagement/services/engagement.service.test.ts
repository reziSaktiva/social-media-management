import {
  asConnectedAccountId,
  asInboxItemId,
  asReplyId,
  asUserId,
  asWorkspaceId,
  SocialPlatform,
} from "@social/shared";
import { describe, expect, it } from "vitest";
import { NotFoundError } from "@/lib/utils/errors";
import type { IEngagementRepository } from "../repositories/engagement.repository";
import type {
  EngagementInboxItemRecord,
  EngagementReplyRecord,
  InboxItemStatus,
} from "../types";
import { EngagementService } from "./engagement.service";

const WORKSPACE_ID = asWorkspaceId("workspace-1");
const CONNECTED_ACCOUNT_ID = asConnectedAccountId("account-1");
const USER_ID = asUserId("user-1");
const INBOX_ITEM_ID = asInboxItemId("inbox-item-1");

function makeInboxItem(
  overrides: Partial<EngagementInboxItemRecord> = {},
): EngagementInboxItemRecord {
  return {
    id: INBOX_ITEM_ID,
    workspaceId: WORKSPACE_ID,
    connectedAccountId: CONNECTED_ACCOUNT_ID,
    platform: SocialPlatform.Instagram,
    type: "comment",
    externalId: "external-1",
    authorHandle: "@rezi",
    content: "Halo, ini komentar",
    status: "unread",
    postId: null,
    receivedAt: new Date(0),
    readAt: null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    ...overrides,
  };
}

function createFakeRepository(
  overrides: Partial<IEngagementRepository> = {},
): IEngagementRepository {
  return {
    listInboxItems: async () => [],
    findInboxItemById: async () => null,
    upsertInboxItem: async () => ({ item: makeInboxItem(), isNew: true }),
    markInboxItemStatus: async () => null,
    createReply: async ({ inboxItemId, userId, content }) => ({
      id: asReplyId("reply-1"),
      inboxItemId,
      userId,
      content,
      outstandReplyId: null,
      status: "pending",
      sentAt: new Date(0),
      createdAt: new Date(0),
      updatedAt: new Date(0),
    }),
    listRepliesByInboxItemId: async () => [],
    ...overrides,
  };
}

describe("EngagementService.listInbox", () => {
  it("meneruskan filter ke repository dan mengembalikan hasilnya apa adanya", async () => {
    const items = [makeInboxItem(), makeInboxItem({ status: "done" })];
    let receivedFilter: unknown;
    const repository = createFakeRepository({
      listInboxItems: async (filter) => {
        receivedFilter = filter;
        return items;
      },
    });
    const service = new EngagementService(repository);

    const result = await service.listInbox(
      {
        workspaceId: WORKSPACE_ID,
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        status: "unread" as InboxItemStatus,
      },
      USER_ID,
    );

    expect(result).toBe(items);
    expect(receivedFilter).toEqual({
      workspaceId: WORKSPACE_ID,
      connectedAccountId: CONNECTED_ACCOUNT_ID,
      status: "unread",
    });
  });
});

describe("EngagementService.getInboxItemDetail", () => {
  it("mengembalikan item beserta replies-nya kalau ditemukan", async () => {
    const item = makeInboxItem();
    const replies: EngagementReplyRecord[] = [
      {
        id: asReplyId("reply-1"),
        inboxItemId: item.id,
        userId: USER_ID,
        content: "Balasan pertama",
        outstandReplyId: null,
        status: "sent",
        sentAt: new Date(0),
        createdAt: new Date(0),
        updatedAt: new Date(0),
      },
    ];
    const repository = createFakeRepository({
      findInboxItemById: async () => item,
      listRepliesByInboxItemId: async () => replies,
    });
    const service = new EngagementService(repository);

    const result = await service.getInboxItemDetail(
      { workspaceId: WORKSPACE_ID, inboxItemId: item.id },
      USER_ID,
    );

    expect(result).toEqual({ ...item, replies });
  });

  it("throw NotFoundError kalau item tidak ditemukan", async () => {
    const repository = createFakeRepository({
      findInboxItemById: async () => null,
    });
    const service = new EngagementService(repository);

    await expect(
      service.getInboxItemDetail(
        { workspaceId: WORKSPACE_ID, inboxItemId: INBOX_ITEM_ID },
        USER_ID,
      ),
    ).rejects.toThrow(NotFoundError);
  });
});

describe("EngagementService.markAsDone", () => {
  it("mengubah status inbox item jadi done", async () => {
    const doneItem = makeInboxItem({ status: "done", readAt: new Date(1) });
    let receivedStatusInput: unknown;
    const repository = createFakeRepository({
      markInboxItemStatus: async (input) => {
        receivedStatusInput = input;
        return doneItem;
      },
    });
    const service = new EngagementService(repository);

    const result = await service.markAsDone(
      { workspaceId: WORKSPACE_ID, inboxItemId: INBOX_ITEM_ID },
      USER_ID,
    );

    expect(result).toBe(doneItem);
    expect(receivedStatusInput).toEqual({
      workspaceId: WORKSPACE_ID,
      inboxItemId: INBOX_ITEM_ID,
      status: "done",
    });
  });

  it("throw NotFoundError kalau item tidak ditemukan/bukan milik workspace ini", async () => {
    const repository = createFakeRepository({
      markInboxItemStatus: async () => null,
    });
    const service = new EngagementService(repository);

    await expect(
      service.markAsDone(
        { workspaceId: WORKSPACE_ID, inboxItemId: INBOX_ITEM_ID },
        USER_ID,
      ),
    ).rejects.toThrow(NotFoundError);
  });
});
