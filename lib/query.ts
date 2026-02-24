import { HttpError } from "@/lib/response";

export function parseLimitOffset(searchParams: URLSearchParams) {
  const limit = Number(searchParams.get("limit") ?? "50");
  const offset = Number(searchParams.get("offset") ?? "0");

  if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
    throw new HttpError(400, "limit must be an integer between 1 and 100");
  }

  if (!Number.isInteger(offset) || offset < 0) {
    throw new HttpError(400, "offset must be a non-negative integer");
  }

  return { limit, offset };
}
