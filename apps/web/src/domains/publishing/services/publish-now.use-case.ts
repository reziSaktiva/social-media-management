import type {
  MemberRole,
  PostId,
  PostTargetId,
  UserId,
  WorkspaceId,
} from "@social/shared";
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
 *   lewat `repository.publishNow`, baru panggil adapter, baru update
 *   outcome — supaya tidak ada job Outstand yang "orphan" tanpa jejak di
 *   DB kalau adapter gagal.
 *
 * **Redesain 2026-08-26** (ADR baru, mismatch dengan kontrak resmi
 * Outstand `create-a-post`): SATU call `outstandAdapter.publishNow` untuk
 * SEMUA target sekaligus (bukan 1 call per target). Berbeda dari
 * `SchedulePostsUseCase`: Publish Now butuh outcome per akun SEKARANG
 * (untuk `platformPostUrl` yang ditampilkan di UI, T-034 detail post) —
 * jadi use-case ini memanggil `fetchPostOutcome(outstandPostId)` SEGERA
 * setelah `publishNow` resolve, bukan menunggu polling/webhook belakangan
 * seperti Schedule. Ini valid karena niat aksinya sendiri adalah publish
 * SEKARANG (bukan menjadwalkan ke masa depan) — Fake adapter (ADR-059)
 * kebetulan always-success instan, tapi arsitekturnya tetap benar untuk
 * adapter real nanti (T-025): Outstand memang bisa menyelesaikan publish
 * instan sangat cepat untuk aksi tanpa jadwal, walau responsnya tetap async
 * secara kontrak.
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

    // Mapping berbasis `connectedAccountId` (bukan index/order array) —
    // `record.targets` datang dari `findMany` Prisma yang TIDAK menjamin
    // urutan sama dengan `input.targets`, sama pola aman yang sudah dipakai
    // sebelum redesain ini.
    const targetInputByConnectedAccountId = new Map(
      input.targets.map((target) => [target.connectedAccountId, target]),
    );
    const targetIdByOutstandAccountId = new Map<string, PostTargetId>();
    for (const target of record.targets) {
      const targetInput = targetInputByConnectedAccountId.get(
        target.connectedAccountId,
      );
      if (targetInput) {
        targetIdByOutstandAccountId.set(
          targetInput.outstandAccountId,
          target.id,
        );
      }
    }

    let allTargetsFailed = record.targets.length > 0;

    try {
      const result = await this.outstandAdapter.publishNow({
        caption: record.caption,
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

      const outcomes = await this.outstandAdapter.fetchPostOutcome(
        result.outstandPostId,
      );

      const outcomeByOutstandAccountId = new Map(
        outcomes.map((outcome) => [outcome.outstandAccountId, outcome]),
      );

      const targetOutcomes = await Promise.all(
        input.targets.map(async (targetInput) => {
          const postTargetId = targetIdByOutstandAccountId.get(
            targetInput.outstandAccountId,
          );
          // Selalu ada — targets di record berasal dari input.targets yang
          // sama.
          if (!postTargetId) {
            return "failed" as const;
          }

          const outcome = outcomeByOutstandAccountId.get(
            targetInput.outstandAccountId,
          );

          // Outstand belum melaporkan outcome akun ini (mis. masih
          // "pending" di sisi mereka) — perlakukan sebagai belum
          // diketahui, biarkan status `pending` DB tidak diubah sampai
          // polling/webhook (T-026/T-027) menyusul. Tidak dihitung sebagai
          // gagal.
          if (!outcome || outcome.status === "pending") {
            allTargetsFailed = false;
            return "pending" as const;
          }

          await this.repository.updateTargetOutcome(
            {
              postTargetId,
              status: outcome.status,
              platformPostId: outcome.platformPostId ?? undefined,
              platformPostUrl: outcome.platformPostUrl ?? undefined,
              error: outcome.error ?? undefined,
            },
            input.actingUserId,
          );

          return outcome.status;
        }),
      );

      allTargetsFailed =
        targetOutcomes.length > 0 &&
        targetOutcomes.every((outcome) => outcome === "failed");
    } catch (error) {
      // Satu call mencakup semua target (redesain 2026-08-26) — gagal
      // berarti SEMUA target gagal bersamaan (all-or-nothing).
      const message = error instanceof Error ? error.message : String(error);
      await Promise.all(
        record.targets.map((publishedTarget) =>
          this.repository.updateTargetOutcome(
            {
              postTargetId: publishedTarget.id,
              status: "failed",
              error: message,
            },
            input.actingUserId,
          ),
        ),
      );
      allTargetsFailed = true;
    }

    // Bug fix (2026-08-26) — post sudah ditandai `Published` di atas
    // (`repository.publishNow`) sebelum hasil per target diketahui. Kalau
    // SEMUA target gagal, koreksi status post jadi `Failed` — semantik
    // sama dengan `post.error` webhook Outstand (integration-layer.md
    // :269-270): "semua target gagal" → status domain `failed`. Minimal 1
    // target sukses (partial atau full) → status post TETAP `Published`,
    // tidak disentuh di sini.
    if (allTargetsFailed) {
      await this.repository.markPostFailed(
        { workspaceId: input.workspaceId, postId: input.postId },
        input.actingUserId,
      );
    }

    return record;
  }
}
