import { getSessionFromRequest, sessionCount } from "../../../auth/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await getSessionFromRequest(request);
    return Response.json({ user, activeSessions: user ? await sessionCount(user.id) : 0 });
  } catch (error) {
    console.error("Unable to read authentication session", error);
    return Response.json({ user: null, activeSessions: 0 }, { status: 503 });
  }
}
