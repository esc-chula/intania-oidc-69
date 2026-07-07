<div>
    <h1 align="center">Intania Registration</h1>
</div>

Student registration and profile app for ESC, Faculty of Engineering,
Chulalongkorn University. Students sign in with their university Google
account (`@student.chula.ac.th`); data is stored in MongoDB Atlas; the app
deploys on Vercel.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind / shadcn-ui
- NextAuth (Auth.js) v5 with Google sign-in, restricted to
  `@student.chula.ac.th` (student ID is derived from the email local part)
- MongoDB Atlas via Mongoose — single `students` collection
- Deployed on Vercel (preview per PR, production on merge to `main`)

## Getting started

1. Copy `.env.example` to `.env` and fill it in:
   - `AUTH_SECRET` — generate with `openssl rand -base64 32`
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — a Google OAuth 2.0 Client ID
     (Web application) from the
     [Google Cloud console](https://console.cloud.google.com/apis/credentials)
     with authorized redirect URI
     `http://localhost:3000/api/auth/callback/google` (and
     `https://<production-domain>/api/auth/callback/google` in production)
   - `MONGODB_URI` — a MongoDB Atlas connection string including the
     database name, e.g. `.../intania-registration`
2. Install and run:

```bash
pnpm install
pnpm dev
```

Note: only `@student.chula.ac.th` Google accounts can sign in. To test
locally you need a Chula student account, or temporarily change
`ALLOWED_EMAIL_DOMAIN` in `src/lib/auth-shared.ts` (do not commit that).

## MongoDB Atlas setup (one-time)

1. Create a free (M0) cluster — region Singapore (`ap-southeast-1`) to match
   Vercel's `sin1`.
2. Create a database user, and under Network Access allow `0.0.0.0/0`
   (Vercel functions have no fixed IP).
3. Put the connection string in `MONGODB_URI` (local `.env` and Vercel
   project env vars).

## Reference data

Departments, religions, and family statuses live in `src/data/*.ts` and can
be edited directly. Thai provinces/districts and countries are generated:

```bash
node scripts/generate-geo-data.mjs && pnpm format
```

## Checks

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```