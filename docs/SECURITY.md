# Security — ReviewQR

## Secrets
- No secrets committed to the repo. `.env.example` documents required variables only.
- Service-role key, DB password, and JWT secret live in environment variables and are never logged or returned to the client.
- `NEXT_PUBLIC_*` keys are intentionally public; everything else is server-only.

## Authentication
- Passwords hashed with bcrypt (cost 12) before storage; never plaintext.
- Sessions stored as HttpOnly, SameSite=Lax cookies with refresh-token rotation.
- 2FA via TOTP (Google Authenticator compatible) — required for admin role.
- Rate limiting on `/api/auth/login` and `/api/auth/signup` (in-memory + Redis later).

## Data validation
- All server routes validate input with a shared `validate()` helper (zod).
- Email regex RFC 5322, password ≥ 10 chars with `[A-Z]`, `[a-z]`, `[0-9]`, `[^\w\s]`.
- URL must contain `g.page/r/` or `google.com/maps`; Place ID matches `^ChIJ[a-zA-Z0-9_-]{27}$`.
- Hex color matches `^#[0-9a-fA-F]{6}$`; slug matches `^[a-z0-9-]+$`.

## Tenant isolation
- Row-Level Security on every table; queries scoped via `app.org_id` session claim.
- Mutations re-check org_id on the server before write.
- Cross-org access returns 404, not 403, to avoid information leakage.

## Review integrity
- **No auto-post**: the customer controls the final Google submission. ReviewQR only drafts text and copies it.
- **No impersonation**: we never submit on behalf of a customer.
- **No gating**: negative reviews are never suppressed or hidden. All star ratings 1–5 are accepted.
- **No rewards**: we never offer incentives for positive reviews.
- Reviews table stores only *intent metadata* (star, category, draft, status), never fabricated content.

## Logging & monitoring
- Never log secrets, passwords, or PII.
- Log request method, path, status, duration, org_id.
- Alert on 5xx spikes and auth failures.

## Danger zone
- Delete account requires a confirmation phrase matching the canonical business title.
- Delete is soft-deleted (status=deleted) for 30 days; hard purge runs after retention window.
- Requires 2FA re-confirmation for admin accounts.