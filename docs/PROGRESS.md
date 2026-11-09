# Progress — ReviewQR

Last updated: 2026-11-09

## Business category and review suggestion implementation (2026-11-09)

QR Studio now has a searchable Business Category field using the existing `businesses.category` column, custom category entry, and optional Hotel subcategory selection. The owner-scoped business destination API persists and reloads category values; legacy database schemas without `subcategory` retain category behavior and explicitly reject saving a nonempty subcategory. The public QR payload returns only category/subcategory and its existing customer-facing fields when the RPC migration is applied.

The customer assistant now captures customer-authored experience, supports English/Hindi UI, calls a server-only OpenAI endpoint for three editable phrasings, and preserves customer-controlled editing/copying and the external destination handoff. The endpoint validates input, resolves category from the QR token, applies a five-per-minute per-process throttle, and returns truthful unavailable/error states. It refuses to generate suggestions without descriptive feedback.

**Not verified / blocked:** `20261109000004_business_category_and_public_context.sql` is source only and has not been applied or checked against the live database. `OPENAI_API_KEY` is not configured, so no real provider call was made. The configured app URL is not public HTTPS; guided scans, hosted QR destinations, and physical-device reader testing remain blocked. The in-memory throttle is not sufficient as a distributed production rate limit. The current changes are not certified against a real authenticated browser session or live category persistence.

Local regression tests cover category normalization/validation, mocked API persistence, all five rating values, provider errors, and throttling; those mocks do not establish live Supabase or OpenAI integration.

| Latest check | Result |
|---|---|
| `npm test -- --run` | PASS — 71 tests across 10 files |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — production build; Next.js reports the existing `middleware`→`proxy` deprecation |
| `git diff --check` | PASS — only existing LF-to-CRLF working-copy warnings |
| Browser smoke | PASS — login page rendered; protected `/qr-studio` redirected without a session; an invalid public QR showed the unavailable state; no account or business/QR writes performed |
| Real OpenAI request | BLOCKED — `OPENAI_API_KEY` is absent |
| Authenticated QR creation/customer QR scan | BLOCKED — no authenticated browser session or public HTTPS deployment |

## Local tenant-isolation and public QR milestone

The local implementation now includes authenticated, owner-filtered QR list/create/read/update/delete routes; a forward-only Supabase migration for tenant isolation and token-scoped public QR operations; minimal public QR lookup; token-derived scan/click event recording; and owner-scoped analytics aggregation. QR designs can encode either the saved public `/qr/{token}` URL or the user's exact confirmed HTTPS destination. In guided mode, the customer chooses whether to open the saved HTTPS destination. Customer-authored text is optional; ReviewQR does not generate or submit reviews.

The user reports manually applying `supabase/migrations/20261109000001_secure_qr_public_flow.sql` to the configured Supabase project. Read-only PostgREST schema inspection confirmed its new QR fields; disposable two-account tests verified business/QR persistence, cross-tenant read/insert/update/delete denial, public QR resolution, anonymous scan/click recording, and owner-scoped analytics. Test accounts were deleted afterward and public-table row counts returned to their pre-test baseline. The migration ledger, `pg_policies`, and Storage policies were not directly inspected.

**Live finding:** anonymous execution of `get_owner_qr_analytics()` returned HTTP 200 with an empty array. No data was disclosed, but the grant should be explicitly revoked. The proposed `supabase/migrations/20261109000002_revoke_anon_owner_analytics.sql` is not applied. Browser-cookie end-to-end testing, Storage behavior, and email delivery remain unverified.

The free Maps workflow remains manual: URL-encoded search, owner-selected listing, pasted destination, explicit confirmation, and no Maps API key, scraping, automatic detection, or inferred Place ID. A saved HTTPS URL is not treated as verified merely because it is Google-hosted.

## QR destination modes and localhost correction (2026-11-09)

The root cause of localhost QR output was that the editor always encoded `/qr/{token}` against `window.location.origin`; the entered Google Review URL was only used after that customer page loaded. The current `.env.local` app URL is `http://localhost:3000`, and no public app URL/deployment is configured or verified. Guided QR generation and export now reject localhost, loopback, and private-network origins instead of producing customer-facing local links.

The editor now offers Direct Google Review mode (the confirmed original HTTPS URL is encoded directly) and Guided Review Assistant mode (the public `/qr/{token}` customer page continues to load the separately saved business review URL). Preview, PNG, and print use one resolved target; direct preview can be generated after the user confirms the link without contacting the app backend. The guided customer interface has an optional yellow-star selector, English/Hindi controls, neutral reflection prompts, optional customer-authored text, and clipboard handoff. AI-assisted phrasings require a configured server key and are not considered verified until a real API request succeeds.

`20261109000003_add_qr_destination_modes.sql` is source only and has not been applied. API compatibility fallback keeps legacy guided QR reads/writes working until that column exists; direct account persistence returns an explicit migration-required error. Direct mode can still be exported without that migration. Guided QR scans from customer devices remain blocked until a public HTTPS Next.js deployment (including API routes) is configured and reachable.

## Verification completed in this workspace

| Check | Result |
|---|---|
| `npm test -- --run` | PASS — 59 tests across 8 files |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | NOT VERIFIED for this change — isolated build attempts could not resolve Next.js modules through the temporary `node_modules` junction; the active dev server's `.next` directory was left untouched |
| `git diff --check` | PASS — Git reported existing LF-to-CRLF working-copy warnings |

Browser smoke on the running app confirmed HTTPS Google Maps URL acceptance, unsafe-scheme rejection, direct QR SVG rendering from the confirmed URL, `/api/qr` legacy-schema fallback, and refusal to generate a guided QR with the configured localhost URL. No destination save, QR write, or scan event was triggered in that browser session. These checks do not verify a hosted public deployment or customer-flow end-to-end.

Earlier live integration used only two disposable synthetic `example.com` test users and uniquely named test businesses/QRs. Both users were removed and public-table row counts returned to baseline; no pre-existing business, QR, or event rows were changed. Authenticated browser-cookie behavior was not exercised in that earlier test.

## Current status

| Area | Status | Evidence / blocker |
|---|---|---|
| Maps search and destination validation | VERIFIED locally | Unit tests cover URL encoding, empty fields, unsafe schemes, unknown HTTPS URLs, and host classification |
| Destination persistence | VERIFIED against configured project | Synthetic authenticated users; no real business rows changed |
| Authenticated QR tenant isolation | VERIFIED behaviorally | Two users; cross-owner read/export/insert/update/delete probes denied |
| Public QR lookup and scan/click RPCs | VERIFIED against configured project | Anonymous test token returned intended destination and recorded test events |
| Owner-scoped analytics | VERIFIED with finding | Counts matched per-user test events; anon invocation unexpectedly returned HTTP 200 with no rows |
| QR persistence and reload | VERIFIED at database API level | Test QR rows read back, then test accounts were cleaned up |
| Direct QR target | VERIFIED locally | Real browser rendered QR SVG for the confirmed exact URL; no database write |
| Guided QR public-host guard | VERIFIED locally | The configured localhost URL was rejected and no guided QR was rendered |
| Guided customer flow end-to-end | BLOCKED | No public HTTPS deployment is configured; browser route was not opened to avoid recording a scan |
| Destination-mode persistence | BLOCKED pending migration | `20261109000003_add_qr_destination_modes.sql` is not applied; legacy guided data remains readable |
| Storage uploads and private signed assets | BLOCKED | Storage policy behavior and catalog not inspected |
| Account signup/login and browser customer journey | PARTIALLY VERIFIED | Direct Auth password grant and database API tested; browser-cookie/Playwright flow not run |
| Print/export fidelity and analytics export | NOT STARTED | No print certification or server-side export API |
| Production deployment | BLOCKED | Requires isolated integration verification and explicit rollout approval |
| Current browser smoke | PARTIALLY VERIFIED | Direct mode and local guided-host refusal were exercised; no cloud writes or public customer scan performed |
| Configured Supabase integration | PARTIALLY VERIFIED | Project schema and disposable live tests verified; migration history and policy catalog unavailable |

## Safety constraints observed

- The manually applied migration was not rerun.
- Only disposable test users/businesses/QRs/events were created and removed; counts returned to baseline.
- No commit, push, or deployment was performed.
- `.env.local` remains ignored and unchanged; credential values were not printed.
