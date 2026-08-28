import type { RowDataPacket } from "mysql2";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
};

export type UserRow = RowDataPacket & {
  id: string;
  email: string;
  display_name: string;
  email_verified_at: string | null;
  password_hash: string | null;
  disabled_at: string | null;
};

export type SessionRow = RowDataPacket & UserRow & {
  token_hash: string;
  session_expires_at: string;
  absolute_expires_at: string;
  last_seen_at: string;
};

export function toAuthUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    name: row.display_name,
    emailVerified: Boolean(row.email_verified_at),
  };
}
