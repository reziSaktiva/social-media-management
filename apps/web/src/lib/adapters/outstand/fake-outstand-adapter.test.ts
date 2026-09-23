import { SocialPlatform } from "@social/shared";
import { describe, expect, it } from "vitest";
import { fakeOutstandAdapter } from "./fake-outstand-adapter";

describe("fakeOutstandAdapter.connectAccount (T-013/T-015.3, ADR-105, redesain ADR-112)", () => {
  it("returns a redirectUrl that loops back to our own callback route, not an external domain, carrying account_id/username/state (ADR-112 — not code)", async () => {
    const result = await fakeOutstandAdapter.connectAccount({
      workspaceId: "ws-1",
      platform: SocialPlatform.Instagram,
    });

    expect(result.redirectUrl).toMatch(
      /^\/api\/integrations\/outstand\/callback\?account_id=.+&username=.+&network_unique_id=.+&state=.+$/,
    );
  });

  it("returns a different account_id/state on every call (no delay/failure simulation, ADR-059)", async () => {
    const first = await fakeOutstandAdapter.connectAccount({
      workspaceId: "ws-1",
      platform: SocialPlatform.Instagram,
    });
    const second = await fakeOutstandAdapter.connectAccount({
      workspaceId: "ws-1",
      platform: SocialPlatform.Instagram,
    });

    expect(second.redirectUrl).not.toEqual(first.redirectUrl);
  });
});

describe("fakeOutstandAdapter.resolveConnectCallback (T-013/T-015.3, ADR-105, redesain ADR-112)", () => {
  it("resolves instantly to ConnectedAccountData with status active, carrying the platform from state and echoing account_id/username (ADR-112 — no exchange)", async () => {
    const { redirectUrl } = await fakeOutstandAdapter.connectAccount({
      workspaceId: "ws-1",
      platform: SocialPlatform.Facebook,
    });
    const url = new URL(redirectUrl, "https://example.local");
    const outstandAccountId = url.searchParams.get("account_id")!;
    const username = url.searchParams.get("username")!;
    const state = url.searchParams.get("state")!;

    const result = await fakeOutstandAdapter.resolveConnectCallback({
      state,
      outstandAccountId,
      username,
    });

    expect(result.status).toBe("active");
    expect(result.platform).toBe(SocialPlatform.Facebook);
    expect(result.outstandAccountId).toEqual(outstandAccountId);
    expect(result.handle).toEqual(username);
  });

  it("is deterministic for a reconnect (same redirectAccountId → same account_id/username across calls, T-015.3)", async () => {
    const connectAccountId = "connected-account-42";

    const first = await fakeOutstandAdapter.connectAccount({
      workspaceId: "ws-1",
      platform: SocialPlatform.TikTok,
      redirectAccountId: connectAccountId,
    });
    const firstUrl = new URL(first.redirectUrl, "https://example.local");

    const second = await fakeOutstandAdapter.connectAccount({
      workspaceId: "ws-1",
      platform: SocialPlatform.TikTok,
      redirectAccountId: connectAccountId,
    });
    const secondUrl = new URL(second.redirectUrl, "https://example.local");

    expect(secondUrl.searchParams.get("account_id")).toEqual(
      firstUrl.searchParams.get("account_id"),
    );
    expect(secondUrl.searchParams.get("username")).toEqual(
      firstUrl.searchParams.get("username"),
    );
  });

  it("throws a clear error for a malformed/tampered state", async () => {
    await expect(
      fakeOutstandAdapter.resolveConnectCallback({
        outstandAccountId: "fake-account-whatever",
        username: "@fake",
        state: "not-a-valid-base64url-json-state",
      }),
    ).rejects.toThrow(/state tidak valid/i);
  });
});
