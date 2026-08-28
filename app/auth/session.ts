import { cookies } from "next/headers";
import type { RowDataPacket } from "mysql2";
import { getDb } from "../../db";
import { randomToken, sha256 } from "./crypto";
import type { AuthUser, SessionRow } from "./types";
import { toAuthUser } from "./types";

export const SESSION_COOKIE = "lb_session";
const NINETY_DAYS = 90 * 24 * 60 * 60;

function cookieValue(header: string | null, name: string) {
  return (header ?? "").split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) ?? null;
}

async function lookupSession(token: string | null): Promise<AuthUser | null> {
  if (!token) return null;
  const tokenHash = sha256(token);
  const [rows] = await getDb().execute<SessionRow[]>(
    `SELECT s.token_hash, s.expires_at AS session_expires_at, s.absolute_expires_at, s.last_seen_at,
            u.id, u.email, u.display_name, u.email_verified_at, u.password_hash, u.disabled_at
       FROM auth_sessions s JOIN auth_users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > UTC_TIMESTAMP(3)
        AND s.absolute_expires_at > UTC_TIMESTAMP(3) AND u.disabled_at IS NULL LIMIT 1`,
    [tokenHash],
  );
  const row = rows[0];
  if (!row) return null;
  await getDb().execute(
    `UPDATE auth_sessions SET last_seen_at = UTC_TIMESTAMP(3),
      expires_at = LEAST(absolute_expires_at, DATE_ADD(UTC_TIMESTAMP(3), INTERVAL 30 DAY))
      WHERE token_hash = ? AND last_seen_at < DATE_SUB(UTC_TIMESTAMP(3), INTERVAL 1 DAY)`,
    [tokenHash],
  );
  return toAuthUser(row);
}

export async function getSession(): Promise<AuthUser | null> {
  const store = await cookies();
  return lookupSession(store.get(SESSION_COOKIE)?.value ?? null);
}

export function getSessionFromRequest(request: Request): Promise<AuthUser | null> {
  return lookupSession(cookieValue(request.headers.get("cookie"), SESSION_COOKIE));
}

export async function createSession(userId: string) {
  const token = randomToken();
  await getDb().execute(
    `INSERT INTO auth_sessions (token_hash, user_id, expires_at, absolute_expires_at, last_seen_at, created_at)
     VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(3), INTERVAL 30 DAY), DATE_ADD(UTC_TIMESTAMP(3), INTERVAL 90 DAY), UTC_TIMESTAMP(3), UTC_TIMESTAMP(3))`,
    [sha256(token), userId],
  );
  return token;
}

export function attachSessionCookie(response: Response, token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append("set-cookie", `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${NINETY_DAYS}; HttpOnly; SameSite=Lax${secure}`);
  response.headers.append("set-cookie", `lb_learner_id=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`);
  return response;
}

export function clearSessionCookie(response: Response) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append("set-cookie", `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`);
  return response;
}

export async function revokeRequestSession(request: Request) {
  const token = cookieValue(request.headers.get("cookie"), SESSION_COOKIE);
  if (token) await getDb().execute(`UPDATE auth_sessions SET revoked_at = UTC_TIMESTAMP(3) WHERE token_hash = ?`, [sha256(token)]);
}

export async function revokeOtherSessions(userId: string, request: Request) {
  const token = cookieValue(request.headers.get("cookie"), SESSION_COOKIE);
  const keep = token ? sha256(token) : "";
  await getDb().execute(`UPDATE auth_sessions SET revoked_at = UTC_TIMESTAMP(3) WHERE user_id = ? AND token_hash <> ? AND revoked_at IS NULL`, [userId, keep]);
}

export async function revokeAllSessions(userId: string) {
  await getDb().execute(`UPDATE auth_sessions SET revoked_at = UTC_TIMESTAMP(3) WHERE user_id = ? AND revoked_at IS NULL`, [userId]);
}

export async function sessionCount(userId: string): Promise<number> {
  const [rows] = await getDb().execute<(RowDataPacket & { count: number })[]>(
    `SELECT COUNT(*) AS count FROM auth_sessions WHERE user_id = ? AND revoked_at IS NULL AND expires_at > UTC_TIMESTAMP(3)`,
    [userId],
  );
  return Number(rows[0]?.count ?? 0);
}
