import "server-only";

import { cookies } from "next/headers";
import type { AuthUser } from "../auth/types";
import {
  createDemoSession,
  isDemoProfileId,
  type DemoLearner,
  type DemoSessionState,
} from "./demo-data";

export const DEMO_COOKIE = "lb_demo_session";

export function isDemoModeEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.ENABLE_DEMO_MODE === "true";
}

function isDemoLearner(value: unknown): value is DemoLearner {
  if (!value || typeof value !== "object") return false;
  const learner = value as Partial<DemoLearner>;
  return (
    typeof learner.id === "string" && learner.id.startsWith("demo-") &&
    typeof learner.displayName === "string" && learner.displayName.length <= 80 &&
    typeof learner.preferredLanguage === "string" && learner.preferredLanguage.length <= 30 &&
    typeof learner.learningMode === "string" && learner.learningMode.length <= 30 &&
    Array.isArray(learner.completedLessons) &&
    learner.completedLessons.every((lesson) => typeof lesson === "string" && lesson.length <= 100) &&
    (learner.assessmentScore === null ||
      (typeof learner.assessmentScore === "number" && learner.assessmentScore >= 0 && learner.assessmentScore <= 100)) &&
    typeof learner.assessmentPassed === "boolean" &&
    learner.memberJoined === true &&
    typeof learner.updatedAt === "string"
  );
}

function decodeDemoSession(value: string | undefined): DemoSessionState | null {
  if (!isDemoModeEnabled() || !value) return null;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (!parsed || typeof parsed !== "object") return null;
    const state = parsed as Partial<DemoSessionState>;
    return isDemoProfileId(state.profileId) && isDemoLearner(state.learner)
      ? { profileId: state.profileId, learner: state.learner }
      : null;
  } catch {
    return null;
  }
}

function cookieValue(header: string | null, name: string) {
  return (header ?? "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export function getDemoSessionFromRequest(request: Request) {
  return decodeDemoSession(cookieValue(request.headers.get("cookie"), DEMO_COOKIE));
}

export async function getDemoSession() {
  const store = await cookies();
  return decodeDemoSession(store.get(DEMO_COOKIE)?.value);
}

export function createInitialDemoSession(profileId: unknown) {
  return isDemoModeEnabled() && isDemoProfileId(profileId) ? createDemoSession(profileId) : null;
}

export function attachDemoCookie(response: Response, state: DemoSessionState) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const value = Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
  response.headers.append(
    "set-cookie",
    `${DEMO_COOKIE}=${value}; Path=/; Max-Age=604800; HttpOnly; SameSite=Lax${secure}`,
  );
  return response;
}

export function clearDemoCookie(response: Response) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append(
    "set-cookie",
    `${DEMO_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`,
  );
  return response;
}

export function demoAuthUser(state: DemoSessionState): AuthUser {
  return {
    id: state.learner.id,
    email: `${state.profileId}@demo.livingbliss.local`,
    name: state.learner.displayName,
    emailVerified: true,
  };
}

export function assertDemoRequestOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;

  const originUrl = new URL(origin);
  const requestUrl = new URL(request.url);
  const localHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);
  const isLocalPreview = localHosts.has(originUrl.hostname) && localHosts.has(requestUrl.hostname);
  const samePort = originUrl.port === requestUrl.port;
  if (originUrl.origin !== requestUrl.origin && !(isLocalPreview && samePort)) {
    throw new Error("Invalid demo request origin.");
  }
}
