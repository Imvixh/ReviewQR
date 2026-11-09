# Security — ReviewQR

This is a local code-state summary, not a security certification or proof of a hosted deployment. On 2026-11-09, read-only schema inspection and disposable two-account authorization/public-QR tests were performed against the configured Supabase project. Storage policies, the migration ledger, and the `pg_policies` catalog were not directly inspectable with the available credentials.

## Secrets and configuration

- Browser code should use only the Supabase project URL and publishable/anon key. Never expose a service-role key, secret key, database password, JWT secret, or other privileged credential in browser code.
- Never prefix a Supabase secret or service-role key with `NEXT_PUBLIC_`; Next.js may include referenced public-prefixed variables in client bundles.
- `.env.example` contains placeholders. Keep `.env.local` and real credentials out of Git.
- Do not print secret values while diagnosing configuration.

## Authentication

- Password storage and auth sessions are delegated to Supabase Auth; the application does not implement password hashing or custom refresh-token tables.
- Middleware checks the Supabase user for protected dashboard routes and fails closed if Supabase configuration is missing.
- Live cookie/session behavior, OAuth provider configuration, password reset delivery, rate limiting, and brute-force protections have not been verified.
- Two-factor authentication, account deletion, and session management controls are not implemented.

## Validation and uploads

- The review-destination API validates an HTTPS URL, disallows embedded credentials, and requires explicit owner confirmation. It does not claim that a URL is a working Google review page.
- QR design writes validate fields server-side and derive owner/business identity from the authenticated session. Read, update, and delete queries filter by the authenticated owner.
- The upload route requires authentication, checks business ownership, limits images to 5 MB, and allows PNG, JPEG, and WebP.
- The security migration makes business assets private and uses expiring signed URLs. Hosted storage policy behavior remains unverified.
- Settings removal actions and several profile/preferences saves are unavailable or browser-local; the UI must not imply server persistence.
- Business category inputs are validated server-side; optional hotel subcategories require migration `20261109000004_business_category_and_public_context.sql`.

## Row Level Security and public QR

The initial migration's public business/QR reads and event inserts are overly broad. The user reports manually applying `20261109000001_secure_qr_public_flow.sql`; the configured project's schema exposed its new QR columns, and its public lookup/scan/click and authenticated analytics RPCs were exercised with disposable test records.

Behavioral RLS checks with two temporary users verified that User A could not read, cross-insert, update, or delete User B's tested business/QR records, and could not read/update User B's profile/preferences or scan events. Authenticated analytics returned only the caller's QR. These tests do not independently establish the full policy catalog or Storage policy state.

**Finding:** an anonymous call to `get_owner_qr_analytics()` returned HTTP 200 with an empty array. No tenant data was returned, but anonymous execution is not needed. The proposed `20261109000002_revoke_anon_owner_analytics.sql` explicitly revokes this execute grant and remains unapplied pending approval. Public event counts are request counts, not unique visitors; public endpoints have no rate limiting.

Public lookup returns a minimal customer payload. Scan/click IDs are derived from the QR token in the database; endpoints do not accept caller-selected attribution IDs. Public event endpoints have no rate limit, and counts are request counts rather than unique people or physical visitors.

AI suggestions use `OPENAI_API_KEY` only in the server route. The endpoint requires customer-authored feedback and a valid public QR token, derives category context from that token, limits text size, and does not log customer feedback. Its five-per-minute in-memory limit is per application process only; configure a shared rate limiter or edge control before multi-instance production use. Provider errors are not converted into generated suggestions. No real provider request or hosted category migration has been verified.

## Review integrity

- ReviewQR does not retrieve or store submitted Google review content.
- Customers control whether to continue and whether to submit on the external destination; ReviewQR does not submit reviews on their behalf.
- URLs are not verified solely by host/path and no Place ID is invented. Google policy compliance has not been independently reviewed or certified.
- Do not gate customers by rating, promise review outcomes, or claim Google affiliation.

## Logging and privacy

Error logging and PII handling have not received a full privacy review. Review logs before production use; do not log passwords, tokens, service credentials, or unnecessary personal data.

Privacy policy, terms of service, data-retention policy, and account-deletion flow are not published or implemented. Do not claim GDPR compliance, automated deletion, SOC 2, or other certification.
