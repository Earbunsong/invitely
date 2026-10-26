import crypto from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "iv_session";
const ADMIN_COOKIE = "iv_admin";
const CLAIM_COOKIE = "iv_claim";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s === "change-me") {
    if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET is not set");
    return "dev-only-secret";
  }
  return s;
}

function hmac(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/** `${payload}.${expiresAtSeconds}.${signature}` */
export function signToken(payload: string, ttlSeconds: number): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const body = `${payload}.${exp}`;
  return `${body}.${hmac(body)}`;
}

export function verifyToken(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [payload, exp, sig] = parts;
  if (!safeEqual(sig, hmac(`${payload}.${exp}`))) return null;
  if (Number(exp) < Date.now() / 1000) return null;
  return payload;
}

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

// ---- Customer session (one invitation per session) ----

export async function setSession(invitationId: string) {
  const days = 60;
  (await cookies()).set(SESSION_COOKIE, signToken(invitationId, days * 86400), { ...cookieBase, maxAge: days * 86400 });
}

export async function getSessionInvitationId(): Promise<string | null> {
  return verifyToken((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

// ---- Order claim: proves this browser created the order (to reveal the access code) ----

export async function setOrderClaim(orderId: string) {
  (await cookies()).set(CLAIM_COOKIE, signToken(orderId, 2 * 86400), { ...cookieBase, maxAge: 2 * 86400 });
}

export async function hasOrderClaim(orderId: string): Promise<boolean> {
  return verifyToken((await cookies()).get(CLAIM_COOKIE)?.value) === orderId;
}

// ---- Admin ----

export function checkAdminPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || pw === "change-me") return false;
  return safeEqual(hmac(input), hmac(pw));
}

export async function setAdminSession() {
  (await cookies()).set(ADMIN_COOKIE, signToken("admin", 12 * 3600), { ...cookieBase, maxAge: 12 * 3600 });
}

export async function isAdmin(): Promise<boolean> {
  return verifyToken((await cookies()).get(ADMIN_COOKIE)?.value) === "admin";
}

export async function clearAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

// ---- Access codes (stored encrypted so the buyer's Step 3 page and the admin can show them again) ----

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

export function generateAccessCode(length = 8): string {
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

function encKey() {
  return crypto.createHash("sha256").update(`access-code:${secret()}`).digest();
}

export function encryptCode(code: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encKey(), iv);
  const enc = Buffer.concat([cipher.update(code, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), enc].map((b) => b.toString("base64url")).join(".");
}

export function decryptCode(stored: string | null | undefined): string | null {
  if (!stored) return null;
  try {
    const [iv, tag, enc] = stored.split(".").map((p) => Buffer.from(p, "base64url"));
    const decipher = crypto.createDecipheriv("aes-256-gcm", encKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

export function codesMatch(stored: string | null | undefined, input: string): boolean {
  const code = decryptCode(stored);
  return Boolean(code) && safeEqual(code!, input.trim().toUpperCase());
}
