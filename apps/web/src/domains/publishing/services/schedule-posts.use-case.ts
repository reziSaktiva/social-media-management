import type {
  ConnectedAccountId,
  ContentFormat,
  PostId,
  SocialPlatform,
  WorkspaceId,
} from "@social/shared";
import { ConflictError } from "@/lib/utils/errors";
import type { IOutstandAdapter } from "../adapters/outstand-adapter";
import { assertContentFormatAllowed } from "../content-format-matrix";
import type {
  IPublishingRepository,
  PublishingPostRecord,
} from "../repositories/publishing.repository";

export interface SchedulePostsTargetInput {
  connectedAccountId: ConnectedAccountId;
  platform: SocialPlatform;
  contentFormat: ContentFormat;
  platformOptions?: Record<string, unknown>;
  /**
   * `WorkspaceConnectedAccount.outstandAccountId` — bukan `connectedAccountId`
   * (Prisma id) itu sendiri. `SchedulePostsUseCase` tidak mengimpor domain
   * Workspace, jadi caller (Server Action) wajib me-resolve nilai ini lebih
   * dulu dari `WorkspaceService.listConnectedAccounts` sebelum memanggil
   * `execute`. Hanya dipakai untuk panggilan `OutstandAdapter` — tidak
   * dipersist ke `IPublishingRepository` karena bukan kolom DB.
   */
  outstandAccountId: string;
}

/**
 * Use-case terpisah dari `PublishingService` (bukan method di dalamnya)
 * supaya constructor bisa MEWAJIBKAN `IOutstandAdapter` secara tipe — lupa
 * pass adapter di call site baru langsung ketahuan TypeScript, bukan cuma
 * runtime throw (temuan review Ridwan Architecture Reviewer). Satu-satunya
 * call site saat ini: `scheduleDraftAction` di
 * `_draft-editor/actions.ts`.
 *
 * Urutan kritis: persist dulu (`PublishingPostTarget` status `pending`)
 * lewat `repository.schedulePost`, baru panggil adapter per target, baru
 * update outcome — supaya tidak ada job Outstand yang "orphan" tanpa jejak
 * di DB kalau salah satu target gagal.
 */
export class SchedulePostsUseCase {
  constructor(
    private readonly repository: IPublishingRepository,
    private readonly outstandAdapter: IOutstandAdapter,
  ) {}

  async execute(input: {
    workspaceId: WorkspaceId;
    postId: PostId;
    scheduledAt: Date;
    targets: SchedulePostsTargetInput[];
  }): Promise<PublishingPostRecord> {
    for (const target of input.targets) {
      assertContentFormatAllowed(target.platform, target.contentFormat);
    }

    const record = await this.repository.schedulePost({
      workspaceId: input.workspaceId,
      postId: input.postId,
      scheduledAt: input.scheduledAt,
      targets: input.targets.map((target) => ({
        connectedAccountId: target.connectedAccountId,
        platform: target.platform,
        contentFormat: target.contentFormat,
        platformOptions: target.platformOptions,
      })),
    });

    if (!record) {
      throw new ConflictError(
        "Post tidak bisa dijadwalkan — status saat ini bukan Draft atau Ready to Schedule, salah satu akun bukan milik workspace ini, atau post tidak ditemukan.",
      );
    }

    const targetInputByConnectedAccountId = new Map(
      input.targets.map((target) => [target.connectedAccountId, target]),
    );

    await Promise.all(
      record.targets.map(async (scheduledTarget) => {
        const targetInput = targetInputByConnectedAccountId.get(
          scheduledTarget.connectedAccountId,
        );
        // Selalu ada — targets di record berasal dari input.targets yang sama.
        if (!targetInput) {
          return;
        }

        try {
          const result = await this.outstandAdapter.schedulePost({
            outstandAccountId: targetInput.outstandAccountId,
            caption: record.caption,
            scheduledAt: input.scheduledAt,
            contentFormat: targetInput.contentFormat,
            platformOptions: targetInput.platformOptions,
          });

          await this.repository.updateTargetOutcome({
            postTargetId: scheduledTarget.id,
            outstandJobId: result.outstandJobId,
            status: "scheduled",
          });
        } catch (error) {
          await this.repository.updateTargetOutcome({
            postTargetId: scheduledTarget.id,
            status: "failed",
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }),
    );

    return record;
  }
}
