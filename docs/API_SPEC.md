# API Specification — ReviewQR

This document describes routes currently implemented under `src/app/api`. Route presence and mocked-client tests do not establish hosted Supabase connectivity or production behavior.

## Authentication

| Method | Path | Authorization | Current behavior |
|---|---|---|---|
| POST | `/api/auth/login` | None | Validates credentials and signs in through Supabase Auth; returns 503 when Supabase is not configured |
| POST | `/api/auth/signup` | None | Validates account fields and calls Supabase Auth; response can indicate that email confirmation is required |
| POST | `/api/auth/logout` | Supabase session | Signs out through Supabase Auth; errors are returned rather than treated as success |

The login and signup pages also use the Supabase browser client directly. Password reset is requested through Supabase Auth; no password-reset API route exists. Live email delivery and auth session behavior have not been tested against a provisioned project.

## Business destination and assets

| Method | Path | Authorization | Current behavior |
|---|---|---|---|
| GET | `/api/business/review-destination` | Authenticated Supabase user | Reads the user's business destination using an `owner_id` filter; private branding assets are returned as expiring signed URLs |
| POST | `/api/business/review-destination` | Authenticated Supabase user | Validates an explicitly confirmed HTTPS URL and optional business category/subcategory, then updates or creates an owner-scoped business row |
| POST | `/api/business/upload` | Authenticated Supabase user | Accepts multipart PNG/JPEG/WebP files up to 5 MB; verifies business ownership; uploads to private `business-assets` storage and updates business metadata |

Google Maps discovery is manual and free. The application opens a URL-encoded Maps search; it does not use a Maps Platform API key, scrape Maps, read the selected listing, or create a Place ID. The owner must copy and confirm a destination URL. HTTPS and user confirmation do not establish that the URL is a working review page or belongs to the business.

The destination API stores the URL in the existing `public.businesses.google_review_url` field. Existing business rows are filtered by `owner_id`; first-save creation requires a business name and city. API tests use a mocked Supabase client. Hosted Supabase connectivity and RLS behavior are unverified.

The existing `businesses.category` field stores standard or custom category names. Optional hotel subcategories require `20261109000004_business_category_and_public_context.sql`; until applied, the API preserves category persistence and returns a migration-required error when a nonempty subcategory is requested.

## Authenticated QR and analytics APIs

| Method | Path | Authorization | Current behavior |
|---|---|---|---|
| GET | `/api/qr` | Authenticated Supabase user | Lists QR designs for the user's owned business |
| POST | `/api/qr` | Authenticated Supabase user | Validates design fields, assigns the authenticated owner/business and a random token, then creates a QR design |
| GET | `/api/qr/:id` | Authenticated Supabase user | Reads a QR design only when its `owner_id` matches the caller and its business is also owned |
| PATCH | `/api/qr/:id` | Authenticated Supabase user | Validates and updates an owner-scoped QR design |
| DELETE | `/api/qr/:id` | Authenticated Supabase user | Deletes an owner-scoped QR design |
| GET | `/api/analytics` | Authenticated Supabase user | Calls the owner-scoped analytics RPC; returns persisted scan requests and destination clicks; unique visitors are not measured |

QR design metadata, including `destinationMode` (`direct` or `guided`), is stored in `public.qr_codes`. Direct mode encodes the exact confirmed HTTPS destination; guided mode encodes the public `/qr/{token}` route and resolves the saved destination on the customer page. The poster PNG and print view use the same generated QR target. Guided preview and export require a public HTTPS application URL; localhost and private-network hosts are rejected. Until `20261109000003_add_qr_destination_modes.sql` is applied, legacy guided reads/writes remain supported and direct account saves return an explicit migration-required response. There is no server-side QR export or CSV/PDF analytics export.

## Public QR APIs

| Method | Path | Authorization | Current behavior |
|---|---|---|---|
| GET | `/api/public/qr/:token` | Public token | Calls a restricted database function and returns only customer-facing business, destination, and poster text fields |
| POST | `/api/public/qr/:token/scan` | Public token | Records a scan request; the database derives QR/business attribution from the token |
| POST | `/api/public/review` | Public token in JSON body | Records a destination click; the database derives QR/business attribution from the token |
| POST | `/api/public/review-suggestions` | Public token, no account | Validates rating/language/customer text, resolves category from the public QR, and requests three phrasings from the configured server-side OpenAI API |

The customer flow requires the forward migration `20261109000001_secure_qr_public_flow.sql` to be applied. It opens the saved HTTPS destination only after a customer action in a new tab; it does not automatically navigate customers or submit reviews. Public event endpoints are not rate limited, so counts are request counts and must not be interpreted as unique physical visitors.

Review suggestions require `OPENAI_API_KEY` (server-only). Empty feedback is rejected; category and rating are contextual only and must not be treated as evidence. The route applies a five-request-per-minute in-process limit; this is not a shared/distributed production rate limit. A missing key, failed provider call, or invalid provider response returns an error rather than a success-shaped fallback. No live OpenAI request has been verified; `20261109000004_business_category_and_public_context.sql` must be applied for the public RPC to return category context.

## Error behavior and validation

Protected business and QR routes require a Supabase-authenticated user and return errors when configuration, authentication, authorization, validation, storage, or database operations fail. Destination URLs must be syntactically valid HTTPS URLs without embedded credentials and require `confirmed: true`. ReviewQR does not infer a review URL from a Maps listing or claim that a Google-hosted URL was verified.

QR writes validate design fields server-side; caller-supplied owner or business identity is ignored. Public token handlers validate tokens before database calls. Storage policy behavior and database authorization remain unverified against a Supabase instance.

## Not implemented

There are no current `/api/org`, `/api/settings/*`, `/api/notifications/*`, server-side export, analytics time-series, or analytics export routes. Do not present these as available in the UI.
