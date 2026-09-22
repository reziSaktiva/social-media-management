import type {
  IOutstandAdapter,
  InboxItemId,
  UserId,
  WorkspaceId,
} from "@social/shared";
import { NotFoundError, ValidationError } from "@/lib/utils/errors";
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
 * Application Service untuk domain `engagement` (T-050). Scope awalnya
 * dibatasi ke 3 use-case baca/tulis dasar — sync (T-051) dan manual refresh
 * (T-052) punya use-case/handler sendiri di luar class ini. Reply (T-054)
 * SEKARANG ditambahkan di sini sebagai method `reply` — bukan use-case
 * terpisah seperti sync — karena scope-nya kecil (satu panggilan adapter +
 * satu persist) dan sepenuhnya milik lifecycle `EngagementInboxItem`/
 * `EngagementReply`, konsisten dengan `getInboxItemDetail`/`markAsDone` yang
 * sudah ada di sini.
 */
export class EngagementService {
  constructor(
    private readonly repository: IEngagementRepository,
    private readonly adapter: IOutstandAdapter,
  ) {}

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

  /**
   * Balas komentar dari dalam aplikasi (T-054, `integration-layer.md`
   * § "Reply via Outstand API", ADR-019/ADR-040). RBAC: seluruh role
   * (Account Owner/Admin/Creator) boleh membalas — `roles-permissions.md`
   * tidak membedakan akses "Kelola Engagement Comments Inbox" per role,
   * jadi tidak ada role gating tambahan di sini selain member aktif
   * workspace (sudah ditegakkan composition root lewat
   * `getWorkspaceContext`/session, pola sama Server Action lain).
   *
   * Urutan: validasi `content` (pola sama `IdentityService.updateProfile` —
   * trim lalu tolak string kosong/whitespace-only) → `findInboxItemById`
   * (guard `NotFoundError` kalau tidak ketemu/bukan milik `workspaceId` ini,
   * pola sama `getInboxItemDetail`/`markAsDone`) →
   * `IOutstandAdapter.replyToComment(item.externalId, content)` (Anti-
   * Corruption Layer — domain ini tidak pernah tahu bentuk request/response
   * HTTP Outstand) → `createReply` dengan `outstandReplyId` hasil adapter
   * ikut dipersist (kolom `EngagementReply.outstandReplyId`, ADR-040).
   * `item.externalId` adalah `outstandCommentId` (komentar eksternal
   * Outstand yang sedang dibalas) — field ini disebut `externalId` di
   * `EngagementInboxItemRecord` karena mengikuti nama kolom Prisma persis
   * (`schema.prisma`), bukan diganti nama supaya konsisten leksikal dengan
   * kontrak Outstand.
   */
  async reply(
    input: {
      workspaceId: WorkspaceId;
      inboxItemId: InboxItemId;
      content: string;
    },
    userId: UserId,
  ): Promise<EngagementReplyRecord> {
    const content = input.content.trim();
    if (!content) {
      throw new ValidationError("Balasan tidak boleh kosong.");
    }

    const item = await this.repository.findInboxItemById(
      { workspaceId: input.workspaceId, inboxItemId: input.inboxItemId },
      userId,
    );
    if (!item) {
      throw new NotFoundError("Komentar tidak ditemukan.");
    }

    const { outstandReplyId } = await this.adapter.replyToComment(
      item.externalId,
      content,
    );

    return this.repository.createReply(
      {
        inboxItemId: item.id,
        userId,
        content,
        outstandReplyId,
      },
      userId,
    );
  }
}
