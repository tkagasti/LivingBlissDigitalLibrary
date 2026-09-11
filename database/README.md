# Living Bliss database

## Migration order

1. Back up the target database.
2. Confirm MySQL 8+ and a database default character set of `utf8mb4`.
3. Apply `queries/001_create_learner_states.sql` only for a brand-new legacy-compatible installation.
4. Apply `queries/002_create_authentication.sql`.
5. Apply `platform-migrations/0000_create_learning_platform.sql` using the Drizzle migration runner.
6. For development/review only, apply `seeds/001_living_bliss_gita_prototype.sql`.

Do not load the prototype seed into a public production environment. Its scripture, translations and commentary are marked for editorial review.

## Future schema changes

Run `npm run db:generate` after editing `db/learning-schema.ts`. Review every generated statement, foreign-key action and index before applying it. Use a separate migration credential and take a tested backup before production migration.

The existing `learner_states` table is a compatibility projection for the current API. New work should use `learner_profiles`, `course_enrolments`, `lesson_progress`, `verse_progress`, `assessment_attempts` and `assessment_responses`.

See `docs/LIVING_BLISS_DATABASE_ARCHITECTURE.md` for the full design, security model and rollout plan.
