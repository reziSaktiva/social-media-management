import { describe, expect, it } from "vitest";
import { fakeOutstandAdapter } from "./fake-outstand-adapter";

describe("fakeOutstandAdapter.fetchPostMetrics", () => {
  it("is deterministic — same outstandPostId returns identical numbers every call (T-041.5)", async () => {
    const first = await fakeOutstandAdapter.fetchPostMetrics("post-1");
    const second = await fakeOutstandAdapter.fetchPostMetrics("post-1");

    expect(second).toEqual(first);
  });

  it("returns different numbers for a different outstandPostId", async () => {
    const a = await fakeOutstandAdapter.fetchPostMetrics("post-1");
    const b = await fakeOutstandAdapter.fetchPostMetrics("post-2");

    expect(a).not.toEqual(b);
  });
});

describe("fakeOutstandAdapter.schedulePost", () => {
  it("resolves instantly with ONE outstandPostId for ALL targets (redesain 2026-08-26)", async () => {
    const result = await fakeOutstandAdapter.schedulePost({
      caption: "Hello world",
      scheduledAt: new Date("2026-09-01T00:00:00Z"),
      targets: [
        { outstandAccountId: "acc-1", contentFormat: "post" as never },
        { outstandAccountId: "acc-2", contentFormat: "reel" as never },
      ],
    });

    expect(result.outstandPostId).toMatch(/^fake-post-/);
  });

  it("returns a different outstandPostId on every call (no delay/failure simulation, ADR-059)", async () => {
    const first = await fakeOutstandAdapter.schedulePost({
      caption: "Hello world",
      scheduledAt: new Date("2026-09-01T00:00:00Z"),
      targets: [{ outstandAccountId: "acc-1", contentFormat: "post" as never }],
    });
    const second = await fakeOutstandAdapter.schedulePost({
      caption: "Hello world",
      scheduledAt: new Date("2026-09-01T00:00:00Z"),
      targets: [{ outstandAccountId: "acc-1", contentFormat: "post" as never }],
    });

    expect(first.outstandPostId).not.toEqual(second.outstandPostId);
  });
});

describe("fakeOutstandAdapter.publishNow", () => {
  it("resolves instantly with ONE outstandPostId for ALL targets (redesain 2026-08-26)", async () => {
    const result = await fakeOutstandAdapter.publishNow({
      caption: "Hello world",
      targets: [
        { outstandAccountId: "acc-1", contentFormat: "post" as never },
        { outstandAccountId: "acc-2", contentFormat: "reel" as never },
      ],
    });

    expect(result.outstandPostId).toMatch(/^fake-post-/);
  });

  it("returns a different outstandPostId on every call (no delay/failure simulation, ADR-059)", async () => {
    const first = await fakeOutstandAdapter.publishNow({
      caption: "Hello world",
      targets: [{ outstandAccountId: "acc-1", contentFormat: "post" as never }],
    });
    const second = await fakeOutstandAdapter.publishNow({
      caption: "Hello world",
      targets: [{ outstandAccountId: "acc-1", contentFormat: "post" as never }],
    });

    expect(first.outstandPostId).not.toEqual(second.outstandPostId);
  });
});

describe("fakeOutstandAdapter.fetchPostOutcome", () => {
  it("returns every account passed to publishNow marked published instantly (Fake always-success, ADR-059)", async () => {
    const { outstandPostId } = await fakeOutstandAdapter.publishNow({
      caption: "Hello world",
      targets: [
        { outstandAccountId: "acc-1", contentFormat: "post" as never },
        { outstandAccountId: "acc-2", contentFormat: "reel" as never },
      ],
    });

    const outcomes = await fakeOutstandAdapter.fetchPostOutcome(outstandPostId);

    expect(outcomes).toHaveLength(2);
    for (const outcome of outcomes) {
      expect(outcome.status).toBe("published");
      expect(outcome.error).toBeNull();
      expect(outcome.platformPostId).not.toBeNull();
      expect(outcome.platformPostUrl).not.toBeNull();
      expect(outcome.publishedAt).not.toBeNull();
    }
    expect(outcomes.map((outcome) => outcome.outstandAccountId).sort()).toEqual(
      ["acc-1", "acc-2"],
    );
  });

  it("returns an empty array for an unknown outstandPostId", async () => {
    const outcomes = await fakeOutstandAdapter.fetchPostOutcome(
      "never-scheduled-or-published",
    );

    expect(outcomes).toEqual([]);
  });

  it("is deterministic per (outstandPostId, outstandAccountId) — platformPostId stays identical across calls", async () => {
    const { outstandPostId } = await fakeOutstandAdapter.schedulePost({
      caption: "Hello world",
      scheduledAt: new Date("2026-09-01T00:00:00Z"),
      targets: [{ outstandAccountId: "acc-1", contentFormat: "post" as never }],
    });

    const first = await fakeOutstandAdapter.fetchPostOutcome(outstandPostId);
    const second = await fakeOutstandAdapter.fetchPostOutcome(outstandPostId);

    expect(first[0]?.platformPostId).toEqual(second[0]?.platformPostId);
    expect(first[0]?.platformPostUrl).toEqual(second[0]?.platformPostUrl);
  });
});

describe("fakeOutstandAdapter.cancelScheduledPost", () => {
  it("resolves instantly without throwing, regardless of the outstandPostId (T-030, no delay/failure simulation ADR-059)", async () => {
    await expect(
      fakeOutstandAdapter.cancelScheduledPost("fake-post-1"),
    ).resolves.toBeUndefined();
  });
});

describe("fakeOutstandAdapter.fetchWorkspaceMetrics", () => {
  it("is deterministic — same (outstandAccountId, period) returns identical numbers every call (T-041.5)", async () => {
    const first = await fakeOutstandAdapter.fetchWorkspaceMetrics(
      "acc-1",
      "last_7_days",
    );
    const second = await fakeOutstandAdapter.fetchWorkspaceMetrics(
      "acc-1",
      "last_7_days",
    );

    expect(second).toEqual(first);
  });

  it("returns different numbers for a different period on the same account", async () => {
    const weekly = await fakeOutstandAdapter.fetchWorkspaceMetrics(
      "acc-1",
      "last_7_days",
    );
    const monthly = await fakeOutstandAdapter.fetchWorkspaceMetrics(
      "acc-1",
      "last_30_days",
    );

    expect(weekly).not.toEqual(monthly);
  });
});
