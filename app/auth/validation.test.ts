import { describe, expect, it } from "vitest";
import { displayNameFromEmail, normalizeEmail, safeReturnTo, validPassword } from "./validation";

describe("authentication validation", () => {
  it("normalizes valid email without accepting malformed values", () => {
    expect(normalizeEmail("  Learner@Example.COM ")).toBe("learner@example.com");
    expect(normalizeEmail("not-an-email")).toBeNull();
    expect(normalizeEmail(null)).toBeNull();
  });

  it("allows only local return paths", () => {
    expect(safeReturnTo("/lesson/gita-2-47?tab=verse")).toBe("/lesson/gita-2-47?tab=verse");
    expect(safeReturnTo("//attacker.example/path")).toBe("/dashboard");
    expect(safeReturnTo("https://attacker.example/path")).toBe("/dashboard");
    expect(safeReturnTo("/api/auth/logout")).toBe("/dashboard");
  });

  it("applies the password length boundary", () => {
    expect(validPassword("short-value")).toBe(false);
    expect(validPassword("twelve-chars")).toBe(true);
    expect(validPassword("x".repeat(129))).toBe(false);
  });

  it("derives a friendly default name", () => {
    expect(displayNameFromEmail("radha.das@example.com")).toBe("radha das");
  });
});
