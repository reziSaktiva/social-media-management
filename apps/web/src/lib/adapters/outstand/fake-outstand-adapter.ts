import type {
  IOutstandAdapter,
  OutstandPostTargetInput,
  PostTargetOutcome,
} from "@social/shared";

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
 * State in-memory murni untuk mengingat SET AKUN yang diminta lewat
 * `schedulePost`/`publishNow`, supaya `fetchPostOutcome` (dipanggil
 * belakangan oleh use-case yang sama, mis. `PublishNowUseCase`) bisa
 * menjawab per akun TANPA use-case perlu tahu apa pun soal Fake secara
 * spesifik — use-case hanya bergantung pada `IOutstandAdapter` (ACL tetap
 * utuh). Ini BUKAN simulasi delay/proses async sungguhan (tetap
 * always-success instan, ADR-059) — murni memori supaya kontrak dua-langkah
 * (create lalu resolve outcome) tetap benar secara interface, konsisten
 * dengan bagaimana Outstand asli benar-benar menyimpan `accounts` di post.
 * Module-level Map ini cukup untuk proses tunggal (dev/test) — tidak perlu
 * persist lintas restart karena Fake bukan pengganti database. Dibatasi
 * `MAX_REMEMBERED_POSTS` dengan eviction FIFO (entry tertua dibuang lebih
 * dulu — urutan insersi `Map` dijamin oleh spec) supaya proses staging yang
 * berjalan lama (ADR-059 — Fake otomatis aktif tanpa `OUTSTAND_API_KEY`)
 * tidak menumpuk memory tanpa batas seiring bertambahnya post.
 */
const MAX_REMEMBERED_POSTS = 10_000;

const targetsByOutstandPostId = new Map<string, OutstandPostTargetInput[]>();

function rememberTargets(
  outstandPostId: string,
  targets: OutstandPostTargetInput[],
): void {
  if (targetsByOutstandPostId.size >= MAX_REMEMBERED_POSTS) {
    const oldestKey = targetsByOutstandPostId.keys().next().value;
    if (oldestKey !== undefined) {
      targetsByOutstandPostId.delete(oldestKey);
    }
  }

  targetsByOutstandPostId.set(outstandPostId, targets);
}

function buildOutcome(
  outstandPostId: string,
  outstandAccountId: string,
): PostTargetOutcome {
  const platformPostId = `fake-platform-post-${deterministicInt(
    `${outstandPostId}:${outstandAccountId}`,
    "platformPostId",
    1_000_000,
  )}`;

  return {
    outstandAccountId,
    status: "published",
    error: null,
    platformPostId,
    platformPostUrl: `https://fake.outstand.local/posts/${platformPostId}`,
    publishedAt: new Date(),
  };
}

/**
 * Fake OutstandAdapter (ADR-059) — instant always-success, tanpa simulasi
 * delay, network call, webhook, atau skenario gagal. Dipakai otomatis oleh
 * factory `getOutstandAdapter` (`./index.ts`) selama `OUTSTAND_API_KEY`
 * kosong.
 *
 * **Redesain 2026-08-26** — `schedulePost`/`publishNow` sekarang menerima
 * SEMUA target dalam satu call (kontrak baru `IOutstandAdapter`, lihat
 * `packages/shared/src/contracts/outstand-adapter.ts`) dan mengembalikan
 * SATU `outstandPostId`. `fetchPostOutcome` baru ditambahkan untuk resolve
 * status per akun belakangan — Fake mengingat set akun yang diminta
 * (lihat `targetsByOutstandPostId` di atas) supaya bisa menjawab per akun
 * dengan `status: "published"` instan (always-success, konsisten ADR-059 —
 * tidak ada pending yang benar-benar disimulasikan).
 */
export const fakeOutstandAdapter: IOutstandAdapter = {
  async schedulePost({ targets }) {
    const outstandPostId = `fake-post-${crypto.randomUUID()}`;
    rememberTargets(outstandPostId, targets);
    return { outstandPostId };
  },

  /**
   * Publish Now (T-029) — sama fidelitasnya: instant always-success, tanpa
   * simulasi delay/gagal, satu call untuk semua target.
   */
  async publishNow({ targets }) {
    const outstandPostId = `fake-post-${crypto.randomUUID()}`;
    rememberTargets(outstandPostId, targets);
    return { outstandPostId };
  },

  /**
   * Resolve status per akun (redesain 2026-08-26) — Fake always-success:
   * begitu `outstandPostId` dikenal (dari `schedulePost`/`publishNow`
   * sebelumnya), SEMUA akun yang tercatat langsung `published`. Kalau id
   * tidak dikenal (mis. test memanggil `fetchPostOutcome` langsung dengan
   * id sembarang), mengembalikan array kosong — konsisten dengan idempotency
   * yang menghindari klaim status untuk akun yang tidak diketahui.
   */
  async fetchPostOutcome(outstandPostId): Promise<PostTargetOutcome[]> {
    const targets = targetsByOutstandPostId.get(outstandPostId);
    if (!targets) {
      return [];
    }

    return targets.map((target) =>
      buildOutcome(outstandPostId, target.outstandAccountId),
    );
  },

  /**
   * Cancel Schedule (T-030, ADR-049 Tier 2) — sama fidelitasnya dengan
   * `schedulePost`/`publishNow`: instant always-success, tanpa simulasi
   * delay/gagal, tanpa network call. Tidak ada state eksternal untuk
   * dibersihkan (Fake tidak pernah membuat job eksternal), jadi cukup
   * resolve tanpa efek apa pun. Sekarang dipanggil SEKALI per post
   * (`outstandPostId`), bukan per target.
   */
  async cancelScheduledPost() {
    return undefined;
  },

  async fetchPostMetrics(outstandPostId) {
    const impressions =
      500 + deterministicInt(outstandPostId, "impressions", 4500);
    const reach = Math.round(impressions * 0.7);
    const likes = deterministicInt(outstandPostId, "likes", 300);
    const comments = deterministicInt(outstandPostId, "comments", 40);
    const shares = deterministicInt(outstandPostId, "shares", 20);
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
