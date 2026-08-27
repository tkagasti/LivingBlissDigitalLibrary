# Living Bliss Digital Library — Integration Guide

This package contains the complete source used for the Living Bliss Digital Library review website.

## Included

- Public library home and searchable catalogue
- Jagannatha Dham–first collection structure
- Bhagavad Gita course, lesson and assessment routes
- Free learning membership interface
- Persistent progress model and MySQL database migration
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

## Local setup

1. Install Node.js 22 or a compatible current version.
2. Run `npm ci` from this directory.
3. Copy `.env.example` to `.env.local` and enter your local MySQL credentials.
4. Apply the SQL migration in `database/queries/001_create_learner_states.sql`.
5. Run `npm run dev` for local development.
6. Run `npm run lint` and `npm run build` before deployment.

## Hostinger deployment

1. In hPanel, create a MySQL database and database user. Keep the generated database name, username and password.
2. Open phpMyAdmin for that database and import `database/queries/001_create_learner_states.sql`.
3. Create a Node.js application for this project. Use `npm run build` as the build command and `npm start` as the start command.
4. Add `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_CONNECTION_LIMIT` and `DB_SSL` as application environment variables, using `.env.example` as the template.
5. Keep `DB_PASSWORD` in hPanel only. Never commit or upload a populated `.env.local` file.

When the website and database are in the same Hostinger account/server, use the database hostname shown in hPanel (often `localhost`) and leave `DB_SSL=false`. If they are on different servers, allow the web server's IP under Remote MySQL and use the hostname Hostinger supplies.

## Recommended Living Bliss integration

### Option A — subdomain

Deploy this application at `library.livingbliss.org` and add **Digital Library** to the existing Living Bliss navigation. This requires the fewest application changes.

### Option B — `livingbliss.org/library`

Deploy it as a separate application behind the existing domain. Configure the hosting platform to mount the application at `/library`, then make the internal route links base-path aware. A reverse proxy or framework base-path setting can be used depending on the current Living Bliss hosting platform.

## Production items to replace or connect

- Replace the temporary Om text mark with the approved Living Bliss logo asset.
- Connect registration to the approved identity provider and email-verification process.
- Connect supporter membership to an approved PCI-compliant payment provider.
- Replace demonstration scripture/course records with editorially approved content and media.
- Connect video streaming, captions, transcripts and slide files.
- Configure certificate verification URLs and authorised issue/revocation workflow.
- Review privacy, consent, retention, accessibility and security requirements before public launch.

## Data model

The current implementation uses `learner_states` for a browser-linked learner profile, completed lessons and assessment status. The identifier is stored in a secure, HTTP-only, same-site cookie. For public production, associate progress with an authenticated Living Bliss member ID and retain version references for lessons, assessments and certificates. A browser cookie alone is convenient progress persistence, not a full login system.

## Important content principle

Jagannatha Dham remains the flagship and first major publication corpus. The Bhagavad Gita screens demonstrate the reusable learning engine and do not change the agreed Jagannatha-first content strategy.
