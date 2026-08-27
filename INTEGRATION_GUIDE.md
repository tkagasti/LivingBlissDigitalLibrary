# Living Bliss Digital Library — Integration Guide

This package contains the complete source used for the Living Bliss Digital Library review website.

## Included

- Public library home and searchable catalogue
- Jagannatha Dham–first collection structure
- Bhagavad Gita course, lesson and assessment routes
- Free learning membership interface
- Persistent progress model and D1 database migration
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
3. Configure a Cloudflare D1 database binding named `DB`, or replace the progress API with the database used by your existing website.
4. Apply the SQL migration in `drizzle/0000_sleepy_thing.sql`.
5. Run `npm run dev` for local development.
6. Run `npm run lint` and `npm run build` before deployment.

The sanitized `.openai/hosting.example.json` shows the required Sites bindings. Create your own deployment configuration rather than reusing another site’s project identifier.

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

The demonstration uses `learner_states` for a browser-linked learner profile, completed lessons and assessment status. For public production, associate progress with the authenticated Living Bliss member ID and retain version references for lessons, assessments and certificates.

## Important content principle

Jagannatha Dham remains the flagship and first major publication corpus. The Bhagavad Gita screens demonstrate the reusable learning engine and do not change the agreed Jagannatha-first content strategy.
