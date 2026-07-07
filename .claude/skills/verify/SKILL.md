---
name: verify
description: Build, launch, and drive this app to verify changes at its HTTP surface
---

# Verifying intania-registration

Next.js 14 app. Auth = NextAuth v5 Google (JWT sessions), data = MongoDB
Atlas via Mongoose. Needs `.env` (see `.env.example`).

## Launch

```bash
pnpm install
pnpm dev          # WATCH THE LOG: if port 3000 is busy it silently uses 3001
```

## Drive (unauthenticated)

- `GET /` → login page; must contain `เข้าสู่ระบบด้วย Google`
- `GET /?error=AccessDenied` → must contain the Thai rejection message
- `GET /api/auth/providers` → JSON with `google`
- `GET /profile`, `GET /register/onboarding/1` without cookie → 307 to `/`
- Sign-in redirect check (no Google account needed):
  `GET /api/auth/csrf` → POST `/api/auth/signin/google` with `csrfToken`
  (keep the cookie jar) → 302 Location must contain
  `hd=student.chula.ac.th` and `prompt=select_account`

## Drive (authenticated, no Google login needed)

Mint a session cookie with next-auth's own encoder (run from repo root so
`next-auth` resolves; reads AUTH_SECRET from `.env`):

```js
import { encode } from "next-auth/jwt";
const token = await encode({
    token: { name: "Verify E2E", email: "6999999921@student.chula.ac.th",
             studentId: "6999999921", sub: "verify-e2e" },
    secret: AUTH_SECRET, salt: "authjs.session-token", maxAge: 3600 });
```

Send as `Cookie: authjs.session-token=<token>`. This exercises
`auth()` → `requireStudent()` → MongoDB (creates a real doc in Atlas —
use an obviously fake studentId and delete it after).

- `GET /` with cookie → 307 `/profile`
- `GET /profile` → 200, contains the studentId
- Onboarding order is 5,1,2,3,4: `/register/onboarding/1` = PDPA consent
  (contains `นโยบายการจัดการข้อมูลส่วนบุคคล`), `/2` = personal data
  (contains department names), `/3` = addresses, `/4` = medical,
  `/5` = family → submits to `/complete`

To drive the `updateStudent` server action over the wire: find the action
id in the page's JS chunk (`grep createServerReference` on
`/_next/static/chunks/app/register/onboarding/1/page.js`), then
`POST /register/onboarding/1` with headers `Next-Action: <id>` and
`Content-Type: text/plain;charset=UTF-8`, body = JSON array of args.

## Gotchas

- **Windows curl mangles Thai in `--data` args** (ANSI codepage → `?`).
  Always send Thai payloads with `--data-binary @file` from a UTF-8 file.
- React inserts `<!-- -->` between adjacent text nodes — grep for
  `ปีการศึกษา` with the comment in the pattern or loosen the regex.
- Server-action ids change per build; re-extract, don't hardcode.