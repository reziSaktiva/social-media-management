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

describe("fakeOutstandAdapter.connectAccount — Facebook Pages (T-025.4, ADR-115, wire-format ADR-116, gap testability KI-070)", () => {
  it("returns a redirectUrl carrying session/state (NOT account_id/username/network_unique_id) for Facebook, matching Outstand's real multi-page loopback shape", async () => {
    const result = await fakeOutstandAdapter.connectAccount({
      workspaceId: "ws-1",
      platform: SocialPlatform.Facebook,
    });

    expect(result.redirectUrl).toMatch(
      /^\/api\/integrations\/outstand\/callback\?session=.+&state=.+$/,
    );
    const url = new URL(result.redirectUrl, "https://example.local");
    expect(url.searchParams.get("account_id")).toBeNull();
    expect(url.searchParams.get("username")).toBeNull();
    expect(url.searchParams.get("network_unique_id")).toBeNull();
  });

  it("is deterministic for a reconnect (same redirectAccountId → same session token across calls, ADR-059)", async () => {
    const connectAccountId = "connected-account-fb-1";

    const first = await fakeOutstandAdapter.connectAccount({
      workspaceId: "ws-1",
      platform: SocialPlatform.Facebook,
      redirectAccountId: connectAccountId,
    });
    const second = await fakeOutstandAdapter.connectAccount({
      workspaceId: "ws-1",
      platform: SocialPlatform.Facebook,
      redirectAccountId: connectAccountId,
    });

    const firstSession = new URL(
      first.redirectUrl,
      "https://example.local",
    ).searchParams.get("session");
    const secondSession = new URL(
      second.redirectUrl,
      "https://example.local",
    ).searchParams.get("session");

    expect(secondSession).toEqual(firstSession);
    expect(firstSession).not.toBeNull();
  });

  it("the resulting session token is directly usable by listPendingFacebookPages, returning the 3 fixed fixtures", async () => {
    const { redirectUrl } = await fakeOutstandAdapter.connectAccount({
      workspaceId: "ws-1",
      platform: SocialPlatform.Facebook,
    });
    const sessionToken = new URL(
      redirectUrl,
      "https://example.local",
    ).searchParams.get("session")!;

    const result = await fakeOutstandAdapter.listPendingFacebookPages({
      sessionToken,
    });

    expect(result.pages).toHaveLength(3);
    expect(result.pages.map((page) => page.name)).toEqual([
      "Kopi Selasar",
      "Kopi Selasar — Cabang Selatan",
      "Roti Selasar",
    ]);
  });
});

describe("fakeOutstandAdapter.resolveConnectCallback (T-013/T-015.3, ADR-105, redesain ADR-112)", () => {
  it("resolves instantly to ConnectedAccountData with status active, carrying the platform from state and echoing account_id/username (ADR-112 — no exchange; single-page platform, not Facebook Pages — see the connectAccount Facebook describe block above)", async () => {
    const { redirectUrl } = await fakeOutstandAdapter.connectAccount({
      workspaceId: "ws-1",
      platform: SocialPlatform.Instagram,
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
    expect(result.platform).toBe(SocialPlatform.Instagram);
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

describe("fakeOutstandAdapter.listPinterestBoards (closes KI-072, ADR-059 pattern — instant, no delay/failure simulation)", () => {
  it("returns a fixed set of mock boards, same list regardless of outstandAccountId", async () => {
    const first = await fakeOutstandAdapter.listPinterestBoards("acc-pin-1");
    const second = await fakeOutstandAdapter.listPinterestBoards("acc-pin-2");

    expect(first).toEqual(second);
    expect(first.map((board) => board.name)).toEqual([
      "Resep & Minuman",
      "Interior Kedai",
      "Promo Musiman",
    ]);
    expect(first.every((board) => board.id.length > 0)).toBe(true);
  });
});
