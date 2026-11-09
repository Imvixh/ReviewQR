# ReviewQR — Agent Instructions

**Workspace:** `D:\ReviewQR`
**Design reference:** `D:\ReviewQR\stitch_reviewqr_poster_saas_suite` (original Stitch HTML assets — preserved, never modified)
**Implementation reference:** `docs/` files created from the supplied design system.

## Role

You are building ReviewQR: a production-ready SaaS product that turns physical QR poster scans into direct Google Business Profile reviews. The supplied Stitch suite (`stitch_reviewqr_poster_saas_suite`) is the visual source of truth; the live application under `apps/reviewqr` (or root) implements it as maintainable, authenticated, persistent code.

## Source-of-truth hierarchy

1. Existing implementation code → behavior, dependencies, configuration.
2. `stitch_reviewqr_poster_saas_suite/*` → visual appearance only; never used as runtime output or inline scripts.
3. Approved `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/API_SPEC.md`, `docs/DATABASE_DESIGN.md` → authoritative requirements & constraints.
4. Demo data → reference only, never treated as production customer data.

## Non-negotiable rules

- Never overwrite the original Stitch assets or replace the supplied design with generic Tailwind templates. Reuse the design tokens from `docs/DESIGN_SYSTEM.md`.
- Never expose service-role keys, database credentials, or privileged secrets in browser code or terminal output.
- Never claim an untested feature as VERIFIED in `docs/TASKS.md` or `docs/PROGRESS.md`.
- Never fabricate reviews, analytics, verification results, or successful external integrations.
- Validate all incoming data server-side before persisting.

## Execution cadence

1. Implement per `docs/TASKS.md`; mark each ticket NOT STARTED / IN PROGRESS / BLOCKED / VERIFIED accurately.
2. After each milestone, update `docs/PROGRESS.md`.
3. At the end, run type checking (`npm run typecheck`), linting (`npm run lint`), and tests (`npm test`) where supported. Report results verbatim.
4. If Supabase credentials or any genuine external blocker prevents a feature, document it as BLOCKED and keep moving.

## Commands (workspace-local)

```bash
npm install           # install dependencies
npm run dev            # start dev server
npm run typecheck      # tsc --noEmit
npm run lint           # eslint .
npm run build          # next build
npm test               # vitest
```

When commands fail, inspect errors and fix rather than report them. Status lives in `docs/PROGRESS.md` and `docs/TASKS.md`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
