import { NotificationType } from "@social/shared";
import type { ConnectedAccountId, UserId, WorkspaceId } from "@social/shared";
import type { IOutstandAdapter } from "../adapters/outstand-adapter";
import type { IPublishingRepository } from "../repositories/publishing.repository";

/**
 * Webhook Outstand (T-026, ADR-020/ADR-040). Application Service yang
 * dipanggil Route Handler (`/api/webhooks/outstand`) SETELAH receipt
 * durable ter-persist (`OutstandWebhookEvent`, durable-before-ACK) —
 * Route Handler sendiri tidak boleh berisi business logic (AGENTS.md #5).
 *
 * **Penyesuaian pragmatis (dicatat eksplisit, BUKAN perubahan arsitektur):**
 * `integration-layer.md` mendeskripsikan pemrosesan async lewat JOB-01
 * (background job). T-027 (job runner + Railway Cron) belum dikerjakan sama
 * sekali, jadi TIDAK ada infrastruktur enqueue untuk JOB-01 — pemrosesan di
 * sini dipanggil INLINE secara sinkron oleh Route Handler, bukan
 * di-enqueue. Kalau T-027 nanti dikerjakan, pemanggilan `process()` ini
 * semestinya dipindah jadi job handler async (`WebhookProcessor.process`
 * tetap sama, hanya CALLER-nya yang berubah dari Route Handler langsung
 * menjadi job consumer) — ini known gap untuk dicatat Gibran Project
 * Manager, bukan ADR baru (T-026 checklist sendiri sudah menyebut urutan
 * "persist dulu, baru ACK, baru proses" tanpa menyebut JOB-01).
 *
 * Cross-domain (publishing → workspace, publishing → notification) lewat
 * port lokal (`WorkspaceReconnectPort`/`NotificationPort`), pola yang sama
 * dengan `ScheduledCountsPort`/`NotificationPort` di
 * `WorkspaceService` (AGENTS.md #7) — domain `publishing` TIDAK mengimpor
 * `WorkspaceService`/`NotificationService` konkret, composition root (Route
 * Handler) yang menyuplai instance lewat constructor.
 */

/** Bentuk event yang SUDAH diparse dari payload mentah Outstand — lihat `parseOutstandWebhookEvent` di route handler. */
export interface ParsedOutstandWebhookEvent {
  eventType: string;
  /** `post.published`/`post.error` — id post-level Outstand. */
  outstandPostId?: string;
  /** `account.token_expired` — id akun Outstand. */
  outstandAccountId?: string;
}

/** Port lokal cross-domain publishing → workspace (T-026.5) — lihat catatan `NotificationPort` di bawah untuk alasan pola ini. */
interface WorkspaceReconnectPort {
  markAccountReconnectRequired(outstandAccountId: string): Promise<{
    workspaceId: WorkspaceId;
    connectedAccountId: ConnectedAccountId;
    ownerUserId: UserId;
  } | null>;
}

/**
 * Port lokal cross-domain publishing → notification (T-026.4/.5, menutup
 * T-036.5 "Trigger notifikasi dari webhook publish result"). Opsional
 * (`undefined` di test) — pola sama seperti `NotificationPort` di
 * `WorkspaceService`.
 */
interface NotificationPort {
  notify(input: {
    workspaceId: WorkspaceId;
    userId: UserId;
    type: NotificationType;
    title: string;
    body: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }): Promise<unknown>;
}

export type OutstandWebhookProcessOutcome =
  "processed" | "ignored_unknown_event" | "skipped_no_match";

export interface OutstandWebhookProcessResult {
  outcome: OutstandWebhookProcessOutcome;
  detail?: string;
}

export class OutstandWebhookProcessor {
  constructor(
    private readonly repository: IPublishingRepository,
    private readonly outstandAdapter: IOutstandAdapter,
    private readonly workspace: WorkspaceReconnectPort,
    private readonly notifications?: NotificationPort,
  ) {}

  async process(
    event: ParsedOutstandWebhookEvent,
  ): Promise<OutstandWebhookProcessResult> {
    switch (event.eventType) {
      case "post.published":
      case "post.error":
        return this.handlePostOutcome(event);
      case "account.token_expired":
        return this.handleAccountTokenExpired(event);
      default:
        // Event type di luar kontrak MVP (T-026, integration-layer.md
        // "Daftar Event Webhook") — mis. comment.received/message.received
        // masa depan. Dicatat sebagai received tapi TIDAK diproses, BUKAN
        // error (route handler tetap ACK 2xx).
        return { outcome: "ignored_unknown_event" };
    }
  }

  private async handlePostOutcome(
    event: ParsedOutstandWebhookEvent,
  ): Promise<OutstandWebhookProcessResult> {
    if (!event.outstandPostId) {
      throw new Error(
        `Event "${event.eventType}" tidak membawa post id — payload webhook tidak valid.`,
      );
    }

    // Lookup DB (post/target) dan fetch outcome ke Outstand sama-sama hanya
    // bergantung pada `event.outstandPostId` — independen satu sama lain,
    // jadi dijalankan paralel (bukan sekuensial) supaya latency di hot path
    // webhook-ke-ACK tidak menumpuk round-trip DB + HTTP eksternal.
    const [post, outcomes] = await Promise.all([
      this.repository.findPostTargetsByOutstandPostId(event.outstandPostId),
      this.outstandAdapter.fetchPostOutcome(event.outstandPostId),
    ]);
    if (!post) {
      // Post tidak ditemukan (mis. sudah soft-delete, atau id tidak
      // dikenal) — bukan error internal, event ini tidak lagi actionable.
      return {
        outcome: "skipped_no_match",
        detail: `outstandPostId=${event.outstandPostId} tidak ditemukan`,
      };
    }

    const outcomeByOutstandAccountId = new Map(
      outcomes.map((outcome) => [outcome.outstandAccountId, outcome]),
    );

    const targetsToUpdate: Array<{
      target: (typeof post.targets)[number];
      outcome: NonNullable<ReturnType<typeof outcomeByOutstandAccountId.get>>;
    }> = [];
    for (const target of post.targets) {
      const outcome = outcomeByOutstandAccountId.get(target.outstandAccountId);
      // Outstand belum melaporkan outcome akun ini (mis. masih "pending" di
      // sisi mereka, atau webhook ini cuma menyangkut sebagian akun) —
      // biarkan status DB apa adanya, konsisten dengan pola
      // `PublishNowUseCase`.
      if (!outcome || outcome.status === "pending") {
        continue;
      }
      targetsToUpdate.push({ target, outcome });
    }

    // `Promise.allSettled` (bukan `for`+`await` sekuensial) supaya satu
    // target yang gagal ter-update (mis. error DB transient) TIDAK
    // menggagalkan seluruh loop di tengah jalan dan meninggalkan target
    // lain yang belum sempat dicoba — semua target tetap dicoba, lalu
    // kegagalan diagregasi dan di-throw di akhir supaya tetap terlihat
    // oleh caller (route.ts menandai receipt `failed`).
    const results = await Promise.allSettled(
      targetsToUpdate.map(({ target, outcome }) =>
        // `post.authorId` (hasil lookup di atas, dijamin non-null oleh
        // guard baseline di caller — post ini pernah schedule/publish,
        // bukan Imported/ADR-093) dipakai sebagai acting user untuk
        // `withCurrentUser` — repository method ini TIDAK ikut bypass RLS,
        // hanya lookup di atas yang bypass (lihat catatan interface-nya).
        this.repository.updateTargetOutcome(
          {
            postTargetId: target.postTargetId,
            // Non-"pending" sudah dijamin oleh filter di atas (baris
            // `outcome.status === "pending"` di loop pembentukan
            // `targetsToUpdate`) — narrowing per-elemen tidak ikut terbawa
            // lewat push ke array, jadi assert eksplisit di sini.
            status: outcome.status as "published" | "failed",
            platformPostId: outcome.platformPostId ?? undefined,
            platformPostUrl: outcome.platformPostUrl ?? undefined,
            error: outcome.error ?? undefined,
          },
          post.authorId,
        ),
      ),
    );

    const updatedCount = results.filter((r) => r.status === "fulfilled").length;
    const failures = results.filter(
      (r): r is PromiseRejectedResult => r.status === "rejected",
    );
    if (failures.length > 0) {
      throw new Error(
        `updateTargetOutcome gagal untuk ${failures.length}/${targetsToUpdate.length} target: ${failures
          .map((f) =>
            f.reason instanceof Error ? f.reason.message : String(f.reason),
          )
          .join("; ")}`,
      );
    }

    // Semua target yang SUDAH DIKETAHUI outcome-nya berstatus failed →
    // tandai post Failed (semantik sama dengan `PublishNowUseCase` /
    // integration-layer.md:269-270 "Semua target gagal setelah retry").
    // Target yang belum dilaporkan Outstand sama sekali (tidak ada di
    // `outcomeByOutstandAccountId`) dianggap BELUM diketahui, bukan gagal —
    // supaya event `post.published` yang hanya melaporkan sebagian akun
    // tidak salah menandai seluruh post Failed.
    const allKnownFailed =
      post.targets.length > 0 &&
      post.targets.every(
        (target) =>
          outcomeByOutstandAccountId.get(target.outstandAccountId)?.status ===
          "failed",
      );

    if (allKnownFailed) {
      await this.repository.markPostFailed(
        { workspaceId: post.workspaceId, postId: post.postId },
        post.authorId,
      );

      // Notifikasi (T-026.4, menutup T-036.5) — hanya untuk `post.error`
      // (kontrak resmi: "Semua target gagal setelah retry Outstand"),
      // bukan `post.published` yang kebetulan datang dengan semua target
      // gagal (skenario itu seharusnya memang dikirim Outstand sebagai
      // `post.error`, tapi guard ini tetap defensif kalau kontrak nyata
      // berbeda).
      if (event.eventType === "post.error") {
        await this.notifications?.notify({
          workspaceId: post.workspaceId,
          userId: post.authorId,
          type: NotificationType.PostPublishFailed,
          title: "Publikasi post gagal",
          body: "Semua akun tujuan gagal mempublikasikan post ini.",
          relatedEntityType: "post",
          relatedEntityId: post.postId,
        });
      }
    }

    return { outcome: "processed", detail: `${updatedCount} target diupdate` };
  }

  private async handleAccountTokenExpired(
    event: ParsedOutstandWebhookEvent,
  ): Promise<OutstandWebhookProcessResult> {
    if (!event.outstandAccountId) {
      throw new Error(
        `Event "${event.eventType}" tidak membawa account id — payload webhook tidak valid.`,
      );
    }

    const result = await this.workspace.markAccountReconnectRequired(
      event.outstandAccountId,
    );
    if (!result) {
      return {
        outcome: "skipped_no_match",
        detail: `outstandAccountId=${event.outstandAccountId} tidak ditemukan`,
      };
    }

    await this.notifications?.notify({
      workspaceId: result.workspaceId,
      userId: result.ownerUserId,
      type: NotificationType.AccountReconnectRequired,
      title: "Akun perlu dihubungkan ulang",
      body: "Salah satu akun media sosial workspace Anda kehabisan masa berlaku token dan perlu dihubungkan ulang.",
      relatedEntityType: "connected_account",
      relatedEntityId: result.connectedAccountId,
    });

    return { outcome: "processed" };
  }
}
