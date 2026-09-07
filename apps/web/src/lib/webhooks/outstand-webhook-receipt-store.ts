import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma/client";

/**
 * Durable-before-ACK persistence untuk `OutstandWebhookEvent` (T-026.2/.6,
 * `integration-layer.md` § "Idempotency"). Statuses mengikuti dokumentasi:
 * `received | processing | processed | failed | dead_lettered` (kolom
 * `status`, default `"received"` di schema — `dead_lettered` belum dipakai
 * modul ini, disiapkan untuk T-027 retry backoff).
 *
 * Bukan domain logic — tabel `outstand_webhook_events` system-internal,
 * tidak dimiliki bounded context manapun dan TIDAK memakai RLS (lihat
 * catatan "Tables intentionally WITHOUT workspace-isolation RLS" di
 * migration `20260813045625_t017_add_rls_policies`) — modul ini boleh
 * memakai Prisma langsung tanpa melanggar AGENTS.md #6 (yang melarang
 * DOMAIN logic mengimpor Prisma), sama seperti `src/lib/prisma/*` sendiri
 * bukan domain logic.
 */
export const outstandWebhookReceiptStore = {
  /**
   * Insert idempoten by `outstandEventId` (unique constraint). Kalau baris
   * sudah ada (duplicate delivery Outstand, T-026.6), TIDAK insert ulang —
   * `isNew: false` memberi tahu caller (route handler) supaya langsung ACK
   * `2xx` TANPA memproses ulang efeknya.
   */
  async insertIfNew(input: {
    outstandEventId: string;
    eventType: string;
    rawBody: string;
  }): Promise<{ id: string; isNew: boolean }> {
    try {
      const created = await prisma.outstandWebhookEvent.create({
        data: {
          outstandEventId: input.outstandEventId,
          eventType: input.eventType,
          rawBody: input.rawBody,
        },
        select: { id: true },
      });
      return { id: created.id, isNew: true };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const existing = await prisma.outstandWebhookEvent.findUniqueOrThrow({
          where: { outstandEventId: input.outstandEventId },
          select: { id: true },
        });
        return { id: existing.id, isNew: false };
      }
      throw error;
    }
  },

  async markProcessed(id: string): Promise<void> {
    await prisma.outstandWebhookEvent.update({
      where: { id },
      data: { status: "processed", processedAt: new Date(), lastError: null },
    });
  },

  async markFailed(id: string, error: string): Promise<void> {
    await prisma.outstandWebhookEvent.update({
      where: { id },
      data: {
        status: "failed",
        lastError: error,
        processingAttempts: { increment: 1 },
      },
    });
  },
};
