import { jsonBody } from "../../../../auth/http";
import { authJsonError, changePassword } from "../../../../auth/service";
import { getSessionFromRequest, revokeOtherSessions } from "../../../../auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
    await changePassword(user.id, await jsonBody(request));
    await revokeOtherSessions(user.id, request);
    return Response.json({ success: true });
  } catch (error) {
    return authJsonError(error);
  }
}
