# Security Policy

_Last reviewed: 2026-07-01_

## About this project
**Pursuit Sync** — 'Velocity' — community platform for Pursuit fellows.

## Data & sensitivity
User profiles, portfolios, GitHub activity = PII. Public repo — extra care with secrets.

## Applicable compliance considerations
- GDPR/CCPA (member profiles)

## Reporting a vulnerability
If you discover a security issue, please email **jesseniatriumph@gmail.com** with a description and steps to
reproduce. Do not open a public issue for security problems. Expect an initial response within
a few business days.

## Baseline security practices for this repo
1. **Secrets** — never commit `.env` or API keys. Secrets live in the hosting provider's
   environment variables (Vercel/Supabase), not in the code. `.env` is git-ignored.
2. **Dependencies** — keep dependencies updated; run `npm audit` (or `pip check`) regularly;
   enable Dependabot alerts on GitHub.
3. **Authentication & access** — use a vetted auth provider; separate admin from regular users;
   enforce least privilege.
4. **Database (Supabase/Postgres)** — enable **Row-Level Security (RLS)** on every table that
   holds user data; test that users can only read/write their own rows.
5. **Transport** — HTTPS only (default on Vercel); no mixed content; secure cookies.
6. **Input handling** — validate and sanitize all user input; use parameterized queries.
7. **Incident response** — if a key leaks: rotate it immediately, invalidate active sessions,
   and record the event. If secrets were ever committed, treat them as compromised and rotate.

## Known items to address
- [ ] Confirm `.env` is git-ignored and no secrets remain in tracked files.
- [ ] Rotate any credentials that were previously committed to git history.
- [ ] Enable RLS on all user-data tables (if using Supabase/Postgres).
- [ ] Turn on Dependabot / dependency scanning for this repo.
