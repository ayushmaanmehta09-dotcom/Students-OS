import { withErrorHandling } from "@/lib/api-route";
import { HttpError, json, noContent } from "@/lib/response";
import { requireAuth } from "@/lib/supabase";
import { throwIfError } from "@/lib/supabase-errors";
import { paymentLogPatchSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const PATCH = withErrorHandling(async (request: Request, { params }: RouteContext) => {
  const { client } = await requireAuth(request);
  const { id } = await params;
  const payload = paymentLogPatchSchema.parse(await request.json());

  const updates: Record<string, unknown> = {};
  if (payload.payee !== undefined) updates.payee = payload.payee;
  if (payload.amountCents !== undefined) updates.amount_cents = payload.amountCents;
  if (payload.currency !== undefined) updates.currency = payload.currency;
  if (payload.paidAt !== undefined) updates.paid_at = payload.paidAt;
  if (payload.proofUrl !== undefined) updates.proof_url = payload.proofUrl;
  if (payload.status !== undefined) updates.status = payload.status;

  const { data, error } = await client.from("payment_logs").update(updates).eq("id", id).select("*").maybeSingle();

  throwIfError(error, "Failed to update payment log");
  if (!data) {
    throw new HttpError(404, "Payment log not found");
  }

  return json({ item: data });
});

export const DELETE = withErrorHandling(async (request: Request, { params }: RouteContext) => {
  const { client } = await requireAuth(request);
  const { id } = await params;
  const { count, error } = await client.from("payment_logs").delete({ count: "exact" }).eq("id", id);

  throwIfError(error, "Failed to delete payment log");

  if (!count) {
    throw new HttpError(404, "Payment log not found");
  }

  return noContent();
});
