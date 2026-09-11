import { assertSameOrigin } from "../../../auth/http";
import { authJsonError, clearSessionCookie } from "../../../auth/service";
import { revokeRequestSession } from "../../../auth/session";
import { clearDemoCookie, getDemoSessionFromRequest } from "../../../demo/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (getDemoSessionFromRequest(request)) {
      return clearDemoCookie(clearSessionCookie(Response.json({ success: true })));
    }
    assertSameOrigin(request);
    await revokeRequestSession(request);
    return clearSessionCookie(Response.json({ success: true }));
  } catch (error) {
    return authJsonError(error);
  }
}
