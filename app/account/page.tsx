import AccountPanel from "../components/AccountPanel";
import { requirePageUser } from "../auth/guards";
import { sessionCount } from "../auth/session";

export const metadata = { title: "Account and security" };

export default async function AccountPage() {
  const user = await requirePageUser("/account", false);
  return <AccountPanel email={user.email} name={user.name} activeSessions={await sessionCount(user.id)} />;
}
