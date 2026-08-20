import { describe, expect, it } from "vitest";
import { fakeOutstandAdapter } from "./fake-outstand-adapter";

describe("fakeOutstandAdapter.fetchPostMetrics", () => {
  it("is deterministic — same outstandJobId returns identical numbers every call (T-041.5)", async () => {
    const first = await fakeOutstandAdapter.fetchPostMetrics("job-1");
    const second = await fakeOutstandAdapter.fetchPostMetrics("job-1");

    expect(second).toEqual(first);
  });

  it("returns different numbers for a different outstandJobId", async () => {
    const a = await fakeOutstandAdapter.fetchPostMetrics("job-1");
    const b = await fakeOutstandAdapter.fetchPostMetrics("job-2");

    expect(a).not.toEqual(b);
  });
});

describe("fakeOutstandAdapter.publishNow", () => {
  it("resolves instantly with a publishedUrl derived from the returned outstandJobId (T-029)", async () => {
    const result = await fakeOutstandAdapter.publishNow({
      outstandAccountId: "acc-1",
      caption: "Hello world",
      contentFormat: "post" as never,
    });

    expect(result.outstandJobId).toMatch(/^fake-/);
    expect(result.publishedUrl).toContain(result.outstandJobId);
  });

  it("returns a different outstandJobId on every call (no delay/failure simulation, ADR-059)", async () => {
    const first = await fakeOutstandAdapter.publishNow({
      outstandAccountId: "acc-1",
      caption: "Hello world",
      contentFormat: "post" as never,
    });
    const second = await fakeOutstandAdapter.publishNow({
      outstandAccountId: "acc-1",
      caption: "Hello world",
      contentFormat: "post" as never,
    });

    expect(first.outstandJobId).not.toEqual(second.outstandJobId);
  });
});

describe("fakeOutstandAdapter.cancelScheduledPost", () => {
  it("resolves instantly without throwing, regardless of the outstandJobId (T-030, no delay/failure simulation ADR-059)", async () => {
    await expect(
      fakeOutstandAdapter.cancelScheduledPost("fake-job-1"),
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
