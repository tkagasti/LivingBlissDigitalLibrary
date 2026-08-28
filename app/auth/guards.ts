import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { getDb } from "../../db";
import { getSession } from "./session";

export async function requirePageUser(returnTo: string, requireOnboarding = true) {
  const user = await getSession();
  if (!user) redirect(`/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
  if (requireOnboarding) {
    const [rows] = await getDb().execute<(RowDataPacket & { onboarding_completed: number | boolean })[]>(
      `SELECT onboarding_completed FROM learner_states WHERE user_id = ? LIMIT 1`,
      [user.id],
    );
    if (!rows[0]?.onboarding_completed) redirect(`/onboarding?returnTo=${encodeURIComponent(returnTo)}`);
  }
  return user;
}
