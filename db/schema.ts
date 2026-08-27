import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const learnerStates = sqliteTable("learner_states", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull().default("Seeker"),
  preferredLanguage: text("preferred_language").notNull().default("English"),
  learningMode: text("learning_mode").notNull().default("Mixed learning"),
  completedLessons: text("completed_lessons").notNull().default("[]"),
  assessmentScore: integer("assessment_score"),
  assessmentPassed: integer("assessment_passed", { mode: "boolean" }).notNull().default(false),
  memberJoined: integer("member_joined", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull(),
});
