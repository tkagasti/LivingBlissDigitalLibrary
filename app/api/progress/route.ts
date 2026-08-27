import { env } from "cloudflare:workers";

type ProgressPayload = {
  action?: "profile" | "completeLesson" | "assessment" | "reset";
  displayName?: string;
  preferredLanguage?: string;
  learningMode?: string;
  lessonId?: string;
  score?: number;
};

const COOKIE_NAME = "lb_learner_id";

function getCookie(request: Request, name: string) {
  const cookie = request.headers.get("cookie") ?? "";
  const item = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : null;
}

function visitor(request: Request) {
  const existing = getCookie(request, COOKIE_NAME);
  return { id: existing ?? crypto.randomUUID(), isNew: !existing };
}

function withCookie(payload: unknown, id: string, isNew: boolean, status = 200) {
  const headers = new Headers({ "content-type": "application/json" });
  if (isNew) {
    headers.append(
      "set-cookie",
      `${COOKIE_NAME}=${encodeURIComponent(id)}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax; Secure`,
    );
  }
  return new Response(JSON.stringify(payload), { status, headers });
}

async function ensureLearner(id: string) {
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT OR IGNORE INTO learner_states
      (id, display_name, preferred_language, learning_mode, completed_lessons, assessment_score, assessment_passed, member_joined, updated_at)
     VALUES (?, 'Seeker', 'English', 'Mixed learning', '[]', NULL, 0, 0, ?)`,
  )
    .bind(id, now)
    .run();
}

async function readLearner(id: string) {
  const row = await env.DB.prepare(
    `SELECT id, display_name, preferred_language, learning_mode, completed_lessons,
            assessment_score, assessment_passed, member_joined, updated_at
       FROM learner_states WHERE id = ?`,
  )
    .bind(id)
    .first<Record<string, unknown>>();

  return {
    id,
    displayName: String(row?.display_name ?? "Seeker"),
    preferredLanguage: String(row?.preferred_language ?? "English"),
    learningMode: String(row?.learning_mode ?? "Mixed learning"),
    completedLessons: JSON.parse(String(row?.completed_lessons ?? "[]")) as string[],
    assessmentScore: row?.assessment_score == null ? null : Number(row.assessment_score),
    assessmentPassed: Boolean(row?.assessment_passed),
    memberJoined: Boolean(row?.member_joined),
    updatedAt: String(row?.updated_at ?? ""),
  };
}

export async function GET(request: Request) {
  try {
    const { id, isNew } = visitor(request);
    await ensureLearner(id);
    return withCookie({ learner: await readLearner(id) }, id, isNew);
  } catch {
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
    const now = new Date().toISOString();

    if (payload.action === "profile") {
      const name = payload.displayName?.trim().slice(0, 80) || "Seeker";
      const language = payload.preferredLanguage?.trim().slice(0, 30) || "English";
      const mode = payload.learningMode?.trim().slice(0, 30) || "Mixed learning";
      await env.DB.prepare(
        "UPDATE learner_states SET display_name = ?, preferred_language = ?, learning_mode = ?, member_joined = 1, updated_at = ? WHERE id = ?",
      )
        .bind(name, language, mode, now, id)
        .run();
    } else if (payload.action === "completeLesson" && payload.lessonId) {
      const current = await readLearner(id);
      const completed = Array.from(
        new Set([...current.completedLessons, payload.lessonId]),
      ).slice(0, 200);
      await env.DB.prepare(
        "UPDATE learner_states SET completed_lessons = ?, updated_at = ? WHERE id = ?",
      )
        .bind(JSON.stringify(completed), now, id)
        .run();
    } else if (payload.action === "assessment") {
      const score = Math.max(0, Math.min(100, Math.round(Number(payload.score) || 0)));
      await env.DB.prepare(
        "UPDATE learner_states SET assessment_score = ?, assessment_passed = ?, updated_at = ? WHERE id = ?",
      )
        .bind(score, score >= 60 ? 1 : 0, now, id)
        .run();
    } else if (payload.action === "reset") {
      await env.DB.prepare(
        "UPDATE learner_states SET completed_lessons = '[]', assessment_score = NULL, assessment_passed = 0, updated_at = ? WHERE id = ?",
      )
        .bind(now, id)
        .run();
    } else {
      return withCookie({ error: "Unsupported progress action." }, id, isNew, 400);
    }

    return withCookie({ learner: await readLearner(id) }, id, isNew);
  } catch {
    return Response.json(
      { error: "We could not save this update. Please try again." },
      { status: 500 },
    );
  }
}
