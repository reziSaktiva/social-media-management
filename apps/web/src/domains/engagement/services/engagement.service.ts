import type { InboxItemId, UserId, WorkspaceId } from "@social/shared";
import { NotFoundError } from "@/lib/utils/errors";
import type { IEngagementRepository } from "../repositories/engagement.repository";
import type {
  EngagementInboxItemRecord,
  EngagementReplyRecord,
  InboxItemFilter,
} from "../types";

/**
 * Detail satu inbox item + balasannya (T-050) — dipakai composition root
 * route detail Comments Inbox (T-053, belum dibangun di task ini).
 */
export interface InboxItemDetail extends EngagementInboxItemRecord {
  replies: EngagementReplyRecord[];
}

/**
 * Application Service untuk domain `engagement` (T-050). Scope SENGAJA
 * dibatasi ke 3 use-case baca/tulis dasar — sync (T-051), manual refresh
 * (T-052), dan reply (T-054) masing-masing punya use-case/method sendiri
 * yang akan ditambahkan di task-nya masing-masing, BUKAN di sini, supaya
 * tidak tumpang tindih scope antar task (lihat batasan task doc T-050).
 */
export class EngagementService {
  constructor(private readonly repository: IEngagementRepository) {}

  /**
   * Inbox (T-053 nanti mengonsumsi lewat method ini) — daftar inbox item
   * milik workspace, difilter opsional per akun/platform/status. Murni
   * delegasi ke repository — tidak ada agregasi tambahan di T-050.
   */
  async listInbox(
    filter: InboxItemFilter,
    userId: UserId,
  ): Promise<EngagementInboxItemRecord[]> {
    return this.repository.listInboxItems(filter, userId);
  }

  /**
   * Detail satu inbox item + seluruh balasannya. `NotFoundError` kalau
   * item tidak ditemukan atau bukan milik `workspaceId` ini — pola sama
   * `PublishingService.getDraftById`/`getHistoryById`.
   */
  async getInboxItemDetail(
    input: { workspaceId: WorkspaceId; inboxItemId: InboxItemId },
    userId: UserId,
  ): Promise<InboxItemDetail> {
    const item = await this.repository.findInboxItemById(input, userId);
    if (!item) {
      throw new NotFoundError("Komentar tidak ditemukan.");
    }

    const replies = await this.repository.listRepliesByInboxItemId(
      item.id,
      userId,
    );

    return { ...item, replies };
  }

  /**
   * Tandai satu inbox item sebagai sudah dibalas/selesai ("done"). Tidak
   * memanggil `OutstandAdapter` apa pun — murni perubahan status lokal.
   * `NotFoundError` kalau item tidak ditemukan atau bukan milik
   * `workspaceId` ini.
   */
  async markAsDone(
    input: { workspaceId: WorkspaceId; inboxItemId: InboxItemId },
    userId: UserId,
  ): Promise<EngagementInboxItemRecord> {
    const item = await this.repository.markInboxItemStatus(
      { ...input, status: "done" },
      userId,
    );
    if (!item) {
      throw new NotFoundError("Komentar tidak ditemukan.");
    }
    return item;
  }
}
