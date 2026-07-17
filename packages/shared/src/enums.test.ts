import { describe, expect, it } from "vitest";
import { ContentStatus, MemberRole } from "./enums";

describe("@social/shared enums", () => {
  it("exposes canonical content statuses", () => {
    expect(ContentStatus.Draft).toBe("draft");
    expect(ContentStatus.Published).toBe("published");
  });

  it("exposes workspace member roles", () => {
    expect(MemberRole.Owner).toBe("owner");
    expect(MemberRole.Creator).toBe("creator");
  });
});
