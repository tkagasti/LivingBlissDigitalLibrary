import type { RowDataPacket } from "mysql2";
import { getDb } from "../../../db";
import { assertSameOrigin } from "../../auth/http";
import { getSessionFromRequest } from "../../auth/session";

export const runtime = "nodejs";

type ProgressPayload = {
  action?: "profile" | "completeLesson" | "assessment" | "reset";
  displayName?: string;
  preferredLanguage?: string;
  learningMode?: string;
  lessonId?: string;
  score?: number;
};

type LearnerRow = RowDataPacket & {
  user_id: string;
  display_name: string;
  preferred_language: string;
  learning_mode: string;
  completed_lessons: string | string[];
  assessment_score: number | null;
  assessment_passed: number | boolean;
  onboarding_completed: number | boolean;
  updated_at: string;
};

async function ensureLearner(id: string, displayName: string) {
  await getDb().execute(
    `INSERT IGNORE INTO learner_states
      (user_id, display_name, preferred_language, learning_mode, completed_lessons, assessment_score, assessment_passed, onboarding_completed, updated_at)
     VALUES (?, ?, 'English', 'Mixed learning', JSON_ARRAY(), NULL, FALSE, FALSE, UTC_TIMESTAMP(3))`,
    [id, displayName.slice(0, 80) || "Seeker"],
  );
}

function parseCompletedLessons(value: string | string[]) {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

async function readLearner(id: string) {
  const [rows] = await getDb().execute<LearnerRow[]>(
    `SELECT user_id, display_name, preferred_language, learning_mode, completed_lessons,
            assessment_score, assessment_passed, onboarding_completed, updated_at
       FROM learner_states WHERE user_id = ? LIMIT 1`,
    [id],
  );
  const row = rows[0];

  return {
    id,
    displayName: row?.display_name ?? "Seeker",
    preferredLanguage: row?.preferred_language ?? "English",
    learningMode: row?.learning_mode ?? "Mixed learning",
    completedLessons: parseCompletedLessons(row?.completed_lessons ?? []),
    assessmentScore: row?.assessment_score == null ? null : Number(row.assessment_score),
    assessmentPassed: Boolean(row?.assessment_passed),
    memberJoined: Boolean(row?.onboarding_completed),
    updatedAt: row?.updated_at ?? "",
  };
}

export async function GET(request: Request) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user) return Response.json({ learner: null, authenticated: false });
    await ensureLearner(user.id, user.name);
    return Response.json({ learner: await readLearner(user.id), authenticated: true, user });
  } catch (error) {
    console.error("Unable to load learner progress", error);
    return Response.json(
      { error: "Learner progress is temporarily unavailable." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getSessionFromRequest(request);
    if (!user) return Response.json({ error: "Sign in to save your learning." }, { status: 401 });
    const id = user.id;
    const payload = (await request.json()) as ProgressPayload;
    await ensureLearner(id, user.name);

    if (payload.action === "profile") {
      const name = payload.displayName?.trim().slice(0, 80) || "Seeker";
      const language = payload.preferredLanguage?.trim().slice(0, 30) || "English";
      const mode = payload.learningMode?.trim().slice(0, 30) || "Mixed learning";
      await getDb().execute(
        `UPDATE learner_states
            SET display_name = ?, preferred_language = ?, learning_mode = ?, onboarding_completed = TRUE, updated_at = UTC_TIMESTAMP(3)
          WHERE user_id = ?`,
        [name, language, mode, id],
      );
      await getDb().execute(`UPDATE auth_users SET display_name = ?, updated_at = UTC_TIMESTAMP(3) WHERE id = ?`, [name, id]);
    } else if (payload.action === "completeLesson" && payload.lessonId) {
      const lessonId = payload.lessonId.trim().slice(0, 100);
      if (!lessonId) {
        return Response.json({ error: "A lesson ID is required." }, { status: 400 });
      }
      await getDb().execute(
        `UPDATE learner_states
            SET completed_lessons = IF(
                  JSON_CONTAINS(completed_lessons, JSON_QUOTE(?)),
                  completed_lessons,
                  JSON_ARRAY_APPEND(completed_lessons, '$', ?)
                ),
                updated_at = UTC_TIMESTAMP(3)
          WHERE user_id = ?`,
        [lessonId, lessonId, id],
      );
    } else if (payload.action === "assessment") {
      const score = Math.max(0, Math.min(100, Math.round(Number(payload.score) || 0)));
      await getDb().execute(
        `UPDATE learner_states
            SET assessment_score = ?, assessment_passed = ?, updated_at = UTC_TIMESTAMP(3)
          WHERE user_id = ?`,
        [score, score >= 60, id],
      );
    } else if (payload.action === "reset") {
      await getDb().execute(
        `UPDATE learner_states
            SET completed_lessons = JSON_ARRAY(), assessment_score = NULL, assessment_passed = FALSE, updated_at = UTC_TIMESTAMP(3)
          WHERE user_id = ?`,
        [id],
      );
    } else {
      return Response.json({ error: "Unsupported progress action." }, { status: 400 });
    }

    return Response.json({ learner: await readLearner(id), authenticated: true, user });
  } catch (error) {
    console.error("Unable to save learner progress", error);
    return Response.json(
      { error: "We could not save this update. Please try again." },
      { status: 500 },
    );
  }
}
