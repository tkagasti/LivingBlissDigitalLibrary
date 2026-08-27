# Living Bliss Digital Library

A Next.js digital learning library with MySQL-backed learner profiles and progress, designed for deployment on Hostinger Node.js hosting.

## Requirements

- Node.js 22 or a compatible current version
- A MySQL 8-compatible database

## Local setup

1. Run `npm ci`.
2. Copy `.env.example` to `.env.local` and enter your database credentials.
3. Import `database/queries/001_create_learner_states.sql` into the database.
4. Run `npm run dev`.

## Commands

- `npm run dev` — start the local development server
- `npm run lint` — run static checks
- `npm run build` — create the production build
- `npm start` — serve the production build
- `npm run db:generate` — generate a Drizzle migration after schema changes

See `INTEGRATION_GUIDE.md` for the Hostinger deployment checklist and production notes.
