import type { RowDataPacket } from "mysql2";
import { getDb } from "../../../db";

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
  id: string;
  display_name: string;
  preferred_language: string;
  learning_mode: string;
  completed_lessons: string | string[];
  assessment_score: number | null;
  assessment_passed: number | boolean;
  member_joined: number | boolean;
  updated_at: string;
};

const COOKIE_NAME = "lb_learner_id";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getCookie(request: Request, name: string) {
  const cookie = request.headers.get("cookie") ?? "";
  const item = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : null;
}

function visitor(request: Request) {
  const cookieId = getCookie(request, COOKIE_NAME);
  const existing = cookieId && UUID_PATTERN.test(cookieId) ? cookieId : null;
  return { id: existing ?? crypto.randomUUID(), isNew: !existing };
}

function withCookie(payload: unknown, id: string, isNew: boolean, status = 200) {
  const headers = new Headers({ "content-type": "application/json" });
  if (isNew) {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    headers.append(
      "set-cookie",
      `${COOKIE_NAME}=${encodeURIComponent(id)}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secure}`,
    );
  }
  return new Response(JSON.stringify(payload), { status, headers });
}

async function ensureLearner(id: string) {
  await getDb().execute(
    `INSERT IGNORE INTO learner_states
      (id, display_name, preferred_language, learning_mode, completed_lessons, assessment_score, assessment_passed, member_joined, updated_at)
     VALUES (?, 'Seeker', 'English', 'Mixed learning', JSON_ARRAY(), NULL, FALSE, FALSE, UTC_TIMESTAMP(3))`,
    [id],
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
    `SELECT id, display_name, preferred_language, learning_mode, completed_lessons,
            assessment_score, assessment_passed, member_joined, updated_at
       FROM learner_states WHERE id = ? LIMIT 1`,
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
    memberJoined: Boolean(row?.member_joined),
    updatedAt: row?.updated_at ?? "",
  };
}

export async function GET(request: Request) {
  try {
    const { id, isNew } = visitor(request);
    await ensureLearner(id);
    return withCookie({ learner: await readLearner(id) }, id, isNew);
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
    const { id, isNew } = visitor(request);
    const payload = (await request.json()) as ProgressPayload;
    await ensureLearner(id);

    if (payload.action === "profile") {
      const name = payload.displayName?.trim().slice(0, 80) || "Seeker";
      const language = payload.preferredLanguage?.trim().slice(0, 30) || "English";
      const mode = payload.learningMode?.trim().slice(0, 30) || "Mixed learning";
      await getDb().execute(
        `UPDATE learner_states
            SET display_name = ?, preferred_language = ?, learning_mode = ?, member_joined = TRUE, updated_at = UTC_TIMESTAMP(3)
          WHERE id = ?`,
        [name, language, mode, id],
      );
    } else if (payload.action === "completeLesson" && payload.lessonId) {
      const lessonId = payload.lessonId.trim().slice(0, 100);
      if (!lessonId) {
        return withCookie({ error: "A lesson ID is required." }, id, isNew, 400);
      }
      await getDb().execute(
        `UPDATE learner_states
            SET completed_lessons = IF(
                  JSON_CONTAINS(completed_lessons, JSON_QUOTE(?)),
                  completed_lessons,
                  JSON_ARRAY_APPEND(completed_lessons, '$', ?)
                ),
                updated_at = UTC_TIMESTAMP(3)
          WHERE id = ?`,
        [lessonId, lessonId, id],
      );
    } else if (payload.action === "assessment") {
      const score = Math.max(0, Math.min(100, Math.round(Number(payload.score) || 0)));
      await getDb().execute(
        `UPDATE learner_states
            SET assessment_score = ?, assessment_passed = ?, updated_at = UTC_TIMESTAMP(3)
          WHERE id = ?`,
        [score, score >= 60, id],
      );
    } else if (payload.action === "reset") {
      await getDb().execute(
        `UPDATE learner_states
            SET completed_lessons = JSON_ARRAY(), assessment_score = NULL, assessment_passed = FALSE, updated_at = UTC_TIMESTAMP(3)
          WHERE id = ?`,
        [id],
      );
    } else {
      return withCookie({ error: "Unsupported progress action." }, id, isNew, 400);
    }

    return withCookie({ learner: await readLearner(id) }, id, isNew);
  } catch (error) {
    console.error("Unable to save learner progress", error);
    return Response.json(
      { error: "We could not save this update. Please try again." },
      { status: 500 },
    );
  }
}
