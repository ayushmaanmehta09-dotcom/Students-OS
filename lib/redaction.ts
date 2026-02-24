const accountNumberPattern = /\b\d{8,20}\b/g;
const cardPattern = /\b(?:\d[ -]*?){13,19}\b/g;

export function redactSensitivePrompt(input: string): string {
  return input.replace(accountNumberPattern, "[REDACTED_NUMBER]").replace(cardPattern, "[REDACTED_CARD]");
}
