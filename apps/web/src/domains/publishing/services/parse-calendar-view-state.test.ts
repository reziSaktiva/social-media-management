import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { parseCalendarViewState } from "./parse-calendar-view-state";

describe("parseCalendarViewState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-27T03:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("view", () => {
    it("default ke week kalau tidak ada", () => {
      expect(parseCalendarViewState({}).view).toBe("week");
    });

    it("menerima month", () => {
      expect(parseCalendarViewState({ view: "month" }).view).toBe("month");
    });

    it("menerima week eksplisit", () => {
      expect(parseCalendarViewState({ view: "week" }).view).toBe("week");
    });

    it("fallback ke week untuk value invalid", () => {
      expect(parseCalendarViewState({ view: "yearly" }).view).toBe("week");
    });

    it("case-sensitive — Month (kapital) fallback ke week", () => {
      expect(parseCalendarViewState({ view: "Month" }).view).toBe("week");
    });

    it("mengambil elemen pertama kalau query param diulang (array)", () => {
      expect(parseCalendarViewState({ view: ["month", "week"] }).view).toBe(
        "month",
      );
    });
  });

  describe("date", () => {
    it("default ke hari ini kalau tidak ada", () => {
      expect(parseCalendarViewState({}).date).toEqual(new Date());
    });

    it("default ke hari ini untuk string kosong", () => {
      expect(parseCalendarViewState({ date: "" }).date).toEqual(new Date());
    });

    it("default ke hari ini untuk whitespace", () => {
      expect(parseCalendarViewState({ date: "   " }).date).toEqual(new Date());
    });

    it("default ke hari ini untuk non-numeric", () => {
      expect(parseCalendarViewState({ date: "not-a-timestamp" }).date).toEqual(
        new Date(),
      );
    });

    it("mem-parse epoch milliseconds valid", () => {
      const timestamp = new Date("2026-09-01T00:00:00Z").getTime();
      expect(parseCalendarViewState({ date: String(timestamp) }).date).toEqual(
        new Date(timestamp),
      );
    });

    it("default ke hari ini untuk timestamp non-finite (Infinity)", () => {
      expect(parseCalendarViewState({ date: "Infinity" }).date).toEqual(
        new Date(),
      );
    });

    it("mengambil elemen pertama kalau query param diulang (array)", () => {
      const timestamp = new Date("2026-09-01T00:00:00Z").getTime();
      expect(
        parseCalendarViewState({ date: [String(timestamp), "999"] }).date,
      ).toEqual(new Date(timestamp));
    });
  });

  it("default view+date sekaligus kalau searchParams kosong total", () => {
    expect(parseCalendarViewState({})).toEqual({
      view: "week",
      date: new Date(),
    });
  });
});
