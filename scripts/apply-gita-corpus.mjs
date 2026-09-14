import { access, readFile } from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

async function loadEnvFile(filePath) {
  try {
    await access(filePath);
  } catch {
    return;
  }

  const content = await readFile(filePath, "utf8");
  for (const line of content.split(/\r?\n/u)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/u);
    if (!match) continue;
    const [, key, rawValue] = match;
    let value = rawValue.trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/u, "").trim();
    }
    process.env[key] = value;
  }
}

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required database setting: ${name}`);
  return value;
}

await loadEnvFile(path.join(process.cwd(), ".env"));
await loadEnvFile(path.join(process.cwd(), ".env.local"));

const connection = await mysql.createConnection({
  host: required("DB_HOST"),
  port: Number(process.env.DB_PORT ?? "3306"),
  user: required("DB_USER"),
  password: required("DB_PASSWORD"),
  database: required("DB_NAME"),
  charset: "utf8mb4",
  timezone: "Z",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined,
  multipleStatements: true,
  connectTimeout: 15000,
});

try {
  const requiredTables = [
    "content_licenses",
    "course_localizations",
    "course_module_localizations",
    "course_modules",
    "course_releases",
    "courses",
    "languages",
    "lesson_content_blocks",
    "lesson_localizations",
    "lesson_prerequisites",
    "lessons",
    "organisations",
    "publication_profiles",
    "publication_scripture_releases",
    "scripture_chapter_localizations",
    "scripture_chapters",
    "scripture_edition_releases",
    "scripture_editions",
    "scripture_verses",
    "scripture_work_names",
    "scripture_works",
    "source_documents",
    "verse_sandhi_analyses",
    "verse_texts",
    "verse_token_forms",
    "verse_token_meanings",
    "verse_tokens",
    "writing_scripts",
  ];
  const [tables] = await connection.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()",
  );
  const present = new Set(tables.map((row) => row.TABLE_NAME ?? row.table_name));
  const missing = requiredTables.filter((name) => !present.has(name));
  if (missing.length) {
    throw new Error(`The learning-platform migration is not applied. Missing tables: ${missing.join(", ")}`);
  }

  const sql = await readFile(
    path.join(process.cwd(), "database/seeds/002_complete_gita_devanagari.sql"),
    "utf8",
  );
  await connection.query(sql);

  const [[counts]] = await connection.query(`
    SELECT
      (SELECT COUNT(*) FROM scripture_chapters WHERE work_id = 'work-bhagavad-gita') AS chapters,
      (SELECT COUNT(*) FROM scripture_verses v JOIN scripture_chapters c ON c.id = v.chapter_id WHERE c.work_id = 'work-bhagavad-gita') AS verses,
      (SELECT COUNT(*) FROM verse_texts WHERE edition_release_id = 'release-lb-gita-open-c6fce3959544' AND language_code = 'sa' AND script_code = 'Deva' AND representation = 'canonical-script') AS devanagari_texts,
      (SELECT COUNT(*) FROM verse_texts WHERE edition_release_id = 'release-lb-gita-open-c6fce3959544' AND language_code = 'sa' AND script_code = 'Latn' AND representation = 'transliteration') AS transliterations,
      (SELECT COUNT(*) FROM verse_texts WHERE edition_release_id = 'release-lb-gita-open-c6fce3959544' AND language_code = 'sa' AND script_code = 'Orya' AND representation = 'script-transliteration') AS odia_script_texts,
      (SELECT COUNT(*) FROM verse_sandhi_analyses WHERE edition_release_id = 'release-lb-gita-open-c6fce3959544' AND analysis_type = 'source-word-glosses') AS source_analyses,
      (SELECT COUNT(*) FROM verse_token_meanings vm JOIN verse_tokens t ON t.id = vm.token_id JOIN verse_sandhi_analyses a ON a.id = t.analysis_id WHERE a.edition_release_id = 'release-lb-gita-open-c6fce3959544' AND a.analysis_type = 'source-word-glosses' AND vm.language_code = 'en') AS source_glosses,
      (SELECT COUNT(DISTINCT a.verse_id) FROM verse_token_meanings vm JOIN verse_tokens t ON t.id = vm.token_id JOIN verse_sandhi_analyses a ON a.id = t.analysis_id WHERE a.edition_release_id = 'release-lb-gita-open-c6fce3959544' AND a.analysis_type = 'source-word-glosses' AND vm.language_code = 'en') AS glossed_verses,
      (SELECT COUNT(*) FROM course_modules WHERE course_release_id = 'course-release-gita-complete-v1') AS course_modules,
      (SELECT COUNT(*) FROM lessons l JOIN course_modules m ON m.id = l.module_id WHERE m.course_release_id = 'course-release-gita-complete-v1') AS lessons,
      (SELECT COUNT(*) FROM lesson_content_blocks b JOIN lessons l ON l.id = b.lesson_id JOIN course_modules m ON m.id = l.module_id WHERE m.course_release_id = 'course-release-gita-complete-v1') AS lesson_blocks,
      (SELECT COUNT(*) FROM lesson_prerequisites p JOIN lessons l ON l.id = p.lesson_id JOIN course_modules m ON m.id = l.module_id WHERE m.course_release_id = 'course-release-gita-complete-v1') AS lesson_prerequisites
  `);

  const result = {
    chapters: Number(counts.chapters),
    verses: Number(counts.verses),
    devanagariTexts: Number(counts.devanagari_texts),
    transliterations: Number(counts.transliterations),
    odiaScriptTexts: Number(counts.odia_script_texts),
    sourceAnalyses: Number(counts.source_analyses),
    sourceGlosses: Number(counts.source_glosses),
    glossedVerses: Number(counts.glossed_verses),
    courseModules: Number(counts.course_modules),
    lessons: Number(counts.lessons),
    lessonBlocks: Number(counts.lesson_blocks),
    lessonPrerequisites: Number(counts.lesson_prerequisites),
  };
  if (
    result.chapters !== 18
    || result.verses !== 701
    || result.devanagariTexts !== 701
    || result.transliterations !== 701
    || result.odiaScriptTexts !== 701
    || result.sourceAnalyses !== 701
    || result.sourceGlosses !== 9504
    || result.glossedVerses !== 700
    || result.courseModules !== 18
    || result.lessons !== 701
    || result.lessonBlocks !== 4206
    || result.lessonPrerequisites !== 700
  ) {
    throw new Error(`Post-import verification failed: ${JSON.stringify(result)}`);
  }
  console.log(`Database verified: ${JSON.stringify(result)}`);
} catch (error) {
  try {
    await connection.rollback();
  } catch {
    // Preserve the original import error.
  }
  console.error(error instanceof Error ? error.message : "The Gita corpus import failed.");
  process.exitCode = 1;
} finally {
  await connection.end();
}
