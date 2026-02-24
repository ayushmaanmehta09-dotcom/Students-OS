import { withErrorHandling } from "@/lib/api-route";
import { HttpError, json } from "@/lib/response";
import { requireAuth } from "@/lib/supabase";
import { throwIfError } from "@/lib/supabase-errors";
import { checklistItemCreateSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const POST = withErrorHandling(async (request: Request, { params }: RouteContext) => {
  const { client } = await requireAuth(request);
  const { id } = await params;
  const payload = checklistItemCreateSchema.parse(await request.json());

  const { data: checklist, error: checklistError } = await client
    .from("checklists")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  throwIfError(checklistError, "Failed to resolve checklist");

  if (!checklist) {
    throw new HttpError(404, "Checklist not found");
  }

  let sortOrder = payload.sortOrder;
  if (sortOrder === undefined) {
    const { data: latestRows, error: latestError } = await client
      .from("checklist_items")
      .select("sort_order")
      .eq("checklist_id", id)
      .order("sort_order", { ascending: false })
      .limit(1);

    throwIfError(latestError, "Failed to determine checklist sort order");

    const latestSortOrder = latestRows?.[0]?.sort_order as number | undefined;
    sortOrder = (latestSortOrder ?? -1) + 1;
  }

  const { data, error } = await client
    .from("checklist_items")
    .insert({
      checklist_id: id,
      label: payload.label,
      is_done: false,
      due_date: payload.dueDate ?? null,
      sort_order: sortOrder
    })
    .select("*")
    .single();

  throwIfError(error, "Failed to create checklist item");
  return json({ item: data }, 201);
});
