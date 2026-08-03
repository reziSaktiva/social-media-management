import type { IOutstandAdapter } from "@/domains/publishing";

/**
 * Fake OutstandAdapter (ADR-059) — instant always-success, tanpa simulasi
 * delay, network call, webhook, atau skenario gagal. Dipakai otomatis oleh
 * factory `getOutstandAdapter` (`./index.ts`) selama `OUTSTAND_API_KEY`
 * kosong, supaya fitur Schedule bisa persist ke database sungguhan
 * sebelum kredensial Outstand asli tersedia.
 */
export const fakeOutstandAdapter: IOutstandAdapter = {
  async schedulePost() {
    return { outstandJobId: `fake-${crypto.randomUUID()}` };
  },
};
