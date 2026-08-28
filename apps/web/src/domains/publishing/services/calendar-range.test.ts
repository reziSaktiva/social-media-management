import { describe, expect, it } from "vitest";

import { getMonthRange, getWeekRange } from "./calendar-range";

describe("getWeekRange", () => {
  it("pertengahan minggu (Rabu) — Senin s.d. Minggu minggu yang sama", () => {
    const { from, to } = getWeekRange(new Date("2026-07-15T10:00:00Z")); // Rabu

    expect(from.toISOString()).toBe("2026-07-13T00:00:00.000Z"); // Senin
    expect(to.toISOString()).toBe("2026-07-19T23:59:59.999Z"); // Minggu
  });

  it("anchor tepat di hari Senin — minggu itu sendiri", () => {
    const { from, to } = getWeekRange(new Date("2026-07-13T00:00:00.000Z"));

    expect(from.toISOString()).toBe("2026-07-13T00:00:00.000Z");
    expect(to.toISOString()).toBe("2026-07-19T23:59:59.999Z");
  });

  it("anchor tepat di hari Minggu — tetap minggu yang sama (bukan minggu berikutnya)", () => {
    const { from, to } = getWeekRange(new Date("2026-07-19T23:59:59.999Z"));

    expect(from.toISOString()).toBe("2026-07-13T00:00:00.000Z");
    expect(to.toISOString()).toBe("2026-07-19T23:59:59.999Z");
  });

  it("pergantian tahun — minggu menyambung Desember ke Januari tahun berikutnya", () => {
    // 2026-12-31 = Kamis; Senin minggu itu = 2026-12-28, Minggu = 2027-01-03
    const { from, to } = getWeekRange(new Date("2026-12-31T12:00:00Z"));

    expect(from.toISOString()).toBe("2026-12-28T00:00:00.000Z");
    expect(to.toISOString()).toBe("2027-01-03T23:59:59.999Z");
  });
});

describe("getMonthRange", () => {
  it("pertengahan bulan — tanggal 1 s.d. hari terakhir bulan yang sama", () => {
    const { from, to } = getMonthRange(new Date("2026-07-15T10:00:00Z"));

    expect(from.toISOString()).toBe("2026-07-01T00:00:00.000Z");
    expect(to.toISOString()).toBe("2026-07-31T23:59:59.999Z");
  });

  it("Februari tahun non-kabisat — 28 hari", () => {
    const { from, to } = getMonthRange(new Date("2027-02-10T00:00:00Z"));

    expect(from.toISOString()).toBe("2027-02-01T00:00:00.000Z");
    expect(to.toISOString()).toBe("2027-02-28T23:59:59.999Z");
  });

  it("Februari tahun kabisat — 29 hari", () => {
    const { from, to } = getMonthRange(new Date("2028-02-10T00:00:00Z"));

    expect(from.toISOString()).toBe("2028-02-01T00:00:00.000Z");
    expect(to.toISOString()).toBe("2028-02-29T23:59:59.999Z");
  });

  it("Desember — hari terakhir bulan tetap dalam tahun yang sama", () => {
    const { from, to } = getMonthRange(new Date("2026-12-05T00:00:00Z"));

    expect(from.toISOString()).toBe("2026-12-01T00:00:00.000Z");
    expect(to.toISOString()).toBe("2026-12-31T23:59:59.999Z");
  });
});
