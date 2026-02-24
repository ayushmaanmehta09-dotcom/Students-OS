import { withErrorHandling } from "@/lib/api-route";
import { generateEmailDraft } from "@/lib/openai";
import { HttpError, json } from "@/lib/response";
import { redactSensitivePrompt } from "@/lib/redaction";
import { requireAuth } from "@/lib/supabase";
import { throwIfError } from "@/lib/supabase-errors";
import { aiEmailDraftRequestSchema } from "@/lib/validators";

export const POST = withErrorHandling(async (request: Request) => {
  const { user, client } = await requireAuth(request);
  const payload = aiEmailDraftRequestSchema.parse(await request.json());

  const redactedPrompt = redactSensitivePrompt(payload.prompt);
  const promptRedacted = redactedPrompt !== payload.prompt;

  let aiDraft: { subject: string; body: string; safetyFlags: string[] };
  try {
    aiDraft = await generateEmailDraft({
      prompt: redactedPrompt,
      language: payload.language,
      tone: payload.tone
    });
  } catch (error) {
    if (error instanceof Error && /timeout|timed out|AbortError/i.test(error.message)) {
      throw new HttpError(502, "AI generation timed out. Please retry.");
    }
    throw error;
  }

  const safetyFlags = [...aiDraft.safetyFlags];
  if (promptRedacted) {
    safetyFlags.push("prompt_redacted");
  }

  const { data, error } = await client
    .from("email_drafts")
    .insert({
      user_id: user.id,
      context_type: payload.contextType,
      recipient: payload.recipient ?? null,
      language: payload.language,
      tone: payload.tone,
      input_json: { prompt: redactedPrompt },
      subject: aiDraft.subject,
      body: aiDraft.body,
      status: "draft"
    })
    .select("*")
    .single();

  throwIfError(error, "Failed to persist AI draft");

  return json(
    {
      subject: aiDraft.subject,
      body: aiDraft.body,
      safetyFlags,
      item: data
    },
    201
  );
});
