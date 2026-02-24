import { withErrorHandling } from "@/lib/api-route";
import { HttpError, json, noContent } from "@/lib/response";
import { requireAuth } from "@/lib/supabase";
import { throwIfError } from "@/lib/supabase-errors";
import { checklistPatchSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = withErrorHandling(async (request: Request, { params }: RouteContext) => {
  const { client } = await requireAuth(request);
  const { id } = await params;

  const { data: checklist, error: checklistError } = await client
    .from("checklists")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  throwIfError(checklistError, "Failed to fetch checklist");

  if (!checklist) {
    throw new HttpError(404, "Checklist not found");
  }

  const { data: items, error: itemsError } = await client
    .from("checklist_items")
    .select("*")
    .eq("checklist_id", id)
    .order("sort_order", { ascending: true });

  throwIfError(itemsError, "Failed to fetch checklist items");

  return json({ item: checklist, items: items ?? [] });
});

export const PATCH = withErrorHandling(async (request: Request, { params }: RouteContext) => {
  const { client } = await requireAuth(request);
  const { id } = await params;
  const payload = checklistPatchSchema.parse(await request.json());

  const updates: Record<string, unknown> = {};
  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.category !== undefined) updates.category = payload.category;

  const { data, error } = await client.from("checklists").update(updates).eq("id", id).select("*").maybeSingle();

  throwIfError(error, "Failed to update checklist");
  if (!data) {
    throw new HttpError(404, "Checklist not found");
  }

  return json({ item: data });
});

export const DELETE = withErrorHandling(async (request: Request, { params }: RouteContext) => {
  const { client } = await requireAuth(request);
  const { id } = await params;
  const { count, error } = await client.from("checklists").delete({ count: "exact" }).eq("id", id);

  throwIfError(error, "Failed to delete checklist");

  if (!count) {
    throw new HttpError(404, "Checklist not found");
  }

  return noContent();
});
