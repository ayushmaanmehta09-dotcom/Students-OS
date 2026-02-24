import { withErrorHandling } from "@/lib/api-route";
import { HttpError, json } from "@/lib/response";
import { requireAuth } from "@/lib/supabase";
import { throwIfError } from "@/lib/supabase-errors";
import { emailDraftPatchSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const PATCH = withErrorHandling(async (request: Request, { params }: RouteContext) => {
  const { client } = await requireAuth(request);
  const { id } = await params;
  const payload = emailDraftPatchSchema.parse(await request.json());

  const updates: Record<string, unknown> = {};
  if (payload.subject !== undefined) updates.subject = payload.subject;
  if (payload.body !== undefined) updates.body = payload.body;
  if (payload.status !== undefined) updates.status = payload.status;
  if (payload.tone !== undefined) updates.tone = payload.tone;
  if (payload.language !== undefined) updates.language = payload.language;

  const { data, error } = await client.from("email_drafts").update(updates).eq("id", id).select("*").maybeSingle();

  throwIfError(error, "Failed to update email draft");
  if (!data) {
    throw new HttpError(404, "Email draft not found");
  }

  return json({ item: data });
});
