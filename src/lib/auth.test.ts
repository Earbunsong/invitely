import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined, set: () => undefined, delete: () => undefined }) }));

const { codesMatch, decryptCode, encryptCode, generateAccessCode, signToken, verifyToken } = await import("./auth");

describe("signed tokens", () => {
  it("round-trips and rejects tampering", () => {
    const token = signToken("inv_123", 60);
    expect(verifyToken(token)).toBe("inv_123");
    const [p, exp, sig] = token.split(".");
    expect(verifyToken(`inv_999.${exp}.${sig}`)).toBeNull();
    expect(verifyToken(`${p}.${Number(exp) + 1000}.${sig}`)).toBeNull();
    expect(verifyToken(undefined)).toBeNull();
  });

  it("expires", () => {
    expect(verifyToken(signToken("x", -1))).toBeNull();
  });
});

describe("access codes", () => {
  it("generates 8 unambiguous characters", () => {
    for (let i = 0; i < 100; i++) expect(generateAccessCode()).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
  });

  it("encrypts, decrypts and matches case-insensitively", () => {
    const code = generateAccessCode();
    const stored = encryptCode(code);
    expect(stored).not.toContain(code);
    expect(decryptCode(stored)).toBe(code);
    expect(codesMatch(stored, code.toLowerCase())).toBe(true);
    expect(codesMatch(stored, "WRONG123")).toBe(false);
    expect(codesMatch(null, code)).toBe(false);
  });
});
