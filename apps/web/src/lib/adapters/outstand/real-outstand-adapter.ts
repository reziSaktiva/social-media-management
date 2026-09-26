import {
  ContentFormat,
  SocialPlatform,
  type ConnectAccountInput,
  type ConnectAccountResult,
  type ConnectCallbackInput,
  type ConnectedAccountData,
  type ConfirmFacebookPagesInput,
  type ConfirmFacebookPagesResult,
  type FacebookPendingPage,
  type FetchCommentsResult,
  type ListPendingFacebookPagesInput,
  type ListPendingFacebookPagesResult,
  type InboxCommentData,
  type FetchPostMetricsResult,
  type FetchWorkspaceMetricsResult,
  type IOutstandAdapter,
  type OutstandMetricsPeriod,
  type OutstandPostMediaInput,
  type OutstandPostTargetInput,
  type OutstandPostTargetStatus,
  type PinterestBoard,
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
 * (`./index.ts`) — `OUTSTAND_API_KEY` wajib (ADR-119; tanpa key factory
 * throw, tidak ada fallback Fake di jalur produksi).
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
 *    TANPA network call). Platform multi-halaman (Facebook, KI-070) TETAP
 *    di luar scope method ini — `resolveConnectCallback` throw eksplisit
 *    kalau dipanggil untuk `SocialPlatform.Facebook`. **DISELESAIKAN
 *    TERPISAH ADR-115/ADR-116 (2026-09-24)** lewat 2 method baru
 *    `listPendingFacebookPages`/`confirmFacebookPagesConnection` (flow
 *    session-token + page-picker, `GET/POST
 *    /v1/social-accounts/pending/{sessionToken}[/finalize]`) — lihat
 *    implementasi keduanya di bawah.
 * 2. ~~`fetchComments`/`replyToComment` (JOB-03/T-054)~~ — **DISELESAIKAN
 *    ADR-113 (2026-09-24, redesain KI-068).** Kontrak `IOutstandAdapter`
 *    sekarang men-scope kedua method per POST (`outstandPostId` wajib),
 *    cocok dengan API resmi Outstand (`GET/POST /v1/posts/{id}/replies`) —
 *    lihat implementasi kedua method di bawah.
 * 3. ~~Platform-specific overrides (Story/Reel/Pin, ADR-039)~~ —
 *    **DISELESAIKAN (ADR-114, 2026-09-24, resolusi KI-069; Pinterest
 *    `board_id` menyusul menutup KI-072, ADR baru dicatat Gibran Project
 *    Manager).** `OutstandPostTargetInput` sekarang membawa `platform` per
 *    target, jadi `buildPostRequestBody` di bawah bisa membentuk top-level
 *    key BERNAMA NETWORK (`instagram`/`facebook`/`pinterest`/dst) untuk
 *    override format. Instagram Story dan Facebook Story/Reel sudah
 *    dikirim (field-nya sudah ada di domain kita). Pinterest `board_id`
 *    (wajib di API Outstand) sekarang dikirim KALAU
 *    `platformOptions.boardId` non-kosong (diisi UI board-picker Draft
 *    Editor). Satu create-post hanya boleh memuat SATU akun Pinterest:
 *    body hanya punya satu key `pinterest.board_id`, dan board itu milik
 *    satu akun. Tanpa `boardId`, atau kalau ada lebih dari satu akun
 *    Pinterest, call ditolak sebelum request dikirim — akun tidak masuk
 *    ke `accounts` tanpa `board_id`.
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
 * Bentuk `NormalizedReply` pada response `GET /v1/posts/{id}/replies`
 * (field `data`) — **diverifikasi terhadap OpenAPI spec resmi Outstand**
 * (`components.schemas.NormalizedReply`, `/v1/posts/openapi.json`).
 * `created_at` nullable persis sesuai spec (`type: ["string", "null"]`).
 * `replies` (nested, hanya muncul kalau `include_replies=true`) tidak
 * dipetakan — method ini sengaja tidak mengirim `include_replies`
 * (comments-only MVP, ADR-040, tanpa nested thread).
 */
interface RawNormalizedReply {
  id?: unknown;
  author?: unknown;
  text?: unknown;
  created_at?: unknown;
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

/**
 * `connectedAccounts[].id` di response finalize adalah id akun Outstand
 * (contoh `9dyJS`), bukan Facebook page id yang dikirim di `selectedPageIds`
 * (contoh `abc123`). Kalau ada irisan, buang akun di luar pilihan. Kalau
 * tidak ada irisan, simpan akun ber-handle selama jumlahnya tidak melebihi
 * pilihan — memotong berdasarkan id yang beda namespace akan mengosongkan
 * hasil connect yang sah.
 */
function selectConfirmedFacebookAccounts(
  accounts: ConnectedAccountData[],
  selectedPageIds: string[],
): ConnectedAccountData[] {
  if (accounts.length === 0) {
    throw new OutstandIntegrationError({
      type: "client_error",
      message:
        "OutstandAdapter: finalize Facebook tidak mengembalikan akun dengan handle yang valid.",
      retryable: false,
    });
  }

  const selected = new Set(selectedPageIds);
  const matched = accounts.filter((account) =>
    selected.has(account.outstandAccountId),
  );
  const chosen = matched.length > 0 ? matched : accounts;
  if (chosen.length > selectedPageIds.length) {
    throw new OutstandIntegrationError({
      type: "client_error",
      message:
        "OutstandAdapter: finalize Facebook mengembalikan lebih banyak akun daripada Page yang dipilih.",
      retryable: false,
    });
  }
  return chosen;
}

/**
 * `POST /v1/posts` hanya punya satu key `pinterest`. Dua akun Pinterest
 * dalam satu call akan menempelkan `board_id` akun pertama ke akun lain.
 * Tanpa `board_id`, akun tetap masuk `accounts` dan Outstand menolak pin.
 * Keduanya ditolak di sini, sebelum request dikirim.
 */
function assertSinglePinterestTargetWithBoard(
  targets: OutstandPostTargetInput[],
): void {
  const pinterestTargets = targets.filter(
    (target) => target.platform === SocialPlatform.Pinterest,
  );
  if (pinterestTargets.length > 1) {
    throw new OutstandIntegrationError({
      type: "client_error",
      message:
        "OutstandAdapter: satu create-post hanya bisa memuat satu akun Pinterest. Body POST /v1/posts hanya punya satu board_id, jadi akun Pinterest lain harus dikirim sebagai post terpisah.",
      retryable: false,
    });
  }
  const pinterestTarget = pinterestTargets[0];
  if (!pinterestTarget) return;

  const boardId = pinterestTarget.platformOptions?.boardId;
  const hasBoard = typeof boardId === "string" && boardId.trim().length > 0;
  if (!hasBoard) {
    throw new OutstandIntegrationError({
      type: "client_error",
      message:
        "OutstandAdapter: akun Pinterest wajib punya board_id. Tanpa board, request tidak dikirim.",
      retryable: false,
    });
  }
}

export function createRealOutstandAdapter(
  apiKey: string,
  options: RealOutstandAdapterOptions,
): IOutstandAdapter {
  const client = new OutstandHttpClient(apiKey, options);

  /**
   * Override per-platform (Story/Reel, ADR-039/ADR-107) untuk SATU target,
   * dipetakan ke bentuk asli Outstand — diverifikasi langsung lewat MCP
   * resmi `create_post` + cross-check OpenAPI spec
   * (`https://api.outstand.so/v1/posts/openapi.json`), ADR-114:
   *
   * - Instagram: TIDAK ADA flag eksplisit untuk Reel (auto-detect dari
   *   video di sisi Outstand) — hanya `Story` yang butuh override
   *   (`publishAsStory: true`). `Post`/`Reel` tidak mengirim key
   *   `instagram` sama sekali (tidak ada yang perlu diisi).
   * - Facebook: `Story` → `publishAsStory: true`, `Reel` →
   *   `publishAsReel: true`. `Post` tidak mengirim key `facebook`.
   * - Pinterest (menutup KI-072, sisa scope ADR-114): `board_id` WAJIB di
   *   API Outstand. Guard di `buildPostRequestBody` menolak target
   *   Pinterest tanpa `boardId`, dan menolak lebih dari satu akun
   *   Pinterest dalam satu call (satu key `pinterest` tidak boleh
   *   mewakili dua board). Kalau lolos, kirim `{ board_id, title?, link? }`
   *   — `title`/
   *   `link` diteruskan dari `platformOptions.pinTitle`/`pinLink` (field
   *   yang SUDAH ada di UI Draft Editor sejak sebelum KI-072, sebelumnya
   *   selalu diabaikan adapter). `alt_text`/`cover_image_url` (field valid
   *   lain di skema `pinterest` Outstand, diverifikasi lewat MCP resmi
   *   `create_post` + OpenAPI spec `api.outstand.so/v1/posts/openapi.json`)
   *   TIDAK diteruskan — domain/UI kita tidak mengumpulkan keduanya untuk
   *   Pinterest sama sekali (YAGNI, konsisten pola `reelCoverUrl` Instagram
   *   yang juga hanya dikirim kalau datanya ada).
   * - Platform lain: belum ada override yang didesain ADR-039/ADR-107,
   *   `null`.
   *
   * `null` berarti "tidak ada override untuk dikirim" — BEDA dari objek
   * kosong `{}` (yang tetap akan membentuk key top-level tanpa isi
   * berguna).
   */
  function computePlatformOverride(
    platform: SocialPlatform,
    contentFormat: ContentFormat,
    platformOptions?: Record<string, unknown>,
  ): Record<string, unknown> | null {
    if (platform === SocialPlatform.Instagram) {
      if (contentFormat === ContentFormat.Story) {
        return { publishAsStory: true };
      }
      // Reel: Outstand auto-detect video → Reel; kirim key `instagram`
      // HANYA kalau ada cover (`coverImageUrl` domain → `reelCoverUrl`).
      if (contentFormat === ContentFormat.Reel) {
        const cover =
          typeof platformOptions?.coverImageUrl === "string"
            ? platformOptions.coverImageUrl
            : undefined;
        return cover ? { reelCoverUrl: cover } : null;
      }
      return null;
    }
    if (platform === SocialPlatform.Facebook) {
      if (contentFormat === ContentFormat.Story) {
        return { publishAsStory: true };
      }
      if (contentFormat === ContentFormat.Reel) {
        return { publishAsReel: true };
      }
      return null;
    }
    if (platform === SocialPlatform.Pinterest) {
      const boardId =
        typeof platformOptions?.boardId === "string" &&
        platformOptions.boardId.trim().length > 0
          ? platformOptions.boardId.trim()
          : undefined;
      if (!boardId) {
        return null;
      }

      const override: Record<string, unknown> = { board_id: boardId };
      const title =
        typeof platformOptions?.pinTitle === "string"
          ? platformOptions.pinTitle.trim()
          : "";
      if (title.length > 0) {
        override.title = title;
      }
      const link =
        typeof platformOptions?.pinLink === "string"
          ? platformOptions.pinLink.trim()
          : "";
      if (link.length > 0) {
        override.link = link;
      }
      return override;
    }
    // Platform lain: belum ada override yang didesain.
    return null;
  }

  /**
   * `POST /v1/posts` body — diverifikasi terhadap OpenAPI spec resmi
   * Outstand: `accounts: string[]`, `content` ATAU `containers` (media),
   * `scheduledAt?: ISO8601`. Override per-platform (Story/Reel, ADR-039/
   * ADR-107, ADR-114) dikirim sebagai key top-level BERNAMA NETWORK.
   *
   * **Media:** kalau `media` non-kosong → `containers: [{ content, media }]`
   * (bukan top-level `content` saja). Tanpa media → `content` string seperti
   * sebelumnya (text-only).
   *
   * **Story caption:** Facebook/IG Story menolak caption — kalau SEMUA
   * target Story, `content` dikosongkan. Kalau ADA target Story campur
   * feed/Reel ber-caption → throw `client_error` (Outstand menolak
   * cross-post Story + captioned content dalam satu call).
   *
   * **Edge case multi-target network sama, contentFormat beda:** first-
   * match-wins + `console.warn` (lihat ADR-114).
   */
  function buildPostRequestBody(input: {
    targets: OutstandPostTargetInput[];
    caption: string;
    scheduledAt?: Date;
    media?: OutstandPostMediaInput[];
  }) {
    const hasStoryTarget = input.targets.some(
      (target) => target.contentFormat === ContentFormat.Story,
    );
    const hasNonStoryTarget = input.targets.some(
      (target) => target.contentFormat !== ContentFormat.Story,
    );
    const captionTrimmed = input.caption.trim();

    if (hasStoryTarget && hasNonStoryTarget && captionTrimmed.length > 0) {
      throw new OutstandIntegrationError({
        type: "client_error",
        message:
          "OutstandAdapter: tidak bisa mengirim Story bersama target feed/Reel yang ber-caption dalam satu create-post — Outstand menolak caption pada Story. Pisahkan publish Story (caption kosong) dari feed ber-caption.",
        retryable: false,
      });
    }

    // Story-only (atau Story + target lain tanpa caption) → content kosong.
    const contentForBody = hasStoryTarget ? "" : input.caption;

    assertSinglePinterestTargetWithBoard(input.targets);

    const overridesByNetwork: Record<string, Record<string, unknown>> = {};

    for (const target of input.targets) {
      const override = computePlatformOverride(
        target.platform,
        target.contentFormat,
        target.platformOptions,
      );
      if (!override) {
        continue;
      }

      const network = toOutstandNetwork(target.platform);
      const existing = overridesByNetwork[network];
      if (existing) {
        if (JSON.stringify(existing) !== JSON.stringify(override)) {
          console.warn(
            `[RealOutstandAdapter] Konflik contentFormat untuk network "${network}" dalam satu post — override pertama ${JSON.stringify(existing)} dipertahankan, override target berikutnya (outstandAccountId=${target.outstandAccountId}) ${JSON.stringify(override)} DIABAIKAN. Body Outstand POST /v1/posts hanya punya satu key per-network (bukan per-account).`,
          );
        }
        continue;
      }
      overridesByNetwork[network] = override;
    }

    const media = input.media?.filter(
      (item) => item.url.length > 0 && item.filename.length > 0,
    );
    const base = {
      accounts: input.targets.map((target) => target.outstandAccountId),
      scheduledAt: input.scheduledAt
        ? input.scheduledAt.toISOString()
        : undefined,
      ...overridesByNetwork,
    };

    if (media && media.length > 0) {
      return {
        ...base,
        containers: [
          {
            content: contentForBody,
            media: media.map((item) => ({
              url: item.url,
              filename: item.filename,
            })),
          },
        ],
      };
    }

    return {
      ...base,
      content: contentForBody,
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
    media?: OutstandPostMediaInput[];
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
     * Facebook Pages — list pending Pages (T-025.4, ADR-115, wire-format
     * dikoreksi ADR-116) — `GET /v1/social-accounts/pending/{sessionToken}`.
     * **Diverifikasi 2026-09-24** langsung dari dokumentasi resmi Outstand
     * (`docs/get-pending-connection-details`, `docs/configurations/facebook`
     * — OpenAPI JSON `api.outstand.so/openapi.json` tetap tidak bisa
     * diakses, tapi docs page HTML resmi berhasil dibaca via WebFetch,
     * lihat ADR-116 untuk detail lengkap). Response asli DIBUNGKUS di
     * `data.availablePages[]` (ADR-115 menebak flat `{ pages: [...] }`,
     * salah) — field per-page dipetakan `id`→`pageId`, `name`→`name`,
     * `profilePictureUrl`→`pictureUrl`, `category`→`category` (field lain
     * seperti `type`/`username`/`urn`/`accountId`/`address` tidak dipetakan,
     * kontrak `FacebookPendingPage` tidak membutuhkannya).
     */
    async listPendingFacebookPages({
      sessionToken,
    }: ListPendingFacebookPagesInput): Promise<ListPendingFacebookPagesResult> {
      const response = await client.request<Record<string, unknown>>(
        `/v1/social-accounts/pending/${encodeURIComponent(sessionToken)}`,
        { method: "GET" },
      );

      const data =
        typeof response.data === "object" && response.data !== null
          ? (response.data as Record<string, unknown>)
          : {};
      const rawPages = Array.isArray(data.availablePages)
        ? (data.availablePages as Record<string, unknown>[])
        : [];

      const pages: FacebookPendingPage[] = [];
      for (const raw of rawPages) {
        if (typeof raw.id !== "string" || raw.id.length === 0) continue;
        if (typeof raw.name !== "string" || raw.name.length === 0) continue;
        pages.push({
          pageId: raw.id,
          name: raw.name,
          pictureUrl:
            typeof raw.profilePictureUrl === "string"
              ? raw.profilePictureUrl
              : undefined,
          category: typeof raw.category === "string" ? raw.category : undefined,
        });
      }

      return { pages };
    },

    /**
     * Facebook Pages — confirm selected Pages (T-025.4, ADR-115,
     * wire-format dikoreksi ADR-116) — `POST
     * /v1/social-accounts/pending/{sessionToken}/finalize` (**path punya
     * suffix `/finalize`** — ADR-115 menebak `POST` langsung ke path yang
     * sama dengan `GET`, salah, lihat ADR-116). Body `{ selectedPageIds }`
     * (nama field ini TERKONFIRMASI BENAR sesuai tebakan ADR-115, tidak
     * berubah). Response asli `{ success, connectedAccounts: [{ id,
     * nickname, username, network, accountType }] }` (ADR-115 menebak
     * `{ accounts: [...] }`, salah) — dipetakan `id`→`outstandAccountId`,
     * `username` (fallback `nickname`)→`handle`, `platform` di-hardcode
     * `SocialPlatform.Facebook` (method ini SELALU dipanggil dalam konteks
     * Facebook Pages, kontrak `ConfirmFacebookPagesResult` ADR-115
     * menyatakan ini eksplisit). Validasi `selectedPageIds` tidak kosong
     * diulang di sini (defense-in-depth, ADR-115 — jangan cuma percaya
     * `WorkspaceService`/UI).
     */
    async confirmFacebookPagesConnection({
      sessionToken,
      selectedPageIds,
    }: ConfirmFacebookPagesInput): Promise<ConfirmFacebookPagesResult> {
      if (selectedPageIds.length === 0) {
        throw new OutstandIntegrationError({
          type: "client_error",
          message:
            "OutstandAdapter: confirmFacebookPagesConnection butuh minimal satu selectedPageIds.",
          retryable: false,
        });
      }

      const response = await client.request<Record<string, unknown>>(
        `/v1/social-accounts/pending/${encodeURIComponent(sessionToken)}/finalize`,
        { method: "POST", body: { selectedPageIds } },
      );

      const rawAccounts = Array.isArray(response.connectedAccounts)
        ? (response.connectedAccounts as Record<string, unknown>[])
        : [];

      const accounts: ConnectedAccountData[] = [];
      for (const raw of rawAccounts) {
        if (typeof raw.id !== "string" || raw.id.length === 0) continue;
        const handle =
          (typeof raw.username === "string" && raw.username) ||
          (typeof raw.nickname === "string" && raw.nickname) ||
          "";
        if (handle.trim().length === 0) continue;
        accounts.push({
          outstandAccountId: raw.id,
          platform: SocialPlatform.Facebook,
          handle,
          status: "active",
        });
      }

      return {
        accounts: selectConfirmedFacebookAccounts(accounts, selectedPageIds),
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
        media: input.media,
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
        media: input.media,
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
     * parameter ini secara fungsional untuk "mengingat" target — caller
     * yang menyuplai daftar lewat ADR-108; lihat docstring parameter di
     * `packages/shared/src/contracts/outstand-adapter.ts`).
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
     * networks") — BEDA endpoint dari `cancelScheduledPost`.
     *
     * **Scoped delete tidak didukung API Outstand:** endpoint `/remote`
     * selalu menghapus dari SEMUA akun. Kalau caller menyuplai `accountIds`
     * non-kosong (niat single-account, mis. retry satu target gagal),
     * JANGAN panggil DELETE — throw `client_error` supaya caller
     * (`RetryFailedTargetUseCase`) skip wipe sibling yang sudah
     * published/scheduled. Tanpa `accountIds` (atau array kosong) =
     * hapus seluruh remote seperti semula.
     */
    async deletePost(
      outstandPostId: string,
      accountIds?: string[],
    ): Promise<void> {
      if (accountIds && accountIds.length > 0) {
        throw new OutstandIntegrationError({
          type: "client_error",
          message:
            "OutstandAdapter.deletePost: API Outstand tidak mendukung scoped delete per akun (DELETE /remote selalu menghapus SEMUA akun). Jangan panggil dengan accountIds — skip delete kalau post masih punya sibling target live, atau hapus tanpa filter hanya bila target ini satu-satunya.",
          retryable: false,
        });
      }
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
     * Pinterest boards (menutup KI-072, sisa scope ADR-114) — **diverifikasi
     * terhadap OpenAPI spec resmi Outstand**
     * (`GET https://api.outstand.so/v1/pinterest/accounts/{id}/boards`,
     * diambil 2026-09-25 lewat WebFetch `api.outstand.so/v1/pinterest/openapi.json`
     * + cross-check MCP resmi `list_pinterest_boards`): response
     * `{ success, data: [{ id, name, description?, pin_count, privacy,
     * owner: { username }, created_at }], count }`. Dipetakan minimal
     * (`id`/`name`) — field lain (`description`/`pin_count`/`privacy`/
     * `owner`/`created_at`) tidak dibutuhkan kontrak `PinterestBoard`
     * (YAGNI, dropdown board hanya perlu label+value).
     */
    async listPinterestBoards(
      outstandAccountId: string,
    ): Promise<PinterestBoard[]> {
      const response = await client.request<Record<string, unknown>>(
        `/v1/pinterest/accounts/${encodeURIComponent(outstandAccountId)}/boards`,
        { method: "GET" },
      );

      const rawBoards = Array.isArray(response.data)
        ? (response.data as Record<string, unknown>[])
        : [];

      const boards: PinterestBoard[] = [];
      for (const raw of rawBoards) {
        if (typeof raw.id !== "string" || raw.id.length === 0) continue;
        if (typeof raw.name !== "string" || raw.name.length === 0) continue;
        boards.push({ id: raw.id, name: raw.name });
      }

      return boards;
    },

    /**
     * Engagement Sync (T-025.6, JOB-03, redesain KI-068/ADR-113) —
     * **diverifikasi terhadap OpenAPI spec resmi Outstand:**
     * `GET /v1/posts/{postId}/replies` (query `network` WAJIB, `username`
     * opsional — kita selalu mengirim `username` supaya tidak pernah kena
     * 400 disambiguasi saat satu post publish ke >1 akun di network yang
     * sama). Response: `{ success, data: NormalizedReply[] }` — dibaca dari
     * `data` (bentuk cross-network konsisten), BUKAN `replies` (field itu
     * deprecated, bentuknya beda per network). `NormalizedReply` tidak
     * membawa post id ATAU account id — keduanya di-echo balik dari input
     * (`outstandPostId`, `platform`), bukan dari wire response (lihat
     * catatan `InboxCommentData` di `packages/shared/src/contracts/outstand-adapter.ts`
     * untuk kenapa `outstandAccountId` dihapus dari kontrak ini).
     * `include_replies` sengaja TIDAK dikirim (default top-level only) —
     * comments-only MVP (ADR-040) tidak butuh nested thread.
     *
     * `created_at` bisa `null` (spec: `type: ["string", "null"]`) — fallback
     * `new Date()` (waktu fetch) kalau Outstand tidak mengembalikannya,
     * supaya `InboxCommentData.receivedAt` (non-nullable) tetap terisi
     * masuk akal alih-alih melempar error untuk kasus tepi ini.
     */
    async fetchComments({
      outstandPostId,
      platform,
      accountUsername,
    }): Promise<FetchCommentsResult> {
      const response = await client.request<Record<string, unknown>>(
        `/v1/posts/${encodeURIComponent(outstandPostId)}/replies`,
        {
          method: "GET",
          query: {
            network: toOutstandNetwork(platform),
            username: accountUsername,
          },
        },
      );

      const rawReplies = Array.isArray(response.data)
        ? (response.data as RawNormalizedReply[])
        : [];

      const comments: InboxCommentData[] = [];
      for (const raw of rawReplies) {
        if (typeof raw.id !== "string" || raw.id.length === 0) continue;

        comments.push({
          outstandCommentId: raw.id,
          platform,
          authorHandle: typeof raw.author === "string" ? raw.author : "",
          content: typeof raw.text === "string" ? raw.text : "",
          outstandPostId,
          receivedAt: toDateOrNull(raw.created_at) ?? new Date(),
        });
      }

      return { comments };
    },

    /**
     * Reply (T-025.6, T-054, redesain KI-068/ADR-113, KI-071) —
     * **diverifikasi terhadap OpenAPI spec resmi Outstand:**
     * `POST /v1/posts/{postId}/replies` body
     * `{ content, account_username, parent_comment_id? }`. Response
     * `{ success, reply_id }`.
     *
     * `account_username` di-spec Outstand opsional, tapi kita SELALU
     * mengirimnya (pola sama `fetchComments` / query `username`) supaya
     * reply ke post multi-akun di network yang sama tidak 400 (KI-071).
     */
    async replyToComment({
      outstandPostId,
      content,
      accountUsername,
      parentOutstandCommentId,
    }): Promise<ReplyToCommentResult> {
      const response = await client.request<Record<string, unknown>>(
        `/v1/posts/${encodeURIComponent(outstandPostId)}/replies`,
        {
          method: "POST",
          body: {
            content,
            account_username: accountUsername,
            ...(parentOutstandCommentId
              ? { parent_comment_id: parentOutstandCommentId }
              : {}),
          },
        },
      );

      const replyId = response.reply_id;
      if (typeof replyId !== "string" || replyId.length === 0) {
        throw new OutstandIntegrationError({
          type: "client_error",
          message:
            "OutstandAdapter: response publish-a-comment (POST /v1/posts/{id}/replies) tidak mengandung reply_id yang valid.",
          retryable: false,
        });
      }

      return { outstandReplyId: replyId };
    },
  };
}
