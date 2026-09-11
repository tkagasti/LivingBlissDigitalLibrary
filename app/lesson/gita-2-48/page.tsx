import LibraryApp from "../../components/LibraryApp";
import type { StudyLanguage } from "../../components/ShlokaStudyPanel";

export const metadata = { title: "Bhagavad Gita 2.48" };

export default async function GitaShloka248Page({
  searchParams,
}: {
  searchParams: Promise<{ language?: string }>;
}) {
  const { language } = await searchParams;
  const initialStudyLanguage: StudyLanguage | undefined = language === "English" || language === "Hindi" || language === "Odia" ? language : undefined;
  return <LibraryApp view="lesson" lessonReference="2.48" initialStudyLanguage={initialStudyLanguage} />;
}
