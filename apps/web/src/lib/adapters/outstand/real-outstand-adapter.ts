import {
  SocialPlatform,
  type ConnectAccountInput,
  type ConnectAccountResult,
  type ConnectCallbackInput,
  type ConnectedAccountData,
  type FetchCommentsResult,
  type FetchPostMetricsResult,
  type FetchWorkspaceMetricsResult,
  type IOutstandAdapter,
  type OutstandMetricsPeriod,
  type OutstandPostTargetInput,
  type OutstandPostTargetStatus,
  type PostTargetOutcome,
  type PublishNowOutstandPostInput,
  type PublishNowOutstandPostResult,
  type ReplyToCommentResult,
  type ScheduleOutstandPostInput,
  type ScheduleOutstandPostResult,
  type UploadMediaWorkingCopyInput,
  type UploadMediaWorkingCopyResult,
} from "@social/shared";
import {
  OutstandHttpClient,
  type OutstandHttpClientOptions,
} from "./outstand-http-client";
import { OutstandIntegrationError } from "./outstand-integration-error";
import { parseBase64UrlJson } from "./connect-state";

/**
 * Real `OutstandAdapter` — implementasi HTTP client sungguhan dari
 * `IOutstandAdapter` (T-025), dipasang oleh factory `getOutstandAdapter()`
 * (`./index.ts`) begitu `OUTSTAND_API_KEY` terisi. Menggantikan
 * `FakeOutstandAdapter` (ADR-059) di jalur produksi — Fake tetap dipakai
 * untuk dev/test tanpa kredensial (rule 19 AGENTS.md, factory switch tidak
 * berubah).
 *
 * **CATATAN PENTING (update 2026-09-23):** Sesi sebelumnya menulis file ini
 * berdasarkan TEBAKAN best-effort (base URL/endpoint/shape belum pernah
 * dibaca dari dokumentasi Outstand asli). Sesi ini mengoreksi seluruh
 * path/shape di bawah terhadap OpenAPI spec RESMI Outstand
 * (`https://api.outstand.so/v1/{posts,social-accounts,media}/openapi.json`,
 * diambil 2026-09-23) — setiap method yang sudah diverifikasi menandainya
 * eksplisit di docstring masing-masing ("diverifikasi terhadap OpenAPI spec
 * resmi Outstand").
 *
 * **GAP YANG MASIH TERBUKA (belum bisa diperbaiki tanpa keputusan
 * arsitektur/ADR baru dari King Rezi — lihat laporan sesi 2026-09-23):**
 *
 * 1. ~~`connectAccount`/`exchangeConnectCode` (ADR-105)~~ — **DISELESAIKAN
 *    ADR-112 (2026-09-23, amandemen ADR-105) untuk single-page account.**
 *    Outstand redirect balik dengan `account_id`/`network_unique_id`/
 *    `username` langsung (bukan `code`) — `resolveConnectCallback` di
 *    bawah sekarang mengimplementasikan ini (murni validasi/normalisasi,
 *    TANPA network call). Platform multi-halaman (Facebook dkk, butuh flow
 *    session-token+page-picker terpisah `GET/POST
 *    /v1/social-accounts/pending/{sessionToken}`) TETAP di luar scope —
 *    `resolveConnectCallback` throw eksplisit kalau dipanggil untuk
 *    `SocialPlatform.Facebook`, lihat KI-070.
 * 2. **`fetchComments`/`replyToComment` (JOB-03/T-054)** — API resmi
 *    Outstand men-scope komentar per POST (`/v1/posts/{id}/replies`,
 *    query `network` wajib, TANPA cursor pagination), sementara kontrak
 *    `IOutstandAdapter` men-scope per AKUN dengan `cursor` opsional. Tidak
 *    ada endpoint Outstand untuk "semua komentar lintas post satu akun".
 *    Kedua method di bawah SENGAJA throw, bukan silent-wrong.
 * 3. **Platform-specific overrides (Story/Reel/Pin, ADR-039)** —
 *    `OutstandPostTargetInput` tidak membawa `platform`/network per target
 *    (hanya `outstandAccountId`+`contentFormat`+`platformOptions`), padahal
 *    Outstand butuh override dikirim sebagai top-level key BERNAMA NETWORK
 *    (`instagram`/`facebook`/`pinterest`/dst, lihat `buildPostRequestBody`
 *    di bawah). Tanpa tahu network tiap target, adapter ini TIDAK bisa
 *    membentuk key itu dengan aman — jadi utk sekarang override per-format
 *    TIDAK dikirim ke Outstand sama sekali (post tetap terbit sebagai
 *    "post" biasa di semua network). Field asli sudah dikonfirmasi di
 *    OpenAPI spec, tinggal butuh field tambahan di kontrak untuk
 *    menyalurkannya.
 */
export interface RealOutstandAdapterOptions extends OutstandHttpClientOptions {
  /**
   * Origin absolut aplikasi kita sendiri (`BETTER_AUTH_URL`) — dibutuhkan
   * `connectAccount` untuk membentuk `redirectUri` callback
   * (`/api/integrations/outstand/callback`) yang dikirim ke Outstand
   * sebagai bagian request OAuth authorize URL. Diinjeksi dari luar (bukan
   * baca `process.env` langsung di file ini) supaya adapter ini tetap
   * murni/testable (T-025.7) — factory (`./index.ts`) yang bertanggung
   * jawab menyuplai nilai dari `getServerEnv()`.
   */
  appOrigin: string;
  /**
   * Outstand Organization ID — dibutuhkan `connectAccount()` untuk membentuk
   * redirect URL OAuth resmi
   * (`https://www.outstand.so/app/api/socials/{network}/{orgId}`).
   * `undefined`/kosong → `connectAccount()` throw `OutstandIntegrationError`
   * (bukan silent fallback ke URL yang salah). Sejak ADR-112,
   * `resolveConnectCallback()` (langkah 2) sudah tidak butuh env tambahan
   * — mengisi `orgId` di sini SUDAH cukup untuk alur connect account
   * single-page selesai (tidak berlaku untuk Facebook Pages, KI-070).
   */
  orgId?: string;
}

const CONNECT_CALLBACK_PATH = "/api/integrations/outstand/callback";

/**
 * Mapping `SocialPlatform` (vocabulary internal) → nama network Outstand
 * (dipakai path `connectAccount` dan — begitu kontrak punya field
 * `platform` per target — top-level key request `POST /v1/posts`).
 * Diverifikasi terhadap OpenAPI spec resmi: hanya `x` (Twitter) yang beda
 * dari nilai enum kita (`twitter`); sisanya sama persis.
 */
function toOutstandNetwork(platform: SocialPlatform): string {
  return platform === SocialPlatform.Twitter ? "x" : platform;
}

/** Base64url JSON encode — pasangan `parseBase64UrlJson` (`connect-state.ts`), dipakai untuk membentuk `state` OAuth. */
function encodeState(payload: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

/** Normalisasi status per-akun dari response Outstand (`get-post-details`) ke enum domain `pending|published|failed`. */
function normalizeTargetStatus(raw: unknown): OutstandPostTargetStatus {
  const value = typeof raw === "string" ? raw.toLowerCase() : "";
  if (
    ["published", "success", "succeeded", "complete", "completed"].includes(
      value,
    )
  ) {
    return "published";
  }
  if (["failed", "error", "rejected"].includes(value)) {
    return "failed";
  }
  return "pending";
}

function toDateOrNull(value: unknown): Date | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function toNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/**
 * Konversi `OutstandMetricsPeriod` (vocabulary domain internal) ke rentang
 * Unix timestamp (`since`/`until`, detik) yang dibutuhkan
 * `GET /v1/social-accounts/{id}/metrics` (diverifikasi terhadap OpenAPI spec
 * resmi Outstand — parameter query itu numerik, BUKAN string `period` seperti
 * tebakan sebelumnya). `until` selalu "sekarang".
 */
function periodToUnixRange(period: OutstandMetricsPeriod): {
  since: number;
  until: number;
} {
  const days = period === "last_7_days" ? 7 : 30;
  const untilMs = Date.now();
  const sinceMs = untilMs - days * 24 * 60 * 60 * 1000;
  return {
    since: Math.floor(sinceMs / 1000),
    until: Math.floor(untilMs / 1000),
  };
}

/**
 * Bentuk baris `post.socialAccounts[]` pada response `GET /v1/posts/{id}`
 * — **diverifikasi terhadap OpenAPI spec resmi Outstand:** field id akun
 * adalah `id` (nama field wire resmi). `accountId`/`outstandAccountId`
 * dipertahankan sebagai fallback opsional (kompatibilitas mundur, bukan
 * field resmi).
 */
interface RawPostAccountOutcome {
  id?: unknown;
  accountId?: unknown;
  outstandAccountId?: unknown;
  status?: unknown;
  error?: unknown;
  platformPostId?: unknown;
  platformPostUrl?: unknown;
  publishedAt?: unknown;
}

/**
 * Sintesis nama file valid dari MIME type untuk `POST /v1/media/upload`
 * (field `filename` wajib, spec resmi Outstand) — `UploadMediaWorkingCopyInput`
 * tidak membawa nama file asli, hanya `mimeType`. Ekstensi umum dipetakan
 * eksplisit; fallback `bin` untuk MIME type yang tidak dikenali (tetap
 * lolos validasi Outstand: string 1-255 karakter, tidak perlu ekstensi yang
 * "benar" secara semantik untuk lolos endpoint ini).
 */
function mimeTypeToFilename(mimeType: string): string {
  const extensionByMimeType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/webm": "webm",
  };
  const extension = extensionByMimeType[mimeType.toLowerCase()] ?? "bin";
  return `upload-${crypto.randomUUID()}.${extension}`;
}

function buildPendingOutcome(outstandAccountId: string): PostTargetOutcome {
  return {
    outstandAccountId,
    status: "pending",
    error: null,
    platformPostId: null,
    platformPostUrl: null,
    publishedAt: null,
  };
}

export function createRealOutstandAdapter(
  apiKey: string,
  options: RealOutstandAdapterOptions,
): IOutstandAdapter {
  const client = new OutstandHttpClient(apiKey, options);

  /**
   * `POST /v1/posts` body — diverifikasi terhadap OpenAPI spec resmi
   * Outstand: `accounts: string[]` (id/username akun, bukan network),
   * `content: string` (BUKAN `caption` — nama field lama adalah tebakan
   * salah), `scheduledAt?: ISO8601`. Override per-platform (Story/Reel/Pin,
   * ADR-039) TIDAK disertakan di sini — lihat gap #3 di docstring atas file
   * ini: `OutstandPostTargetInput` tidak membawa `platform`/network per
   * target, jadi kita tidak bisa aman membentuk top-level key
   * `instagram`/`facebook`/`pinterest`/dst yang dibutuhkan Outstand untuk
   * override itu. `contentFormat`/`platformOptions` per target saat ini
   * diabaikan (bukan dikirim salah) sampai kontrak diamandemen.
   */
  function buildPostRequestBody(input: {
    targets: OutstandPostTargetInput[];
    caption: string;
    scheduledAt?: Date;
  }) {
    return {
      accounts: input.targets.map((target) => target.outstandAccountId),
      content: input.caption,
      scheduledAt: input.scheduledAt
        ? input.scheduledAt.toISOString()
        : undefined,
    };
  }

  /** Response `POST /v1/posts` (diverifikasi): `{ success, post: { id, ... } }`. */
  function extractOutstandPostId(response: unknown): string {
    if (response && typeof response === "object") {
      const rec = response as Record<string, unknown>;
      const candidate =
        (typeof rec.post === "object" && rec.post !== null
          ? (rec.post as Record<string, unknown>).id
          : undefined) ??
        rec.id ??
        rec.postId;
      if (typeof candidate === "string" && candidate.length > 0) {
        return candidate;
      }
    }
    throw new OutstandIntegrationError({
      type: "client_error",
      message:
        "OutstandAdapter: response create-a-post tidak mengandung id post yang valid.",
      retryable: false,
    });
  }

  async function createPost(input: {
    targets: OutstandPostTargetInput[];
    caption: string;
    scheduledAt?: Date;
  }): Promise<{ outstandPostId: string }> {
    const response = await client.request<unknown>("/v1/posts", {
      method: "POST",
      body: buildPostRequestBody(input),
    });
    return { outstandPostId: extractOutstandPostId(response) };
  }

  return {
    /**
     * Connect Account (T-025.4, ADR-105) — langkah 1: bentuk URL redirect
     * OAuth. **Diverifikasi 2026-09-23** (bukan lewat OpenAPI spec — itu
     * hanya mendokumentasikan API server-to-server; format redirect ini
     * dikonfirmasi terpisah): Outstand TIDAK punya endpoint HTTP untuk
     * "minta authorize URL" — URL-nya dibentuk LANGSUNG (tanpa call API)
     * dengan format
     * `https://www.outstand.so/app/api/socials/{network}/{orgId}?redirect_uri=...`.
     * `state` KITA sisipkan sebagai query param pada `redirect_uri` itu
     * sendiri (Outstand tidak punya konsep `state` OAuth2 standar — ia
     * murni redirect balik ke `redirect_uri` apa adanya dengan
     * `account_id`/`network_unique_id`/`username` ditambahkan, lihat
     * `resolveConnectCallback` di bawah, ADR-112).
     *
     * Butuh `options.orgId` (env `OUTSTAND_ORG_ID`) — throw loud kalau
     * kosong, bukan membentuk URL yang pasti salah.
     */
    async connectAccount(
      input: ConnectAccountInput,
    ): Promise<ConnectAccountResult> {
      if (!options.orgId) {
        throw new OutstandIntegrationError({
          type: "client_error",
          message:
            "OutstandAdapter: OUTSTAND_ORG_ID belum dikonfigurasi — dibutuhkan untuk membentuk redirect URL OAuth Outstand (https://www.outstand.so/app/api/socials/{network}/{orgId}).",
          retryable: false,
        });
      }

      const state = encodeState({
        workspaceId: input.workspaceId,
        platform: input.platform,
        redirectAccountId: input.redirectAccountId,
        nonce: crypto.randomUUID(),
      });
      const redirectUri = `${options.appOrigin}${CONNECT_CALLBACK_PATH}?state=${encodeURIComponent(state)}`;
      const network = toOutstandNetwork(input.platform);

      const redirectUrl = `https://www.outstand.so/app/api/socials/${encodeURIComponent(network)}/${encodeURIComponent(options.orgId)}?redirect_uri=${encodeURIComponent(redirectUri)}`;

      return { redirectUrl };
    },

    /**
     * Resolve Connect Callback (T-025.4, ADR-105, redesain ADR-112) —
     * langkah 2, **SCOPE: single-page account saja** (Instagram, X,
     * LinkedIn, Threads, TikTok, YouTube, Pinterest, dst — bukan Facebook
     * Pages multi-halaman, lihat KI-070). Outstand TIDAK punya endpoint
     * "exchange" untuk kasus ini — setelah user selesai OAuth, Outstand
     * redirect balik ke `redirect_uri` KITA dengan `account_id`/
     * `network_unique_id`/`username` LANGSUNG sebagai query param, data
     * akun sudah lengkap di sana. Method ini karena itu MURNI
     * validasi/normalisasi jadi `ConnectedAccountData` — **TIDAK ada
     * network call ke Outstand di sini sama sekali**.
     *
     * `platform` diambil dari `state` (di-decode ulang di sini, BUKAN dari
     * Outstand — Outstand tidak pernah mengirim `platform`/`network` lewat
     * query callback-nya). Kalau `state` ternyata membawa
     * `platform === Facebook`, throw eksplisit — Facebook Pages seharusnya
     * TIDAK PERNAH mendarat di callback ini lewat `account_id`/`username`
     * langsung (Outstand mengarahkannya ke flow session-token yang
     * berbeda sama sekali); kalaupun terjadi, itu bug di tempat lain yang
     * harus gagal keras, bukan diam-diam diterima sebagai data yang
     * mungkin salah bentuk.
     */
    async resolveConnectCallback({
      state,
      outstandAccountId,
      username,
    }: ConnectCallbackInput): Promise<ConnectedAccountData> {
      let decoded: { platform?: unknown };
      try {
        decoded = parseBase64UrlJson(state) as { platform?: unknown };
      } catch {
        throw new OutstandIntegrationError({
          type: "client_error",
          message:
            "OutstandAdapter: resolveConnectCallback menerima state yang tidak valid/rusak.",
          retryable: false,
        });
      }

      const platform = decoded.platform as SocialPlatform | undefined;
      if (!platform || !Object.values(SocialPlatform).includes(platform)) {
        throw new OutstandIntegrationError({
          type: "client_error",
          message:
            "OutstandAdapter: resolveConnectCallback tidak menemukan platform yang valid di dalam state.",
          retryable: false,
        });
      }

      if (platform === SocialPlatform.Facebook) {
        throw new OutstandIntegrationError({
          type: "client_error",
          message:
            "OutstandAdapter: resolveConnectCallback tidak mendukung Facebook Pages (multi-halaman) — Outstand memakai flow session-token+page-selection terpisah (GET/POST /v1/social-accounts/pending/{sessionToken}) yang belum diimplementasikan, lihat KI-070. ADR-112 hanya menutup gap untuk single-page account.",
          retryable: false,
        });
      }

      if (!outstandAccountId || !username) {
        throw new OutstandIntegrationError({
          type: "client_error",
          message:
            "OutstandAdapter: resolveConnectCallback butuh account_id dan username dari query param callback Outstand — salah satunya kosong.",
          retryable: false,
        });
      }

      return {
        outstandAccountId,
        platform,
        handle: username,
        status: "active",
      };
    },

    /**
     * Media upload working copy (T-025.5, ADR-106) — membungkus 3 langkah
     * narasi Outstand Media API menjadi 1 method (kontrak sudah final,
     * ADR-106). **Diverifikasi terhadap OpenAPI spec resmi Outstand
     * (2026-09-23):**
     * (1) `POST /v1/media/upload` body `{ filename, content_type }` →
     *     `{ success, data: { id, upload_url, expires_in } }` — `filename`
     *     WAJIB (1-255 char). `UploadMediaWorkingCopyInput` tidak membawa
     *     nama file asli (hanya `fileBuffer`+`mimeType`), jadi filename
     *     disintesis dari mimeType (`mimeTypeToFilename`, di bawah) — bukan
     *     tebakan salah, murni kebutuhan wire yang tidak ada di kontrak
     *     domain (Outstand hanya butuh string valid, bukan nama asli).
     * (2) `PUT` bytes ke `upload_url` (lewat `client.putBytes`, TANPA auth
     *     header Outstand — lihat docstring `putBytes`).
     * (3) `POST /v1/media/{id}/confirm` body `{ size }` (bytes, opsional) →
     *     `{ success, data: { id, filename, url, content_type, size,
     *     status, created_at, expires_at } }`.
     */
    async uploadMediaWorkingCopy(
      input: UploadMediaWorkingCopyInput,
    ): Promise<UploadMediaWorkingCopyResult> {
      const requestUploadResponse = await client.request<
        Record<string, unknown>
      >("/v1/media/upload", {
        method: "POST",
        body: {
          filename: mimeTypeToFilename(input.mimeType),
          content_type: input.mimeType,
        },
      });

      const data =
        typeof requestUploadResponse.data === "object" &&
        requestUploadResponse.data !== null
          ? (requestUploadResponse.data as Record<string, unknown>)
          : {};
      const uploadUrl =
        typeof data.upload_url === "string" ? data.upload_url : undefined;
      const mediaId = typeof data.id === "string" ? data.id : undefined;

      if (!uploadUrl || !mediaId) {
        throw new OutstandIntegrationError({
          type: "client_error",
          message:
            "OutstandAdapter: response media/upload tidak mengandung upload_url/id yang valid.",
          retryable: false,
        });
      }

      await client.putBytes(uploadUrl, input.fileBuffer, input.mimeType);

      const confirmResponse = await client.request<Record<string, unknown>>(
        `/v1/media/${encodeURIComponent(mediaId)}/confirm`,
        { method: "POST", body: { size: input.fileBuffer.length } },
      );

      const confirmData =
        typeof confirmResponse.data === "object" &&
        confirmResponse.data !== null
          ? (confirmResponse.data as Record<string, unknown>)
          : {};
      const outstandMediaUrl =
        typeof confirmData.url === "string" ? confirmData.url : undefined;
      const expiresAt = toDateOrNull(confirmData.expires_at);

      if (!outstandMediaUrl || !expiresAt) {
        throw new OutstandIntegrationError({
          type: "client_error",
          message:
            "OutstandAdapter: response media confirm tidak mengandung url/expires_at yang valid.",
          retryable: false,
        });
      }

      return { outstandMediaId: mediaId, outstandMediaUrl, expiresAt };
    },

    /**
     * Publishing (T-025.2) — SATU call `POST /posts` untuk semua target
     * (kontrak final ADR-092, `create-a-post` Outstand asli). `scheduledAt`
     * disertakan → Outstand menjadwalkan; response HANYA berisi
     * `outstandPostId`, outcome per akun diresolve belakangan lewat
     * `fetchPostOutcome` (T-027/webhook T-026), TIDAK diasumsikan sinkron
     * (ADR-092 poin 2).
     */
    async schedulePost(
      input: ScheduleOutstandPostInput,
    ): Promise<ScheduleOutstandPostResult> {
      return createPost({
        targets: input.targets,
        caption: input.caption,
        scheduledAt: input.scheduledAt,
      });
    },

    /**
     * Publishing (T-025.3, ADR-047) — sama dengan `schedulePost` tanpa
     * `scheduledAt` (publish langsung tanpa jadwal, ADR-092 poin 3: endpoint
     * HTTP Outstand yang sama, dibedakan `scheduledAt` kosong — beda niat
     * domain saja yang disembunyikan di sini, bukan di kontrak).
     */
    async publishNow(
      input: PublishNowOutstandPostInput,
    ): Promise<PublishNowOutstandPostResult> {
      return createPost({
        targets: input.targets,
        caption: input.caption,
      });
    },

    /**
     * Resolve outcome per akun (T-025.2/.3, ADR-092/ADR-108) — **diverifikasi
     * terhadap OpenAPI spec resmi Outstand:** `GET /v1/posts/{outstandPostId}`
     * ("Get post details"), field `post.socialAccounts[]` berisi
     * `{ id, nickname, network, username, status, error, platformPostId,
     * platformPostUrl, publishedAt }` — field id akun adalah `id` (BUKAN
     * `accountId` seperti tebakan sebelumnya; `accountId` tetap dicek
     * sebagai fallback untuk kompatibilitas). `expectedOutstandAccountIds`
     * (ADR-108) dipakai untuk memastikan SETIAP akun yang caller harapkan
     * tetap punya baris outcome di hasil — default `pending` kalau Outstand
     * belum/tidak mengembalikan baris untuk akun tsb (real API TIDAK butuh
     * parameter ini secara fungsional, berbeda dari Fake — lihat docstring
     * parameter ini di `packages/shared/src/contracts/outstand-adapter.ts`).
     */
    async fetchPostOutcome(
      outstandPostId: string,
      expectedOutstandAccountIds: string[],
    ): Promise<PostTargetOutcome[]> {
      const response = await client.request<Record<string, unknown>>(
        `/v1/posts/${encodeURIComponent(outstandPostId)}`,
        { method: "GET" },
      );

      const post =
        typeof response.post === "object" && response.post !== null
          ? (response.post as Record<string, unknown>)
          : response;

      const rawAccounts = Array.isArray(post.socialAccounts)
        ? (post.socialAccounts as RawPostAccountOutcome[])
        : [];

      const byAccountId = new Map<string, PostTargetOutcome>();
      for (const raw of rawAccounts) {
        const accountId =
          (typeof raw.id === "string" && raw.id) ||
          (typeof raw.accountId === "string" && raw.accountId) ||
          (typeof raw.outstandAccountId === "string" && raw.outstandAccountId);
        if (!accountId) continue;

        byAccountId.set(accountId, {
          outstandAccountId: accountId,
          status: normalizeTargetStatus(raw.status),
          error: toStringOrNull(raw.error),
          platformPostId: toStringOrNull(raw.platformPostId),
          platformPostUrl: toStringOrNull(raw.platformPostUrl),
          publishedAt: toDateOrNull(raw.publishedAt),
        });
      }

      return expectedOutstandAccountIds.map(
        (outstandAccountId) =>
          byAccountId.get(outstandAccountId) ??
          buildPendingOutcome(outstandAccountId),
      );
    },

    /**
     * Cancel Schedule (T-030, ADR-049/ADR-092) — **diverifikasi:** `DELETE
     * /v1/posts/{outstandPostId}` ("Delete & cancel a post") tanpa filter
     * akun. Kalau post masih scheduled, job publishing dibatalkan lalu
     * record dihapus dari database Outstand; kalau sudah published, HANYA
     * dihapus dari database Outstand (konten yang sudah tayang di social
     * network TIDAK ikut terhapus) — beda dari `deletePost` di bawah.
     */
    async cancelScheduledPost(outstandPostId: string): Promise<void> {
      await client.request<void>(
        `/v1/posts/${encodeURIComponent(outstandPostId)}`,
        { method: "DELETE" },
      );
    },

    /**
     * Retry manual (T-034.4, ADR-092/ADR-103) — **diverifikasi:** `DELETE
     * /v1/posts/{outstandPostId}/remote` ("Delete a post from social
     * networks") — BEDA endpoint dari `cancelScheduledPost` (path lama
     * `DELETE /posts/{id}` di atas adalah cancel-BELUM-publish, bukan
     * hapus-yang-SUDAH-publish; dua-duanya memang ada di kontrak
     * `IOutstandAdapter` sebagai method terpisah, jadi dipetakan ke endpoint
     * masing-masing yang benar).
     *
     * **GAP (dicatat, bukan diperbaiki diam-diam):** endpoint `/remote`
     * TIDAK punya parameter untuk membatasi penghapusan ke akun tertentu —
     * ia selalu mencoba menghapus dari SEMUA akun yang post ini publish ke
     * (per-account result ada di response, tapi tidak ada input filter).
     * Parameter `accountIds` di kontrak method ini karena itu diabaikan
     * untuk real adapter (tetap dihormati oleh Fake) — didokumentasikan
     * sebagai keterbatasan real API, bukan bug adapter ini.
     */
    async deletePost(
      outstandPostId: string,
      _accountIds?: string[],
    ): Promise<void> {
      await client.request<void>(
        `/v1/posts/${encodeURIComponent(outstandPostId)}/remote`,
        { method: "DELETE" },
      );
    },

    /**
     * Analytics (T-041, dipakai lewat T-025) — **diverifikasi:** `GET
     * /v1/posts/{outstandPostId}/analytics` ("Get post analytics"). Gap
     * bentuk kontrak SUDAH didokumentasikan di `outstand-adapter.ts`
     * (komentar `FetchPostMetricsResult`): response asli berbentuk
     * `{ post, metrics_by_account: [...], aggregated_metrics: {
     * total_likes, total_comments, total_shares, total_views,
     * total_impressions, total_reach, average_engagement_rate } }` — jauh
     * lebih kaya dari satu `FetchPostMetricsResult` flat. Method ini
     * membaca `aggregated_metrics.total_*` (nama field dikonfirmasi persis
     * dari OpenAPI spec, BUKAN lagi tebakan `reach`/`likes`/dst generik)
     * sebagai sumber angka flat. Catatan: Outstand tidak mengekspos metrik
     * "clicks" agregat sama sekali → selalu `null`. Revisi penuh kontrak
     * (array per-akun + aggregate) tetap follow-up T-041, di luar scope
     * T-025 sesuai catatan ADR-092.
     */
    async fetchPostMetrics(
      outstandPostId: string,
    ): Promise<FetchPostMetricsResult> {
      const response = await client.request<Record<string, unknown>>(
        `/v1/posts/${encodeURIComponent(outstandPostId)}/analytics`,
        { method: "GET" },
      );

      const aggregated =
        typeof response.aggregated_metrics === "object" &&
        response.aggregated_metrics !== null
          ? (response.aggregated_metrics as Record<string, unknown>)
          : {};

      const reach = toNumber(aggregated.total_reach);
      const likes = toNumber(aggregated.total_likes);
      const comments = toNumber(aggregated.total_comments);
      const shares = toNumber(aggregated.total_shares);
      const engagementRate =
        typeof aggregated.average_engagement_rate === "number"
          ? aggregated.average_engagement_rate
          : reach > 0
            ? Number(((likes + comments + shares) / reach).toFixed(4))
            : 0;

      return {
        impressions: toNumber(aggregated.total_impressions),
        reach,
        likes,
        comments,
        shares,
        // Outstand tidak mengekspos metrik "clicks" agregat di endpoint ini.
        clicks: null,
        engagementRate,
      };
    },

    /**
     * Analytics (T-041, dipakai lewat T-025) — **diverifikasi:** `GET
     * /v1/social-accounts/{outstandAccountId}/metrics?since=&until=`
     * (Unix timestamp, BUKAN `period` string seperti tebakan sebelumnya).
     * `OutstandMetricsPeriod` (`last_7_days`/`last_30_days`) dikonversi ke
     * `since`/`until` di sini (`periodToUnixRange`, di bawah).
     *
     * **GAP (dicatat, bukan diperbaiki diam-diam):** response asli
     * (`{ data: { followers_count, posts_count, engagement: {...} } }`)
     * TIDAK punya field `avgEngagementRate` sama sekali — selalu `0` di
     * sini. `totalEngagements` dijumlahkan best-effort dari
     * `engagement.{likes,comments,shares,reposts,quotes}` yang tersedia
     * (field lain seperti `saves`/`replies` sengaja tidak diikutkan supaya
     * tidak dobel-hitung across platform yang beda semantik) — revisi
     * bentuk kontrak yang lebih akurat tetap follow-up T-041.
     */
    async fetchWorkspaceMetrics(
      outstandAccountId: string,
      period: OutstandMetricsPeriod,
    ): Promise<FetchWorkspaceMetricsResult> {
      const { since, until } = periodToUnixRange(period);
      const response = await client.request<Record<string, unknown>>(
        `/v1/social-accounts/${encodeURIComponent(outstandAccountId)}/metrics`,
        {
          method: "GET",
          query: { since: String(since), until: String(until) },
        },
      );

      const data =
        typeof response.data === "object" && response.data !== null
          ? (response.data as Record<string, unknown>)
          : {};
      const engagement =
        typeof data.engagement === "object" && data.engagement !== null
          ? (data.engagement as Record<string, unknown>)
          : {};

      const totalEngagements =
        toNumber(engagement.likes) +
        toNumber(engagement.comments) +
        toNumber(engagement.shares) +
        toNumber(engagement.reposts) +
        toNumber(engagement.quotes);

      return {
        totalPosts: toNumber(data.posts_count),
        totalReach: toNumber(engagement.reach),
        totalEngagements,
        avgEngagementRate: 0,
      };
    },

    /**
     * Engagement Sync (T-025.6, JOB-03).
     *
     * **GAP ARSITEKTUR TERBUKA (2026-09-23, dikonfirmasi dari dokumentasi
     * resmi Outstand — BUKAN diperbaiki di sini, butuh keputusan King
     * Rezi):** kontrak `fetchComments(outstandAccountId, cursor?)` men-scope
     * komentar per AKUN dengan pagination `cursor`. API resmi Outstand
     * TIDAK punya endpoint seperti itu — komentar hanya bisa diambil per
     * POST (`GET /v1/posts/{postId}/replies`, query `network` WAJIB,
     * `username` opsional), dan endpoint itu TIDAK punya pagination cursor
     * sama sekali. Tidak ada cara mengambil "semua komentar baru untuk satu
     * akun lintas semua post"-nya dalam satu call seperti yang diasumsikan
     * JOB-03 (`background-jobs.md`) — implementasi yang benar butuh:
     * (1) daftar post yang sudah dipublish untuk akun ini (`GET /v1/posts`
     * list, difilter/paginasi sendiri), (2) panggil `GET /v1/posts/{id}/replies`
     * per post. Ini perubahan arsitektur job sync, bukan sekadar
     * perbaikan path — method ini SENGAJA throw eksplisit.
     */
    async fetchComments(
      _outstandAccountId: string,
      _cursor?: string,
    ): Promise<FetchCommentsResult> {
      throw new OutstandIntegrationError({
        type: "client_error",
        message:
          "OutstandAdapter: fetchComments(outstandAccountId, cursor) tidak sesuai API resmi Outstand — komentar di-scope per POST (GET /v1/posts/{postId}/replies, query network wajib), tanpa pagination cursor, dan tidak ada endpoint 'semua komentar lintas post satu akun'. Butuh redesain JOB-03 Engagement Sync (list posts per akun lalu fetch replies per post) sebelum method ini bisa diimplementasikan — lihat laporan T-025 2026-09-23.",
        retryable: false,
      });
    },

    /**
     * Reply (T-025.6, T-054).
     *
     * **GAP ARSITEKTUR TERBUKA** — sama akar masalahnya dengan `fetchComments`
     * di atas: endpoint resmi `POST /v1/posts/{postId}/replies` body
     * `{ content, platform_post_id?, account_username?, parent_comment_id? }`
     * WAJIB tahu `postId`, sementara kontrak `replyToComment(outstandCommentId,
     * text)` hanya membawa id komentar — tidak ada cara menemukan `postId`
     * dari `outstandCommentId` saja tanpa endpoint tambahan. `InboxCommentData`
     * domain SUDAH menyimpan `outstandPostId` per komentar (lihat
     * `outstand-adapter.ts`), tapi kontrak method ini tidak menyalurkannya —
     * butuh field tambahan di kontrak. Method ini SENGAJA throw eksplisit.
     */
    async replyToComment(
      outstandCommentId: string,
      _text: string,
    ): Promise<ReplyToCommentResult> {
      throw new OutstandIntegrationError({
        type: "client_error",
        message: `OutstandAdapter: replyToComment(outstandCommentId, text) tidak sesuai API resmi Outstand — endpoint POST /v1/posts/{postId}/replies wajib tahu postId, sementara kontrak ini hanya membawa outstandCommentId ("${outstandCommentId}") tanpa outstandPostId. Butuh field tambahan di kontrak IOutstandAdapter sebelum method ini bisa diimplementasikan — lihat laporan T-025 2026-09-23.`,
        retryable: false,
      });
    },
  };
}
