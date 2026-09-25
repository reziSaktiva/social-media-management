import type {
  ConfirmFacebookPagesInput,
  ConfirmFacebookPagesResult,
  ConnectAccountInput,
  ConnectAccountResult,
  ConnectCallbackInput,
  ConnectedAccountData,
  FetchCommentsResult,
  IOutstandAdapter,
  InboxCommentData,
  ListPendingFacebookPagesResult,
  PinterestBoard,
  PostTargetOutcome,
  ReplyToCommentResult,
  UploadMediaWorkingCopyResult,
} from "@social/shared";
import { SocialPlatform } from "@social/shared";
import { parseBase64UrlJson } from "./connect-state";

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
  // Parse mentah base64url→JSON di-reuse dari `connect-state.ts` (dipakai
  // juga oleh Route Handler/Server Action) — hanya SATU implementasi
  // encoding raw ini yang perlu tetap sinkron dengan `encodeFakeState` di
  // atas, bukan dua decoder terpisah.
  return parseBase64UrlJson(state) as FakeConnectState;
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
 * TTL mock untuk `uploadMediaWorkingCopy` (T-024.3, ADR-106) — nilai
 * arbitrer 24 jam, murni supaya `expiresAt` yang dikembalikan Fake masuk
 * akal (bukan langsung expired/`0`) untuk UI yang menampilkannya; Outstand
 * asli menentukan TTL sesungguhnya (di luar kendali Fake).
 */
const FAKE_MEDIA_WORKING_COPY_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Template konten komentar palsu (T-051, Engagement MVP) — sekadar variasi
 * teks realistis, dipilih deterministik via `deterministicInt` supaya
 * komentar yang sama muncul lagi di sync berikutnya (bukan generate baru
 * tiap panggilan — lihat catatan panjang di `fetchComments` di bawah soal
 * kenapa itu justru desain yang benar untuk idempotency, bukan bug).
 */
const FAKE_COMMENT_TEMPLATES = [
  "Kapan promo ini berlaku lagi ya min?",
  "Suka banget produknya, kualitasnya oke!",
  "Ada varian/rasa lain gak untuk yang ini?",
  "Boleh minta rekomendasi produk serupa?",
  "Pengiriman ke luar kota bisa gak ya?",
];

/**
 * Satu komentar palsu deterministik untuk `outstandPostId` + `index`
 * tertentu (redesain KI-068/ADR-113 — dulu keyed by `outstandAccountId`,
 * sekarang keyed by `outstandPostId` karena `fetchComments` di-scope per
 * post) — `outstandCommentId` stabil (bukan `crypto.randomUUID()` seperti
 * `schedulePost`/`publishNow`) SENGAJA: JOB-03 (sync tiap 30 menit) dan
 * manual refresh (T-052) memanggil `fetchComments` berkali-kali untuk
 * `outstandPostId` yang sama, dan upsert idempoten di `EngagementService`
 * bergantung pada `externalId` (=`outstandCommentId`) yang SAMA supaya
 * tidak menggandakan baris `EngagementInboxItem` tiap sync (persis
 * kebutuhan "wajib idempoten" di T-051). `platform` diterima apa adanya
 * dari caller (bukan lagi derivasi deterministik) — konsisten dengan real
 * adapter yang juga tidak bisa menebak platform sendiri.
 */
function buildFakeComment(
  outstandPostId: string,
  platform: SocialPlatform,
  index: number,
): InboxCommentData {
  const seed = `${outstandPostId}:comment:${index}`;
  const templateIndex = deterministicInt(
    seed,
    "template",
    FAKE_COMMENT_TEMPLATES.length,
  );
  const authorSuffix = deterministicInt(seed, "author", 10_000);
  const minutesAgo = deterministicInt(seed, "receivedAt", 240);

  return {
    outstandCommentId: `fake-comment-${outstandPostId}-${index}`,
    platform,
    authorHandle: `@fake.user.${authorSuffix}`,
    content: FAKE_COMMENT_TEMPLATES[templateIndex],
    outstandPostId,
    receivedAt: new Date(Date.now() - minutesAgo * 60_000),
  };
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
 * 3 fixture Facebook Page tetap (T-025.4, ADR-115) — SENGAJA sama persis
 * (nama) dengan draft desain King Rezi yang sudah CONFIRMED di Claude
 * Design (`templates/settings-connect-facebook-pages.html`), supaya
 * QA/demo Fake adapter konsisten dengan apa yang sudah direview King Rezi
 * — bukan fixture generik `deterministicInt` per `sessionToken` seperti
 * pola `buildFakeHandle` (ADR-115 poin 5 membuka opsi itu, tapi 3 fixture
 * TETAP lebih berguna di sini karena Page-nya memang sengaja selalu sama,
 * bukan bervariasi per akun/token seperti handle single-page).
 */
const FAKE_FACEBOOK_PAGE_FIXTURES: ReadonlyArray<{
  pageId: string;
  name: string;
  category: string;
}> = [
  {
    pageId: "fake-fb-page-kopi-selasar",
    name: "Kopi Selasar",
    category: "Coffee Shop",
  },
  {
    pageId: "fake-fb-page-kopi-selasar-cabang-selatan",
    name: "Kopi Selasar — Cabang Selatan",
    category: "Coffee Shop",
  },
  {
    pageId: "fake-fb-page-roti-selasar",
    name: "Roti Selasar",
    category: "Bakery",
  },
];

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
 * status per akun belakangan.
 *
 * **Bug fix T-027 (root-cause, 2026-09-17)** — `fetchPostOutcome` SEMPAT
 * "mengingat" set akun per `outstandPostId` lewat `Map` in-memory
 * level-modul yang diisi `schedulePost`/`publishNow`. Ini SALAH untuk job
 * runner Railway Cron (T-027): `schedulePost()` dipanggil dari Server
 * Action, `fetchPostOutcome()` dipanggil belakangan (bisa berjam-jam) dari
 * Route Handler TERPISAH (`/api/jobs/run`) yang, dibuktikan lewat inspeksi
 * `.next/server` build production, mendapat SALINAN modul ini sendiri
 * (chunk terpisah dari Server Action) — `Map` level-modul TIDAK dijamin
 * sama antara keduanya. Sekarang seluruh module ini STATELESS — tidak ada
 * lagi module-level mutable state sama sekali — `fetchPostOutcome`
 * menerima `expectedOutstandAccountIds` eksplisit dari caller (yang sudah
 * tahu daftar akun dari data durable), bukan menebak dari memori.
 */
export const fakeOutstandAdapter: IOutstandAdapter = {
  /**
   * Connect Account (T-013.1/T-013.2, T-015.3 Reconnect, ADR-105, redesain
   * ADR-112) — Fake TIDAK pernah redirect ke domain eksternal manapun.
   * `redirectUrl` yang dikembalikan adalah path RELATIF ke callback route
   * kita sendiri (`/api/integrations/outstand/callback`) supaya browser
   * cukup navigasi ke origin app yang sedang berjalan (tidak butuh env
   * `APP_URL`/base URL apa pun) — loopback ini sengaja (bukan skip
   * langsung ke sukses instan) supaya Route Handler callback tetap teruji
   * end-to-end sebelum real adapter (T-025) masuk, lihat ADR-105.
   *
   * **ADR-112:** query param loopback sekarang `account_id`/`username`/
   * `network_unique_id` (deterministik dari `state`, pola sama
   * `buildFakeHandle`) — BUKAN `code` lagi, supaya bentuk Fake tetap
   * merepresentasikan bentuk redirect nyata Outstand untuk single-page
   * account.
   *
   * **Facebook Pages (T-025.4, ADR-115, wire-format dikoreksi ADR-116,
   * menutup gap testability KI-070):** SEBELUM percabangan ini, Fake selalu
   * mengembalikan loopback single-page di atas untuk SEMUA platform
   * termasuk Facebook — akibatnya klik "Connect Account → Facebook" di Fake
   * mode tidak pernah memicu dialog Facebook Pages Picker secara natural
   * (hanya bisa diuji lewat navigasi manual ke URL `?session=...` yang
   * dirakit tangan, bukan golden path sungguhan). Sekarang
   * `platform === SocialPlatform.Facebook` menghasilkan loopback dengan
   * query param `session` (BUKAN `account_id`/`username`/
   * `network_unique_id`) ke `CONNECT_CALLBACK_PATH` yang SAMA — persis
   * bentuk redirect Outstand asli untuk Facebook (ADR-116) — supaya
   * percabangan baca `session` yang sudah ada di Route Handler
   * (`route.ts`) benar-benar ter-trigger end-to-end dari klik UI, bukan
   * cuma dari test/URL manual. `fakeSessionToken` deterministik dari
   * `seed` (pola sama `buildFakeHandle`/`outstandAccountId` di bawah) —
   * `listPendingFacebookPages`/`confirmFacebookPagesConnection` di bawah
   * accept-all terhadap `sessionToken` apa pun (ADR-059: instant
   * always-success, tanpa validasi bentuk token), jadi token ini valid
   * dipakai tanpa perubahan apa pun di method lain.
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
    const seed = redirectAccountId ?? `${workspaceId}:${state}`;

    if (platform === SocialPlatform.Facebook) {
      const fakeSessionToken = `fake-fb-session-${deterministicInt(
        seed,
        "facebookSessionToken",
        1_000_000,
      )}`;

      const redirectUrl =
        `/api/integrations/outstand/callback?session=${encodeURIComponent(fakeSessionToken)}` +
        `&state=${encodeURIComponent(state)}`;

      return { redirectUrl };
    }

    const outstandAccountId = `fake-account-${deterministicInt(
      seed,
      "outstandAccountId",
      1_000_000,
    )}`;
    const username = buildFakeHandle(platform, seed);
    const networkUniqueId = `fake-network-unique-${deterministicInt(
      seed,
      "networkUniqueId",
      1_000_000,
    )}`;

    const redirectUrl =
      `/api/integrations/outstand/callback?account_id=${encodeURIComponent(outstandAccountId)}` +
      `&username=${encodeURIComponent(username)}` +
      `&network_unique_id=${encodeURIComponent(networkUniqueId)}` +
      `&state=${encodeURIComponent(state)}`;

    return { redirectUrl };
  },

  /**
   * Resolve Connect Callback (T-013.1/T-013.2, T-015.3 Reconnect, ADR-105,
   * redesain ADR-112) — Fake always-success instan: `outstandAccountId`/
   * `username` diterima apa adanya (dibuat sendiri oleh `connectAccount`
   * di atas, tidak diverifikasi lebih lanjut — Fake tidak menyimpan daftar
   * apa pun yang pernah diterbitkan), `state` di-decode untuk menentukan
   * `platform` hasil koneksi (Outstand asli tidak pernah mengirim
   * `platform` lewat query callback — lihat ADR-112). TIDAK ada network
   * call di sini, konsisten dengan real adapter (§5 ADR-112).
   */
  async resolveConnectCallback({
    state,
    outstandAccountId,
    username,
  }: ConnectCallbackInput): Promise<ConnectedAccountData> {
    const decoded = decodeFakeState(state);

    return {
      outstandAccountId,
      platform: decoded.platform,
      handle: username,
      status: "active",
    };
  },

  /**
   * Facebook Pages — list pending Pages (T-025.4, ADR-115) — Fake selalu
   * mengembalikan 3 fixture tetap (`FAKE_FACEBOOK_PAGE_FIXTURES`, di atas)
   * terlepas dari `sessionToken` yang diminta (ADR-059: instant
   * always-success, tanpa simulasi delay/gagal/expired) — `pictureUrl`
   * disintesis dari `pageId` (path lokal `fake.outstand.local`, konsisten
   * dengan pola `uploadMediaWorkingCopy`/`schedulePost` yang juga tidak
   * pernah menunjuk ke domain eksternal sungguhan).
   */
  async listPendingFacebookPages(): Promise<ListPendingFacebookPagesResult> {
    return {
      pages: FAKE_FACEBOOK_PAGE_FIXTURES.map((fixture) => ({
        pageId: fixture.pageId,
        name: fixture.name,
        category: fixture.category,
        pictureUrl: `https://fake.outstand.local/pages/${fixture.pageId}.jpg`,
      })),
    };
  },

  /**
   * Facebook Pages — confirm selected Pages (T-025.4, ADR-115) — Fake
   * mengembalikan `ConnectedAccountData` HANYA untuk `selectedPageIds` yang
   * cocok dengan salah satu dari 3 fixture tetap (deterministik, tanpa
   * network call) — `pageId` yang tidak dikenal diam-diam di-skip (bukan
   * error), sama seperti real adapter yang membiarkan Outstand sendiri
   * memutuskan Page mana yang valid; validasi `selectedPageIds` kosong
   * tetap dilempar (defense-in-depth, konsisten dengan real adapter).
   */
  async confirmFacebookPagesConnection({
    selectedPageIds,
  }: ConfirmFacebookPagesInput): Promise<ConfirmFacebookPagesResult> {
    if (selectedPageIds.length === 0) {
      throw new Error(
        "FakeOutstandAdapter: confirmFacebookPagesConnection butuh minimal satu selectedPageIds.",
      );
    }

    const accounts: ConnectedAccountData[] = FAKE_FACEBOOK_PAGE_FIXTURES.filter(
      (fixture) => selectedPageIds.includes(fixture.pageId),
    ).map((fixture) => ({
      outstandAccountId: fixture.pageId,
      platform: SocialPlatform.Facebook,
      handle: fixture.name,
      status: "active",
    }));

    return { accounts };
  },

  /**
   * Media upload working copy (T-024.3, ADR-040 poin 4, ADR-106) — Fake
   * membungkus 3 langkah narasi Outstand Media API (request upload URL →
   * PUT bytes → confirm) menjadi SATU langkah instant always-success
   * (ADR-059): tidak ada network call/PUT sungguhan, `fileBuffer`/
   * `mimeType` diterima apa adanya tanpa validasi ulang (validasi
   * mime/size sudah terjadi sebelumnya di `UploadMediaUseCase`/
   * `validation.ts`, T-024.2). `outstandMediaId` acak per panggilan (bukan
   * deterministik) mengikuti pola `schedulePost`/`publishNow` — setiap
   * upload working copy adalah upload baru, bukan sesuatu yang perlu
   * direproduksi identik untuk input yang sama.
   */
  async uploadMediaWorkingCopy(): Promise<UploadMediaWorkingCopyResult> {
    const outstandMediaId = `fake-media-${crypto.randomUUID()}`;

    return {
      outstandMediaId,
      outstandMediaUrl: `https://fake.outstand.local/media/${outstandMediaId}`,
      expiresAt: new Date(Date.now() + FAKE_MEDIA_WORKING_COPY_TTL_MS),
    };
  },

  async schedulePost() {
    const outstandPostId = `fake-post-${crypto.randomUUID()}`;
    return { outstandPostId };
  },

  /**
   * Publish Now (T-029) — sama fidelitasnya: instant always-success, tanpa
   * simulasi delay/gagal, satu call untuk semua target.
   */
  async publishNow() {
    const outstandPostId = `fake-post-${crypto.randomUUID()}`;
    return { outstandPostId };
  },

  /**
   * Resolve status per akun (redesain 2026-08-26; bug fix T-027 — root
   * cause, dikonfirmasi King Rezi via `AskUserQuestion` setelah temuan QA
   * Najwa) — Fake always-success: SEMUA akun di `expectedOutstandAccountIds`
   * langsung `published`, PURE FUNCTION dari `(outstandPostId,
   * expectedOutstandAccountIds)`, TIDAK bergantung pada memori/state
   * apa pun yang diisi `schedulePost`/`publishNow` sebelumnya.
   *
   * **Kenapa desain lama (module-level `Map` yang "mengingat" set akun)
   * SALAH:** aman untuk `PublishNowUseCase`/`RetryFailedTargetUseCase`
   * (memanggil `schedulePost`/`publishNow` lalu `fetchPostOutcome` di
   * request yang sama), tapi PECAH untuk T-027 — `schedulePost()` dipanggil
   * dari Server Action, `fetchPostOutcome()` dipanggil BELAKANGAN (bisa
   * berjam-jam) dari Route Handler `/api/jobs/run` yang TERPISAH. Terbukti
   * lewat inspeksi `.next/server` build production: Next.js (Turbopack)
   * membundle Route Handler dan Server Action/RSC page sebagai chunk
   * TERPISAH, masing-masing dapat SALINAN modul ini sendiri — `Map`
   * level-modul TIDAK dijamin sama antara keduanya, bahkan dalam SATU
   * proses Node yang sama. Parameter eksplisit menghilangkan masalah ini
   * total: caller (yang SUDAH tahu daftar akun dari data durable —
   * `PublishingPostTarget`/`WorkspaceConnectedAccount`) yang menyuplai
   * datanya, bukan Fake yang menebak dari memori.
   */
  async fetchPostOutcome(
    outstandPostId,
    expectedOutstandAccountIds,
  ): Promise<PostTargetOutcome[]> {
    return expectedOutstandAccountIds.map((outstandAccountId) =>
      buildOutcome(outstandPostId, outstandAccountId),
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
   * tanpa network call.
   *
   * **Disederhanakan jadi no-op murni (bug fix T-027, root-cause):**
   * sebelumnya method ini menghapus entry dari `Map` in-memory
   * `targetsByOutstandPostId` supaya `fetchPostOutcome` berikutnya untuk
   * `outstandPostId` yang sama "melupakan" akun yang dihapus. Sekarang
   * `fetchPostOutcome` sudah pure function dari `expectedOutstandAccountIds`
   * yang disuplai caller (lihat catatan panjang di method itu) — tidak ada
   * lagi memori untuk dibersihkan sama sekali. Efek "lupa" ini juga TIDAK
   * pernah jadi load-bearing untuk caller manapun: satu-satunya pemanggil
   * (`RetryFailedTargetUseCase`) memanggil `deletePost` untuk
   * `outstandPostId` LAMA lalu `publishNow` untuk mendapat `outstandPostId`
   * BARU — `fetchPostOutcome` berikutnya selalu dipanggil dengan id BARU
   * itu, tidak pernah dengan id lama yang di-delete.
   */
  async deletePost() {
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

  /**
   * Pinterest boards (menutup KI-072, sisa scope ADR-114) — Fake instant
   * always-success (ADR-059, tanpa simulasi delay/failure): mengembalikan
   * SATU set board mock TETAP, sama untuk `outstandAccountId` mana pun
   * (konsisten dengan preseden `FacebookPendingPage` Fake — daftar tetap,
   * bukan dihasilkan dari hash id). Nama board disamakan dengan mock yang
   * sudah dipakai Claude Design (`templates/draft-editor.html`,
   * `components/forms.html`) supaya demo/QA tidak membingungkan (label
   * yang terlihat di UI persis sama dengan yang dirancang designer).
   */
  async listPinterestBoards(): Promise<PinterestBoard[]> {
    return [
      { id: "fake-pinterest-board-resep-minuman", name: "Resep & Minuman" },
      { id: "fake-pinterest-board-interior-kedai", name: "Interior Kedai" },
      { id: "fake-pinterest-board-promo-musiman", name: "Promo Musiman" },
    ];
  },

  /**
   * Engagement Sync (JOB-03, T-051, redesain KI-068/ADR-113) — di-scope
   * per POST (bukan lagi per akun): Fake mengembalikan SATU halaman tetap
   * (1-5 komentar, deterministik dari `outstandPostId`) — tidak ada lagi
   * `nextCursor`/pagination sama sekali (API resmi Outstand memang tidak
   * punya cursor untuk endpoint ini). `platform`/`accountUsername`
   * diterima apa adanya dari caller; `accountUsername` sendiri tidak
   * mempengaruhi hasil (Fake tidak mensimulasikan disambiguasi multi-akun
   * per network, ADR-059: fidelitas instan tanpa simulasi kegagalan).
   * Karena `outstandCommentId` per komentar stabil (lihat
   * `buildFakeComment`), sync berulang untuk `outstandPostId` yang sama
   * SELALU mengembalikan set komentar identik — upsert idempoten di
   * `EngagementService` akan melihatnya sebagai "tidak ada yang baru" pada
   * sync kedua dan seterusnya, persis simulasi realistis untuk MVP tanpa
   * perlu state buatan yang bertambah tanpa henti.
   */
  async fetchComments({
    outstandPostId,
    platform,
  }): Promise<FetchCommentsResult> {
    const count = 1 + deterministicInt(outstandPostId, "commentCount", 5);
    const comments = Array.from({ length: count }, (_, index) =>
      buildFakeComment(outstandPostId, platform, index),
    );

    return { comments };
  },

  /**
   * Reply dari dalam aplikasi (T-054, redesain KI-068/ADR-113, KI-071) —
   * sama fidelitasnya dengan `schedulePost`/`publishNow`: instant
   * always-success, `outstandReplyId` acak per panggilan (bukan
   * deterministik — tiap reply adalah resource baru, bukan sesuatu yang
   * perlu direproduksi identik untuk input yang sama).
   * `outstandPostId`/`accountUsername`/`parentOutstandCommentId` diterima
   * apa adanya tapi tidak mempengaruhi hasil (Fake tidak memvalidasi
   * threading/post existence/disambiguasi multi-akun, ADR-059).
   */
  async replyToComment(_input: {
    outstandPostId: string;
    content: string;
    accountUsername: string;
    parentOutstandCommentId?: string;
  }): Promise<ReplyToCommentResult> {
    return { outstandReplyId: `fake-reply-${crypto.randomUUID()}` };
  },
};
