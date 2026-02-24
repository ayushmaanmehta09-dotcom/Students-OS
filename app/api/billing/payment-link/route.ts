import { withErrorHandling } from "@/lib/api-route";
import { getEnv } from "@/lib/env";
import { featureFlags } from "@/lib/feature-flags";
import { HttpError, json } from "@/lib/response";
import { requireAuth } from "@/lib/supabase";
import { getStripeClient } from "@/lib/stripe";

export const GET = withErrorHandling(async (request: Request) => {
  const { billingLink } = featureFlags();
  if (!billingLink) {
    throw new HttpError(404, "Billing link helper is disabled");
  }

  const { user } = await requireAuth(request);
  const env = getEnv();

  if (env.STRIPE_PAYMENT_LINK_URL) {
    return json({ url: env.STRIPE_PAYMENT_LINK_URL });
  }

  if (!env.STRIPE_PRICE_ID) {
    throw new HttpError(500, "STRIPE_PRICE_ID is required when STRIPE_PAYMENT_LINK_URL is not set");
  }

  const stripe = getStripeClient();
  const origin = new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: env.STRIPE_PRICE_ID,
        quantity: 1
      }
    ],
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: {
      user_id: user.id
    },
    success_url: `${origin}/settings?upgrade=success`,
    cancel_url: `${origin}/settings?upgrade=cancel`
  });

  if (!session.url) {
    throw new HttpError(502, "Stripe did not provide a checkout URL");
  }

  return json({ url: session.url });
});
