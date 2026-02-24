# Diff Matrix + Implementation Map

## Diff matrix kept in implementation

| Area | Implementation outcome |
|---|---|
| Product framing | Captured as dashboard + route structure and scoped MVP feature set |
| Features | Auth, deadlines, checklists, AI drafts, payment logs, billing status/webhook |
| Data model | Concrete Supabase SQL schema + RLS policies |
| API design | Full Next.js route handler set from document-7 |
| UX structure | `/login`, `/deadlines`, `/checklists`, `/payments`, `/settings`, `/` |
| Reliability | CI workflow + Vitest + Playwright + Sentry configuration |
| Monetization | Billing status + webhook in MVP, payment-link helper behind flag |

## Endpoint to file map

- `GET /api/health` -> `app/api/health/route.ts`
- `GET /api/me` -> `app/api/me/route.ts`
- `GET|POST /api/deadlines` -> `app/api/deadlines/route.ts`
- `PATCH|DELETE /api/deadlines/:id` -> `app/api/deadlines/[id]/route.ts`
- `GET|POST /api/checklists` -> `app/api/checklists/route.ts`
- `GET|PATCH|DELETE /api/checklists/:id` -> `app/api/checklists/[id]/route.ts`
- `POST /api/checklists/:id/items` -> `app/api/checklists/[id]/items/route.ts`
- `PATCH|DELETE /api/checklist-items/:id` -> `app/api/checklist-items/[id]/route.ts`
- `GET|POST /api/payment-logs` -> `app/api/payment-logs/route.ts`
- `PATCH|DELETE /api/payment-logs/:id` -> `app/api/payment-logs/[id]/route.ts`
- `GET /api/email-drafts` -> `app/api/email-drafts/route.ts`
- `PATCH /api/email-drafts/:id` -> `app/api/email-drafts/[id]/route.ts`
- `POST /api/ai/email-draft` -> `app/api/ai/email-draft/route.ts`
- `GET /api/billing/status` -> `app/api/billing/status/route.ts`
- `GET /api/billing/payment-link` -> `app/api/billing/payment-link/route.ts`
- `POST /api/billing/webhook` -> `app/api/billing/webhook/route.ts`
- `POST /api/telemetry/feedback` -> `app/api/telemetry/feedback/route.ts`

## Security model

- All non-webhook endpoints require `Authorization: Bearer <token>`
- Supabase RLS enforces user ownership across tables
- Webhook uses service-role client + event idempotency table
- AI prompt redaction removes high-risk numeric identifiers before generation
