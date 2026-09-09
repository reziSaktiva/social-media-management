import type {
  MemberRole,
  PostId,
  PostTargetId,
  WorkspaceId,
} from "@social/shared";
import type { UserId } from "@social/shared";
import { ConflictError, NotFoundError } from "@/lib/utils/errors";
import type { IOutstandAdapter } from "../adapters/outstand-adapter";
import { assertActorCanPublishNow } from "../rbac";
import type {
  IPublishingRepository,
  PublishingPostTargetStatus,
} from "../repositories/publishing.repository";

/** Hasil `RetryFailedTargetUseCase.execute` — dipakai Server Action untuk merefresh UI tanpa perlu full reload. */
export interface RetryFailedTargetResult {
  targetId: PostTargetId;
  status: PublishingPostTargetStatus;
  error: string | null;
  platformPostUrl: string | null;
}

/**
 * Retry manual untuk target publishing yang gagal (T-034.4, ADR-092).
 * Mengikuti pola use-case lain di domain ini (`PublishNowUseCase`,
 * `CancelScheduleUseCase`) — constructor mewajibkan `IOutstandAdapter`
 * secara tipe, RBAC dulu sebelum kerja lain. Satu-satunya call site saat
 * ini: `retryFailedTargetAction` di
 * `app/(app)/publish/history/[postId]/actions.ts`.
 *
 * **RBAC**: reuse `assertActorCanPublishNow` (Owner/Admin/Creator) — retry
 * adalah aksi publish langsung yang sama berisikonya dengan Publish Now
 * (tayang ke platform tanpa jeda koreksi), bukan level akses baru.
 *
 * **Keputusan scope (dikonfirmasi King Rezi, bukan asumsi)**: retry HANYA
 * me-recreate TARGET yang gagal (satu akun) — target lain di post yang
 * sama yang sudah `published` TIDAK disentuh/dihapus/di-recreate. Karena
 * itu use-case ini TIDAK memakai `PublishNowUseCase`/`repository.publishNow`
 * (yang me-replace SELURUH target post) — sebagai gantinya memanggil
 * `IOutstandAdapter.publishNow` langsung dengan array `targets` berisi 1
 * elemen, dan repository method granular per-target
 * (`getRetryTarget`/`resetTargetForRetry`/`setRetryOutstandPostId`/
 * `updateTargetOutcome`/`reconcilePostStatusAfterRetry`).
 *
 * **Pola ADR-092 (delete-lalu-create-ulang)**: Outstand tidak punya
 * endpoint retry resmi — dokumentasinya merekomendasikan hapus lalu buat
 * baru. Langkah "hapus" (`outstandAdapter.deletePost`) di sini best-effort
 * (try/catch, error di-log — bukan dilempar ke pemanggil), pola sama
 * persis dengan `cancelScheduledPost` di `CancelScheduleUseCase`.
 */
export class RetryFailedTargetUseCase {
  constructor(
    private readonly repository: IPublishingRepository,
    private readonly outstandAdapter: IOutstandAdapter,
  ) {}

  async execute(input: {
    workspaceId: WorkspaceId;
    postId: PostId;
    targetId: PostTargetId;
    /** RBAC — role actor yang sudah tervalidasi (sama aturan Publish Now). */
    actorRole: MemberRole;
    /** RLS (KI-026 follow-up) — acting user for `withCurrentUser`. */
    actingUserId: UserId;
  }): Promise<RetryFailedTargetResult> {
    assertActorCanPublishNow(input.actorRole);

    const target = await this.repository.getRetryTarget(
      {
        workspaceId: input.workspaceId,
        postId: input.postId,
        targetId: input.targetId,
      },
      input.actingUserId,
    );

    if (!target) {
      throw new NotFoundError("Target publishing tidak ditemukan di post ini.");
    }

    if (target.targetStatus !== "failed") {
      throw new ConflictError(
        "Retry hanya berlaku untuk target yang berstatus gagal.",
      );
    }

    // Delete best-effort (ADR-092) — `target.postOutstandPostId` adalah id
    // post-level dari create ORIGINAL (mencakup semua target awal,
    // termasuk target gagal ini, karena Outstand `create-a-post` menerima
    // SEMUA akun dalam satu call). Kalau `null` (mis. call
    // schedulePost/publishNow original gagal total SEBELUM sempat
    // mengembalikan id — lihat `markPostFailed`), tidak ada apa pun yang
    // pernah terdaftar di sisi Outstand untuk akun ini — skip panggilan
    // delete sepenuhnya alih-alih memanggilnya dengan id yang tidak ada
    // gunanya. Kalau ada, hapus HANYA akun target ini (`accountIds`)
    // supaya target lain yang sudah `published` di post yang sama tidak
    // ikut terhapus (keputusan scope single-target).
    if (target.postOutstandPostId) {
      try {
        await this.outstandAdapter.deletePost(target.postOutstandPostId, [
          target.outstandAccountId,
        ]);
      } catch (error) {
        console.error(
          `[RetryFailedTargetUseCase] postId=${input.postId} targetId=${input.targetId} outstandPostId=${target.postOutstandPostId} — deletePost gagal (best-effort, retry tetap dilanjutkan):`,
          error,
        );
      }
    }

    // Persist dulu (reset ke pending) sebelum network call recreate —
    // konsisten pola "persist dulu, network call sesudah" yang sudah
    // dipakai schedulePost/publishNow/cancelSchedule.
    await this.repository.resetTargetForRetry(
      { targetId: input.targetId },
      input.actingUserId,
    );

    let status: PublishingPostTargetStatus = "pending";
    let error: string | null = null;
    let platformPostUrl: string | null = null;

    try {
      const result = await this.outstandAdapter.publishNow({
        caption: target.caption,
        targets: [
          {
            outstandAccountId: target.outstandAccountId,
            contentFormat: target.contentFormat,
            platformOptions: target.platformOptions ?? undefined,
          },
        ],
      });

      await this.repository.setRetryOutstandPostId(
        {
          targetId: input.targetId,
          retryOutstandPostId: result.outstandPostId,
        },
        input.actingUserId,
      );

      // Retry dari halaman History selalu berarti aksi langsung — sama
      // seperti PublishNowUseCase, panggil fetchPostOutcome SEGERA supaya
      // UI mendapat outcome final tanpa menunggu polling/webhook (T-026)
      // belakangan.
      const outcomes = await this.outstandAdapter.fetchPostOutcome(
        result.outstandPostId,
      );
      const outcome = outcomes.find(
        (candidate) => candidate.outstandAccountId === target.outstandAccountId,
      );

      // Outstand belum melaporkan outcome akun ini (mis. masih "pending")
      // — biarkan status `pending` dari `resetTargetForRetry` tidak
      // diubah, sama semantik dengan PublishNowUseCase.
      if (outcome && outcome.status !== "pending") {
        await this.repository.updateTargetOutcome(
          {
            postTargetId: input.targetId,
            status: outcome.status,
            platformPostId: outcome.platformPostId ?? undefined,
            platformPostUrl: outcome.platformPostUrl ?? undefined,
            error: outcome.error ?? undefined,
          },
          input.actingUserId,
        );
        status = outcome.status;
        error = outcome.error;
        platformPostUrl = outcome.platformPostUrl;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await this.repository.updateTargetOutcome(
        { postTargetId: input.targetId, status: "failed", error: message },
        input.actingUserId,
      );
      status = "failed";
      error = message;
    }

    // Recompute status post: naik ke Published kalau tidak ada lagi
    // target `failed` (invariant HISTORY_TERMINAL_STATUSES, konsisten
    // PublishNowUseCase) — tetap Failed kalau retry gagal lagi.
    await this.repository.reconcilePostStatusAfterRetry(
      { workspaceId: input.workspaceId, postId: input.postId },
      input.actingUserId,
    );

    return { targetId: input.targetId, status, error, platformPostUrl };
  }
}
