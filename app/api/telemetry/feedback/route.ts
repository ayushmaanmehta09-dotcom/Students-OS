import { withErrorHandling } from "@/lib/api-route";
import { featureFlags } from "@/lib/feature-flags";
import { HttpError, json } from "@/lib/response";
import { requireAuth } from "@/lib/supabase";
import { throwIfError } from "@/lib/supabase-errors";
import { feedbackCreateSchema } from "@/lib/validators";

export const POST = withErrorHandling(async (request: Request) => {
  const { telemetryFeedback } = featureFlags();
  if (!telemetryFeedback) {
    throw new HttpError(404, "Telemetry feedback is disabled");
  }

  const { user, client } = await requireAuth(request);
  const payload = feedbackCreateSchema.parse(await request.json());

  const { error } = await client.from("telemetry_feedback").insert({
    user_id: user.id,
    page: payload.page,
    sentiment: payload.sentiment,
    message: payload.message
  });

  throwIfError(error, "Failed to store feedback");
  return json({ ok: true }, 201);
});
