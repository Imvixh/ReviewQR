---
name: Review Assistant Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#414754'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#727785'
  outline-variant: '#c1c6d6'
  surface-tint: '#005bc0'
  primary: '#005bbf'
  on-primary: '#ffffff'
  primary-container: '#1a73e8'
  on-primary-container: '#ffffff'
  inverse-primary: '#adc7ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006d2c'
  on-tertiary: '#ffffff'
  tertiary-container: '#008939'
  on-tertiary-container: '#ffffff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc7ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#89fa9b'
  tertiary-fixed-dim: '#6ddd81'
  on-tertiary-fixed: '#002108'
  on-tertiary-fixed-variant: '#005320'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system establishes a high-trust, modern SaaS experience designed to bridge physical retail footprints with friction-free digital feedback flows. The brand mood is confident, conversion-oriented, effortless, and meticulously engineered. It honors familiar Google color landmarks (Blue, Red, Yellow, Green) while maintaining the polished, independent authority of modern product software.

The target audience spans two core personas:
1. **Local Business Owners & Growth Teams:** Demanding clear, enterprise-grade tooling, rapid poster customization, legible analytics, and instant export flows (PDF, PNG, vector).
2. **Mobile Consumers in the Wild:** Interacting with QR landing screens on mobile viewports in diverse lighting conditions; needing immediate feedback, tap-friendly touch targets, frictionless review prompts, and rapid clipboard-to-Google transitions.

### Visual Style
The design system operates at the intersection of **Corporate Modern** and **Tactile Precision**:
- **Canvas Base:** High-clarity off-whites (`#F8FAFC`, `#FFFFFF`) layered above subtle cool slate borders (`#E2E8F0`).
- **Typography:** High legibility with distinct hierarchy, pairing modern geometric sans headers with systematic, ergonomic text.
- **Accents:** Distinctive Google four-color telemetry used deliberately for status, multi-step progress rails, and direct brand signposts, counterbalanced by balanced slate neutrals to prevent visual noise.

## Colors

The palette balances authoritative product neutrals with high-recognition primary and status colors derived from the review ecosystem.

### Palette Architecture
- **Primary (`#1A73E8` / `#2563EB`):** Direct action, link targets, active step indicators, and primary interaction triggers.
- **Secondary Slate (`#0F172A` / `#1E293B`):** Deep charcoal slates serving as visual anchors for headings, dark dashboard chrome, and high-contrast badges.
- **System Accents:**
  - *Google Red (`#EA4335`):* High priority notices, mandatory field markers, drop-off warnings, negative sentiment indicators.
  - *Google Amber / Yellow (`#FBBC04` / `#F59E0B`):* Star review metrics, rating selectors, warning states, and tip highlights.
  - *Google Green / Tertiary (`#34A853` / `#16A34A`):* Copy confirmations, successful QR downloads, positive review flows, and validation ticks.
- **Surface Neutrals:**
  - `Canvas`: `#F8FAFC` (Slate 50)
  - `Surface-0`: `#FFFFFF`
  - `Surface-1`: `#F1F5F9` (Slate 100)
  - `Border-Subtle`: `#E2E8F0` (Slate 200)
  - `Text-Muted`: `#64748B` (Slate 500)
  - `Text-Body`: `#334155` (Slate 700)
  - `Text-Display`: `#0F172A` (Slate 900)

Contrast ratios adhere strictly to WCAG AA/AAA standards across all touchpoints.

## Typography

The typographic strategy pairs **Plus Jakarta Sans** for headlines and high-level marketing calls with **Inter** for form labels, administrative tables, interactive chips, and customer-facing review suggestion text.

- **Plus Jakarta Sans** gives product headings geometric friendliness, warm curves, and distinct modern SaaS authority. It renders with high impact in print poster previews and high-level marketing flows.
- **Inter** ensures crystal-clear utility across small touch screens, dense forms, validation labels, and QR helper hints.

Titles above 24px apply negative letter spacing (-0.02em to -0.03em) to ensure tightness and prevent optical drifting on white backgrounds.

## Layout & Spacing

The layout model uses an 8pt base grid with a fluid 12-column system for desktop administration, transitioning to structured single-column stacks for mobile user journeys.

### Layout Rules & Responsive Adaptations
- **Desktop Dashboard Chrome:** Fixed side navigation (240px) paired with a responsive dual-pane layout: form configuration on the left (spanning 5 columns) and dynamic live poster rendering on the right (spanning 7 columns).
- **Mobile Customer Flow:** Strict single-column centered card container (`max-width: 440px`), constrained within safe margins, guaranteeing maximum thumbs-reach comfort.
- **Gutters & Breakpoints:**
  - `Desktop (≥ 1024px)`: 12 columns, `gutter: 1.5rem`, `margin: 2rem`
  - `Tablet (768px – 1023px)`: 8 columns, `gutter: 1rem`, `margin: 1.5rem`
  - `Mobile (< 768px)`: 4 columns or single-column stack, `gutter-mobile: 0.75rem`, `margin-mobile: 1rem`
- **Component Flow Rhythm:** Section blocks use `space-xl` (2rem) separation; related form inputs stick to `space-md` (1rem); interactive helper badges and inline chips maintain `space-sm` (0.5rem) gaps.

## Elevation & Depth

Visual hierarchy is maintained through crisp, low-contrast borders combined with ultra-soft ambient shadow elevation. This prevents the interface from feeling muddy while delivering tangible separation between canvas, interactive cards, and floating previews.

### Elevation Levels
1. **Flat / Base Layer (`Level 0`):**
   - Background canvas `#F8FAFC`.
   - Subtle separator rules: `1px solid #E2E8F0`.
2. **Card Rest (`Level 1`):**
   - Used for dashboard settings panels, suggested review chips, and inactive cards.
   - Surface: `#FFFFFF`.
   - Border: `1px solid #E2E8F0`.
   - Shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)`.
3. **Elevated Card & Interactive Hover (`Level 2`):**
   - Used for interactive preview flyers, active suggestion choices, and mobile review containers.
   - Surface: `#FFFFFF`.
   - Border: `1px solid #CBD5E1`.
   - Shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`.
4. **Modal / Poster Floating Preview (`Level 3`):**
   - Used for modal dialogs, downloadable asset sheets, and contextual bottom sheets.
   - Surface: `#FFFFFF`.
   - Border: `1px solid #CBD5E1`.
   - Shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.

## Shapes

The interface embraces a structured, friendly geometric shape language (`roundedness: 2` base = 8px):

- **Small Components (Inputs, Buttons, Suggestion Chips):** `rounded-md` (6px) to `rounded-lg` (8px), reinforcing tactile crispness and form clarity.
- **Structural Containers (Flyer Canvas, Settings Panels, Mobile Phone Mockups):** `rounded-xl` (16px) to `rounded-2xl` (24px) for distinct framing.
- **Badges, Step Indicators, Status Pills:** Full circular pill curves (`rounded-full` / 9999px) to establish instant visual hierarchy and clear differentiation from square data blocks.

## Components

### Buttons
- **Primary Action:** Solid background (`#1A73E8`), text `#FFFFFF`, font `label-lg`, height `44px` (desktop) / `48px` (mobile). Hover state: `#1557B0` with `Level 2` shadow. Active state: slight scale down (`scale-98`).
- **Secondary Action:** White surface `#FFFFFF`, border `1px solid #CBD5E1`, text `#0F172A`. Hover state: background `#F1F5F9`.
- **Destructive Action:** Text `#EA4335`, background `#FEF2F2`, border `1px solid #FCA5A5`.
- **Quick Icon Actions:** 40px × 40px circle or square, subtle border, containing aligned Google SVG assets or standard system glyphs.

### Review Suggestion Chips & Radio Cards
- Used heavily in the interactive customer review assistant flow.
- **Default State:** Background `#FFFFFF`, border `1px solid #E2E8F0`, rounded `12px`, padding `12px 16px`, flex layout with trailing custom radio indicator.
- **Selected State:** Background `#EFF6FF` (Blue 50), border `2px solid #1A73E8`, text `#1E40AF`, checkmark glyph activated with `#1A73E8` fill.

### Star Rating Picker
- Interactive row of five large stars (`36px` touch bounds on mobile).
- Inactive state: `#E2E8F0` stroke, transparent fill.
- Active/Hover state: `#FBBC04` fill, smooth micro-spring transition on tap.
- Supporting label beneath dynamically displays rating description (e.g., "5 out of 5 stars - Excellent").

### Input Fields & Selects
- Background `#FFFFFF`, border `1px solid #CBD5E1`, border radius `8px`, height `42px`, padding `0 14px`.
- Typography: `body-md` in `#0F172A`. Placeholder: `#94A3B8`.
- Focus State: Border color `#1A73E8`, paired with ring glow `0 0 0 3px rgba(26, 115, 232, 0.15)`.
- Error State: Border color `#EA4335`, paired with ring glow `0 0 0 3px rgba(234, 67, 53, 0.15)`.

### Step Badges & Numbered Markers
- Circular tokens (`32px × 32px` or `24px × 24px`) with centered bold numerals (`label-md`).
- Multi-color step sequence honoring the customer journey: Step 1 (Blue `#1A73E8`), Step 2 (Green `#34A853`), Step 3 (Amber `#FBBC04`), Step 4 (Red `#EA4335`), Step 5 (Indigo `#6366F1`).

### QR Poster Preview Frame
- Fixed aspect-ratio container simulating physical stands (acrylic table tents or counter displays).
- Includes bleed zones, logo watermark placements, Google review five-star graphic bars, and high-contrast centered QR code blocks with instant SVG download handlers.