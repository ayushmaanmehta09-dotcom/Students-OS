import { withErrorHandling } from "@/lib/api-route";
import { processWebhookEvent } from "@/lib/billing";
import { getEnv } from "@/lib/env";
import { HttpError, json } from "@/lib/response";
import { getStripeClient } from "@/lib/stripe";

export const POST = withErrorHandling(async (request: Request) => {
  const env = getEnv();
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new HttpError(500, "STRIPE_WEBHOOK_SECRET is required");
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    throw new HttpError(400, "Missing stripe-signature header");
  }

  const rawBody = await request.text();
  const stripe = getStripeClient();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    throw new HttpError(400, "Invalid Stripe webhook signature");
  }

  const result = await processWebhookEvent(event);
  return json({ received: true, duplicate: result.duplicate });
});
