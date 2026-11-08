# Deployment — ReviewQR

## Current deployment status

The production build succeeds locally, but production readiness is not established. QR management and analytics still use demo/local data paths. Live Supabase authentication, Storage uploads, and database policies have not been tested against a provisioned project.

## Environment variables

Copy `.env.example` to `.env.local`. Set the Supabase project URL and publishable key. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is supported for older projects.

```
# Supabase public client configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key

# App
NEXT_PUBLIC_APP_URL=https://reviewqr.app
```

Never add service-role or secret keys to `NEXT_PUBLIC_` variables. No privileged key is needed by the current upload route.

## Supabase provisioning
1. Create a Supabase project.
2. Review and apply the SQL migrations in `supabase/migrations/`.
3. Verify Row Level Security and Storage policies against the deployed application before using real business data.

## Build & run
```bash
npm ci
npm run build
npm start
```

See [`TASKS.md`](./TASKS.md) for outstanding implementation and verification work.

## Platform notes
- **Vercel**: deploy `apps/reviewqr` (or root) as a Next.js app. Set env vars in Vercel dashboard.
- **Supabase**: provision via the Supabase dashboard; connect via `DATABASE_URL` for migrations.
- **Email**: Resend or SendGrid for password reset and verification emails.

## Rollback
- Deployments are immutable; roll back by promoting a previous Vercel deployment.
- Database migrations are additive and backward-compatible; destructive changes require a migration with a rollback plan.

## Monitoring
- Sentry for error tracking (server + client).
- PostHog or similar for product analytics (only observable events).
- Supabase Studio for database health.

## Compliance
- GDPR: customer data deletion request → delete user row + purge associated analytics (anonymized) within 30 days.
- No review content is stored; only intent metadata.
- WCAG AA/AAA contrast enforced in CI via axe-core.