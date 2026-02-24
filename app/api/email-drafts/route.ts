import { withErrorHandling } from "@/lib/api-route";
import { parseLimitOffset } from "@/lib/query";
import { json } from "@/lib/response";
import { requireAuth } from "@/lib/supabase";
import { throwIfError } from "@/lib/supabase-errors";

export const GET = withErrorHandling(async (request: Request) => {
  const { client } = await requireAuth(request);
  const url = new URL(request.url);
  const { limit, offset } = parseLimitOffset(url.searchParams);

  let query = client
    .from("email_drafts")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const contextType = url.searchParams.get("contextType");
  if (contextType) {
    query = query.eq("context_type", contextType);
  }

  const { data, error } = await query;
  throwIfError(error, "Failed to list email drafts");

  return json({ items: data ?? [] });
});
