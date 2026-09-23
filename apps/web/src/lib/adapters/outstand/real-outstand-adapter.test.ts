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
          contentFormat: ContentFormat.Reel,
          platformOptions: { coverImageUrl: "https://x/cover.png" },
        },
        { outstandAccountId: "acc-fb-1", contentFormat: ContentFormat.Post },
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
    // Known gap (2026-09-23): OutstandPostTargetInput doesn't carry the
    // target's platform/network, so per-platform overrides (Story/Reel/Pin,
    // ADR-039) cannot be sent as Outstand's real top-level network keys yet
    // — body must NOT contain a fabricated `targetOptions` key anymore.
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
        { outstandAccountId: "acc-1", contentFormat: ContentFormat.Post },
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
          { outstandAccountId: "acc-1", contentFormat: ContentFormat.Post },
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
          { outstandAccountId: "acc-1", contentFormat: ContentFormat.Post },
        ],
      }),
    ).rejects.toMatchObject({ type: "transient", retryable: true });
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

describe("RealOutstandAdapter.fetchComments / replyToComment (T-025.6, ADR-110) — architecture gap", () => {
  it("fetchComments throws OutstandIntegrationError describing the per-post vs per-account/cursor mismatch, WITHOUT calling fetch", async () => {
    const fetchImpl = vi.fn();
    const adapter = buildAdapter(fetchImpl);

    await expect(
      adapter.fetchComments("acc-1", "cursor-1"),
    ).rejects.toBeInstanceOf(OutstandIntegrationError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("replyToComment throws OutstandIntegrationError describing the missing outstandPostId, WITHOUT calling fetch", async () => {
    const fetchImpl = vi.fn();
    const adapter = buildAdapter(fetchImpl);

    await expect(
      adapter.replyToComment("cmt-1", "Thanks!"),
    ).rejects.toBeInstanceOf(OutstandIntegrationError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe("RealOutstandAdapter.connectAccount / exchangeConnectCode (T-025.4, ADR-105) — architecture gap", () => {
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

  it("exchangeConnectCode throws OutstandIntegrationError describing the code+state vs account_id/network_unique_id/username mismatch, WITHOUT calling fetch", async () => {
    const fetchImpl = vi.fn();
    const adapter = buildAdapter(fetchImpl);

    await expect(
      adapter.exchangeConnectCode({
        code: "auth-code-123",
        state: "irrelevant",
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
