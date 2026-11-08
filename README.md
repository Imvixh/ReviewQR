# ReviewQR

ReviewQR is a Next.js application for creating and managing QR posters that direct customers to a business's Google review destination. The original Stitch designs are preserved in [`stitch_reviewqr_poster_saas_suite/`](./stitch_reviewqr_poster_saas_suite/); the live application is implemented under [`src/`](./src/).

## Requirements

- Node.js compatible with the version in the current Next.js requirements
- npm
- A Supabase project for testing the configured authentication path

## Local setup

```powershell
npm ci
Copy-Item .env.example .env.local
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` to the values from your Supabase project. For older Supabase projects, `NEXT_PUBLIC_SUPABASE_ANON_KEY` is also supported. Never put a secret/service-role key in a `NEXT_PUBLIC_` variable.

Run the app and checks:

```powershell
npm run dev
npm run typecheck
npm run lint
npm test -- --run
npm run build
```

## Current implementation status

The QR studio, customer journey, dashboard, and settings interfaces are present. The application still has demo/local-storage data paths: QR management and analytics are not yet end-to-end backed by Supabase, and live authentication, Storage uploads, and database policies have not been verified against a provisioned project. Dashboard sample analytics and review entries are not production data. See [`docs/TASKS.md`](./docs/TASKS.md) and [`docs/PROGRESS.md`](./docs/PROGRESS.md) for the remaining work.

## Project references

- Product requirements: [`docs/PRD.md`](./docs/PRD.md)
- Architecture: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- Database design: [`docs/DATABASE_DESIGN.md`](./docs/DATABASE_DESIGN.md)
- API specification: [`docs/API_SPEC.md`](./docs/API_SPEC.md)
- Deployment notes: [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)
- Original visual references: [`stitch_reviewqr_poster_saas_suite/`](./stitch_reviewqr_poster_saas_suite/)

