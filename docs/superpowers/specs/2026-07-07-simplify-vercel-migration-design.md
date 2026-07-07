# Design: Simplify to a Vercel-deployed Next.js app with Google auth and MongoDB

- **Date:** 2026-07-07
- **Branch:** `feat/simplify-vercel-migration`
- **Status:** Approved (brainstorming complete)

## Background

`intania-oidc` is currently an OIDC identity provider for ESC Chula apps:

- Login/consent UI for **Ory Hydra** (`/oauth2/login`, `/oauth2/consent`) so other
  org apps can "Sign in with Intania".
- Students authenticate with CUNET student ID + password, verified over **gRPC**
  to the org's `intania-auth` backend (LDAP + Postgres + Redis). A `sid` session
  cookie tracks the session.
- All student data (5-step onboarding form, profile) is stored through gRPC
  calls to that backend. This repo has **no database of its own**.
- Reference data (departments, provinces, districts, religions, family
  statuses, countries) is fetched over gRPC (`ListStudentMapping`).
- CI/CD builds a Docker image, pushes to ghcr.io, and deploys on the org's
  own server.

## Goal

Turn this into a **standalone** student registration + profile app:

1. Next.js app deployed on **Vercel** (no Docker, no org server).
2. Authentication via **Google sign-in**, restricted to Chula student emails
   (`@student.chula.ac.th`). The OIDC-provider role is dropped entirely.
3. Data stored in **MongoDB Atlas** (fresh start — no data export from the old
   Postgres; this is a code migration, not a data migration).
4. Keep the existing UI (login shell, 5-step onboarding form, profile) intact.

## Decisions made during brainstorming

| Question | Decision |
| --- | --- |
| Remain an identity provider for other apps? | No — standalone app; delete all OIDC/Hydra parts |
| Plain React (Vite) or Next.js? | Keep Next.js 14 — it *is* React, native on Vercel, and its server side hosts the MongoDB + auth logic |
| Allowed Google accounts | `@student.chula.ac.th` only; student ID derived from email prefix |
| Existing data | Fresh start; new MongoDB starts empty |
| Approach | Incremental refactor (smallest diff, keep all UI) over fresh scaffold or simultaneous Next 15 upgrade |

## Architecture

One Next.js 14 App Router app on Vercel. Three external services:
Google OAuth (sign-in), MongoDB Atlas (data), Vercel (hosting + deploys).

### Authentication — NextAuth (Auth.js) v5, Google provider

- Login page (`/`) replaces the CUNET username/password form with a
  "Sign in with Google" button. The `LoginBox` card shell and styling stay.
- **Domain enforcement, two layers:**
  1. `hd: "student.chula.ac.th"` in the Google authorization params
     (pre-filters the account picker — UX only, not security).
  2. The NextAuth `signIn` callback rejects any email not ending in
     `@student.chula.ac.th` (the actual enforcement).
  Rejected users return to the login page with a Thai error message
  ("กรุณาเข้าสู่ระบบด้วยอีเมลนิสิตจุฬาฯ").
- **Student ID** is derived in the JWT callback from the email prefix
  (`693xxxxx21@student.chula.ac.th` → `693xxxxx21`) and stored in the session
  token. The form's student ID field becomes read-only/prefilled.
- **Sessions:** JWT strategy (encrypted cookie). No session collection in
  MongoDB; suits serverless. The `sid` cookie logic disappears.
- **Route protection:** every place that checks `cookies().get("sid")` today
  (home page redirect, `register/onboarding` layout, profile page) switches to
  `await auth()`. `/logout` calls NextAuth `signOut`.
- **Deleted:** `/oauth2/*` pages, oauth2 components, `src/server/api/hydra.ts`,
  `src/lib/oauth2.ts` (ID-token scope mapping), and the `redirect`-param
  allowlist on the home page (no other apps redirect here anymore).

### Data layer — MongoDB Atlas + Mongoose

- Atlas free tier (M0) to start; region `ap-southeast-1` (Singapore) to match
  a Vercel `sin1` function region.
- Database `intania-registration`, single collection `students` — one document
  per student, keyed by `studentId` (unique index).
- Document shape mirrors the existing protobuf `Student` message
  field-for-field (camelCase, same names) so the five form components and the
  profile page keep working with only an import change. Fields remain optional
  (filled progressively across form steps). Mongoose `timestamps` replaces
  proto `createdAt`/`updatedAt`. `emailVerified` is always `true` (Google
  verified it).
- A hand-written `Student` TS type + Mongoose schema in `src/server/db/`
  replaces `src/generated/**`.
- **Access layer** (replaces `src/server/grpc` + `src/server/controller/auth`):
  - Cached-connection helper (`global` mongoose pattern for serverless reuse).
  - `getStudent(studentId)` replaces gRPC `me()`.
  - `upsertStudent(studentId, partialData)` replaces gRPC `editStudent` and
    the ~80-line field-mask machinery — a `$set` upsert of submitted fields.
    First sign-in creates the document; no separate account-creation step.
  - Server actions keep their names/signatures (`updateStudent(student)`) so
    form components don't change; they read the student ID from the NextAuth
    session instead of the `sid` cookie.
- **Reference data** becomes static TypeScript files in `src/data/`, keeping
  the `{ id, nameTh, nameEn }` shapes: departments (~12 CU Engineering
  departments), Thai provinces (77) and districts (~930) from the public Thai
  administrative dataset, religions, family statuses, countries. No seeding
  step; available at build time. (Can move into MongoDB later if it ever needs
  runtime editing — it effectively never changes.)

### Cleanup

Removed files/dirs: `Dockerfile`, `.dockerignore`, `docker-compose.yaml`,
`.github/workflows/ci.yaml` (Docker→ghcr build), `proto/`, `src/generated/`,
`scripts/` (proto compile + dev oauth client scripts),
`src/components/maps/maps.tsx` (dead code — nothing imports it),
`bun.lockb` (keep pnpm as the single package manager).

Removed dependencies: `@grpc/grpc-js`, `@ory/hydra-client`, `ts-proto`,
`@react-google-maps/api`, `@types/google.maps`, `next-runtime-env`
(Docker-era runtime env injection; Vercel injects env vars natively — use
plain `process.env` with zod validation).

Added dependencies: `next-auth@5`, `mongoose` (+ `vitest` as devDependency).

### CI/CD & deployment

- **Kept, GitHub-only:** `format.yaml` (prettier check), extended with
  `next lint`, `tsc --noEmit`, and `next build` so PRs are verified.
  `release.yaml` (git-cliff changelog + GitHub releases) stays — it deploys
  nothing; drop later if unwanted.
- **Deploys:** Vercel Git integration — preview deployment per PR, production
  on merge to `main`. No deploy workflow files.
- **Env vars:** `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`,
  `MONGODB_URI` (+ `AUTH_URL` for local dev). `.env.example` and README
  rewritten to match, including Google OAuth client setup (redirect URI
  `https://<domain>/api/auth/callback/google`) and the one-time Atlas
  checklist (cluster, DB user, IP allowlist `0.0.0.0/0` for Vercel,
  connection string).

### Error handling

- Non-student email sign-in → back to login page with Thai error message.
- MongoDB unreachable → fail fast; add a simple `error.tsx` boundary with a
  Thai "something went wrong" screen. The current gRPC client's
  infinite-retry loop must **not** survive the migration (it would hang a
  serverless function until timeout).
- Session expired mid-form → server action throws unauthenticated → client
  redirects to login (same behavior as today's `sid` check).

### Testing & verification

- No test suite exists today; this migration adds only:
  - Unit tests (vitest, minimal) for the two security-relevant pure
    functions: email → studentId extraction, and the email-domain check.
  - CI: lint + typecheck + build green.
- Manual E2E checklist on a Vercel preview deployment:
  1. Non-student Google account is rejected with the Thai error message.
  2. Student account signs in; a document appears in Atlas.
  3. All 5 onboarding steps complete and persist.
  4. Data survives logout/login; profile page renders.

## Out of scope

- Next.js 15 / React 19 upgrade (follow-up task).
- Migrating existing student data from the org's Postgres.
- Any continuing OIDC/identity-provider functionality.
- Building a comprehensive test suite.
