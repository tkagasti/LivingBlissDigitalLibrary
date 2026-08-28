import { redirect } from "next/navigation";
import Link from "next/link";
import AuthForm from "../components/AuthForm";
import { getSession } from "../auth/session";
import { safeReturnTo } from "../auth/validation";

export const metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.returnTo);
  if (await getSession()) redirect(returnTo);
  const value = (key: string) => typeof params[key] === "string" ? params[key] as string : undefined;
  return (
    <main className="auth-page">
      <Link className="auth-brand" href="/">Living Bliss <small>Digital Library</small></Link>
      <AuthForm
        returnTo={returnTo}
        initialChallenge={value("challenge")}
        initialEmail={value("email")}
        initialMode={value("mode")}
        initialError={value("error")}
      />
      <Link className="auth-back" href="/">← Continue browsing the public library</Link>
    </main>
  );
}
