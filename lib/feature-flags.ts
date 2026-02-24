import { getEnv } from "@/lib/env";

function toBool(value: string | undefined) {
  return value === "1" || value === "true";
}

export function featureFlags() {
  const env = getEnv();
  return {
    billingLink: toBool(env.FEATURE_BILLING_LINK),
    telemetryFeedback: toBool(env.FEATURE_TELEMETRY_FEEDBACK)
  };
}
