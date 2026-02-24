import { withErrorHandling } from "@/lib/api-route";
import { HttpError, noContent, json } from "@/lib/response";
import { requireAuth } from "@/lib/supabase";
import { throwIfError } from "@/lib/supabase-errors";
import { deadlinePatchSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const PATCH = withErrorHandling(async (request: Request, { params }: RouteContext) => {
  const { client } = await requireAuth(request);
  const { id } = await params;
  const payload = deadlinePatchSchema.parse(await request.json());

  const updates: Record<string, unknown> = {};
  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.dueDate !== undefined) updates.due_date = payload.dueDate;
  if (payload.amountCents !== undefined) updates.amount_cents = payload.amountCents;
  if (payload.currency !== undefined) updates.currency = payload.currency;
  if (payload.status !== undefined) updates.status = payload.status;
  if (payload.notes !== undefined) updates.notes = payload.notes;

  const { data, error } = await client.from("deadlines").update(updates).eq("id", id).select("*").maybeSingle();

  throwIfError(error, "Failed to update deadline");

  if (!data) {
    throw new HttpError(404, "Deadline not found");
  }

  return json({ item: data });
});

export const DELETE = withErrorHandling(async (request: Request, { params }: RouteContext) => {
  const { client } = await requireAuth(request);
  const { id } = await params;
  const { count, error } = await client.from("deadlines").delete({ count: "exact" }).eq("id", id);

  throwIfError(error, "Failed to delete deadline");

  if (!count) {
    throw new HttpError(404, "Deadline not found");
  }

  return noContent();
});
