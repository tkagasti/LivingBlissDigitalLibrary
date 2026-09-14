import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [sourcePath, sourceRevision = "unknown"] = process.argv.slice(2);

if (!sourcePath) {
  throw new Error("Usage: node scripts/build-gita-corpus.mjs <verse.json> [source-revision]");
}

const chapterBlueprint = [
  ["Arjuna Viṣāda Yoga", "Recognising moral conflict and the need for guidance.", "How can a sincere person respond when duty, relationship and consequence appear to conflict?"],
  ["Sāṅkhya Yoga", "Self, steadiness, right action and foundational teachings.", "What changes when action is guided by clear understanding rather than fear of results?"],
  ["Karma Yoga", "Duty, contribution and action without possessive attachment.", "How can daily work become disciplined service rather than a source of bondage?"],
  ["Jñāna Karma Sannyāsa Yoga", "Knowledge, tradition, divine descent and wise action.", "How are knowledge, tradition and action brought together?"],
  ["Karma Sannyāsa Yoga", "Renunciation in action and inner freedom.", "What does it mean to renounce possessiveness while continuing to act?"],
  ["Dhyāna Yoga", "Discipline of mind, meditation and balance.", "How can attention and daily discipline support a balanced inner life?"],
  ["Jñāna Vijñāna Yoga", "Knowing the Divine in principle and experience.", "How are conceptual knowledge and realised understanding distinguished?"],
  ["Akṣara Brahma Yoga", "The imperishable, remembrance and life’s final orientation.", "How does sustained remembrance shape the direction of a life?"],
  ["Rāja Vidyā Rāja Guhya Yoga", "Sovereign knowledge, devotion and divine immanence.", "Why is this teaching described as both sovereign knowledge and a profound secret?"],
  ["Vibhūti Yoga", "Recognising divine excellences in the world.", "How can the world become a field for remembering divine excellence?"],
  ["Viśvarūpa Darśana Yoga", "Encountering the universal form and limits of ordinary perception.", "What does the universal vision reveal about the limits of ordinary perception?"],
  ["Bhakti Yoga", "Qualities and practices of devotion.", "Which qualities make devotion steady, practical and transformative?"],
  ["Kṣetra Kṣetrajña Vibhāga Yoga", "Field, knower, nature and consciousness.", "How does distinguishing the field from its knower change self-understanding?"],
  ["Guṇatraya Vibhāga Yoga", "Understanding the three guṇas and moving beyond them.", "How do the three guṇas influence thought and action, and what lies beyond them?"],
  ["Puruṣottama Yoga", "The cosmic tree, the individual self and the Supreme Person.", "What does the image of the cosmic tree invite the learner to examine?"],
  ["Daivāsura Sampad Vibhāga Yoga", "Constructive and destructive dispositions.", "Which dispositions support growth, and which repeatedly obstruct it?"],
  ["Śraddhātraya Vibhāga Yoga", "Faith, motivation and the qualities shaping practice.", "How do motivation and character shape the quality of a practice?"],
  ["Mokṣa Sannyāsa Yoga", "Integration, surrender, freedom and the final counsel.", "How do the Gita’s teachings come together in its final counsel?"],
];

const odiaChapterBlueprint = [
  ["ଅର୍ଜୁନ ବିଷାଦ ଯୋଗ", "ନୈତିକ ଦ୍ୱନ୍ଦ୍ୱକୁ ଚିହ୍ନିବା ଏବଂ ମାର୍ଗଦର୍ଶନର ଆବଶ୍ୟକତା।", "କର୍ତ୍ତବ୍ୟ, ସମ୍ପର୍କ ଓ ପରିଣାମ ପରସ୍ପର ବିରୋଧୀ ଲାଗିଲେ ଜଣେ ସଚ୍ଚୋଟ ବ୍ୟକ୍ତି କିପରି ପ୍ରତିକ୍ରିୟା କରିପାରିବେ?"],
  ["ସାଂଖ୍ୟ ଯୋଗ", "ଆତ୍ମା, ସ୍ଥିରତା, ସଠିକ୍ କର୍ମ ଏବଂ ମୌଳିକ ଶିକ୍ଷା।", "ଫଳର ଭୟ ପରିବର୍ତ୍ତେ ସ୍ପଷ୍ଟ ବୁଝାମଣା କର୍ମକୁ ପରିଚାଳିତ କଲେ କ’ଣ ବଦଳେ?"],
  ["କର୍ମ ଯୋଗ", "କର୍ତ୍ତବ୍ୟ, ଅବଦାନ ଏବଂ ଅଧିକାରବୋଧହୀନ କର୍ମ।", "ଦୈନନ୍ଦିନ କାର୍ଯ୍ୟ କିପରି ବନ୍ଧନର କାରଣ ନହୋଇ ଶୃଙ୍ଖଳିତ ସେବା ହୋଇପାରେ?"],
  ["ଜ୍ଞାନ କର୍ମ ସନ୍ନ୍ୟାସ ଯୋଗ", "ଜ୍ଞାନ, ପରମ୍ପରା, ଦିବ୍ୟ ଅବତରଣ ଏବଂ ବିବେକପୂର୍ଣ୍ଣ କର୍ମ।", "ଜ୍ଞାନ, ପରମ୍ପରା ଓ କର୍ମକୁ କିପରି ଏକତ୍ର କରାଯାଏ?"],
  ["କର୍ମ ସନ୍ନ୍ୟାସ ଯୋଗ", "କର୍ମ ମଧ୍ୟରେ ସନ୍ନ୍ୟାସ ଏବଂ ଆନ୍ତରିକ ସ୍ୱାଧୀନତା।", "କର୍ମ କରିଚାଲିବା ସହିତ ଅଧିକାରବୋଧ ତ୍ୟାଗ କରିବାର ଅର୍ଥ କ’ଣ?"],
  ["ଧ୍ୟାନ ଯୋଗ", "ମନର ଶୃଙ୍ଖଳା, ଧ୍ୟାନ ଏବଂ ସମତୁଳନ।", "ମନୋଯୋଗ ଓ ଦୈନନ୍ଦିନ ଶୃଙ୍ଖଳା କିପରି ସମତୁଳିତ ଆନ୍ତରିକ ଜୀବନକୁ ସହାୟତା କରେ?"],
  ["ଜ୍ଞାନ ବିଜ୍ଞାନ ଯୋଗ", "ତତ୍ତ୍ୱ ଓ ଅନୁଭବରେ ପରମାତ୍ମାଙ୍କୁ ଜାଣିବା।", "ଧାରଣାଗତ ଜ୍ଞାନ ଏବଂ ଅନୁଭୂତ ଜ୍ଞାନ ମଧ୍ୟରେ ପାର୍ଥକ୍ୟ କିପରି ବୁଝାଯାଏ?"],
  ["ଅକ୍ଷର ବ୍ରହ୍ମ ଯୋଗ", "ଅବିନାଶୀ ତତ୍ତ୍ୱ, ସ୍ମରଣ ଏବଂ ଜୀବନର ଅନ୍ତିମ ଦିଗ।", "ନିରନ୍ତର ସ୍ମରଣ ଜୀବନର ଦିଗକୁ କିପରି ଗଢ଼େ?"],
  ["ରାଜବିଦ୍ୟା ରାଜଗୁହ୍ୟ ଯୋଗ", "ସର୍ବୋଚ୍ଚ ଜ୍ଞାନ, ଭକ୍ତି ଏବଂ ସର୍ବତ୍ର ଦିବ୍ୟ ଉପସ୍ଥିତି।", "ଏହି ଶିକ୍ଷାକୁ ସର୍ବୋଚ୍ଚ ଜ୍ଞାନ ଓ ଗଭୀର ରହସ୍ୟ ଉଭୟ କାହିଁକି କୁହାଯାଏ?"],
  ["ବିଭୂତି ଯୋଗ", "ଜଗତରେ ଦିବ୍ୟ ଐଶ୍ୱର୍ଯ୍ୟକୁ ଚିହ୍ନିବା।", "ଜଗତ କିପରି ଦିବ୍ୟ ମହିମାକୁ ସ୍ମରଣ କରିବାର କ୍ଷେତ୍ର ହୋଇପାରେ?"],
  ["ବିଶ୍ୱରୂପ ଦର୍ଶନ ଯୋଗ", "ବିଶ୍ୱରୂପର ସାକ୍ଷାତ୍କାର ଏବଂ ସାଧାରଣ ଦୃଷ୍ଟିର ସୀମା।", "ବିଶ୍ୱରୂପ ଦର୍ଶନ ସାଧାରଣ ଦୃଷ୍ଟିର ସୀମା ବିଷୟରେ କ’ଣ ପ୍ରକାଶ କରେ?"],
  ["ଭକ୍ତି ଯୋଗ", "ଭକ୍ତିର ଗୁଣ ଓ ଅଭ୍ୟାସ।", "କେଉଁ ଗୁଣଗୁଡ଼ିକ ଭକ୍ତିକୁ ସ୍ଥିର, ବ୍ୟବହାରିକ ଏବଂ ରୂପାନ୍ତରକାରୀ କରେ?"],
  ["କ୍ଷେତ୍ର କ୍ଷେତ୍ରଜ୍ଞ ବିଭାଗ ଯୋଗ", "କ୍ଷେତ୍ର, କ୍ଷେତ୍ରଜ୍ଞ, ପ୍ରକୃତି ଏବଂ ଚେତନା।", "କ୍ଷେତ୍ର ଓ କ୍ଷେତ୍ରଜ୍ଞଙ୍କୁ ପୃଥକ କରି ବୁଝିବା ଆତ୍ମବୋଧକୁ କିପରି ବଦଳାଏ?"],
  ["ଗୁଣତ୍ରୟ ବିଭାଗ ଯୋଗ", "ତିନି ଗୁଣକୁ ବୁଝିବା ଏବଂ ସେଗୁଡ଼ିକୁ ଅତିକ୍ରମ କରିବା।", "ତିନି ଗୁଣ ଚିନ୍ତା ଓ କର୍ମକୁ କିପରି ପ୍ରଭାବିତ କରେ, ଏବଂ ସେମାନଙ୍କ ପରେ କ’ଣ ଅଛି?"],
  ["ପୁରୁଷୋତ୍ତମ ଯୋଗ", "ବିଶ୍ୱବୃକ୍ଷ, ଜୀବାତ୍ମା ଏବଂ ପରମ ପୁରୁଷ।", "ବିଶ୍ୱବୃକ୍ଷର ଚିତ୍ର ଶିକ୍ଷାର୍ଥୀଙ୍କୁ କ’ଣ ପରୀକ୍ଷା କରିବାକୁ ଆମନ୍ତ୍ରଣ କରେ?"],
  ["ଦୈବାସୁର ସମ୍ପଦ ବିଭାଗ ଯୋଗ", "ଗଠନମୂଳକ ଏବଂ ବିନାଶକାରୀ ପ୍ରବୃତ୍ତି।", "କେଉଁ ପ୍ରବୃତ୍ତିଗୁଡ଼ିକ ବିକାଶକୁ ସହାୟତା କରେ ଏବଂ କେଉଁଗୁଡ଼ିକ ପୁନଃପୁନି ବାଧା ଦେଇଥାଏ?"],
  ["ଶ୍ରଦ୍ଧାତ୍ରୟ ବିଭାଗ ଯୋଗ", "ଶ୍ରଦ୍ଧା, ପ୍ରେରଣା ଏବଂ ଅଭ୍ୟାସକୁ ଗଢ଼ୁଥିବା ଗୁଣ।", "ପ୍ରେରଣା ଓ ଚରିତ୍ର ଅଭ୍ୟାସର ଗୁଣବତ୍ତାକୁ କିପରି ଗଢ଼େ?"],
  ["ମୋକ୍ଷ ସନ୍ନ୍ୟାସ ଯୋଗ", "ସମନ୍ୱୟ, ସମର୍ପଣ, ମୁକ୍ତି ଏବଂ ଅନ୍ତିମ ଉପଦେଶ।", "ଗୀତାର ଶିକ୍ଷାଗୁଡ଼ିକ ଏହାର ଅନ୍ତିମ ଉପଦେଶରେ କିପରି ଏକତ୍ର ହୁଏ?"],
];

const rawJson = await readFile(sourcePath, "utf8");
const rawVerses = JSON.parse(rawJson);

if (!Array.isArray(rawVerses) || rawVerses.length !== 701) {
  throw new Error(`Expected the 701-verse open edition; received ${rawVerses.length ?? "an invalid document"}.`);
}

const devanagariToOdiaMap = new Map([
  ["ँ", "ଁ"], ["ं", "ଂ"], ["ः", "ଃ"], ["अ", "ଅ"], ["आ", "ଆ"], ["इ", "ଇ"], ["ई", "ଈ"], ["उ", "ଉ"], ["ऊ", "ଊ"],
  ["ऋ", "ଋ"], ["ॠ", "ୠ"], ["ऌ", "ଌ"], ["ॡ", "ୡ"], ["ए", "ଏ"], ["ऐ", "ଐ"], ["ओ", "ଓ"], ["औ", "ଔ"],
  ["क", "କ"], ["ख", "ଖ"], ["ग", "ଗ"], ["घ", "ଘ"], ["ङ", "ଙ"], ["च", "ଚ"], ["छ", "ଛ"], ["ज", "ଜ"], ["झ", "ଝ"], ["ञ", "ଞ"],
  ["ट", "ଟ"], ["ठ", "ଠ"], ["ड", "ଡ"], ["ढ", "ଢ"], ["ण", "ଣ"], ["त", "ତ"], ["थ", "ଥ"], ["द", "ଦ"], ["ध", "ଧ"], ["न", "ନ"],
  ["प", "ପ"], ["फ", "ଫ"], ["ब", "ବ"], ["भ", "ଭ"], ["म", "ମ"], ["य", "ଯ"], ["र", "ର"], ["ल", "ଲ"], ["व", "ଵ"],
  ["श", "ଶ"], ["ष", "ଷ"], ["स", "ସ"], ["ह", "ହ"], ["ळ", "ଳ"], ["ऽ", "ଽ"], ["़", "଼"],
  ["ा", "ା"], ["ि", "ି"], ["ी", "ୀ"], ["ु", "ୁ"], ["ू", "ୂ"], ["ृ", "ୃ"], ["ॄ", "ୄ"], ["ॢ", "ୢ"], ["ॣ", "ୣ"],
  ["े", "େ"], ["ै", "ୈ"], ["ो", "ୋ"], ["ौ", "ୌ"], ["्", "୍"], ["ॐ", "ଓଁ"],
  ["०", "୦"], ["१", "୧"], ["२", "୨"], ["३", "୩"], ["४", "୪"], ["५", "୫"], ["६", "୬"], ["७", "୭"], ["८", "୮"], ["९", "୯"],
]);

function devanagariToOdia(value) {
  return Array.from(value.normalize("NFC"), (character) => devanagariToOdiaMap.get(character) ?? character).join("");
}

function toOdiaDigits(value) {
  return String(value).replace(/[0-9]/gu, (digit) => "୦୧୨୩୪୫୬୭୮୯"[Number(digit)]);
}

function normaliseVerse(item) {
  const chapter = Number(item.chapter_number);
  const verse = Number(item.verse_number);
  const reference = `${chapter}.${verse}`;
  const suffix = new RegExp(`\\s*।{1,2}${chapter}\\.${verse}।{1,2}\\s*$`, "u");
  const sourceText = String(item.text)
    .normalize("NFC")
    .replace(/[\uFEFF\u200B-\u200D]/gu, "")
    // Repair a recurrent legacy-encoding error in the open dataset where the
    // short-i sign precedes the consonant it belongs to (for example कश्िचत्).
    .replace(/्ि([क-हक़-य़])/gu, "्$1ि")
    .trim();

  if (!suffix.test(sourceText)) {
    throw new Error(`The source reference marker is missing or malformed for ${reference}.`);
  }

  const lines = sourceText
    .replace(suffix, "")
    .replace(/^(.{1,40}?उवाच)(?=\S)/u, "$1\n")
    .split(/\r?\n/u)
    .flatMap((line) => line.trim().split(/(?<=।)(?=\S)/u))
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) throw new Error(`Verse ${reference} does not contain enough Sanskrit text.`);
  lines[lines.length - 1] = `${lines[lines.length - 1].replace(/।+$/u, "")}॥`;

  const rawWordMeanings = String(item.word_meanings ?? "").normalize("NFC");
  const transliterationLines = String(item.transliteration ?? "")
    .normalize("NFC")
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line && !/[\u0900-\u097F]/u.test(line));
  const transliteration = (transliterationLines.length
    ? transliterationLines
    : rawWordMeanings.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean)
  ).join("\n");

  const wordGlosses = rawWordMeanings
    .replace(/\r?\n/gu, " ")
    .split(/;\s*/u)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const dashIndex = Math.max(entry.indexOf("—"), entry.indexOf("–"));
      const fallbackIndex = dashIndex < 0 && /^\S+-[^-]+$/u.test(entry) ? entry.indexOf("-") : -1;
      const separatorIndex = dashIndex >= 0 ? dashIndex : fallbackIndex;
      if (separatorIndex < 1) return null;
      const term = entry.slice(0, separatorIndex).trim();
      const meaning = entry.slice(separatorIndex + 1).trim();
      return term && meaning ? { term, meaning } : null;
    })
    .filter(Boolean);

  const devanagari = lines.join("\n");
  return {
    chapter,
    verse,
    reference,
    order: Number(item.verse_order),
    devanagari,
    odia: devanagariToOdia(devanagari),
    lineBreaks: lines.slice(0, -1).map((_, index) => index + 1),
    transliteration,
    wordGlosses,
  };
}

const verses = rawVerses.map(normaliseVerse);

for (let index = 0; index < verses.length; index += 1) {
  const current = verses[index];
  const previous = verses[index - 1];
  if (current.order !== index + 1) throw new Error(`Unexpected source order at ${current.reference}.`);
  if (previous && current.chapter === previous.chapter && current.verse !== previous.verse + 1) {
    throw new Error(`Non-sequential verse numbering between ${previous.reference} and ${current.reference}.`);
  }
}

const chapters = chapterBlueprint.map(([title, focus, essentialQuestion], index) => {
  const number = index + 1;
  const chapterVerses = verses.filter((verse) => verse.chapter === number);
  if (!chapterVerses.length) throw new Error(`Chapter ${number} is empty.`);
  return { number, title, focus, essentialQuestion, verseCount: chapterVerses.length, verses: chapterVerses };
});

const sourceChecksum = createHash("sha256").update(rawJson).digest("hex");
const sourceUrl = `https://github.com/gita/gita/tree/${sourceRevision}`;
const corpus = {
  title: "Śrīmad Bhagavad Gītā",
  titleDevanagari: "श्रीमद्भगवद्गीता",
  titleEnglish: "Shreemad Bhagavad Geeta",
  chapterCount: chapters.length,
  verseCount: verses.length,
  recensionNote: "This open edition includes the prefatory Arjuna verse as Chapter 13.1, producing 701 numbered shlokas.",
  source: {
    repository: "gita/gita",
    revision: sourceRevision,
    url: sourceUrl,
    license: "The Unlicense (public domain dedication)",
    sha256: sourceChecksum,
  },
  chapters,
};

function sqlString(value) {
  return `'${String(value).replaceAll("\\", "\\\\").replaceAll("'", "''")}'`;
}

function valuesStatement(table, columns, rows, updateColumns) {
  const values = rows.map((row) => `  (${row.join(", ")})`).join(",\n");
  const updates = updateColumns.map((column) => `\`${column}\` = VALUES(\`${column}\`)`).join(", ");
  return `INSERT INTO \`${table}\` (${columns.map((column) => `\`${column}\``).join(", ")}) VALUES\n${values}\nON DUPLICATE KEY UPDATE ${updates};`;
}

function inBatches(items, batchSize, render) {
  const statements = [];
  for (let index = 0; index < items.length; index += batchSize) {
    statements.push(render(items.slice(index, index + batchSize)));
  }
  return statements.join("\n\n");
}

const chapterRows = chapters.map((chapter) => [
  sqlString(`chapter-gita-${String(chapter.number).padStart(2, "0")}`),
  sqlString("work-bhagavad-gita"),
  chapter.number,
  sqlString(chapter.title),
  chapter.verseCount,
  chapter.number,
]);

const chapterNameRows = chapters.flatMap((chapter) => {
  const [odiaTitle, odiaFocus, odiaEssentialQuestion] = odiaChapterBlueprint[chapter.number - 1];
  const chapterId = sqlString(`chapter-gita-${String(chapter.number).padStart(2, "0")}`);
  return [
    [chapterId, sqlString("en"), sqlString(chapter.title), sqlString(chapter.focus), sqlString(chapter.essentialQuestion)],
    [chapterId, sqlString("or"), sqlString(odiaTitle), sqlString(odiaFocus), sqlString(odiaEssentialQuestion)],
  ];
});

const verseRows = verses.map((verse) => [
  sqlString(`verse-gita-${String(verse.chapter).padStart(2, "0")}-${String(verse.verse).padStart(3, "0")}`),
  sqlString(`chapter-gita-${String(verse.chapter).padStart(2, "0")}`),
  sqlString(verse.verse),
  sqlString(verse.reference),
  verse.verse,
  sqlString("active"),
]);

const releaseId = `release-lb-gita-open-${sourceRevision.slice(0, 12)}`;
const sourceVersion = sourceRevision.slice(0, 12);

function verseStem(verse) {
  return `${String(verse.chapter).padStart(2, "0")}-${String(verse.verse).padStart(3, "0")}`;
}

function verseId(verse) {
  return `verse-gita-${verseStem(verse)}`;
}

function analysisId(verse) {
  return `gloss-gita-${verseStem(verse)}-v1`;
}

function tokenId(verse, index) {
  return `gt-g${verseStem(verse)}-${String(index + 1).padStart(2, "0")}`;
}

const textRows = verses.flatMap((verse) => {
  const transliterationLineBreaks = verse.transliteration
    .split("\n")
    .slice(0, -1)
    .map((_, index) => index + 1);
  return [
    [
      sqlString(`text-gita-${verseStem(verse)}-deva`),
      sqlString(releaseId),
      sqlString(verseId(verse)),
      sqlString("sa"),
      sqlString("Deva"),
      sqlString("canonical-script"),
      sqlString(verse.devanagari),
      verse.lineBreaks.length ? `JSON_ARRAY(${verse.lineBreaks.join(", ")})` : "JSON_ARRAY()",
      "NULL",
      "NULL",
      sqlString(`Bhagavad Gita ${verse.reference}`),
      sqlString("published"),
    ],
    [
      sqlString(`text-gita-${verseStem(verse)}-latn`),
      sqlString(releaseId),
      sqlString(verseId(verse)),
      sqlString("sa"),
      sqlString("Latn"),
      sqlString("transliteration"),
      sqlString(verse.transliteration),
      transliterationLineBreaks.length ? `JSON_ARRAY(${transliterationLineBreaks.join(", ")})` : "JSON_ARRAY()",
      "NULL",
      "NULL",
      sqlString(`Bhagavad Gita ${verse.reference}; source transliteration`),
      sqlString("source-import"),
    ],
    [
      sqlString(`text-gita-${verseStem(verse)}-orya`),
      sqlString(releaseId),
      sqlString(verseId(verse)),
      sqlString("sa"),
      sqlString("Orya"),
      sqlString("script-transliteration"),
      sqlString(verse.odia),
      verse.lineBreaks.length ? `JSON_ARRAY(${verse.lineBreaks.join(", ")})` : "JSON_ARRAY()",
      "NULL",
      "NULL",
      sqlString(`Bhagavad Gita ${verse.reference}; Sanskrit rendered in Odia script`),
      sqlString("generated-review"),
    ],
  ];
});

const analysisRows = verses.map((verse) => [
  sqlString(analysisId(verse)),
  sqlString(releaseId),
  sqlString(verseId(verse)),
  sqlString("source-word-glosses"),
  sqlString(sourceVersion),
  sqlString("source-import"),
  sqlString(`Bhagavad Gita ${verse.reference}; source word meanings`),
]);

const tokenRows = verses.flatMap((verse) => verse.wordGlosses.map((word, index) => [
  sqlString(tokenId(verse, index)),
  sqlString(analysisId(verse)),
  index + 1,
  "NULL",
  `JSON_OBJECT('sourceForm', ${sqlString(word.term)})`,
]));

const tokenFormRows = verses.flatMap((verse) => verse.wordGlosses.map((word, index) => [
  sqlString(`gf-g${verseStem(verse)}-${String(index + 1).padStart(2, "0")}`),
  sqlString(tokenId(verse, index)),
  sqlString("sa"),
  sqlString("Latn"),
  sqlString("source-form"),
  sqlString(word.term),
]));

const tokenMeaningRows = verses.flatMap((verse) => verse.wordGlosses.map((word, index) => [
  sqlString(`gm-g${verseStem(verse)}-${String(index + 1).padStart(2, "0")}`),
  sqlString(tokenId(verse, index)),
  sqlString("en"),
  1,
  sqlString(word.meaning),
  "NULL",
  sqlString("source-import"),
]));

const courseId = "course-gita-foundations";
const courseReleaseId = "course-release-gita-complete-v1";
const moduleRows = chapters.map((chapter) => [
  sqlString(`module-gita-complete-${String(chapter.number).padStart(2, "0")}`),
  sqlString(courseReleaseId),
  sqlString(`chapter-gita-${String(chapter.number).padStart(2, "0")}`),
  sqlString(`chapter-${chapter.number}`),
  sqlString("scripture-chapter"),
  chapter.number,
  "true",
  sqlString("active"),
]);

const moduleLocalizationRows = chapters.flatMap((chapter) => {
  const moduleId = sqlString(`module-gita-complete-${String(chapter.number).padStart(2, "0")}`);
  const [odiaTitle, odiaFocus, odiaEssentialQuestion] = odiaChapterBlueprint[chapter.number - 1];
  return [
    [moduleId, sqlString("en"), sqlString(`Chapter ${chapter.number} · ${chapter.title}`), sqlString(chapter.focus), sqlString(chapter.essentialQuestion)],
    [moduleId, sqlString("or"), sqlString(`ଅଧ୍ୟାୟ ${toOdiaDigits(chapter.number)} · ${odiaTitle}`), sqlString(odiaFocus), sqlString(odiaEssentialQuestion)],
  ];
});

const lessonRows = verses.map((verse) => [
  sqlString(`lesson-gita-${verseStem(verse)}`),
  sqlString(`module-gita-complete-${String(verse.chapter).padStart(2, "0")}`),
  sqlString(verseId(verse)),
  sqlString(`gita-${verse.chapter}-${verse.verse}`),
  sqlString("verse-study"),
  verse.verse,
  12,
  "true",
  sqlString("active"),
]);

const lessonLocalizationRows = verses.flatMap((verse) => {
  const chapter = chapters[verse.chapter - 1];
  const [, odiaFocus, odiaEssentialQuestion] = odiaChapterBlueprint[verse.chapter - 1];
  const nextVerse = verse.order < verses.length ? verses[verse.order] : null;
  const lessonId = sqlString(`lesson-gita-${verseStem(verse)}`);
  return [
    [
      lessonId,
      sqlString("en"),
      sqlString(`Bhagavad Gita ${verse.reference}`),
      sqlString(`Study Shloka ${verse.reference} in Devanagari, Roman transliteration and source word glosses.`),
      sqlString(`${chapter.focus} ${chapter.essentialQuestion}`),
      sqlString(nextVerse ? `Complete the study and continue to Shloka ${nextVerse.reference}.` : "Complete the study and review the full eighteen-chapter pathway."),
    ],
    [
      lessonId,
      sqlString("or"),
      sqlString(`ଶ୍ରୀମଦ୍ଭଗବଦ୍‌ଗୀତା ${toOdiaDigits(verse.reference)}`),
      sqlString(`ଶ୍ଲୋକ ${toOdiaDigits(verse.reference)}କୁ ଓଡ଼ିଆ ଲିପିରେ ସଂସ୍କୃତ ପାଠ ସହ ଅଧ୍ୟୟନ କରନ୍ତୁ।`),
      sqlString(`${odiaFocus} ${odiaEssentialQuestion}`),
      sqlString(nextVerse ? `ଅଧ୍ୟୟନ ସମ୍ପୂର୍ଣ୍ଣ କରି ଶ୍ଲୋକ ${toOdiaDigits(nextVerse.reference)}କୁ ଯାଆନ୍ତୁ।` : "ଅଧ୍ୟୟନ ସମ୍ପୂର୍ଣ୍ଣ କରି ସମ୍ପୂର୍ଣ୍ଣ ଅଠର-ଅଧ୍ୟାୟ ପାଠ୍ୟକ୍ରମକୁ ପୁନରାବଲୋକନ କରନ୍ତୁ।"),
    ],
  ];
});

const blockRows = verses.flatMap((verse) => {
  const lessonId = `lesson-gita-${verseStem(verse)}`;
  const blockStem = `block-g${verseStem(verse)}`;
  return [
    [sqlString(`${blockStem}-script`), sqlString(lessonId), sqlString("verse-scripture"), 1, sqlString("scripture-verse"), sqlString(verseId(verse)), "true", "JSON_OBJECT('representations', JSON_ARRAY('canonical-script', 'transliteration'), 'storage', 'database')"],
    [sqlString(`${blockStem}-sandhi`), sqlString(lessonId), sqlString("source-word-sequence"), 2, sqlString("source-word-glosses"), sqlString(analysisId(verse)), "true", "JSON_OBJECT('editorialStatus', 'source-import', 'scholarlySandhiPending', true)"],
    [sqlString(`${blockStem}-gloss`), sqlString(lessonId), sqlString("word-meanings"), 3, sqlString("source-word-glosses"), sqlString(analysisId(verse)), "true", "JSON_OBJECT('language', 'en', 'storage', 'database')"],
    [sqlString(`${blockStem}-trans`), sqlString(lessonId), sqlString("translation"), 4, sqlString("scripture-verse"), sqlString(verseId(verse)), "false", "JSON_OBJECT('availability', 'pending-approved-edition')"],
    [sqlString(`${blockStem}-comm`), sqlString(lessonId), sqlString("commentary-selector"), 5, sqlString("scripture-verse"), sqlString(verseId(verse)), "false", "JSON_OBJECT('availability', 'pending-approved-edition')"],
    [sqlString(`${blockStem}-audio`), sqlString(lessonId), sqlString("read-aloud"), 6, sqlString("scripture-verse"), sqlString(verseId(verse)), "false", "JSON_OBJECT('delivery', 'browser-speech', 'source', 'database-text')"],
  ];
});

const prerequisiteRows = verses.slice(1).map((verse, index) => [
  sqlString(`lesson-gita-${verseStem(verse)}`),
  sqlString(`lesson-gita-${verseStem(verses[index])}`),
  sqlString("complete"),
]);

const sql = `-- Complete locally stored learning corpus of Śrīmad Bhagavad Gītā.
-- Generated by scripts/build-gita-corpus.mjs from gita/gita at ${sourceRevision}.
-- Source license: The Unlicense (public domain dedication).
-- Apply after database/platform-migrations/0000_create_learning_platform.sql.
-- Data only: this is intentionally a seed, not a schema migration.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET time_zone = '+00:00';
START TRANSACTION;

${valuesStatement("languages", ["code", "english_name", "native_name", "direction", "status"], [
  [sqlString("en"), sqlString("English"), sqlString("English"), sqlString("ltr"), sqlString("active")],
  [sqlString("hi"), sqlString("Hindi"), sqlString("हिन्दी"), sqlString("ltr"), sqlString("active")],
  [sqlString("or"), sqlString("Odia"), sqlString("ଓଡ଼ିଆ"), sqlString("ltr"), sqlString("active")],
  [sqlString("sa"), sqlString("Sanskrit"), sqlString("संस्कृतम्"), sqlString("ltr"), sqlString("active")],
], ["english_name", "native_name", "status"])}

${valuesStatement("writing_scripts", ["code", "english_name", "native_name", "direction"], [
  [sqlString("Deva"), sqlString("Devanagari"), sqlString("देवनागरी"), sqlString("ltr")],
  [sqlString("Latn"), sqlString("Latin"), sqlString("Latin"), sqlString("ltr")],
  [sqlString("Orya"), sqlString("Odia"), sqlString("ଓଡ଼ିଆ"), sqlString("ltr")],
], ["english_name", "native_name", "direction"])}

${valuesStatement("organisations", ["id", "slug", "legal_name", "display_name", "organisation_type", "country_code", "default_language_code", "time_zone", "status", "settings"], [[
  sqlString("org-living-bliss"), sqlString("living-bliss"), sqlString("Living Bliss"), sqlString("Living Bliss"), sqlString("spiritual-education"), sqlString("AU"), sqlString("en"), sqlString("Australia/Sydney"), sqlString("active"), "JSON_OBJECT('contentGovernance', 'edition-controlled')",
]], ["display_name", "default_language_code", "status"])}

${valuesStatement("content_licenses", ["id", "organisation_id", "code", "name", "rights_holder", "terms_url", "permitted_uses"], [[
  sqlString("license-gita-unlicense"), "NULL", sqlString("GITA-UNLICENSE"), sqlString("The Unlicense"), sqlString("gita/gita contributors"), sqlString("https://github.com/gita/gita/blob/main/LICENSE"), "JSON_OBJECT('publicDisplay', true, 'redistribution', true, 'commercialUse', true, 'aiTraining', true)",
]], ["name", "rights_holder", "terms_url", "permitted_uses"])}

${valuesStatement("source_documents", ["id", "organisation_id", "license_id", "title", "author", "publisher", "source_url", "checksum_sha256", "rights_status", "citation"], [[
  sqlString("source-gita-open-json"), "NULL", sqlString("license-gita-unlicense"), sqlString("Bhagavad Gita in JSON"), sqlString("gita/gita contributors"), sqlString("gita/gita"), sqlString(sourceUrl), sqlString(sourceChecksum), sqlString("public-domain"), sqlString(`gita/gita, data/verse.json, revision ${sourceRevision}, accessed 2026-09-13.`),
]], ["source_url", "checksum_sha256", "rights_status", "citation"])}

${valuesStatement("scripture_works", ["id", "slug", "canonical_title", "work_type", "canonical_language_code", "chapter_count", "verse_count", "status"], [[
  sqlString("work-bhagavad-gita"), sqlString("bhagavad-gita"), sqlString("Śrīmad Bhagavad Gītā"), sqlString("scripture"), sqlString("sa"), 18, 701, sqlString("active"),
]], ["canonical_title", "chapter_count", "verse_count", "status"])}

${valuesStatement("scripture_work_names", ["work_id", "language_code", "title", "short_description"], [
  [sqlString("work-bhagavad-gita"), sqlString("en"), sqlString("Shreemad Bhagavad Geeta"), sqlString("A structured study of the complete Sanskrit text across all 18 chapters.")],
  [sqlString("work-bhagavad-gita"), sqlString("sa"), sqlString("श्रीमद्भगवद्गीता"), sqlString("अष्टादशाध्यायात्मकः संस्कृतमूलपाठः।")],
], ["title", "short_description"])}

${valuesStatement("scripture_chapters", ["id", "work_id", "chapter_number", "canonical_title", "verse_count", "sort_order"], chapterRows, ["canonical_title", "verse_count", "sort_order"])}

${valuesStatement("scripture_chapter_localizations", ["chapter_id", "language_code", "title", "focus", "essential_question"], chapterNameRows, ["title", "focus", "essential_question"])}

${inBatches(verseRows, 100, (rows) => valuesStatement("scripture_verses", ["id", "chapter_id", "verse_number", "canonical_reference", "sort_order", "status"], rows, ["chapter_id", "verse_number", "canonical_reference", "sort_order", "status"]))}

${valuesStatement("scripture_editions", ["id", "work_id", "owner_organisation_id", "slug", "name", "authority_statement", "status"], [[
  sqlString("edition-lb-gita-open-text"), sqlString("work-bhagavad-gita"), sqlString("org-living-bliss"), sqlString("living-bliss-open-sanskrit-text"), sqlString("Living Bliss open Sanskrit text"), sqlString("Locally stored Sanskrit text in Devanagari and Odia scripts, Roman transliteration and source word glosses from the public-domain gita/gita dataset; approved translations and commentary remain separate edition layers."), sqlString("active"),
]], ["name", "authority_statement", "status"])}

${valuesStatement("scripture_edition_releases", ["id", "edition_id", "version_label", "publication_status", "source_document_id", "license_id", "content_checksum", "release_notes", "published_at"], [[
  sqlString(releaseId), sqlString("edition-lb-gita-open-text"), sqlString(sourceVersion), sqlString("published"), sqlString("source-gita-open-json"), sqlString("license-gita-unlicense"), sqlString(sourceChecksum), sqlString("Complete 701-shloka Sanskrit text in Devanagari, Odia script and Roman transliteration, with locally stored source word glosses for 700 shlokas."), sqlString("2026-09-13 00:00:00.000"),
]], ["publication_status", "source_document_id", "license_id", "content_checksum", "release_notes"])}

${valuesStatement("publication_profiles", ["id", "organisation_id", "slug", "name", "audience_type", "jurisdiction_code", "default_language_code", "status", "settings"], [[
  sqlString("profile-lb-gita-general"), sqlString("org-living-bliss"), sqlString("gita-general"), sqlString("Living Bliss Shreemad Bhagavad Geeta"), sqlString("general"), sqlString("GLOBAL"), sqlString("en"), sqlString("active"), "JSON_OBJECT('languages', JSON_ARRAY('sa', 'en', 'hi', 'or'), 'sequentialStudy', true, 'chapterCount', 18, 'verseCount', 701)",
]], ["name", "status", "settings"])}

${valuesStatement("publication_scripture_releases", ["publication_profile_id", "work_id", "edition_release_id", "is_default"], [[
  sqlString("profile-lb-gita-general"), sqlString("work-bhagavad-gita"), sqlString(releaseId), "true",
]], ["edition_release_id", "is_default"])}

${inBatches(textRows, 80, (rows) => valuesStatement("verse_texts", ["id", "edition_release_id", "verse_id", "language_code", "script_code", "representation", "text", "line_breaks", "metre", "pronunciation_guide", "source_locator", "editorial_status"], rows, ["text", "line_breaks", "source_locator", "editorial_status"]))}

${inBatches(analysisRows, 100, (rows) => valuesStatement("verse_sandhi_analyses", ["id", "edition_release_id", "verse_id", "analysis_type", "version_label", "editorial_status", "source_locator"], rows, ["editorial_status", "source_locator"]))}

${inBatches(tokenRows, 250, (rows) => valuesStatement("verse_tokens", ["id", "analysis_id", "position", "lemma_key", "grammar"], rows, ["analysis_id", "position", "lemma_key", "grammar"]))}

${inBatches(tokenFormRows, 250, (rows) => valuesStatement("verse_token_forms", ["id", "token_id", "language_code", "script_code", "form_type", "text"], rows, ["text"]))}

${inBatches(tokenMeaningRows, 250, (rows) => valuesStatement("verse_token_meanings", ["id", "token_id", "language_code", "sense_number", "meaning", "grammatical_note", "editorial_status"], rows, ["meaning", "grammatical_note", "editorial_status"]))}

${valuesStatement("courses", ["id", "owner_organisation_id", "publication_profile_id", "scripture_work_id", "slug", "course_type", "audience_type", "status"], [[
  sqlString(courseId), sqlString("org-living-bliss"), sqlString("profile-lb-gita-general"), sqlString("work-bhagavad-gita"), sqlString("gita-foundations"), sqlString("self-paced"), sqlString("general"), sqlString("active"),
]], ["publication_profile_id", "scripture_work_id", "status"])}

${valuesStatement("course_localizations", ["course_id", "language_code", "title", "short_description", "full_description", "learning_outcomes"], [[
  sqlString(courseId), sqlString("en"), sqlString("Shreemad Bhagavad Geeta"), sqlString("A complete, sequential study of all eighteen chapters and 701 shlokas."), sqlString("Study the locally stored Sanskrit text verse by verse with Devanagari, Roman transliteration, source word glosses and edition-aware academic layers."), "JSON_ARRAY('Read all 701 shlokas in canonical sequence', 'Use Devanagari and Roman transliteration together', 'Study source word glosses separately from translation and commentary', 'Track progress through all eighteen chapters')",
]], ["title", "short_description", "full_description", "learning_outcomes"])}

${valuesStatement("course_releases", ["id", "course_id", "version_label", "default_scripture_release_id", "publication_status", "passing_percentage", "estimated_minutes", "content_checksum", "release_notes", "published_at"], [[
  sqlString(courseReleaseId), sqlString(courseId), sqlString(`complete-${sourceVersion}`), sqlString(releaseId), sqlString("published"), 60, verses.length * 12, sqlString(sourceChecksum), sqlString("Complete database-backed eighteen-chapter pathway with 701 verse lessons."), sqlString("2026-09-13 00:00:00.000"),
]], ["default_scripture_release_id", "publication_status", "estimated_minutes", "content_checksum", "release_notes"])}

${valuesStatement("course_modules", ["id", "course_release_id", "scripture_chapter_id", "slug", "module_type", "sequence", "is_required", "status"], moduleRows, ["scripture_chapter_id", "sequence", "is_required", "status"])}

${valuesStatement("course_module_localizations", ["module_id", "language_code", "title", "description", "essential_question"], moduleLocalizationRows, ["title", "description", "essential_question"])}

${inBatches(lessonRows, 100, (rows) => valuesStatement("lessons", ["id", "module_id", "scripture_verse_id", "slug", "lesson_type", "sequence", "estimated_minutes", "is_required", "status"], rows, ["scripture_verse_id", "lesson_type", "sequence", "estimated_minutes", "is_required", "status"]))}

${inBatches(lessonLocalizationRows, 100, (rows) => valuesStatement("lesson_localizations", ["lesson_id", "language_code", "title", "objective", "scene_context", "completion_message"], rows, ["title", "objective", "scene_context", "completion_message"]))}

${inBatches(blockRows, 200, (rows) => valuesStatement("lesson_content_blocks", ["id", "lesson_id", "block_type", "sequence", "source_entity_type", "source_entity_id", "required_for_completion", "configuration"], rows, ["block_type", "source_entity_type", "source_entity_id", "required_for_completion", "configuration"]))}

${inBatches(prerequisiteRows, 100, (rows) => valuesStatement("lesson_prerequisites", ["lesson_id", "prerequisite_lesson_id", "rule_type"], rows, ["rule_type"]))}

COMMIT;
`;

const dataOutput = path.join(process.cwd(), "app/course/gita/gita-verses.json");
const sqlOutput = path.join(process.cwd(), "database/seeds/002_complete_gita_devanagari.sql");
await mkdir(path.dirname(dataOutput), { recursive: true });
await mkdir(path.dirname(sqlOutput), { recursive: true });
await writeFile(dataOutput, `${JSON.stringify(corpus, null, 2)}\n`, "utf8");
await writeFile(sqlOutput, sql, "utf8");

console.log(`Generated ${verses.length} verses, ${tokenRows.length} source word glosses and ${lessonRows.length} lessons across ${chapters.length} chapters.`);
console.log(`Data: ${dataOutput}`);
console.log(`Seed: ${sqlOutput}`);
