import { attachSessionCookie } from "../../../../../auth/service";
import { finishOidc, isOidcProvider } from "../../../../../auth/oidc";

export const runtime = "nodejs";

function signInRedirect(request: Request, values: Record<string, string>) {
  const url = new URL("/sign-in", authOrigin(request));
  for (const [key, value] of Object.entries(values)) url.searchParams.set(key, value);
  return url;
}

function mutableRedirect(url: URL) {
  return new Response(null, {
    status: 302,
    headers: { location: url.toString() },
  });
}

function authOrigin(request: Request) {
  const configured = process.env.AUTH_BASE_URL?.trim();
  return configured ? new URL(configured).origin : new URL(request.url).origin;
}

function oidcErrorDetails(error: unknown) {
  if (!(error instanceof Error)) return { name: "UnknownError" };
  const coded = error as Error & { code?: unknown; cause?: unknown };
  return {
    name: error.name,
    message: error.message,
    code: typeof coded.code === "string" ? coded.code : undefined,
    cause: coded.cause instanceof Error ? coded.cause.message : undefined,
  };
}

export async function GET(request: Request, context: { params: Promise<{ provider: string }> }) {
  try {
    const { provider } = await context.params;
    if (!isOidcProvider(provider)) return Response.json({ error: "Unknown identity provider." }, { status: 404 });
    const result = await finishOidc(provider, request);
    if (result.kind === "verify-email") {
      return mutableRedirect(signInRedirect(request, {
        challenge: result.challengeId,
        email: result.email,
        returnTo: result.returnTo,
        mode: "verify-provider",
      }));
    }
    return attachSessionCookie(mutableRedirect(new URL(result.returnTo, authOrigin(request))), result.token);
  } catch (error) {
    console.error("OIDC callback failed", oidcErrorDetails(error));
    const response = mutableRedirect(signInRedirect(request, { error: "Provider sign-in could not be completed. Please try again." }));
    if (error instanceof Error && process.env.NODE_ENV === "development") response.headers.set("x-auth-error", error.message.slice(0, 200));
    return response;
  }
}
