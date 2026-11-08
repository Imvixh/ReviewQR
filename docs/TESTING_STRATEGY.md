# Testing Strategy — ReviewQR

## Philosophy
Tests verify observable behavior, not implementation. No test may depend on mock data being treated as production data.

## Layers
1. **Unit** (`src/lib/__tests__`) — validation, design tokens, QR generation helpers, session helpers.
2. **Integration** (`api/__tests__`) — auth signup/login/logout, protected route enforcement, QR create/list/update/delete, analytics summary/trend/stands, settings mutations.
3. **E2E smoke** (`e2e/`) — critical paths: create QR → list → scan → copy → click → dashboard reflects counts; customer journey copy-to-clipboard works.

## Frameworks
- Vitest for unit + integration.
- Playwright for e2e (launch Next dev server, run against real routes).
- `npm test` runs vitest; `npm run test:e2e` runs Playwright.

## Auth test contract
- Signup with valid email + strong password → session cookie set, `/api/auth/me` returns user + org.
- Signup with weak password → 400 with field-level error.
- Login with wrong password → 401.
- Access protected route without session → 401 redirect to login.

## QR test contract
- POST `/api/qr` with valid destination → returns `{ qrCode, svg, pngUrl }`, slug unique.
- GET `/api/qr/:id` with different org → 404.
- GET `/api/qr?search=` filters by business name.

## Analytics test contract
- POST `/api/public/scan` with valid token → increments scan count.
- GET `/api/analytics/summary` reflects recorded scans.
- GET `/api/analytics/trend` returns time-series array.

## Customer journey test contract
- `/qr/:token` renders assistant page.
- "Copy & Go" click → server records google_click event.
- No auto-post: page never submits to Google on its own.

## Settings test contract
- PATCH `/api/settings/password` with weak new password → 400.
- POST `/api/settings/delete-account` with wrong confirmation phrase → 400.
- POST `/api/settings/delete-account` with correct phrase → soft-delete.

## Non-functional
- Lighthouse CI: performance ≥ 90, accessibility ≥ 95, best-practices ≥ 90.
- Contrast checks on all UI components via axe-core in e2e.
- Reduced-motion: `prefers-reduced-motion` disables animations.

## CI
GitHub Actions: on push, run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. Block merge on failure.