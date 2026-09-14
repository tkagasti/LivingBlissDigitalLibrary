"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type StudyLanguage = "en" | "hi" | "or";

type ChapterOption = {
  number: number;
  title: string;
  verseCount: number;
};

type VerseOption = {
  chapter: number;
  verse: number;
  reference: string;
};

const copy = {
  en: { aria: "Gita lesson navigation", current: "Current lesson", chapter: "Chapter", shloka: "Shloka", go: "Go", previous: "Previous", next: "Next" },
  hi: { aria: "गीता पाठ मार्गदर्शन", current: "वर्तमान पाठ", chapter: "अध्याय", shloka: "श्लोक", go: "जाएँ", previous: "पिछला", next: "अगला" },
  or: { aria: "ଗୀତା ପାଠ ମାର୍ଗଦର୍ଶନ", current: "ବର୍ତ୍ତମାନ ପାଠ", chapter: "ଅଧ୍ୟାୟ", shloka: "ଶ୍ଲୋକ", go: "ଯାଆନ୍ତୁ", previous: "ପୂର୍ବ", next: "ପରବର୍ତ୍ତୀ" },
} as const;

function localizeDigits(value: string | number, language: StudyLanguage) {
  const digits = language === "or" ? "୦୧୨୩୪୫୬୭୮୯" : language === "hi" ? "०१२३४५६७८९" : "0123456789";
  return String(value).replace(/[0-9]/gu, (digit) => digits[Number(digit)]);
}

function verseHref(verse: VerseOption, language: StudyLanguage) {
  return `/course/gita/chapter/${verse.chapter}/shloka/${verse.verse}?lang=${language}`;
}

export default function GitaLessonNavigator({
  chapters,
  currentChapter,
  currentVerse,
  language,
  previous,
  next,
  position,
}: {
  chapters: ChapterOption[];
  currentChapter: number;
  currentVerse: number;
  language: StudyLanguage;
  previous?: VerseOption;
  next?: VerseOption;
  position: "top" | "bottom";
}) {
  const router = useRouter();
  const labels = copy[language];
  const [chapter, setChapter] = useState(currentChapter);
  const [shloka, setShloka] = useState(currentVerse);
  const chapterRecord = useMemo(() => chapters.find((item) => item.number === chapter) ?? chapters[0], [chapter, chapters]);

  const chooseChapter = (value: number) => {
    setChapter(value);
    setShloka(1);
  };

  const goToLesson = (event: FormEvent) => {
    event.preventDefault();
    router.push(`/course/gita/chapter/${chapter}/shloka/${shloka}?lang=${language}`);
  };

  return (
    <nav className={`gita-lesson-navigator ${position}`} aria-label={labels.aria}>
      <div className="gita-navigator-current">
        <span>{labels.current}</span>
        <strong>{labels.chapter} {localizeDigits(currentChapter, language)} · {labels.shloka} {localizeDigits(currentVerse, language)}</strong>
      </div>

      <form onSubmit={goToLesson}>
        <label>
          <span>{labels.chapter}</span>
          <select value={chapter} onChange={(event) => chooseChapter(Number(event.target.value))}>
            {chapters.map((item) => (
              <option key={item.number} value={item.number}>{localizeDigits(item.number, language)} · {item.title}</option>
            ))}
          </select>
        </label>
        <label>
          <span>{labels.shloka}</span>
          <select value={shloka} onChange={(event) => setShloka(Number(event.target.value))}>
            {Array.from({ length: chapterRecord?.verseCount ?? 1 }, (_, index) => index + 1).map((number) => (
              <option key={number} value={number}>{labels.shloka} {localizeDigits(number, language)}</option>
            ))}
          </select>
        </label>
        <button type="submit">{labels.go} <span aria-hidden="true">→</span></button>
      </form>

      <div className="gita-navigator-adjacent">
        {previous ? <Link href={verseHref(previous, language)} aria-label={`${labels.previous} ${labels.shloka} ${localizeDigits(previous.reference, language)}`}>← <span>{labels.previous}</span></Link> : <span />}
        {next ? <Link href={verseHref(next, language)} aria-label={`${labels.next} ${labels.shloka} ${localizeDigits(next.reference, language)}`}><span>{labels.next}</span> →</Link> : <span />}
      </div>
    </nav>
  );
}
