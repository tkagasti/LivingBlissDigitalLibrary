import { attachSessionCookie } from "../../../../../auth/service";
import { finishOidc, isOidcProvider } from "../../../../../auth/oidc";

export const runtime = "nodejs";

function signInRedirect(request: Request, values: Record<string, string>) {
  const url = new URL("/sign-in", new URL(request.url).origin);
  for (const [key, value] of Object.entries(values)) url.searchParams.set(key, value);
  return url;
}

export async function GET(request: Request, context: { params: Promise<{ provider: string }> }) {
  try {
    const { provider } = await context.params;
    if (!isOidcProvider(provider)) return Response.json({ error: "Unknown identity provider." }, { status: 404 });
    const result = await finishOidc(provider, request);
    if (result.kind === "verify-email") {
      return Response.redirect(signInRedirect(request, {
        challenge: result.challengeId,
        email: result.email,
        returnTo: result.returnTo,
        mode: "verify-provider",
      }));
    }
    return attachSessionCookie(Response.redirect(new URL(result.returnTo, new URL(request.url).origin)), result.token);
  } catch (error) {
    console.error("OIDC callback failed", error instanceof Error ? error.name : "UnknownError");
    const response = Response.redirect(signInRedirect(request, { error: "Provider sign-in could not be completed. Please try again." }));
    if (error instanceof Error && process.env.NODE_ENV === "development") response.headers.set("x-auth-error", error.message.slice(0, 200));
    return response;
  }
}
