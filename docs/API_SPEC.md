# API Specification — ReviewQR

All server routes run on `/api/*` with Next.js App Router. JSON only. Auth header `Authorization: Bearer <session_token>` required for protected routes. Error envelope: `{ error: { code, message, field? } }` with HTTP 4xx/5xx.

## Auth
| method | path | auth | body | returns |
|---|---|---|---|---|
| POST | `/api/auth/signup` | none | `{ email, password, fullName, businessName }` | `{ user, session }` |
| POST | `/api/auth/login` | none | `{ email, password }` | `{ user, session }` |
| POST | `/api/auth/logout` | session | — | `{ ok: true }` |
| GET  | `/api/auth/me` | session | — | `{ user, org }` |
| POST | `/api/auth/password-reset` | none | `{ email }` | `{ ok: true }` |

## Organizations / Business Profile
| method | path | auth | body | returns |
|---|---|---|---|---|
| GET  | `/api/org` | session | — | `{ org }` |
| PATCH | `/api/org` | session | `{ name?, category?, city?, phone?, email?, address?, accentColor?, logoUrl?, tagline? }` | `{ org }` |

## QR Codes
| method | path | auth | body/params | returns |
|---|---|---|---|---|
| POST | `/api/qr` | session | `{ businessName, category, city, destinationUrl, placementType, headline, tagline, accentColor, template }` | `{ qrCode, svg, pngUrl }` |
| GET  | `/api/qr` | session | `?status&category&search&page&limit` | `{ items[], total, page, limit }` |
| GET  | `/api/qr/:id` | session | — | `{ qrCode, svg, pngUrl }` |
| PATCH | `/api/qr/:id` | session | `{ status?, headline?, tagline?, accentColor?, destinationUrl?, template? }` | `{ qrCode }` |
| DELETE | `/api/qr/:id` | session | — | `{ ok: true }` |
| POST | `/api/qr/:id/export` | session | `{ format: 'png'|'svg'|'pdf', dpi?, bleed? }` | `{ fileUrl }` |
| POST | `/api/qr/verify-destination` | session | `{ url }` | `{ valid: boolean, placeId?, title? }` |

## Analytics
| method | path | auth | params | returns |
|---|---|---|---|---|
| GET | `/api/analytics/summary` | session | `?range=7d|30d|90d|custom&from&to&location` | `{ scans, unique, googleClicks, ctr }` |
| GET | `/api/analytics/trend` | session | `?range&location` | `{ series: [{date, scans, googleClicks}] }` |
| GET | `/api/analytics/stands` | session | `?range&location` | `{ stands: [{qrCodeId, name, placementType, scans, unique, googleClicks, ctr, trend}] }` |
| GET | `/api/analytics/detail` | session | `?range&location&page&limit` | `{ rows: [{qrCodeId, name, placementType, scans, assistantVisits, copyClicks, googleClicks, ctr, status}] }` |
| POST | `/api/analytics/export` | session | `{ range, location, format: 'csv'|'pdf' }` | `{ fileUrl }` |

## Customer-facing (public) — QR scan entry
| method | path | auth | params | returns |
|---|---|---|---|---|
| GET | `/qr/:token` | none | — | Customer assistant page (HTML) |
| POST | `/api/public/scan` | none | `{ token }` | `{ ok: true }` (increments scan counter) |
| POST | `/api/public/click` | none | `{ token, dest: 'google' }` | `{ ok: true }` (increments google_click) |

## Settings
| method | path | auth | body | returns |
|---|---|---|---|---|
| GET  | `/api/settings/profile` | session | — | `{ profile }` |
| PATCH | `/api/settings/profile` | session | `{ fullName, role, email, phone, language }` | `{ profile }` |
| PATCH | `/api/settings/password` | session | `{ current, next }` | `{ ok: true }` |
| POST  | `/api/settings/2fa/enable` | session | `{ totpCode }` | `{ ok: true, backupCodes[] }` |
| POST  | `/api/settings/2fa/disable` | session | `{ totpCode }` | `{ ok: true }` |
| GET  | `/api/settings/sessions` | session | — | `{ sessions: [{id, ua, ip, lastSeen, current}] }` |
| DELETE | `/api/settings/sessions/:id` | session | — | `{ ok: true }` |
| POST | `/api/settings/delete-account` | session | `{ confirm: 'Exact Business Name' }` | `{ ok: true }` |

## Notifications
| method | path | auth | body | returns |
|---|---|---|---|---|
| GET  | `/api/notifications/prefs` | session | — | `{ weeklySummary: bool, milestones: bool, productUpdates: bool, surgeAlerts: bool }` |
| PATCH | `/api/notifications/prefs` | session | `{ weeklySummary?, milestones?, productUpdates?, surgeAlerts? }` | `{ prefs }` |

## Validation rules (server-side)
- email: RFC 5322 regex, unique per org.
- password: ≥ 10 chars, `[A-Z]`, `[a-z]`, `[0-9]`, `[^\w\s]`.
- url: valid https, contains `g.page/r/` or `google.com/maps`.
- slug: `^[a-z0-9-]+$`.
- hex color: `^#[0-9a-fA-F]{6}$`.
- placeId: `^ChIJ[a-zA-Z0-9_-]{27}$` (Google Place ID format).