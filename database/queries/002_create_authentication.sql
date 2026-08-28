-- Custom authentication for Living Bliss Digital Library.
-- IMPORTANT: this intentionally replaces anonymous prototype learner progress.

CREATE TABLE IF NOT EXISTS `auth_users` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(320) NOT NULL,
  `display_name` VARCHAR(80) NOT NULL,
  `email_verified_at` TIMESTAMP(3) NULL,
  `password_hash` VARCHAR(255) NULL,
  `last_login_at` TIMESTAMP(3) NULL,
  `disabled_at` TIMESTAMP(3) NULL,
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `auth_identities` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `provider` VARCHAR(32) NOT NULL,
  `issuer` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `provider_email` VARCHAR(320) NULL,
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_identity_issuer_subject_unique` (`issuer`, `subject`),
  KEY `auth_identity_user_idx` (`user_id`),
  CONSTRAINT `auth_identity_user_fk` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `auth_sessions` (
  `token_hash` CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `expires_at` TIMESTAMP(3) NOT NULL,
  `absolute_expires_at` TIMESTAMP(3) NOT NULL,
  `last_seen_at` TIMESTAMP(3) NOT NULL,
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `revoked_at` TIMESTAMP(3) NULL,
  PRIMARY KEY (`token_hash`),
  KEY `auth_session_user_idx` (`user_id`),
  KEY `auth_session_expiry_idx` (`expires_at`),
  CONSTRAINT `auth_session_user_fk` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `auth_challenges` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(320) NOT NULL,
  `purpose` VARCHAR(32) NOT NULL,
  `code_hash` CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `attempts_remaining` TINYINT UNSIGNED NOT NULL DEFAULT 3,
  `metadata_encrypted` TEXT NULL,
  `expires_at` TIMESTAMP(3) NOT NULL,
  `consumed_at` TIMESTAMP(3) NULL,
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `auth_challenge_email_idx` (`email`),
  KEY `auth_challenge_expiry_idx` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `auth_oidc_transactions` (
  `state_hash` CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `provider` VARCHAR(32) NOT NULL,
  `link_user_id` VARCHAR(36) NULL,
  `payload_encrypted` TEXT NOT NULL,
  `return_to` VARCHAR(512) NOT NULL,
  `expires_at` TIMESTAMP(3) NOT NULL,
  `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`state_hash`),
  KEY `auth_oidc_expiry_idx` (`expires_at`),
  KEY `auth_oidc_link_user_idx` (`link_user_id`),
  CONSTRAINT `auth_oidc_link_user_fk` FOREIGN KEY (`link_user_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `auth_rate_limits` (
  `key_hash` CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `request_count` INT UNSIGNED NOT NULL DEFAULT 1,
  `expires_at` TIMESTAMP(3) NOT NULL,
  PRIMARY KEY (`key_hash`),
  KEY `auth_rate_limit_expiry_idx` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `learner_states`;

CREATE TABLE `learner_states` (
  `user_id` VARCHAR(36) NOT NULL,
  `display_name` VARCHAR(80) NOT NULL DEFAULT 'Seeker',
  `preferred_language` VARCHAR(30) NOT NULL DEFAULT 'English',
  `learning_mode` VARCHAR(30) NOT NULL DEFAULT 'Mixed learning',
  `completed_lessons` JSON NOT NULL,
  `assessment_score` INT NULL,
  `assessment_passed` BOOLEAN NOT NULL DEFAULT FALSE,
  `onboarding_completed` BOOLEAN NOT NULL DEFAULT FALSE,
  `updated_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`user_id`),
  CONSTRAINT `learner_user_fk` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `learner_assessment_score_range` CHECK (`assessment_score` IS NULL OR `assessment_score` BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
