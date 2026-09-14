import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyOutstandWebhookSignature } from "./verify-webhook-signature";

const SECRET = "test-webhook-secret";

function sign(rawBody: string, secret = SECRET): string {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}

describe("verifyOutstandWebhookSignature", () => {
  it("returns true for a correctly signed raw body (T-026.1)", () => {
    const rawBody = JSON.stringify({ event: "post.published" });
    const signature = sign(rawBody);

    expect(verifyOutstandWebhookSignature(rawBody, signature, SECRET)).toBe(
      true,
    );
  });

  it("returns false when the signature was computed with a different secret", () => {
    const rawBody = JSON.stringify({ event: "post.published" });
    const signature = sign(rawBody, "wrong-secret");

    expect(verifyOutstandWebhookSignature(rawBody, signature, SECRET)).toBe(
      false,
    );
  });

  it("returns false when the raw body was tampered with after signing", () => {
    const rawBody = JSON.stringify({ event: "post.published" });
    const signature = sign(rawBody);
    const tamperedBody = JSON.stringify({ event: "post.error" });

    expect(
      verifyOutstandWebhookSignature(tamperedBody, signature, SECRET),
    ).toBe(false);
  });

  it("returns false when the signature header is missing", () => {
    const rawBody = JSON.stringify({ event: "post.published" });

    expect(verifyOutstandWebhookSignature(rawBody, null, SECRET)).toBe(false);
  });

  it("returns false for a garbage signature of different length (no throw)", () => {
    const rawBody = JSON.stringify({ event: "post.published" });

    expect(
      verifyOutstandWebhookSignature(rawBody, "not-a-real-signature", SECRET),
    ).toBe(false);
  });
});
