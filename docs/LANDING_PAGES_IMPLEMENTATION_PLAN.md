# Landing Pages Implementation Plan

**Status:** Implemented locally; visual and legal review remain outstanding.
**Scope:** Public marketing pages and their shared navigation/footer, based on the seven screenshots supplied on 2026-11-22.

## What the screenshots specify

- A consistent sticky navigation across the marketing pages with Home, Product, How It Works, Features, Contact, About, and the primary “Create Your QR” action. Remove Live Demo, FAQ, and Privacy Policy from the header navigation. Keep the Live Demo and FAQ sections on the home page if already present; this change removes only their navigation links. The current page link is green.
- About and Contact are clickable header links to their pages. Privacy Policy is a clickable footer link only, not a header link.
- The existing home page remains the marketing hub. Its five venue cards (Restaurants & Cafes, Hotels & Stays, Salons & Spas, Retail & Boutiques, Clinics & Wellness) are shown as compact, illustrated cards.
- A Contact page titled “Talk to the Revvly Team,” with short personal-support intro, email and call/WhatsApp contact cards, and a message form for name, business and city, and message. The screenshot indicates the form opens an email draft rather than submitting to a backend.
- Contact methods should be represented by recognizable icons/logos and labels; the email address and phone number stay hidden until the visitor activates the corresponding control.
- The expanded footer includes email and phone icons with click-to-reveal contact details, following the same hide-until-activated behavior.
- An About page titled “Why Revvly Exists,” with the search/review problem, the QR flow, and an honest-principles section covering no review gating, no fake reviews, and customer control.
- A Privacy Policy page with a last-updated date and numbered sections describing the operator, business-provided information, customer scans, cookies/advertising, use, sharing, choices, and policy changes.
- A full marketing footer with brand mark and description; Product, Resources, and Company & Legal links; creator/developer attribution; current copyright year; domain; and Google trademark/independence notice.
- A “Back to Home” link near the start of the About and Privacy content.
- Remove AI-related badges, labels, tags, and promotional claims from public landing pages. Review page copy and metadata so the site presents its product and customer value directly, without AI positioning.

## Baseline before this implementation

- `/` is implemented in `src/app/page.tsx`; `/landing` re-exports that page.
- The home page already includes the five venue categories and a large landing experience.
- The current home navigation only targets home-page anchors. The footer contains placeholder `#` links for privacy, terms, fairness, and cookie preferences. There are no `/contact`, `/about`, or `/privacy-policy` routes yet.
- `docs/DESIGN_SYSTEM.md` is the token source for typography, color, spacing, radius, and elevation. Keep the new pages consistent with those tokens and the current page’s visual language.
- The landing page currently makes claims about verified reviews, automatic Place ID binding, “100% compliant,” and 300-DPI output. These claims need product/legal verification before reuse in new copy; screenshots do not validate them.

## Scope boundary

- This plan changes only the public marketing-page presentation, content, navigation, footer, and SEO metadata/routes needed for those pages.
- Do not modify backend behavior, APIs, authentication, database schema/data, QR creation or scan flows, analytics, or any other product workflow. Do not refactor unrelated application code. If an implementation detail appears to require such a change, keep it out of scope and document the dependency rather than changing it.

## Proposed implementation sequence

### 1. Extract shared public-site shell

- Create reusable marketing navigation and footer components, preserving the existing home page look and responsive behavior.
- Use real route links for Contact and About in the header, and for Privacy Policy in the footer. Keep Product, How It Works, and Features as home-page anchors; from another route, link to `/#...` so they work there too.
- Remove Live Demo, FAQ, and Privacy Policy from the header on every marketing page. Do not remove or alter the corresponding home-page sections as part of this navigation change.
- Mark the current route with an accessible current-page state and green active styling.
- Ensure the sticky header does not obscure anchor targets, content headings, or keyboard focus. Collapse or horizontally adapt the links on narrow screens rather than clipping them.
- Place a working Privacy Policy route link in the footer. Remove placeholder Terms, Cookie Preferences, and Fairness links rather than adding unsupported pages as part of this scope.

### 2. Add the Contact page (`/contact`)

- Match the screenshot’s centered title/intro, return link, two contact cards, and single-column form card.
- Initially show only the relevant email/phone icon or logo and a clear action label (for example, “Show email” and “Show phone/WhatsApp”); do not render the address or number in visible page text before activation.
- On activation, reveal the matching contact detail and then expose the appropriate actionable link (`mailto:` or `tel:`). Provide a WhatsApp link only after confirming the number and destination. Allow the visitor to hide the detail again if practical.
- Implement the reveal as a keyboard-operable button with an accessible name and state (`aria-expanded`/`aria-controls`); do not rely on hover. Decide whether the reveal is per page view and avoid persisting contact details in browser storage.
- Use browser-side required-field checks and construct an encoded `mailto:` message on submit, with clear text that the visitor’s email app must send it. Do not imply a server-side submission or store the message.
- Add labels, focus styles, keyboard support, mobile stacking, and a useful fallback if the email application cannot open.
- Confirm the public email and phone number before publishing. The screenshot contains contact details, but their continued validity is not established by the image.

### 3. Add the About page (`/about`)

- Implement the screenshot’s editorial layout: eyebrow, large headline, concise subtitle, Back to Home, readable single-column sections, and principles list.
- Keep claims aligned with implemented behavior: customer authorship and submission, no review gating, no review posting on a customer’s behalf. Avoid unverified ranking or outcome guarantees.
- Link the contact email and `/contact` page using verified contact information.

### 4. Add the Privacy Policy page (`/privacy-policy`)

- Implement the numbered, readable legal document layout and visible last-updated date.
- Treat screenshot text as draft content only. Before publishing, reconcile every statement with actual data flows, hosting/analytics vendors, cookie usage, advertising configuration, retention, and deletion process. Do not claim cookies, AdSense, analytics, or data practices that are not present or verified.
- Confirm the operator identity, contact channels, and jurisdiction-specific requirements. Obtain the policy owner’s approval of final wording; this plan does not provide legal review.
- Keep the page accessible from the shared navigation and footer, and provide a Back to Home link.

### 5. Update home/footer integration

- Keep the existing home sections and venue cards; link the relevant section navigation to stable IDs and test deep links.
- Replace the placeholder Privacy Policy footer link with `/privacy-policy`; add working Contact and About routes in the shared navigation. Remove the Live Demo, FAQ, and Privacy Policy header items across all marketing pages. Retain the richer product/resources/company footer with working routes and accurate attribution/trademark language.
- Use the current year dynamically or verify the displayed copyright year at implementation time. The screenshot year should not be copied as a permanent value.
- Review current accuracy of the operational badge, Google policy language, product capabilities, and attribution before retaining them.

### 6. Remove AI labeling and prepare landing pages for SEO

- Search all public landing-page routes, shared marketing components, titles/descriptions, structured data, and visible copy for AI-related badges, tags, labels, and claims; remove them. Preserve neutral, accurate product descriptions and do not replace removed tags with unsupported promises.
- Add unique, descriptive metadata for the home, Contact, About, and Privacy Policy pages: title, description, canonical URL, and social sharing metadata. Use the production origin only after it is confirmed; avoid localhost or guessed canonical URLs.
- Ensure each page has one clear H1, logical H2/H3 hierarchy, descriptive link text, semantic landmarks, and indexable server-rendered page content. Avoid adding keywords unnaturally.
- Add or review `sitemap.xml` and `robots.txt` for public marketing routes; exclude authenticated product areas and private/customer token routes as appropriate. Confirm canonical and indexing behavior for `/landing` to avoid duplicating `/` content (prefer a redirect or canonical strategy consistent with the app routing).
- Add appropriate Organization/WebSite structured data only for verified entity details. Do not add review/rating schema, fabricated testimonials, or unsupported claims. Validate generated structured data and metadata against rendered pages.
- Optimize page-specific headings and copy around real product intent (QR review stands, Google review QR workflow, and supported venue categories) while avoiding claims about guaranteed rankings or outcomes. Keep metadata concise and unique.
- Keep all SEO enhancements compatible with the design system and accessible responsive layouts; SEO must not introduce hidden keyword text or visually hidden promotional content.

## Acceptance criteria

- `/`, `/contact`, `/about`, and `/privacy-policy` load directly and share consistent responsive navigation/footer.
- About and Contact are clickable header links on every marketing page; Privacy Policy is a clickable footer link and is absent from the header.
- Live Demo and FAQ are absent from the header navigation on every marketing page; their existing home-page sections remain available.
- Every remaining header/footer link leads to a real destination or a valid home anchor; no placeholder `href="#"` remains for these pages.
- Changes are confined to public marketing pages and their shared presentation; backend and other product flows behave exactly as before.
- Active-page state is both visually apparent and accessible. Keyboard users can reach every control and identify focus.
- Contact actions use confirmed details; form validation and `mailto:` behavior are explicit and do not imply server delivery.
- Email and phone values are absent from the initial visible contact-page content and appear only after their respective accessible reveal controls are activated; after reveal, links work correctly.
- No AI-related labels, badges, or claims remain on public landing pages or their metadata.
- Each public marketing route has unique, accurate metadata and a valid canonical strategy; sitemap/robots rules exclude private product and token routes.
- Privacy content is fact-checked against implementation and approved before publication; no unsupported analytics, advertising, retention, or deletion claims are included.
- The home page’s five venue cards remain present and legible at desktop and mobile sizes.
- Page titles, descriptions, headings, landmarks, and link text are meaningful; layout remains usable with zoom and reduced motion.

## Verification to perform during implementation

- Run `npm run typecheck`, `npm run lint`, and `npm test` as required by the repository instructions; report actual outcomes.
- Add or update page/component tests for route links, contact form validation and encoded draft construction, active navigation, and legal-page rendering.
- Use browser checks at desktop and mobile widths for sticky header, page scrolling, deep links, keyboard navigation, and contact actions. Compare screenshots against the references.
- Check contact details are not exposed in initial rendered text/HTML and are revealed only after activation; test mouse, keyboard, and screen-reader state semantics.
- Inspect rendered metadata, canonical links, sitemap, robots rules, heading hierarchy, and structured data for all public marketing routes. Confirm no AI tag/claim strings remain in page output.
- Verify the same header/footer navigation on each marketing route, including link destinations and absence of removed header items. Confirm unrelated backend and product-flow files are untouched by the implementation change.
- Do not mark visual or legal review VERIFIED until those reviews have actually happened. Type checking, linting, tests, and production build have passed locally; visual screenshot comparison and legal review remain outstanding.

## Decisions / dependencies before release

1. Confirm the email address and phone/WhatsApp number shown in the references.
2. Supply or approve final privacy wording based on deployed data practices and advertising/analytics configuration.
3. Confirm creator/operator attribution and Google trademark disclaimer wording.
4. Confirm whether the Contact form remains an email-draft helper or should later become a server-backed contact workflow; the screenshot depicts the email-draft approach.
5. Confirm the production hostname before setting canonical URLs, sitemap URLs, or social sharing URLs.
