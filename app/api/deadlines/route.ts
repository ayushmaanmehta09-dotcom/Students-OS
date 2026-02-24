import { withErrorHandling } from "@/lib/api-route";
import { parseLimitOffset } from "@/lib/query";
import { json } from "@/lib/response";
import { requireAuth } from "@/lib/supabase";
import { throwIfError } from "@/lib/supabase-errors";
import { deadlineCreateSchema } from "@/lib/validators";

export const GET = withErrorHandling(async (request: Request) => {
  const { client } = await requireAuth(request);
  const url = new URL(request.url);
  const { limit, offset } = parseLimitOffset(url.searchParams);

  let query = client
    .from("deadlines")
    .select("*")
    .order("due_date", { ascending: true })
    .range(offset, offset + limit - 1);

  const status = url.searchParams.get("status");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (status) {
    query = query.eq("status", status);
  }
  if (from) {
    query = query.gte("due_date", from);
  }
  if (to) {
    query = query.lte("due_date", to);
  }

  const { data, error } = await query;
  throwIfError(error, "Failed to list deadlines");

  return json({ items: data ?? [] });
});

export const POST = withErrorHandling(async (request: Request) => {
  const { user, client } = await requireAuth(request);
  const payload = deadlineCreateSchema.parse(await request.json());

  const { data, error } = await client
    .from("deadlines")
    .insert({
      user_id: user.id,
      title: payload.title,
      due_date: payload.dueDate,
      amount_cents: payload.amountCents ?? null,
      currency: payload.currency,
      status: payload.status,
      notes: payload.notes ?? null
    })
    .select("*")
    .single();

  throwIfError(error, "Failed to create deadline");
  return json({ item: data }, 201);
});
