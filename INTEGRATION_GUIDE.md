# Living Bliss Digital Library — Integration Guide

This package contains the complete source used for the Living Bliss Digital Library review website.

## Included

- Public library home and searchable catalogue
- Jagannatha Dham–first collection structure
- Bhagavad Gita course, lesson and assessment routes
- Free learning membership interface
- Authenticated cross-device progress model and MySQL database migrations
- Google, Microsoft, password and email-code sign-in
- Dashboard, achievements and downloadable certificate
- Responsive and accessible desktop, tablet and mobile styling
- Production images and social preview card

## Main routes

| Route | Purpose |
|---|---|
| `/` | Digital library landing page |
| `/library` | Searchable library catalogue |
| `/course/gita` | Bhagavad Gita course overview |
| `/lesson/gita-2-47` | Mixed-media sample lesson |
| `/assessment/gita-2` | Chapter assessment with 60% pass mark |
| `/dashboard` | Learner progress and achievements |
| `/membership` | Guest, free learner and supporter options |
| `/certificate` | Achievement certificate preview/download |
| `/sign-in` | Account creation, password, OTP, Google and Microsoft sign-in |
| `/onboarding` | Authenticated learner preferences |
| `/account` | Profile, connected providers, password and session security |

## Local setup

1. Install Node.js 22 or a compatible current version.
2. Run `npm ci` from this directory.
3. Copy `.env.example` to `.env.local` and enter your local MySQL credentials.
4. Apply `database/queries/001_create_learner_states.sql`, then `database/queries/002_create_authentication.sql`.
5. Add the database, authentication, OAuth and SMTP values from `.env.example`.
6. Run `npm run dev` for local development.
7. Run `npm run test:unit`, `npm run lint` and `npm run build` before deployment.

## Hostinger deployment

1. In hPanel, create a MySQL database and database user. Keep the generated database name, username and password.
2. Back up any existing database, then import `database/queries/001_create_learner_states.sql` followed by `database/queries/002_create_authentication.sql`. The second migration intentionally clears anonymous prototype progress.
3. Create a Node.js application for this project. Use `npm run build` as the build command and `npm start` as the start command.
4. Add every database and authentication variable from `.env.example` in hPanel. Use independent high-entropy values for `AUTH_OTP_SECRET` and `AUTH_ENCRYPTION_SECRET`.
5. Keep `DB_PASSWORD` in hPanel only. Never commit or upload a populated `.env.local` file.
6. Schedule `npm run auth:cleanup` daily using Hostinger cron.

When the website and database are in the same Hostinger account/server, use the database hostname shown in hPanel (often `localhost`) and leave `DB_SSL=false`. If they are on different servers, allow the web server's IP under Remote MySQL and use the hostname Hostinger supplies.

## Recommended Living Bliss integration

### Option A — subdomain

Deploy this application at `library.livingbliss.org` and add **Digital Library** to the existing Living Bliss navigation. This requires the fewest application changes.

### Option B — `livingbliss.org/library`

Deploy it as a separate application behind the existing domain. Configure the hosting platform to mount the application at `/library`, then make the internal route links base-path aware. A reverse proxy or framework base-path setting can be used depending on the current Living Bliss hosting platform.

## Production items to replace or connect

- Replace the temporary Om text mark with the approved Living Bliss logo asset.
- Register the production Google and Microsoft OAuth applications and verify Hostinger SMTP delivery.
- Connect supporter membership to an approved PCI-compliant payment provider.
- Replace demonstration scripture/course records with editorially approved content and media.
- Connect video streaming, captions, transcripts and slide files.
- Configure certificate verification URLs and authorised issue/revocation workflow.
- Review privacy, consent, retention, accessibility and security requirements before public launch.

## Authentication setup

### Google

Create a Google Cloud OAuth 2.0 Web application, configure the public consent screen and add these redirect URIs:

- `http://localhost:3000/api/auth/oidc/google/callback`
- `https://library.livingbliss.org/api/auth/oidc/google/callback`

Store the client ID and secret only in the corresponding environment variables.

### Microsoft

Create a Microsoft Entra Web application that supports personal Microsoft accounts and organisational accounts. Add these redirect URIs:

- `http://localhost:3000/api/auth/oidc/microsoft/callback`
- `https://library.livingbliss.org/api/auth/oidc/microsoft/callback`

The application uses the multi-tenant `common` OpenID Connect authority. New Microsoft identities confirm their claimed email with a Living Bliss OTP before account creation or linking.

### Hostinger email

Create the `no-reply@livingbliss.org` mailbox, enter its SMTP credentials in hPanel and publish the SPF, DKIM and DMARC records Hostinger supplies. OTPs expire after five minutes and are invalidated after three incorrect attempts.

### Route access

The catalogue, scripture, course and lesson pages remain public. Progress writes, assessments, the dashboard, account settings and certificates require a valid server-side session. OAuth access and refresh tokens are not retained.

## Data model

Authentication uses `auth_users`, `auth_identities`, hashed opaque `auth_sessions`, single-use `auth_challenges`, short-lived encrypted `auth_oidc_transactions` and database-backed `auth_rate_limits`. `learner_states.user_id` associates progress with the authenticated account. Passwords use Argon2id; raw passwords, OTPs and session tokens are never stored.

## Important content principle

Jagannatha Dham remains the flagship and first major publication corpus. The Bhagavad Gita screens demonstrate the reusable learning engine and do not change the agreed Jagannatha-first content strategy.
