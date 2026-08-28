import type { RowDataPacket } from "mysql2";
import * as oidc from "openid-client";
import { getDb } from "../../db";
import { decryptJson, encryptJson, sha256 } from "./crypto";
import { createOtpChallenge, linkIdentity, AuthError } from "./service";
import { createSession } from "./session";
import type { AuthUser, UserRow } from "./types";
import { toAuthUser } from "./types";
import { displayNameFromEmail, normalizeEmail, safeReturnTo } from "./validation";

export type OidcProvider = "google" | "microsoft";

type TransactionPayload = { verifier: string; nonce: string };
type TransactionRow = RowDataPacket & {
  provider: OidcProvider;
  payload_encrypted: string;
  return_to: string;
  link_user_id: string | null;
};

const configs = new Map<OidcProvider, Promise<oidc.Configuration>>();

function baseUrl() {
  const value = process.env.AUTH_BASE_URL?.trim() || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");
  if (!value) throw new Error("AUTH_BASE_URL is required.");
  return value.replace(/\/$/, "");
}

function credentials(provider: OidcProvider) {
  const prefix = provider === "google" ? "GOOGLE" : "MICROSOFT";
  const clientId = process.env[`${prefix}_CLIENT_ID`]?.trim();
  const clientSecret = process.env[`${prefix}_CLIENT_SECRET`]?.trim();
  if (!clientId || !clientSecret) throw new AuthError(`${provider === "google" ? "Google" : "Microsoft"} sign-in is not configured.`, 503);
  return { clientId, clientSecret };
}

async function configuration(provider: OidcProvider) {
  const existing = configs.get(provider);
  if (existing) return existing;
  const { clientId, clientSecret } = credentials(provider);
  const issuer = new URL(provider === "google" ? "https://accounts.google.com" : "https://login.microsoftonline.com/common/v2.0");
  const pending = oidc.discovery(issuer, clientId, undefined, oidc.ClientSecretPost(clientSecret));
  configs.set(provider, pending);
  return pending;
}

function callbackUrl(provider: OidcProvider) {
  return `${baseUrl()}/api/auth/oidc/${provider}/callback`;
}

export async function startOidc(provider: OidcProvider, returnToValue: unknown, linkUserId: string | null = null) {
  const config = await configuration(provider);
  const verifier = oidc.randomPKCECodeVerifier();
  const challenge = await oidc.calculatePKCECodeChallenge(verifier);
  const state = oidc.randomState();
  const nonce = oidc.randomNonce();
  await getDb().execute(
    `INSERT INTO auth_oidc_transactions (state_hash, provider, link_user_id, payload_encrypted, return_to, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, DATE_ADD(UTC_TIMESTAMP(3), INTERVAL 10 MINUTE), UTC_TIMESTAMP(3))`,
    [sha256(state), provider, linkUserId, encryptJson({ verifier, nonce } satisfies TransactionPayload), safeReturnTo(returnToValue)],
  );
  return oidc.buildAuthorizationUrl(config, {
    redirect_uri: callbackUrl(provider),
    response_type: "code",
    scope: "openid email profile",
    code_challenge: challenge,
    code_challenge_method: "S256",
    state,
    nonce,
    prompt: "select_account",
  });
}

async function transaction(state: string, provider: OidcProvider) {
  const connection = await getDb().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<TransactionRow[]>(
      `SELECT provider, link_user_id, payload_encrypted, return_to FROM auth_oidc_transactions
        WHERE state_hash = ? AND provider = ? AND expires_at > UTC_TIMESTAMP(3) LIMIT 1 FOR UPDATE`,
      [sha256(state), provider],
    );
    const row = rows[0];
    if (!row) throw new AuthError("This sign-in request has expired. Please try again.");
    await connection.execute(`DELETE FROM auth_oidc_transactions WHERE state_hash = ?`, [sha256(state)]);
    await connection.commit();
    return row;
  } catch (error) {
    await connection.rollback().catch(() => undefined);
    throw error;
  } finally {
    connection.release();
  }
}

async function findIdentity(issuer: string, subject: string): Promise<UserRow | null> {
  const [rows] = await getDb().execute<UserRow[]>(
    `SELECT u.id, u.email, u.display_name, u.email_verified_at, u.password_hash, u.disabled_at
       FROM auth_identities i JOIN auth_users u ON u.id = i.user_id
      WHERE i.issuer = ? AND i.subject = ? LIMIT 1`,
    [issuer, subject],
  );
  return rows[0] ?? null;
}

async function findEmail(email: string): Promise<UserRow | null> {
  const [rows] = await getDb().execute<UserRow[]>(
    `SELECT id, email, display_name, email_verified_at, password_hash, disabled_at FROM auth_users WHERE email = ? LIMIT 1`,
    [email],
  );
  return rows[0] ?? null;
}

async function findUserId(id: string): Promise<UserRow | null> {
  const [rows] = await getDb().execute<UserRow[]>(
    `SELECT id, email, display_name, email_verified_at, password_hash, disabled_at FROM auth_users WHERE id = ? LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

async function ensureLearner(user: UserRow) {
  await getDb().execute(
    `INSERT IGNORE INTO learner_states
      (user_id, display_name, preferred_language, learning_mode, completed_lessons, assessment_score, assessment_passed, onboarding_completed, updated_at)
     VALUES (?, ?, 'English', 'Mixed learning', JSON_ARRAY(), NULL, FALSE, FALSE, UTC_TIMESTAMP(3))`,
    [user.id, user.display_name],
  );
}

async function createVerifiedUser(email: string, name: string): Promise<UserRow> {
  const id = crypto.randomUUID();
  await getDb().execute(
    `INSERT INTO auth_users (id, email, display_name, email_verified_at, created_at, updated_at, last_login_at)
     VALUES (?, ?, ?, UTC_TIMESTAMP(3), UTC_TIMESTAMP(3), UTC_TIMESTAMP(3), UTC_TIMESTAMP(3))`,
    [id, email, name.slice(0, 80)],
  );
  const user = await findEmail(email);
  if (!user) throw new Error("Unable to create user.");
  return user;
}

export type OidcCompletion =
  | { kind: "session"; user: AuthUser; token: string; returnTo: string }
  | { kind: "verify-email"; challengeId: string; email: string; returnTo: string };

export async function finishOidc(provider: OidcProvider, request: Request): Promise<OidcCompletion> {
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  if (!state) throw new AuthError("The identity provider did not return a valid state.");
  const saved = await transaction(state, provider);
  const payload = decryptJson<TransactionPayload>(saved.payload_encrypted);
  const config = await configuration(provider);
  const tokens = await oidc.authorizationCodeGrant(config, url, {
    pkceCodeVerifier: payload.verifier,
    expectedState: state,
    expectedNonce: payload.nonce,
    idTokenExpected: true,
  });
  const claims = tokens.claims();
  const issuer = typeof claims?.iss === "string" ? claims.iss : null;
  const subject = typeof claims?.sub === "string" ? claims.sub : null;
  if (!issuer || !subject) throw new AuthError("The identity provider did not return a stable identity.");

  let user = await findIdentity(issuer, subject);
  if (user) {
    if (saved.link_user_id && saved.link_user_id !== user.id) throw new AuthError("This provider account belongs to another Living Bliss account.", 409);
    if (user.disabled_at) throw new AuthError("This account is unavailable.", 403);
    await ensureLearner(user);
    await getDb().execute(`UPDATE auth_users SET last_login_at = UTC_TIMESTAMP(3) WHERE id = ?`, [user.id]);
    return { kind: "session", user: toAuthUser(user), token: await createSession(user.id), returnTo: saved.return_to };
  }

  const claimedEmail = normalizeEmail(claims?.email ?? claims?.preferred_username);
  const name = typeof claims?.name === "string" && claims.name.trim()
    ? claims.name.trim().slice(0, 80)
    : claimedEmail ? displayNameFromEmail(claimedEmail) : "Seeker";
  if (!claimedEmail) throw new AuthError("Your provider did not share an email address. Use email sign-in instead.");

  const linkingUser = saved.link_user_id ? await findUserId(saved.link_user_id) : null;
  if (saved.link_user_id && (!linkingUser || linkingUser.disabled_at)) throw new AuthError("Your linking session is no longer valid.", 401);
  if (linkingUser && linkingUser.email !== claimedEmail) throw new AuthError("Connect a provider that uses the same verified email as your Living Bliss account.", 409);

  const providerVerified = provider === "google" && claims?.email_verified === true;
  if (!providerVerified) {
    const challenge = await createOtpChallenge(claimedEmail, "oidc-link", request, { provider, issuer, subject, name });
    return { kind: "verify-email", challengeId: challenge.challengeId, email: challenge.email, returnTo: saved.return_to };
  }

  user = linkingUser ?? await findEmail(claimedEmail);
  if (user && !user.email_verified_at) throw new AuthError("Verify this email account before linking Google.", 409);
  if (!user) user = await createVerifiedUser(claimedEmail, name);
  await linkIdentity(user.id, provider, issuer, subject, claimedEmail);
  await ensureLearner(user);
  await getDb().execute(`UPDATE auth_users SET last_login_at = UTC_TIMESTAMP(3) WHERE id = ?`, [user.id]);
  return { kind: "session", user: toAuthUser(user), token: await createSession(user.id), returnTo: saved.return_to };
}

export function isOidcProvider(value: string): value is OidcProvider {
  return value === "google" || value === "microsoft";
}
