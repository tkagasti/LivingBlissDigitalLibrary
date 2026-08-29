import { redirect } from "next/navigation";
import { getSession } from "../../auth/session";

export const dynamic = "force-dynamic";

export default async function StartGitaPathwayPage() {
  const user = await getSession();
  redirect(user ? "/dashboard" : "/gita/essential-shlokas");
}
