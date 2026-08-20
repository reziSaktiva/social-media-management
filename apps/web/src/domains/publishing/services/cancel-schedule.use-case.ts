import type { MemberRole, PostId, UserId, WorkspaceId } from "@social/shared";
import { ConflictError } from "@/lib/utils/errors";
import type { IOutstandAdapter } from "../adapters/outstand-adapter";
import { assertActorCanCancelSchedule } from "../rbac";
import type {
  IPublishingRepository,
  PublishingPostRecord,
} from "../repositories/publishing.repository";

/**
 * Use-case terpisah dari `PublishingService`, mengikuti pola
 * `PublishNowUseCase`/`SchedulePostsUseCase` (T-028/T-029, ADR-059) —
 * constructor mewajibkan `IOutstandAdapter` secara tipe supaya lupa pass
 * adapter di call site baru langsung ketahuan TypeScript. Satu-satunya
 * call site saat ini: `cancelScheduleAction` di
 * `app/(app)/publish/queue/actions.ts`.
 *
 * Cancel Schedule (T-030, ADR-049 Tier 2) — kebalikan dari Schedule/Publish
 * Now: RBAC dulu (sama role: Owner/Admin/Creator, tidak ada validasi format
 * karena tidak ada target baru yang diperkenalkan), lalu persist dulu
 * (`repository.cancelSchedule` — post → Draft, target dihapus) baru
 * panggil adapter per target untuk membatalkan job di sisi Outstand. Urutan
 * ini konsisten dengan `PublishNowUseCase`/`SchedulePostsUseCase`: DB commit
 * dulu supaya tidak ada state yang berubah tanpa jejak, adapter call
 * sesudahnya murni membersihkan sisi eksternal.
 *
 * Beda dari `SchedulePostsUseCase`/`PublishNowUseCase`: kegagalan
 * `cancelScheduledPost` per target tidak ditulis balik ke
 * `PublishingPostTarget` (baris itu sudah dihapus oleh
 * `repository.cancelSchedule`) — cukup best-effort, gagal salah satu target
 * tidak menggagalkan keseluruhan aksi (post di DB sudah pasti Draft).
 */
export class CancelScheduleUseCase {
  constructor(
    private readonly repository: IPublishingRepository,
    private readonly outstandAdapter: IOutstandAdapter,
  ) {}

  async execute(input: {
    workspaceId: WorkspaceId;
    postId: PostId;
    /** RBAC (T-030.1, ADR-049 Tier 2) — role actor yang sudah tervalidasi. */
    actorRole: MemberRole;
    /** RLS (KI-026 follow-up) — acting user for `withCurrentUser`. */
    actingUserId: UserId;
  }): Promise<PublishingPostRecord> {
    assertActorCanCancelSchedule(input.actorRole);

    const record = await this.repository.cancelSchedule(
      { workspaceId: input.workspaceId, postId: input.postId },
      input.actingUserId,
    );

    if (!record) {
      throw new ConflictError(
        "Jadwal tidak bisa dibatalkan — post tidak ditemukan atau statusnya bukan Scheduled.",
      );
    }

    await Promise.all(
      record.cancelledTargets
        .filter(
          (target): target is { outstandJobId: string } =>
            target.outstandJobId !== null,
        )
        .map(async (target) => {
          try {
            await this.outstandAdapter.cancelScheduledPost(
              target.outstandJobId,
            );
          } catch {
            // Best-effort — tidak ada baris PublishingPostTarget lagi untuk
            // dicatat outcome-nya (sudah dihapus oleh repository.cancelSchedule),
            // dan post di DB sudah pasti Draft terlepas dari hasil ini.
          }
        }),
    );

    return {
      id: record.id,
      workspaceId: record.workspaceId,
      authorId: record.authorId,
      caption: record.caption,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
