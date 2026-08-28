import { jsonBody } from "../../../../auth/http";
import { authJsonError, requestOtp } from "../../../../auth/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    return Response.json(await requestOtp(await jsonBody(request), request));
  } catch (error) {
    return authJsonError(error);
  }
}
