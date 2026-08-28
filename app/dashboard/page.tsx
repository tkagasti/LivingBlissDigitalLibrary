import LibraryApp from "../components/LibraryApp";
import { requirePageUser } from "../auth/guards";

export const metadata = { title: "My Learning" };

export default async function DashboardPage() {
  await requirePageUser("/dashboard");
  return <LibraryApp view="dashboard" />;
}
