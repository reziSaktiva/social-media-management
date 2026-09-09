import { NextResponse } from "next/server";
import type { ParsedOutstandWebhookEvent } from "@/domains/publishing";
import { OutstandWebhookProcessor } from "@/domains/publishing";
import { NotificationService } from "@/domains/notification";
import { getOutstandAdapter } from "@/lib/adapters/outstand";
import {
  fingerprintRawBody,
  parseOutstandWebhookPayload,
} from "@/lib/adapters/outstand/parse-webhook-payload";
import { verifyOutstandWebhookSignature } from "@/lib/adapters/outstand/verify-webhook-signature";
import { getServerEnv } from "@/lib/env";
import { notificationRepository } from "@/lib/repositories/notification";
import { publishingRepository } from "@/lib/repositories/publishing";
import { workspaceRepository } from "@/lib/repositories/workspace";
import { outstandWebhookReceiptStore } from "@/lib/webhooks/outstand-webhook-receipt-store";

/**
 * Webhook handler Outstand (T-026, ADR-020/ADR-040). Route Handler — TIDAK
 * boleh berisi business logic (AGENTS.md #5): hanya membaca raw body,
 * verifikasi HMAC, durable-before-ACK persist, lalu delegasi pemrosesan ke
 * `OutstandWebhookProcessor` (Application Service, domain `publishing`).
 *
 * **Alur (`integration-layer.md` § "Alur Pemrosesan Webhook", dengan SATU
 * penyesuaian pragmatis eksplisit — lihat catatan di
 * `OutstandWebhookProcessor`):**
 * 1. Baca raw body (`request.text()` — signature Outstand dihitung atas
 *    byte mentah, bukan hasil re-serialize JSON).
 * 2. Verifikasi HMAC-SHA256 `X-Outstand-Signature` atas raw body. Tolak
 *    `401` kalau `OUTSTAND_WEBHOOK_SECRET` kosong (bukan silent-skip — HMAC
 *    adalah crypto asli, beda dari Fake adapter ADR-059 yang auto-switch
 *    untuk network call) ATAU signature tidak valid.
 * 3. Idempotent insert ke `OutstandWebhookEvent` (T-026.6) — duplicate
 *    valid langsung `200` tanpa proses ulang.
 * 4. Proses event via `OutstandWebhookProcessor.process()` — SINKRON
 *    inline (T-027 job runner belum ada, lihat catatan di processor).
 * 5. Update status receipt (`processed`/`failed`), tapi tetap ACK `2xx`
 *    selama receipt di langkah 3 sudah persist (kegagalan PEMROSESAN,
 *    bukan PERSISTENSI, tidak meminta Outstand mengirim ulang —
 *    `integration-layer.md`:332).
 */
export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();

  const { OUTSTAND_WEBHOOK_SECRET } = getServerEnv();
  if (!OUTSTAND_WEBHOOK_SECRET) {
    // Tolak — bukan skenario Fake adapter (ADR-059) auto-switch. HMAC
    // adalah crypto asli yang tidak bisa diverifikasi tanpa secret sama
    // sekali, jadi kosong berarti tolak, bukan "anggap valid".
    return NextResponse.json(
      { error: "Webhook secret belum dikonfigurasi." },
      { status: 401 },
    );
  }

  const signatureHeader = request.headers.get("x-outstand-signature");
  const signatureValid = verifyOutstandWebhookSignature(
    rawBody,
    signatureHeader,
    OUTSTAND_WEBHOOK_SECRET,
  );
  if (!signatureValid) {
    return NextResponse.json(
      { error: "Signature tidak valid." },
      { status: 401 },
    );
  }

  let outstandEventId: string;
  let eventType = "unknown";
  let parsedEvent: ParsedOutstandWebhookEvent | null = null;
  try {
    const parsed = parseOutstandWebhookPayload(rawBody);
    outstandEventId = parsed.outstandEventId;
    eventType = parsed.event.eventType;
    parsedEvent = parsed.event;
  } catch {
    // Payload tidak valid (bukan JSON / tidak punya field "event") —
    // fingerprint raw body tetap dipakai sebagai identity receipt supaya
    // durable-before-ACK (langkah 3) tetap terpenuhi walau payload rusak.
    outstandEventId = fingerprintRawBody(rawBody);
  }

  let receipt: { id: string; isNew: boolean };
  try {
    receipt = await outstandWebhookReceiptStore.insertIfNew({
      outstandEventId,
      eventType,
      rawBody,
    });
  } catch {
    // Kegagalan PERSISTENSI (mis. DB down) — non-2xx supaya Outstand retry
    // delivery (integration-layer.md § "Alur Pemrosesan Webhook").
    return NextResponse.json(
      { error: "Gagal menyimpan receipt webhook." },
      { status: 503 },
    );
  }

  if (!receipt.isNew) {
    // Duplicate event (T-026.6) — sudah pernah diterima & (pernah) diproses
    // sebelumnya, ACK langsung tanpa memproses ulang efeknya.
    return NextResponse.json({ ok: true, duplicate: true }, { status: 200 });
  }

  if (!parsedEvent) {
    await outstandWebhookReceiptStore.markFailed(
      receipt.id,
      'Payload webhook tidak valid (bukan JSON / tidak punya field "event").',
    );
    // Receipt SUDAH persist (langkah 3) — ACK 2xx walau pemrosesan gagal,
    // konsisten dengan prinsip retry-boundary di integration-layer.md:332.
    return NextResponse.json({ ok: true, processed: false }, { status: 200 });
  }

  const processor = new OutstandWebhookProcessor(
    publishingRepository,
    getOutstandAdapter(),
    workspaceRepository,
    new NotificationService(notificationRepository),
  );

  try {
    const result = await processor.process(parsedEvent);
    if (result.outcome !== "processed") {
      // `outcome`/`detail` sebelumnya di-discard sepenuhnya di sini —
      // receipt tetap ditandai `processed` (bukan error, ini bukan
      // kegagalan), tapi log supaya `ignored_unknown_event`/
      // `skipped_no_match` tetap terlihat di server log, bukan menghilang
      // tanpa jejak observability sama sekali.
      console.log(
        `[outstand-webhook] receipt ${receipt.id}: ${result.outcome}${result.detail ? ` (${result.detail})` : ""}`,
      );
    }
    await outstandWebhookReceiptStore.markProcessed(receipt.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Receipt row (DB) menyimpan pesan gagal, tapi itu pasif — tidak ada
    // yang secara aktif memonitor tabel itu. Log server (Railway log
    // aggregation) supaya kegagalan pemrosesan (termasuk pelanggaran
    // data-integrity cross-tenant dari guard repository) setidaknya
    // terlihat, bukan cuma diam di baris DB yang tidak pernah dilihat siapa
    // pun sampai ada yang mencari secara manual.
    console.error(
      `[outstand-webhook] processing gagal untuk receipt ${receipt.id}: ${message}`,
    );
    await outstandWebhookReceiptStore.markFailed(receipt.id, message);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
