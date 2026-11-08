# Roadmap — ReviewQR

## Q1 2026 (now)
- **Phase 0** — Audit & docs (complete).
- **Phase 1** — Foundation & design system: Next.js 14 + TS + Tailwind + design tokens + component library + Supabase client.
- **Phase 2** — Marketing & Auth: landing, login, signup, protected routes, session persistence.

## Q2 2026
- **Phase 3** — Business Profile: CRUD, live preview, logo, accent, tagline, Google review link verification.
- **Phase 4** — QR Generation & Studio: create QR, 5-tab studio, module geometry, presets, download assets.
- **Phase 5** — QR Management: list/filter, slide-over drawer, batch export, status toggle.

## Q3 2026
- **Phase 6** — Customer Review Journey: `/qr/:token` flow, star picker, suggestions, clipboard, Google handoff, scan/click analytics.
- **Phase 7** — Dashboard & Analytics: overview KPIs, trend chart, stand breakdown, detail table, CSV/PDF export.

## Q4 2026
- **Phase 8** — Settings & Hardening: account profile, defaults, notifications, security/password, danger zone.
- **Phase 9** — Testing, build, deploy: unit/integration/e2e, typecheck, lint, build, Supabase provisioning.

## Milestones
- **M1** — `npm run build` succeeds with zero TypeScript errors.
- **M2** — Auth flow end-to-end (signup → login → protected route → logout).
- **M3** — Create QR → persist → list → scan → click → dashboard reflects counts.
- **M4** — Customer journey renders and copy-to-clipboard works.
- **M5** — Settings danger zone delete requires confirmation phrase.

## Success criteria
Every acceptance criterion in `docs/PRD.md` marked VERIFIED in `docs/TASKS.md`, or explicitly documented as BLOCKED with the exact external blocker.