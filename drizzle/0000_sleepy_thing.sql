CREATE TABLE `learner_states` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text DEFAULT 'Seeker' NOT NULL,
	`preferred_language` text DEFAULT 'English' NOT NULL,
	`learning_mode` text DEFAULT 'Mixed learning' NOT NULL,
	`completed_lessons` text DEFAULT '[]' NOT NULL,
	`assessment_score` integer,
	`assessment_passed` integer DEFAULT false NOT NULL,
	`member_joined` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL
);
