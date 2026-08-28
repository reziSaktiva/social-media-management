import type {
  ConnectedAccountId,
  ContentFormat,
  PostId,
  SocialPlatform,
  UserId,
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
 * `components/draft-editor/actions.ts`.
 *
 * Urutan kritis: persist dulu (`PublishingPostTarget` status `pending`)
 * lewat `repository.schedulePost`, baru panggil adapter, baru persist
 * `outstandPostId` — supaya tidak ada job Outstand yang "orphan" tanpa
 * jejak di DB kalau adapter gagal.
 *
 * **Redesain 2026-08-26** (ADR baru, mismatch dengan kontrak resmi
 * Outstand `create-a-post`): SATU call `outstandAdapter.schedulePost`
 * untuk SEMUA target sekaligus (bukan 1 call per target seperti
 * sebelumnya) — Outstand menghasilkan SATU `outstandPostId` untuk seluruh
 * target. Berbeda dari `PublishNowUseCase`: use-case ini SENGAJA TIDAK
 * memanggil `fetchPostOutcome` setelahnya — post yang dijadwalkan ke masa
 * depan belum punya outcome publish apa pun untuk dibaca (Outstand belum
 * memprosesnya), jadi seluruh target tetap berstatus `scheduled` sampai
 * outcome sungguhan diketahui belakangan lewat polling (T-027) atau
 * webhook `post.published`/`post.error` (T-026) — konsisten dengan model
 * async Outstand di `integration-layer.md`, bukan diagnosa instan Fake.
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
    /** RLS (KI-026 follow-up) — acting user for `withCurrentUser`. */
    actingUserId: UserId;
  }): Promise<PublishingPostRecord> {
    for (const target of input.targets) {
      assertContentFormatAllowed(target.platform, target.contentFormat);
    }

    const record = await this.repository.schedulePost(
      {
        workspaceId: input.workspaceId,
        postId: input.postId,
        scheduledAt: input.scheduledAt,
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
        "Post tidak bisa dijadwalkan — status saat ini bukan Draft atau Ready to Schedule, salah satu akun bukan milik workspace ini, atau post tidak ditemukan.",
      );
    }

    try {
      const result = await this.outstandAdapter.schedulePost({
        caption: record.caption,
        scheduledAt: input.scheduledAt,
        targets: input.targets.map((target) => ({
          outstandAccountId: target.outstandAccountId,
          contentFormat: target.contentFormat,
          platformOptions: target.platformOptions,
        })),
      });

      await this.repository.setOutstandPostId(
        {
          workspaceId: input.workspaceId,
          postId: input.postId,
          outstandPostId: result.outstandPostId,
        },
        input.actingUserId,
      );

      await Promise.all(
        record.targets.map((scheduledTarget) =>
          this.repository.updateTargetOutcome(
            { postTargetId: scheduledTarget.id, status: "scheduled" },
            input.actingUserId,
          ),
        ),
      );
    } catch (error) {
      // Satu call mencakup semua target (redesain 2026-08-26) — gagal
      // berarti SEMUA target gagal bersamaan (all-or-nothing), beda dari
      // model lama yang bisa partial per target. Post dikoreksi ke
      // `Failed` (sama pola dengan bug fix `PublishNowUseCase`, lihat
      // `IPublishingRepository.markPostFailed`).
      const message = error instanceof Error ? error.message : String(error);
      await Promise.all(
        record.targets.map((scheduledTarget) =>
          this.repository.updateTargetOutcome(
            {
              postTargetId: scheduledTarget.id,
              status: "failed",
              error: message,
            },
            input.actingUserId,
          ),
        ),
      );
      await this.repository.markPostFailed(
        { workspaceId: input.workspaceId, postId: input.postId },
        input.actingUserId,
      );
    }

    return record;
  }
}
