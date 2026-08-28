import OnboardingForm from "../components/OnboardingForm";
import Link from "next/link";
import { requirePageUser } from "../auth/guards";
import { safeReturnTo } from "../auth/validation";

export const metadata = { title: "Learning preferences" };

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.returnTo);
  const user = await requirePageUser(returnTo, false);
  return <main className="auth-page"><Link className="auth-brand" href="/">Living Bliss <small>Digital Library</small></Link><OnboardingForm name={user.name} returnTo={returnTo} /></main>;
}
