"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/http-client";

type Counts = {
  deadlines: number;
  openChecklistItems: number;
  paymentLogs: number;
  emailDrafts: number;
};

export default function DashboardPage() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [deadlines, checklists, paymentLogs, emailDrafts] = await Promise.all([
          apiFetch<{ items: Array<unknown> }>("/api/deadlines"),
          apiFetch<{ items: Array<{ id: string }> }>("/api/checklists"),
          apiFetch<{ items: Array<unknown> }>("/api/payment-logs"),
          apiFetch<{ items: Array<unknown> }>("/api/email-drafts")
        ]);

        let openItems = 0;
        await Promise.all(
          checklists.items.map(async (checklist) => {
            const details = await apiFetch<{ items: Array<{ is_done: boolean }> }>(`/api/checklists/${checklist.id}`);
            openItems += details.items.filter((item) => !item.is_done).length;
          })
        );

        if (!cancelled) {
          setCounts({
            deadlines: deadlines.items.length,
            openChecklistItems: openItems,
            paymentLogs: paymentLogs.items.length,
            emailDrafts: emailDrafts.items.length
          });
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="page-grid">
      <article className="panel">
        <h2>Today&apos;s control panel</h2>
        <p className="muted">Use this page to verify your own data access token and route health.</p>
        {error ? <p className="error">{error}</p> : null}
        {!error && !counts ? <p className="muted">Loading metrics…</p> : null}
      </article>

      <article className="panel">
        <h3>Upcoming deadlines</h3>
        <p className="brand" style={{ margin: "16px 0 0" }}>{counts ? counts.deadlines : "-"}</p>
      </article>

      <article className="panel">
        <h3>Open checklist items</h3>
        <p className="brand" style={{ margin: "16px 0 0" }}>{counts ? counts.openChecklistItems : "-"}</p>
      </article>

      <article className="panel">
        <h3>Payment logs</h3>
        <p className="brand" style={{ margin: "16px 0 0" }}>{counts ? counts.paymentLogs : "-"}</p>
      </article>

      <article className="panel">
        <h3>Email drafts</h3>
        <p className="brand" style={{ margin: "16px 0 0" }}>{counts ? counts.emailDrafts : "-"}</p>
      </article>
    </section>
  );
}
