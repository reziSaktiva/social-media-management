import { ContentFormat, SocialPlatform } from "@social/shared";
import { describe, expect, it } from "vitest";
import { PublishingDomainError } from "./errors";
import {
  assertContentFormatAllowed,
  assertMediaCountWithinLimit,
  maxMediaCountForFormat,
  maxMediaCountForFormats,
} from "./content-format-matrix";

describe("assertContentFormatAllowed", () => {
  it("allows Post/Reel/Story for Instagram", () => {
    expect(() =>
      assertContentFormatAllowed(SocialPlatform.Instagram, ContentFormat.Reel),
    ).not.toThrow();
  });

  it("throws for a format not allowed on the platform", () => {
    expect(() =>
      assertContentFormatAllowed(SocialPlatform.Pinterest, ContentFormat.Reel),
    ).toThrow(PublishingDomainError);
  });
});

describe("maxMediaCountForFormat", () => {
  it("returns 10 for Post (IG/FB carousel limit)", () => {
    expect(maxMediaCountForFormat(ContentFormat.Post)).toBe(10);
  });

  it("returns 1 for Reel/Story/Pin (single-media platform limits)", () => {
    expect(maxMediaCountForFormat(ContentFormat.Reel)).toBe(1);
    expect(maxMediaCountForFormat(ContentFormat.Story)).toBe(1);
    expect(maxMediaCountForFormat(ContentFormat.Pin)).toBe(1);
  });
});

describe("maxMediaCountForFormats", () => {
  it("defaults to 10 (most permissive) when no format is selected yet", () => {
    expect(maxMediaCountForFormats([])).toBe(10);
  });

  it("returns the single format's limit when only one format is selected", () => {
    expect(maxMediaCountForFormats([ContentFormat.Post])).toBe(10);
    expect(maxMediaCountForFormats([ContentFormat.Reel])).toBe(1);
  });

  it("returns the MINIMUM across formats when multiple targets with different formats are selected (ADR-107)", () => {
    expect(
      maxMediaCountForFormats([ContentFormat.Post, ContentFormat.Reel]),
    ).toBe(1);
    expect(
      maxMediaCountForFormats([
        ContentFormat.Post,
        ContentFormat.Story,
        ContentFormat.Pin,
      ]),
    ).toBe(1);
  });
});

describe("assertMediaCountWithinLimit", () => {
  it("does not throw when count is within the effective limit", () => {
    expect(() =>
      assertMediaCountWithinLimit(5, [ContentFormat.Post]),
    ).not.toThrow();
  });

  it("does not throw when count equals the effective limit exactly", () => {
    expect(() =>
      assertMediaCountWithinLimit(1, [ContentFormat.Reel]),
    ).not.toThrow();
  });

  it("throws PublishingDomainError when count exceeds the effective limit", () => {
    expect(() => assertMediaCountWithinLimit(2, [ContentFormat.Reel])).toThrow(
      PublishingDomainError,
    );
  });

  it("uses the minimum limit across mixed formats (e.g. IG Reel + FB Story in one post)", () => {
    expect(() =>
      assertMediaCountWithinLimit(2, [ContentFormat.Post, ContentFormat.Story]),
    ).toThrow(PublishingDomainError);
  });
});
