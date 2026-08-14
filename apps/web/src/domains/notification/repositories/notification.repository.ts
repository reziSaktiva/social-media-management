import type { NotificationType, UserId, WorkspaceId } from "@social/shared";
import type { NotificationRecord } from "../types";

/** Repository interface — implementation (Prisma) lives in src/lib/repositories/notification. */
export interface INotificationRepository {
  /**
   * Buat satu notifikasi baru (BC-09, `NotificationService.notify` di
   * `application-layer.md`). `relatedEntityType`/`relatedEntityId` opsional
   * — dipakai untuk deep-link ke entitas terkait (mis. member, post).
   */
  create(input: {
    workspaceId: WorkspaceId;
    userId: UserId;
    type: NotificationType;
    title: string;
    body: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }): Promise<NotificationRecord>;
}
