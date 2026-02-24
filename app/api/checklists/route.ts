import { withErrorHandling } from "@/lib/api-route";
import { parseLimitOffset } from "@/lib/query";
import { json } from "@/lib/response";
import { requireAuth } from "@/lib/supabase";
import { throwIfError } from "@/lib/supabase-errors";
import { checklistCreateSchema } from "@/lib/validators";

export const GET = withErrorHandling(async (request: Request) => {
  const { client } = await requireAuth(request);
  const url = new URL(request.url);
  const { limit, offset } = parseLimitOffset(url.searchParams);

  const { data, error } = await client
    .from("checklists")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  throwIfError(error, "Failed to list checklists");
  return json({ items: data ?? [] });
});

export const POST = withErrorHandling(async (request: Request) => {
  const { user, client } = await requireAuth(request);
  const payload = checklistCreateSchema.parse(await request.json());

  const { data, error } = await client
    .from("checklists")
    .insert({
      user_id: user.id,
      title: payload.title,
      category: payload.category ?? null
    })
    .select("*")
    .single();

  throwIfError(error, "Failed to create checklist");
  return json({ item: data }, 201);
});
