-- Living Bliss learning-platform schema.
-- Prerequisite: database/queries/002_create_authentication.sql.
-- The target database must use MySQL 8+ with utf8mb4 as its default character set.
-- Millisecond updated_at columns use CURRENT_TIMESTAMP(3) explicitly because
-- MySQL requires matching fractional-second precision in DEFAULT and ON UPDATE.
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;--> statement-breakpoint
SET time_zone = '+00:00';--> statement-breakpoint
CREATE TABLE `achievement_localizations` (
	`achievement_id` varchar(36) NOT NULL,
	`language_code` varchar(12) NOT NULL,
	`name` varchar(180) NOT NULL,
	`description` text,
	CONSTRAINT `achievement_localizations_pk` PRIMARY KEY(`achievement_id`,`language_code`)
);
--> statement-breakpoint
CREATE TABLE `achievements` (
	`id` varchar(36) NOT NULL,
	`organisation_id` varchar(36) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`achievement_type` varchar(32) NOT NULL,
	`criteria` json NOT NULL,
	`badge_media_asset_id` varchar(36),
	`status` varchar(20) NOT NULL DEFAULT 'active',
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`),
	CONSTRAINT `achievements_org_slug_unique` UNIQUE(`organisation_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `ai_conversations` (
	`id` varchar(36) NOT NULL,
	`organisation_id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`course_release_id` varchar(36),
	`enrolment_id` varchar(36),
	`language_code` varchar(12),
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`started_at` timestamp(3) NOT NULL DEFAULT (now()),
	`last_message_at` timestamp(3),
	`retention_expires_at` timestamp(3),
	`deleted_at` timestamp(3),
	CONSTRAINT `ai_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_feedback` (
	`id` varchar(36) NOT NULL,
	`message_id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`rating` varchar(20) NOT NULL,
	`reason_code` varchar(40),
	`comment_encrypted` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_feedback_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_feedback_message_user_unique` UNIQUE(`message_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `ai_knowledge_chunks` (
	`id` varchar(36) NOT NULL,
	`knowledge_source_id` varchar(36) NOT NULL,
	`sequence` int unsigned NOT NULL,
	`locator` varchar(255) NOT NULL,
	`text` text NOT NULL,
	`token_count` int unsigned,
	`content_checksum` char(64) NOT NULL,
	`vector_index_reference` varchar(255),
	`metadata` json,
	CONSTRAINT `ai_knowledge_chunks_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_knowledge_chunks_source_sequence_unique` UNIQUE(`knowledge_source_id`,`sequence`)
);
--> statement-breakpoint
CREATE TABLE `ai_knowledge_sources` (
	`id` varchar(36) NOT NULL,
	`organisation_id` varchar(36) NOT NULL,
	`course_release_id` varchar(36),
	`language_code` varchar(12) NOT NULL,
	`source_layer` varchar(32) NOT NULL,
	`entity_type` varchar(40) NOT NULL,
	`entity_id` varchar(36) NOT NULL,
	`edition_reference` varchar(120) NOT NULL,
	`version_label` varchar(60) NOT NULL,
	`rights_status` varchar(24) NOT NULL,
	`allowed_ai_uses` json,
	`content_checksum` char(64) NOT NULL,
	`publication_status` varchar(20) NOT NULL DEFAULT 'draft',
	`retracted_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_knowledge_sources_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_knowledge_sources_entity_version_unique` UNIQUE(`organisation_id`,`entity_type`,`entity_id`,`language_code`,`version_label`)
);
--> statement-breakpoint
CREATE TABLE `ai_message_citations` (
	`message_id` varchar(36) NOT NULL,
	`knowledge_chunk_id` varchar(36) NOT NULL,
	`sequence` int unsigned NOT NULL,
	`claim_text_hash` char(64),
	CONSTRAINT `ai_message_citations_pk` PRIMARY KEY(`message_id`,`knowledge_chunk_id`),
	CONSTRAINT `ai_message_citations_message_sequence_unique` UNIQUE(`message_id`,`sequence`)
);
--> statement-breakpoint
CREATE TABLE `ai_messages` (
	`id` varchar(36) NOT NULL,
	`conversation_id` varchar(36) NOT NULL,
	`parent_message_id` varchar(36),
	`role` varchar(20) NOT NULL,
	`content_encrypted` text,
	`content_hash` char(64),
	`grounded` boolean,
	`response_mode` varchar(24),
	`provider_id` varchar(80),
	`model_id` varchar(120),
	`policy_version` varchar(60) NOT NULL,
	`safety_outcome` varchar(32),
	`usage` json,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_policies` (
	`id` varchar(36) NOT NULL,
	`organisation_id` varchar(36) NOT NULL,
	`course_release_id` varchar(36),
	`policy_version` varchar(60) NOT NULL,
	`response_mode` varchar(24) NOT NULL DEFAULT 'retrieval-only',
	`minimum_age` int unsigned,
	`allowed_question_categories` json,
	`blocked_question_categories` json,
	`store_conversations` boolean NOT NULL DEFAULT false,
	`retention_days` int unsigned NOT NULL DEFAULT 0,
	`provider_reference` varchar(120),
	`safety_configuration` json,
	`enabled` boolean NOT NULL DEFAULT false,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `ai_policies_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_policies_org_course_version_unique` UNIQUE(`organisation_id`,`course_release_id`,`policy_version`)
);
--> statement-breakpoint
CREATE TABLE `assessment_attempts` (
	`id` varchar(36) NOT NULL,
	`assessment_id` varchar(36) NOT NULL,
	`enrolment_id` varchar(36) NOT NULL,
	`attempt_number` int unsigned NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'in-progress',
	`score_earned` int NOT NULL DEFAULT 0,
	`score_possible` int unsigned NOT NULL DEFAULT 0,
	`percentage` int unsigned,
	`passed` boolean,
	`started_at` timestamp(3) NOT NULL DEFAULT (now()),
	`submitted_at` timestamp(3),
	`graded_at` timestamp(3),
	CONSTRAINT `assessment_attempts_id` PRIMARY KEY(`id`),
	CONSTRAINT `assessment_attempts_enrolment_assessment_number_unique` UNIQUE(`enrolment_id`,`assessment_id`,`attempt_number`)
);
--> statement-breakpoint
CREATE TABLE `assessment_localizations` (
	`assessment_id` varchar(36) NOT NULL,
	`language_code` varchar(12) NOT NULL,
	`title` varchar(220) NOT NULL,
	`instructions` text,
	`pass_message` text,
	`retry_message` text,
	CONSTRAINT `assessment_localizations_pk` PRIMARY KEY(`assessment_id`,`language_code`)
);
--> statement-breakpoint
CREATE TABLE `assessment_option_localizations` (
	`option_id` varchar(36) NOT NULL,
	`language_code` varchar(12) NOT NULL,
	`label` text NOT NULL,
	`feedback` text,
	CONSTRAINT `assessment_option_localizations_pk` PRIMARY KEY(`option_id`,`language_code`)
);
--> statement-breakpoint
CREATE TABLE `assessment_options` (
	`id` varchar(36) NOT NULL,
	`question_id` varchar(36) NOT NULL,
	`sequence` int unsigned NOT NULL,
	`is_correct` boolean NOT NULL DEFAULT false,
	`score_value` int NOT NULL DEFAULT 0,
	CONSTRAINT `assessment_options_id` PRIMARY KEY(`id`),
	CONSTRAINT `assessment_options_question_sequence_unique` UNIQUE(`question_id`,`sequence`)
);
--> statement-breakpoint
CREATE TABLE `assessment_question_localizations` (
	`question_id` varchar(36) NOT NULL,
	`language_code` varchar(12) NOT NULL,
	`prompt` text NOT NULL,
	`explanation` text,
	CONSTRAINT `assessment_question_localizations_pk` PRIMARY KEY(`question_id`,`language_code`)
);
--> statement-breakpoint
CREATE TABLE `assessment_questions` (
	`id` varchar(36) NOT NULL,
	`assessment_id` varchar(36) NOT NULL,
	`scripture_verse_id` varchar(36),
	`question_type` varchar(32) NOT NULL,
	`sequence` int unsigned NOT NULL,
	`points` int unsigned NOT NULL DEFAULT 1,
	`configuration` json,
	`status` varchar(20) NOT NULL DEFAULT 'active',
	CONSTRAINT `assessment_questions_id` PRIMARY KEY(`id`),
	CONSTRAINT `assessment_questions_assessment_sequence_unique` UNIQUE(`assessment_id`,`sequence`)
);
--> statement-breakpoint
CREATE TABLE `assessment_responses` (
	`id` varchar(36) NOT NULL,
	`attempt_id` varchar(36) NOT NULL,
	`question_id` varchar(36) NOT NULL,
	`selected_option_id` varchar(36),
	`response_text_encrypted` text,
	`score_awarded` int NOT NULL DEFAULT 0,
	`grader_user_id` varchar(36),
	`answered_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `assessment_responses_id` PRIMARY KEY(`id`),
	CONSTRAINT `assessment_responses_attempt_question_unique` UNIQUE(`attempt_id`,`question_id`)
);
--> statement-breakpoint
CREATE TABLE `assessments` (
	`id` varchar(36) NOT NULL,
	`course_release_id` varchar(36) NOT NULL,
	`module_id` varchar(36),
	`slug` varchar(120) NOT NULL,
	`assessment_type` varchar(32) NOT NULL DEFAULT 'chapter',
	`passing_percentage` int unsigned NOT NULL DEFAULT 60,
	`maximum_attempts` int unsigned,
	`time_limit_minutes` int unsigned,
	`randomize_questions` boolean NOT NULL DEFAULT false,
	`status` varchar(20) NOT NULL DEFAULT 'draft',
	CONSTRAINT `assessments_id` PRIMARY KEY(`id`),
	CONSTRAINT `assessments_release_slug_unique` UNIQUE(`course_release_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `audit_events` (
	`id` varchar(36) NOT NULL,
	`organisation_id` varchar(36),
	`actor_user_id` varchar(36),
	`action` varchar(80) NOT NULL,
	`entity_type` varchar(40) NOT NULL,
	`entity_id` varchar(36),
	`request_id` varchar(80),
	`ip_hash` char(64),
	`details` json,
	`occurred_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `certificate_issues` (
	`id` varchar(36) NOT NULL,
	`certificate_template_id` varchar(36) NOT NULL,
	`enrolment_id` varchar(36) NOT NULL,
	`certificate_number` varchar(80) NOT NULL,
	`verification_code_hash` char(64) NOT NULL,
	`snapshot` json NOT NULL,
	`issued_at` timestamp(3) NOT NULL DEFAULT (now()),
	`revoked_at` timestamp(3),
	`revocation_reason` varchar(500),
	CONSTRAINT `certificate_issues_id` PRIMARY KEY(`id`),
	CONSTRAINT `certificate_issues_number_unique` UNIQUE(`certificate_number`),
	CONSTRAINT `certificate_issues_verification_unique` UNIQUE(`verification_code_hash`)
);
--> statement-breakpoint
CREATE TABLE `certificate_templates` (
	`id` varchar(36) NOT NULL,
	`organisation_id` varchar(36) NOT NULL,
	`course_id` varchar(36),
	`language_code` varchar(12),
	`name` varchar(180) NOT NULL,
	`version_label` varchar(60) NOT NULL,
	`template` json NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'draft',
	CONSTRAINT `certificate_templates_id` PRIMARY KEY(`id`),
	CONSTRAINT `certificate_templates_org_name_version_unique` UNIQUE(`organisation_id`,`name`,`version_label`)
);
--> statement-breakpoint
CREATE TABLE `cohort_course_assignments` (
	`id` varchar(36) NOT NULL,
	`cohort_id` varchar(36) NOT NULL,
	`course_release_id` varchar(36) NOT NULL,
	`assigned_by_user_id` varchar(36),
	`due_at` timestamp(3),
	`settings` json,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `cohort_course_assignments_id` PRIMARY KEY(`id`),
	CONSTRAINT `cohort_course_assignments_unique` UNIQUE(`cohort_id`,`course_release_id`)
);
--> statement-breakpoint
CREATE TABLE `cohort_memberships` (
	`cohort_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`role` varchar(24) NOT NULL DEFAULT 'learner',
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`joined_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `cohort_memberships_pk` PRIMARY KEY(`cohort_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `commentary_editions` (
	`id` varchar(36) NOT NULL,
	`commentary_work_id` varchar(36) NOT NULL,
	`owner_organisation_id` varchar(36) NOT NULL,
	`language_code` varchar(12) NOT NULL,
	`title` varchar(220) NOT NULL,
	`version_label` varchar(60) NOT NULL,
	`passage_mode` varchar(24) NOT NULL DEFAULT 'summary',
	`license_id` varchar(36),
	`source_document_id` varchar(36),
	`publication_status` varchar(20) NOT NULL DEFAULT 'draft',
	`content_checksum` char(64),
	`published_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `commentary_editions_id` PRIMARY KEY(`id`),
	CONSTRAINT `commentary_editions_work_owner_language_version_unique` UNIQUE(`commentary_work_id`,`owner_organisation_id`,`language_code`,`version_label`)
);
--> statement-breakpoint
CREATE TABLE `commentary_passages` (
	`id` varchar(36) NOT NULL,
	`commentary_edition_id` varchar(36) NOT NULL,
	`verse_id` varchar(36) NOT NULL,
	`passage_type` varchar(24) NOT NULL DEFAULT 'summary',
	`text` text NOT NULL,
	`source_locator` varchar(255),
	`editorial_status` varchar(20) NOT NULL DEFAULT 'draft',
	`updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `commentary_passages_id` PRIMARY KEY(`id`),
	CONSTRAINT `commentary_passages_edition_verse_type_unique` UNIQUE(`commentary_edition_id`,`verse_id`,`passage_type`)
);
--> statement-breakpoint
CREATE TABLE `commentary_traditions` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`canonical_name` varchar(160) NOT NULL,
	`description` text,
	CONSTRAINT `commentary_traditions_id` PRIMARY KEY(`id`),
	CONSTRAINT `commentary_traditions_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `commentary_works` (
	`id` varchar(36) NOT NULL,
	`scripture_work_id` varchar(36) NOT NULL,
	`commentator_person_id` varchar(36) NOT NULL,
	`tradition_id` varchar(36),
	`slug` varchar(120) NOT NULL,
	`canonical_title` varchar(220) NOT NULL,
	`original_language_code` varchar(12),
	`source_document_id` varchar(36),
	CONSTRAINT `commentary_works_id` PRIMARY KEY(`id`),
	CONSTRAINT `commentary_works_scripture_slug_unique` UNIQUE(`scripture_work_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `content_licenses` (
	`id` varchar(36) NOT NULL,
	`organisation_id` varchar(36),
	`code` varchar(80) NOT NULL,
	`name` varchar(180) NOT NULL,
	`rights_holder` varchar(180),
	`terms_url` varchar(1024),
	`permitted_uses` json,
	`starts_at` timestamp(3),
	`expires_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `content_licenses_id` PRIMARY KEY(`id`),
	CONSTRAINT `content_licenses_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `content_reviews` (
	`id` varchar(36) NOT NULL,
	`organisation_id` varchar(36) NOT NULL,
	`entity_type` varchar(40) NOT NULL,
	`entity_id` varchar(36) NOT NULL,
	`entity_version` varchar(60) NOT NULL,
	`review_type` varchar(32) NOT NULL,
	`reviewer_user_id` varchar(36),
	`decision` varchar(24) NOT NULL,
	`comments_encrypted` text,
	`decided_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `content_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_enrolments` (
	`id` varchar(36) NOT NULL,
	`organisation_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`course_release_id` varchar(36) NOT NULL,
	`cohort_id` varchar(36),
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`progress_percent` int unsigned NOT NULL DEFAULT 0,
	`enrolled_at` timestamp(3) NOT NULL DEFAULT (now()),
	`started_at` timestamp(3),
	`completed_at` timestamp(3),
	`last_activity_at` timestamp(3),
	CONSTRAINT `course_enrolments_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_enrolments_org_user_release_unique` UNIQUE(`organisation_id`,`user_id`,`course_release_id`)
);
--> statement-breakpoint
CREATE TABLE `course_localizations` (
	`course_id` varchar(36) NOT NULL,
	`language_code` varchar(12) NOT NULL,
	`title` varchar(220) NOT NULL,
	`short_description` text,
	`full_description` text,
	`learning_outcomes` json,
	CONSTRAINT `course_localizations_pk` PRIMARY KEY(`course_id`,`language_code`)
);
--> statement-breakpoint
CREATE TABLE `course_module_localizations` (
	`module_id` varchar(36) NOT NULL,
	`language_code` varchar(12) NOT NULL,
	`title` varchar(220) NOT NULL,
	`description` text,
	`essential_question` text,
	CONSTRAINT `course_module_localizations_pk` PRIMARY KEY(`module_id`,`language_code`)
);
--> statement-breakpoint
CREATE TABLE `course_modules` (
	`id` varchar(36) NOT NULL,
	`course_release_id` varchar(36) NOT NULL,
	`scripture_chapter_id` varchar(36),
	`slug` varchar(120) NOT NULL,
	`module_type` varchar(32) NOT NULL,
	`sequence` int unsigned NOT NULL,
	`is_required` boolean NOT NULL DEFAULT true,
	`status` varchar(20) NOT NULL DEFAULT 'draft',
	CONSTRAINT `course_modules_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_modules_release_slug_unique` UNIQUE(`course_release_id`,`slug`),
	CONSTRAINT `course_modules_release_sequence_unique` UNIQUE(`course_release_id`,`sequence`)
);
--> statement-breakpoint
CREATE TABLE `course_releases` (
	`id` varchar(36) NOT NULL,
	`course_id` varchar(36) NOT NULL,
	`version_label` varchar(60) NOT NULL,
	`default_scripture_release_id` varchar(36),
	`publication_status` varchar(20) NOT NULL DEFAULT 'draft',
	`passing_percentage` int unsigned NOT NULL DEFAULT 60,
	`estimated_minutes` int unsigned,
	`content_checksum` char(64),
	`release_notes` text,
	`published_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `course_releases_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_releases_course_version_unique` UNIQUE(`course_id`,`version_label`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` varchar(36) NOT NULL,
	`owner_organisation_id` varchar(36) NOT NULL,
	`publication_profile_id` varchar(36) NOT NULL,
	`scripture_work_id` varchar(36),
	`slug` varchar(120) NOT NULL,
	`course_type` varchar(32) NOT NULL DEFAULT 'self-paced',
	`audience_type` varchar(32) NOT NULL DEFAULT 'general',
	`minimum_age` int unsigned,
	`maximum_age` int unsigned,
	`status` varchar(20) NOT NULL DEFAULT 'draft',
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `courses_id` PRIMARY KEY(`id`),
	CONSTRAINT `courses_owner_slug_unique` UNIQUE(`owner_organisation_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `languages` (
	`code` varchar(12) NOT NULL,
	`english_name` varchar(80) NOT NULL,
	`native_name` varchar(80) NOT NULL,
	`direction` varchar(3) NOT NULL DEFAULT 'ltr',
	`status` varchar(20) NOT NULL DEFAULT 'active',
	CONSTRAINT `languages_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `learner_bookmarks` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`organisation_id` varchar(36) NOT NULL,
	`entity_type` varchar(40) NOT NULL,
	`entity_id` varchar(36) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `learner_bookmarks_id` PRIMARY KEY(`id`),
	CONSTRAINT `learner_bookmarks_user_entity_unique` UNIQUE(`user_id`,`organisation_id`,`entity_type`,`entity_id`)
);
--> statement-breakpoint
CREATE TABLE `learner_notes` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`organisation_id` varchar(36) NOT NULL,
	`entity_type` varchar(40) NOT NULL,
	`entity_id` varchar(36) NOT NULL,
	`note_text_encrypted` text NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `learner_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learner_profiles` (
	`user_id` varchar(36) NOT NULL,
	`preferred_language_code` varchar(12),
	`preferred_script_code` varchar(8),
	`learning_mode` varchar(32) NOT NULL DEFAULT 'mixed',
	`time_zone` varchar(64) NOT NULL DEFAULT 'UTC',
	`accessibility_preferences` json,
	`birth_year` int unsigned,
	`onboarding_completed_at` timestamp(3),
	`updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `learner_profiles_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `learning_cohorts` (
	`id` varchar(36) NOT NULL,
	`organisation_id` varchar(36) NOT NULL,
	`unit_id` varchar(36),
	`name` varchar(140) NOT NULL,
	`academic_period` varchar(60),
	`age_band` varchar(40),
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`starts_at` timestamp(3),
	`ends_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_cohorts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learning_events` (
	`id` varchar(36) NOT NULL,
	`organisation_id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`enrolment_id` varchar(36),
	`event_type` varchar(48) NOT NULL,
	`entity_type` varchar(40),
	`entity_id` varchar(36),
	`occurred_at` timestamp(3) NOT NULL DEFAULT (now()),
	`properties` json,
	CONSTRAINT `learning_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lesson_content_blocks` (
	`id` varchar(36) NOT NULL,
	`lesson_id` varchar(36) NOT NULL,
	`block_type` varchar(40) NOT NULL,
	`sequence` int unsigned NOT NULL,
	`source_entity_type` varchar(40),
	`source_entity_id` varchar(36),
	`required_for_completion` boolean NOT NULL DEFAULT false,
	`configuration` json,
	CONSTRAINT `lesson_content_blocks_id` PRIMARY KEY(`id`),
	CONSTRAINT `lesson_content_blocks_lesson_sequence_unique` UNIQUE(`lesson_id`,`sequence`)
);
--> statement-breakpoint
CREATE TABLE `lesson_localizations` (
	`lesson_id` varchar(36) NOT NULL,
	`language_code` varchar(12) NOT NULL,
	`title` varchar(220) NOT NULL,
	`objective` text,
	`scene_context` text,
	`completion_message` text,
	CONSTRAINT `lesson_localizations_pk` PRIMARY KEY(`lesson_id`,`language_code`)
);
--> statement-breakpoint
CREATE TABLE `lesson_prerequisites` (
	`lesson_id` varchar(36) NOT NULL,
	`prerequisite_lesson_id` varchar(36) NOT NULL,
	`rule_type` varchar(24) NOT NULL DEFAULT 'complete',
	CONSTRAINT `lesson_prerequisites_pk` PRIMARY KEY(`lesson_id`,`prerequisite_lesson_id`)
);
--> statement-breakpoint
CREATE TABLE `lesson_progress` (
	`id` varchar(36) NOT NULL,
	`enrolment_id` varchar(36) NOT NULL,
	`lesson_id` varchar(36) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'not-started',
	`completion_percent` int unsigned NOT NULL DEFAULT 0,
	`time_spent_seconds` int unsigned NOT NULL DEFAULT 0,
	`resume_state` json,
	`first_opened_at` timestamp(3),
	`last_opened_at` timestamp(3),
	`completed_at` timestamp(3),
	`updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `lesson_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `lesson_progress_enrolment_lesson_unique` UNIQUE(`enrolment_id`,`lesson_id`)
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` varchar(36) NOT NULL,
	`module_id` varchar(36) NOT NULL,
	`scripture_verse_id` varchar(36),
	`slug` varchar(120) NOT NULL,
	`lesson_type` varchar(32) NOT NULL,
	`sequence` int unsigned NOT NULL,
	`estimated_minutes` int unsigned,
	`is_required` boolean NOT NULL DEFAULT true,
	`status` varchar(20) NOT NULL DEFAULT 'draft',
	CONSTRAINT `lessons_id` PRIMARY KEY(`id`),
	CONSTRAINT `lessons_module_slug_unique` UNIQUE(`module_id`,`slug`),
	CONSTRAINT `lessons_module_sequence_unique` UNIQUE(`module_id`,`sequence`)
);
--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` varchar(36) NOT NULL,
	`owner_organisation_id` varchar(36) NOT NULL,
	`license_id` varchar(36),
	`language_code` varchar(12),
	`asset_type` varchar(32) NOT NULL,
	`title` varchar(220) NOT NULL,
	`storage_provider` varchar(32) NOT NULL,
	`storage_key` varchar(512) NOT NULL,
	`mime_type` varchar(120) NOT NULL,
	`byte_size` int unsigned,
	`duration_seconds` int unsigned,
	`checksum_sha256` char(64),
	`accessibility` json,
	`metadata` json,
	`publication_status` varchar(20) NOT NULL DEFAULT 'draft',
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `media_assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `media_assets_owner_storage_unique` UNIQUE(`owner_organisation_id`,`storage_key`)
);
--> statement-breakpoint
CREATE TABLE `media_attachments` (
	`id` varchar(36) NOT NULL,
	`media_asset_id` varchar(36) NOT NULL,
	`entity_type` varchar(40) NOT NULL,
	`entity_id` varchar(36) NOT NULL,
	`attachment_role` varchar(32) NOT NULL,
	`display_order` int unsigned NOT NULL DEFAULT 1,
	CONSTRAINT `media_attachments_id` PRIMARY KEY(`id`),
	CONSTRAINT `media_attachments_entity_role_order_unique` UNIQUE(`entity_type`,`entity_id`,`attachment_role`,`display_order`)
);
--> statement-breakpoint
CREATE TABLE `media_text_tracks` (
	`id` varchar(36) NOT NULL,
	`media_asset_id` varchar(36) NOT NULL,
	`language_code` varchar(12) NOT NULL,
	`track_type` varchar(24) NOT NULL,
	`storage_key` varchar(512),
	`text` text,
	`is_default` boolean NOT NULL DEFAULT false,
	CONSTRAINT `media_text_tracks_id` PRIMARY KEY(`id`),
	CONSTRAINT `media_text_tracks_asset_language_type_unique` UNIQUE(`media_asset_id`,`language_code`,`track_type`)
);
--> statement-breakpoint
CREATE TABLE `organisation_branding` (
	`organisation_id` varchar(36) NOT NULL,
	`logo_url` varchar(1024),
	`favicon_url` varchar(1024),
	`primary_color` varchar(16),
	`secondary_color` varchar(16),
	`accent_color` varchar(16),
	`font_family` varchar(160),
	`theme` json,
	`updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `organisation_branding_organisation_id` PRIMARY KEY(`organisation_id`)
);
--> statement-breakpoint
CREATE TABLE `organisation_domains` (
	`id` varchar(36) NOT NULL,
	`organisation_id` varchar(36) NOT NULL,
	`hostname` varchar(253) NOT NULL,
	`is_primary` boolean NOT NULL DEFAULT false,
	`verified_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `organisation_domains_id` PRIMARY KEY(`id`),
	CONSTRAINT `organisation_domains_hostname_unique` UNIQUE(`hostname`)
);
--> statement-breakpoint
CREATE TABLE `organisation_memberships` (
	`organisation_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`role` varchar(32) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`joined_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `organisation_memberships_pk` PRIMARY KEY(`organisation_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `organisation_unit_memberships` (
	`unit_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`role` varchar(32) NOT NULL,
	`joined_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `organisation_unit_memberships_pk` PRIMARY KEY(`unit_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `organisation_units` (
	`id` varchar(36) NOT NULL,
	`organisation_id` varchar(36) NOT NULL,
	`parent_unit_id` varchar(36),
	`unit_type` varchar(32) NOT NULL,
	`name` varchar(140) NOT NULL,
	`external_reference` varchar(120),
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `organisation_units_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organisations` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(80) NOT NULL,
	`legal_name` varchar(180) NOT NULL,
	`display_name` varchar(120) NOT NULL,
	`organisation_type` varchar(32) NOT NULL,
	`country_code` char(2),
	`default_language_code` varchar(12),
	`time_zone` varchar(64) NOT NULL DEFAULT 'UTC',
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`settings` json,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `organisations_id` PRIMARY KEY(`id`),
	CONSTRAINT `organisations_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `person_names` (
	`person_id` varchar(36) NOT NULL,
	`language_code` varchar(12) NOT NULL,
	`display_name` varchar(180) NOT NULL,
	CONSTRAINT `person_names_pk` PRIMARY KEY(`person_id`,`language_code`)
);
--> statement-breakpoint
CREATE TABLE `persons` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`canonical_name` varchar(180) NOT NULL,
	`person_type` varchar(32) NOT NULL DEFAULT 'author',
	`birth_year` int,
	`death_year` int,
	`notes` text,
	CONSTRAINT `persons_id` PRIMARY KEY(`id`),
	CONSTRAINT `persons_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `publication_commentary_editions` (
	`publication_profile_id` varchar(36) NOT NULL,
	`commentary_edition_id` varchar(36) NOT NULL,
	`display_order` int unsigned NOT NULL DEFAULT 1,
	`is_enabled` boolean NOT NULL DEFAULT true,
	CONSTRAINT `publication_commentary_editions_pk` PRIMARY KEY(`publication_profile_id`,`commentary_edition_id`)
);
--> statement-breakpoint
CREATE TABLE `publication_profiles` (
	`id` varchar(36) NOT NULL,
	`organisation_id` varchar(36) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`name` varchar(180) NOT NULL,
	`audience_type` varchar(32) NOT NULL DEFAULT 'general',
	`jurisdiction_code` varchar(20),
	`default_language_code` varchar(12),
	`status` varchar(20) NOT NULL DEFAULT 'draft',
	`settings` json,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `publication_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `publication_profiles_org_slug_unique` UNIQUE(`organisation_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `publication_scripture_releases` (
	`publication_profile_id` varchar(36) NOT NULL,
	`work_id` varchar(36) NOT NULL,
	`edition_release_id` varchar(36) NOT NULL,
	`is_default` boolean NOT NULL DEFAULT true,
	CONSTRAINT `publication_scripture_releases_pk` PRIMARY KEY(`publication_profile_id`,`work_id`)
);
--> statement-breakpoint
CREATE TABLE `scripture_chapter_localizations` (
	`chapter_id` varchar(36) NOT NULL,
	`language_code` varchar(12) NOT NULL,
	`title` varchar(180) NOT NULL,
	`focus` text,
	`essential_question` text,
	CONSTRAINT `scripture_chapter_localizations_pk` PRIMARY KEY(`chapter_id`,`language_code`)
);
--> statement-breakpoint
CREATE TABLE `scripture_chapters` (
	`id` varchar(36) NOT NULL,
	`work_id` varchar(36) NOT NULL,
	`chapter_number` int unsigned NOT NULL,
	`canonical_title` varchar(180),
	`verse_count` int unsigned,
	`sort_order` int unsigned NOT NULL,
	CONSTRAINT `scripture_chapters_id` PRIMARY KEY(`id`),
	CONSTRAINT `scripture_chapters_work_number_unique` UNIQUE(`work_id`,`chapter_number`)
);
--> statement-breakpoint
CREATE TABLE `scripture_edition_releases` (
	`id` varchar(36) NOT NULL,
	`edition_id` varchar(36) NOT NULL,
	`version_label` varchar(60) NOT NULL,
	`publication_status` varchar(20) NOT NULL DEFAULT 'draft',
	`source_document_id` varchar(36),
	`license_id` varchar(36),
	`content_checksum` char(64),
	`release_notes` text,
	`published_at` timestamp(3),
	`superseded_at` timestamp(3),
	`retracted_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `scripture_edition_releases_id` PRIMARY KEY(`id`),
	CONSTRAINT `scripture_releases_edition_version_unique` UNIQUE(`edition_id`,`version_label`)
);
--> statement-breakpoint
CREATE TABLE `scripture_editions` (
	`id` varchar(36) NOT NULL,
	`work_id` varchar(36) NOT NULL,
	`owner_organisation_id` varchar(36) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`name` varchar(200) NOT NULL,
	`authority_statement` text,
	`status` varchar(20) NOT NULL DEFAULT 'draft',
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `scripture_editions_id` PRIMARY KEY(`id`),
	CONSTRAINT `scripture_editions_owner_slug_unique` UNIQUE(`owner_organisation_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `scripture_verses` (
	`id` varchar(36) NOT NULL,
	`chapter_id` varchar(36) NOT NULL,
	`verse_number` varchar(20) NOT NULL,
	`canonical_reference` varchar(40) NOT NULL,
	`sort_order` int unsigned NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'active',
	CONSTRAINT `scripture_verses_id` PRIMARY KEY(`id`),
	CONSTRAINT `scripture_verses_reference_unique` UNIQUE(`canonical_reference`),
	CONSTRAINT `scripture_verses_chapter_number_unique` UNIQUE(`chapter_id`,`verse_number`)
);
--> statement-breakpoint
CREATE TABLE `scripture_work_names` (
	`work_id` varchar(36) NOT NULL,
	`language_code` varchar(12) NOT NULL,
	`title` varchar(180) NOT NULL,
	`short_description` text,
	CONSTRAINT `scripture_work_names_pk` PRIMARY KEY(`work_id`,`language_code`)
);
--> statement-breakpoint
CREATE TABLE `scripture_works` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`canonical_title` varchar(180) NOT NULL,
	`work_type` varchar(40) NOT NULL DEFAULT 'scripture',
	`canonical_language_code` varchar(12),
	`chapter_count` int unsigned,
	`verse_count` int unsigned,
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `scripture_works_id` PRIMARY KEY(`id`),
	CONSTRAINT `scripture_works_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `source_documents` (
	`id` varchar(36) NOT NULL,
	`organisation_id` varchar(36),
	`license_id` varchar(36),
	`title` varchar(255) NOT NULL,
	`author` varchar(180),
	`publisher` varchar(180),
	`publication_year` int unsigned,
	`isbn` varchar(32),
	`source_url` varchar(1024),
	`storage_key` varchar(512),
	`checksum_sha256` char(64),
	`rights_status` varchar(24) NOT NULL DEFAULT 'review-required',
	`citation` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `source_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_achievements` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`achievement_id` varchar(36) NOT NULL,
	`enrolment_id` varchar(36),
	`awarded_at` timestamp(3) NOT NULL DEFAULT (now()),
	`evidence` json,
	CONSTRAINT `user_achievements_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_achievements_user_achievement_enrolment_unique` UNIQUE(`user_id`,`achievement_id`,`enrolment_id`)
);
--> statement-breakpoint
CREATE TABLE `user_consents` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`organisation_id` varchar(36) NOT NULL,
	`consent_type` varchar(40) NOT NULL,
	`policy_version` varchar(60) NOT NULL,
	`granted` boolean NOT NULL,
	`granted_by_user_id` varchar(36),
	`recorded_at` timestamp(3) NOT NULL DEFAULT (now()),
	`withdrawn_at` timestamp(3),
	CONSTRAINT `user_consents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verse_learning_notes` (
	`id` varchar(36) NOT NULL,
	`edition_release_id` varchar(36) NOT NULL,
	`verse_id` varchar(36) NOT NULL,
	`language_code` varchar(12) NOT NULL,
	`note_type` varchar(32) NOT NULL,
	`sequence` int unsigned NOT NULL DEFAULT 1,
	`title` varchar(180),
	`text` text NOT NULL,
	`editorial_status` varchar(20) NOT NULL DEFAULT 'draft',
	CONSTRAINT `verse_learning_notes_id` PRIMARY KEY(`id`),
	CONSTRAINT `verse_learning_notes_unique` UNIQUE(`edition_release_id`,`verse_id`,`language_code`,`note_type`,`sequence`)
);
--> statement-breakpoint
CREATE TABLE `verse_progress` (
	`id` varchar(36) NOT NULL,
	`enrolment_id` varchar(36) NOT NULL,
	`verse_id` varchar(36) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'not-started',
	`read_count` int unsigned NOT NULL DEFAULT 0,
	`listen_count` int unsigned NOT NULL DEFAULT 0,
	`last_language_code` varchar(12),
	`first_opened_at` timestamp(3),
	`last_opened_at` timestamp(3),
	`completed_at` timestamp(3),
	CONSTRAINT `verse_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `verse_progress_enrolment_verse_unique` UNIQUE(`enrolment_id`,`verse_id`)
);
--> statement-breakpoint
CREATE TABLE `verse_sandhi_analyses` (
	`id` varchar(36) NOT NULL,
	`edition_release_id` varchar(36) NOT NULL,
	`verse_id` varchar(36) NOT NULL,
	`analysis_type` varchar(32) NOT NULL DEFAULT 'sandhi-vicheda',
	`version_label` varchar(60) NOT NULL,
	`editor_person_id` varchar(36),
	`editorial_status` varchar(20) NOT NULL DEFAULT 'draft',
	`source_locator` varchar(255),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `verse_sandhi_analyses_id` PRIMARY KEY(`id`),
	CONSTRAINT `verse_sandhi_release_verse_version_unique` UNIQUE(`edition_release_id`,`verse_id`,`analysis_type`,`version_label`)
);
--> statement-breakpoint
CREATE TABLE `verse_texts` (
	`id` varchar(36) NOT NULL,
	`edition_release_id` varchar(36) NOT NULL,
	`verse_id` varchar(36) NOT NULL,
	`language_code` varchar(12) NOT NULL,
	`script_code` varchar(8) NOT NULL,
	`representation` varchar(32) NOT NULL,
	`text` text NOT NULL,
	`line_breaks` json,
	`metre` varchar(120),
	`pronunciation_guide` text,
	`source_locator` varchar(255),
	`editorial_status` varchar(20) NOT NULL DEFAULT 'draft',
	`updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `verse_texts_id` PRIMARY KEY(`id`),
	CONSTRAINT `verse_texts_release_verse_render_unique` UNIQUE(`edition_release_id`,`verse_id`,`language_code`,`script_code`,`representation`)
);
--> statement-breakpoint
CREATE TABLE `verse_token_forms` (
	`id` varchar(36) NOT NULL,
	`token_id` varchar(36) NOT NULL,
	`language_code` varchar(12) NOT NULL,
	`script_code` varchar(8) NOT NULL,
	`form_type` varchar(24) NOT NULL,
	`text` varchar(255) NOT NULL,
	CONSTRAINT `verse_token_forms_id` PRIMARY KEY(`id`),
	CONSTRAINT `verse_token_forms_token_render_unique` UNIQUE(`token_id`,`language_code`,`script_code`,`form_type`)
);
--> statement-breakpoint
CREATE TABLE `verse_token_meanings` (
	`id` varchar(36) NOT NULL,
	`token_id` varchar(36) NOT NULL,
	`language_code` varchar(12) NOT NULL,
	`sense_number` int unsigned NOT NULL DEFAULT 1,
	`meaning` varchar(500) NOT NULL,
	`grammatical_note` varchar(500),
	`editorial_status` varchar(20) NOT NULL DEFAULT 'draft',
	CONSTRAINT `verse_token_meanings_id` PRIMARY KEY(`id`),
	CONSTRAINT `verse_token_meanings_token_language_unique` UNIQUE(`token_id`,`language_code`,`sense_number`)
);
--> statement-breakpoint
CREATE TABLE `verse_tokens` (
	`id` varchar(36) NOT NULL,
	`analysis_id` varchar(36) NOT NULL,
	`position` int unsigned NOT NULL,
	`pada_number` int unsigned,
	`lemma_key` varchar(160),
	`grammar` json,
	CONSTRAINT `verse_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `verse_tokens_analysis_position_unique` UNIQUE(`analysis_id`,`position`)
);
--> statement-breakpoint
CREATE TABLE `verse_translations` (
	`id` varchar(36) NOT NULL,
	`edition_release_id` varchar(36) NOT NULL,
	`verse_id` varchar(36) NOT NULL,
	`language_code` varchar(12) NOT NULL,
	`translation_key` varchar(40) NOT NULL DEFAULT 'primary',
	`translator_person_id` varchar(36),
	`text` text NOT NULL,
	`source_locator` varchar(255),
	`editorial_status` varchar(20) NOT NULL DEFAULT 'draft',
	`updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `verse_translations_id` PRIMARY KEY(`id`),
	CONSTRAINT `verse_translations_release_verse_language_unique` UNIQUE(`edition_release_id`,`verse_id`,`language_code`,`translation_key`)
);
--> statement-breakpoint
CREATE TABLE `writing_scripts` (
	`code` varchar(8) NOT NULL,
	`english_name` varchar(80) NOT NULL,
	`native_name` varchar(80),
	`direction` varchar(3) NOT NULL DEFAULT 'ltr',
	CONSTRAINT `writing_scripts_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
ALTER TABLE `achievement_localizations` ADD CONSTRAINT `achievement_localizations_achievement_id_achievements_id_fk` FOREIGN KEY (`achievement_id`) REFERENCES `achievements`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `achievement_localizations` ADD CONSTRAINT `achievement_localizations_language_code_languages_code_fk` FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `achievements` ADD CONSTRAINT `achievements_organisation_id_organisations_id_fk` FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `achievements` ADD CONSTRAINT `achievements_badge_media_asset_id_media_assets_id_fk` FOREIGN KEY (`badge_media_asset_id`) REFERENCES `media_assets`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_conversations` ADD CONSTRAINT `ai_conversations_organisation_id_organisations_id_fk` FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_conversations` ADD CONSTRAINT `ai_conversations_user_id_auth_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_conversations` ADD CONSTRAINT `ai_conversations_course_release_id_course_releases_id_fk` FOREIGN KEY (`course_release_id`) REFERENCES `course_releases`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_conversations` ADD CONSTRAINT `ai_conversations_enrolment_id_course_enrolments_id_fk` FOREIGN KEY (`enrolment_id`) REFERENCES `course_enrolments`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_conversations` ADD CONSTRAINT `ai_conversations_language_code_languages_code_fk` FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_feedback` ADD CONSTRAINT `ai_feedback_message_id_ai_messages_id_fk` FOREIGN KEY (`message_id`) REFERENCES `ai_messages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_feedback` ADD CONSTRAINT `ai_feedback_user_id_auth_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_knowledge_chunks` ADD CONSTRAINT `fk_ai_chunk_source` FOREIGN KEY (`knowledge_source_id`) REFERENCES `ai_knowledge_sources`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_knowledge_sources` ADD CONSTRAINT `ai_knowledge_sources_organisation_id_organisations_id_fk` FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_knowledge_sources` ADD CONSTRAINT `ai_knowledge_sources_course_release_id_course_releases_id_fk` FOREIGN KEY (`course_release_id`) REFERENCES `course_releases`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_knowledge_sources` ADD CONSTRAINT `ai_knowledge_sources_language_code_languages_code_fk` FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_message_citations` ADD CONSTRAINT `ai_message_citations_message_id_ai_messages_id_fk` FOREIGN KEY (`message_id`) REFERENCES `ai_messages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_message_citations` ADD CONSTRAINT `fk_ai_citation_chunk` FOREIGN KEY (`knowledge_chunk_id`) REFERENCES `ai_knowledge_chunks`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_messages` ADD CONSTRAINT `ai_messages_conversation_id_ai_conversations_id_fk` FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_messages` ADD CONSTRAINT `fk_ai_message_parent` FOREIGN KEY (`parent_message_id`) REFERENCES `ai_messages`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_policies` ADD CONSTRAINT `ai_policies_organisation_id_organisations_id_fk` FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_policies` ADD CONSTRAINT `ai_policies_course_release_id_course_releases_id_fk` FOREIGN KEY (`course_release_id`) REFERENCES `course_releases`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessment_attempts` ADD CONSTRAINT `assessment_attempts_assessment_id_assessments_id_fk` FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessment_attempts` ADD CONSTRAINT `assessment_attempts_enrolment_id_course_enrolments_id_fk` FOREIGN KEY (`enrolment_id`) REFERENCES `course_enrolments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessment_localizations` ADD CONSTRAINT `assessment_localizations_assessment_id_assessments_id_fk` FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessment_localizations` ADD CONSTRAINT `assessment_localizations_language_code_languages_code_fk` FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessment_option_localizations` ADD CONSTRAINT `assessment_option_localizations_language_code_languages_code_fk` FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessment_option_localizations` ADD CONSTRAINT `fk_assessment_option_l10n_option` FOREIGN KEY (`option_id`) REFERENCES `assessment_options`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessment_options` ADD CONSTRAINT `assessment_options_question_id_assessment_questions_id_fk` FOREIGN KEY (`question_id`) REFERENCES `assessment_questions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessment_question_localizations` ADD CONSTRAINT `fk_assessment_question_l10n_question` FOREIGN KEY (`question_id`) REFERENCES `assessment_questions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessment_question_localizations` ADD CONSTRAINT `fk_assessment_question_l10n_language` FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessment_questions` ADD CONSTRAINT `assessment_questions_assessment_id_assessments_id_fk` FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessment_questions` ADD CONSTRAINT `assessment_questions_scripture_verse_id_scripture_verses_id_fk` FOREIGN KEY (`scripture_verse_id`) REFERENCES `scripture_verses`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessment_responses` ADD CONSTRAINT `assessment_responses_attempt_id_assessment_attempts_id_fk` FOREIGN KEY (`attempt_id`) REFERENCES `assessment_attempts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessment_responses` ADD CONSTRAINT `assessment_responses_question_id_assessment_questions_id_fk` FOREIGN KEY (`question_id`) REFERENCES `assessment_questions`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessment_responses` ADD CONSTRAINT `assessment_responses_selected_option_id_assessment_options_id_fk` FOREIGN KEY (`selected_option_id`) REFERENCES `assessment_options`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessment_responses` ADD CONSTRAINT `assessment_responses_grader_user_id_auth_users_id_fk` FOREIGN KEY (`grader_user_id`) REFERENCES `auth_users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessments` ADD CONSTRAINT `assessments_course_release_id_course_releases_id_fk` FOREIGN KEY (`course_release_id`) REFERENCES `course_releases`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessments` ADD CONSTRAINT `assessments_module_id_course_modules_id_fk` FOREIGN KEY (`module_id`) REFERENCES `course_modules`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_events` ADD CONSTRAINT `audit_events_organisation_id_organisations_id_fk` FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_events` ADD CONSTRAINT `audit_events_actor_user_id_auth_users_id_fk` FOREIGN KEY (`actor_user_id`) REFERENCES `auth_users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `certificate_issues` ADD CONSTRAINT `certificate_issues_enrolment_id_course_enrolments_id_fk` FOREIGN KEY (`enrolment_id`) REFERENCES `course_enrolments`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `certificate_issues` ADD CONSTRAINT `fk_certificate_issue_template` FOREIGN KEY (`certificate_template_id`) REFERENCES `certificate_templates`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `certificate_templates` ADD CONSTRAINT `certificate_templates_organisation_id_organisations_id_fk` FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `certificate_templates` ADD CONSTRAINT `certificate_templates_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `certificate_templates` ADD CONSTRAINT `certificate_templates_language_code_languages_code_fk` FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cohort_course_assignments` ADD CONSTRAINT `cohort_course_assignments_cohort_id_learning_cohorts_id_fk` FOREIGN KEY (`cohort_id`) REFERENCES `learning_cohorts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cohort_course_assignments` ADD CONSTRAINT `cohort_course_assignments_assigned_by_user_id_auth_users_id_fk` FOREIGN KEY (`assigned_by_user_id`) REFERENCES `auth_users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cohort_course_assignments` ADD CONSTRAINT `fk_cohort_assignment_release` FOREIGN KEY (`course_release_id`) REFERENCES `course_releases`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cohort_memberships` ADD CONSTRAINT `cohort_memberships_cohort_id_learning_cohorts_id_fk` FOREIGN KEY (`cohort_id`) REFERENCES `learning_cohorts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cohort_memberships` ADD CONSTRAINT `cohort_memberships_user_id_auth_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commentary_editions` ADD CONSTRAINT `commentary_editions_commentary_work_id_commentary_works_id_fk` FOREIGN KEY (`commentary_work_id`) REFERENCES `commentary_works`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commentary_editions` ADD CONSTRAINT `commentary_editions_owner_organisation_id_organisations_id_fk` FOREIGN KEY (`owner_organisation_id`) REFERENCES `organisations`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commentary_editions` ADD CONSTRAINT `commentary_editions_language_code_languages_code_fk` FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commentary_editions` ADD CONSTRAINT `commentary_editions_license_id_content_licenses_id_fk` FOREIGN KEY (`license_id`) REFERENCES `content_licenses`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commentary_editions` ADD CONSTRAINT `commentary_editions_source_document_id_source_documents_id_fk` FOREIGN KEY (`source_document_id`) REFERENCES `source_documents`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commentary_passages` ADD CONSTRAINT `commentary_passages_verse_id_scripture_verses_id_fk` FOREIGN KEY (`verse_id`) REFERENCES `scripture_verses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commentary_passages` ADD CONSTRAINT `fk_commentary_passage_edition` FOREIGN KEY (`commentary_edition_id`) REFERENCES `commentary_editions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commentary_works` ADD CONSTRAINT `commentary_works_scripture_work_id_scripture_works_id_fk` FOREIGN KEY (`scripture_work_id`) REFERENCES `scripture_works`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commentary_works` ADD CONSTRAINT `commentary_works_commentator_person_id_persons_id_fk` FOREIGN KEY (`commentator_person_id`) REFERENCES `persons`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commentary_works` ADD CONSTRAINT `commentary_works_tradition_id_commentary_traditions_id_fk` FOREIGN KEY (`tradition_id`) REFERENCES `commentary_traditions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commentary_works` ADD CONSTRAINT `commentary_works_original_language_code_languages_code_fk` FOREIGN KEY (`original_language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commentary_works` ADD CONSTRAINT `commentary_works_source_document_id_source_documents_id_fk` FOREIGN KEY (`source_document_id`) REFERENCES `source_documents`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_licenses` ADD CONSTRAINT `content_licenses_organisation_id_organisations_id_fk` FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_reviews` ADD CONSTRAINT `content_reviews_organisation_id_organisations_id_fk` FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_reviews` ADD CONSTRAINT `content_reviews_reviewer_user_id_auth_users_id_fk` FOREIGN KEY (`reviewer_user_id`) REFERENCES `auth_users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_enrolments` ADD CONSTRAINT `course_enrolments_organisation_id_organisations_id_fk` FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_enrolments` ADD CONSTRAINT `course_enrolments_user_id_auth_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_enrolments` ADD CONSTRAINT `course_enrolments_course_release_id_course_releases_id_fk` FOREIGN KEY (`course_release_id`) REFERENCES `course_releases`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_enrolments` ADD CONSTRAINT `course_enrolments_cohort_id_learning_cohorts_id_fk` FOREIGN KEY (`cohort_id`) REFERENCES `learning_cohorts`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_localizations` ADD CONSTRAINT `course_localizations_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_localizations` ADD CONSTRAINT `course_localizations_language_code_languages_code_fk` FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_module_localizations` ADD CONSTRAINT `course_module_localizations_module_id_course_modules_id_fk` FOREIGN KEY (`module_id`) REFERENCES `course_modules`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_module_localizations` ADD CONSTRAINT `course_module_localizations_language_code_languages_code_fk` FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_modules` ADD CONSTRAINT `course_modules_course_release_id_course_releases_id_fk` FOREIGN KEY (`course_release_id`) REFERENCES `course_releases`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_modules` ADD CONSTRAINT `course_modules_scripture_chapter_id_scripture_chapters_id_fk` FOREIGN KEY (`scripture_chapter_id`) REFERENCES `scripture_chapters`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_releases` ADD CONSTRAINT `course_releases_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_releases` ADD CONSTRAINT `fk_course_release_scripture` FOREIGN KEY (`default_scripture_release_id`) REFERENCES `scripture_edition_releases`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `courses_owner_organisation_id_organisations_id_fk` FOREIGN KEY (`owner_organisation_id`) REFERENCES `organisations`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `courses_publication_profile_id_publication_profiles_id_fk` FOREIGN KEY (`publication_profile_id`) REFERENCES `publication_profiles`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `courses_scripture_work_id_scripture_works_id_fk` FOREIGN KEY (`scripture_work_id`) REFERENCES `scripture_works`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learner_bookmarks` ADD CONSTRAINT `learner_bookmarks_user_id_auth_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learner_bookmarks` ADD CONSTRAINT `learner_bookmarks_organisation_id_organisations_id_fk` FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learner_notes` ADD CONSTRAINT `learner_notes_user_id_auth_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learner_notes` ADD CONSTRAINT `learner_notes_organisation_id_organisations_id_fk` FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learner_profiles` ADD CONSTRAINT `learner_profiles_user_id_auth_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learner_profiles` ADD CONSTRAINT `learner_profiles_preferred_language_code_languages_code_fk` FOREIGN KEY (`preferred_language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learner_profiles` ADD CONSTRAINT `learner_profiles_preferred_script_code_writing_scripts_code_fk` FOREIGN KEY (`preferred_script_code`) REFERENCES `writing_scripts`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learning_cohorts` ADD CONSTRAINT `learning_cohorts_organisation_id_organisations_id_fk` FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learning_cohorts` ADD CONSTRAINT `learning_cohorts_unit_id_organisation_units_id_fk` FOREIGN KEY (`unit_id`) REFERENCES `organisation_units`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learning_events` ADD CONSTRAINT `learning_events_organisation_id_organisations_id_fk` FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learning_events` ADD CONSTRAINT `learning_events_user_id_auth_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learning_events` ADD CONSTRAINT `learning_events_enrolment_id_course_enrolments_id_fk` FOREIGN KEY (`enrolment_id`) REFERENCES `course_enrolments`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lesson_content_blocks` ADD CONSTRAINT `lesson_content_blocks_lesson_id_lessons_id_fk` FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lesson_localizations` ADD CONSTRAINT `lesson_localizations_lesson_id_lessons_id_fk` FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lesson_localizations` ADD CONSTRAINT `lesson_localizations_language_code_languages_code_fk` FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lesson_prerequisites` ADD CONSTRAINT `lesson_prerequisites_lesson_id_lessons_id_fk` FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lesson_prerequisites` ADD CONSTRAINT `lesson_prerequisites_prerequisite_lesson_id_lessons_id_fk` FOREIGN KEY (`prerequisite_lesson_id`) REFERENCES `lessons`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lesson_progress` ADD CONSTRAINT `lesson_progress_enrolment_id_course_enrolments_id_fk` FOREIGN KEY (`enrolment_id`) REFERENCES `course_enrolments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lesson_progress` ADD CONSTRAINT `lesson_progress_lesson_id_lessons_id_fk` FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lessons` ADD CONSTRAINT `lessons_module_id_course_modules_id_fk` FOREIGN KEY (`module_id`) REFERENCES `course_modules`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lessons` ADD CONSTRAINT `lessons_scripture_verse_id_scripture_verses_id_fk` FOREIGN KEY (`scripture_verse_id`) REFERENCES `scripture_verses`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_assets` ADD CONSTRAINT `media_assets_owner_organisation_id_organisations_id_fk` FOREIGN KEY (`owner_organisation_id`) REFERENCES `organisations`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_assets` ADD CONSTRAINT `media_assets_license_id_content_licenses_id_fk` FOREIGN KEY (`license_id`) REFERENCES `content_licenses`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_assets` ADD CONSTRAINT `media_assets_language_code_languages_code_fk` FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_attachments` ADD CONSTRAINT `media_attachments_media_asset_id_media_assets_id_fk` FOREIGN KEY (`media_asset_id`) REFERENCES `media_assets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_text_tracks` ADD CONSTRAINT `media_text_tracks_media_asset_id_media_assets_id_fk` FOREIGN KEY (`media_asset_id`) REFERENCES `media_assets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_text_tracks` ADD CONSTRAINT `media_text_tracks_language_code_languages_code_fk` FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organisation_branding` ADD CONSTRAINT `organisation_branding_organisation_id_organisations_id_fk` FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organisation_domains` ADD CONSTRAINT `organisation_domains_organisation_id_organisations_id_fk` FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organisation_memberships` ADD CONSTRAINT `organisation_memberships_organisation_id_organisations_id_fk` FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organisation_memberships` ADD CONSTRAINT `organisation_memberships_user_id_auth_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organisation_unit_memberships` ADD CONSTRAINT `organisation_unit_memberships_unit_id_organisation_units_id_fk` FOREIGN KEY (`unit_id`) REFERENCES `organisation_units`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organisation_unit_memberships` ADD CONSTRAINT `organisation_unit_memberships_user_id_auth_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organisation_units` ADD CONSTRAINT `organisation_units_organisation_id_organisations_id_fk` FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organisation_units` ADD CONSTRAINT `fk_organisation_unit_parent` FOREIGN KEY (`parent_unit_id`) REFERENCES `organisation_units`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organisations` ADD CONSTRAINT `organisations_default_language_code_languages_code_fk` FOREIGN KEY (`default_language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `person_names` ADD CONSTRAINT `person_names_person_id_persons_id_fk` FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `person_names` ADD CONSTRAINT `person_names_language_code_languages_code_fk` FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publication_commentary_editions` ADD CONSTRAINT `fk_pub_commentary_profile` FOREIGN KEY (`publication_profile_id`) REFERENCES `publication_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publication_commentary_editions` ADD CONSTRAINT `fk_pub_commentary_edition` FOREIGN KEY (`commentary_edition_id`) REFERENCES `commentary_editions`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publication_profiles` ADD CONSTRAINT `publication_profiles_organisation_id_organisations_id_fk` FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publication_profiles` ADD CONSTRAINT `publication_profiles_default_language_code_languages_code_fk` FOREIGN KEY (`default_language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publication_scripture_releases` ADD CONSTRAINT `publication_scripture_releases_work_id_scripture_works_id_fk` FOREIGN KEY (`work_id`) REFERENCES `scripture_works`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publication_scripture_releases` ADD CONSTRAINT `fk_pub_scripture_profile` FOREIGN KEY (`publication_profile_id`) REFERENCES `publication_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publication_scripture_releases` ADD CONSTRAINT `fk_pub_scripture_release` FOREIGN KEY (`edition_release_id`) REFERENCES `scripture_edition_releases`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scripture_chapter_localizations` ADD CONSTRAINT `scripture_chapter_localizations_language_code_languages_code_fk` FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scripture_chapter_localizations` ADD CONSTRAINT `fk_chapter_l10n_chapter` FOREIGN KEY (`chapter_id`) REFERENCES `scripture_chapters`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scripture_chapters` ADD CONSTRAINT `scripture_chapters_work_id_scripture_works_id_fk` FOREIGN KEY (`work_id`) REFERENCES `scripture_works`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scripture_edition_releases` ADD CONSTRAINT `scripture_edition_releases_edition_id_scripture_editions_id_fk` FOREIGN KEY (`edition_id`) REFERENCES `scripture_editions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scripture_edition_releases` ADD CONSTRAINT `scripture_edition_releases_license_id_content_licenses_id_fk` FOREIGN KEY (`license_id`) REFERENCES `content_licenses`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scripture_edition_releases` ADD CONSTRAINT `fk_scripture_release_source` FOREIGN KEY (`source_document_id`) REFERENCES `source_documents`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scripture_editions` ADD CONSTRAINT `scripture_editions_work_id_scripture_works_id_fk` FOREIGN KEY (`work_id`) REFERENCES `scripture_works`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scripture_editions` ADD CONSTRAINT `scripture_editions_owner_organisation_id_organisations_id_fk` FOREIGN KEY (`owner_organisation_id`) REFERENCES `organisations`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scripture_verses` ADD CONSTRAINT `scripture_verses_chapter_id_scripture_chapters_id_fk` FOREIGN KEY (`chapter_id`) REFERENCES `scripture_chapters`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scripture_work_names` ADD CONSTRAINT `scripture_work_names_work_id_scripture_works_id_fk` FOREIGN KEY (`work_id`) REFERENCES `scripture_works`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scripture_work_names` ADD CONSTRAINT `scripture_work_names_language_code_languages_code_fk` FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scripture_works` ADD CONSTRAINT `scripture_works_canonical_language_code_languages_code_fk` FOREIGN KEY (`canonical_language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `source_documents` ADD CONSTRAINT `source_documents_organisation_id_organisations_id_fk` FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `source_documents` ADD CONSTRAINT `source_documents_license_id_content_licenses_id_fk` FOREIGN KEY (`license_id`) REFERENCES `content_licenses`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_achievements` ADD CONSTRAINT `user_achievements_user_id_auth_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_achievements` ADD CONSTRAINT `user_achievements_achievement_id_achievements_id_fk` FOREIGN KEY (`achievement_id`) REFERENCES `achievements`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_achievements` ADD CONSTRAINT `user_achievements_enrolment_id_course_enrolments_id_fk` FOREIGN KEY (`enrolment_id`) REFERENCES `course_enrolments`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_consents` ADD CONSTRAINT `user_consents_user_id_auth_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_consents` ADD CONSTRAINT `user_consents_organisation_id_organisations_id_fk` FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_consents` ADD CONSTRAINT `user_consents_granted_by_user_id_auth_users_id_fk` FOREIGN KEY (`granted_by_user_id`) REFERENCES `auth_users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_learning_notes` ADD CONSTRAINT `verse_learning_notes_verse_id_scripture_verses_id_fk` FOREIGN KEY (`verse_id`) REFERENCES `scripture_verses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_learning_notes` ADD CONSTRAINT `verse_learning_notes_language_code_languages_code_fk` FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_learning_notes` ADD CONSTRAINT `fk_verse_note_release` FOREIGN KEY (`edition_release_id`) REFERENCES `scripture_edition_releases`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_progress` ADD CONSTRAINT `verse_progress_enrolment_id_course_enrolments_id_fk` FOREIGN KEY (`enrolment_id`) REFERENCES `course_enrolments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_progress` ADD CONSTRAINT `verse_progress_verse_id_scripture_verses_id_fk` FOREIGN KEY (`verse_id`) REFERENCES `scripture_verses`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_progress` ADD CONSTRAINT `verse_progress_last_language_code_languages_code_fk` FOREIGN KEY (`last_language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_sandhi_analyses` ADD CONSTRAINT `verse_sandhi_analyses_verse_id_scripture_verses_id_fk` FOREIGN KEY (`verse_id`) REFERENCES `scripture_verses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_sandhi_analyses` ADD CONSTRAINT `verse_sandhi_analyses_editor_person_id_persons_id_fk` FOREIGN KEY (`editor_person_id`) REFERENCES `persons`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_sandhi_analyses` ADD CONSTRAINT `fk_sandhi_scripture_release` FOREIGN KEY (`edition_release_id`) REFERENCES `scripture_edition_releases`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_texts` ADD CONSTRAINT `verse_texts_edition_release_id_scripture_edition_releases_id_fk` FOREIGN KEY (`edition_release_id`) REFERENCES `scripture_edition_releases`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_texts` ADD CONSTRAINT `verse_texts_verse_id_scripture_verses_id_fk` FOREIGN KEY (`verse_id`) REFERENCES `scripture_verses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_texts` ADD CONSTRAINT `verse_texts_language_code_languages_code_fk` FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_texts` ADD CONSTRAINT `verse_texts_script_code_writing_scripts_code_fk` FOREIGN KEY (`script_code`) REFERENCES `writing_scripts`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_token_forms` ADD CONSTRAINT `verse_token_forms_token_id_verse_tokens_id_fk` FOREIGN KEY (`token_id`) REFERENCES `verse_tokens`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_token_forms` ADD CONSTRAINT `verse_token_forms_language_code_languages_code_fk` FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_token_forms` ADD CONSTRAINT `verse_token_forms_script_code_writing_scripts_code_fk` FOREIGN KEY (`script_code`) REFERENCES `writing_scripts`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_token_meanings` ADD CONSTRAINT `verse_token_meanings_token_id_verse_tokens_id_fk` FOREIGN KEY (`token_id`) REFERENCES `verse_tokens`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_token_meanings` ADD CONSTRAINT `verse_token_meanings_language_code_languages_code_fk` FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_tokens` ADD CONSTRAINT `verse_tokens_analysis_id_verse_sandhi_analyses_id_fk` FOREIGN KEY (`analysis_id`) REFERENCES `verse_sandhi_analyses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_translations` ADD CONSTRAINT `verse_translations_verse_id_scripture_verses_id_fk` FOREIGN KEY (`verse_id`) REFERENCES `scripture_verses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_translations` ADD CONSTRAINT `verse_translations_language_code_languages_code_fk` FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_translations` ADD CONSTRAINT `verse_translations_translator_person_id_persons_id_fk` FOREIGN KEY (`translator_person_id`) REFERENCES `persons`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verse_translations` ADD CONSTRAINT `fk_verse_translation_release` FOREIGN KEY (`edition_release_id`) REFERENCES `scripture_edition_releases`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `ai_conversations_user_status_idx` ON `ai_conversations` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `ai_conversations_retention_idx` ON `ai_conversations` (`retention_expires_at`);--> statement-breakpoint
CREATE INDEX `ai_knowledge_chunks_vector_ref_idx` ON `ai_knowledge_chunks` (`vector_index_reference`);--> statement-breakpoint
CREATE INDEX `ai_knowledge_sources_scope_status_idx` ON `ai_knowledge_sources` (`organisation_id`,`course_release_id`,`publication_status`);--> statement-breakpoint
CREATE INDEX `ai_messages_conversation_time_idx` ON `ai_messages` (`conversation_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `ai_messages_parent_idx` ON `ai_messages` (`parent_message_id`);--> statement-breakpoint
CREATE INDEX `ai_policies_org_enabled_idx` ON `ai_policies` (`organisation_id`,`enabled`);--> statement-breakpoint
CREATE INDEX `assessment_attempts_assessment_status_idx` ON `assessment_attempts` (`assessment_id`,`status`);--> statement-breakpoint
CREATE INDEX `assessment_questions_verse_idx` ON `assessment_questions` (`scripture_verse_id`);--> statement-breakpoint
CREATE INDEX `assessment_responses_option_idx` ON `assessment_responses` (`selected_option_id`);--> statement-breakpoint
CREATE INDEX `assessments_module_idx` ON `assessments` (`module_id`);--> statement-breakpoint
CREATE INDEX `audit_events_org_time_idx` ON `audit_events` (`organisation_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `audit_events_entity_idx` ON `audit_events` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `audit_events_actor_time_idx` ON `audit_events` (`actor_user_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `certificate_issues_enrolment_idx` ON `certificate_issues` (`enrolment_id`);--> statement-breakpoint
CREATE INDEX `cohort_memberships_user_idx` ON `cohort_memberships` (`user_id`);--> statement-breakpoint
CREATE INDEX `commentary_editions_owner_status_idx` ON `commentary_editions` (`owner_organisation_id`,`publication_status`);--> statement-breakpoint
CREATE INDEX `commentary_passages_verse_idx` ON `commentary_passages` (`verse_id`);--> statement-breakpoint
CREATE INDEX `content_reviews_entity_idx` ON `content_reviews` (`organisation_id`,`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `content_reviews_reviewer_idx` ON `content_reviews` (`reviewer_user_id`,`decided_at`);--> statement-breakpoint
CREATE INDEX `course_enrolments_user_status_idx` ON `course_enrolments` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `course_enrolments_cohort_idx` ON `course_enrolments` (`cohort_id`);--> statement-breakpoint
CREATE INDEX `course_releases_status_idx` ON `course_releases` (`course_id`,`publication_status`);--> statement-breakpoint
CREATE INDEX `courses_profile_status_idx` ON `courses` (`publication_profile_id`,`status`);--> statement-breakpoint
CREATE INDEX `learner_notes_user_entity_idx` ON `learner_notes` (`user_id`,`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `learning_cohorts_org_status_idx` ON `learning_cohorts` (`organisation_id`,`status`);--> statement-breakpoint
CREATE INDEX `learning_events_org_time_idx` ON `learning_events` (`organisation_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `learning_events_user_time_idx` ON `learning_events` (`user_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `lesson_content_blocks_source_idx` ON `lesson_content_blocks` (`source_entity_type`,`source_entity_id`);--> statement-breakpoint
CREATE INDEX `lesson_progress_lesson_status_idx` ON `lesson_progress` (`lesson_id`,`status`);--> statement-breakpoint
CREATE INDEX `lessons_scripture_verse_idx` ON `lessons` (`scripture_verse_id`);--> statement-breakpoint
CREATE INDEX `media_assets_owner_type_status_idx` ON `media_assets` (`owner_organisation_id`,`asset_type`,`publication_status`);--> statement-breakpoint
CREATE INDEX `media_attachments_asset_idx` ON `media_attachments` (`media_asset_id`);--> statement-breakpoint
CREATE INDEX `organisation_domains_org_idx` ON `organisation_domains` (`organisation_id`);--> statement-breakpoint
CREATE INDEX `organisation_memberships_user_idx` ON `organisation_memberships` (`user_id`);--> statement-breakpoint
CREATE INDEX `organisation_unit_memberships_user_idx` ON `organisation_unit_memberships` (`user_id`);--> statement-breakpoint
CREATE INDEX `organisation_units_org_idx` ON `organisation_units` (`organisation_id`);--> statement-breakpoint
CREATE INDEX `organisation_units_parent_idx` ON `organisation_units` (`parent_unit_id`);--> statement-breakpoint
CREATE INDEX `publication_commentary_order_idx` ON `publication_commentary_editions` (`publication_profile_id`,`display_order`);--> statement-breakpoint
CREATE INDEX `publication_scripture_release_idx` ON `publication_scripture_releases` (`edition_release_id`);--> statement-breakpoint
CREATE INDEX `scripture_chapters_work_sort_idx` ON `scripture_chapters` (`work_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `scripture_releases_status_idx` ON `scripture_edition_releases` (`edition_id`,`publication_status`);--> statement-breakpoint
CREATE INDEX `scripture_editions_work_idx` ON `scripture_editions` (`work_id`);--> statement-breakpoint
CREATE INDEX `scripture_verses_chapter_sort_idx` ON `scripture_verses` (`chapter_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `source_documents_org_rights_idx` ON `source_documents` (`organisation_id`,`rights_status`);--> statement-breakpoint
CREATE INDEX `user_consents_user_org_type_idx` ON `user_consents` (`user_id`,`organisation_id`,`consent_type`);--> statement-breakpoint
CREATE INDEX `verse_progress_verse_status_idx` ON `verse_progress` (`verse_id`,`status`);--> statement-breakpoint
CREATE INDEX `verse_sandhi_verse_idx` ON `verse_sandhi_analyses` (`verse_id`);--> statement-breakpoint
CREATE INDEX `verse_texts_verse_language_idx` ON `verse_texts` (`verse_id`,`language_code`);--> statement-breakpoint
CREATE INDEX `verse_token_meanings_language_idx` ON `verse_token_meanings` (`language_code`);--> statement-breakpoint
CREATE INDEX `verse_translations_verse_language_idx` ON `verse_translations` (`verse_id`,`language_code`);
