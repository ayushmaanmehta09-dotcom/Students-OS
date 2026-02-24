import { readAccessToken } from "@/lib/browser-auth";

type RequestMethod = "GET" | "POST" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: RequestMethod;
  body?: unknown;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}) {
  const token = readAccessToken();
  if (!token) {
    throw new Error("You are not logged in. Please sign in first.");
  }

  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? `Request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
