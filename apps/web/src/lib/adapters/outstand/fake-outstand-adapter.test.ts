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
