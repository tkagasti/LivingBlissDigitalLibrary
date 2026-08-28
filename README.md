# Living Bliss Digital Library

A Next.js digital learning library with MySQL-backed accounts, cross-device learner progress, Google and Microsoft OpenID Connect, email/password sign-in and email OTP, designed for deployment on Hostinger Node.js hosting.

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

See `INTEGRATION_GUIDE.md` for the Hostinger deployment checklist and production notes.
