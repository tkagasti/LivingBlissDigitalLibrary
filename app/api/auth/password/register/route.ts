import { jsonBody } from "../../../../auth/http";
import { authJsonError, registerPassword } from "../../../../auth/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    return Response.json(await registerPassword(await jsonBody(request), request), { status: 201 });
  } catch (error) {
    return authJsonError(error);
  }
}
