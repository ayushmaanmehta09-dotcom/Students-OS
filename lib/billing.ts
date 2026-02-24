import type Stripe from "stripe";

import { createServiceClient } from "@/lib/supabase";

export function mapSubscriptionStatus(status?: string) {
  if (status === "active") return "active";
  if (status === "trialing") return "trialing";
  if (status === "past_due") return "past_due";
  if (status === "canceled") return "canceled";
  return "inactive";
}

export async function processWebhookEvent(event: Stripe.Event) {
  const client = createServiceClient();

  const { error: insertEventError } = await client
    .from("stripe_webhook_events")
    .insert({ stripe_event_id: event.id, event_type: event.type })
    .select("id")
    .single();

  if (insertEventError) {
    if (insertEventError.code === "23505") {
      return { duplicate: true as const };
    }
    throw insertEventError;
  }

  if (event.type === "checkout.session.completed") {
    const checkout = event.data.object as Stripe.Checkout.Session;
    if (!checkout.client_reference_id) {
      return { duplicate: false as const };
    }

    const currentPeriodEnd = checkout.expires_at ? new Date(checkout.expires_at * 1000).toISOString() : null;

    const { error } = await client.from("subscriptions").upsert(
      {
        user_id: checkout.client_reference_id,
        plan: "pro",
        status: "active",
        stripe_customer_id: typeof checkout.customer === "string" ? checkout.customer : null,
        stripe_subscription_id: typeof checkout.subscription === "string" ? checkout.subscription : null,
        current_period_end: currentPeriodEnd
      },
      { onConflict: "user_id" }
    );

    if (error) {
      throw error;
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.user_id;
    if (!userId) {
      return { duplicate: false as const };
    }

    const { error } = await client
      .from("subscriptions")
      .update({
        status: mapSubscriptionStatus(subscription.status),
        plan: subscription.status === "canceled" ? "free" : "pro",
        stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : null,
        stripe_subscription_id: subscription.id,
        current_period_end: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null
      })
      .eq("user_id", userId);

    if (error) {
      throw error;
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const userId = invoice.metadata?.user_id;
    if (!userId) {
      return { duplicate: false as const };
    }

    const { error } = await client.from("subscriptions").update({ status: "past_due" }).eq("user_id", userId);
    if (error) {
      throw error;
    }
  }

  return { duplicate: false as const };
}
