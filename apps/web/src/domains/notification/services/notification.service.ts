import type { NotificationType, UserId, WorkspaceId } from "@social/shared";
import type { INotificationRepository } from "../repositories/notification.repository";
import type { NotificationRecord } from "../types";

/**
 * `NotificationService` (application-layer.md) — supporting domain BC-09.
 * `notify` adalah satu-satunya method yang dipakai domain lain lewat port
 * lokal (pola sama seperti `ScheduledCountsPort` di `WorkspaceService`) —
 * domain lain TIDAK boleh import `NotificationService` konkret secara
 * langsung (AGENTS.md #7), composition root (Server Action) yang menyuplai
 * instance ini ke service pemanggil lewat constructor.
 */
export class NotificationService {
  constructor(private readonly repository: INotificationRepository) {}

  async notify(input: {
    workspaceId: WorkspaceId;
    userId: UserId;
    type: NotificationType;
    title: string;
    body: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }): Promise<NotificationRecord> {
    return this.repository.create(input);
  }
}
