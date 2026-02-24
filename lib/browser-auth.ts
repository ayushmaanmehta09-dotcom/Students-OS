import { createClient } from "@supabase/supabase-js";

const ACCESS_TOKEN_KEY = "student_app_access_token";

export function saveAccessToken(accessToken: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function readAccessToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ACCESS_TOKEN_KEY) ?? "";
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
}

export async function getSessionAccessToken() {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const token = session?.access_token ?? "";
  if (token) {
    saveAccessToken(token);
  }

  return token;
}

export async function clearAuthSession() {
  const supabase = createBrowserSupabaseClient();
  await supabase.auth.signOut().catch(() => {
    // ignore sign-out transport errors and clear local state anyway
  });
  clearAccessToken();
}
