import { withErrorHandling } from "@/lib/api-route";
import { HttpError, json, noContent } from "@/lib/response";
import { requireAuth } from "@/lib/supabase";
import { throwIfError } from "@/lib/supabase-errors";
import { checklistItemPatchSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const PATCH = withErrorHandling(async (request: Request, { params }: RouteContext) => {
  const { client } = await requireAuth(request);
  const { id } = await params;
  const payload = checklistItemPatchSchema.parse(await request.json());

  const updates: Record<string, unknown> = {};
  if (payload.label !== undefined) updates.label = payload.label;
  if (payload.isDone !== undefined) updates.is_done = payload.isDone;
  if (payload.dueDate !== undefined) updates.due_date = payload.dueDate;
  if (payload.sortOrder !== undefined) updates.sort_order = payload.sortOrder;

  const { data, error } = await client
    .from("checklist_items")
    .update(updates)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  throwIfError(error, "Failed to update checklist item");

  if (!data) {
    throw new HttpError(404, "Checklist item not found");
  }

  return json({ item: data });
});

export const DELETE = withErrorHandling(async (request: Request, { params }: RouteContext) => {
  const { client } = await requireAuth(request);
  const { id } = await params;
  const { count, error } = await client.from("checklist_items").delete({ count: "exact" }).eq("id", id);

  throwIfError(error, "Failed to delete checklist item");

  if (!count) {
    throw new HttpError(404, "Checklist item not found");
  }

  return noContent();
});
