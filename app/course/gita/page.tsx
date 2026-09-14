import LibraryApp from "../../components/LibraryApp";
import type { StudyLanguage } from "../../components/ShlokaStudyPanel";
import type { Metadata } from "next";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

type CourseProps = { searchParams: Promise<{ lang?: string }> };

function studyLanguage(value: string | undefined): StudyLanguage | null {
  if (value === "or") return "Odia";
  if (value === "hi") return "Hindi";
  if (value === "en") return "English";
  return null;
}

async function resolveCourseLanguage(searchParams: CourseProps["searchParams"]) {
  return studyLanguage((await searchParams).lang)
    ?? studyLanguage((await cookies()).get("living_bliss_gita_language")?.value)
    ?? "English";
}

export async function generateMetadata({ searchParams }: CourseProps): Promise<Metadata> {
  const language = await resolveCourseLanguage(searchParams);
  if (language === "Odia") {
    return {
      title: { absolute: "ଶ୍ରୀମଦ୍ଭଗବଦ୍‌ଗୀତା ଅଧ୍ୟୟନ | ଲିଭିଙ୍ଗ ବ୍ଲିସ୍ ଡିଜିଟାଲ ଗ୍ରନ୍ଥାଗାର" },
      description: "ଅଧ୍ୟାୟ ୧ରୁ ୧୮ ପର୍ଯ୍ୟନ୍ତ ଶ୍ରୀମଦ୍ଭଗବଦ୍‌ଗୀତାର କ୍ରମିକ ଅଧ୍ୟୟନ।",
    };
  }
  return {
    title: language === "Hindi" ? "श्रीमद्भगवद्गीता अध्ययन" : "श्रीमद्भगवद्गीता · Shreemad Bhagavad Geeta",
    description: language === "Hindi"
      ? "अध्याय १ से १८ तक श्रीमद्भगवद्गीता का क्रमिक अध्ययन।"
      : "Study all 18 chapters of Shreemad Bhagavad Geeta in sequence.",
  };
}

export default async function GitaCoursePage({ searchParams }: CourseProps) {
  const selectedLanguage = await resolveCourseLanguage(searchParams);
  return <LibraryApp view="course" initialStudyLanguage={selectedLanguage} />;
}
