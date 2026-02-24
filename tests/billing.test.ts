import { describe, expect, it } from "vitest";

import { mapSubscriptionStatus } from "@/lib/billing";

describe("mapSubscriptionStatus", () => {
  it("maps known stripe statuses", () => {
    expect(mapSubscriptionStatus("active")).toBe("active");
    expect(mapSubscriptionStatus("trialing")).toBe("trialing");
    expect(mapSubscriptionStatus("past_due")).toBe("past_due");
    expect(mapSubscriptionStatus("canceled")).toBe("canceled");
  });

  it("falls back to inactive", () => {
    expect(mapSubscriptionStatus("incomplete")).toBe("inactive");
    expect(mapSubscriptionStatus(undefined)).toBe("inactive");
  });
});
