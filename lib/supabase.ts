import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

import { getEnv } from "@/lib/env";
import { HttpError } from "@/lib/response";

function baseClientOptions() {
  return {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  } as const;
}

export function createAnonClient() {
  const env = getEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, baseClientOptions());
}

export function createUserScopedClient(accessToken: string): SupabaseClient {
  const env = getEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    ...baseClientOptions(),
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
}

export function createServiceClient() {
  const env = getEnv();
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new HttpError(500, "SUPABASE_SERVICE_ROLE_KEY is required");
  }

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, baseClientOptions());
}

export async function requireAuth(request: Request): Promise<{
  accessToken: string;
  user: User;
  client: SupabaseClient;
}> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing Bearer authorization header");
  }

  const accessToken = authHeader.slice("Bearer ".length).trim();
  if (!accessToken) {
    throw new HttpError(401, "Access token is empty");
  }

  const anonClient = createAnonClient();
  const { data, error } = await anonClient.auth.getUser(accessToken);
  if (error || !data.user) {
    throw new HttpError(401, "Invalid access token");
  }

  return {
    accessToken,
    user: data.user,
    client: createUserScopedClient(accessToken)
  };
}
