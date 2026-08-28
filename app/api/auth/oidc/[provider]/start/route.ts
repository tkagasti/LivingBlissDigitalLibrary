import { authJsonError } from "../../../../../auth/service";
import { isOidcProvider, startOidc } from "../../../../../auth/oidc";
import { getSessionFromRequest } from "../../../../../auth/session";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ provider: string }> }) {
  try {
    const { provider } = await context.params;
    if (!isOidcProvider(provider)) return Response.json({ error: "Unknown identity provider." }, { status: 404 });
    const url = new URL(request.url);
    const linkingUser = url.searchParams.get("link") === "1" ? await getSessionFromRequest(request) : null;
    if (url.searchParams.get("link") === "1" && !linkingUser) return Response.redirect(new URL(`/sign-in?returnTo=${encodeURIComponent("/account")}`, url.origin));
    return Response.redirect(await startOidc(provider, url.searchParams.get("returnTo"), linkingUser?.id ?? null));
  } catch (error) {
    return authJsonError(error);
  }
}
