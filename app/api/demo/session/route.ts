import { demoProfiles } from "../../../demo/demo-data";
import {
  assertDemoRequestOrigin,
  attachDemoCookie,
  clearDemoCookie,
  createInitialDemoSession,
  getDemoSessionFromRequest,
  isDemoModeEnabled,
} from "../../../demo/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const enabled = isDemoModeEnabled();
  const session = enabled ? getDemoSessionFromRequest(request) : null;
  return Response.json({
    enabled,
    activeProfileId: session?.profileId ?? null,
    profiles: enabled ? demoProfiles : [],
  });
}

export async function POST(request: Request) {
  if (!isDemoModeEnabled()) {
    return Response.json({ error: "The demonstration experience is disabled." }, { status: 404 });
  }

  try {
    assertDemoRequestOrigin(request);
    const payload = (await request.json()) as { profileId?: unknown };
    const session = createInitialDemoSession(payload.profileId);
    if (!session) return Response.json({ error: "Choose a valid demonstration profile." }, { status: 400 });
    return attachDemoCookie(Response.json({ success: true, profileId: session.profileId }), session);
  } catch {
    return Response.json({ error: "Unable to start the demonstration profile." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!isDemoModeEnabled()) {
    return Response.json({ error: "The demonstration experience is disabled." }, { status: 404 });
  }
  try {
    assertDemoRequestOrigin(request);
    return clearDemoCookie(Response.json({ success: true }));
  } catch {
    return Response.json({ error: "Unable to close the demonstration profile." }, { status: 400 });
  }
}
