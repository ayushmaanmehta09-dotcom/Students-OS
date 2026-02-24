"use client";

import { FormEvent, useState } from "react";

import { clearAccessToken, createBrowserSupabaseClient, saveAccessToken } from "@/lib/browser-auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

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

      saveAccessToken(data.session.access_token);
      setStatus("Signed in. API token stored in local storage.");
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
            <button className="secondary" type="button" onClick={() => clearAccessToken()}>
              Clear token
            </button>
            <button className="secondary" type="button" onClick={() => void onSignUp()}>
              Sign up
            </button>
          </div>
        </form>

        {status ? <p className="ok">{status}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </article>
    </section>
  );
}
