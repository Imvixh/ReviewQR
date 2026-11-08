# Product Requirements Document — ReviewQR

## Goals
Build a SaaS platform that lets local businesses install physical QR-code review posters on tables, counters, and stands. Scanned review text is auto-copied to the clipboard and the customer opens Google Business Profile to submit their own rating. Business owners see real scan counts, unique visitors, Google click-through rate, and per-stand performance analytics.

## Target personas
1. **Local business owners & growth teams**: enterprise-grade tooling, fast poster customization, legible analytics, instant export.
2. **Mobile consumers in the wild**: tap-friendly flow, frictionless review prompts, rapid clipboard-to-Google transition.

## Functional requirements
| ID | Requirement | Acceptance criteria |
|----|-------------|---------------------|
| FR-01 | Landing page visible without auth | Hero, how it works, features, presets, FAQ render; CTA works |
| FR-02 | Email/password signup with strength gate | Password ≥ 10 chars, mixed case + numeral + punctuation; verification email conceptually wired |
| FR-03 | Login redirect to dashboard | Session persisted server-side; protected route enforcement |
| FR-04 | Dashboard overview | Welcome banner, KPI cards (scans, unique visitors, google clicks, CTR), workflow banner, recent stands + reviews feed |
| FR-05 | Business profile CRUD | Name, category, location, phone, email, address, logo, accent color, tagline |
| FR-06 | QR generation, persistence, preview | Real PNG/SVG generated; cached; preview reflects saved profile |
| FR-07 | QR management (list/filter/export) | Search, status filter, category filter, grid/list toggle, slide-over drawer with live poster |
| FR-08 | Analytics with date/location filters | Trend chart, stand breakdown, detailed table, CSV/PDF export |
| FR-09 | Customer review journey | Customer scan → assistant → star pick → suggestions → copy → Google handoff; reviewer controls final submission |
| FR-10 | Observable analytics events | Scans, unique visitors, destination clicks recorded (server-side); dashboard reflects them |
| FR-11 | Settings | Account profile, defaults, notifications, security/password, danger zone |
| FR-12 | Server-side validation & tenant authorization | Every mutation scoped to active session; fields validated server-side |

## Non-functional requirements
- WCAG AA/AAA contrast on all touchpoints.
- Keyboard navigable; focus rings per design system.
- Server renders JSON API responses, never trusting hidden HTML for secrets.
- Row-Level Security in database; no cross-tenant data leakage.

## Verdict
All listed requirements become tickets in `docs/TASKS.md`. Each must reach VERIFIED before claiming completion.
