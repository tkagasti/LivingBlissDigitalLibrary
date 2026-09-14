import corpusJson from "./gita-verses.json";

export type GitaVerse = {
  chapter: number;
  verse: number;
  reference: string;
  order: number;
  devanagari: string;
  odia: string;
  lineBreaks: number[];
  transliteration: string;
  wordGlosses: Array<{ term: string; meaning: string }>;
};

export type GitaTextChapter = {
  number: number;
  title: string;
  focus: string;
  essentialQuestion: string;
  verseCount: number;
  verses: GitaVerse[];
};

export type GitaCorpus = {
  title: string;
  titleDevanagari: string;
  titleEnglish: string;
  chapterCount: number;
  verseCount: number;
  recensionNote: string;
  source: {
    repository: string;
    revision: string;
    url: string;
    license: string;
    sha256: string;
  };
  chapters: GitaTextChapter[];
};

export const gitaCorpus = corpusJson as GitaCorpus;
export const allGitaVerses = gitaCorpus.chapters.flatMap((chapter) => chapter.verses);

export function getGitaTextChapter(chapterNumber: number) {
  return gitaCorpus.chapters.find((chapter) => chapter.number === chapterNumber);
}

export function getGitaVerse(chapterNumber: number, verseNumber: number) {
  return getGitaTextChapter(chapterNumber)?.verses.find((verse) => verse.verse === verseNumber);
}

export function getAdjacentGitaVerses(order: number) {
  return {
    previous: allGitaVerses[order - 2],
    next: allGitaVerses[order],
  };
}

export function gitaVerseHref(verse: Pick<GitaVerse, "chapter" | "verse">) {
  return `/course/gita/chapter/${verse.chapter}/shloka/${verse.verse}`;
}
