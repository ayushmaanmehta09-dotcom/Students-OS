import OpenAI from "openai";

import { getEnv } from "@/lib/env";
import { HttpError } from "@/lib/response";

let cachedClient: OpenAI | null = null;

function getOpenAIClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const env = getEnv();
  if (!env.OPENAI_API_KEY) {
    throw new HttpError(500, "OPENAI_API_KEY is required");
  }

  cachedClient = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return cachedClient;
}

export async function generateEmailDraft(params: {
  prompt: string;
  language: string;
  tone: string;
}) {
  const openai = getOpenAIClient();
  const completion = (await openai.responses.create({
    model: "gpt-4.1-mini",
    temperature: 0.2,
    input: [
      {
        role: "system",
        content:
          "You generate concise, practical payment/deadline support emails. Avoid sensitive data, do not include bank account numbers, and return valid JSON."
      },
      {
        role: "user",
        content: `Language: ${params.language}\nTone: ${params.tone}\nPrompt: ${params.prompt}\nReturn: {\"subject\": string, \"body\": string, \"safetyFlags\": string[]}`
      }
    ]
  })) as { output_text?: string };

  const output = completion.output_text;
  if (!output) {
    throw new HttpError(502, "AI provider returned no output");
  }

  const parsed = JSON.parse(output) as {
    subject: string;
    body: string;
    safetyFlags: string[];
  };

  return parsed;
}
