# Tasks — ReviewQR

Status key: NOT STARTED | IN PROGRESS | BLOCKED | VERIFIED

## Local tenant-isolation and public QR continuation (2026-11-09)

The user reports manually applying `20261109000001_secure_qr_public_flow.sql` to the configured Supabase project. Read-only schema inspection and two disposable test accounts verified QR persistence, public token lookup/scan/click RPCs, tenant isolation for business/QR/profile/preferences/events, and owner-scoped analytics. The migration ledger and policy catalog were not directly inspected. Anonymous execution of owner analytics remains an authorization finding; the proposed follow-up migration revokes it but is not applied.

Earlier local checks passed before the current dual-mode changes. Current checks: 59 Vitest tests across 8 files, lint, typecheck, and `git diff --check` passed. The current build is not verified: isolated builds could not resolve Next.js through the temporary `node_modules` junction, and the active dev server's `.next` output was left untouched. Browser smoke verified direct QR SVG rendering, safe URL validation, legacy guided-list reads, and localhost guided-QR refusal without database writes. No commit, push, deployment, or migration application was performed.

### Remaining release blockers
- [x] Verify migration effects and authenticated tenant isolation against the configured project [VERIFIED behaviorally; migration ledger and `pg_policies` not directly inspected]
- [ ] Revoke anonymous execution of owner analytics using `20261109000002_revoke_anon_owner_analytics.sql` [BLOCKED pending approval to alter hosted grants]
- [ ] Verify Storage policies and signed asset access [BLOCKED; Storage policy catalog not inspected]
- [ ] Verify browser-cookie signup/login flow [BLOCKED; direct Auth password grant only]
- [ ] Verify owner-isolated Storage uploads and private signed assets [BLOCKED pending isolated Storage policies]
- [x] Verify public QR lookup, scan/click writes, and owner analytics against the database [VERIFIED with anonymous analytics grant finding]
- [ ] Re-run the Playwright signup/login/search/save/reload/customer flow [BLOCKED pending browser-cookie verification]
- [ ] Validate browser PNG and print output fidelity; no print certification is claimed [NOT STARTED]
- [ ] Apply `20261109000003_add_qr_destination_modes.sql` before enabling direct-mode account persistence [BLOCKED pending hosted migration approval]
- [ ] Set `NEXT_PUBLIC_APP_URL` to the actual public HTTPS deployment and exercise a guided QR from an external device [BLOCKED; current configured URL is localhost and no public deployment is verified]
- [ ] Add server-side QR and analytics export only if required by the product [NOT STARTED]

## Phase 0 — Project audit & docs
- [x] Create AGENTS.md in repo root [VERIFIED]
- [x] Create docs/PRD.md [VERIFIED]
- [x] Create docs/ARCHITECTURE.md [VERIFIED]
- [x] Create docs/DATABASE_DESIGN.md [VERIFIED]
- [x] Create docs/API_SPEC.md [VERIFIED]
- [x] Create docs/DESIGN_SYSTEM.md [VERIFIED]
- [x] Create docs/TASKS.md [VERIFIED]
- [x] Create docs/PROGRESS.md [VERIFIED]
- [x] Create docs/ROADMAP.md [VERIFIED]
- [x] Create docs/SECURITY.md [VERIFIED]
- [x] Create docs/TESTING_STRATEGY.md [VERIFIED]
- [x] Create docs/DEPLOYMENT.md [VERIFIED]

## Phase 1 — Foundation & design system
- [ ] Initialize Next.js project with TypeScript + Tailwind [IN PROGRESS]
- [ ] Configure Tailwind with design tokens (colors, spacing, typography, radius) [IN PROGRESS]
- [ ] Add fonts: Material Symbols, Plus Jakarta Sans, Inter [IN PROGRESS]
- [ ] Create base layout components: DashboardShell with fixed sidebar + header [IN PROGRESS]
- [ ] Standardize sidebar navigation: Remove dead links and unify creation under single "Create Review QR" [IN PROGRESS]
- [ ] Create reusable UI components: ButtonPrimary, ButtonSecondary, ButtonDestructive, Input, Card, Modal, Toast [IN PROGRESS]
- [ ] Create QRPosterFrame (acrylic stand + mobile header preview) [IN PROGRESS]
- [ ] Add `qrcode` library for real QR generation [IN PROGRESS]
- [ ] Add Supabase client lib + session helpers (Auth + Postgres) [IN PROGRESS]
- [ ] Implement design system tokens as CSS variables + Tailwind theme extension [IN PROGRESS]

## Phase 2 — Marketing & Auth
- [ ] Landing page (`/landing` and `/`) — implementation based on `reviewqr_saas_landing_page/code.html` and `screen.png`; visual fidelity not verified [IN PROGRESS]
- [ ] Login page (`/login`) — email/password + Google SSO + remember-device + password show/hide [IN PROGRESS]
- [ ] Signup page (`/signup`) — full name, business name, email, password strength; acknowledges prototype limitations because legal terms are not published [IN PROGRESS]
- [ ] Protected route middleware (session cookie + server check) [IN PROGRESS]
- [ ] Session persistence (cookie session + localStorage fallback) [IN PROGRESS]
- [ ] Logout handler + session invalidation [IN PROGRESS]
- [ ] Password reset & email verification [BLOCKED w/o active live Supabase SMTP credentials]

## Phase 3 — Business Profile & Branding Assets
- [ ] Remove standalone Business Profile page from sidebar and navigation [IN PROGRESS]
- [ ] Redirect `/business-profile` route cleanly to `/settings` [IN PROGRESS]
- [ ] Keep review destination selection in unified QR Studio; Settings links to that workflow [IN PROGRESS]
- [ ] Implement Business Logo upload and replace (PNG/JPEG/WebP, <= 5 MB); removal remains unavailable [IN PROGRESS]
- [ ] Implement Cover Thumbnail upload and replace (PNG/JPEG/WebP, <= 5 MB); removal remains unavailable [IN PROGRESS]
- [ ] Create image upload API endpoint (`/api/business/upload`) with owner-filtered Supabase Storage persistence [IN PROGRESS; hosted policies unverified]
- [ ] Database migration for business branding assets (`supabase/migrations/20261108000002_business_assets.sql`) [IN PROGRESS]

## Phase 4 — Unified QR Creation & Design Studio
- [ ] Merge `/create-qr` and `/qr-studio` into ONE canonical experience (`/qr-studio` with `/create-qr` redirect) [IN PROGRESS]
- [ ] Single entry point in sidebar: "Create Review QR" -> `/qr-studio` [IN PROGRESS]
- [ ] Remove Display Format and physical hardware specs (A5, A6, Sticker selector cards) without leaving layout gaps [IN PROGRESS]
- [ ] Free manual Google Maps search + pasted HTTPS destination, explicit user confirmation, and owner-scoped Supabase business persistence [IN PROGRESS; mocked API tests pass, live Supabase/RLS not verified]
- [ ] Direct and Guided QR destinations; exact URL preservation, public-origin validation, and mode persistence [IN PROGRESS; local logic/browser checks pass; new hosted migration and public deployment remain blocked]
- [ ] 4 Module & Eye Geometry architecture options (Classic, Rounded, Dots, Premium Eye) [IN PROGRESS]
- [ ] 2 Center Emblem options: Official Google G and custom Business Logo [IN PROGRESS]
- [ ] 36 Poster Presets, including 15 recently added options [IN PROGRESS]
- [ ] Synchronized previews and exports: selected QR mode determines the same preview/PNG/print target; print resolution is not certified [IN PROGRESS]

## Phase 5 — QR Management
- [ ] My QR Codes page (`/my-qr-codes`) — authenticated owner-filtered list with accurate error/empty states [IN PROGRESS; mocked API tests pass]
- [x] Public QR test link resolves through token-scoped API [VERIFIED against configured project with disposable token]
- [ ] QR status update and deletion use owner-filtered API routes [IN PROGRESS; mocked foreign-owner tests pass]

## Phase 6 — Customer Review Journey (public, no auth)
- [ ] `/qr/:token` — public customer-controlled journey [IN PROGRESS; route implemented, hosted migration/RPC not verified]
  - Step 1: Load minimal active QR/business payload from a validated token [IN PROGRESS]
  - Step 2: Optional customer-authored text, English/Hindi controls, neutral reflection prompts, editable AI suggestions [IN PROGRESS; local tests pass, real provider key/request unavailable]
  - Step 3: Safe external destination link opens only after customer action [IN PROGRESS]
- [ ] Business category selection and optional Hotel subcategory [IN PROGRESS; existing category column used, subcategory migration not applied]
- [ ] Customer experience wording and real OpenAI suggestions [BLOCKED for live verification; `OPENAI_API_KEY` is absent]
- [ ] Shared production rate limiting for the public AI endpoint [BLOCKED; current implementation limits each server process only]
- [ ] Verify `20261109000004_business_category_and_public_context.sql` against the configured database [BLOCKED; migration not applied]
- [x] Persist scan event through token-scoped RPC (`/api/public/qr/[token]/scan`) [VERIFIED against configured project; disposable event data cleaned up]
- [x] Persist destination click through token-scoped RPC (`/api/public/review`) [VERIFIED against configured project; disposable event data cleaned up]
- [ ] Reviewer controls final submission — no auto-post, no impersonation, zero review gating [IN PROGRESS]

## Phase 7 — Dashboard & Analytics
- [ ] Dashboard design uses real state or explicit unavailable/empty states [IN PROGRESS]
- [x] Persisted owner-scoped scan/click aggregation [VERIFIED with test events; anon function execution needs revoke]
- [ ] QR list and dashboard load authenticated owner-scoped designs [IN PROGRESS; mocked API tests pass]
- [ ] Time-series charts and server-side exports [NOT STARTED]
- [ ] Customer-controlled Google submission notice; avoid unsupported compliance claims [IN PROGRESS]

## Phase 8 — Settings & Hardening
- [ ] Settings page (`/settings`) — Business Profile & Branding, Account Profile, Security; unsupported export and notification controls are explicitly unavailable [IN PROGRESS]
- [ ] Full Button & Interaction Audit: fake search, notifications, mobile-preview and purge controls removed; remaining routes need review [IN PROGRESS]

## Phase 9 — Testing, build, and deploy
- [x] `npm test -- --run` [VERIFIED locally: 71 tests across 10 files; hosted integrations remain unverified]
- [x] `npm run lint` [VERIFIED locally]
- [x] `npm run typecheck` [VERIFIED locally]
- [x] `npm run build` [VERIFIED locally: 21 pages; middleware deprecation warning remains]
- [ ] Playwright end-to-end flow for the current implementation [BLOCKED pending browser-cookie verification]
- [ ] Apply approved corrective migration `20261109000002_revoke_anon_owner_analytics.sql` [BLOCKED pending approval; do not reapply `20261109000001`]
- [ ] Production deployment [BLOCKED pending integration evidence and explicit approval]
