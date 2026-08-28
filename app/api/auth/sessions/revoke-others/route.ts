import { assertSameOrigin } from "../../../../auth/http";
import { authJsonError } from "../../../../auth/service";
import { getSessionFromRequest, revokeOtherSessions } from "../../../../auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getSessionFromRequest(request);
    if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
    await revokeOtherSessions(user.id, request);
    return Response.json({ success: true });
  } catch (error) {
    return authJsonError(error);
  }
}
