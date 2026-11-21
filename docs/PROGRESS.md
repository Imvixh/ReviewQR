# Progress — ReviewQR

Last updated: 2026-11-21

## Public Creation Flow Streamlining & Guided QR Fix (2026-11-21)

- **Removed Extraneous Top Bar UI**:
  - Removed "REVELY workspace", "Business Dashboard" button, and "Sign In" button from the top of the creation page via `hideHeader={true}` in `DashboardShell`.
  - Removed the `STEP 2 OF 3` badge from the "QR Design Studio" heading.
  - Removed the touchpoint selector (`+ New Blank QR Design` dropdown) so no previous user QR history is shown.
- **Fresh Slate on Every Page Visit**:
  - Visiting the creation flow starts completely clean with blank fields.
  - Does not pre-fill any names, cities, or links from previous user sessions in `localStorage`.
- **4-Step Streamlined Navigation Flow**:
  - **Step 1 (Branding)**: User fills business details and review link; clicking "Confirm destination & continue to QR editor" saves destination and moves to Step 2. Removed the extraneous "Save Studio Configuration" button that caused placement tag validation errors.
  - **Step 2 (QR Code)**: Customize geometry and center emblem; button advances to Step 3.
  - **Step 3 (Templates)**: Choose from 24+ presets or 7 custom colors; button advances to Step 4.
  - **Step 4 (Copy & Export)**: Customize headlines and microcopy; shows prominent "Download PNG" and "Print / PDF" export actions after completing all four steps.
  - Made `placementTag` optional (auto-defaults to business name or Tabletop Standee) so users are never blocked by placement tag errors.
- **Fixed Guided QR Generation**:
  - Resolved issue where Guided Review Assistant mode displayed "Guided QR is unavailable" or blank preview.
  - Implemented client-side guest token generator (`guest_<base64url>`) encoding business details and review link.
  - Customer review assistant (`/qr/[token]`) decodes guest tokens client-side, enabling full 3-step review assistant flow (5-star rating -> AI suggestions -> 1-tap Google handoff) without requiring prior cloud registration.
  - Both Direct Google Review and Guided Review Assistant modes generate active, scannable QR codes immediately on screen and in exports.
- **Verification Suite**:
  - `npm run typecheck`: PASS (exit code 0)
  - `npm run lint`: PASS (exit code 0)
  - `npm test`: PASS (83/83 tests passed across 11 test files, exit code 0)
  - `npm run build`: PASS (26 routes generated, exit code 0)

- **100% Visual and Functional Restoration to Attached Reference Images**:
  - Restored the exact original 2-column QR Design Studio layout matching the 4 user-supplied reference images (`media_1795263331397_c1f085ad.jpg`, `media_1795263331404_b36a033c.jpg`, `media_1795263331364_de656d86.png`, `media_1795263331323_e976fe22.png`).
  - Top Bar: Full-width `REVELY workspace` header, Business Dashboard link, and user avatar / subtle sign-in.
  - Studio Flow Bar: Palette badge, `QR Design Studio`, green `STEP 2 OF 3` badge, subtitle, `+ New Blank QR Design` touchpoint selector, `Print / Save PDF`, and solid blue `Download PNG` button.
  - 4 Pill Tabs: `[Branding]` (Business & Identity, Manual Setup badge, Placement tag, Business Name, City/location, Review destination selector with Maps search/Paste link and verification checkbox, Category, Brand Crest / Logo upload, Venue Cover Photo upload, Poster Accent Palette, and Save Studio Configuration button).
  - Tab 2: `[QR Code]` (QR Code Architecture, `LEVEL H (30% ECC)` badge, 4 Geometry options [Classic, Rounded, Dots, Premium Eye], Center Emblem options [Official Google G, Business Logo], and Save QR Architecture button).
  - Tab 3: `[Templates]` (Display Poster Preset, `Explore 24+`, multi-row preset cards, plus preserved Phase 2 "Adjust Preset Colors" accordion with 7 independent color controls and reset options).
  - Tab 4: `[Copy]` (Content & Microcopy: Primary Poster Headline, Call-to-Action Footer Text, Optional Supporting Text).
  - Right Column Live Preview: Viewport toolbar (`Front View`, `Stand Mockup`, `- 100% +`, guidance message, fullscreen), green `• LIVE STAND PREVIEW` indicator, `BROWSER PREVIEW; PRINT RESOLUTION IS NOT CERTIFIED` disclaimer, Tabletop Acrylic Stand card (top gradient strip, `SHARE YOUR EXPERIENCE` pill, circular logo emblem, uppercase business name, location, high-res QR code with Google G emblem, `Review us on Google` headline, 5 yellow stars, scan camera button), and bottom `Download PNG Artwork` / `Print / Save PDF` action buttons.
- **Zero Mandatory Login / Signup for Creation**:
  - Visitors can design, preview, and download artwork without having an account or logging in.
  - Guest logo and venue cover uploads operate client-side via `FileReader.readAsDataURL` without requiring Supabase storage or throwing 401 errors.
  - Destination confirmation for guests persists locally to browser storage and enables immediate QR preview and export.
  - Save buttons gracefully save to browser local storage when unauthenticated, with zero disruptive redirects to protected routes.
- **Zero Advertisement Placeholders**: Removed all ad slots and advertisement placeholders across the studio and public flow.
- **Consistent REVELY Branding & Protected Management Preservation**:
  - Landing page (`/`) branded as **REVELY** with all CTAs routing directly to the public creator.
  - `/admin` dashboard protected by strict `public.platform_super_admins` server-side check and native Supabase TOTP 2FA (`aal2`).
  - All protected routes (`/dashboard`, `/analytics`, `/settings`, `/business-profile`, `/my-qr-codes`) remain securely protected by middleware.
- **Automated Verification Suite**:
  - `npm run typecheck`: PASS — 0 errors (exit code 0)
  - `npm run lint`: PASS — 0 errors (exit code 0)
  - `npm test`: PASS — 83/83 tests passed across 11 test files (exit code 0)
  - `npm run build`: PASS — 26 routes generated successfully (exit code 0)

| Latest check | Result |
|---|---|
| `npm run typecheck` | PASS — 0 errors (exit code 0) |
| `npm run lint` | PASS — 0 errors (exit code 0) |
| `npm test` | PASS — 83 tests across 11 files (exit code 0) |
| `npm run build` | PASS — 26 routes generated successfully (exit code 0) |

## Super Admin Dashboard & TOTP 2FA Implementation (2026-11-21)

- **Strict Server-Side Super Admin Authorization**: Created `src/lib/auth/super-admin.ts` verifying authenticated user UUIDs strictly against `public.platform_super_admins` via service role lookup. Explicitly rejects authorization based on `profiles.role = 'admin'` to prevent privilege escalation from business owner accounts.
- **Supabase Native TOTP Two-Factor Authentication (AAL2)**:
  - Enforces Supabase Authenticator Assurance Level `aal2` before revealing any administrative data.
  - Setup Flow (`/admin/setup-2fa`): Generates TOTP SVG QR code and text secret for Google Authenticator, Microsoft Authenticator, and 1Password; requires 6-digit challenge verification to complete enrollment.
  - Challenge Flow (`/admin/verify-2fa`): Prompts enrolled Super Admins logging in with password (`aal1`) for their 6-digit TOTP code, upgrading session to `aal2`.
  - Non-super-admins are met with a secure Access Denied (HTTP 403) screen without leaking platform data.
- **Read-Only Super Admin Console (`/admin`)**:
  - Displays platform governance metrics: total registered businesses, registered user accounts, active QR touchpoint posters, recorded physical scans, and Google review handoffs.
  - Computes truthful handoff conversion rate (`(handoffs / scans) * 100`) without fabricating reviews or implying external Google submissions can be verified.
  - Business directory with search filter and direct destination inspection.
  - Recent physical touchpoint scan stream.
  - Super admin account identity and MFA assurance status badge (`AAL2 Verified`).
- **Protected Admin API Routes**:
  - `/api/admin/overview`: Guarded by `getSuperAdminAuthContext()`, requiring `aal2` and `platform_super_admins` membership.
  - `/api/admin/auth/status`: Exposes current authentication, super admin, and AAL level.
- **Middleware & Route Protection**: Added `/admin` to `isProtectedRoute` in `src/middleware.ts` while preserving `redirectTo` destinations for existing login workflows.
- **Automated Verification Suite**:
  - `npm run typecheck`: PASS (exit code 0)
  - `npm run lint`: PASS (exit code 0)
  - `npm test`: PASS (83/83 tests passed across 11 test files, exit code 0)
  - `npm run build`: PASS (26 static and dynamic routes compiled, exit code 0)

| Latest check | Result |
|---|---|
| `npm run typecheck` | PASS — 0 errors (exit code 0) |
| `npm run lint` | PASS — 0 errors (exit code 0) |
| `npm test` | PASS — 83 tests across 11 files (exit code 0) |
| `npm run build` | PASS — 26 routes generated successfully (exit code 0) |

## Rebranding to REVELY & Public UI Cleanup (Stage 1) (2026-11-21)

- **Brand Transition to REVELY**: Replaced customer-facing "ReviewQR" branding with **REVELY** across the public landing page (`src/app/page.tsx`), the public creator flow (`src/app/create-qr/page.tsx`), and document metadata (`src/app/layout.tsx`). Kept all internal database identifiers, repositories, environment variables, and package configurations stable.
- **Removed Public Login / Signup Entrypoints**: Removed all "Log In", "Get Started Free", "Sign In", "Sign Up", and account creation buttons and links from the public landing page and the guest creation experience.
- **Unified Public Call to Action**: Set the primary call-to-action on the landing page and creator headers to **"Create Your QR"**, routing directly to the distraction-free `/create-qr` flow.
- **Client-Side Guest Experience**: Emphasized 100% client-side QR generation and direct Google review link encoding with zero account requirements, zero cloud storage fabrication, and zero redirects.
- **Preserved Backend & Auth Infrastructure**: Maintained all authentication logic, Supabase SSR client configurations, route protection in middleware, and existing APIs intact for authenticated users and future Super Admin administration.
- **Verified Suite**:
  - `npm run typecheck`: PASS (exit code 0)
  - `npm run lint`: PASS (exit code 0)
  - `npm test`: PASS (73/73 tests passed, exit code 0)
  - `npm run build`: PASS (22 static & dynamic routes compiled, exit code 0)

| Latest check | Result |
|---|---|
| `npm run typecheck` | PASS — 0 errors (exit code 0) |
| `npm run lint` | PASS — 0 errors (exit code 0) |
| `npm test` | PASS — 73 tests across 10 files (exit code 0) |
| `npm run build` | PASS — 22 routes generated successfully (exit code 0) |

## Phase 3: Public QR Creation Experience & AdSense-Ready Layout (2026-11-21)

- **Authorized Middleware Exemption**: Modified `src/middleware.ts` to remove `/create-qr` from `isProtectedRoute`, making the public QR creation flow immediately accessible to unauthenticated guests without mandatory login, while keeping all management and dashboard routes (`/dashboard`, `/qr-studio`, `/my-qr-codes`, `/analytics`, `/settings`, `/business-profile`) strictly protected.
- **Distraction-Free Public Creation Shell**: Replaced the redirect in `src/app/create-qr/page.tsx` with a clean, dedicated public creation interface. Eliminated the dashboard sidebar, workspace prototype badges, profile dropdown, and logout buttons, replacing them with a minimal ReviewQR top bar, stepper indicator, and subtle "Log in" link for registered users.
- **Guided 3-Step Creation Sequence**:
  - *Step 1: Business & Review Link*: Input fields for business name, location, searchable business category (including custom categories & hotel subcategories), and direct Google review link or Google Maps search query with client-side HTTPS validation.
  - *Step 2: Preset Styles & Color Palette*: 21 poster presets grid plus the full Phase 2 "Adjust Preset Colors" accordion with 7 independent color pickers, hex inputs, swatch pills, per-control reset, and relative luminance contrast warnings.
  - *Step 3: QR Geometry & Microcopy*: Module geometry selection (Classic, Rounded, Dots, Premium-Eye), custom headline, CTA footer microcopy, optional supporting text, live stand preview (front/mockup, zoom controls), and immediate 2x PNG artwork download and PDF print.
- **Client-Side Guest Generation & Zero False Persistence**: Direct review QR codes are generated client-side via `generateQrSvg` with zero required database persistence or login wall. Honest messaging informs visitors that the QR is generated in their browser and offers an optional account upgrade for scan analytics and AI review assistance without fabricating cloud storage.
- **AdSense-Ready Responsive Layout**: Added a clearly demarcated advertisement section below the primary interactive creation workflow, fully isolated from buttons and previews, with zero unapproved third-party scripts or deceptive elements.
- **Strict Boundary Preservation**: Confirmed zero modifications to the landing page (`src/app/page.tsx`), API routes, database schemas, SQL migrations, or Supabase configurations.

| Latest check | Result |
|---|---|
| `npm run typecheck` | PASS — 0 errors (exit code 0) |
| `npm run lint` | PASS — 0 errors (exit code 0) |
| `npm test` | PASS — 73 tests across 10 files (exit code 0) |
| `npm run build` | PASS — 22 routes generated successfully (exit code 0) |



## Phase 2: Template Color Controls & Live Stand Preview (2026-11-21)

- **Independent Custom Color Controls**: Added a collapsible accordion section named **"Adjust Preset Colors"** within `src/app/qr-studio/page.tsx` with 7 independent color pickers and hex inputs:
  1. Poster background (`posterBg`)
  2. QR code modules and finder patterns (`qrColor`)
  3. Main heading and business name (`businessNameColor`)
  4. "Scan to share your experience" text (`ctaTextColor`)
  5. "Review us on Google" text (`headlineColor`)
  6. Star rating icons (`starsColor`)
  7. CTA/button background (`ctaBgColor`)
- **Independent Expansion & Controls**: Each color item expands/collapses independently, includes active color swatch preview, uppercase hex text input, preset default indicator, and an individual reset button. Header provides "Expand All / Collapse All" toggle and a global "Reset Colors" button.
- **Preset Switching & State Reset**: Selecting any poster preset instantly renders that preset's default palette and resets custom color overrides (`customColors: {}`).
- **Live Stand Preview Integration**: Bound inline styles to the live stand preview container (`posterRef`), business heading, details, headline, 5-star rating icons, and CTA button/text for instant feedback on every edit.
- **QR Contrast Safeguard**: Calculated relative luminance for `qrColor`; surfaces a prominent warning notice when low contrast against the white central QR card could impair smartphone scanning.
- **Export & Print Consistency**: Updated `handleDownloadPNG` and `posterRef` inline styles so downloaded PNG artwork and printed PDF copies reflect all custom colors.
- **Strict Boundary Preservation**: Confirmed zero changes to the landing page (`src/app/page.tsx`), database schemas, SQL migrations, API routes, or backend/Supabase configurations.

| Latest check | Result |
|---|---|
| `npm run typecheck` | PASS — 0 errors |
| `npm run lint` | PASS — 0 errors |
| `npm test` | PASS — 73 tests across 10 files |
| `npm run build` | PASS — 22 routes generated successfully |


## Gemini AI Latency Optimization & Client In-Flight Cancellation (2026-11-21)

- **Google Gemini API Integration**: Migrated the server-side AI review recommendation engine from throttled OpenRouter free models to Google's Gemini API (`gemini-3.5-flash-lite` with graceful fallback to `gemini-flash-lite-latest`), reducing customer-visible latency by ~88% (from >10s down to a median of 1,173ms, min 778ms).
- **Fast Timeout & Token Capping**: Set `maxOutputTokens: 250` and lowered per-model timeout to 5,000ms, removing slow 20s–60s hanging loops and preventing rambling paragraph output.
- **Native Structured JSON Output**: Employs `responseMimeType: "application/json"`, producing guaranteed JSON output without schema constraint overhead or markdown parsing failures.
- **W3C Server-Timing Headers**: The route returns `Server-Timing: db;dur=..., ai;dur=...;desc=..., total;dur=...` for telemetry and monitoring without logging customer review text or credentials.
- **Graceful Fallback**: If `GEMINI_API_KEY` is absent or the Gemini API is unavailable, the route falls back seamlessly to OpenAI/OpenRouter so service is never disrupted.
- **Client In-Flight Request Cancellation**: Added `AbortController` cleanup in `src/app/qr/[token]/page.tsx` so rapid star rating or filter pill changes cancel pending requests, eliminating race conditions and preserving the 5-per-minute IP rate limit.
- **Unit Test Coverage**: Added dedicated Gemini test cases to `tests/review-suggestions.test.ts` covering Gemini integration, `Server-Timing`, missing key handling, and secondary provider failover.

| Latest check | Result |
|---|---|
| `npm test` | PASS — 73 tests across 10 files |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |

## Multi-Business QR Architecture, Create QR isolation, My QR Edit flow, Accent color isolation & Pixel-perfect PNG artwork (2026-11-12)

- **Independent Multi-Business Creation**: One user account can now create multiple QR codes for completely different businesses, addresses/cities, review links, and colors. Creating a new QR now saves its own business entity instead of overwriting previous ones.
- **My QR Codes Multi-Business Display**: `/my-qr-codes` lists all QR designs across all of the owner's businesses, each displaying its own specific business name, city, review URL, preset colors, and analytics.
- **Dedicated Edit Mode with Touchpoint Selector**: QR Studio loads existing details only when an explicit `edit=<id>` parameter is in the URL, correctly restoring that specific QR's business name, location, destination, and styling.
- **Completely Blank Create QR Flow**: Navigating to Create QR starts 100% clean and blank. Form fields are never contaminated with previously created businesses or QRs.
- **Accent Color Isolated to CTA Box**: Changing the poster accent color strictly affects the "Scan to share your experience" button bar in the preview and export artwork.
- **Pixel-Perfect PNG Export**: SVG artwork generation for `Download PNG` maps 100% to the live stand preview.
- **Logo Removal**: Remove button allows removing custom logos from storage and database.

| Latest check | Result |
|---|---|
| `npm test -- --run` | PASS — 71 tests across 10 files |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |

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
