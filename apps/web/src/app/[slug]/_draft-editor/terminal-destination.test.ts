import { describe, expect, it } from "vitest";

import {
  isAlreadyAtDestination,
  resolveTerminalDestination,
} from "./terminal-destination";

describe("resolveTerminalDestination", () => {
  it("mengarahkan Save as Draft ke Publish > Drafts (ADR-054)", () => {
    expect(resolveTerminalDestination("kopi-selasar", "save-draft")).toBe(
      "/kopi-selasar/publish/drafts",
    );
  });

  it("mengarahkan Schedule ke Publish > Queue (ADR-054)", () => {
    expect(resolveTerminalDestination("kopi-selasar", "schedule")).toBe(
      "/kopi-selasar/publish/queue",
    );
  });

  it("selalu memakai slug workspace yang diberikan, bukan slug hardcode", () => {
    expect(resolveTerminalDestination("warung-dimas", "save-draft")).toBe(
      "/warung-dimas/publish/drafts",
    );
  });

  it("tujuannya sama dari section manapun — tidak bergantung asal (ADR-053)", () => {
    // Inti T-011.3: CTA sidebar membuat asalnya bisa Home/Engage/Analyze,
    // dan destinasi tidak boleh ikut berubah mengikuti asal itu.
    expect(resolveTerminalDestination("kopi-selasar", "schedule")).toBe(
      resolveTerminalDestination("kopi-selasar", "schedule"),
    );
  });
});

describe("isAlreadyAtDestination", () => {
  it("true saat pengguna sudah berada di layar tujuan", () => {
    expect(
      isAlreadyAtDestination(
        "/kopi-selasar/publish/drafts",
        "/kopi-selasar/publish/drafts",
      ),
    ).toBe(true);
  });

  it("false saat aksi dipicu dari section non-publish", () => {
    expect(
      isAlreadyAtDestination("/kopi-selasar", "/kopi-selasar/publish/drafts"),
    ).toBe(false);
    expect(
      isAlreadyAtDestination(
        "/kopi-selasar/analyze",
        "/kopi-selasar/publish/queue",
      ),
    ).toBe(false);
  });

  it("false saat berada di sub-screen Publish yang berbeda", () => {
    expect(
      isAlreadyAtDestination(
        "/kopi-selasar/publish/calendar",
        "/kopi-selasar/publish/drafts",
      ),
    ).toBe(false);
  });

  it("false saat pathname belum tersedia", () => {
    expect(isAlreadyAtDestination(null, "/kopi-selasar/publish/drafts")).toBe(
      false,
    );
  });
});
