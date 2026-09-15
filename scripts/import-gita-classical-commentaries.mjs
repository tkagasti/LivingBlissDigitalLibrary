import { access, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
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

const commentators = {
  abhinavagupta: {
    personId: "person-abhinavagupta",
    slug: "abhinavagupta",
    name: "Abhinavagupta",
    devanagariName: "अभिनवगुप्तः",
    traditionId: "tradition-kashmir-shaivism",
    workId: "cwork-abhinavagupta-gita",
    editionId: "cedition-abhinavagupta-sa-v1",
    workSlug: "abhinavagupta-gitarthasangraha",
    title: "Gītārthasaṅgraha of Abhinavagupta",
  },
  anandagiri: {
    personId: "person-anandagiri",
    slug: "anandagiri",
    name: "Ānandagiri",
    devanagariName: "आनन्दगिरिः",
    traditionId: "tradition-advaita",
    workId: "cwork-anandagiri-gita",
    editionId: "cedition-anandagiri-sa-v1",
    workSlug: "anandagiri-gita-vyakhya",
    title: "Bhagavad Gītā Bhāṣya Vyākhyā of Ānandagiri",
  },
  dhanpati: {
    personId: "person-dhanpati",
    slug: "dhanpati",
    name: "Dhanapati",
    devanagariName: "धनपतिः",
    traditionId: "tradition-advaita",
    workId: "cwork-dhanpati-gita",
    editionId: "cedition-dhanpati-sa-v1",
    workSlug: "dhanpati-gita-commentary",
    title: "Bhagavad Gītā commentary of Dhanapati",
  },
  madhva: {
    personId: "person-madhva",
    slug: "sri-madhvacharya",
    name: "Śrī Madhvācārya",
    devanagariName: "श्रीमध्वाचार्यः",
    traditionId: "tradition-dvaita",
    workId: "cwork-madhva-gita",
    editionId: "cedition-madhva-sa-v1",
    workSlug: "madhva-gita-bhasya",
    title: "Bhagavad Gītā Bhāṣya of Śrī Madhvācārya",
  },
  nilakantha: {
    personId: "person-nilakantha",
    slug: "nilakantha",
    name: "Nīlakaṇṭha",
    devanagariName: "नीलकण्ठः",
    traditionId: "tradition-advaita",
    workId: "cwork-nilakantha-gita",
    editionId: "cedition-nilakantha-sa-v1",
    workSlug: "nilakantha-bharatabhavadipa",
    title: "Bhāratabhāvadīpa commentary of Nīlakaṇṭha",
  },
  ramanuja: {
    personId: "person-ramanuja",
    slug: "sri-ramanujacharya",
    name: "Śrī Rāmānujācārya",
    devanagariName: "श्रीरामानुजाचार्यः",
    traditionId: "tradition-vishishtadvaita",
    workId: "cwork-ramanuja-gita",
    editionId: "cedition-ramanuja-sa-v1",
    workSlug: "ramanuja-gita-bhasya",
    title: "Bhagavad Gītā Bhāṣya of Śrī Rāmānujācārya",
  },
  sridhara: {
    personId: "person-sridhara",
    slug: "sridhara-svami",
    name: "Śrīdhara Svāmī",
    devanagariName: "श्रीधरस्वामी",
    traditionId: "tradition-advaita",
    workId: "cwork-sridhara-gita",
    editionId: "cedition-sridhara-sa-v1",
    workSlug: "sridhara-gita-subodhini",
    title: "Subodhinī commentary of Śrīdhara Svāmī",
  },
  vedanta_desika: {
    personId: "person-vedanta-desika",
    slug: "vedanta-desika-venkatanatha",
    name: "Vedānta Deśika Veṅkaṭanātha",
    devanagariName: "वेदान्तदेशिकवेङ्कटनाथः",
    traditionId: "tradition-vishishtadvaita",
    workId: "cwork-vedanta-desika-gita",
    editionId: "cedition-vedanta-desika-sa-v1",
    workSlug: "vedanta-desika-tatparyacandrika",
    title: "Tātparyacandrikā of Vedānta Deśika Veṅkaṭanātha",
  },
  shankara: {
    personId: "person-shankara",
    slug: "adi-shankaracharya",
    name: "Ādi Śaṅkarācārya",
    devanagariName: "आदि शङ्कराचार्यः",
    traditionId: "tradition-advaita",
    workId: "cwork-shankara-gita",
    editionId: "cedition-shankara-sa-v1",
    workSlug: "shankara-gita-bhasya",
    title: "Bhagavad Gītā Bhāṣya of Ādi Śaṅkarācārya",
    sourceDocumentId: "source-vedic-gita-classical-2026",
    licenseId: "license-vedic-gita-gpl3-pd",
  },
  jayatirtha: {
    personId: "person-jayatirtha",
    slug: "sri-jayatirtha",
    name: "Śrī Jayatīrtha",
    devanagariName: "श्रीजयतीर्थः",
    traditionId: "tradition-dvaita",
    workId: "cwork-jayatirtha-gita",
    editionId: "cedition-jayatirtha-sa-v1",
    workSlug: "jayatirtha-prameya-dipika",
    title: "Prameyadīpikā of Śrī Jayatīrtha",
    sourceDocumentId: "source-vedic-gita-classical-2026",
    licenseId: "license-vedic-gita-gpl3-pd",
  },
  vallabha: {
    personId: "person-vallabha",
    slug: "sri-vallabhacharya",
    name: "Śrī Vallabhācārya",
    devanagariName: "श्रीवल्लभाचार्यः",
    traditionId: "tradition-shuddhadvaita",
    workId: "cwork-vallabha-gita",
    editionId: "cedition-vallabha-sa-v1",
    workSlug: "vallabha-tattvadipika",
    title: "Tattvadīpikā of Śrī Vallabhācārya",
    sourceDocumentId: "source-vedic-gita-classical-2026",
    licenseId: "license-vedic-gita-gpl3-pd",
  },
  madhusudana: {
    personId: "person-madhusudana-saraswati",
    slug: "madhusudana-saraswati",
    name: "Madhusūdana Sarasvatī",
    devanagariName: "मधुसूदनसरस्वती",
    traditionId: "tradition-advaita",
    workId: "cwork-madhusudana-gita",
    editionId: "cedition-madhusudana-sa-v1",
    workSlug: "madhusudana-gudhartha-dipika",
    title: "Gūḍhārthadīpikā of Madhusūdana Sarasvatī",
    sourceDocumentId: "source-vedic-gita-classical-2026",
    licenseId: "license-vedic-gita-gpl3-pd",
  },
  purushottama: {
    personId: "person-purushottamji",
    slug: "sri-purushottamji",
    name: "Śrī Puruṣottamajī",
    devanagariName: "श्रीपुरुषोत्तमजी",
    traditionId: "tradition-shuddhadvaita",
    workId: "cwork-purushottama-gita",
    editionId: "cedition-purushottama-sa-v1",
    workSlug: "purushottama-amritatarangini",
    title: "Amṛtataraṅgiṇī of Śrī Puruṣottamajī",
    sourceDocumentId: "source-vedic-gita-classical-2026",
    licenseId: "license-vedic-gita-gpl3-pd",
  },
};

await loadEnvFile(path.join(process.cwd(), ".env"));
await loadEnvFile(path.join(process.cwd(), ".env.local"));

const sourcePath = path.join(process.cwd(), "database/source-data/gita-classical-commentaries-draft.json");
const sourceBytes = await readFile(sourcePath);
const sourceChecksum = createHash("sha256").update(sourceBytes).digest("hex");
const secondarySourcePath = path.join(process.cwd(), "database/source-data/gita-classical-commentaries-draft-2.json");
const secondarySourceBytes = await readFile(secondarySourcePath);
const secondarySourceChecksum = createHash("sha256").update(secondarySourceBytes).digest("hex");
const sourceRows = [
  ...JSON.parse(sourceBytes.toString("utf8")),
  ...JSON.parse(secondarySourceBytes.toString("utf8")),
];

const connection = await mysql.createConnection({
  host: required("DB_HOST"),
  port: Number(process.env.DB_PORT ?? "3306"),
  user: required("DB_USER"),
  password: required("DB_PASSWORD"),
  database: required("DB_NAME"),
  charset: "utf8mb4",
  timezone: "Z",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined,
  connectTimeout: 15000,
});

const [[importLock]] = await connection.query(
  "SELECT GET_LOCK('living-bliss-gita-commentary-import-v1', 120) AS acquired",
);
if (Number(importLock.acquired) !== 1) {
  await connection.end();
  throw new Error("Could not acquire the Gita commentary import lock");
}

const commentaryEditionIds = Object.values(commentators).map((definition) => definition.editionId);
const [[existingCorpus]] = await connection.query(
  `SELECT
     COUNT(DISTINCT ce.id) AS editions,
     COUNT(cp.id) AS passages,
     COUNT(DISTINCT IF(ce.content_checksum IN (?, ?), ce.id, NULL)) AS checksum_matches
   FROM commentary_editions ce
   LEFT JOIN commentary_passages cp ON cp.commentary_edition_id = ce.id
   WHERE ce.id IN (?)`,
  [sourceChecksum, secondarySourceChecksum, commentaryEditionIds],
);

if (
  Number(existingCorpus.editions) === commentaryEditionIds.length
  && Number(existingCorpus.passages) === 8402
  && Number(existingCorpus.checksum_matches) === commentaryEditionIds.length
) {
  console.log(JSON.stringify({ editions: commentaryEditionIds.length, passages: 8402, status: "already-current" }));
  await connection.end();
  process.exit(0);
}

try {
  const [[textColumn]] = await connection.query(
    `SELECT DATA_TYPE AS data_type
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'commentary_passages'
       AND column_name = 'text'`,
  );
  if (!textColumn) throw new Error("The commentary_passages.text column is missing");
  if (textColumn.data_type === "text") {
    await connection.query("ALTER TABLE commentary_passages MODIFY COLUMN text MEDIUMTEXT NOT NULL");
  } else if (textColumn.data_type !== "mediumtext" && textColumn.data_type !== "longtext") {
    throw new Error(`Unexpected commentary_passages.text type: ${textColumn.data_type}`);
  }

  await connection.beginTransaction();

  await connection.query(
    `INSERT INTO content_licenses
      (id, organisation_id, code, name, rights_holder, terms_url, permitted_uses)
     VALUES (?, NULL, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), rights_holder = VALUES(rights_holder),
       terms_url = VALUES(terms_url), permitted_uses = VALUES(permitted_uses)`,
    [
      "license-gita-classical-pd-ccby4",
      "GITA-CLASSICAL-PD-CC-BY-4.0",
      "Classical Sanskrit texts; CC BY 4.0 dataset aggregation",
      "Classical authors; dataset aggregation by Joy Bose",
      "https://huggingface.co/datasets/joyboseroy/darshana-graph",
      JSON.stringify({ publicDisplay: false, preservation: true, databaseStorage: true, attributionRequired: true }),
    ],
  );

  await connection.query(
    `INSERT INTO content_licenses
      (id, organisation_id, code, name, rights_holder, terms_url, permitted_uses)
     VALUES (?, NULL, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), rights_holder = VALUES(rights_holder),
       terms_url = VALUES(terms_url), permitted_uses = VALUES(permitted_uses)`,
    [
      "license-vedic-gita-gpl3-pd",
      "VEDIC-GITA-GPL-3.0-PD",
      "Classical Sanskrit texts; GPL-3.0 dataset distribution",
      "Classical authors; vedicscriptures dataset contributors",
      "https://github.com/vedicscriptures/bhagavad-gita/blob/43dfc8db815d01e15a347ea294b089334cf2aa17/LICENSE",
      JSON.stringify({ publicDisplay: false, preservation: true, databaseStorage: true, attributionRequired: true, shareAlikeReviewRequired: true }),
    ],
  );

  await connection.query(
    `INSERT INTO source_documents
      (id, organisation_id, license_id, title, author, publisher, source_url, storage_key,
       checksum_sha256, rights_status, citation)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE license_id = VALUES(license_id), source_url = VALUES(source_url),
       storage_key = VALUES(storage_key), checksum_sha256 = VALUES(checksum_sha256),
       rights_status = VALUES(rights_status), citation = VALUES(citation)`,
    [
      "source-gita-classical-draft-2026",
      "org-living-bliss",
      "license-gita-classical-pd-ccby4",
      "Classical Sanskrit Bhagavad Gita commentaries — draft corpus",
      "Eight classical Sanskrit commentators",
      "Darshana Graph dataset aggregation",
      "https://github.com/joyboseroy/darshana-graph/tree/1d7aa11ccfa7e818b42d8e676a334e641694c95e/corpus",
      "database/source-data/gita-classical-commentaries-draft.json",
      sourceChecksum,
      "review-required",
      "Draft import of classical Sanskrit passages only. Source and textual accuracy require scholarly review before publication.",
    ],
  );

  await connection.query(
    `INSERT INTO source_documents
      (id, organisation_id, license_id, title, author, publisher, source_url, storage_key,
       checksum_sha256, rights_status, citation)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE license_id = VALUES(license_id), source_url = VALUES(source_url),
       storage_key = VALUES(storage_key), checksum_sha256 = VALUES(checksum_sha256),
       rights_status = VALUES(rights_status), citation = VALUES(citation)`,
    [
      "source-vedic-gita-classical-2026",
      "org-living-bliss",
      "license-vedic-gita-gpl3-pd",
      "Five classical Sanskrit Bhagavad Gita commentaries — draft corpus",
      "Five classical Sanskrit commentators",
      "vedicscriptures Bhagavad Gita dataset",
      "https://github.com/vedicscriptures/bhagavad-gita/tree/43dfc8db815d01e15a347ea294b089334cf2aa17/slok",
      "database/source-data/gita-classical-commentaries-draft-2.json",
      secondarySourceChecksum,
      "review-required",
      "Draft import of classical Sanskrit passages only. Source and textual accuracy require scholarly review before publication.",
    ],
  );

  const traditions = [
    ["tradition-advaita", "advaita-vedanta", "Advaita Vedānta", "Classical Advaita Vedānta commentarial tradition."],
    ["tradition-dvaita", "dvaita-vedanta", "Dvaita Vedānta", "Classical Dvaita Vedānta commentarial tradition."],
    ["tradition-vishishtadvaita", "vishishtadvaita-vedanta", "Viśiṣṭādvaita Vedānta", "Classical Viśiṣṭādvaita Vedānta commentarial tradition."],
    ["tradition-kashmir-shaivism", "kashmir-shaivism", "Kashmir Śaivism", "Classical Kashmir Śaiva commentarial tradition."],
    ["tradition-shuddhadvaita", "shuddhadvaita-vedanta", "Śuddhādvaita Vedānta", "Classical Śuddhādvaita Vedānta commentarial tradition."],
  ];
  await connection.query(
    `INSERT INTO commentary_traditions (id, slug, canonical_name, description) VALUES ?
     ON DUPLICATE KEY UPDATE canonical_name = VALUES(canonical_name), description = VALUES(description)`,
    [traditions],
  );

  for (const definition of Object.values(commentators)) {
    await connection.query(
      `INSERT INTO persons (id, slug, canonical_name, person_type)
       VALUES (?, ?, ?, 'commentator')
       ON DUPLICATE KEY UPDATE canonical_name = VALUES(canonical_name), person_type = 'commentator'`,
      [definition.personId, definition.slug, definition.name],
    );
    await connection.query(
      `INSERT INTO person_names (person_id, language_code, display_name) VALUES (?, 'en', ?), (?, 'sa', ?)
       ON DUPLICATE KEY UPDATE display_name = VALUES(display_name)`,
      [definition.personId, definition.name, definition.personId, definition.devanagariName],
    );
    await connection.query(
      `INSERT INTO commentary_works
        (id, scripture_work_id, commentator_person_id, tradition_id, slug, canonical_title,
         original_language_code, source_document_id)
       VALUES (?, 'work-bhagavad-gita', ?, ?, ?, ?, 'sa', ?)
       ON DUPLICATE KEY UPDATE commentator_person_id = VALUES(commentator_person_id),
         tradition_id = VALUES(tradition_id), canonical_title = VALUES(canonical_title),
         original_language_code = VALUES(original_language_code), source_document_id = VALUES(source_document_id)`,
      [definition.workId, definition.personId, definition.traditionId, definition.workSlug, definition.title, definition.sourceDocumentId ?? "source-gita-classical-draft-2026"],
    );
    await connection.query(
      `INSERT INTO commentary_editions
        (id, commentary_work_id, owner_organisation_id, language_code, title, version_label,
         passage_mode, license_id, source_document_id, publication_status, content_checksum)
       VALUES (?, ?, 'org-living-bliss', 'sa', ?, 'classical-sa-draft-1', 'full-text', ?, ?, 'draft', ?)
       ON DUPLICATE KEY UPDATE title = VALUES(title), passage_mode = VALUES(passage_mode),
         license_id = VALUES(license_id), source_document_id = VALUES(source_document_id),
         publication_status = 'draft', content_checksum = VALUES(content_checksum)`,
      [
        definition.editionId,
        definition.workId,
        `${definition.title} — Sanskrit draft`,
        definition.licenseId ?? "license-gita-classical-pd-ccby4",
        definition.sourceDocumentId ?? "source-gita-classical-draft-2026",
        definition.sourceDocumentId ? secondarySourceChecksum : sourceChecksum,
      ],
    );
  }

  const [verseRows] = await connection.query(
    `SELECT v.id, c.chapter_number, v.verse_number
     FROM scripture_verses v
     JOIN scripture_chapters c ON c.id = v.chapter_id
     WHERE c.work_id = 'work-bhagavad-gita'`,
  );
  const verseIds = new Map(verseRows.map((row) => [`${row.chapter_number}.${row.verse_number}`, row.id]));

  const passages = [];
  for (const sourceRow of sourceRows) {
    const verseId = verseIds.get(`${sourceRow.chapter}.${sourceRow.verse}`);
    if (!verseId) throw new Error(`Missing scripture verse ${sourceRow.chapter}.${sourceRow.verse}`);
    for (const passage of sourceRow.commentaries) {
      const definition = commentators[passage.commentator];
      if (!definition) throw new Error(`Unexpected commentator ${passage.commentator}`);
      passages.push([
        `cpass-${passage.commentator.replace("vedanta_desika", "vdesika")}-${String(sourceRow.chapter).padStart(2, "0")}-${String(sourceRow.verse).padStart(3, "0")}`,
        definition.editionId,
        verseId,
        "full-text",
        passage.text,
        `Bhagavad Gītā ${sourceRow.chapter}.${sourceRow.verse}`,
        "draft",
      ]);
    }
  }

  for (let start = 0; start < passages.length; start += 200) {
    await connection.query(
      `INSERT INTO commentary_passages
        (id, commentary_edition_id, verse_id, passage_type, text, source_locator, editorial_status)
       VALUES ?
       ON DUPLICATE KEY UPDATE text = VALUES(text), source_locator = VALUES(source_locator),
         editorial_status = 'draft'`,
      [passages.slice(start, start + 200)],
    );
  }

  const [counts] = await connection.query(
    `SELECT p.slug AS commentator, COUNT(cp.id) AS passages
     FROM commentary_passages cp
     JOIN commentary_editions ce ON ce.id = cp.commentary_edition_id
     JOIN commentary_works cw ON cw.id = ce.commentary_work_id
     JOIN persons p ON p.id = cw.commentator_person_id
     WHERE ce.source_document_id IN ('source-gita-classical-draft-2026', 'source-vedic-gita-classical-2026')
     GROUP BY p.slug
     ORDER BY p.slug`,
  );

  if (passages.length !== 8402) throw new Error(`Expected 8402 passages, prepared ${passages.length}`);
  const storedTotal = counts.reduce((sum, row) => sum + Number(row.passages), 0);
  if (storedTotal !== 8402) throw new Error(`Expected 8402 stored passages, found ${storedTotal}`);

  await connection.commit();
  console.log(JSON.stringify({ editions: counts.length, passages: storedTotal, counts }, null, 2));
} catch (error) {
  await connection.rollback();
  console.error(error instanceof Error ? error.message : "Commentary import failed.");
  process.exitCode = 1;
} finally {
  await connection.query("SELECT RELEASE_LOCK('living-bliss-gita-commentary-import-v1')");
  await connection.end();
}
