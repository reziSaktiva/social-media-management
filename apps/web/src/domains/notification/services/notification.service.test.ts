import {
  asNotificationId,
  asUserId,
  asWorkspaceId,
  NotificationType,
} from "@social/shared";
import { describe, expect, it } from "vitest";
import type { INotificationRepository } from "../repositories/notification.repository";
import type { NotificationRecord } from "../types";
import { NotificationService } from "./notification.service";

const USER_ID = asUserId("user-1");
const WORKSPACE_ID = asWorkspaceId("workspace-1");

function createFakeRepository(
  overrides: Partial<INotificationRepository> = {},
): INotificationRepository {
  return {
    create: async (input) => ({
      id: asNotificationId("notification-1"),
      workspaceId: input.workspaceId,
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      isRead: false,
      relatedEntityType: input.relatedEntityType ?? null,
      relatedEntityId: input.relatedEntityId ?? null,
      createdAt: new Date("2026-08-31T00:00:00Z"),
    }),
    ...overrides,
  };
}

describe("NotificationService", () => {
  it("notify() delegates to repository.create() and returns the created record", async () => {
    let captured: Parameters<INotificationRepository["create"]>[0] | null =
      null;
    const repository = createFakeRepository({
      create: async (input) => {
        captured = input;
        const record: NotificationRecord = {
          id: asNotificationId("notification-1"),
          workspaceId: input.workspaceId,
          userId: input.userId,
          type: input.type,
          title: input.title,
          body: input.body,
          isRead: false,
          relatedEntityType: input.relatedEntityType ?? null,
          relatedEntityId: input.relatedEntityId ?? null,
          createdAt: new Date("2026-08-31T00:00:00Z"),
        };
        return record;
      },
    });
    const service = new NotificationService(repository);

    const result = await service.notify({
      workspaceId: WORKSPACE_ID,
      userId: USER_ID,
      type: NotificationType.OwnershipTransferRequested,
      title: "Permintaan Transfer Ownership",
      body: "Anda diminta menerima transfer kepemilikan workspace ini.",
      relatedEntityType: "member",
      relatedEntityId: "member-1",
    });

    expect(captured).toEqual({
      workspaceId: WORKSPACE_ID,
      userId: USER_ID,
      type: NotificationType.OwnershipTransferRequested,
      title: "Permintaan Transfer Ownership",
      body: "Anda diminta menerima transfer kepemilikan workspace ini.",
      relatedEntityType: "member",
      relatedEntityId: "member-1",
    });
    expect(result.isRead).toBe(false);
    expect(result.id).toBe(asNotificationId("notification-1"));
  });

  it("notify() works without optional relatedEntityType/relatedEntityId", async () => {
    const repository = createFakeRepository();
    const service = new NotificationService(repository);

    const result = await service.notify({
      workspaceId: WORKSPACE_ID,
      userId: USER_ID,
      type: NotificationType.OwnershipTransferResolved,
      title: "Transfer Ownership diterima",
      body: "Kepemilikan workspace telah berpindah.",
    });

    expect(result.relatedEntityType).toBeNull();
    expect(result.relatedEntityId).toBeNull();
  });
});
