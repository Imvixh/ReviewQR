# Architecture — ReviewQR

## Stack
- **Framework:** Next.js 14 (App Router), TypeScript strict.
- **UI:** Tailwind CSS v3, custom token layer derived from `stitch_reviewqr_poster_saas_suite/.../DESIGN.md`.
- **Icons:** Material Symbols Outlined via `@fontsource/material-symbols-outlined`.
- **Data:** Supabase PostgreSQL (Auth + Postgres). Plan: Pro or higher. RLS enabled.
- **Real QR:** `qrcode` npm package (client-side generation, same-origin payload).
- **Export:** Client-side PNG/SVG rendering + PDF export built from stored SVG with CMYK bleed marks in print preset.

## Deviations from suggested stack (reasoned)
Supabase was preferred but environment lacks verified credentials. We implement the full app shell now; Supabase is wired through environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) and will pass production once credentials are provisioned. Auth uses Supabase Auth; if unavailable locally we fall back to a cookie-backed session handler guarded by environment flags.

## Module layout
```
app/
  (auth)/login/page.tsx        FR-03
  (auth)/signup/page.tsx        FR-02
  (auth)/layout.tsx            session-gating chrome
  landing/page.tsx             FR-01
  dashboard/page.tsx          FR-04
  business-profile/page.tsx    FR-05
  create-qr/page.tsx           FR-06
  my-qr-codes/page.tsx         FR-07
  analytics/page.tsx           FR-08
  settings/page.tsx            FR-11
  customer-flow/                  FR-09 (hosted route: qr/:token)
  api/                            server actions + REST routes
  api/auth/[...nextauth]/       Supabase adapter
src/
  components/          Button, Card, StarRating, Chip, Input, Spinner, Drawer…
  lib/                supabase, sessions, qr, analytics, exports, validation
  hooks/              useProtected, useAnalytics
docs/                 PRD, ARCHITECTURE, DATABASE_DESIGN, API_SPEC, DESIGN_SYSTEM, TASKS, PROGRESS, ROADMAP, SECURITY, TESTING_STRATEGY, DEPLOYMENT
```

## Tenant isolation model
All data access goes through `supabase` lib with a row-level check `belongs_to(session.org_id)`. Table-level policies enforce ownership: every row is tagged with an `owner_id`/`organization_id`; queries never select unscoped rows directly. API actions (create/update/delete) re-check the session org_id on the server.

## Security posture
- No secrets committed to the repo or in browser code.
- Server validates all input; PII (email) masked in logs.
- Danger-zone delete requires re-confirmation string validated against canonical title.
- Analytics records only observable events (scan count, click count, not review text).

## Build/run
```bash
npm run build && npm run start   # production
npm run dev                       # local dev (falls back to fake DB if no creds)
```
Typecheck (`tsc --noEmit`) and lint (`eslint .`) run before release.
