import { asNotificationId, asUserId, asWorkspaceId } from "@social/shared";
import type { NotificationType } from "@social/shared";
import type {
  INotificationRepository,
  NotificationRecord,
} from "@/domains/notification";
import type { Notification } from "@/generated/prisma/client";
import { withCurrentUser } from "@/lib/prisma/with-current-user";

function toRecord(notification: Notification): NotificationRecord {
  return {
    id: asNotificationId(notification.id),
    workspaceId: asWorkspaceId(notification.workspaceId),
    userId: asUserId(notification.userId),
    type: notification.type as NotificationType,
    title: notification.title,
    body: notification.body,
    isRead: notification.isRead,
    relatedEntityType: notification.relatedEntityType,
    relatedEntityId: notification.relatedEntityId,
    createdAt: notification.createdAt,
  };
}

export const notificationRepository: INotificationRepository = {
  /**
   * `withCurrentUser(userId, ...)` di sini pakai `userId` **penerima**
   * notifikasi (bukan actor yang memicu aksi) — RLS policy
   * `notifications_workspace_isolation` (migration
   * `20260813045625_t017_add_rls_policies`) mengharuskan
   * `app.current_user_id` cocok dengan member aktif `workspaceId` target,
   * dan penerima notifikasi selalu member aktif workspace itu (caller,
   * mis. `WorkspaceService.transferOwnership`, sudah memvalidasi ini
   * sebelum memanggil `notify`).
   */
  async create({
    workspaceId,
    userId,
    type,
    title,
    body,
    relatedEntityType,
    relatedEntityId,
  }) {
    const notification = await withCurrentUser(userId, (tx) =>
      tx.notification.create({
        data: {
          workspaceId,
          userId,
          type,
          title,
          body,
          relatedEntityType,
          relatedEntityId,
        },
      }),
    );

    return toRecord(notification);
  },
};
