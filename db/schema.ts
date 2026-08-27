import { boolean, int, json, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const learnerStates = mysqlTable("learner_states", {
  id: varchar("id", { length: 36 }).primaryKey(),
  displayName: varchar("display_name", { length: 80 }).notNull().default("Seeker"),
  preferredLanguage: varchar("preferred_language", { length: 30 }).notNull().default("English"),
  learningMode: varchar("learning_mode", { length: 30 }).notNull().default("Mixed learning"),
  completedLessons: json("completed_lessons").$type<string[]>().notNull(),
  assessmentScore: int("assessment_score"),
  assessmentPassed: boolean("assessment_passed").notNull().default(false),
  memberJoined: boolean("member_joined").notNull().default(false),
  updatedAt: timestamp("updated_at", { mode: "string", fsp: 3 }).notNull(),
});
