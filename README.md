# Living Bliss Digital Library

A Next.js digital learning library with MySQL-backed accounts, cross-device learner progress, Google and Microsoft OpenID Connect, email/password sign-in and email OTP, designed for deployment on Hostinger Node.js hosting.

The current product slice includes a six-module Gita foundations pathway, responsive previews for all 18 chapters, a laptop-first course workspace, and a source-grounded study companion with a vendor-neutral provider contract. See `AI_READINESS.md` for the model-integration and safety boundary.

## Requirements

- Node.js 22 or a compatible current version
- A MySQL 8-compatible database

## Local setup

1. Run `npm ci`.
2. Copy `.env.example` to `.env.local` and enter your database credentials.
3. Import `database/queries/001_create_learner_states.sql`, followed by `database/queries/002_create_authentication.sql`.
4. Configure the authentication, OAuth and Hostinger SMTP values documented in `.env.example`.
5. Run `npm run dev`.

## Commands

- `npm run dev` — start the local development server
- `npm run lint` — run static checks
- `npm run build` — create the production build
- `npm start` — serve the production build
- `npm run test:unit` — run authentication utility tests
- `npm run auth:cleanup` — remove expired authentication records; schedule daily in hPanel
- `npm run db:generate` — generate a Drizzle migration after schema changes

## Local test data

When the site runs with `npm run dev`, a **Local prototype** bar offers three isolated demonstration profiles: a new learner, an active learner ready for assessment, and a course completer with an achievement certificate. Selecting a profile stores the test state in a local-only browser cookie and never writes to MySQL or production learner records. Use **Exit demo** to clear it.

The demo facility is disabled in production by default. Set `ENABLE_DEMO_MODE=true` only in a controlled review environment if stakeholders need the same profile selector there.

See `INTEGRATION_GUIDE.md` for the Hostinger deployment checklist and production notes.
