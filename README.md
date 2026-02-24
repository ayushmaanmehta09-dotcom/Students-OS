# Student Deadline Assistant (MVP)

Next.js App Router implementation of the merged plan from `Untitled document-6` + `Untitled document-7`.

## What is implemented

- API-first Next.js TypeScript app
- Supabase-backed schema + RLS migration (`supabase/migrations/20260224190000_init.sql`)
- User-scoped APIs for deadlines, checklists/items, payment logs, email drafts, me, and health
- AI email generation endpoint using OpenAI (`POST /api/ai/email-draft`)
- Billing endpoints: status, optional payment-link helper, Stripe webhook
- Optional telemetry feedback endpoint behind feature flag
- UI routes: `/`, `/login`, `/deadlines`, `/checklists`, `/payments`, `/settings`
- Baseline quality stack: Vitest, Playwright smoke, Sentry hooks, GitHub Actions CI

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env.local
```

3. Fill required values in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

4. Apply SQL migration in Supabase SQL editor:
- `supabase/migrations/20260224190000_init.sql`

5. Start app:

```bash
npm run dev
```

## Feature flags

- `FEATURE_BILLING_LINK=true` enables `GET /api/billing/payment-link`
- `FEATURE_TELEMETRY_FEEDBACK=true` enables `POST /api/telemetry/feedback`

## Commands

- `npm run dev`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`
- `npm run build`

## API route map

See `docs/implementation-map.md`.
