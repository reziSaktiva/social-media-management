import { ContentFormat, SocialPlatform } from "@social/shared";
import { describe, expect, it, vi } from "vitest";
import { createRealOutstandAdapter } from "./real-outstand-adapter";
import type { FetchLike } from "./outstand-http-client";
import { OutstandIntegrationError } from "./outstand-integration-error";

const API_KEY = "test-outstand-api-key";
const APP_ORIGIN = "https://app.example.local";
const ORG_ID = "org-abc123";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function buildAdapter(
  fetchImpl: ReturnType<typeof vi.fn>,
  overrides: { orgId?: string | null } = {},
) {
  return createRealOutstandAdapter(API_KEY, {
    appOrigin: APP_ORIGIN,
    orgId: overrides.orgId === null ? undefined : (overrides.orgId ?? ORG_ID),
    fetchImpl: fetchImpl as unknown as FetchLike,
  });
}

describe("RealOutstandAdapter.schedulePost / publishNow (T-025.2/T-025.3)", () => {
  it("schedulePost sends ONE call with all targets + scheduledAt, mapping to Outstand's real `content`/`accounts` shape", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(200, { success: true, post: { id: "post-123" } }),
      );
    const adapter = buildAdapter(fetchImpl);
    const scheduledAt = new Date("2026-10-01T10:00:00.000Z");

    const result = await adapter.schedulePost({
      caption: "Hello world",
      scheduledAt,
      targets: [
        {
          outstandAccountId: "acc-ig-1",
          platform: SocialPlatform.Instagram,
          contentFormat: ContentFormat.Reel,
          platformOptions: { coverImageUrl: "https://x/cover.png" },
        },
        {
          outstandAccountId: "acc-fb-1",
          platform: SocialPlatform.Facebook,
          contentFormat: ContentFormat.Post,
        },
      ],
    });

    expect(result).toEqual({ outstandPostId: "post-123" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://api.outstand.so/v1/posts");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe(`Bearer ${API_KEY}`);

    const body = JSON.parse(init.body);
    expect(body.accounts).toEqual(["acc-ig-1", "acc-fb-1"]);
    expect(body.content).toBe("Hello world");
    expect(body.scheduledAt).toBe(scheduledAt.toISOString());
    // Instagram Reel + Facebook Post: neither needs an override (ADR-114) —
    // Reel has no explicit Instagram flag (auto-detect), Post is the
    // default shape for Facebook.
    expect(body.instagram).toBeUndefined();
    expect(body.facebook).toBeUndefined();
    expect(body.targetOptions).toBeUndefined();
    expect(body.caption).toBeUndefined();
  });

  it("publishNow sends the same shape WITHOUT scheduledAt", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(200, { success: true, post: { id: "post-456" } }),
      );
    const adapter = buildAdapter(fetchImpl);

    const result = await adapter.publishNow({
      caption: "Ship it now",
      targets: [
        {
          outstandAccountId: "acc-1",
          platform: SocialPlatform.LinkedIn,
          contentFormat: ContentFormat.Post,
        },
      ],
    });

    expect(result).toEqual({ outstandPostId: "post-456" });
    const [, init] = fetchImpl.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.scheduledAt).toBeUndefined();
    expect(body.content).toBe("Ship it now");
  });

  it("throws OutstandIntegrationError when create-a-post response has no post.id", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(200, { success: true }));
    const adapter = buildAdapter(fetchImpl);

    await expect(
      adapter.schedulePost({
        caption: "x",
        scheduledAt: new Date(),
        targets: [
          {
            outstandAccountId: "acc-1",
            platform: SocialPlatform.Instagram,
            contentFormat: ContentFormat.Post,
          },
        ],
      }),
    ).rejects.toBeInstanceOf(OutstandIntegrationError);
  });

  it("propagates HTTP error mapping (5xx → transient/retryable) from schedulePost", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(502, { message: "bad gateway" }));
    const adapter = buildAdapter(fetchImpl);

    await expect(
      adapter.schedulePost({
        caption: "x",
        scheduledAt: new Date(),
        targets: [
          {
            outstandAccountId: "acc-1",
            platform: SocialPlatform.Instagram,
            contentFormat: ContentFormat.Post,
          },
        ],
      }),
    ).rejects.toMatchObject({ type: "transient", retryable: true });
  });
});

describe("RealOutstandAdapter.schedulePost — platform-specific overrides (KI-069, ADR-114)", () => {
  async function schedulePostAndGetBody(
    fetchImpl: ReturnType<typeof vi.fn>,
    targets: Parameters<
      ReturnType<typeof buildAdapter>["schedulePost"]
    >[0]["targets"],
  ) {
    const adapter = buildAdapter(fetchImpl);
    await adapter.schedulePost({
      caption: "caption",
      scheduledAt: new Date("2026-10-01T10:00:00.000Z"),
      targets,
    });
    const [, init] = fetchImpl.mock.calls[0];
    return JSON.parse(init.body);
  }

  it("sends `instagram: { publishAsStory: true }` for Instagram Story", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(200, { success: true, post: { id: "post-1" } }),
      );

    const body = await schedulePostAndGetBody(fetchImpl, [
      {
        outstandAccountId: "acc-ig-1",
        platform: SocialPlatform.Instagram,
        contentFormat: ContentFormat.Story,
      },
    ]);

    expect(body.instagram).toEqual({ publishAsStory: true });
    expect(body.facebook).toBeUndefined();
    expect(body.pinterest).toBeUndefined();
  });

  it("sends NO `instagram` key for Instagram Reel (no explicit flag — auto-detected by Outstand)", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(200, { success: true, post: { id: "post-1" } }),
      );

    const body = await schedulePostAndGetBody(fetchImpl, [
      {
        outstandAccountId: "acc-ig-1",
        platform: SocialPlatform.Instagram,
        contentFormat: ContentFormat.Reel,
      },
    ]);

    expect(body.instagram).toBeUndefined();
  });

  it("sends `facebook: { publishAsStory: true }` for Facebook Story", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(200, { success: true, post: { id: "post-1" } }),
      );

    const body = await schedulePostAndGetBody(fetchImpl, [
      {
        outstandAccountId: "acc-fb-1",
        platform: SocialPlatform.Facebook,
        contentFormat: ContentFormat.Story,
      },
    ]);

    expect(body.facebook).toEqual({ publishAsStory: true });
  });

  it("sends `facebook: { publishAsReel: true }` for Facebook Reel", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(200, { success: true, post: { id: "post-1" } }),
      );

    const body = await schedulePostAndGetBody(fetchImpl, [
      {
        outstandAccountId: "acc-fb-1",
        platform: SocialPlatform.Facebook,
        contentFormat: ContentFormat.Reel,
      },
    ]);

    expect(body.facebook).toEqual({ publishAsReel: true });
  });

  it("sends NO override key for a plain Post (Instagram or Facebook)", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(200, { success: true, post: { id: "post-1" } }),
      );

    const body = await schedulePostAndGetBody(fetchImpl, [
      {
        outstandAccountId: "acc-ig-1",
        platform: SocialPlatform.Instagram,
        contentFormat: ContentFormat.Post,
      },
      {
        outstandAccountId: "acc-fb-1",
        platform: SocialPlatform.Facebook,
        contentFormat: ContentFormat.Post,
      },
    ]);

    expect(body.instagram).toBeUndefined();
    expect(body.facebook).toBeUndefined();
  });

  it("NEVER sends a `pinterest` key, even for ContentFormat.Pin (board_id not collected by our domain/UI yet — deliberate, KI-069/ADR-114)", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(200, { success: true, post: { id: "post-1" } }),
      );

    const body = await schedulePostAndGetBody(fetchImpl, [
      {
        outstandAccountId: "acc-pin-1",
        platform: SocialPlatform.Pinterest,
        contentFormat: ContentFormat.Pin,
      },
    ]);

    expect(body.pinterest).toBeUndefined();
  });

  it("first-match-wins + warns on a same-network contentFormat conflict across multiple targets", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(200, { success: true, post: { id: "post-1" } }),
      );
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const body = await schedulePostAndGetBody(fetchImpl, [
      {
        outstandAccountId: "acc-fb-1",
        platform: SocialPlatform.Facebook,
        contentFormat: ContentFormat.Story,
      },
      {
        outstandAccountId: "acc-fb-2",
        platform: SocialPlatform.Facebook,
        contentFormat: ContentFormat.Reel,
      },
    ]);

    // First target (Story) wins — second (Reel) is dropped, not silently.
    expect(body.facebook).toEqual({ publishAsStory: true });
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain("Konflik contentFormat");

    warnSpy.mockRestore();
  });
});

describe("RealOutstandAdapter.fetchPostOutcome (T-025.2, ADR-092/ADR-108)", () => {
  it("maps get-post-details response (post.socialAccounts[], real `id` field) per account, defaulting missing expected accounts to pending", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        success: true,
        post: {
          id: "post-123",
          socialAccounts: [
            {
              id: "acc-1",
              nickname: "My Company",
              network: "instagram",
              username: "mycompany",
              status: "published",
              platformPostId: "ig-media-1",
              platformPostUrl: "https://instagram.com/p/abc",
              publishedAt: "2026-09-20T00:00:00.000Z",
              error: null,
            },
          ],
        },
      }),
    );
    const adapter = buildAdapter(fetchImpl);

    const result = await adapter.fetchPostOutcome("post-123", [
      "acc-1",
      "acc-2",
    ]);

    expect(result).toEqual([
      {
        outstandAccountId: "acc-1",
        status: "published",
        error: null,
        platformPostId: "ig-media-1",
        platformPostUrl: "https://instagram.com/p/abc",
        publishedAt: new Date("2026-09-20T00:00:00.000Z"),
      },
      {
        outstandAccountId: "acc-2",
        status: "pending",
        error: null,
        platformPostId: null,
        platformPostUrl: null,
        publishedAt: null,
      },
    ]);

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://api.outstand.so/v1/posts/post-123");
    expect(init.method).toBe("GET");
  });

  it("normalizes a failed-account status + error message", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        success: true,
        post: {
          id: "post-123",
          socialAccounts: [
            { id: "acc-1", status: "failed", error: "token revoked" },
          ],
        },
      }),
    );
    const adapter = buildAdapter(fetchImpl);

    const result = await adapter.fetchPostOutcome("post-123", ["acc-1"]);

    expect(result[0].status).toBe("failed");
    expect(result[0].error).toBe("token revoked");
  });
});

describe("RealOutstandAdapter.cancelScheduledPost / deletePost (T-030/T-034.4)", () => {
  it("cancelScheduledPost sends DELETE /v1/posts/{id} (cancel-before-publish, not remote delete)", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));
    const adapter = buildAdapter(fetchImpl);

    await adapter.cancelScheduledPost("post-123");

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://api.outstand.so/v1/posts/post-123");
    expect(init.method).toBe("DELETE");
  });

  it("deletePost calls DELETE /v1/posts/{id}/remote (delete-from-social-networks, distinct endpoint from cancel)", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(200, { success: true, results: [] }));
    const adapter = buildAdapter(fetchImpl);

    // Known gap (2026-09-23): the real /remote endpoint has no per-account
    // filter, so accountIds is accepted for contract compatibility but not
    // forwarded to Outstand.
    await adapter.deletePost("post-123", ["acc-1", "acc-2"]);

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://api.outstand.so/v1/posts/post-123/remote");
    expect(init.method).toBe("DELETE");
  });
});

describe("RealOutstandAdapter analytics (fetchPostMetrics/fetchWorkspaceMetrics, T-041 via T-025)", () => {
  it("fetchPostMetrics reads aggregated_metrics.total_* (real field names) and computes engagementRate when absent", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        success: true,
        post: {
          id: "post-123",
          publishedAt: "2026-09-20T00:00:00.000Z",
          createdAt: "2026-09-19T00:00:00.000Z",
        },
        metrics_by_account: [],
        aggregated_metrics: {
          total_impressions: 1000,
          total_reach: 500,
          total_likes: 40,
          total_comments: 5,
          total_shares: 5,
          total_views: 100,
        },
      }),
    );
    const adapter = buildAdapter(fetchImpl);

    const result = await adapter.fetchPostMetrics("post-123");

    expect(result).toEqual({
      impressions: 1000,
      reach: 500,
      likes: 40,
      comments: 5,
      shares: 5,
      clicks: null,
      engagementRate: 0.1,
    });

    const [url] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://api.outstand.so/v1/posts/post-123/analytics");
  });

  it("fetchWorkspaceMetrics passes since/until as Unix timestamps to /v1/social-accounts/{id}/metrics and maps the best-effort shape", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        success: true,
        data: {
          account_id: "acc-1",
          network: "instagram",
          followers_count: 1000,
          posts_count: 12,
          engagement: { likes: 300, comments: 80, shares: 20, reach: 5000 },
        },
      }),
    );
    const adapter = buildAdapter(fetchImpl);

    const result = await adapter.fetchWorkspaceMetrics("acc-1", "last_30_days");

    expect(result.totalPosts).toBe(12);
    expect(result.totalReach).toBe(5000);
    expect(result.totalEngagements).toBe(400);
    // Known gap (2026-09-23): Outstand's account metrics endpoint has no
    // average-engagement-rate field at all.
    expect(result.avgEngagementRate).toBe(0);

    const [url] = fetchImpl.mock.calls[0];
    const parsed = new URL(url);
    expect(parsed.pathname).toBe("/v1/social-accounts/acc-1/metrics");
    expect(parsed.searchParams.has("since")).toBe(true);
    expect(parsed.searchParams.has("until")).toBe(true);
    expect(Number(parsed.searchParams.get("since"))).not.toBeNaN();
  });
});

describe("RealOutstandAdapter.fetchComments / replyToComment (T-025.6, redesain KI-068/ADR-113)", () => {
  it("fetchComments calls GET /v1/posts/{id}/replies with network+username query and maps NormalizedReply[] from `data`", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        success: true,
        replies: [],
        data: [
          {
            id: "reply-1",
            author: "johndoe",
            text: "Great post!",
            created_at: "2026-01-15T10:30:00Z",
          },
          {
            id: "reply-2",
            author: "janedoe",
            text: "Agreed!",
            created_at: null,
          },
        ],
      }),
    );
    const adapter = buildAdapter(fetchImpl);

    const result = await adapter.fetchComments({
      outstandPostId: "post-123",
      platform: SocialPlatform.Twitter,
      accountUsername: "mycompany",
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    const parsed = new URL(url);
    expect(parsed.pathname).toBe("/v1/posts/post-123/replies");
    // Twitter -> "x" (SAME mapping as `toOutstandNetwork` dipakai `connectAccount`/`schedulePost`).
    expect(parsed.searchParams.get("network")).toBe("x");
    expect(parsed.searchParams.get("username")).toBe("mycompany");
    expect(init.method).toBe("GET");

    expect(result.comments).toHaveLength(2);
    expect(result.comments[0]).toEqual({
      outstandCommentId: "reply-1",
      platform: SocialPlatform.Twitter,
      authorHandle: "johndoe",
      content: "Great post!",
      outstandPostId: "post-123",
      receivedAt: new Date("2026-01-15T10:30:00Z"),
    });
    // `created_at: null` -> fallback ke waktu fetch (bukan error), lihat docstring method ini.
    expect(result.comments[1].receivedAt).toBeInstanceOf(Date);
  });

  it("fetchComments skips malformed entries (missing/empty id) instead of throwing", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        success: true,
        replies: [],
        data: [
          { author: "no-id", text: "missing id field entirely" },
          { id: "", author: "empty-id", text: "empty id string" },
          { id: "reply-valid", author: "ok", text: "valid", created_at: null },
        ],
      }),
    );
    const adapter = buildAdapter(fetchImpl);

    const result = await adapter.fetchComments({
      outstandPostId: "post-123",
      platform: SocialPlatform.Instagram,
      accountUsername: "mycompany",
    });

    expect(result.comments).toHaveLength(1);
    expect(result.comments[0].outstandCommentId).toBe("reply-valid");
  });

  it("replyToComment calls POST /v1/posts/{id}/replies with content + parent_comment_id and maps reply_id", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(200, { success: true, reply_id: "platform-reply-1" }),
      );
    const adapter = buildAdapter(fetchImpl);

    const result = await adapter.replyToComment({
      outstandPostId: "post-123",
      content: "Great post! I agree with you.",
      parentOutstandCommentId: "comment-abc",
    });

    expect(result).toEqual({ outstandReplyId: "platform-reply-1" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://api.outstand.so/v1/posts/post-123/replies");
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body);
    expect(body).toEqual({
      content: "Great post! I agree with you.",
      parent_comment_id: "comment-abc",
    });
  });

  it("replyToComment omits parent_comment_id when parentOutstandCommentId is not given", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(200, { success: true, reply_id: "platform-reply-2" }),
      );
    const adapter = buildAdapter(fetchImpl);

    await adapter.replyToComment({
      outstandPostId: "post-123",
      content: "No threading here.",
    });

    const [, init] = fetchImpl.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body).toEqual({ content: "No threading here." });
  });

  it("replyToComment throws OutstandIntegrationError when response has no valid reply_id", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(200, { success: true }));
    const adapter = buildAdapter(fetchImpl);

    await expect(
      adapter.replyToComment({ outstandPostId: "post-123", content: "Hi" }),
    ).rejects.toBeInstanceOf(OutstandIntegrationError);
  });
});

/** Base64url JSON state — SAMA bentuknya dengan `encodeState` privat di `real-outstand-adapter.ts` (ADR-105/ADR-112), dipakai untuk membangun `state` yang valid di test tanpa meng-export helper privat itu. */
function buildState(payload: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

describe("RealOutstandAdapter.connectAccount / resolveConnectCallback (T-025.4, ADR-105, redesain ADR-112)", () => {
  it("connectAccount builds the real Outstand redirect URL directly (no HTTP call) using OUTSTAND_ORG_ID", async () => {
    const fetchImpl = vi.fn();
    const adapter = buildAdapter(fetchImpl);

    const result = await adapter.connectAccount({
      workspaceId: "ws-1",
      platform: SocialPlatform.Instagram,
    });

    expect(fetchImpl).not.toHaveBeenCalled();
    const url = new URL(result.redirectUrl);
    expect(url.origin).toBe("https://www.outstand.so");
    expect(url.pathname).toBe(`/app/api/socials/instagram/${ORG_ID}`);
    const redirectUri = url.searchParams.get("redirect_uri");
    expect(redirectUri).toContain(
      `${APP_ORIGIN}/api/integrations/outstand/callback`,
    );
    expect(redirectUri).toContain("state=");
  });

  it("connectAccount maps SocialPlatform.Twitter to Outstand's 'x' network name", async () => {
    const fetchImpl = vi.fn();
    const adapter = buildAdapter(fetchImpl);

    const result = await adapter.connectAccount({
      workspaceId: "ws-1",
      platform: SocialPlatform.Twitter,
    });

    const url = new URL(result.redirectUrl);
    expect(url.pathname).toBe(`/app/api/socials/x/${ORG_ID}`);
  });

  it("connectAccount throws OutstandIntegrationError when OUTSTAND_ORG_ID is not configured", async () => {
    const fetchImpl = vi.fn();
    const adapter = buildAdapter(fetchImpl, { orgId: null });

    await expect(
      adapter.connectAccount({
        workspaceId: "ws-1",
        platform: SocialPlatform.Instagram,
      }),
    ).rejects.toBeInstanceOf(OutstandIntegrationError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("resolveConnectCallback maps account_id/username directly to ConnectedAccountData (ADR-112 — no exchange/HTTP call, platform from state)", async () => {
    const fetchImpl = vi.fn();
    const adapter = buildAdapter(fetchImpl);
    const state = buildState({
      workspaceId: "ws-1",
      platform: SocialPlatform.Instagram,
      nonce: "nonce-1",
    });

    const result = await adapter.resolveConnectCallback({
      state,
      outstandAccountId: "acc-ig-1",
      username: "@realuser",
    });

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(result).toEqual({
      outstandAccountId: "acc-ig-1",
      platform: SocialPlatform.Instagram,
      handle: "@realuser",
      status: "active",
    });
  });

  it("resolveConnectCallback throws OutstandIntegrationError for a malformed state, WITHOUT calling fetch", async () => {
    const fetchImpl = vi.fn();
    const adapter = buildAdapter(fetchImpl);

    await expect(
      adapter.resolveConnectCallback({
        state: "not-a-valid-base64url-json-state",
        outstandAccountId: "acc-ig-1",
        username: "@realuser",
      }),
    ).rejects.toBeInstanceOf(OutstandIntegrationError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("resolveConnectCallback throws OutstandIntegrationError for Facebook (multi-page flow out of scope, KI-070), WITHOUT calling fetch", async () => {
    const fetchImpl = vi.fn();
    const adapter = buildAdapter(fetchImpl);
    const state = buildState({
      workspaceId: "ws-1",
      platform: SocialPlatform.Facebook,
      nonce: "nonce-1",
    });

    await expect(
      adapter.resolveConnectCallback({
        state,
        outstandAccountId: "page-1",
        username: "Fake Page",
      }),
    ).rejects.toBeInstanceOf(OutstandIntegrationError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("resolveConnectCallback throws OutstandIntegrationError when outstandAccountId/username is empty, WITHOUT calling fetch", async () => {
    const fetchImpl = vi.fn();
    const adapter = buildAdapter(fetchImpl);
    const state = buildState({
      workspaceId: "ws-1",
      platform: SocialPlatform.Instagram,
      nonce: "nonce-1",
    });

    await expect(
      adapter.resolveConnectCallback({
        state,
        outstandAccountId: "",
        username: "@realuser",
      }),
    ).rejects.toBeInstanceOf(OutstandIntegrationError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe("RealOutstandAdapter.uploadMediaWorkingCopy (T-025.5, ADR-106)", () => {
  it("chains POST /v1/media/upload → PUT bytes → POST /v1/media/{id}/confirm, returning the mapped result", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(200, {
          success: true,
          data: {
            id: "media-1",
            upload_url: "https://uploads.outstand.example/put-here",
            expires_in: 3600,
          },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 })) // PUT bytes
      .mockResolvedValueOnce(
        jsonResponse(200, {
          success: true,
          data: {
            id: "media-1",
            filename: "upload-abc.png",
            url: "https://outstand.example/media/media-1.png",
            content_type: "image/png",
            size: 10,
            status: "active",
            created_at: "2026-09-23T00:00:00.000Z",
            expires_at: "2026-11-22T00:00:00.000Z",
          },
        }),
      );
    const adapter = buildAdapter(fetchImpl);

    const result = await adapter.uploadMediaWorkingCopy({
      fileBuffer: Buffer.from("fake-bytes"),
      mimeType: "image/png",
    });

    expect(result).toEqual({
      outstandMediaId: "media-1",
      outstandMediaUrl: "https://outstand.example/media/media-1.png",
      expiresAt: new Date("2026-11-22T00:00:00.000Z"),
    });

    expect(fetchImpl).toHaveBeenCalledTimes(3);
    const [firstUrl, firstInit] = fetchImpl.mock.calls[0];
    expect(firstUrl).toBe("https://api.outstand.so/v1/media/upload");
    const firstBody = JSON.parse(firstInit.body);
    expect(firstBody.content_type).toBe("image/png");
    expect(typeof firstBody.filename).toBe("string");
    expect(firstBody.filename.length).toBeGreaterThan(0);

    const [putUrl, putInit] = fetchImpl.mock.calls[1];
    expect(putUrl).toBe("https://uploads.outstand.example/put-here");
    expect(putInit.method).toBe("PUT");

    const [confirmUrl, confirmInit] = fetchImpl.mock.calls[2];
    expect(confirmUrl).toBe("https://api.outstand.so/v1/media/media-1/confirm");
    expect(JSON.parse(confirmInit.body)).toEqual({ size: 10 });
  });

  it("throws OutstandIntegrationError when the upload step returns no upload_url/id", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(200, { success: true, data: {} }));
    const adapter = buildAdapter(fetchImpl);

    await expect(
      adapter.uploadMediaWorkingCopy({
        fileBuffer: Buffer.from("x"),
        mimeType: "image/png",
      }),
    ).rejects.toBeInstanceOf(OutstandIntegrationError);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
