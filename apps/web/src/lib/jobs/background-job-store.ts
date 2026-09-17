import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma/client";

/**
 * Persistence infra untuk `BackgroundJob` (T-027, `background-jobs.md`).
 * Sama pola dengan `outstandWebhookReceiptStore`
 * (`src/lib/webhooks/outstand-webhook-receipt-store.ts`): tabel
 * `background_jobs` system-internal, TIDAK memakai RLS (lihat catatan
 * "Tables intentionally WITHOUT workspace-isolation RLS" di migration
 * `20260813045625_t017_add_rls_policies`) — modul ini boleh memakai Prisma
 * langsung tanpa melanggar AGENTS.md #6 (yang melarang DOMAIN logic
 * mengimpor Prisma); ini infra, bukan domain logic, dan tidak butuh
 * `withCurrentUser`/`app.current_user_id` sama sekali untuk tabel ini
 * sendiri (beda dari tabel tenant-scoped seperti `publishing_posts` yang
 * job HANDLER-nya baca/tulis — itu tetap lewat `IPublishingRepository`
 * seperti biasa, lihat `ResolveScheduledPostOutcomeJobHandler`).
 */

export interface ClaimedBackgroundJob {
  id: string;
  type: string;
  payload: unknown;
  attempts: number;
  maxAttempts: number;
}

interface ClaimedJobRow {
  id: string;
  type: string;
  payload: unknown;
  attempts: number;
  max_attempts: number;
}

export const backgroundJobStore = {
  /** T-027.5 — dipanggil `job-scheduler.ts` (implementasi `IJobScheduler`). */
  async enqueue(input: {
    type: string;
    payload: Record<string, unknown>;
    scheduledAt: Date;
  }): Promise<void> {
    await prisma.backgroundJob.create({
      data: {
        type: input.type,
        payload: input.payload as Prisma.InputJsonValue,
        scheduledAt: input.scheduledAt,
      },
    });
  },

  /**
   * T-027.1 — klaim batch job `pending` yang sudah due
   * (`scheduled_at <= now()`), locking aman untuk eksekusi paralel via
   * `SELECT ... FOR UPDATE SKIP LOCKED` (BG-D03, `background-jobs.md` §
   * "Concurrency & Locking") — dua instance `web` (atau dua overlapping
   * cron trigger) yang memanggil ini bersamaan TIDAK akan mengambil job
   * yang sama. Prisma Client API tidak punya locking clause ini secara
   * native, jadi SELECT-nya raw SQL, tapi tetap dalam SATU
   * `$transaction` interaktif bersama `updateMany` supaya lock dipegang
   * sampai status berubah jadi `running` (mencegah race antara SELECT dan
   * UPDATE terpisah).
   */
  async claimPending(limit: number): Promise<ClaimedBackgroundJob[]> {
    return prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<ClaimedJobRow[]>`
        SELECT id, type, payload, attempts, max_attempts
        FROM "background_jobs"
        WHERE status = 'pending' AND scheduled_at <= now()
        ORDER BY created_at
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      `;

      if (rows.length === 0) {
        return [];
      }

      await tx.backgroundJob.updateMany({
        where: { id: { in: rows.map((row) => row.id) } },
        data: { status: "running", startedAt: new Date() },
      });

      return rows.map((row) => ({
        id: row.id,
        type: row.type,
        payload: row.payload,
        attempts: row.attempts,
        maxAttempts: row.max_attempts,
      }));
    });
  },

  /** T-027.1 — handler berhasil, tidak ada lagi yang perlu dilakukan untuk job ini. */
  async markDone(id: string): Promise<void> {
    await prisma.backgroundJob.update({
      where: { id },
      data: { status: "done", completedAt: new Date(), lastError: null },
    });
  },

  /**
   * T-027.3 — retry internal dengan backoff: `attempts` sudah
   * di-increment oleh caller (`job-runner.ts`, sebelum menghitung delay),
   * status kembali ke `pending` dengan `scheduled_at` baru (`now() + delay`)
   * supaya `claimPending` berikutnya (setelah delay lewat) mengambilnya
   * lagi — BUKAN dieksekusi ulang segera.
   */
  async scheduleRetry(
    id: string,
    input: { attempts: number; scheduledAt: Date; error: string },
  ): Promise<void> {
    await prisma.backgroundJob.update({
      where: { id },
      data: {
        status: "pending",
        attempts: input.attempts,
        scheduledAt: input.scheduledAt,
        lastError: input.error,
      },
    });
  },

  /**
   * T-027.3 — dead letter: `attempts >= maxAttempts`, tidak ada retry
   * otomatis lagi (BG-D06, `background-jobs.md`). Monitoring MVP murni
   * manual (query `status = 'failed'` / Railway dashboard), tidak ada
   * alerting di sini.
   */
  async markFailed(
    id: string,
    input: { attempts: number; error: string },
  ): Promise<void> {
    await prisma.backgroundJob.update({
      where: { id },
      data: {
        status: "failed",
        attempts: input.attempts,
        completedAt: new Date(),
        lastError: input.error,
      },
    });
  },
};
