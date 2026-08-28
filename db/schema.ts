import { sql } from "drizzle-orm";
import {
  boolean,
  char,
  check,
  index,
  int,
  json,
  mysqlTable,
  text,
  timestamp,
  tinyint,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const authUsers = mysqlTable(
  "auth_users",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    displayName: varchar("display_name", { length: 80 }).notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { mode: "string", fsp: 3 }),
    passwordHash: varchar("password_hash", { length: 255 }),
    lastLoginAt: timestamp("last_login_at", { mode: "string", fsp: 3 }),
    disabledAt: timestamp("disabled_at", { mode: "string", fsp: 3 }),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string", fsp: 3 }).notNull().defaultNow().onUpdateNow(),
  },
  (table) => [uniqueIndex("auth_users_email_unique").on(table.email)],
);

export const authIdentities = mysqlTable(
  "auth_identities",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 32 }).notNull(),
    issuer: varchar("issuer", { length: 255 }).notNull(),
    subject: varchar("subject", { length: 255 }).notNull(),
    providerEmail: varchar("provider_email", { length: 320 }),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("auth_identity_issuer_subject_unique").on(table.issuer, table.subject),
    index("auth_identity_user_idx").on(table.userId),
  ],
);

export const authSessions = mysqlTable(
  "auth_sessions",
  {
    tokenHash: char("token_hash", { length: 64 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { mode: "string", fsp: 3 }).notNull(),
    absoluteExpiresAt: timestamp("absolute_expires_at", { mode: "string", fsp: 3 }).notNull(),
    lastSeenAt: timestamp("last_seen_at", { mode: "string", fsp: 3 }).notNull(),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
    revokedAt: timestamp("revoked_at", { mode: "string", fsp: 3 }),
  },
  (table) => [index("auth_session_user_idx").on(table.userId), index("auth_session_expiry_idx").on(table.expiresAt)],
);

export const authChallenges = mysqlTable(
  "auth_challenges",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    purpose: varchar("purpose", { length: 32 }).notNull(),
    codeHash: char("code_hash", { length: 64 }).notNull(),
    attemptsRemaining: tinyint("attempts_remaining", { unsigned: true }).notNull().default(3),
    metadataEncrypted: text("metadata_encrypted"),
    expiresAt: timestamp("expires_at", { mode: "string", fsp: 3 }).notNull(),
    consumedAt: timestamp("consumed_at", { mode: "string", fsp: 3 }),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [index("auth_challenge_email_idx").on(table.email), index("auth_challenge_expiry_idx").on(table.expiresAt)],
);

export const authOidcTransactions = mysqlTable(
  "auth_oidc_transactions",
  {
    stateHash: char("state_hash", { length: 64 }).primaryKey(),
    provider: varchar("provider", { length: 32 }).notNull(),
    linkUserId: varchar("link_user_id", { length: 36 }).references(() => authUsers.id, { onDelete: "cascade" }),
    payloadEncrypted: text("payload_encrypted").notNull(),
    returnTo: varchar("return_to", { length: 512 }).notNull(),
    expiresAt: timestamp("expires_at", { mode: "string", fsp: 3 }).notNull(),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [index("auth_oidc_expiry_idx").on(table.expiresAt), index("auth_oidc_link_user_idx").on(table.linkUserId)],
);

export const authRateLimits = mysqlTable(
  "auth_rate_limits",
  {
    keyHash: char("key_hash", { length: 64 }).primaryKey(),
    requestCount: int("request_count", { unsigned: true }).notNull().default(1),
    expiresAt: timestamp("expires_at", { mode: "string", fsp: 3 }).notNull(),
  },
  (table) => [index("auth_rate_limit_expiry_idx").on(table.expiresAt)],
);

export const learnerStates = mysqlTable(
  "learner_states",
  {
    userId: varchar("user_id", { length: 36 })
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    displayName: varchar("display_name", { length: 80 }).notNull().default("Seeker"),
    preferredLanguage: varchar("preferred_language", { length: 30 }).notNull().default("English"),
    learningMode: varchar("learning_mode", { length: 30 }).notNull().default("Mixed learning"),
    completedLessons: json("completed_lessons").$type<string[]>().notNull(),
    assessmentScore: int("assessment_score"),
    assessmentPassed: boolean("assessment_passed").notNull().default(false),
    onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
    updatedAt: timestamp("updated_at", { mode: "string", fsp: 3 }).notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    check(
      "learner_assessment_score_range",
      sql`${table.assessmentScore} IS NULL OR ${table.assessmentScore} BETWEEN 0 AND 100`,
    ),
  ],
);
