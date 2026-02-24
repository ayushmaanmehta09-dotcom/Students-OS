import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function json<T>(payload: T, status = 200) {
  return NextResponse.json(payload, { status });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function handleError(error: unknown) {
  if (error instanceof HttpError) {
    return json(
      {
        error: error.message,
        details: error.details ?? null
      },
      error.status
    );
  }

  if (error instanceof ZodError) {
    return json(
      {
        error: "Validation error",
        details: error.flatten()
      },
      400
    );
  }

  console.error("Unexpected API error", error);
  return json(
    {
      error: "Internal server error"
    },
    500
  );
}
