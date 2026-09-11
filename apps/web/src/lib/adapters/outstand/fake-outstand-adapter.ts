import type {
  ConnectAccountInput,
  ConnectAccountResult,
  ConnectedAccountData,
  ExchangeConnectCodeInput,
  IOutstandAdapter,
  OutstandPostTargetInput,
  PostTargetOutcome,
} from "@social/shared";
import { SocialPlatform } from "@social/shared";

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
 * Payload yang dibawa lewat `state` sepanjang loopback OAuth (ADR-105) —
 * cukup untuk CSRF-check sederhana (`nonce`, dicocokkan sisi Route Handler
 * lewat cookie/session, di luar scope adapter ini) + informasi yang
 * dibutuhkan callback untuk tahu workspace/platform/mode (connect baru vs
 * reconnect) tanpa perlu state server-side tambahan di Fake ini.
 */
interface FakeConnectState {
  workspaceId: string;
  platform: SocialPlatform;
  redirectAccountId?: string;
  nonce: string;
}

/**
 * Encode/decode `state` sebagai base64url JSON — bukan JWT bertanda tangan
 * sungguhan (Fake tidak butuh keamanan produksi, ADR-059: fidelitas
 * instan tanpa simulasi), murni supaya `state` tetap satu string opaque
 * sesuai bentuk kontrak `ExchangeConnectCodeInput`, konsisten dengan cara
 * Outstand asli membawa `state` bolak-balik lewat redirect browser.
 */
function encodeFakeState(state: FakeConnectState): string {
  return Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
}

function decodeFakeState(state: string): FakeConnectState {
  try {
    return JSON.parse(
      Buffer.from(state, "base64url").toString("utf8"),
    ) as FakeConnectState;
  } catch {
    throw new Error(
      "Fake OutstandAdapter: state tidak valid/rusak (exchangeConnectCode).",
    );
  }
}

/** Handle dummy realistis per platform (T-013/T-015.3) — deterministik dari seed supaya stabil dipanggil ulang di test. */
function buildFakeHandle(platform: SocialPlatform, seed: string): string {
  const suffix = deterministicInt(seed, "handle", 10_000);
  const handlesByPlatform: Record<SocialPlatform, string> = {
    [SocialPlatform.Instagram]: `@fake.ig.${suffix}`,
    [SocialPlatform.Facebook]: `Fake Page ${suffix}`,
    [SocialPlatform.Twitter]: `@fake_x_${suffix}`,
    [SocialPlatform.LinkedIn]: `Fake Company ${suffix}`,
    [SocialPlatform.TikTok]: `@fake.tiktok.${suffix}`,
    [SocialPlatform.YouTube]: `Fake Channel ${suffix}`,
    [SocialPlatform.Threads]: `@fake.threads.${suffix}`,
    [SocialPlatform.Pinterest]: `Fake Pinterest ${suffix}`,
  };
  return handlesByPlatform[platform];
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
  /**
   * Connect Account (T-013.1/T-013.2, T-015.3 Reconnect, ADR-105) — Fake
   * TIDAK pernah redirect ke domain eksternal manapun. `redirectUrl` yang
   * dikembalikan adalah path RELATIF ke callback route kita sendiri
   * (`/api/integrations/outstand/callback`) supaya browser cukup
   * navigasi ke origin app yang sedang berjalan (tidak butuh env
   * `APP_URL`/base URL apa pun) — loopback ini sengaja (bukan skip
   * langsung ke sukses instan) supaya Route Handler callback tetap
   * teruji end-to-end sebelum real adapter (T-025) masuk, lihat ADR-105.
   */
  async connectAccount({
    workspaceId,
    platform,
    redirectAccountId,
  }: ConnectAccountInput): Promise<ConnectAccountResult> {
    const state = encodeFakeState({
      workspaceId,
      platform,
      redirectAccountId,
      nonce: crypto.randomUUID(),
    });
    const code = `fake-code-${crypto.randomUUID()}`;

    const redirectUrl = `/api/integrations/outstand/callback?code=${encodeURIComponent(
      code,
    )}&state=${encodeURIComponent(state)}`;

    return { redirectUrl };
  },

  /**
   * Connect Account (T-013.1/T-013.2, T-015.3 Reconnect, ADR-105) — Fake
   * always-success instan: `code` diterima apa adanya (dibuat sendiri
   * oleh `connectAccount` di atas, tidak diverifikasi lebih lanjut —
   * Fake tidak menyimpan daftar code yang pernah diterbitkan), `state`
   * di-decode untuk menentukan `platform` hasil koneksi. `outstandAccountId`
   * deterministik dari `state` supaya reconnect akun yang sama (state
   * membawa `redirectAccountId` yang sama) menghasilkan handle yang
   * konsisten dipanggil ulang — bukan acak setiap kali.
   */
  async exchangeConnectCode({
    code,
    state,
  }: ExchangeConnectCodeInput): Promise<ConnectedAccountData> {
    const decoded = decodeFakeState(state);
    const seed = decoded.redirectAccountId ?? `${decoded.workspaceId}:${code}`;

    return {
      outstandAccountId: `fake-account-${deterministicInt(
        seed,
        "outstandAccountId",
        1_000_000,
      )}`,
      platform: decoded.platform,
      handle: buildFakeHandle(decoded.platform, seed),
      status: "active",
    };
  },

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

  /**
   * Retry manual (T-034.4, ADR-092) — sama fidelitasnya dengan
   * `cancelScheduledPost`: instant no-op sukses, tanpa simulasi delay/gagal,
   * tanpa network call. Fake tidak menyimpan state Outstand asli untuk
   * benar-benar "dihapus" — cukup lupakan target yang dihapus dari memori
   * `targetsByOutstandPostId` supaya `fetchPostOutcome` berikutnya untuk
   * `outstandPostId` yang sama tidak lagi melaporkan akun yang sudah
   * dihapus itu, konsisten dengan perilaku Outstand asli pasca-delete.
   *
   * `accountIds` kosong/undefined menghapus SELURUH target yang tercatat
   * untuk `outstandPostId` ini (post-level delete) — kalau diisi, hanya
   * target dengan `outstandAccountId` yang cocok yang dilupakan (selaras
   * keputusan scope T-034.4: retry single-target, target lain tidak
   * disentuh).
   */
  async deletePost(outstandPostId, accountIds) {
    const targets = targetsByOutstandPostId.get(outstandPostId);
    if (!targets) {
      return undefined;
    }

    if (!accountIds || accountIds.length === 0) {
      targetsByOutstandPostId.delete(outstandPostId);
      return undefined;
    }

    const remaining = targets.filter(
      (target) => !accountIds.includes(target.outstandAccountId),
    );

    if (remaining.length === 0) {
      targetsByOutstandPostId.delete(outstandPostId);
    } else {
      targetsByOutstandPostId.set(outstandPostId, remaining);
    }

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
