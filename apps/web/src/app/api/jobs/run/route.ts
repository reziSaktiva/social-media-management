import { NextResponse } from "next/server";
import {
  OutstandWebhookProcessor,
  RESOLVE_SCHEDULED_POST_OUTCOME_JOB_TYPE,
  ResolveScheduledPostOutcomeJobHandler,
} from "@/domains/publishing";
import { NotificationService } from "@/domains/notification";
import { getOutstandAdapter } from "@/lib/adapters/outstand";
import { getServerEnv } from "@/lib/env";
import { backgroundJobStore } from "@/lib/jobs/background-job-store";
import { runPendingJobs, type JobHandler } from "@/lib/jobs/job-runner";
import { notificationRepository } from "@/lib/repositories/notification";
import { publishingRepository } from "@/lib/repositories/publishing";
import { workspaceRepository } from "@/lib/repositories/workspace";

/**
 * Job runner Route Handler (T-027.1/.2, ADR-022/`background-jobs.md`).
 * Dipanggil Railway Cron (`cron` service, `railway.cron.json`) secara
 * periodik — TIDAK boleh dipanggil publik (T-027.2).
 *
 * Route Handler ini TIDAK boleh berisi business logic (AGENTS.md #5) —
 * hanya: (1) otentikasi header, (2) merakit handler registry dari
 * Application Service tiap domain (composition root, sama pola dengan
 * `/api/webhooks/outstand/route.ts` merakit `OutstandWebhookProcessor`),
 * (3) delegasi eksekusi ke `runPendingJobs` (`@/lib/jobs/job-runner`, murni
 * orkestrasi generik claim/retry/dead-letter).
 *
 * Registry HANYA berisi SATU job type untuk saat ini —
 * `RESOLVE_SCHEDULED_POST_OUTCOME_JOB_TYPE` (T-027.5). JOB-01 (webhook
 * processing) SENGAJA TETAP inline sync di
 * `/api/webhooks/outstand/route.ts` (lihat catatan gap di
 * `OutstandWebhookProcessor`) — memindahkannya ke enqueue+async lewat
 * registry ini adalah perluasan scope T-027 yang signifikan dan belum
 * dikonfirmasi King Rezi, JANGAN ditambahkan diam-diam di sini.
 */
export async function POST(request: Request): Promise<Response> {
  const { JOB_SECRET } = getServerEnv();
  const providedSecret = request.headers.get("x-job-secret");

  if (!JOB_SECRET || !providedSecret || providedSecret !== JOB_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const webhookProcessor = new OutstandWebhookProcessor(
    publishingRepository,
    getOutstandAdapter(),
    workspaceRepository,
    new NotificationService(notificationRepository),
  );
  const resolveScheduledPostOutcomeHandler =
    new ResolveScheduledPostOutcomeJobHandler(webhookProcessor);

  const handlers: Record<string, JobHandler> = {
    [RESOLVE_SCHEDULED_POST_OUTCOME_JOB_TYPE]: (payload) =>
      resolveScheduledPostOutcomeHandler.handle(payload),
  };

  const summary = await runPendingJobs(backgroundJobStore, handlers);

  return NextResponse.json({ ok: true, ...summary }, { status: 200 });
}
