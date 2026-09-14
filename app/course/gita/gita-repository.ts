import { cache } from "react";
import type { RowDataPacket } from "mysql2";
import { getDb } from "../../../db";

export type DatabaseGitaVerseSummary = {
  chapter: number;
  verse: number;
  reference: string;
  order: number;
};

export type DatabaseGitaChapter = {
  number: number;
  slug: string;
  title: string;
  focus: string;
  essentialQuestion: string;
  verseCount: number;
  verses: DatabaseGitaVerseSummary[];
};

export type DatabaseGitaVerse = DatabaseGitaVerseSummary & {
  id: string;
  devanagari: string;
  odia: string;
  transliteration: string;
  localizedContent: Record<StudyLanguageCode, DatabaseGitaLocalizedContent>;
  sourceUrl: string | null;
  sourceCitation: string | null;
  releaseVersion: string;
  chapterTitle: string;
  chapterFocus: string;
  chapterEssentialQuestion: string;
};

export type StudyLanguageCode = "en" | "hi" | "or";

export type DatabaseGitaLocalizedContent = {
  wordGlosses: Array<{ term: string; meaning: string }>;
  translation: {
    text: string;
    translator: string | null;
    sourceLocator: string | null;
  } | null;
};

type ChapterRow = RowDataPacket & {
  chapter_number: number;
  title: string;
  focus: string | null;
  essential_question: string | null;
  verse_count: number;
};

type VerseSummaryRow = RowDataPacket & {
  chapter_number: number;
  verse_number: string;
  canonical_reference: string;
};

type VerseRow = RowDataPacket & {
  id: string;
  chapter_number: number;
  chapter_title: string;
  chapter_focus: string | null;
  chapter_essential_question: string | null;
  verse_number: string;
  canonical_reference: string;
  devanagari: string;
  odia: string;
  transliteration: string;
  source_url: string | null;
  citation: string | null;
  version_label: string;
  edition_release_id: string;
};

type GlossRow = RowDataPacket & {
  term: string;
  language_code: StudyLanguageCode;
  meaning: string;
};

type TranslationRow = RowDataPacket & {
  language_code: StudyLanguageCode;
  text: string;
  translator: string | null;
  source_locator: string | null;
};

const loadGitaSequence = cache(async (): Promise<DatabaseGitaVerseSummary[]> => {
  const [rows] = await getDb().execute<VerseSummaryRow[]>(
    `SELECT
       c.chapter_number,
       v.verse_number,
       v.canonical_reference
     FROM scripture_verses v
     JOIN scripture_chapters c ON c.id = v.chapter_id
     WHERE c.work_id = 'work-bhagavad-gita'
       AND v.status = 'active'
     ORDER BY c.sort_order, v.sort_order`,
  );

  return rows.map((row, index) => ({
    chapter: Number(row.chapter_number),
    verse: Number(row.verse_number),
    reference: row.canonical_reference,
    order: index + 1,
  }));
});

export const getDatabaseGitaChapters = cache(async (languageCode: StudyLanguageCode = "en"): Promise<DatabaseGitaChapter[]> => {
  const [rows] = await getDb().execute<ChapterRow[]>(
    `SELECT
       c.chapter_number,
       COALESCE(l.title, english.title, c.canonical_title) AS title,
       COALESCE(l.focus, english.focus) AS focus,
       COALESCE(l.essential_question, english.essential_question) AS essential_question,
       c.verse_count
     FROM scripture_chapters c
     LEFT JOIN scripture_chapter_localizations l
       ON l.chapter_id = c.id AND l.language_code = ?
     LEFT JOIN scripture_chapter_localizations english
       ON english.chapter_id = c.id AND english.language_code = 'en'
     WHERE c.work_id = 'work-bhagavad-gita'
     ORDER BY c.sort_order`,
    [languageCode],
  );
  const sequence = await loadGitaSequence();

  return rows.map((row) => {
    const number = Number(row.chapter_number);
    return {
      number,
      slug: String(number),
      title: row.title,
      focus: row.focus ?? "",
      essentialQuestion: row.essential_question ?? "",
      verseCount: Number(row.verse_count),
      verses: sequence.filter((verse) => verse.chapter === number),
    };
  });
});

export const getDatabaseGitaChapter = cache(async (chapterNumber: number, languageCode: StudyLanguageCode = "en"): Promise<DatabaseGitaChapter | null> => {
  const chapters = await getDatabaseGitaChapters(languageCode);
  return chapters.find((chapter) => chapter.number === chapterNumber) ?? null;
});

export const getDatabaseGitaVerse = cache(async (chapterNumber: number, verseNumber: number, languageCode: StudyLanguageCode = "en"): Promise<DatabaseGitaVerse | null> => {
  const [rows] = await getDb().execute<VerseRow[]>(
    `SELECT
       v.id,
       c.chapter_number,
       COALESCE(cl.title, english_cl.title, c.canonical_title) AS chapter_title,
       COALESCE(cl.focus, english_cl.focus) AS chapter_focus,
       COALESCE(cl.essential_question, english_cl.essential_question) AS chapter_essential_question,
       v.verse_number,
       v.canonical_reference,
       deva.text AS devanagari,
       orya.text AS odia,
       latn.text AS transliteration,
       source.source_url,
       source.citation,
       edition_release.version_label,
       edition_release.id AS edition_release_id
     FROM publication_scripture_releases published
     JOIN scripture_edition_releases edition_release ON edition_release.id = published.edition_release_id
     JOIN scripture_verses v ON v.id = (
       SELECT candidate.id
       FROM scripture_verses candidate
       JOIN scripture_chapters candidate_chapter ON candidate_chapter.id = candidate.chapter_id
       WHERE candidate_chapter.work_id = published.work_id
         AND candidate_chapter.chapter_number = ?
         AND candidate.verse_number = ?
       LIMIT 1
     )
     JOIN scripture_chapters c ON c.id = v.chapter_id
     LEFT JOIN scripture_chapter_localizations cl
       ON cl.chapter_id = c.id AND cl.language_code = ?
     LEFT JOIN scripture_chapter_localizations english_cl
       ON english_cl.chapter_id = c.id AND english_cl.language_code = 'en'
     JOIN verse_texts deva
       ON deva.verse_id = v.id
       AND deva.edition_release_id = edition_release.id
       AND deva.language_code = 'sa'
       AND deva.script_code = 'Deva'
       AND deva.representation = 'canonical-script'
     JOIN verse_texts latn
       ON latn.verse_id = v.id
       AND latn.edition_release_id = edition_release.id
       AND latn.language_code = 'sa'
       AND latn.script_code = 'Latn'
       AND latn.representation = 'transliteration'
     JOIN verse_texts orya
       ON orya.verse_id = v.id
       AND orya.edition_release_id = edition_release.id
       AND orya.language_code = 'sa'
       AND orya.script_code = 'Orya'
       AND orya.representation = 'script-transliteration'
     LEFT JOIN source_documents source ON source.id = edition_release.source_document_id
     WHERE published.publication_profile_id = 'profile-lb-gita-general'
       AND published.work_id = 'work-bhagavad-gita'
       AND published.is_default = true
       AND edition_release.publication_status = 'published'
     LIMIT 1`,
    [chapterNumber, String(verseNumber), languageCode],
  );

  const row = rows[0];
  if (!row) return null;

  const [glossRows] = await getDb().execute<GlossRow[]>(
    `SELECT form.text AS term, meaning.language_code, meaning.meaning
     FROM verse_sandhi_analyses analysis
     JOIN verse_tokens token ON token.analysis_id = analysis.id
     JOIN verse_token_forms form
       ON form.token_id = token.id
       AND form.language_code = 'sa'
       AND form.script_code = 'Latn'
       AND form.form_type = 'source-form'
     JOIN verse_token_meanings meaning
       ON meaning.token_id = token.id
       AND meaning.sense_number = 1
       AND meaning.editorial_status IN ('published', 'approved', 'source-import')
     WHERE analysis.edition_release_id = ?
       AND analysis.verse_id = ?
       AND analysis.analysis_type = 'source-word-glosses'
     ORDER BY meaning.language_code, token.position`,
    [row.edition_release_id, row.id],
  );

  const [translationRows] = await getDb().execute<TranslationRow[]>(
    `SELECT
       translation.language_code,
       translation.text,
       translator.canonical_name AS translator,
       translation.source_locator
     FROM verse_translations translation
     LEFT JOIN persons translator ON translator.id = translation.translator_person_id
     WHERE translation.edition_release_id = ?
       AND translation.verse_id = ?
       AND translation.editorial_status IN ('published', 'approved')
       AND translation.language_code IN ('en', 'hi', 'or')
     ORDER BY translation.language_code, translation.translation_key`,
    [row.edition_release_id, row.id],
  );

  const sequence = await loadGitaSequence();
  const sequenceItem = sequence.find((item) => item.chapter === chapterNumber && item.verse === verseNumber);
  if (!sequenceItem) return null;

  const localizedContent = Object.fromEntries(
    (["en", "hi", "or"] as const).map((languageCode) => {
      const translation = translationRows.find((item) => item.language_code === languageCode);
      return [languageCode, {
        wordGlosses: glossRows
          .filter((gloss) => gloss.language_code === languageCode)
          .map((gloss) => ({ term: gloss.term, meaning: gloss.meaning })),
        translation: translation ? {
          text: translation.text,
          translator: translation.translator,
          sourceLocator: translation.source_locator,
        } : null,
      }];
    }),
  ) as Record<StudyLanguageCode, DatabaseGitaLocalizedContent>;

  return {
    ...sequenceItem,
    id: row.id,
    devanagari: row.devanagari,
    odia: row.odia,
    transliteration: row.transliteration,
    localizedContent,
    sourceUrl: row.source_url,
    sourceCitation: row.citation,
    releaseVersion: row.version_label,
    chapterTitle: row.chapter_title,
    chapterFocus: row.chapter_focus ?? "",
    chapterEssentialQuestion: row.chapter_essential_question ?? "",
  };
});

export const getDatabaseAdjacentGitaVerses = cache(async (order: number) => {
  const sequence = await loadGitaSequence();
  return {
    previous: sequence[order - 2],
    next: sequence[order],
  };
});

export function databaseGitaVerseHref(verse: Pick<DatabaseGitaVerseSummary, "chapter" | "verse">) {
  return `/course/gita/chapter/${verse.chapter}/shloka/${verse.verse}`;
}
