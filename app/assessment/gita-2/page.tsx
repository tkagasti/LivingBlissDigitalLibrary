import LibraryApp from "../../components/LibraryApp";
import { requirePageUser } from "../../auth/guards";

export const metadata = { title: "Chapter 2 Assessment" };

export default async function GitaAssessmentPage() {
  await requirePageUser("/assessment/gita-2");
  return <LibraryApp view="assessment" />;
}
