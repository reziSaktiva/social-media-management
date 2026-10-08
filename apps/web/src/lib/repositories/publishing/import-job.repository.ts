import type {
  IImportJobRepository,
  ImportSyncJobPayload,
  ImportSyncJobRecord,
} from "@/domains/publishing/repositories/import-job.repository";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma/client";

const IMPORT_SYNC_JOB_TYPE = "import.sync";
const ACTIVE_STATUSES = ["pending", "running"] as const;

/**
 * Prisma implementation of `IImportJobRepository` (T-090, ADR-093 poin
 * 7-9) — backed by `background_jobs` (`type: "import.sync"`), reuse pola
 * ADR-093 "Alternatives Considered" (tidak ada skema counter baru).
 * `background_jobs` TIDAK punya RLS (system-internal queue, lihat
 * migration T-017) — plain `prisma` client, bukan `withCurrentUser`.
 */
export const importJobRepository: IImportJobRepository = {
  async createImportSyncJob(
    payload: ImportSyncJobPayload,
  ): Promise<ImportSyncJobRecord> {
    const job = await prisma.backgroundJob.create({
      data: {
        type: IMPORT_SYNC_JOB_TYPE,
        payload: payload as unknown as Prisma.InputJsonValue,
        status: "pending",
      },
    });

    return {
      id: job.id,
      payload: job.payload as unknown as ImportSyncJobPayload,
      status: job.status as ImportSyncJobRecord["status"],
      createdAt: job.createdAt,
    };
  },

  async markImportSyncJobStatus(jobId, status, lastError) {
    await prisma.backgroundJob.update({
      where: { id: jobId },
      data: {
        status,
        lastError: lastError ?? null,
        completedAt:
          status === "done" || status === "failed" ? new Date() : undefined,
        startedAt: status === "running" ? new Date() : undefined,
      },
    });
  },

  async hasActiveImportSyncJob(connectedAccountId) {
    const count = await prisma.backgroundJob.count({
      where: {
        type: IMPORT_SYNC_JOB_TYPE,
        status: { in: [...ACTIVE_STATUSES] },
        payload: {
          path: ["connectedAccountId"],
          equals: connectedAccountId,
        },
      },
    });

    return count > 0;
  },

  async countManualImportSyncJobsSince(workspaceId, since) {
    return prisma.backgroundJob.count({
      where: {
        type: IMPORT_SYNC_JOB_TYPE,
        createdAt: { gte: since },
        payload: {
          path: ["workspaceId"],
          equals: workspaceId,
        },
        AND: [
          {
            payload: {
              path: ["trigger"],
              equals: "manual",
            },
          },
        ],
      },
    });
  },
};
