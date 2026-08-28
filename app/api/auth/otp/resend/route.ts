import { jsonBody } from "../../../../auth/http";
import { authJsonError, resendOtp } from "../../../../auth/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    return Response.json(await resendOtp(await jsonBody(request), request));
  } catch (error) {
    return authJsonError(error);
  }
}
