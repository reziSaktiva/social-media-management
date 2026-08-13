import type { IOutstandAdapter } from "@social/shared";
import { getServerEnv } from "@/lib/env";
import { fakeOutstandAdapter } from "./fake-outstand-adapter";

/**
 * Factory `OutstandAdapter` (ADR-040/ADR-059). Switch mechanism: auto-detect
 * dari env kosong. `IOutstandAdapter` sejak T-041 didefinisikan di
 * `@social/shared` (promosi cross-domain, dulu di `domains/publishing`) —
 * satu factory ini dipakai baik oleh domain `publishing` (`schedulePost`)
 * maupun `analytics` (`fetchPostMetrics`/`fetchWorkspaceMetrics`).
 *
 * - `OUTSTAND_API_KEY` kosong/undefined → Fake adapter (dev/staging tanpa
 *   kredensial Outstand asli).
 * - `OUTSTAND_API_KEY` terisi → real adapter belum diimplementasikan;
 *   throw jelas daripada diam-diam tetap memakai Fake.
 */
export function getOutstandAdapter(): IOutstandAdapter {
  const { OUTSTAND_API_KEY } = getServerEnv();

  if (!OUTSTAND_API_KEY) {
    return fakeOutstandAdapter;
  }

  throw new Error(
    "OUTSTAND_API_KEY terisi tapi real OutstandAdapter belum diimplementasikan " +
      "(ADR-040/ADR-059). Kosongkan OUTSTAND_API_KEY di .env.local kalau ingin " +
      "memakai Fake adapter untuk development.",
  );
}
