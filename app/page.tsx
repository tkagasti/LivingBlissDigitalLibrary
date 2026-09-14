import LibraryApp from "./components/LibraryApp";
import type { StudyLanguage } from "./components/ShlokaStudyPanel";
import type { Metadata } from "next";
import { cookies } from "next/headers";

// Hostinger can retain prerendered HTML across deployments after its hashed
// Next.js assets have been replaced. Render the entry page per request so it
// always points at the assets from the active release.
export const dynamic = "force-dynamic";

type HomeProps = { searchParams: Promise<{ lang?: string }> };

function studyLanguage(value: string | undefined): StudyLanguage | null {
  if (value === "or") return "Odia";
  if (value === "hi") return "Hindi";
  if (value === "en") return "English";
  return null;
}

async function resolveHomeLanguage(searchParams: HomeProps["searchParams"]) {
  return studyLanguage((await searchParams).lang)
    ?? studyLanguage((await cookies()).get("living_bliss_gita_language")?.value)
    ?? "English";
}

export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const language = await resolveHomeLanguage(searchParams);
  if (language === "Odia") {
    return {
      title: { absolute: "ଶ୍ରୀମଦ୍ଭଗବଦ୍‌ଗୀତା ଅଧ୍ୟୟନ | ଲିଭିଙ୍ଗ ବ୍ଲିସ୍ ଡିଜିଟାଲ ଗ୍ରନ୍ଥାଗାର" },
      description: "ଅଧ୍ୟାୟ ୧ରୁ ୧୮ ପର୍ଯ୍ୟନ୍ତ ଶ୍ରୀମଦ୍ଭଗବଦ୍‌ଗୀତାର କ୍ରମିକ ଅଧ୍ୟୟନ।",
    };
  }
  return { title: language === "Hindi" ? "श्रीमद्भगवद्गीता अध्ययन" : "श्रीमद्भगवद्गीता · Shreemad Bhagavad Geeta" };
}

export default async function Home({ searchParams }: HomeProps) {
  const selectedLanguage = await resolveHomeLanguage(searchParams);
  return <LibraryApp view="home" initialStudyLanguage={selectedLanguage} />;
}
