# Senior Developer Task: Revvly — Authentication Cleanup & New Super Admin Platform
## PHASE 1 — AUDIT AND IMPLEMENTATION PLAN

**Status: NOT STARTED** — Implementation plan created pending approval

---

## 1. Current Architecture and Files That Need Changes

### Existing Architecture Overview

The ReviewQR codebase is a Next.js 14+ application with App Router, using Supabase for authentication and PostgreSQL for data storage. The system has a dual-auth structure:

- **Public User Flow**: Anonymous users can create QR codes, design posters, and scan without authentication. Guest tokens encode business details locally.
- **Authenticated Owner Flow**: Users log in via Supabase email/password or Google SSO to manage their own QR codes and businesses.
- **Super Admin Flow**: A separate `/admin` route protected by strict server-side authorization against `public.platform_super_admins` table, requiring AAL2 TOTP 2FA enforcement.

### Key Files Identified for Changes

| Category | Files | Purpose |
|---|---|---|
| **Auth Routes** | `src/app/login/page.tsx` | Public login form (email/password + Google SSO) |
| | `src/app/signup/page.tsx` | Public signup form (full name, business name, password) |
| | `src/app/api/auth/login/route.ts` | Server-side login API |
| | `src/app/api/auth/signup/route.ts` | Server-side signup API |
| | `src/app/api/auth/logout/route.ts` | Server-side logout API |
| **Admin Routes** | `src/app/admin/page.tsx` | Super admin gateway with auth context |
| | `src/app/admin/admin-dashboard-client.tsx` | Client-side dashboard (the selected IDE selection) |
| | `src/app/admin/admin-login-client.tsx` | Super admin login with MFA/TOTP |
| | `src/app/admin/setup-2fa/page.tsx` | TOTP enrollment UI |
| | `src/app/admin/verify-2fa/page.tsx` | TOTP verification UI |
| | `src/app/admin/access-denied.tsx` | 403 access denied screen |
| | `src/app/admin/unconfigured.tsx` | UNCONFIGURED state display |
| **API Routes** | `src/app/api/admin/auth/status/route.ts` | Auth status check API |
| | `src/app/api/admin/qrs/route.ts` | Get all QRs (protected) |
| | `src/app/api/admin/qrs/[id]/route.ts` | PATCH/DELETE individual QR (protected) |
| | `src/app/api/admin/overview/route.ts` | Platform overview metrics (protected) |
| | `src/app/api/admin/qrs/route.ts` | GET all QRs with business details |
| **Middleware** | `src/middleware.ts` | Session protection, auth route blocking |
| **Design System** | `docs/DESIGN_SYSTEM.md` | Design tokens, colors, typography |
| **Database** | `public.platform_super_admins` | Super admin user registry |
| | `profiles`, `businesses`, `qr_codes` | Core data tables |

### Current State Assessment

- ✅ **Super admin infrastructure already exists**: `/admin` route with TOTP 2FA, `platform_super_admins` table check, AAL2 enforcement
- ✅ **API routes are properly guarded**: All admin APIs use `getSuperAdminAuthContext()` 
- ✅ **MFA/TOTP system functional**: Supabase native TOTP with verified factor requirement
- ⚠️ **Branding inconsistency**: Codebase uses "REVELY" but task requires "Revvly"
- ⚠️ **Public login/signup exists**: `/login` and `/signup` routes are publicly accessible and visible in navigation
- ⚠️ **`/super-admin` route does not exist yet**: Need to create new route from scratch
- ⚠️ **Design tokens from Stitch suite not fully leveraged**: Need to reference `stitch_reviewqr_poster_saas_suite`

---

## 2. Login/Signup Removal and Route Cleanup

### 2.1 Public Login Removal

**Files to Modify:**

| File | Changes |
|---|---|
| `src/app/login/page.tsx` | **Remove entirely** — delete file; remove `/login` from navigation |
| `src/app/signup/page.tsx` | **Remove entirely** — delete file; remove `/signup` from navigation |
| `src/middleware.ts` | Remove `/login` and `/signup` from `isAuthRoute` check; add redirects to prevent alternative URL access |
| `src/app/layout.tsx` | Remove "Log In" and "Sign Up" nav links from header |
| `src/app/page.tsx` | Remove signup reference from landing page |
| `src/app/globals.css` | Remove any login/signup related styles if standalone |

**Navigation Removal:**
- Remove nav links in `src/app/login/page.tsx` header (lines 134-147)
- Remove signup/CTA in `src/app/signup/page.tsx` (lines 443-449)
- Remove Google SSO section from login if no longer needed for public

**Route Guards:**
- Middleware: Update `isAuthRoute` check to only match specific paths or remove entirely
- Ensure no redirect loopholes allow `/login` or `/signup` access
- Add `redirectTo` parameter handling to forward unauthenticated users appropriately

**Exception:** `/super-admin` must contain its own secure Super Admin login interface (to be created in Phase 2).

### 2.2 Public Signup Removal

Same as login — complete removal of `/signup` route and page.

**Critical:** Do not leave accessible public signup routes. All entry points must be cleaned.

---

## 3. New `/super-admin` Authentication and Authorization Architecture

### 3.1 Route Structure

Create new `/super-admin` route (NOT reusing `/admin` layout):

```
/super-admin/
  ├── page.tsx          # Main gateway (auth check, redirect, login form)
  ├── login-client.tsx  # Super Admin login with TOTP
  ├── dashboard/        # New dashboard (fresh design, NOT reusing old dashboard)
  ├── setup-2fa/        # TOTP enrollment
  └── verify-2fa/       # TOTP verification
```

### 3.2 Authentication Flow

**Step 1 — Public Access to `/super-admin`:**
- `GET /super-admin` → renders login form if unauthenticated
- `GET /super-admin/login` → email/password form + TOTP challenge

**Step 2 — Credential Verification:**
- User submits email/password → `supabase.auth.signInWithPassword()`
- Server validates via `/api/admin/auth/status` endpoint
- System checks `public.platform_super_admins` table for user membership
- If not registered → FORBIDDEN (403) with access denied message
- If registered but no verified TOTP → MFA_ENROLLMENT_REQUIRED or MFA_CHALLENGE_REQUIRED

**Step 3 — TOTP AAL2 Enforcement:**
- If MFA_CHALLENGE_REQUIRED → prompt for 6-digit TOTP code
- After successful TOTP → session upgraded to aal2
- Only aal2-authenticated users access protected data

**Step 4 — Dashboard Access:**
- Successful auth → redirect to `/super-admin/dashboard`
- Dashboard requires server-side re-verification on every request

### 3.3 Authorization Model

```
User accesses /super-admin
    ↓
Supabase auth.getUser() → { ok: UNAUTHENTICATED }
    ↓
If unauthenticated → show login form
    ↓
User submits credentials → supabase.auth.signInWithPassword()
    ↓
GET /api/admin/auth/status → checks platform_super_admins table
    ↓
If not in platform_super_admins → { ok: FORBIDDEN, user }
    ↓
If in platform_super_admins but no verified TOTP → { ok: MFA_ENROLLMENT_REQUIRED }
    ↓
If verified TOTP but session < aal2 → { ok: MFA_CHALLENGE_REQUIRED, factorId }
    ↓
If verified TOTP + aal2 → { ok: true, user, aal: 'aal2' }
    ↓
Render protected dashboard
```

### 3.4 Key Differences from Existing `/admin`

| Aspect | Existing `/admin` | New `/super-admin` |
|---|---|---|
| **Route path** | `/admin` | `/super-admin` |
| **Design** | Reuses previous dashboard layout | **Fresh, premium SaaS design from scratch** |
| **Navigation** | DashboardShell with KPI cards, table lists | **Distinct navigation structure, cards, visual hierarchy** |
| **Branding** | "REVELY" / "Super Admin Console" | **"Revvly"** (exact brand name) |
| **MFA** | AAL2 TOTP enforced | AAL2 TOTP enforced (same, but fresh implementation) |
| **Purpose** | General admin console | **Super platform governance** |

---

## 4. Super Admin Dashboard Design and Implementation

### 4.1 Design Requirements (from task)

- **Brand name**: Use exact **Revvly** wherever product name is displayed
- **Preserve existing logo design** and placement unless strictly necessary
- **Do not introduce unrelated branding changes**
- **Completely new design**: Do not reuse previous dashboard's layout, navigation structure, cards, or visual hierarchy
- **Premium, modern SaaS design**

### 4.2 Dashboard Pages Required

| Page | Description |
|---|---|
| `/super-admin` | Login gateway — email/password + TOTP challenge |
| `/super-admin/dashboard` | Main platform governance console |
| `/super-admin/setup-2fa` | TOTP enrollment (QR code + secret key display) |
| `/super-admin/verify-2fa` | TOTP verification challenge |

### 4.3 Dashboard Features (New Design)

**Platform Overview Section:**
- Total registered businesses
- Total user accounts  
- Total QR codes generated
- Total physical scans recorded
- Google review handoffs count
- Handoff conversion rate (%)
- AAL2 Verified badge display

**Business Directory:**
- Searchable list of all businesses
- Filter by category, status
- View business details and Google Review URL
- Option to inspect review destination

**QR Code Management:**
- List all QR codes across all businesses
- Status toggle (active/archived)
- Subscription status management (active/trial/expired/suspended)
- Edit business details (name, city, category, Google Review URL)
- Delete QR codes permanently

**Recent Activity Stream:**
- Latest scan events
- Latest business creations
- Real-time telemetry

**Super Admin Profile:**
- User identity display
- AAL2 assurance level badge
- MFA factor management
- Session management

### 4.4 UI Design Specifications

**Color Palette (from Design System + Stitch tokens):**
- Primary: `#005BBF` (Revvly blue) 
- Secondary: `#1A73E8`
- Accent: Emerald/Green tones for active states
- Dark background: `#0B132B` for modals/headers
- Light card background: `#FFFFFF` with subtle borders
- Text: `#0B1C30` (dark), `#FFFFFF` (light)

**Typography:**
- Headers: Plus Jakarta Sans, weight 800/700
- Body: Plus Jakarta Sans, weight 400/500
- Material Symbols Outlined for icons

**Layout:**
- Fixed sidebar (optional) or top header with navigation
- Main content area with cards/sections
- Responsive: mobile-first, tablet, desktop
- Sticky header for dashboard controls

---

## 5. User, QR, Analytics, and Subscription Management

### 5.1 User Management (Super Admin)

**Actions Available:**
- View all registered users with their email and role
- Search/filter users
- No direct user modification (read-only from super admin perspective)
- View user's businesses and QR codes

**Data Display:**
- User ID (hashed or full, depending on policy)
- Email address
- Registration date (if tracked)
- Associated business count
- QR code count

### 5.2 QR Code Management (Cross-Business)

**The super admin can:**
- View ALL QR codes regardless of business ownership
- Toggle status active/archived for any QR
- Change subscription status (active/trial/expired/suspended)
- Edit business details (name, city, category, Google Review URL) for any business
- Delete any QR code permanently

**API Endpoints Needed:**
- `GET /api/admin/qrs` — List all QRs (already exists, guarded by auth)
- `PATCH /api/admin/qrs/[id]` — Update QR status/subscription/business details
- `DELETE /api/admin/qrs/[id]` — Delete QR code

**Status/Subscription Logic (same as existing):**
- `status = 'active'` → review flow LIVE
- `status = 'archived'` → review flow HALTED
- `subscriptionStatus = 'active'` → active subscription
- `subscriptionStatus = 'trial'` → 14-day free trial
- `subscriptionStatus = 'expired'` → review halted (expired subscription)
- `subscriptionStatus = 'suspended'` → review halted (suspended)

### 5.3 Analytics and Metrics

**Platform-Level Metrics (from `getPlatformOverviewMetrics`):**
- `totalUsers` — count from `profiles` table
- `totalBusinesses` — count from `businesses` table
- `totalQrCodes` — count from `qr_codes` table
- `totalScans` — count from `qr_scan_events` table
- `totalDestinationClicks` — count from `review_destination_clicks` table
- `conversionRate` — `(totalDestinationClicks / totalScans) * 100`
- `activeQrCodes` — QRs with status 'active'
- `inactiveQrCodes` — QRs with status ≠ 'active'
- `categoryBreakdown` — distribution by category
- `scanTimeline` — 7-day scan activity timeline
- `recentBusinesses` — latest 10 businesses created
- `recentScans` — latest 15 scan events

**Visualizations:**
- KPI cards (5 metrics in grid)
- Category distribution donut/bars
- Timeline scan activity chart
- Business growth over time

### 5.4 Subscription Lifecycle Management

**Subscription Status Transitions:**
```
active          → archived (when subscriptionStatus → expired/suspended)
trial           → expired (when trial ends)  
expired         → can be reactivated → active
suspended       → can be reactivated → active
archived        → can be reactivated → active
```

**Handling in API:**
- When `subscriptionStatus` set to `expired` or `suspended` → automatically set `status = 'archived'`
- When `subscriptionStatus` set to `active` or `trial` → set `status = 'active'`
- This logic exists in both `admin-dashboard-client.tsx` and `api/admin/qrs/[id]/route.ts`

---

## 6. Existing Data Cleanup and Exact Scope

### 6.1 What Needs Cleanup

**Public Routes to Remove:**
- `/login` — complete removal
- `/signup` — complete removal
- Navigation links to login/signup in header and footers
- Any references to public authentication in components

**Brand Renaming:**
- Replace all instances of "ReviewQR" or "REVELY" with "Revvly" 
- Update page titles, metadata, navigation, branding
- Preserve logo design (do not change unless strictly necessary)

**Super Admin Route Migration:**
- Existing `/admin` routes should remain functional during transition
- New `/super-admin` routes to be added in parallel
- Eventually deprecate `/admin` or redirect to `/super-admin`

**Data Schema Changes:**
- Ensure `public.platform_super_admins` table has appropriate entries
- No data loss — existing user records, QR codes, businesses preserved
- Migration may be needed for column names (existing code checks both `user_id` and `id` columns)

### 6.2 Exact Scope of Changes

| Area | Scope | Risk Level |
|---|---|---|
| **Route Removal** | `/login`, `/signup` pages + nav links | LOW (if middleware guards added) |
| **Brand Renaming** | All "REVELY" → "Revvly" text replacements | MEDIUM (find-and-replace risk) |
| **Super Admin Route** | New `/super-admin` + auth flow | LOW (existing pattern) |
| **Dashboard Redesign** | Fresh `/super-admin/dashboard` design | HIGH (UI consistency) |
| **MFA/TOTP** | Keep existing Supabase TOTP setup | LOW (already implemented) |
| **API Route Guarding** | Ensure all admin APIs check auth | LOW (already guarded) |
| **Middleware Updates** | Update `isProtectedRoute`, `isAuthRoute` | LOW (straightforward) |

---

## 7. Database Changes, Security Implications, and Migration Requirements

### 7.1 Database Schema Requirements

**Existing Table: `public.platform_super_admins`**
- Must contain user IDs of all authorized Super Admins
- Columns: either `user_id` or `id` (code checks both)
- Each row: `user_id` (UUID) or `id` (UUID), `created_at`, possibly `email`
- **Action**: Verify existing entries; add service account if none exist

**Existing Tables (no schema changes needed):**
- `profiles` — user registration data
- `businesses` — business details (owner_id links to profiles)
- `qr_codes` — QR codes with business_id foreign key
- `qr_scan_events` — scan event log entries
- `review_destination_clicks` — Google review handoff log entries

**No new tables required** — existing Supabase auth + platform_super_admins suffices.

### 7.2 Security Implications

**✅ Positive Security Posture:**
- Server-side only authorization (no client-side role checks)
- Strict `platform_super_admins` membership verification
- AAL2 TOTP 2FA enforcement
- All API routes guarded by `getSuperAdminAuthContext()`
- Middleware protects `/super-admin` route

**⚠️ Security Risks to Address:**
1. **Public login/signup removal**: Must ensure no alternative URLs bypass guards
   - Middleware must block `/login` and `/signup` for unauthenticated users appropriately
   - Add redirect logic if needed

2. **Super admin enumeration**: 
   - `platform_super_admins` table should not reveal total count
   - Auth status API should not leak whether user is super admin (already handled — returns FORBIDDEN)

3. **TOTP factor exposure**:
   - MFA challenge reveals `factorId` but only after auth
   - Ensure factor IDs are single-use or time-limited

4. **Session management**:
   - Ensure sign out clears Supabase session completely
   - Router refresh after auth changes to prevent stale state

**⛔ Actions Requiring Production Access:**
- Adding/removing entries from `platform_super_admins` table
- Configuring Supabase TOTP/MFA settings in dashboard
- Setting up service role keys for admin API access
- Verifying existing super admin user entries

### 7.3 Migration Requirements

**Migration 1 — Super Admin Seed (if needed)**
```sql
-- Add initial super admin user
INSERT INTO public.platform_super_admins (user_id, email)
VALUES (
  'YOUR_SUPABASE_USER_UUID_HERE',
  'admin@revvly.app'
);
```

**Migration 2 — Column Normalization (if needed)**
Existing code checks both `user_id` and `id` columns. If table only has one column, may need:
```sql
-- If only 'id' column exists, add 'user_id' as alias
ALTER TABLE public.platform_super_admins ADD COLUMN user_id UUID;
UPDATE public.platform_super_admins SET user_id = id;
```

**Migration 3 — Brand Name Update**
Update any stored brand names in metadata or config tables from "REVELY" to "Revvly".

**Rollback Strategy:**
- All changes are reversible by reversing the SQL/migration
- Keep original `platform_super_admins` data backed up
- Brand name changes can be reverted by updating database rows
- Route changes: keep `/admin` functional while `/super-admin` stabilizes

---

## 8. Testing, Acceptance Criteria, and Deployment Steps

### 8.1 Acceptance Criteria

**Authentication Flow:**
- [ ] Unauthenticated user accessing `/super-admin` → redirected to login form
- [ ] Valid super admin credentials → login success + TOTP challenge
- [ ] Invalid credentials → error message displayed
- [ ] User not in `platform_super_admins` → FORBIDDEN (403) access denied
- [ ] Verified TOTP + aal2 → dashboard renders
- [ ] No verified TOTP → MFA enrollment required prompt

**Dashboard Functionality:**
- [ ] Platform metrics load correctly (all KPI cards populated)
- [ ] Business directory searchable and filterable
- [ ] QR status toggle works for any QR code
- [ ] Subscription status dropdown functions correctly
- [ ] Edit business details form saves successfully
- [ ] Delete QR confirmation and execution works
- [ ] AAL2 Verified badge displays after MFA completion

**Public Route Cleanup:**
- [ ] `/login` route inaccessible (returns 404 or redirect)
- [ ] `/signup` route inaccessible (returns 404 or redirect)
- [ ] Navigation links to login/signup removed from all pages
- [ ] No alternative URLs allow access to removed pages

**Branding:**
- [ ] "Revvly" appears wherever "REVELY" or "ReviewQR" was displayed
- [ ] Logo design preserved (same visual, only name changed if needed)
- [ ] No unrelated branding changes introduced

**TypeScript & Lint:**
- [ ] `npm run typecheck` — 0 errors
- [ ] `npm run lint` — 0 errors
- [ ] All new/modified files pass type checking

### 8.2 Testing Strategy

**Unit Tests (vitest):**
- Test auth status API routes with various user states
- Test middleware routing logic
- Test form validation schemas
- Test TOTP challenge/verification flow (mock Supabase auth)

**Integration Tests:**
- End-to-end auth flow: login → TOTP → dashboard access
- Test all API endpoints with super admin auth headers
- Test dashboard page rendering with authenticated user

**Manual Testing Checklist:**
1. Visit `/super-admin` unauthenticated → shows login form
2. Login with valid super admin creds → TOTP challenge appears
3. Enter correct TOTP → dashboard loads
4. Test all dashboard sections load data
5. Test QR status toggle
6. Test business edit form
7. Test delete QR modal
8. Verify AAL2 badge shows "AAL2 Verified"
9. Test sign out clears session
10. Verify `/login` and `/signup` are blocked

### 8.3 Deployment Steps

**Phase 1 — Development:**
1. Create branch: `git checkout -b feature/revvly-super-admin-cleanup`
2. Implement changes per plan
3. Run: `npm run typecheck && npm run lint && npm test`
4. Fix any errors
5. Start dev server: `npm run dev` — verify all pages work

**Phase 2 — Staging:**
1. Deploy to staging environment
2. Test all auth flows in staging
3. Verify `/login` and `/signup` are blocked
4. Verify `/super-admin` works end-to-end
5. Check typecheck/lint pass

**Phase 3 — Production:**
1. Merge to main after approval
2. Deploy to production
3. Monitor for 48 hours
4. Check Supabase analytics for auth failures
5. Verify no broken links or routes

**Rollback if Needed:**
- Revert branch changes
- Restore `/admin` if `/super-admin` has issues
- Restore login/signup pages if needed for backwards compatibility

---

## 9. Risks, Missing Information, and Actions Requiring Production Access

### 9.1 Identified Risks

| Risk | Mitigation |
|---|---|
| **Breaking existing `/admin` users** | Keep `/admin` functional during transition; add alias redirect `/admin` → `/super-admin` |
| **TOTP enrollment loss** | Ensure existing TOTP factors not deleted; new `/super-admin` setup coexists with `/admin` setup |
| **Data inconsistency** | All API routes use same auth context; transactions atomic |
| **Missing super admin users** | Pre-seed `platform_super_admins` before deployment; have fallback admin creation script |
| **Middleware edge cases** | Test all route permutations: `/super-admin`, `/super-admin/login`, `/super-admin/dashboard`, etc. |
| **Brand name confusion** | Comprehensive find-and-replace; verify no "REVELY" references remain |

### 9.2 Missing Information (Requires Clarification)

- ❓ **Which users should be super admins?** Need list of user UUIDs to add to `platform_super_admins`
- ❓ **Existing `/admin` super admin credentials** — should these continue working, or new `/super-admin` credentials only?
- ❓ **Logo file** — existing Revvly logo asset; whether it needs optimization for new dashboard
- ❓ **Stitch suite reference** — specific design tokens from `stitch_reviewqr_poster_saas_suite` to incorporate
- ❓ **Supabase project URL and keys** — needed for TOTP configuration and admin client setup
- ❓ **Current `platform_super_admins` entries** — need to verify existing super admin users

### 9.3 Actions Requiring Production Access

| Action | Tool/Method |
|---|---|
| Add users to `platform_super_admins` | Supabase SQL editor or migration script |
| Configure Supabase TOTP/MFA settings | Supabase dashboard → Authentication → TOTP |
| Set service role key for admin APIs | `.env` file or server environment |
| Verify existing super admin users | Supabase `SELECT * FROM platform_super_admins` |
| Test TOTP QR code generation | Supabase auth MFA setup flow |
| Deploy to production environment | CI/CD pipeline or manual deployment |

### 9.4 Summary of Dependencies

**Must Complete Before Phase 2:**
1. Verify `platform_super_admins` table has entries or determine who should be added
2. Confirm Supabase project URL and service role key availability
3. Obtain/logo asset confirmation for Revvly branding
4. Approval of implementation plan (this document)

**Can Proceed With (partial implementation):**
- Route file structure creation
- TypeScript type definitions
- Middleware updates (without production deployment)
- Component skeleton development
- Test file creation (with mocks)

---

## NEXT: WAITING FOR EXPLICIT APPROVAL

**PHASE 2 — IMPLEMENT** will begin only after explicit approval from the user.

Please review this implementation plan and approve or request modifications before I proceed with code changes.

**Summary of what will be done in Phase 2 upon approval:**
1. Remove `/login` and `/signup` pages and all navigation links
2. Create new `/super-admin` route with fresh premium SaaS design
3. Implement Super Admin login with email/password + TOTP AAL2
4. Build `/super-admin/dashboard` with platform governance metrics
5. Update branding from "REVELY" to "Revvly" across all pages
6. Ensure all API routes properly guard with super admin auth
7. Run typecheck, lint, and tests
8. Report results and document any blockers