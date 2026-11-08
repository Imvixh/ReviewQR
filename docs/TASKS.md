# Tasks — ReviewQR

Status key: NOT STARTED | IN PROGRESS | BLOCKED | VERIFIED

## Repository sync status correction (2026-11-08)

Phase 1–8 entries are now unchecked and marked IN PROGRESS unless explicitly blocked; code presence and a successful build do not establish end-to-end behavior. The current workspace has local lint, typecheck, test, and build checks. QR management/public QR APIs still use local or seed data. Persistent analytics now reports unavailable, while the dashboard only shows browser-local scan/click counts; fabricated review entries and static analytics have been removed. Live auth/session behavior, database-backed QR persistence, public scan/click tracking, Storage authorization, and production RLS have not been verified.

### Remaining release blockers
- [ ] Replace demo/local-storage QR and organization persistence with authenticated Supabase reads and writes [IN PROGRESS]
- [ ] Make auth session handling end-to-end with server-managed Supabase cookies and test it against a configured project [BLOCKED pending configured project verification]
- [ ] Enforce authenticated, owner-scoped Storage uploads and verify bucket policies [BLOCKED pending integration]
- [ ] Persist public scan and review-destination click events with server-side validation [NOT STARTED]
- [ ] Replace static analytics and sample review content with real event data or truthful empty states [IN PROGRESS]
- [ ] Verify every QR creation/edit action produces synchronized poster, dashboard, and customer-flow output [IN PROGRESS]
- [ ] Run end-to-end tests against a provisioned Supabase project and document deployment evidence [BLOCKED pending project access]

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
- [ ] Signup page (`/signup`) — full name, business name, email, password with strength meter + checklist, terms [IN PROGRESS]
- [ ] Protected route middleware (session cookie + server check) [IN PROGRESS]
- [ ] Session persistence (cookie session + localStorage fallback) [IN PROGRESS]
- [ ] Logout handler + session invalidation [IN PROGRESS]
- [ ] Password reset & email verification [BLOCKED w/o active live Supabase SMTP credentials]

## Phase 3 — Business Profile & Branding Assets
- [ ] Remove standalone Business Profile page from sidebar and navigation [IN PROGRESS]
- [ ] Redirect `/business-profile` route cleanly to `/settings` [IN PROGRESS]
- [ ] Move all essential business info (name, category, location, phone, Google Review URL) to Settings [IN PROGRESS]
- [ ] Implement Business Logo upload, replace, remove, client validation (<= 5MB, PNG/JPG/WebP/SVG) [IN PROGRESS]
- [ ] Implement Cover Thumbnail upload, replace, remove, client validation (<= 5MB, PNG/JPG/WebP) [IN PROGRESS]
- [ ] Create image upload API endpoint (`/api/business/upload`) with Supabase Storage and Data URL fallback [IN PROGRESS]
- [ ] Database migration for business branding assets (`supabase/migrations/20261108000002_business_assets.sql`) [IN PROGRESS]

## Phase 4 — Unified QR Creation & Design Studio
- [ ] Merge `/create-qr` and `/qr-studio` into ONE canonical experience (`/qr-studio` with `/create-qr` redirect) [IN PROGRESS]
- [ ] Single entry point in sidebar: "Create Review QR" -> `/qr-studio` [IN PROGRESS]
- [ ] Remove Display Format and physical hardware specs (A5, A6, Sticker selector cards) without leaving layout gaps [IN PROGRESS]
- [ ] Touchpoint setup + Google URL format check integrated into editor; destination ownership verification remains [IN PROGRESS]
- [ ] 4 Module & Eye Geometry architecture options (Classic, Rounded, Dots, Premium Eye) [IN PROGRESS]
- [ ] 2 Center Emblem options: Official Google G and custom Business Logo [IN PROGRESS]
- [ ] 36 Poster Presets, including 15 recently added options [IN PROGRESS]
- [ ] Synchronized Previews & Exports: Single source of truth driving live preview, dashboard card, customer mobile, and 300 DPI exports [IN PROGRESS]

## Phase 5 — QR Management
- [ ] My QR Codes page (`/my-qr-codes`) — bento KPIs, filter toolbar (search, status, location, sort, grid/list), card grid [IN PROGRESS]
- [ ] Stand Inspector & Quick Actions (copy link, test review flow, inspect specs) [IN PROGRESS]
- [ ] Status toggle & deletion with store sync [IN PROGRESS]

## Phase 6 — Customer Review Journey (public, no auth)
- [ ] `/qr/:token` — Customer Review Assistant [IN PROGRESS]
  - Step 1: Dynamic cover thumbnail + business logo + star rating picker [IN PROGRESS]
  - Step 2: Choose suggestion chips + custom review textarea [IN PROGRESS]
  - Step 3: Clipboard copy + "Copy & Go to Google" CTA with modal guidance [IN PROGRESS]
- [ ] Server-side scan counter increment on page load (`/api/public/qr/[token]`) [IN PROGRESS]
- [ ] Server-side click counter on "Copy & Go" (`/api/public/review`) [IN PROGRESS]
- [ ] Reviewer controls final submission — no auto-post, no impersonation, zero review gating [IN PROGRESS]

## Phase 7 — Dashboard & Analytics
- [ ] Welcome banner: Rajesh Kumar greeting, Bettiah location, quick action buttons [IN PROGRESS]
- [ ] Dashboard KPI cards with unavailable states when persistent analytics are disconnected [IN PROGRESS]
- [ ] 6-Step Visual Journey Flow: Setup, Print QR, Guest Scan, Assistant, Auto Copy, Google Post [IN PROGRESS]
- [ ] Active Review Stands & Table Tents: Front Reception, Dining Hall 1, Rooftop Lounge with PDF & print triggers [IN PROGRESS]
- [ ] Google review handoff explanation; no reviews are retrieved or fabricated [IN PROGRESS]
- [ ] Live Stand Poster Standard A5 mockup with dynamic QR, Google wordmark, 5 stars, Download PNG & PDF [IN PROGRESS]
- [ ] Setup checklist and physical stand information [IN PROGRESS]
- [ ] Analytics page (`/analytics`) — local-only counts and unavailable states; persistent charts remain blocked [IN PROGRESS]
- [ ] Customer-controlled Google submission notice; avoid unsupported compliance claims [IN PROGRESS]

## Phase 8 — Settings & Hardening
- [ ] Settings page (`/settings`) — Business Profile & Branding, Account Profile, Stand Defaults, Notifications, Security, Danger Zone [IN PROGRESS]
- [ ] Full Button & Interaction Audit: Every visible control has working handlers [IN PROGRESS]

## Phase 9 — Testing, Build, Deploy
- [x] Unit tests (`tests/`) — 16 tests across 4 suites passing [VERIFIED]
- [x] `npm run typecheck` passes with zero errors [VERIFIED]
- [x] `npm run lint` passes with zero errors [VERIFIED]
- [x] `npm run build` succeeds generating all 20 routes [VERIFIED]
- [x] Document Supabase provisioning steps (`docs/DEPLOYMENT.md`) [VERIFIED]
- [ ] Verify Supabase integrations against a provisioned project [BLOCKED pending integration verification]