# Architecture — ReviewQR

## Current implementation
- **Framework:** Next.js App Router with strict TypeScript.
- **UI:** Tailwind CSS and shared tokens derived from the preserved Stitch design references.
- **Data and authentication:** Supabase clients and authenticated routes are implemented, but live project connectivity, RLS behavior, and end-to-end account flows have not been verified.
- **QR output:** Authenticated QR design records and random public tokens are stored through owner-scoped Supabase routes. Each design stores a `guided` or `direct` destination mode: guided QR output targets the public `/qr/{token}` route, while direct QR output encodes the confirmed HTTPS review URL. Guided QR generation requires a public HTTPS app URL.
- **Public QR and analytics:** The public route resolves a minimal payload and records scan/click requests through token-scoped database functions. Analytics aggregate events through an owner-scoped function. These database behaviors require the forward security migration and have not been verified against a hosted/isolated Supabase project.
- **Exports:** QR Studio downloads a browser-rendered PNG and opens the system print dialog. Resolution, PDF generation, crop marks, and bleed are not certified or verified.

The application is a prototype, not a production-ready SaaS deployment. See `docs/SECURITY.md`, `docs/API_SPEC.md`, and `docs/PROGRESS.md` for verified limitations and release blockers.

## Module layout
```
src/
  app/                 Next.js routes and API route handlers
  components/          Shared layout and QR components
  lib/                 Supabase clients, validation, QR geometry, local state
tests/                 Vitest unit tests
supabase/migrations/   Database migrations and RLS policies
docs/                  Requirements, design, security, testing, and deployment documentation
```

## Tenant isolation
Application QR and business routes filter by the authenticated owner. The forward migration removes known broad public policies, adds restrictive owner/business checks, and ties QR ownership to its business. It has not been applied or tested against PostgreSQL/Supabase; route mocks verify application scoping, not RLS.

## Security posture
Security controls and known policy gaps are documented in `docs/SECURITY.md`. Do not treat authentication, Storage policies, tenant isolation, or hosted database behavior as verified without integration testing.

## Build/run
```bash
npm run build && npm run start   # production
npm run dev                       # local development
```
Typecheck (`tsc --noEmit`) and lint (`eslint .`) run before release.
