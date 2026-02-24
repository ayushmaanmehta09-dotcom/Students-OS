import Stripe from "stripe";

import { getEnv } from "@/lib/env";
import { HttpError } from "@/lib/response";

let cachedStripe: Stripe | null = null;

export function getStripeClient() {
  if (cachedStripe) {
    return cachedStripe;
  }

  const env = getEnv();
  if (!env.STRIPE_SECRET_KEY) {
    throw new HttpError(500, "STRIPE_SECRET_KEY is required");
  }

  cachedStripe = new Stripe(env.STRIPE_SECRET_KEY);
  return cachedStripe;
}
