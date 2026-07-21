import { describe, expect, it } from "vitest";
import { ContentFormat, ContentStatus, MemberRole } from "./enums";

describe("@social/shared enums", () => {
  it("exposes canonical content statuses", () => {
    expect(ContentStatus.Draft).toBe("draft");
    expect(ContentStatus.Published).toBe("published");
  });

  it("exposes workspace member roles", () => {
    expect(MemberRole.Owner).toBe("owner");
    expect(MemberRole.Creator).toBe("creator");
  });

  it("exposes content formats for publish targets", () => {
    expect(ContentFormat.Post).toBe("post");
    expect(ContentFormat.Reel).toBe("reel");
    expect(ContentFormat.Story).toBe("story");
    expect(ContentFormat.Pin).toBe("pin");
  });
});
