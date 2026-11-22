# QR Studio UI Flow Implementation Plan

**Status:** Implemented locally after approval; the Guided demo was removed in a later follow-up. Visual comparison remains outstanding.
**Reference:** Screenshot supplied 2026-11-22, showing QR Design Studio step tabs, review-destination choices, poster preview, and export strip.

## Current implementation

- QR Studio is implemented in `src/app/qr-studio/page.tsx`.
- Branding, QR Code, Templates, and Copy are rendered as four selectable tabs. Each step has a Continue button, but every tab can currently be opened directly, so the sequence is not enforced.
- Direct Google Review and Guided Review Assistant cards already select `qrMode` locally. Direct is described as opening the supplied destination; Guided opens the customer page and tracks scans.
- The right preview includes Front View, Stand Mockup, and Mobile View. The preview poster and mobile mockup render five Material Symbols `star` icons using the default outline style.
- The preview quick-download strip offers Poster PNG, Vector SVG, and PDF Print.
- The existing Mobile View presents the guided customer experience. The separate Guided customer flow / Show demo panel has been removed per the follow-up request.

## Proposed changes

### 1. Make the four sections a sequential stepper

Present Branding → QR Code → Templates → Copy as four numbered step junctions, retaining the current design and live preview.

- Continue buttons move forward one step at a time; add a Back action after the first step.
- Permit users to revisit completed earlier steps. Keep future steps visibly locked until their prior step is complete, and expose the lock/current/completed states accessibly.
- Branding completes after the existing required business identity values are present and the review destination is valid and confirmed. Use the existing destination validation; do not change destination lookup or persistence.
- QR Code completes using the current valid/default QR settings. Templates completes with the existing selected preset (the current default can count as selected). Copy keeps its existing default copy and requires non-empty headline and CTA text before completion.
- Keep the existing final save/export controls and handlers. Do not change when or how QR data is saved, loaded, encoded, or exported, except removing the requested Vector SVG UI action.
- In edit mode, load the existing QR as today and allow the owner to move through completed steps and revisit prior choices without losing values.

### 2. Label review destination choices by price tier

- Add a clear **Free** badge to **Direct Google Review**.
- Add a clear **Paid** badge to **Guided Review Assistant**.
- Retain the current card descriptions, selection behavior, destination lookup and other options.
- This is display copy only: do not add prices, checkout, billing, subscriptions, plan entitlements, database fields, API rules, or feature gating. If a specific price is needed later, handle that as a separate approved scope.

### 3. Remove Vector SVG from the preview quick actions

- Remove the **Vector SVG** button from the strip below the preview.
- Keep **Poster PNG**, **PDF Print**, and the separate top-bar **Download PNG** / **Print / Save PDF** controls unchanged.
- Do not change the QR renderer, PNG generation, PDF generation, or server/API behavior.

### 4. Fill and enlarge the preview stars

- Render the five preview stars as filled icons and make them slightly larger and easier to see.
- Apply the same treatment to the poster front preview and the mobile preview so the two preview modes agree. Keep the existing selected star color and preset overrides.
- Do not change review rating logic, customer review flows, or generated QR data.

### 5. Remove the Guided-mode demo

- Keep the separate Guided customer flow / **Show demo** panel removed from below the preview.
- Preserve the existing Mobile View and its current preview behavior.

## Scope boundary

- Change only the QR Studio client UI and its local presentation state needed for the stepper, price labels, preview stars, and SVG-button removal.
- Do not change backend/API behavior, auth, database schema/data, billing, destination search/save, QR encoding, QR scan handling, analytics, PNG/PDF output, or any other product flow.
- Do not change defaults or unrelated QR Studio controls. Preserve current direct/guided mode behavior and existing fields, destinations, presets, and copy values.

## Acceptance criteria

- The user sees the four ordered steps and cannot jump to a future step before completing prior required fields. Completed steps remain revisitable, and Back/Continue navigation preserves entered values.
- Existing saved designs open in edit mode with their fields populated and allow normal sequential editing.
- Direct card displays **Free**; Guided card displays **Paid**. Both still select the same modes and preserve their existing descriptions.
- The preview quick-action strip has no Vector SVG control; PNG and PDF controls continue to work as before.
- Front and mobile previews show five filled, enlarged stars using the selected star color.
- The separate Guided customer flow panel and **Show demo** control are absent; the Mobile View remains available.
- No backend, auth, database, billing, scan, analytics, QR encoding, or unrelated application files are changed.
- Controls remain usable with keyboard and screen readers; step state is communicated beyond color alone and the layout works on narrow screens.

## Verification after approval

- Run the repository typecheck, lint, tests, and production build.
- Add/update focused UI tests for sequential unlocking and preservation, mode labels, star rendering, and SVG action removal.
- Inspect QR Studio at desktop and mobile widths against the supplied reference. Confirm edit mode, direct/guided selection, and existing PNG/PDF actions still behave as before.
- Report any browser/deployment limitations separately; do not claim backend or payment behavior was implemented or verified.
