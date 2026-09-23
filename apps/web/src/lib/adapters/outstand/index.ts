import type { IOutstandAdapter } from "@social/shared";
import { getServerEnv } from "@/lib/env";
import { fakeOutstandAdapter } from "./fake-outstand-adapter";
import { createRealOutstandAdapter } from "./real-outstand-adapter";

/**
 * Factory `OutstandAdapter` (ADR-040/ADR-059, real adapter T-025). Switch
 * mechanism: auto-detect dari env kosong. `IOutstandAdapter` sejak T-041
 * didefinisikan di `@social/shared` (promosi cross-domain, dulu di
 * `domains/publishing`) — satu factory ini dipakai baik oleh domain
 * `publishing` (`schedulePost`) maupun `analytics`
 * (`fetchPostMetrics`/`fetchWorkspaceMetrics`).
 *
 * - `OUTSTAND_API_KEY` kosong/undefined → Fake adapter (dev/staging tanpa
 *   kredensial Outstand asli, ADR-059).
 * - `OUTSTAND_API_KEY` terisi → `RealOutstandAdapter` (T-025), disuplai
 *   `appOrigin` (`BETTER_AUTH_URL`, dibutuhkan `connectAccount` untuk
 *   membentuk `redirectUri` callback) dan `OUTSTAND_API_BASE_URL` opsional
 *   (default placeholder di `outstand-http-client.ts` kalau kosong — lihat
 *   catatan asumsi base URL/skema auth di `real-outstand-adapter.ts`).
 *   Sebelumnya factory ini throw loud kalau env terisi tapi kode real
 *   adapter belum ada (ADR-059 poin 3) — sekarang kode itu SUDAH ada,
 *   throw loud itu tidak relevan lagi untuk kondisi ini.
 */
export function getOutstandAdapter(): IOutstandAdapter {
  const {
    OUTSTAND_API_KEY,
    OUTSTAND_API_BASE_URL,
    OUTSTAND_ORG_ID,
    BETTER_AUTH_URL,
  } = getServerEnv();

  if (!OUTSTAND_API_KEY) {
    return fakeOutstandAdapter;
  }

  return createRealOutstandAdapter(OUTSTAND_API_KEY, {
    appOrigin: BETTER_AUTH_URL,
    baseUrl: OUTSTAND_API_BASE_URL,
    orgId: OUTSTAND_ORG_ID,
  });
}
