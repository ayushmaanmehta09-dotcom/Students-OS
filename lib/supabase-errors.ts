import { HttpError } from "@/lib/response";

type SupabaseErrorLike = {
  message: string;
  code?: string;
};

export function throwIfError(error: SupabaseErrorLike | null, fallbackMessage: string) {
  if (!error) {
    return;
  }

  throw new HttpError(500, fallbackMessage, {
    code: error.code,
    message: error.message
  });
}

export function isNotFoundError(error: SupabaseErrorLike | null) {
  return Boolean(error && error.code === "PGRST116");
}
