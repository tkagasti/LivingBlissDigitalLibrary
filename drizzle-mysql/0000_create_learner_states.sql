CREATE TABLE IF NOT EXISTS `learner_states` (
  `id` VARCHAR(36) NOT NULL,
  `display_name` VARCHAR(80) NOT NULL DEFAULT 'Seeker',
  `preferred_language` VARCHAR(30) NOT NULL DEFAULT 'English',
  `learning_mode` VARCHAR(30) NOT NULL DEFAULT 'Mixed learning',
  `completed_lessons` JSON NOT NULL,
  `assessment_score` INT NULL,
  `assessment_passed` BOOLEAN NOT NULL DEFAULT FALSE,
  `member_joined` BOOLEAN NOT NULL DEFAULT FALSE,
  `updated_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `assessment_score_range` CHECK (`assessment_score` IS NULL OR `assessment_score` BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
