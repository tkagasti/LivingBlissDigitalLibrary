import { assertSameOrigin } from "../../../auth/http";
import { getStudyAssistantProvider, validateStudyRequest } from "../../../ai/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > 4_096) {
      return Response.json({ error: "The request is too large." }, { status: 413 });
    }

    const payload: unknown = await request.json();
    const studyRequest = validateStudyRequest(payload);
    if (!studyRequest) {
      return Response.json({ error: "Ask a short question using the active course and edition context." }, { status: 400 });
    }

    const response = await getStudyAssistantProvider().answer(studyRequest);
    return Response.json(response, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json(
      { error: "The study companion is temporarily unavailable. Your question was not saved." },
      { status: 503 },
    );
  }
}
