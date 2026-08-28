import type { RowDataPacket } from "mysql2";
import { randomInt } from "node:crypto";
import { getDb } from "../../db";
import { decryptJson, encryptJson, hashPassword, otpDigest, safeHexEqual, sha256, verifyPassword } from "./crypto";
import { sendOtpEmail, type EmailPurpose } from "./email";
import { attachSessionCookie, clearSessionCookie, createSession, revokeAllSessions } from "./session";
import type { AuthUser, UserRow } from "./types";
import { toAuthUser } from "./types";
import { displayNameFromEmail, normalizeEmail, validPassword } from "./validation";

export type ChallengePurpose = EmailPurpose;

type ChallengeRow = RowDataPacket & {
  id: string;
  email: string;
  purpose: ChallengePurpose;
  code_hash: string;
  attempts_remaining: number;
  metadata_encrypted: string | null;
};

type RateRow = RowDataPacket & { request_count: number };

function clientAddress(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

async function rateLimit(key: string, maximum: number, windowSeconds: number) {
  const keyHash = sha256(key);
  await getDb().execute(
    `INSERT INTO auth_rate_limits (key_hash, request_count, expires_at)
     VALUES (?, 1, TIMESTAMPADD(SECOND, ?, UTC_TIMESTAMP(3)))
     ON DUPLICATE KEY UPDATE
       request_count = IF(expires_at <= UTC_TIMESTAMP(3), 1, request_count + 1),
       expires_at = IF(expires_at <= UTC_TIMESTAMP(3), TIMESTAMPADD(SECOND, ?, UTC_TIMESTAMP(3)), expires_at)`,
    [keyHash, windowSeconds, windowSeconds],
  );
  const [rows] = await getDb().execute<RateRow[]>(`SELECT request_count FROM auth_rate_limits WHERE key_hash = ? LIMIT 1`, [keyHash]);
  if (Number(rows[0]?.request_count ?? 0) > maximum) throw new AuthError("Too many attempts. Please wait and try again.", 429);
}

export class AuthError extends Error {
  constructor(message: string, readonly status = 400, readonly code = "AUTH_ERROR") {
    super(message);
  }
}

async function findUser(email: string): Promise<UserRow | null> {
  const [rows] = await getDb().execute<UserRow[]>(
    `SELECT id, email, display_name, email_verified_at, password_hash, disabled_at FROM auth_users WHERE email = ? LIMIT 1`,
    [email],
  );
  return rows[0] ?? null;
}

export async function createOtpChallenge(
  emailValue: unknown,
  purpose: ChallengePurpose,
  request: Request,
  metadata?: unknown,
) {
  const email = normalizeEmail(emailValue);
  if (!email) throw new AuthError("Enter a valid email address.");
  await rateLimit(`otp-email:${email}`, 5, 3600);
  await rateLimit(`otp-ip:${clientAddress(request)}`, 20, 3600);
  const id = crypto.randomUUID();
  const code = String(randomInt(100000, 1000000));
  await getDb().execute(
    `INSERT INTO auth_challenges
      (id, email, purpose, code_hash, attempts_remaining, metadata_encrypted, expires_at, created_at)
     VALUES (?, ?, ?, ?, 3, ?, DATE_ADD(UTC_TIMESTAMP(3), INTERVAL 5 MINUTE), UTC_TIMESTAMP(3))`,
    [id, email, purpose, otpDigest(id, code), metadata == null ? null : encryptJson(metadata)],
  );
  try {
    await sendOtpEmail(email, code, purpose);
  } catch (error) {
    await getDb().execute(`DELETE FROM auth_challenges WHERE id = ?`, [id]);
    console.error("Authentication email delivery failed", error);
    throw new AuthError("We could not send the email. Please try again shortly.", 503);
  }
  return { challengeId: id, email };
}

async function consumeChallenge(challengeId: unknown, code: unknown): Promise<ChallengeRow> {
  if (typeof challengeId !== "string" || typeof code !== "string" || !/^\d{6}$/.test(code)) {
    throw new AuthError("Enter the six-digit code.");
  }
  const connection = await getDb().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<ChallengeRow[]>(
      `SELECT id, email, purpose, code_hash, attempts_remaining, metadata_encrypted
         FROM auth_challenges
        WHERE id = ? AND consumed_at IS NULL AND expires_at > UTC_TIMESTAMP(3) LIMIT 1 FOR UPDATE`,
      [challengeId],
    );
    const challenge = rows[0];
    if (!challenge || challenge.attempts_remaining < 1) throw new AuthError("This code has expired. Request a new one.");
    if (!safeHexEqual(challenge.code_hash, otpDigest(challenge.id, code))) {
      await connection.execute(`UPDATE auth_challenges SET attempts_remaining = attempts_remaining - 1 WHERE id = ?`, [challenge.id]);
      await connection.commit();
      throw new AuthError("That code is incorrect or has expired.");
    }
    await connection.execute(`UPDATE auth_challenges SET consumed_at = UTC_TIMESTAMP(3) WHERE id = ?`, [challenge.id]);
    await connection.commit();
    return challenge;
  } catch (error) {
    await connection.rollback().catch(() => undefined);
    throw error;
  } finally {
    connection.release();
  }
}

async function ensureLearner(userId: string, name: string) {
  await getDb().execute(
    `INSERT IGNORE INTO learner_states
      (user_id, display_name, preferred_language, learning_mode, completed_lessons, assessment_score, assessment_passed, onboarding_completed, updated_at)
     VALUES (?, ?, 'English', 'Mixed learning', JSON_ARRAY(), NULL, FALSE, FALSE, UTC_TIMESTAMP(3))`,
    [userId, name.slice(0, 80) || "Seeker"],
  );
}

export async function registerPassword(payload: Record<string, unknown>, request: Request) {
  const email = normalizeEmail(payload.email);
  if (!email || !validPassword(payload.password)) {
    throw new AuthError("Use a valid email and a password of 12–128 characters.");
  }
  await rateLimit(`register:${clientAddress(request)}`, 12, 3600);
  const existing = await findUser(email);
  if (existing?.email_verified_at) return createOtpChallenge(email, "signin", request);
  const passwordHash = await hashPassword(payload.password);
  const name = typeof payload.name === "string" && payload.name.trim() ? payload.name.trim().slice(0, 80) : displayNameFromEmail(email);
  const userId = existing?.id ?? crypto.randomUUID();
  if (existing) {
    await getDb().execute(`UPDATE auth_users SET display_name = ?, password_hash = ?, updated_at = UTC_TIMESTAMP(3) WHERE id = ?`, [name, passwordHash, userId]);
  } else {
    await getDb().execute(
      `INSERT INTO auth_users (id, email, display_name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, UTC_TIMESTAMP(3), UTC_TIMESTAMP(3))`,
      [userId, email, name, passwordHash],
    );
  }
  return createOtpChallenge(email, "verify", request, { userId });
}

export async function loginPassword(payload: Record<string, unknown>, request: Request) {
  const email = normalizeEmail(payload.email);
  if (!email || typeof payload.password !== "string") throw new AuthError("Email or password is incorrect.", 401);
  await rateLimit(`password:${email}:${clientAddress(request)}`, 10, 900);
  const user = await findUser(email);
  const passwordMatches = user?.password_hash
    ? await verifyPassword(user.password_hash, payload.password)
    : (await hashPassword(payload.password), false);
  if (!user?.password_hash || !user.email_verified_at || user.disabled_at || !passwordMatches) {
    throw new AuthError("Email or password is incorrect.", 401);
  }
  await ensureLearner(user.id, user.display_name);
  await getDb().execute(`UPDATE auth_users SET last_login_at = UTC_TIMESTAMP(3) WHERE id = ?`, [user.id]);
  return { user: toAuthUser(user), token: await createSession(user.id) };
}

export async function changePassword(userId: string, payload: Record<string, unknown>) {
  if (typeof payload.currentPassword !== "string" || !validPassword(payload.newPassword)) {
    throw new AuthError("Enter your current password and a new password of 12–128 characters.");
  }
  const [rows] = await getDb().execute<UserRow[]>(
    `SELECT id, email, display_name, email_verified_at, password_hash, disabled_at FROM auth_users WHERE id = ? LIMIT 1`,
    [userId],
  );
  const user = rows[0];
  if (!user?.password_hash || !(await verifyPassword(user.password_hash, payload.currentPassword))) {
    throw new AuthError("Your current password is incorrect.", 401);
  }
  await getDb().execute(`UPDATE auth_users SET password_hash = ?, updated_at = UTC_TIMESTAMP(3) WHERE id = ?`, [await hashPassword(payload.newPassword), userId]);
}

async function userForEmailOtp(email: string) {
  let user = await findUser(email);
  if (!user) {
    const id = crypto.randomUUID();
    const name = displayNameFromEmail(email);
    await getDb().execute(
      `INSERT INTO auth_users (id, email, display_name, email_verified_at, created_at, updated_at, last_login_at)
       VALUES (?, ?, ?, UTC_TIMESTAMP(3), UTC_TIMESTAMP(3), UTC_TIMESTAMP(3), UTC_TIMESTAMP(3))`,
      [id, email, name],
    );
    user = await findUser(email);
  } else {
    await getDb().execute(`UPDATE auth_users SET email_verified_at = COALESCE(email_verified_at, UTC_TIMESTAMP(3)), last_login_at = UTC_TIMESTAMP(3) WHERE id = ?`, [user.id]);
    user.email_verified_at ||= new Date().toISOString();
  }
  if (!user || user.disabled_at) throw new AuthError("This account is unavailable.", 403);
  await ensureLearner(user.id, user.display_name);
  return user;
}

type OidcMetadata = { provider: "google" | "microsoft"; issuer: string; subject: string; name: string };

export async function verifyOtp(payload: Record<string, unknown>) {
  if (typeof payload.challengeId === "string") {
    const [purposeRows] = await getDb().execute<(RowDataPacket & { purpose: ChallengePurpose })[]>(
      `SELECT purpose FROM auth_challenges WHERE id = ? AND consumed_at IS NULL AND expires_at > UTC_TIMESTAMP(3) LIMIT 1`,
      [payload.challengeId],
    );
    if (purposeRows[0]?.purpose === "reset" && !validPassword(payload.newPassword)) {
      throw new AuthError("Use a new password of 12–128 characters.");
    }
  }
  const challenge = await consumeChallenge(payload.challengeId, payload.code);
  let user: UserRow | null = null;
  if (challenge.purpose === "signin") {
    user = await userForEmailOtp(challenge.email);
  } else if (challenge.purpose === "verify") {
    const metadata = challenge.metadata_encrypted ? decryptJson<{ userId: string }>(challenge.metadata_encrypted) : null;
    await getDb().execute(`UPDATE auth_users SET email_verified_at = UTC_TIMESTAMP(3), last_login_at = UTC_TIMESTAMP(3) WHERE id = ? AND email = ?`, [metadata?.userId ?? "", challenge.email]);
    user = await findUser(challenge.email);
  } else if (challenge.purpose === "reset") {
    user = await findUser(challenge.email);
    if (!user) throw new AuthError("This reset request is no longer valid.");
    await getDb().execute(`UPDATE auth_users SET password_hash = ?, email_verified_at = COALESCE(email_verified_at, UTC_TIMESTAMP(3)), updated_at = UTC_TIMESTAMP(3) WHERE id = ?`, [await hashPassword(payload.newPassword as string), user.id]);
    await revokeAllSessions(user.id);
  } else if (challenge.purpose === "oidc-link") {
    if (!challenge.metadata_encrypted) throw new AuthError("This sign-in request is no longer valid.");
    const metadata = decryptJson<OidcMetadata>(challenge.metadata_encrypted);
    user = await userForEmailOtp(challenge.email);
    await linkIdentity(user.id, metadata.provider, metadata.issuer, metadata.subject, challenge.email);
  }
  if (!user || user.disabled_at) throw new AuthError("This request is no longer valid.");
  await ensureLearner(user.id, user.display_name);
  return { user: toAuthUser(user), token: await createSession(user.id) };
}

export async function requestOtp(payload: Record<string, unknown>, request: Request) {
  const purpose = payload.purpose;
  if (purpose !== "signin" && purpose !== "reset") throw new AuthError("Unsupported verification request.");
  return createOtpChallenge(payload.email, purpose, request);
}

export async function resendOtp(payload: Record<string, unknown>, request: Request) {
  if (typeof payload.challengeId !== "string") throw new AuthError("Request a new code from the sign-in page.");
  const [rows] = await getDb().execute<ChallengeRow[]>(
    `SELECT id, email, purpose, code_hash, attempts_remaining, metadata_encrypted
       FROM auth_challenges
      WHERE id = ? AND consumed_at IS NULL AND expires_at > UTC_TIMESTAMP(3)
        AND created_at <= DATE_SUB(UTC_TIMESTAMP(3), INTERVAL 60 SECOND) LIMIT 1`,
    [payload.challengeId],
  );
  const existing = rows[0];
  if (!existing) throw new AuthError("Wait 60 seconds before requesting another code.", 429);
  const metadata = existing.metadata_encrypted ? decryptJson<unknown>(existing.metadata_encrypted) : undefined;
  const replacement = await createOtpChallenge(existing.email, existing.purpose, request, metadata);
  await getDb().execute(`UPDATE auth_challenges SET consumed_at = UTC_TIMESTAMP(3) WHERE id = ?`, [existing.id]);
  return replacement;
}

export async function linkIdentity(userId: string, provider: string, issuer: string, subject: string, providerEmail: string | null) {
  try {
    await getDb().execute(
      `INSERT INTO auth_identities (id, user_id, provider, issuer, subject, provider_email, created_at)
       VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(3))`,
      [crypto.randomUUID(), userId, provider, issuer, subject, providerEmail],
    );
  } catch (error) {
    const mysqlError = error as { code?: string };
    if (mysqlError.code !== "ER_DUP_ENTRY") throw error;
    const [rows] = await getDb().execute<(RowDataPacket & { user_id: string })[]>(
      `SELECT user_id FROM auth_identities WHERE issuer = ? AND subject = ? LIMIT 1`,
      [issuer, subject],
    );
    if (rows[0]?.user_id !== userId) throw new AuthError("This provider account is already linked to another user.", 409);
  }
}

export function authJsonError(error: unknown) {
  if (error instanceof AuthError) return Response.json({ error: error.message, code: error.code }, { status: error.status });
  console.error("Authentication request failed", error);
  return Response.json({ error: "Authentication is temporarily unavailable." }, { status: 503 });
}

export function authSuccess(user: AuthUser, token: string, returnTo = "/dashboard") {
  return attachSessionCookie(Response.json({ user, returnTo }), token);
}

export { attachSessionCookie, clearSessionCookie };
