import { describe, expect, it } from "vitest";

import { redactSensitivePrompt } from "@/lib/redaction";

describe("redactSensitivePrompt", () => {
  it("redacts long numeric sequences", () => {
    const redacted = redactSensitivePrompt("My account 123456789012 needs payment confirmation.");
    expect(redacted).toContain("[REDACTED_NUMBER]");
  });

  it("keeps normal content unchanged", () => {
    const text = "Please draft an email asking for payment deadline extension.";
    expect(redactSensitivePrompt(text)).toBe(text);
  });
});
