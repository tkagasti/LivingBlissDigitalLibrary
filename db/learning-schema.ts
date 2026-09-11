import {
  boolean,
  char,
  foreignKey,
  index,
  int,
  json,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { authUsers } from "./auth-schema";

type JsonObject = Record<string, unknown>;

// Reference data -------------------------------------------------------------

export const languages = mysqlTable("languages", {
  code: varchar("code", { length: 12 }).primaryKey(),
  englishName: varchar("english_name", { length: 80 }).notNull(),
  nativeName: varchar("native_name", { length: 80 }).notNull(),
  direction: varchar("direction", { length: 3 }).notNull().default("ltr"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
});

export const writingScripts = mysqlTable("writing_scripts", {
  code: varchar("code", { length: 8 }).primaryKey(),
  englishName: varchar("english_name", { length: 80 }).notNull(),
  nativeName: varchar("native_name", { length: 80 }),
  direction: varchar("direction", { length: 3 }).notNull().default("ltr"),
});

// Tenants, institutions and school structures --------------------------------

export const organisations = mysqlTable(
  "organisations",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    slug: varchar("slug", { length: 80 }).notNull(),
    legalName: varchar("legal_name", { length: 180 }).notNull(),
    displayName: varchar("display_name", { length: 120 }).notNull(),
    organisationType: varchar("organisation_type", { length: 32 }).notNull(),
    countryCode: char("country_code", { length: 2 }),
    defaultLanguageCode: varchar("default_language_code", { length: 12 }).references(() => languages.code),
    timeZone: varchar("time_zone", { length: 64 }).notNull().default("UTC"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    settings: json("settings").$type<JsonObject>(),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string", fsp: 3 }).notNull().defaultNow().onUpdateNow(),
  },
  (table) => [uniqueIndex("organisations_slug_unique").on(table.slug)],
);

export const organisationDomains = mysqlTable(
  "organisation_domains",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organisationId: varchar("organisation_id", { length: 36 })
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    hostname: varchar("hostname", { length: 253 }).notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    verifiedAt: timestamp("verified_at", { mode: "string", fsp: 3 }),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("organisation_domains_hostname_unique").on(table.hostname),
    index("organisation_domains_org_idx").on(table.organisationId),
  ],
);

export const organisationBranding = mysqlTable("organisation_branding", {
  organisationId: varchar("organisation_id", { length: 36 })
    .primaryKey()
    .references(() => organisations.id, { onDelete: "cascade" }),
  logoUrl: varchar("logo_url", { length: 1024 }),
  faviconUrl: varchar("favicon_url", { length: 1024 }),
  primaryColor: varchar("primary_color", { length: 16 }),
  secondaryColor: varchar("secondary_color", { length: 16 }),
  accentColor: varchar("accent_color", { length: 16 }),
  fontFamily: varchar("font_family", { length: 160 }),
  theme: json("theme").$type<JsonObject>(),
  updatedAt: timestamp("updated_at", { mode: "string", fsp: 3 }).notNull().defaultNow().onUpdateNow(),
});

export const organisationMemberships = mysqlTable(
  "organisation_memberships",
  {
    organisationId: varchar("organisation_id", { length: 36 })
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 32 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    joinedAt: timestamp("joined_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.organisationId, table.userId], name: "organisation_memberships_pk" }),
    index("organisation_memberships_user_idx").on(table.userId),
  ],
);

export const organisationUnits = mysqlTable(
  "organisation_units",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organisationId: varchar("organisation_id", { length: 36 })
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    parentUnitId: varchar("parent_unit_id", { length: 36 }),
    unitType: varchar("unit_type", { length: 32 }).notNull(),
    name: varchar("name", { length: 140 }).notNull(),
    externalReference: varchar("external_reference", { length: 120 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [
    index("organisation_units_org_idx").on(table.organisationId),
    index("organisation_units_parent_idx").on(table.parentUnitId),
    foreignKey({
      name: "fk_organisation_unit_parent",
      columns: [table.parentUnitId],
      foreignColumns: [table.id],
    }).onDelete("set null"),
  ],
);

export const organisationUnitMemberships = mysqlTable(
  "organisation_unit_memberships",
  {
    unitId: varchar("unit_id", { length: 36 })
      .notNull()
      .references(() => organisationUnits.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 32 }).notNull(),
    joinedAt: timestamp("joined_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.unitId, table.userId], name: "organisation_unit_memberships_pk" }),
    index("organisation_unit_memberships_user_idx").on(table.userId),
  ],
);

export const learningCohorts = mysqlTable(
  "learning_cohorts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organisationId: varchar("organisation_id", { length: 36 })
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    unitId: varchar("unit_id", { length: 36 }).references(() => organisationUnits.id, { onDelete: "set null" }),
    name: varchar("name", { length: 140 }).notNull(),
    academicPeriod: varchar("academic_period", { length: 60 }),
    ageBand: varchar("age_band", { length: 40 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    startsAt: timestamp("starts_at", { mode: "string", fsp: 3 }),
    endsAt: timestamp("ends_at", { mode: "string", fsp: 3 }),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [index("learning_cohorts_org_status_idx").on(table.organisationId, table.status)],
);

export const cohortMemberships = mysqlTable(
  "cohort_memberships",
  {
    cohortId: varchar("cohort_id", { length: 36 })
      .notNull()
      .references(() => learningCohorts.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 24 }).notNull().default("learner"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    joinedAt: timestamp("joined_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.cohortId, table.userId], name: "cohort_memberships_pk" }),
    index("cohort_memberships_user_idx").on(table.userId),
  ],
);

// Rights, provenance and authorities -----------------------------------------

export const contentLicenses = mysqlTable(
  "content_licenses",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organisationId: varchar("organisation_id", { length: 36 }).references(() => organisations.id, { onDelete: "set null" }),
    code: varchar("code", { length: 80 }).notNull(),
    name: varchar("name", { length: 180 }).notNull(),
    rightsHolder: varchar("rights_holder", { length: 180 }),
    termsUrl: varchar("terms_url", { length: 1024 }),
    permittedUses: json("permitted_uses").$type<JsonObject>(),
    startsAt: timestamp("starts_at", { mode: "string", fsp: 3 }),
    expiresAt: timestamp("expires_at", { mode: "string", fsp: 3 }),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("content_licenses_code_unique").on(table.code)],
);

export const sourceDocuments = mysqlTable(
  "source_documents",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organisationId: varchar("organisation_id", { length: 36 }).references(() => organisations.id, { onDelete: "set null" }),
    licenseId: varchar("license_id", { length: 36 }).references(() => contentLicenses.id, { onDelete: "set null" }),
    title: varchar("title", { length: 255 }).notNull(),
    author: varchar("author", { length: 180 }),
    publisher: varchar("publisher", { length: 180 }),
    publicationYear: int("publication_year", { unsigned: true }),
    isbn: varchar("isbn", { length: 32 }),
    sourceUrl: varchar("source_url", { length: 1024 }),
    storageKey: varchar("storage_key", { length: 512 }),
    checksumSha256: char("checksum_sha256", { length: 64 }),
    rightsStatus: varchar("rights_status", { length: 24 }).notNull().default("review-required"),
    citation: text("citation"),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [index("source_documents_org_rights_idx").on(table.organisationId, table.rightsStatus)],
);

export const persons = mysqlTable(
  "persons",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    slug: varchar("slug", { length: 100 }).notNull(),
    canonicalName: varchar("canonical_name", { length: 180 }).notNull(),
    personType: varchar("person_type", { length: 32 }).notNull().default("author"),
    birthYear: int("birth_year"),
    deathYear: int("death_year"),
    notes: text("notes"),
  },
  (table) => [uniqueIndex("persons_slug_unique").on(table.slug)],
);

export const personNames = mysqlTable(
  "person_names",
  {
    personId: varchar("person_id", { length: 36 })
      .notNull()
      .references(() => persons.id, { onDelete: "cascade" }),
    languageCode: varchar("language_code", { length: 12 })
      .notNull()
      .references(() => languages.code),
    displayName: varchar("display_name", { length: 180 }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.personId, table.languageCode], name: "person_names_pk" })],
);

export const commentaryTraditions = mysqlTable(
  "commentary_traditions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    slug: varchar("slug", { length: 100 }).notNull(),
    canonicalName: varchar("canonical_name", { length: 160 }).notNull(),
    description: text("description"),
  },
  (table) => [uniqueIndex("commentary_traditions_slug_unique").on(table.slug)],
);

// Canonical scripture and organisation-controlled editions -------------------

export const scriptureWorks = mysqlTable(
  "scripture_works",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    slug: varchar("slug", { length: 100 }).notNull(),
    canonicalTitle: varchar("canonical_title", { length: 180 }).notNull(),
    workType: varchar("work_type", { length: 40 }).notNull().default("scripture"),
    canonicalLanguageCode: varchar("canonical_language_code", { length: 12 }).references(() => languages.code),
    chapterCount: int("chapter_count", { unsigned: true }),
    verseCount: int("verse_count", { unsigned: true }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("scripture_works_slug_unique").on(table.slug)],
);

export const scriptureWorkNames = mysqlTable(
  "scripture_work_names",
  {
    workId: varchar("work_id", { length: 36 })
      .notNull()
      .references(() => scriptureWorks.id, { onDelete: "cascade" }),
    languageCode: varchar("language_code", { length: 12 })
      .notNull()
      .references(() => languages.code),
    title: varchar("title", { length: 180 }).notNull(),
    shortDescription: text("short_description"),
  },
  (table) => [primaryKey({ columns: [table.workId, table.languageCode], name: "scripture_work_names_pk" })],
);

export const scriptureChapters = mysqlTable(
  "scripture_chapters",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    workId: varchar("work_id", { length: 36 })
      .notNull()
      .references(() => scriptureWorks.id, { onDelete: "cascade" }),
    chapterNumber: int("chapter_number", { unsigned: true }).notNull(),
    canonicalTitle: varchar("canonical_title", { length: 180 }),
    verseCount: int("verse_count", { unsigned: true }),
    sortOrder: int("sort_order", { unsigned: true }).notNull(),
  },
  (table) => [
    uniqueIndex("scripture_chapters_work_number_unique").on(table.workId, table.chapterNumber),
    index("scripture_chapters_work_sort_idx").on(table.workId, table.sortOrder),
  ],
);

export const scriptureChapterLocalizations = mysqlTable(
  "scripture_chapter_localizations",
  {
    chapterId: varchar("chapter_id", { length: 36 }).notNull(),
    languageCode: varchar("language_code", { length: 12 })
      .notNull()
      .references(() => languages.code),
    title: varchar("title", { length: 180 }).notNull(),
    focus: text("focus"),
    essentialQuestion: text("essential_question"),
  },
  (table) => [
    primaryKey({ columns: [table.chapterId, table.languageCode], name: "scripture_chapter_localizations_pk" }),
    foreignKey({
      name: "fk_chapter_l10n_chapter",
      columns: [table.chapterId],
      foreignColumns: [scriptureChapters.id],
    }).onDelete("cascade"),
  ],
);

export const scriptureVerses = mysqlTable(
  "scripture_verses",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    chapterId: varchar("chapter_id", { length: 36 })
      .notNull()
      .references(() => scriptureChapters.id, { onDelete: "cascade" }),
    verseNumber: varchar("verse_number", { length: 20 }).notNull(),
    canonicalReference: varchar("canonical_reference", { length: 40 }).notNull(),
    sortOrder: int("sort_order", { unsigned: true }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("active"),
  },
  (table) => [
    uniqueIndex("scripture_verses_reference_unique").on(table.canonicalReference),
    uniqueIndex("scripture_verses_chapter_number_unique").on(table.chapterId, table.verseNumber),
    index("scripture_verses_chapter_sort_idx").on(table.chapterId, table.sortOrder),
  ],
);

export const scriptureEditions = mysqlTable(
  "scripture_editions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    workId: varchar("work_id", { length: 36 })
      .notNull()
      .references(() => scriptureWorks.id, { onDelete: "restrict" }),
    ownerOrganisationId: varchar("owner_organisation_id", { length: 36 })
      .notNull()
      .references(() => organisations.id, { onDelete: "restrict" }),
    slug: varchar("slug", { length: 120 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    authorityStatement: text("authority_statement"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string", fsp: 3 }).notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("scripture_editions_owner_slug_unique").on(table.ownerOrganisationId, table.slug),
    index("scripture_editions_work_idx").on(table.workId),
  ],
);

export const scriptureEditionReleases = mysqlTable(
  "scripture_edition_releases",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    editionId: varchar("edition_id", { length: 36 })
      .notNull()
      .references(() => scriptureEditions.id, { onDelete: "cascade" }),
    versionLabel: varchar("version_label", { length: 60 }).notNull(),
    publicationStatus: varchar("publication_status", { length: 20 }).notNull().default("draft"),
    sourceDocumentId: varchar("source_document_id", { length: 36 }),
    licenseId: varchar("license_id", { length: 36 }).references(() => contentLicenses.id, { onDelete: "set null" }),
    contentChecksum: char("content_checksum", { length: 64 }),
    releaseNotes: text("release_notes"),
    publishedAt: timestamp("published_at", { mode: "string", fsp: 3 }),
    supersededAt: timestamp("superseded_at", { mode: "string", fsp: 3 }),
    retractedAt: timestamp("retracted_at", { mode: "string", fsp: 3 }),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("scripture_releases_edition_version_unique").on(table.editionId, table.versionLabel),
    index("scripture_releases_status_idx").on(table.editionId, table.publicationStatus),
    foreignKey({
      name: "fk_scripture_release_source",
      columns: [table.sourceDocumentId],
      foreignColumns: [sourceDocuments.id],
    }).onDelete("set null"),
  ],
);

export const publicationProfiles = mysqlTable(
  "publication_profiles",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organisationId: varchar("organisation_id", { length: 36 })
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 100 }).notNull(),
    name: varchar("name", { length: 180 }).notNull(),
    audienceType: varchar("audience_type", { length: 32 }).notNull().default("general"),
    jurisdictionCode: varchar("jurisdiction_code", { length: 20 }),
    defaultLanguageCode: varchar("default_language_code", { length: 12 }).references(() => languages.code),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    settings: json("settings").$type<JsonObject>(),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string", fsp: 3 }).notNull().defaultNow().onUpdateNow(),
  },
  (table) => [uniqueIndex("publication_profiles_org_slug_unique").on(table.organisationId, table.slug)],
);

export const publicationScriptureReleases = mysqlTable(
  "publication_scripture_releases",
  {
    publicationProfileId: varchar("publication_profile_id", { length: 36 }).notNull(),
    workId: varchar("work_id", { length: 36 })
      .notNull()
      .references(() => scriptureWorks.id, { onDelete: "restrict" }),
    editionReleaseId: varchar("edition_release_id", { length: 36 }).notNull(),
    isDefault: boolean("is_default").notNull().default(true),
  },
  (table) => [
    primaryKey({ columns: [table.publicationProfileId, table.workId], name: "publication_scripture_releases_pk" }),
    index("publication_scripture_release_idx").on(table.editionReleaseId),
    foreignKey({
      name: "fk_pub_scripture_profile",
      columns: [table.publicationProfileId],
      foreignColumns: [publicationProfiles.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "fk_pub_scripture_release",
      columns: [table.editionReleaseId],
      foreignColumns: [scriptureEditionReleases.id],
    }).onDelete("restrict"),
  ],
);

export const verseTexts = mysqlTable(
  "verse_texts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    editionReleaseId: varchar("edition_release_id", { length: 36 })
      .notNull()
      .references(() => scriptureEditionReleases.id, { onDelete: "cascade" }),
    verseId: varchar("verse_id", { length: 36 })
      .notNull()
      .references(() => scriptureVerses.id, { onDelete: "cascade" }),
    languageCode: varchar("language_code", { length: 12 })
      .notNull()
      .references(() => languages.code),
    scriptCode: varchar("script_code", { length: 8 })
      .notNull()
      .references(() => writingScripts.code),
    representation: varchar("representation", { length: 32 }).notNull(),
    text: text("text").notNull(),
    lineBreaks: json("line_breaks").$type<number[]>(),
    metre: varchar("metre", { length: 120 }),
    pronunciationGuide: text("pronunciation_guide"),
    sourceLocator: varchar("source_locator", { length: 255 }),
    editorialStatus: varchar("editorial_status", { length: 20 }).notNull().default("draft"),
    updatedAt: timestamp("updated_at", { mode: "string", fsp: 3 }).notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("verse_texts_release_verse_render_unique").on(
      table.editionReleaseId,
      table.verseId,
      table.languageCode,
      table.scriptCode,
      table.representation,
    ),
    index("verse_texts_verse_language_idx").on(table.verseId, table.languageCode),
  ],
);

export const verseSandhiAnalyses = mysqlTable(
  "verse_sandhi_analyses",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    editionReleaseId: varchar("edition_release_id", { length: 36 }).notNull(),
    verseId: varchar("verse_id", { length: 36 })
      .notNull()
      .references(() => scriptureVerses.id, { onDelete: "cascade" }),
    analysisType: varchar("analysis_type", { length: 32 }).notNull().default("sandhi-vicheda"),
    versionLabel: varchar("version_label", { length: 60 }).notNull(),
    editorPersonId: varchar("editor_person_id", { length: 36 }).references(() => persons.id, { onDelete: "set null" }),
    editorialStatus: varchar("editorial_status", { length: 20 }).notNull().default("draft"),
    sourceLocator: varchar("source_locator", { length: 255 }),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("verse_sandhi_release_verse_version_unique").on(
      table.editionReleaseId,
      table.verseId,
      table.analysisType,
      table.versionLabel,
    ),
    index("verse_sandhi_verse_idx").on(table.verseId),
    foreignKey({
      name: "fk_sandhi_scripture_release",
      columns: [table.editionReleaseId],
      foreignColumns: [scriptureEditionReleases.id],
    }).onDelete("cascade"),
  ],
);

export const verseTokens = mysqlTable(
  "verse_tokens",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    analysisId: varchar("analysis_id", { length: 36 })
      .notNull()
      .references(() => verseSandhiAnalyses.id, { onDelete: "cascade" }),
    position: int("position", { unsigned: true }).notNull(),
    padaNumber: int("pada_number", { unsigned: true }),
    lemmaKey: varchar("lemma_key", { length: 160 }),
    grammar: json("grammar").$type<JsonObject>(),
  },
  (table) => [uniqueIndex("verse_tokens_analysis_position_unique").on(table.analysisId, table.position)],
);

export const verseTokenForms = mysqlTable(
  "verse_token_forms",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tokenId: varchar("token_id", { length: 36 })
      .notNull()
      .references(() => verseTokens.id, { onDelete: "cascade" }),
    languageCode: varchar("language_code", { length: 12 })
      .notNull()
      .references(() => languages.code),
    scriptCode: varchar("script_code", { length: 8 })
      .notNull()
      .references(() => writingScripts.code),
    formType: varchar("form_type", { length: 24 }).notNull(),
    text: varchar("text", { length: 255 }).notNull(),
  },
  (table) => [
    uniqueIndex("verse_token_forms_token_render_unique").on(
      table.tokenId,
      table.languageCode,
      table.scriptCode,
      table.formType,
    ),
  ],
);

export const verseTokenMeanings = mysqlTable(
  "verse_token_meanings",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tokenId: varchar("token_id", { length: 36 })
      .notNull()
      .references(() => verseTokens.id, { onDelete: "cascade" }),
    languageCode: varchar("language_code", { length: 12 })
      .notNull()
      .references(() => languages.code),
    senseNumber: int("sense_number", { unsigned: true }).notNull().default(1),
    meaning: varchar("meaning", { length: 500 }).notNull(),
    grammaticalNote: varchar("grammatical_note", { length: 500 }),
    editorialStatus: varchar("editorial_status", { length: 20 }).notNull().default("draft"),
  },
  (table) => [
    uniqueIndex("verse_token_meanings_token_language_unique").on(table.tokenId, table.languageCode, table.senseNumber),
    index("verse_token_meanings_language_idx").on(table.languageCode),
  ],
);

export const verseTranslations = mysqlTable(
  "verse_translations",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    editionReleaseId: varchar("edition_release_id", { length: 36 }).notNull(),
    verseId: varchar("verse_id", { length: 36 })
      .notNull()
      .references(() => scriptureVerses.id, { onDelete: "cascade" }),
    languageCode: varchar("language_code", { length: 12 })
      .notNull()
      .references(() => languages.code),
    translationKey: varchar("translation_key", { length: 40 }).notNull().default("primary"),
    translatorPersonId: varchar("translator_person_id", { length: 36 }).references(() => persons.id, { onDelete: "set null" }),
    text: text("text").notNull(),
    sourceLocator: varchar("source_locator", { length: 255 }),
    editorialStatus: varchar("editorial_status", { length: 20 }).notNull().default("draft"),
    updatedAt: timestamp("updated_at", { mode: "string", fsp: 3 }).notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("verse_translations_release_verse_language_unique").on(
      table.editionReleaseId,
      table.verseId,
      table.languageCode,
      table.translationKey,
    ),
    index("verse_translations_verse_language_idx").on(table.verseId, table.languageCode),
    foreignKey({
      name: "fk_verse_translation_release",
      columns: [table.editionReleaseId],
      foreignColumns: [scriptureEditionReleases.id],
    }).onDelete("cascade"),
  ],
);

export const verseLearningNotes = mysqlTable(
  "verse_learning_notes",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    editionReleaseId: varchar("edition_release_id", { length: 36 }).notNull(),
    verseId: varchar("verse_id", { length: 36 })
      .notNull()
      .references(() => scriptureVerses.id, { onDelete: "cascade" }),
    languageCode: varchar("language_code", { length: 12 })
      .notNull()
      .references(() => languages.code),
    noteType: varchar("note_type", { length: 32 }).notNull(),
    sequence: int("sequence", { unsigned: true }).notNull().default(1),
    title: varchar("title", { length: 180 }),
    text: text("text").notNull(),
    editorialStatus: varchar("editorial_status", { length: 20 }).notNull().default("draft"),
  },
  (table) => [
    uniqueIndex("verse_learning_notes_unique").on(
      table.editionReleaseId,
      table.verseId,
      table.languageCode,
      table.noteType,
      table.sequence,
    ),
    foreignKey({
      name: "fk_verse_note_release",
      columns: [table.editionReleaseId],
      foreignColumns: [scriptureEditionReleases.id],
    }).onDelete("cascade"),
  ],
);

// Bhāṣya and guru-specific commentary ----------------------------------------

export const commentaryWorks = mysqlTable(
  "commentary_works",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    scriptureWorkId: varchar("scripture_work_id", { length: 36 })
      .notNull()
      .references(() => scriptureWorks.id, { onDelete: "restrict" }),
    commentatorPersonId: varchar("commentator_person_id", { length: 36 })
      .notNull()
      .references(() => persons.id, { onDelete: "restrict" }),
    traditionId: varchar("tradition_id", { length: 36 }).references(() => commentaryTraditions.id, { onDelete: "set null" }),
    slug: varchar("slug", { length: 120 }).notNull(),
    canonicalTitle: varchar("canonical_title", { length: 220 }).notNull(),
    originalLanguageCode: varchar("original_language_code", { length: 12 }).references(() => languages.code),
    sourceDocumentId: varchar("source_document_id", { length: 36 }).references(() => sourceDocuments.id, { onDelete: "set null" }),
  },
  (table) => [uniqueIndex("commentary_works_scripture_slug_unique").on(table.scriptureWorkId, table.slug)],
);

export const commentaryEditions = mysqlTable(
  "commentary_editions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    commentaryWorkId: varchar("commentary_work_id", { length: 36 })
      .notNull()
      .references(() => commentaryWorks.id, { onDelete: "cascade" }),
    ownerOrganisationId: varchar("owner_organisation_id", { length: 36 })
      .notNull()
      .references(() => organisations.id, { onDelete: "restrict" }),
    languageCode: varchar("language_code", { length: 12 })
      .notNull()
      .references(() => languages.code),
    title: varchar("title", { length: 220 }).notNull(),
    versionLabel: varchar("version_label", { length: 60 }).notNull(),
    passageMode: varchar("passage_mode", { length: 24 }).notNull().default("summary"),
    licenseId: varchar("license_id", { length: 36 }).references(() => contentLicenses.id, { onDelete: "set null" }),
    sourceDocumentId: varchar("source_document_id", { length: 36 }).references(() => sourceDocuments.id, { onDelete: "set null" }),
    publicationStatus: varchar("publication_status", { length: 20 }).notNull().default("draft"),
    contentChecksum: char("content_checksum", { length: 64 }),
    publishedAt: timestamp("published_at", { mode: "string", fsp: 3 }),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("commentary_editions_work_owner_language_version_unique").on(
      table.commentaryWorkId,
      table.ownerOrganisationId,
      table.languageCode,
      table.versionLabel,
    ),
    index("commentary_editions_owner_status_idx").on(table.ownerOrganisationId, table.publicationStatus),
  ],
);

export const commentaryPassages = mysqlTable(
  "commentary_passages",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    commentaryEditionId: varchar("commentary_edition_id", { length: 36 }).notNull(),
    verseId: varchar("verse_id", { length: 36 })
      .notNull()
      .references(() => scriptureVerses.id, { onDelete: "cascade" }),
    passageType: varchar("passage_type", { length: 24 }).notNull().default("summary"),
    text: text("text").notNull(),
    sourceLocator: varchar("source_locator", { length: 255 }),
    editorialStatus: varchar("editorial_status", { length: 20 }).notNull().default("draft"),
    updatedAt: timestamp("updated_at", { mode: "string", fsp: 3 }).notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("commentary_passages_edition_verse_type_unique").on(
      table.commentaryEditionId,
      table.verseId,
      table.passageType,
    ),
    index("commentary_passages_verse_idx").on(table.verseId),
    foreignKey({
      name: "fk_commentary_passage_edition",
      columns: [table.commentaryEditionId],
      foreignColumns: [commentaryEditions.id],
    }).onDelete("cascade"),
  ],
);

export const publicationCommentaryEditions = mysqlTable(
  "publication_commentary_editions",
  {
    publicationProfileId: varchar("publication_profile_id", { length: 36 }).notNull(),
    commentaryEditionId: varchar("commentary_edition_id", { length: 36 }).notNull(),
    displayOrder: int("display_order", { unsigned: true }).notNull().default(1),
    isEnabled: boolean("is_enabled").notNull().default(true),
  },
  (table) => [
    primaryKey({ columns: [table.publicationProfileId, table.commentaryEditionId], name: "publication_commentary_editions_pk" }),
    index("publication_commentary_order_idx").on(table.publicationProfileId, table.displayOrder),
    foreignKey({
      name: "fk_pub_commentary_profile",
      columns: [table.publicationProfileId],
      foreignColumns: [publicationProfiles.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "fk_pub_commentary_edition",
      columns: [table.commentaryEditionId],
      foreignColumns: [commentaryEditions.id],
    }).onDelete("restrict"),
  ],
);

// Media metadata. Binary files belong in object storage, not MySQL. -----------

export const mediaAssets = mysqlTable(
  "media_assets",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    ownerOrganisationId: varchar("owner_organisation_id", { length: 36 })
      .notNull()
      .references(() => organisations.id, { onDelete: "restrict" }),
    licenseId: varchar("license_id", { length: 36 }).references(() => contentLicenses.id, { onDelete: "set null" }),
    languageCode: varchar("language_code", { length: 12 }).references(() => languages.code),
    assetType: varchar("asset_type", { length: 32 }).notNull(),
    title: varchar("title", { length: 220 }).notNull(),
    storageProvider: varchar("storage_provider", { length: 32 }).notNull(),
    storageKey: varchar("storage_key", { length: 512 }).notNull(),
    mimeType: varchar("mime_type", { length: 120 }).notNull(),
    byteSize: int("byte_size", { unsigned: true }),
    durationSeconds: int("duration_seconds", { unsigned: true }),
    checksumSha256: char("checksum_sha256", { length: 64 }),
    accessibility: json("accessibility").$type<JsonObject>(),
    metadata: json("metadata").$type<JsonObject>(),
    publicationStatus: varchar("publication_status", { length: 20 }).notNull().default("draft"),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string", fsp: 3 }).notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("media_assets_owner_storage_unique").on(table.ownerOrganisationId, table.storageKey),
    index("media_assets_owner_type_status_idx").on(table.ownerOrganisationId, table.assetType, table.publicationStatus),
  ],
);

export const mediaTextTracks = mysqlTable(
  "media_text_tracks",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    mediaAssetId: varchar("media_asset_id", { length: 36 })
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    languageCode: varchar("language_code", { length: 12 })
      .notNull()
      .references(() => languages.code),
    trackType: varchar("track_type", { length: 24 }).notNull(),
    storageKey: varchar("storage_key", { length: 512 }),
    text: text("text"),
    isDefault: boolean("is_default").notNull().default(false),
  },
  (table) => [uniqueIndex("media_text_tracks_asset_language_type_unique").on(table.mediaAssetId, table.languageCode, table.trackType)],
);

export const mediaAttachments = mysqlTable(
  "media_attachments",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    mediaAssetId: varchar("media_asset_id", { length: 36 })
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 40 }).notNull(),
    entityId: varchar("entity_id", { length: 36 }).notNull(),
    attachmentRole: varchar("attachment_role", { length: 32 }).notNull(),
    displayOrder: int("display_order", { unsigned: true }).notNull().default(1),
  },
  (table) => [
    uniqueIndex("media_attachments_entity_role_order_unique").on(
      table.entityType,
      table.entityId,
      table.attachmentRole,
      table.displayOrder,
    ),
    index("media_attachments_asset_idx").on(table.mediaAssetId),
  ],
);

// Curriculum composition and reusable learning pathways ----------------------

export const courses = mysqlTable(
  "courses",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    ownerOrganisationId: varchar("owner_organisation_id", { length: 36 })
      .notNull()
      .references(() => organisations.id, { onDelete: "restrict" }),
    publicationProfileId: varchar("publication_profile_id", { length: 36 })
      .notNull()
      .references(() => publicationProfiles.id, { onDelete: "restrict" }),
    scriptureWorkId: varchar("scripture_work_id", { length: 36 }).references(() => scriptureWorks.id, { onDelete: "set null" }),
    slug: varchar("slug", { length: 120 }).notNull(),
    courseType: varchar("course_type", { length: 32 }).notNull().default("self-paced"),
    audienceType: varchar("audience_type", { length: 32 }).notNull().default("general"),
    minimumAge: int("minimum_age", { unsigned: true }),
    maximumAge: int("maximum_age", { unsigned: true }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string", fsp: 3 }).notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("courses_owner_slug_unique").on(table.ownerOrganisationId, table.slug),
    index("courses_profile_status_idx").on(table.publicationProfileId, table.status),
  ],
);

export const courseLocalizations = mysqlTable(
  "course_localizations",
  {
    courseId: varchar("course_id", { length: 36 })
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    languageCode: varchar("language_code", { length: 12 })
      .notNull()
      .references(() => languages.code),
    title: varchar("title", { length: 220 }).notNull(),
    shortDescription: text("short_description"),
    fullDescription: text("full_description"),
    learningOutcomes: json("learning_outcomes").$type<string[]>(),
  },
  (table) => [primaryKey({ columns: [table.courseId, table.languageCode], name: "course_localizations_pk" })],
);

export const courseReleases = mysqlTable(
  "course_releases",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    courseId: varchar("course_id", { length: 36 })
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    versionLabel: varchar("version_label", { length: 60 }).notNull(),
    defaultScriptureReleaseId: varchar("default_scripture_release_id", { length: 36 }),
    publicationStatus: varchar("publication_status", { length: 20 }).notNull().default("draft"),
    passingPercentage: int("passing_percentage", { unsigned: true }).notNull().default(60),
    estimatedMinutes: int("estimated_minutes", { unsigned: true }),
    contentChecksum: char("content_checksum", { length: 64 }),
    releaseNotes: text("release_notes"),
    publishedAt: timestamp("published_at", { mode: "string", fsp: 3 }),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("course_releases_course_version_unique").on(table.courseId, table.versionLabel),
    index("course_releases_status_idx").on(table.courseId, table.publicationStatus),
    foreignKey({
      name: "fk_course_release_scripture",
      columns: [table.defaultScriptureReleaseId],
      foreignColumns: [scriptureEditionReleases.id],
    }).onDelete("set null"),
  ],
);

export const courseModules = mysqlTable(
  "course_modules",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    courseReleaseId: varchar("course_release_id", { length: 36 })
      .notNull()
      .references(() => courseReleases.id, { onDelete: "cascade" }),
    scriptureChapterId: varchar("scripture_chapter_id", { length: 36 }).references(() => scriptureChapters.id, { onDelete: "set null" }),
    slug: varchar("slug", { length: 120 }).notNull(),
    moduleType: varchar("module_type", { length: 32 }).notNull(),
    sequence: int("sequence", { unsigned: true }).notNull(),
    isRequired: boolean("is_required").notNull().default(true),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
  },
  (table) => [
    uniqueIndex("course_modules_release_slug_unique").on(table.courseReleaseId, table.slug),
    uniqueIndex("course_modules_release_sequence_unique").on(table.courseReleaseId, table.sequence),
  ],
);

export const courseModuleLocalizations = mysqlTable(
  "course_module_localizations",
  {
    moduleId: varchar("module_id", { length: 36 })
      .notNull()
      .references(() => courseModules.id, { onDelete: "cascade" }),
    languageCode: varchar("language_code", { length: 12 })
      .notNull()
      .references(() => languages.code),
    title: varchar("title", { length: 220 }).notNull(),
    description: text("description"),
    essentialQuestion: text("essential_question"),
  },
  (table) => [primaryKey({ columns: [table.moduleId, table.languageCode], name: "course_module_localizations_pk" })],
);

export const lessons = mysqlTable(
  "lessons",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    moduleId: varchar("module_id", { length: 36 })
      .notNull()
      .references(() => courseModules.id, { onDelete: "cascade" }),
    scriptureVerseId: varchar("scripture_verse_id", { length: 36 }).references(() => scriptureVerses.id, { onDelete: "set null" }),
    slug: varchar("slug", { length: 120 }).notNull(),
    lessonType: varchar("lesson_type", { length: 32 }).notNull(),
    sequence: int("sequence", { unsigned: true }).notNull(),
    estimatedMinutes: int("estimated_minutes", { unsigned: true }),
    isRequired: boolean("is_required").notNull().default(true),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
  },
  (table) => [
    uniqueIndex("lessons_module_slug_unique").on(table.moduleId, table.slug),
    uniqueIndex("lessons_module_sequence_unique").on(table.moduleId, table.sequence),
    index("lessons_scripture_verse_idx").on(table.scriptureVerseId),
  ],
);

export const lessonLocalizations = mysqlTable(
  "lesson_localizations",
  {
    lessonId: varchar("lesson_id", { length: 36 })
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    languageCode: varchar("language_code", { length: 12 })
      .notNull()
      .references(() => languages.code),
    title: varchar("title", { length: 220 }).notNull(),
    objective: text("objective"),
    sceneContext: text("scene_context"),
    completionMessage: text("completion_message"),
  },
  (table) => [primaryKey({ columns: [table.lessonId, table.languageCode], name: "lesson_localizations_pk" })],
);

export const lessonContentBlocks = mysqlTable(
  "lesson_content_blocks",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    lessonId: varchar("lesson_id", { length: 36 })
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    blockType: varchar("block_type", { length: 40 }).notNull(),
    sequence: int("sequence", { unsigned: true }).notNull(),
    sourceEntityType: varchar("source_entity_type", { length: 40 }),
    sourceEntityId: varchar("source_entity_id", { length: 36 }),
    requiredForCompletion: boolean("required_for_completion").notNull().default(false),
    configuration: json("configuration").$type<JsonObject>(),
  },
  (table) => [
    uniqueIndex("lesson_content_blocks_lesson_sequence_unique").on(table.lessonId, table.sequence),
    index("lesson_content_blocks_source_idx").on(table.sourceEntityType, table.sourceEntityId),
  ],
);

export const lessonPrerequisites = mysqlTable(
  "lesson_prerequisites",
  {
    lessonId: varchar("lesson_id", { length: 36 })
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    prerequisiteLessonId: varchar("prerequisite_lesson_id", { length: 36 })
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    ruleType: varchar("rule_type", { length: 24 }).notNull().default("complete"),
  },
  (table) => [primaryKey({ columns: [table.lessonId, table.prerequisiteLessonId], name: "lesson_prerequisites_pk" })],
);

export const cohortCourseAssignments = mysqlTable(
  "cohort_course_assignments",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    cohortId: varchar("cohort_id", { length: 36 })
      .notNull()
      .references(() => learningCohorts.id, { onDelete: "cascade" }),
    courseReleaseId: varchar("course_release_id", { length: 36 }).notNull(),
    assignedByUserId: varchar("assigned_by_user_id", { length: 36 }).references(() => authUsers.id, { onDelete: "set null" }),
    dueAt: timestamp("due_at", { mode: "string", fsp: 3 }),
    settings: json("settings").$type<JsonObject>(),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("cohort_course_assignments_unique").on(table.cohortId, table.courseReleaseId),
    foreignKey({
      name: "fk_cohort_assignment_release",
      columns: [table.courseReleaseId],
      foreignColumns: [courseReleases.id],
    }).onDelete("restrict"),
  ],
);

// Learner profile, enrolment and progress ------------------------------------

export const learnerProfiles = mysqlTable("learner_profiles", {
  userId: varchar("user_id", { length: 36 })
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  preferredLanguageCode: varchar("preferred_language_code", { length: 12 }).references(() => languages.code),
  preferredScriptCode: varchar("preferred_script_code", { length: 8 }).references(() => writingScripts.code),
  learningMode: varchar("learning_mode", { length: 32 }).notNull().default("mixed"),
  timeZone: varchar("time_zone", { length: 64 }).notNull().default("UTC"),
  accessibilityPreferences: json("accessibility_preferences").$type<JsonObject>(),
  birthYear: int("birth_year", { unsigned: true }),
  onboardingCompletedAt: timestamp("onboarding_completed_at", { mode: "string", fsp: 3 }),
  updatedAt: timestamp("updated_at", { mode: "string", fsp: 3 }).notNull().defaultNow().onUpdateNow(),
});

export const userConsents = mysqlTable(
  "user_consents",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    organisationId: varchar("organisation_id", { length: 36 })
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    consentType: varchar("consent_type", { length: 40 }).notNull(),
    policyVersion: varchar("policy_version", { length: 60 }).notNull(),
    granted: boolean("granted").notNull(),
    grantedByUserId: varchar("granted_by_user_id", { length: 36 }).references(() => authUsers.id, { onDelete: "set null" }),
    recordedAt: timestamp("recorded_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
    withdrawnAt: timestamp("withdrawn_at", { mode: "string", fsp: 3 }),
  },
  (table) => [
    index("user_consents_user_org_type_idx").on(table.userId, table.organisationId, table.consentType),
  ],
);

export const courseEnrolments = mysqlTable(
  "course_enrolments",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organisationId: varchar("organisation_id", { length: 36 })
      .notNull()
      .references(() => organisations.id, { onDelete: "restrict" }),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    courseReleaseId: varchar("course_release_id", { length: 36 })
      .notNull()
      .references(() => courseReleases.id, { onDelete: "restrict" }),
    cohortId: varchar("cohort_id", { length: 36 }).references(() => learningCohorts.id, { onDelete: "set null" }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    progressPercent: int("progress_percent", { unsigned: true }).notNull().default(0),
    enrolledAt: timestamp("enrolled_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
    startedAt: timestamp("started_at", { mode: "string", fsp: 3 }),
    completedAt: timestamp("completed_at", { mode: "string", fsp: 3 }),
    lastActivityAt: timestamp("last_activity_at", { mode: "string", fsp: 3 }),
  },
  (table) => [
    uniqueIndex("course_enrolments_org_user_release_unique").on(table.organisationId, table.userId, table.courseReleaseId),
    index("course_enrolments_user_status_idx").on(table.userId, table.status),
    index("course_enrolments_cohort_idx").on(table.cohortId),
  ],
);

export const lessonProgress = mysqlTable(
  "lesson_progress",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    enrolmentId: varchar("enrolment_id", { length: 36 })
      .notNull()
      .references(() => courseEnrolments.id, { onDelete: "cascade" }),
    lessonId: varchar("lesson_id", { length: 36 })
      .notNull()
      .references(() => lessons.id, { onDelete: "restrict" }),
    status: varchar("status", { length: 20 }).notNull().default("not-started"),
    completionPercent: int("completion_percent", { unsigned: true }).notNull().default(0),
    timeSpentSeconds: int("time_spent_seconds", { unsigned: true }).notNull().default(0),
    resumeState: json("resume_state").$type<JsonObject>(),
    firstOpenedAt: timestamp("first_opened_at", { mode: "string", fsp: 3 }),
    lastOpenedAt: timestamp("last_opened_at", { mode: "string", fsp: 3 }),
    completedAt: timestamp("completed_at", { mode: "string", fsp: 3 }),
    updatedAt: timestamp("updated_at", { mode: "string", fsp: 3 }).notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("lesson_progress_enrolment_lesson_unique").on(table.enrolmentId, table.lessonId),
    index("lesson_progress_lesson_status_idx").on(table.lessonId, table.status),
  ],
);

export const verseProgress = mysqlTable(
  "verse_progress",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    enrolmentId: varchar("enrolment_id", { length: 36 })
      .notNull()
      .references(() => courseEnrolments.id, { onDelete: "cascade" }),
    verseId: varchar("verse_id", { length: 36 })
      .notNull()
      .references(() => scriptureVerses.id, { onDelete: "restrict" }),
    status: varchar("status", { length: 20 }).notNull().default("not-started"),
    readCount: int("read_count", { unsigned: true }).notNull().default(0),
    listenCount: int("listen_count", { unsigned: true }).notNull().default(0),
    lastLanguageCode: varchar("last_language_code", { length: 12 }).references(() => languages.code),
    firstOpenedAt: timestamp("first_opened_at", { mode: "string", fsp: 3 }),
    lastOpenedAt: timestamp("last_opened_at", { mode: "string", fsp: 3 }),
    completedAt: timestamp("completed_at", { mode: "string", fsp: 3 }),
  },
  (table) => [
    uniqueIndex("verse_progress_enrolment_verse_unique").on(table.enrolmentId, table.verseId),
    index("verse_progress_verse_status_idx").on(table.verseId, table.status),
  ],
);

export const learnerBookmarks = mysqlTable(
  "learner_bookmarks",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    organisationId: varchar("organisation_id", { length: 36 })
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 40 }).notNull(),
    entityId: varchar("entity_id", { length: 36 }).notNull(),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("learner_bookmarks_user_entity_unique").on(table.userId, table.organisationId, table.entityType, table.entityId),
  ],
);

export const learnerNotes = mysqlTable(
  "learner_notes",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    organisationId: varchar("organisation_id", { length: 36 })
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 40 }).notNull(),
    entityId: varchar("entity_id", { length: 36 }).notNull(),
    noteTextEncrypted: text("note_text_encrypted").notNull(),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string", fsp: 3 }).notNull().defaultNow().onUpdateNow(),
  },
  (table) => [index("learner_notes_user_entity_idx").on(table.userId, table.entityType, table.entityId)],
);

export const learningEvents = mysqlTable(
  "learning_events",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organisationId: varchar("organisation_id", { length: 36 })
      .notNull()
      .references(() => organisations.id, { onDelete: "restrict" }),
    userId: varchar("user_id", { length: 36 }).references(() => authUsers.id, { onDelete: "set null" }),
    enrolmentId: varchar("enrolment_id", { length: 36 }).references(() => courseEnrolments.id, { onDelete: "set null" }),
    eventType: varchar("event_type", { length: 48 }).notNull(),
    entityType: varchar("entity_type", { length: 40 }),
    entityId: varchar("entity_id", { length: 36 }),
    occurredAt: timestamp("occurred_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
    properties: json("properties").$type<JsonObject>(),
  },
  (table) => [
    index("learning_events_org_time_idx").on(table.organisationId, table.occurredAt),
    index("learning_events_user_time_idx").on(table.userId, table.occurredAt),
  ],
);

// Assessments, achievements and certificates --------------------------------

export const assessments = mysqlTable(
  "assessments",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    courseReleaseId: varchar("course_release_id", { length: 36 })
      .notNull()
      .references(() => courseReleases.id, { onDelete: "cascade" }),
    moduleId: varchar("module_id", { length: 36 }).references(() => courseModules.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 120 }).notNull(),
    assessmentType: varchar("assessment_type", { length: 32 }).notNull().default("chapter"),
    passingPercentage: int("passing_percentage", { unsigned: true }).notNull().default(60),
    maximumAttempts: int("maximum_attempts", { unsigned: true }),
    timeLimitMinutes: int("time_limit_minutes", { unsigned: true }),
    randomizeQuestions: boolean("randomize_questions").notNull().default(false),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
  },
  (table) => [
    uniqueIndex("assessments_release_slug_unique").on(table.courseReleaseId, table.slug),
    index("assessments_module_idx").on(table.moduleId),
  ],
);

export const assessmentLocalizations = mysqlTable(
  "assessment_localizations",
  {
    assessmentId: varchar("assessment_id", { length: 36 })
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    languageCode: varchar("language_code", { length: 12 })
      .notNull()
      .references(() => languages.code),
    title: varchar("title", { length: 220 }).notNull(),
    instructions: text("instructions"),
    passMessage: text("pass_message"),
    retryMessage: text("retry_message"),
  },
  (table) => [primaryKey({ columns: [table.assessmentId, table.languageCode], name: "assessment_localizations_pk" })],
);

export const assessmentQuestions = mysqlTable(
  "assessment_questions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    assessmentId: varchar("assessment_id", { length: 36 })
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    scriptureVerseId: varchar("scripture_verse_id", { length: 36 }).references(() => scriptureVerses.id, { onDelete: "set null" }),
    questionType: varchar("question_type", { length: 32 }).notNull(),
    sequence: int("sequence", { unsigned: true }).notNull(),
    points: int("points", { unsigned: true }).notNull().default(1),
    configuration: json("configuration").$type<JsonObject>(),
    status: varchar("status", { length: 20 }).notNull().default("active"),
  },
  (table) => [
    uniqueIndex("assessment_questions_assessment_sequence_unique").on(table.assessmentId, table.sequence),
    index("assessment_questions_verse_idx").on(table.scriptureVerseId),
  ],
);

export const assessmentQuestionLocalizations = mysqlTable(
  "assessment_question_localizations",
  {
    questionId: varchar("question_id", { length: 36 }).notNull(),
    languageCode: varchar("language_code", { length: 12 }).notNull(),
    prompt: text("prompt").notNull(),
    explanation: text("explanation"),
  },
  (table) => [
    primaryKey({ columns: [table.questionId, table.languageCode], name: "assessment_question_localizations_pk" }),
    foreignKey({
      name: "fk_assessment_question_l10n_question",
      columns: [table.questionId],
      foreignColumns: [assessmentQuestions.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "fk_assessment_question_l10n_language",
      columns: [table.languageCode],
      foreignColumns: [languages.code],
    }),
  ],
);

export const assessmentOptions = mysqlTable(
  "assessment_options",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    questionId: varchar("question_id", { length: 36 })
      .notNull()
      .references(() => assessmentQuestions.id, { onDelete: "cascade" }),
    sequence: int("sequence", { unsigned: true }).notNull(),
    isCorrect: boolean("is_correct").notNull().default(false),
    scoreValue: int("score_value").notNull().default(0),
  },
  (table) => [uniqueIndex("assessment_options_question_sequence_unique").on(table.questionId, table.sequence)],
);

export const assessmentOptionLocalizations = mysqlTable(
  "assessment_option_localizations",
  {
    optionId: varchar("option_id", { length: 36 }).notNull(),
    languageCode: varchar("language_code", { length: 12 })
      .notNull()
      .references(() => languages.code),
    label: text("label").notNull(),
    feedback: text("feedback"),
  },
  (table) => [
    primaryKey({ columns: [table.optionId, table.languageCode], name: "assessment_option_localizations_pk" }),
    foreignKey({
      name: "fk_assessment_option_l10n_option",
      columns: [table.optionId],
      foreignColumns: [assessmentOptions.id],
    }).onDelete("cascade"),
  ],
);

export const assessmentAttempts = mysqlTable(
  "assessment_attempts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    assessmentId: varchar("assessment_id", { length: 36 })
      .notNull()
      .references(() => assessments.id, { onDelete: "restrict" }),
    enrolmentId: varchar("enrolment_id", { length: 36 })
      .notNull()
      .references(() => courseEnrolments.id, { onDelete: "cascade" }),
    attemptNumber: int("attempt_number", { unsigned: true }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("in-progress"),
    scoreEarned: int("score_earned").notNull().default(0),
    scorePossible: int("score_possible", { unsigned: true }).notNull().default(0),
    percentage: int("percentage", { unsigned: true }),
    passed: boolean("passed"),
    startedAt: timestamp("started_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
    submittedAt: timestamp("submitted_at", { mode: "string", fsp: 3 }),
    gradedAt: timestamp("graded_at", { mode: "string", fsp: 3 }),
  },
  (table) => [
    uniqueIndex("assessment_attempts_enrolment_assessment_number_unique").on(
      table.enrolmentId,
      table.assessmentId,
      table.attemptNumber,
    ),
    index("assessment_attempts_assessment_status_idx").on(table.assessmentId, table.status),
  ],
);

export const assessmentResponses = mysqlTable(
  "assessment_responses",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    attemptId: varchar("attempt_id", { length: 36 })
      .notNull()
      .references(() => assessmentAttempts.id, { onDelete: "cascade" }),
    questionId: varchar("question_id", { length: 36 })
      .notNull()
      .references(() => assessmentQuestions.id, { onDelete: "restrict" }),
    selectedOptionId: varchar("selected_option_id", { length: 36 }).references(() => assessmentOptions.id, { onDelete: "set null" }),
    responseTextEncrypted: text("response_text_encrypted"),
    scoreAwarded: int("score_awarded").notNull().default(0),
    graderUserId: varchar("grader_user_id", { length: 36 }).references(() => authUsers.id, { onDelete: "set null" }),
    answeredAt: timestamp("answered_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("assessment_responses_attempt_question_unique").on(table.attemptId, table.questionId),
    index("assessment_responses_option_idx").on(table.selectedOptionId),
  ],
);

export const achievements = mysqlTable(
  "achievements",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organisationId: varchar("organisation_id", { length: 36 })
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 100 }).notNull(),
    achievementType: varchar("achievement_type", { length: 32 }).notNull(),
    criteria: json("criteria").$type<JsonObject>().notNull(),
    badgeMediaAssetId: varchar("badge_media_asset_id", { length: 36 }).references(() => mediaAssets.id, { onDelete: "set null" }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
  },
  (table) => [uniqueIndex("achievements_org_slug_unique").on(table.organisationId, table.slug)],
);

export const achievementLocalizations = mysqlTable(
  "achievement_localizations",
  {
    achievementId: varchar("achievement_id", { length: 36 })
      .notNull()
      .references(() => achievements.id, { onDelete: "cascade" }),
    languageCode: varchar("language_code", { length: 12 })
      .notNull()
      .references(() => languages.code),
    name: varchar("name", { length: 180 }).notNull(),
    description: text("description"),
  },
  (table) => [primaryKey({ columns: [table.achievementId, table.languageCode], name: "achievement_localizations_pk" })],
);

export const userAchievements = mysqlTable(
  "user_achievements",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    achievementId: varchar("achievement_id", { length: 36 })
      .notNull()
      .references(() => achievements.id, { onDelete: "restrict" }),
    enrolmentId: varchar("enrolment_id", { length: 36 }).references(() => courseEnrolments.id, { onDelete: "set null" }),
    awardedAt: timestamp("awarded_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
    evidence: json("evidence").$type<JsonObject>(),
  },
  (table) => [
    uniqueIndex("user_achievements_user_achievement_enrolment_unique").on(table.userId, table.achievementId, table.enrolmentId),
  ],
);

export const certificateTemplates = mysqlTable(
  "certificate_templates",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organisationId: varchar("organisation_id", { length: 36 })
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    courseId: varchar("course_id", { length: 36 }).references(() => courses.id, { onDelete: "set null" }),
    languageCode: varchar("language_code", { length: 12 }).references(() => languages.code),
    name: varchar("name", { length: 180 }).notNull(),
    versionLabel: varchar("version_label", { length: 60 }).notNull(),
    template: json("template").$type<JsonObject>().notNull(),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
  },
  (table) => [uniqueIndex("certificate_templates_org_name_version_unique").on(table.organisationId, table.name, table.versionLabel)],
);

export const certificateIssues = mysqlTable(
  "certificate_issues",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    certificateTemplateId: varchar("certificate_template_id", { length: 36 }).notNull(),
    enrolmentId: varchar("enrolment_id", { length: 36 })
      .notNull()
      .references(() => courseEnrolments.id, { onDelete: "restrict" }),
    certificateNumber: varchar("certificate_number", { length: 80 }).notNull(),
    verificationCodeHash: char("verification_code_hash", { length: 64 }).notNull(),
    snapshot: json("snapshot").$type<JsonObject>().notNull(),
    issuedAt: timestamp("issued_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
    revokedAt: timestamp("revoked_at", { mode: "string", fsp: 3 }),
    revocationReason: varchar("revocation_reason", { length: 500 }),
  },
  (table) => [
    uniqueIndex("certificate_issues_number_unique").on(table.certificateNumber),
    uniqueIndex("certificate_issues_verification_unique").on(table.verificationCodeHash),
    index("certificate_issues_enrolment_idx").on(table.enrolmentId),
    foreignKey({
      name: "fk_certificate_issue_template",
      columns: [table.certificateTemplateId],
      foreignColumns: [certificateTemplates.id],
    }).onDelete("restrict"),
  ],
);

// AI-ready, tenant-scoped knowledge and optional conversation records ---------

export const aiPolicies = mysqlTable(
  "ai_policies",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organisationId: varchar("organisation_id", { length: 36 })
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    courseReleaseId: varchar("course_release_id", { length: 36 }).references(() => courseReleases.id, { onDelete: "cascade" }),
    policyVersion: varchar("policy_version", { length: 60 }).notNull(),
    responseMode: varchar("response_mode", { length: 24 }).notNull().default("retrieval-only"),
    minimumAge: int("minimum_age", { unsigned: true }),
    allowedQuestionCategories: json("allowed_question_categories").$type<string[]>(),
    blockedQuestionCategories: json("blocked_question_categories").$type<string[]>(),
    storeConversations: boolean("store_conversations").notNull().default(false),
    retentionDays: int("retention_days", { unsigned: true }).notNull().default(0),
    providerReference: varchar("provider_reference", { length: 120 }),
    safetyConfiguration: json("safety_configuration").$type<JsonObject>(),
    enabled: boolean("enabled").notNull().default(false),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string", fsp: 3 }).notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("ai_policies_org_course_version_unique").on(table.organisationId, table.courseReleaseId, table.policyVersion),
    index("ai_policies_org_enabled_idx").on(table.organisationId, table.enabled),
  ],
);

export const aiKnowledgeSources = mysqlTable(
  "ai_knowledge_sources",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organisationId: varchar("organisation_id", { length: 36 })
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    courseReleaseId: varchar("course_release_id", { length: 36 }).references(() => courseReleases.id, { onDelete: "cascade" }),
    languageCode: varchar("language_code", { length: 12 })
      .notNull()
      .references(() => languages.code),
    sourceLayer: varchar("source_layer", { length: 32 }).notNull(),
    entityType: varchar("entity_type", { length: 40 }).notNull(),
    entityId: varchar("entity_id", { length: 36 }).notNull(),
    editionReference: varchar("edition_reference", { length: 120 }).notNull(),
    versionLabel: varchar("version_label", { length: 60 }).notNull(),
    rightsStatus: varchar("rights_status", { length: 24 }).notNull(),
    allowedAiUses: json("allowed_ai_uses").$type<string[]>(),
    contentChecksum: char("content_checksum", { length: 64 }).notNull(),
    publicationStatus: varchar("publication_status", { length: 20 }).notNull().default("draft"),
    retractedAt: timestamp("retracted_at", { mode: "string", fsp: 3 }),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("ai_knowledge_sources_entity_version_unique").on(
      table.organisationId,
      table.entityType,
      table.entityId,
      table.languageCode,
      table.versionLabel,
    ),
    index("ai_knowledge_sources_scope_status_idx").on(table.organisationId, table.courseReleaseId, table.publicationStatus),
  ],
);

export const aiKnowledgeChunks = mysqlTable(
  "ai_knowledge_chunks",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    knowledgeSourceId: varchar("knowledge_source_id", { length: 36 }).notNull(),
    sequence: int("sequence", { unsigned: true }).notNull(),
    locator: varchar("locator", { length: 255 }).notNull(),
    text: text("text").notNull(),
    tokenCount: int("token_count", { unsigned: true }),
    contentChecksum: char("content_checksum", { length: 64 }).notNull(),
    vectorIndexReference: varchar("vector_index_reference", { length: 255 }),
    metadata: json("metadata").$type<JsonObject>(),
  },
  (table) => [
    uniqueIndex("ai_knowledge_chunks_source_sequence_unique").on(table.knowledgeSourceId, table.sequence),
    index("ai_knowledge_chunks_vector_ref_idx").on(table.vectorIndexReference),
    foreignKey({
      name: "fk_ai_chunk_source",
      columns: [table.knowledgeSourceId],
      foreignColumns: [aiKnowledgeSources.id],
    }).onDelete("cascade"),
  ],
);

export const aiConversations = mysqlTable(
  "ai_conversations",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organisationId: varchar("organisation_id", { length: 36 })
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 }).references(() => authUsers.id, { onDelete: "cascade" }),
    courseReleaseId: varchar("course_release_id", { length: 36 }).references(() => courseReleases.id, { onDelete: "set null" }),
    enrolmentId: varchar("enrolment_id", { length: 36 }).references(() => courseEnrolments.id, { onDelete: "set null" }),
    languageCode: varchar("language_code", { length: 12 }).references(() => languages.code),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    startedAt: timestamp("started_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
    lastMessageAt: timestamp("last_message_at", { mode: "string", fsp: 3 }),
    retentionExpiresAt: timestamp("retention_expires_at", { mode: "string", fsp: 3 }),
    deletedAt: timestamp("deleted_at", { mode: "string", fsp: 3 }),
  },
  (table) => [
    index("ai_conversations_user_status_idx").on(table.userId, table.status),
    index("ai_conversations_retention_idx").on(table.retentionExpiresAt),
  ],
);

export const aiMessages = mysqlTable(
  "ai_messages",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    conversationId: varchar("conversation_id", { length: 36 })
      .notNull()
      .references(() => aiConversations.id, { onDelete: "cascade" }),
    parentMessageId: varchar("parent_message_id", { length: 36 }),
    role: varchar("role", { length: 20 }).notNull(),
    contentEncrypted: text("content_encrypted"),
    contentHash: char("content_hash", { length: 64 }),
    grounded: boolean("grounded"),
    responseMode: varchar("response_mode", { length: 24 }),
    providerId: varchar("provider_id", { length: 80 }),
    modelId: varchar("model_id", { length: 120 }),
    policyVersion: varchar("policy_version", { length: 60 }).notNull(),
    safetyOutcome: varchar("safety_outcome", { length: 32 }),
    usage: json("usage").$type<JsonObject>(),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [
    index("ai_messages_conversation_time_idx").on(table.conversationId, table.createdAt),
    index("ai_messages_parent_idx").on(table.parentMessageId),
    foreignKey({
      name: "fk_ai_message_parent",
      columns: [table.parentMessageId],
      foreignColumns: [table.id],
    }).onDelete("set null"),
  ],
);

export const aiMessageCitations = mysqlTable(
  "ai_message_citations",
  {
    messageId: varchar("message_id", { length: 36 })
      .notNull()
      .references(() => aiMessages.id, { onDelete: "cascade" }),
    knowledgeChunkId: varchar("knowledge_chunk_id", { length: 36 }).notNull(),
    sequence: int("sequence", { unsigned: true }).notNull(),
    claimTextHash: char("claim_text_hash", { length: 64 }),
  },
  (table) => [
    primaryKey({ columns: [table.messageId, table.knowledgeChunkId], name: "ai_message_citations_pk" }),
    uniqueIndex("ai_message_citations_message_sequence_unique").on(table.messageId, table.sequence),
    foreignKey({
      name: "fk_ai_citation_chunk",
      columns: [table.knowledgeChunkId],
      foreignColumns: [aiKnowledgeChunks.id],
    }).onDelete("restrict"),
  ],
);

export const aiFeedback = mysqlTable(
  "ai_feedback",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    messageId: varchar("message_id", { length: 36 })
      .notNull()
      .references(() => aiMessages.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 }).references(() => authUsers.id, { onDelete: "set null" }),
    rating: varchar("rating", { length: 20 }).notNull(),
    reasonCode: varchar("reason_code", { length: 40 }),
    commentEncrypted: text("comment_encrypted"),
    createdAt: timestamp("created_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("ai_feedback_message_user_unique").on(table.messageId, table.userId)],
);

// Editorial workflow, traceability and security audit ------------------------

export const contentReviews = mysqlTable(
  "content_reviews",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organisationId: varchar("organisation_id", { length: 36 })
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 40 }).notNull(),
    entityId: varchar("entity_id", { length: 36 }).notNull(),
    entityVersion: varchar("entity_version", { length: 60 }).notNull(),
    reviewType: varchar("review_type", { length: 32 }).notNull(),
    reviewerUserId: varchar("reviewer_user_id", { length: 36 }).references(() => authUsers.id, { onDelete: "set null" }),
    decision: varchar("decision", { length: 24 }).notNull(),
    commentsEncrypted: text("comments_encrypted"),
    decidedAt: timestamp("decided_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [
    index("content_reviews_entity_idx").on(table.organisationId, table.entityType, table.entityId),
    index("content_reviews_reviewer_idx").on(table.reviewerUserId, table.decidedAt),
  ],
);

export const auditEvents = mysqlTable(
  "audit_events",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organisationId: varchar("organisation_id", { length: 36 }).references(() => organisations.id, { onDelete: "set null" }),
    actorUserId: varchar("actor_user_id", { length: 36 }).references(() => authUsers.id, { onDelete: "set null" }),
    action: varchar("action", { length: 80 }).notNull(),
    entityType: varchar("entity_type", { length: 40 }).notNull(),
    entityId: varchar("entity_id", { length: 36 }),
    requestId: varchar("request_id", { length: 80 }),
    ipHash: char("ip_hash", { length: 64 }),
    details: json("details").$type<JsonObject>(),
    occurredAt: timestamp("occurred_at", { mode: "string", fsp: 3 }).notNull().defaultNow(),
  },
  (table) => [
    index("audit_events_org_time_idx").on(table.organisationId, table.occurredAt),
    index("audit_events_entity_idx").on(table.entityType, table.entityId),
    index("audit_events_actor_time_idx").on(table.actorUserId, table.occurredAt),
  ],
);
