"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { clearAuthSession, createBrowserSupabaseClient, saveAccessToken } from "@/lib/browser-auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleSignedIn = useCallback((accessToken: string) => {
    saveAccessToken(accessToken);
    setStatus("Signed in. Redirecting to dashboard...");
    router.replace("/");
  }, [router]);

  // Handle OAuth redirect callback and any async auth state updates.
  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        handleSignedIn(session.access_token);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        handleSignedIn(session.access_token);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleSignedIn]);

  async function onOAuthSignIn(provider: "google" | "apple") {
    setError("");
    setStatus(`Redirecting to ${provider}...`);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/login` }
      });
      if (oauthError) throw oauthError;
    } catch (oauthFailure) {
      setError(oauthFailure instanceof Error ? oauthFailure.message : "OAuth sign in failed");
      setStatus("");
    }
  }

  async function onSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("Signing in...");

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError || !data.session?.access_token) {
        throw signInError ?? new Error("No session returned from Supabase");
      }

      handleSignedIn(data.session.access_token);
    } catch (signInFailure) {
      setError(signInFailure instanceof Error ? signInFailure.message : "Sign in failed");
      setStatus("");
    }
  }

  async function onSignUp() {
    setError("");
    setStatus("Creating account...");

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        throw signUpError;
      }

      setStatus("Account created. Confirm email if required, then sign in.");
    } catch (signUpFailure) {
      setError(signUpFailure instanceof Error ? signUpFailure.message : "Sign up failed");
      setStatus("");
    }
  }

  return (
    <section className="page-grid">
      <article className="panel">
        <h2>Login</h2>
        <p className="muted">Supabase email/password auth. This page stores the access token for API requests.</p>

        <form onSubmit={onSignIn}>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit">Sign in</button>
            <button
              className="secondary"
              type="button"
              onClick={() => {
                void clearAuthSession();
                setStatus("Signed out.");
              }}
            >
              Clear token
            </button>
            <button className="secondary" type="button" onClick={() => void onSignUp()}>
              Sign up
            </button>
          </div>
        </form>

        {status ? <p className="ok">{status}</p> : null}
        {error ? <p className="error">{error}</p> : null}

        <hr style={{ margin: "1.5rem 0", border: "none", borderTop: "1px solid #ddd" }} />
        <p className="muted" style={{ textAlign: "center", marginBottom: "0.75rem" }}>Or continue with</p>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={() => void onOAuthSignIn("google")} style={{ flex: 1 }}>
            Google
          </button>
          <button type="button" onClick={() => void onOAuthSignIn("apple")} style={{ flex: 1 }}>
            Apple
          </button>
        </div>
      </article>
    </section>
  );
}
