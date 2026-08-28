import { jsonBody } from "../../../../auth/http";
import { authJsonError, authSuccess, loginPassword } from "../../../../auth/service";
import { safeReturnTo } from "../../../../auth/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await jsonBody(request);
    const result = await loginPassword(body, request);
    return authSuccess(result.user, result.token, safeReturnTo(body.returnTo));
  } catch (error) {
    return authJsonError(error);
  }
}
