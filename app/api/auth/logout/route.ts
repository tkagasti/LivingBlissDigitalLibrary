import { assertSameOrigin } from "../../../auth/http";
import { authJsonError, clearSessionCookie } from "../../../auth/service";
import { revokeRequestSession } from "../../../auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await revokeRequestSession(request);
    return clearSessionCookie(Response.json({ success: true }));
  } catch (error) {
    return authJsonError(error);
  }
}
