import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import CanonicalGitaVersePanel from "../../../../../../components/CanonicalGitaVersePanel";
import GitaLessonNavigator from "../../../../../../components/GitaLessonNavigator";
import { livingBlissGitaContext } from "../../../../../../platform/context";
import {
  getDatabaseAdjacentGitaVerses,
  getDatabaseGitaChapter,
  getDatabaseGitaChapters,
  getDatabaseGitaCommentaries,
  getDatabaseGitaVerse,
  type StudyLanguageCode,
} from "../../../../gita-repository";

type VersePageProps = {
  params: Promise<{ chapter: string; verse: string }>;
  searchParams: Promise<{ lang?: string }>;
};

const pageCopy = {
  en: {
    skip: "Skip to shloka", programme: livingBlissGitaContext.programmeName, edition: livingBlissGitaContext.editionName,
    courseOverview: "Course overview", chapter: "Chapter", myLearning: "My learning", completeText: "Complete Sanskrit text",
    shlokas: "shlokas", sequential: "sequential study", shloka: "Shloka", of: "of", course: "Course",
    scripture: "Bhagavad Gita", lesson: "Lesson", databaseEdition: "database edition", scene: "Scene and context",
    previous: "Previous shloka", continue: "Continue in sequence", completeCourse: "Complete course text", returnCourse: "Return to all chapters",
    logoAlt: "Living Bliss — Awakening Inner Bliss",
  },
  hi: {
    skip: "श्लोक पर जाएँ", programme: "श्रीमद्भगवद्गीता अध्ययन", edition: "लिविंग ब्लिस सम्पूर्ण संस्करण",
    courseOverview: "पाठ्यक्रम परिचय", chapter: "अध्याय", myLearning: "मेरा अध्ययन", completeText: "सम्पूर्ण संस्कृत पाठ",
    shlokas: "श्लोक", sequential: "क्रमिक अध्ययन", shloka: "श्लोक", of: "में से", course: "पाठ्यक्रम",
    scripture: "श्रीमद्भगवद्गीता", lesson: "पाठ", databaseEdition: "स्थानीय डेटाबेस संस्करण", scene: "दृश्य और प्रसंग",
    previous: "पिछला श्लोक", continue: "क्रम में आगे", completeCourse: "सम्पूर्ण पाठ्यक्रम", returnCourse: "सभी अध्यायों पर लौटें",
    logoAlt: "लिविंग ब्लिस — आन्तरिक आनन्द का जागरण",
  },
  or: {
    skip: "ଶ୍ଲୋକକୁ ଯାଆନ୍ତୁ", programme: "ଶ୍ରୀମଦ୍ଭଗବଦ୍‌ଗୀତା ଅଧ୍ୟୟନ", edition: "ଲିଭିଙ୍ଗ ବ୍ଲିସ୍ ସମ୍ପୂର୍ଣ୍ଣ ସଂସ୍କରଣ",
    courseOverview: "ପାଠ୍ୟକ୍ରମ ପରିଚୟ", chapter: "ଅଧ୍ୟାୟ", myLearning: "ମୋର ଅଧ୍ୟୟନ", completeText: "ସମ୍ପୂର୍ଣ୍ଣ ସଂସ୍କୃତ ପାଠ",
    shlokas: "ଶ୍ଲୋକ", sequential: "କ୍ରମିକ ଅଧ୍ୟୟନ", shloka: "ଶ୍ଲୋକ", of: "ମଧ୍ୟରୁ", course: "ପାଠ୍ୟକ୍ରମ",
    scripture: "ଶ୍ରୀମଦ୍ଭଗବଦ୍‌ଗୀତା", lesson: "ପାଠ", databaseEdition: "ସ୍ଥାନୀୟ ଡାଟାବେସ୍ ସଂସ୍କରଣ", scene: "ଦୃଶ୍ୟ ଓ ପ୍ରସଙ୍ଗ",
    previous: "ପୂର୍ବ ଶ୍ଲୋକ", continue: "କ୍ରମରେ ଆଗକୁ", completeCourse: "ସମ୍ପୂର୍ଣ୍ଣ ପାଠ୍ୟକ୍ରମ", returnCourse: "ସମସ୍ତ ଅଧ୍ୟାୟକୁ ଫେରନ୍ତୁ",
    logoAlt: "ଲିଭିଙ୍ଗ ବ୍ଲିସ୍ — ଆନ୍ତରିକ ଆନନ୍ଦର ଜାଗରଣ",
  },
} as const;

function parseLanguage(value: string | undefined): StudyLanguageCode | null {
  return value === "en" || value === "hi" || value === "or" ? value : null;
}

async function resolveLanguage(searchParams: VersePageProps["searchParams"]) {
  const queryLanguage = parseLanguage((await searchParams).lang);
  if (queryLanguage) return queryLanguage;
  return parseLanguage((await cookies()).get("living_bliss_gita_language")?.value) ?? "en";
}

function localizeDigits(value: string | number, language: StudyLanguageCode) {
  const digits = language === "or" ? "୦୧୨୩୪୫୬୭୮୯" : language === "hi" ? "०१२३४५६७८९" : "0123456789";
  return String(value).replace(/[0-9]/gu, (digit) => digits[Number(digit)]);
}

function withLanguage(href: string, language: StudyLanguageCode) {
  return `${href}?lang=${language}`;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params, searchParams }: VersePageProps): Promise<Metadata> {
  const values = await params;
  const language = await resolveLanguage(searchParams);
  const verse = await getDatabaseGitaVerse(Number(values.chapter), Number(values.verse), language);
  if (!verse) return { title: "Bhagavad Gita shloka" };
  const labels = pageCopy[language];
  const localizedTitle = `${labels.shloka} ${localizeDigits(verse.reference, language)} · ${verse.chapterTitle}`;
  return {
    title: language === "or"
      ? { absolute: `${localizedTitle} | ଲିଭିଙ୍ଗ ବ୍ଲିସ୍ ଡିଜିଟାଲ ପାଠାଗାର` }
      : localizedTitle,
    description: language === "or"
      ? `ଶ୍ରୀମଦ୍ଭଗବଦ୍‌ଗୀତା ${localizeDigits(verse.reference, language)}କୁ ଓଡ଼ିଆ ଲିପିରେ କ୍ରମିକ ଭାବେ ଅଧ୍ୟୟନ କରନ୍ତୁ।`
      : `Study Shreemad Bhagavad Geeta ${verse.reference} in its complete chapter sequence.`,
  };
}

export default async function GitaVersePage({ params, searchParams }: VersePageProps) {
  const values = await params;
  const language = await resolveLanguage(searchParams);
  const labels = pageCopy[language];
  const chapterNumber = Number(values.chapter);
  const verseNumber = Number(values.verse);
  if (!Number.isInteger(chapterNumber) || !Number.isInteger(verseNumber)) notFound();

  const [chapter, chapters, verse, commentaries] = await Promise.all([
    getDatabaseGitaChapter(chapterNumber, language),
    getDatabaseGitaChapters(language),
    getDatabaseGitaVerse(chapterNumber, verseNumber, language),
    getDatabaseGitaCommentaries(chapterNumber, verseNumber, language),
  ]);
  if (!chapter || !verse) notFound();

  const adjacent = await getDatabaseAdjacentGitaVerses(verse.order);
  const totalVerses = chapters.reduce((total, item) => total + item.verseCount, 0);

  return (
    <div className={`course-workspace-root gita-verse-root language-${language}`} lang={language}>
      <a className="skip-link" href="#verse-content">{labels.skip}</a>
      <header className="course-workspace-header">
        <Link href={withLanguage("/", language)} aria-label={labels.logoAlt}>
          <Image src="/living-bliss-logo-2026.png" alt={labels.logoAlt} width={1881} height={836} priority />
          {language === "or" && <span className="gita-odia-brand"><strong>ଲିଭିଙ୍ଗ ବ୍ଲିସ୍</strong><small>ଆନ୍ତରିକ ଆନନ୍ଦର ଜାଗରଣ</small></span>}
        </Link>
        <div className="workspace-context">
          <span>{labels.programme}</span>
          <strong>{labels.edition}</strong>
        </div>
        <nav aria-label={language === "or" ? "ପାଠ୍ୟକ୍ରମ ସୁବିଧା" : language === "hi" ? "पाठ्यक्रम सुविधाएँ" : "Course utilities"}>
          <Link href={withLanguage("/course/gita", language)}>{labels.courseOverview}</Link>
          <Link href={withLanguage(`/course/gita/chapter/${chapterNumber}`, language)}>{labels.chapter} {localizeDigits(chapterNumber, language)}</Link>
          <Link className="workspace-account-link" href={withLanguage("/dashboard", language)}>{labels.myLearning}</Link>
        </nav>
      </header>

      <main className="course-workspace gita-verse-workspace">
        <article className="chapter-content gita-verse-content" id="verse-content">
          <div className="chapter-breadcrumbs">
            <Link href={withLanguage("/course/gita", language)}>{labels.course}</Link><span>/</span>
            <Link href={withLanguage(`/course/gita/chapter/${chapterNumber}`, language)}>{labels.chapter} {localizeDigits(chapterNumber, language)}</Link><span>/</span>
            <span>{labels.shloka} {localizeDigits(verse.verse, language)}</span>
          </div>

          <GitaLessonNavigator
            key={`${verse.reference}-top`}
            chapters={chapters.map((item) => ({ number: item.number, title: item.title, verseCount: item.verseCount }))}
            currentChapter={chapterNumber}
            currentVerse={verseNumber}
            language={language}
            previous={adjacent.previous}
            next={adjacent.next}
            position="top"
          />

          <header className="gita-verse-heading">
            <div className="gita-verse-identity">
              <span className="eyebrow">{labels.scripture}</span>
              <div className="gita-verse-title-line">
                <h1>{labels.chapter} {localizeDigits(chapterNumber, language)} · {chapter.title}</h1>
                <strong>{labels.shloka} {localizeDigits(verse.reference, language)}</strong>
              </div>
              <small>{labels.lesson} {localizeDigits(verse.order, language)} {labels.of} {localizeDigits(totalVerses, language)} · {labels.databaseEdition}{language === "en" ? ` ${verse.releaseVersion}` : ""}</small>
            </div>
            <div className="gita-verse-context">
              <span className="eyebrow">{labels.scene}</span>
              <p>{verse.chapterFocus} {verse.chapterEssentialQuestion}</p>
            </div>
          </header>

          <CanonicalGitaVersePanel
            reference={verse.reference}
            devanagari={verse.devanagari}
            odia={verse.odia}
            transliteration={verse.transliteration}
            localizedContent={verse.localizedContent}
            commentaries={commentaries}
            language={language}
            order={verse.order}
            totalVerses={totalVerses}
            sourceUrl={verse.sourceUrl}
          />

          <GitaLessonNavigator
            key={`${verse.reference}-bottom`}
            chapters={chapters.map((item) => ({ number: item.number, title: item.title, verseCount: item.verseCount }))}
            currentChapter={chapterNumber}
            currentVerse={verseNumber}
            language={language}
            previous={adjacent.previous}
            next={adjacent.next}
            position="bottom"
          />
        </article>
      </main>
    </div>
  );
}
