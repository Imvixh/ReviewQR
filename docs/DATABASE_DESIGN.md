# Database Design — ReviewQR

This document describes the schema present in the checked-in Supabase migrations. On 2026-11-09, read-only schema inspection and disposable two-account integration tests were run against the Supabase project configured in `.env.local`; the user reports that the security migration was manually applied. The expected QR columns and token-scoped functions were present and exercised. The migration ledger and `pg_policies` catalog were not accessible with the configured credentials, so the exact applied migration record and policy definitions were not independently inspected. The original migration file's header records its state when authored and is not evidence of its current hosted status.

## Migration-backed tables

The initial migration, `supabase/migrations/20261107000001_initial_schema.sql`, creates:

### `public.profiles`

`id` references `auth.users(id)`; the row stores full name, email, role, optional phone/avatar, and timestamps. An auth-user trigger inserts a profile and default preferences.

### `public.businesses`

Stores `owner_id`, name, unique slug, category, city, contact and address fields, `google_review_url`, optional `google_place_id`, branding fields, verification flag, and timestamps. The business-assets migration adds `logo_path`, `thumbnail_url`, and `thumbnail_path`.

The free Maps workflow does not infer or persist a Place ID. The destination URL is a user-confirmed HTTPS value, not a verified Google review page.

### `public.qr_codes`

Stores `business_id`, `owner_id`, unique public `token`, placement name, headline/tagline, accent color, poster template, status, star-bar flag, and timestamps. The security/public-flow migration adds `supporting_text`, `preset`, `geometry`, and `center_emblem`, plus geometry/emblem constraints and a composite foreign key tying the QR owner to its business. The forward migration `20261109000003_add_qr_destination_modes.sql` adds `destination_mode` (`direct` or `guided`), defaulting existing QR rows to `guided`.

### Event and preference tables

- `public.qr_scan_events`: QR ID, business ID, optional visitor hash, and scan timestamp.
- `public.review_destination_clicks`: QR ID, business ID, optional legacy star/suggestion metadata, and click timestamp.
- `public.user_preferences`: per-user language, notification, and export preference columns.

Public event RPCs insert scan and click rows using IDs derived from an active QR token. Analytics aggregates the event rows by owner and QR. These are anonymous event requests, not unique visitor counts; endpoints have no rate limiting.

## Persistence and public QR resolution

Authenticated QR routes filter by the current Supabase user and the user's business. The QR create route derives both owner and business on the server, validates input, creates a random token, and saves design metadata including the destination mode. A `direct` QR encodes the exact confirmed `google_review_url`; a `guided` QR encodes the public `/qr/{token}` route. The public route resolves only active guided tokens through `get_public_qr_by_token`; it returns a restricted payload and reads the business's current `google_review_url`.

The destination API reads and writes the existing `businesses.google_review_url` column, filters existing rows by `owner_id`, and creates the first business only when business name and city are supplied. Disposable authenticated integration tests verified login, persistence, and isolation against the configured project; app-level mocked tests remain separate from this live database evidence.

## RLS and security status

The initial migration contains broad public business/QR read policies and event insert policies that do not bind event `business_id` to the QR's business. The forward migration `20261109000001_secure_qr_public_flow.sql` is intended to:

- remove those known broad policies and add restrictive owner/business relationship policies;
- add a composite QR-to-business owner foreign key;
- revoke direct anonymous event writes and expose token-scoped `SECURITY DEFINER` functions with a fixed empty search path;
- scope analytics to `auth.uid()`;
- make `business-assets` private and scope Storage access to the authenticated owner and business path.

The configured project exposed the migration's `supporting_text`, `preset`, `geometry`, and `center_emblem` columns. Anonymous lookup, scan, and click RPCs were exercised with disposable QR data; two authenticated test users could not read, insert, update, or delete each other's tested business/QR/profile/preference data, and owner analytics returned only each user's test QR. These probes verify observed behavior, but do not replace inspection of `pg_policies`, the migration ledger, or Storage policies.

An anonymous call to `get_owner_qr_analytics()` unexpectedly returned HTTP 200 with an empty result. It did not expose test or other tenant data, but anonymous execution is unnecessary and increases the callable surface. The proposed follow-up `20261109000002_revoke_anon_owner_analytics.sql` revokes that grant; it has **not** been applied. Storage policy behavior and existing Auth-user inventory were not independently inspected.

## Not present in the schema

There are no `organizations`, custom `users`, `qr_analytics`, `reviews`, or `refresh_tokens` tables in the checked-in migrations. Supabase Auth is the identity provider; `profiles` is the app profile table. Do not use obsolete schema or RLS snippets from earlier versions of this document.
