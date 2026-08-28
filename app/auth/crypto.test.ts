import { beforeAll, describe, expect, it } from "vitest";
import { decryptJson, encryptJson, hashPassword, otpDigest, randomToken, safeHexEqual, sha256, verifyPassword } from "./crypto";

beforeAll(() => {
  process.env.AUTH_OTP_SECRET = "test-otp-secret-that-is-at-least-thirty-two-characters";
  process.env.AUTH_ENCRYPTION_SECRET = "test-encryption-secret-at-least-thirty-two-characters";
});

describe("authentication cryptography", () => {
  it("round-trips authenticated encrypted payloads", () => {
    const encrypted = encryptJson({ verifier: "secret", nonce: "nonce" });
    expect(encrypted).not.toContain("secret");
    expect(decryptJson(encrypted)).toEqual({ verifier: "secret", nonce: "nonce" });
  });

  it("hashes opaque tokens and OTPs deterministically", () => {
    const token = randomToken();
    expect(token).not.toEqual(randomToken());
    expect(sha256(token)).toHaveLength(64);
    const digest = otpDigest("challenge", "123456");
    expect(safeHexEqual(digest, otpDigest("challenge", "123456"))).toBe(true);
    expect(safeHexEqual(digest, otpDigest("challenge", "654321"))).toBe(false);
  });

  it("uses a slow password hash and rejects a different password", async () => {
    const password = "a sufficiently long devotional password";
    const passwordHash = await hashPassword(password);
    expect(passwordHash).not.toContain(password);
    expect(await verifyPassword(passwordHash, password)).toBe(true);
    expect(await verifyPassword(passwordHash, "a different long password")).toBe(false);
  });
});
