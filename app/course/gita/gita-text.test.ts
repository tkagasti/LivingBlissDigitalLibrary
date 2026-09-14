import { describe, expect, it } from "vitest";
import {
  allGitaVerses,
  getAdjacentGitaVerses,
  getGitaTextChapter,
  getGitaVerse,
  gitaCorpus,
  gitaVerseHref,
} from "./gita-text";

describe("complete Gita Sanskrit corpus", () => {
  it("contains the complete 18-chapter, 701-shloka recension", () => {
    expect(gitaCorpus.chapterCount).toBe(18);
    expect(gitaCorpus.chapters).toHaveLength(18);
    expect(gitaCorpus.verseCount).toBe(701);
    expect(allGitaVerses).toHaveLength(701);
    expect(gitaCorpus.chapters.map((chapter) => chapter.verseCount)).toEqual([
      47, 72, 43, 42, 29, 47, 30, 28, 34, 42, 55, 20, 35, 27, 20, 24, 28, 78,
    ]);
  });

  it("keeps every chapter and shloka in canonical sequence", () => {
    for (const chapter of gitaCorpus.chapters) {
      expect(chapter.verses).toHaveLength(chapter.verseCount);
      chapter.verses.forEach((verse, index) => {
        expect(verse.chapter).toBe(chapter.number);
        expect(verse.verse).toBe(index + 1);
        expect(verse.reference).toBe(`${chapter.number}.${index + 1}`);
      });
    }
    allGitaVerses.forEach((verse, index) => expect(verse.order).toBe(index + 1));
  });

  it("contains Devanagari source text without embedded ASCII reference markers", () => {
    for (const verse of allGitaVerses) {
      expect(verse.devanagari).toMatch(/[\u0900-\u097F]/u);
      expect(verse.devanagari).not.toMatch(/[0-9]/u);
      expect(verse.devanagari).not.toMatch(/्ि[क-हक़-य़]/u);
      expect(verse.devanagari.endsWith("॥")).toBe(true);
      expect(verse.odia).toMatch(/[ଁ-୷]/u);
      expect(verse.odia).not.toMatch(/[ऀ-ॣ०-ॿ]/u);
      expect(verse.transliteration).toMatch(/[a-zāīūṛṝḷḹṃṁḥṅñṭḍṇśṣ]/iu);
      expect(verse.transliteration).not.toMatch(/[\u0900-\u097F]|[0-9]/u);
    }
    expect(allGitaVerses.filter((verse) => verse.wordGlosses.length > 0)).toHaveLength(700);
  });

  it("resolves the first, adjacent and final lesson routes", () => {
    const first = getGitaVerse(1, 1);
    const last = getGitaVerse(18, 78);
    expect(first?.devanagari).toContain("धर्मक्षेत्रे कुरुक्षेत्रे");
    expect(last?.devanagari).toContain("यत्र योगेश्वरः कृष्णो");
    expect(first && gitaVerseHref(first)).toBe("/course/gita/chapter/1/shloka/1");
    expect(last && gitaVerseHref(last)).toBe("/course/gita/chapter/18/shloka/78");
    expect(getAdjacentGitaVerses(47).next?.reference).toBe("2.1");
    expect(getGitaTextChapter(13)?.verseCount).toBe(35);
  });
});
