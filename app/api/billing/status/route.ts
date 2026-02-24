import { withErrorHandling } from "@/lib/api-route";
import { json } from "@/lib/response";
import { requireAuth } from "@/lib/supabase";
import { isNotFoundError, throwIfError } from "@/lib/supabase-errors";

export const GET = withErrorHandling(async (request: Request) => {
  const { user, client } = await requireAuth(request);

  const { data, error } = await client
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error && !isNotFoundError(error)) {
    throwIfError(error, "Failed to resolve billing status");
  }

  if (!data) {
    return json({
      plan: "free",
      status: "inactive",
      renewalAt: null
    });
  }

  return json({
    plan: data.plan,
    status: data.status,
    renewalAt: data.current_period_end
  });
});
