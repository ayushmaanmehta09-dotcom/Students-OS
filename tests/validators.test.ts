import { describe, expect, it } from "vitest";

import {
  aiEmailDraftRequestSchema,
  checklistItemPatchSchema,
  deadlineCreateSchema,
  feedbackCreateSchema,
  paymentLogCreateSchema
} from "@/lib/validators";

describe("validators", () => {
  it("accepts a valid deadline create payload", () => {
    const result = deadlineCreateSchema.parse({
      title: "Residence permit deadline",
      dueDate: "2026-03-10T09:00:00+00:00",
      currency: "EUR",
      status: "pending"
    });

    expect(result.title).toBe("Residence permit deadline");
  });

  it("rejects invalid payment log amounts", () => {
    const parsed = paymentLogCreateSchema.safeParse({
      payee: "University",
      amountCents: -100,
      currency: "EUR",
      paidAt: "2026-02-24T08:00:00+00:00"
    });

    expect(parsed.success).toBe(false);
  });

  it("requires at least one field in checklist item patch", () => {
    const parsed = checklistItemPatchSchema.safeParse({});
    expect(parsed.success).toBe(false);
  });

  it("accepts ai draft requests", () => {
    const parsed = aiEmailDraftRequestSchema.parse({
      contextType: "deadline_extension",
      recipient: "advisor@example.edu",
      language: "English",
      tone: "Professional",
      prompt: "Please draft a concise request for deadline extension due to delayed visa appointment."
    });

    expect(parsed.contextType).toBe("deadline_extension");
  });

  it("accepts telemetry feedback payload", () => {
    const parsed = feedbackCreateSchema.parse({
      sentiment: "neutral",
      message: "The checklist flow is clear.",
      page: "/checklists"
    });

    expect(parsed.page).toBe("/checklists");
  });
});
