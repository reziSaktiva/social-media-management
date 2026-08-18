import type { MemberRole, PostId, UserId, WorkspaceId } from "@social/shared";
import { ConflictError } from "@/lib/utils/errors";
import type { IOutstandAdapter } from "../adapters/outstand-adapter";
import { assertContentFormatAllowed } from "../content-format-matrix";
import { assertActorCanPublishNow } from "../rbac";
import type {
  IPublishingRepository,
  PublishingPostRecord,
} from "../repositories/publishing.repository";
import type { SchedulePostsTargetInput } from "./schedule-posts.use-case";

/**
 * Use-case terpisah dari `PublishingService`, mengikuti pola
 * `SchedulePostsUseCase` (T-028/ADR-059) — constructor mewajibkan
 * `IOutstandAdapter` secara tipe supaya lupa pass adapter di call site baru
 * langsung ketahuan TypeScript. Satu-satunya call site saat ini:
 * `publishNowAction` di `components/draft-editor/actions.ts`.
 *
 * Beda dari `SchedulePostsUseCase`:
 * - Tidak ada `scheduledAt` — aksi ini tayang langsung (KSP-05-F12).
 * - RBAC eksplisit (`assertActorCanPublishNow`) dijalankan lebih dulu,
 *   sebelum validasi format — Publish Now lebih berisiko daripada Schedule
 *   (tanpa jeda koreksi `cancelSchedule`), jadi guard otorisasi diperiksa
 *   duluan (fail fast) sebelum melakukan pekerjaan lain.
 * - Urutan kritis yang sama dengan Schedule tetap dipertahankan: persist
 *   dulu (`PublishingPostTarget` status `pending`, post → `Published`)
 *   lewat `repository.publishNow`, baru panggil adapter per target, baru
 *   update outcome — supaya tidak ada job Outstand yang "orphan" tanpa
 *   jejak di DB kalau salah satu target gagal.
 */
export class PublishNowUseCase {
  constructor(
    private readonly repository: IPublishingRepository,
    private readonly outstandAdapter: IOutstandAdapter,
  ) {}

  async execute(input: {
    workspaceId: WorkspaceId;
    postId: PostId;
    targets: SchedulePostsTargetInput[];
    /** RBAC (T-029.1, ADR-047/ADR-074) — role actor yang sudah tervalidasi. */
    actorRole: MemberRole;
    /** RLS (KI-026 follow-up) — acting user for `withCurrentUser`. */
    actingUserId: UserId;
  }): Promise<PublishingPostRecord> {
    assertActorCanPublishNow(input.actorRole);

    for (const target of input.targets) {
      assertContentFormatAllowed(target.platform, target.contentFormat);
    }

    const record = await this.repository.publishNow(
      {
        workspaceId: input.workspaceId,
        postId: input.postId,
        targets: input.targets.map((target) => ({
          connectedAccountId: target.connectedAccountId,
          platform: target.platform,
          contentFormat: target.contentFormat,
          platformOptions: target.platformOptions,
        })),
      },
      input.actingUserId,
    );

    if (!record) {
      throw new ConflictError(
        "Post tidak bisa dipublikasikan — status saat ini bukan Draft atau Ready to Schedule, salah satu akun bukan milik workspace ini, atau post tidak ditemukan.",
      );
    }

    const targetInputByConnectedAccountId = new Map(
      input.targets.map((target) => [target.connectedAccountId, target]),
    );

    await Promise.all(
      record.targets.map(async (publishedTarget) => {
        const targetInput = targetInputByConnectedAccountId.get(
          publishedTarget.connectedAccountId,
        );
        // Selalu ada — targets di record berasal dari input.targets yang sama.
        if (!targetInput) {
          return;
        }

        try {
          const result = await this.outstandAdapter.publishNow({
            outstandAccountId: targetInput.outstandAccountId,
            caption: record.caption,
            contentFormat: targetInput.contentFormat,
            platformOptions: targetInput.platformOptions,
          });

          await this.repository.updateTargetOutcome(
            {
              postTargetId: publishedTarget.id,
              outstandJobId: result.outstandJobId,
              status: "published",
              publishedUrl: result.publishedUrl,
            },
            input.actingUserId,
          );
        } catch (error) {
          await this.repository.updateTargetOutcome(
            {
              postTargetId: publishedTarget.id,
              status: "failed",
              error: error instanceof Error ? error.message : String(error),
            },
            input.actingUserId,
          );
        }
      }),
    );

    return record;
  }
}
