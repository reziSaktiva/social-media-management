import type { IOutstandAdapter } from "@social/shared";

/**
 * Hash string sederhana (FNV-1a 32-bit) — dipakai untuk menurunkan angka
 * mock yang DETERMINISTIK dari sebuah id (bukan `Math.random()`). Fidelitas
 * Fake adapter (ADR-059): instant, tanpa simulasi delay/gagal — dan untuk
 * T-041.5 (idempotensi), method fetch metrik WAJIB mengembalikan angka yang
 * sama persis untuk id yang sama supaya ingestion ulang periode yang sama
 * bisa dibuktikan menghasilkan baris yang identik, bukan cuma "tidak
 * bertambah baris".
 */
function hashToUint(seed: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Turunan angka deterministik 0..max-1 dari `seed` + `salt` (variasi field). */
function deterministicInt(seed: string, salt: string, max: number): number {
  return hashToUint(`${seed}:${salt}`) % max;
}

/**
 * Fake OutstandAdapter (ADR-059) — instant always-success, tanpa simulasi
 * delay, network call, webhook, atau skenario gagal. Dipakai otomatis oleh
 * factory `getOutstandAdapter` (`./index.ts`) selama `OUTSTAND_API_KEY`
 * kosong.
 *
 * Scope T-041 menambah `fetchPostMetrics`/`fetchWorkspaceMetrics` (Analytics)
 * di samping `schedulePost` (Publishing) yang sudah ada — keduanya
 * mengembalikan angka mock DETERMINISTIK (diturunkan dari id input), bukan
 * angka acak, supaya panggilan berulang untuk id/period yang sama
 * menghasilkan nilai yang identik (dibuktikan di test idempotensi
 * ingestion, T-041.5).
 */
export const fakeOutstandAdapter: IOutstandAdapter = {
  async schedulePost() {
    return { outstandJobId: `fake-${crypto.randomUUID()}` };
  },

  /**
   * Publish Now (T-029) — sama fidelitasnya dengan `schedulePost`: instant
   * always-success, tanpa simulasi delay/gagal. `publishedUrl` sengaja
   * bukan URL Outstand asli (Fake tidak pernah memanggil network) — hanya
   * placeholder deterministik dari `outstandJobId` supaya UI (T-034 detail
   * post) punya sesuatu yang bisa ditampilkan sebagai link "lihat di
   * platform" selama kredensial Outstand asli belum ada.
   */
  async publishNow() {
    const outstandJobId = `fake-${crypto.randomUUID()}`;
    return {
      outstandJobId,
      publishedUrl: `https://fake.outstand.local/posts/${outstandJobId}`,
    };
  },

  async fetchPostMetrics(outstandJobId) {
    const impressions =
      500 + deterministicInt(outstandJobId, "impressions", 4500);
    const reach = Math.round(impressions * 0.7);
    const likes = deterministicInt(outstandJobId, "likes", 300);
    const comments = deterministicInt(outstandJobId, "comments", 40);
    const shares = deterministicInt(outstandJobId, "shares", 20);
    const engagements = likes + comments + shares;
    const engagementRate =
      reach > 0 ? Number((engagements / reach).toFixed(4)) : 0;

    return {
      impressions,
      reach,
      likes,
      comments,
      shares,
      clicks: null,
      engagementRate,
    };
  },

  async fetchWorkspaceMetrics(outstandAccountId, period) {
    const seed = `${outstandAccountId}:${period}`;
    const totalPosts = 3 + deterministicInt(seed, "totalPosts", 15);
    const totalReach = 1000 + deterministicInt(seed, "totalReach", 49000);
    const totalEngagements = deterministicInt(seed, "totalEngagements", 3000);
    const avgEngagementRate =
      totalReach > 0 ? Number((totalEngagements / totalReach).toFixed(4)) : 0;

    return {
      totalPosts,
      totalReach,
      totalEngagements,
      avgEngagementRate,
    };
  },
};
