# Deployment — ReviewQR

## Current deployment status

Production readiness is not established. Authenticated CRUD, public QR resolution/scan/click recording, and owner analytics were exercised against the configured Supabase project using disposable test accounts and records. An anonymous owner-analytics RPC grant remains to be revoked; Storage policies, migration history, and the live policy catalog were not inspected. No public application deployment URL is configured or verified in this workspace; the current `NEXT_PUBLIC_APP_URL` is an HTTP localhost development address.

Direct Google Review QR codes encode the confirmed HTTPS destination and can be scanned from any device without ReviewQR hosting. Guided Review Assistant QR codes encode `/qr/{token}` and require a publicly reachable Next.js deployment with its API routes and Supabase configuration. The app rejects localhost, loopback, and private-network URLs for guided QR previews and exports; it never silently changes a guided QR into a direct QR.

## Environment variables

Copy `.env.example` to `.env.local` and set the Supabase project URL and publishable key. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is supported for older projects.

Google Maps destination discovery is a manual free workflow and does not require Google Maps Platform credentials. ReviewQR opens a URL-encoded Maps search; the business owner must select the correct listing, copy its review link, test it if desired, and explicitly confirm it. ReviewQR does not scrape listings or verify that the destination is a working review page. Saving requires an authenticated Supabase session and the existing `businesses.google_review_url` column. The user reports that the secure QR migration was applied to the configured project; its expected columns and RPC behavior were observed there. Do not apply it again.

```env
# Supabase public client configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key

# App: replace with the actual public HTTPS URL assigned to the deployment.
NEXT_PUBLIC_APP_URL=https://your-deployed-hostname.example
```

Never put service-role or secret keys in a `NEXT_PUBLIC_` variable. If a secret key has been configured with that prefix, remove it from the public configuration and rotate it in Supabase; the current app does not need a privileged key.

## Supabase provisioning

1. Configure authentication redirect/email settings and protect all credentials.
2. Do not reapply `20261109000001_secure_qr_public_flow.sql` to the configured project; its expected schema and public RPC behavior were observed after the user's manual application.
3. Review and approve `20261109000002_revoke_anon_owner_analytics.sql`; it has not been applied.
4. Inspect the migration ledger, `pg_policies`, and Storage policies through an authorized database-management connection.
5. Review and apply `20261109000003_add_qr_destination_modes.sql` before deploying code that reads/writes `qr_codes.destination_mode`; it has not been applied.
6. Deploy the Next.js app to a public HTTPS host, set `NEXT_PUBLIC_APP_URL` to that exact assigned URL, and verify it from a device outside the development network.
7. Verify the app's browser cookie flow, uploads, and production settings before deployment.
8. Do not deploy until the anonymous analytics grant is revoked and remaining storage, policy-catalog, migration, and operational checks are completed.

## Build & run

```bash
npm ci
npm run typecheck
npm run lint
npm test -- --run
npm run build
npm start
```

See [`TASKS.md`](./TASKS.md) for outstanding implementation and verification work.

## Platform notes

- **Vercel**: configure the repository root as the Next.js app unless deployment structure is changed. Set public environment variables in the Vercel dashboard.
- **Supabase**: provision via the Supabase dashboard; connect using a protected `DATABASE_URL` for reviewed migrations.
- **Email**: Supabase Auth email configuration is required for password reset and email confirmation. Delivery has not been verified.

## Rollback

- Deployments are immutable; roll back by promoting a previous Vercel deployment.
- Review every migration against the current schema and migration history. Test forward and rollback procedures in an isolated project before hosted use.

## Monitoring and compliance

- Monitoring and analytics services are not configured. QR scan/click counts are raw event requests, not unique visitors.
- Privacy, retention, account-deletion, and terms-of-service workflows are not implemented.
- ReviewQR does not retrieve Google review submissions. Do not represent this as a compliance certification.
- Accessibility has not been automated or verified against WCAG.
