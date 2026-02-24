import { withErrorHandling } from "@/lib/api-route";
import { parseLimitOffset } from "@/lib/query";
import { json } from "@/lib/response";
import { requireAuth } from "@/lib/supabase";
import { throwIfError } from "@/lib/supabase-errors";
import { paymentLogCreateSchema } from "@/lib/validators";

export const GET = withErrorHandling(async (request: Request) => {
  const { client } = await requireAuth(request);
  const url = new URL(request.url);
  const { limit, offset } = parseLimitOffset(url.searchParams);

  let query = client
    .from("payment_logs")
    .select("*")
    .order("paid_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const status = url.searchParams.get("status");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (status) query = query.eq("status", status);
  if (from) query = query.gte("paid_at", from);
  if (to) query = query.lte("paid_at", to);

  const { data, error } = await query;
  throwIfError(error, "Failed to list payment logs");

  return json({ items: data ?? [] });
});

export const POST = withErrorHandling(async (request: Request) => {
  const { user, client } = await requireAuth(request);
  const payload = paymentLogCreateSchema.parse(await request.json());

  const { data, error } = await client
    .from("payment_logs")
    .insert({
      user_id: user.id,
      payee: payload.payee,
      amount_cents: payload.amountCents,
      currency: payload.currency,
      paid_at: payload.paidAt,
      proof_url: payload.proofUrl ?? null,
      status: payload.status
    })
    .select("*")
    .single();

  throwIfError(error, "Failed to create payment log");
  return json({ item: data }, 201);
});
