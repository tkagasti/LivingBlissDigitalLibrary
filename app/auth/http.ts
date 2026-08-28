import { AuthError } from "./service";

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const expected = process.env.AUTH_BASE_URL?.replace(/\/$/, "") || new URL(request.url).origin;
  if (origin !== expected) throw new AuthError("Invalid request origin.", 403);
}

export async function jsonBody(request: Request): Promise<Record<string, unknown>> {
  assertSameOrigin(request);
  try {
    const value: unknown = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch {
    throw new AuthError("Invalid request body.");
  }
}
