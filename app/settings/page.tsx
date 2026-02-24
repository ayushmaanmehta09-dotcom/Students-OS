"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/http-client";

type BillingStatus = {
  plan: string;
  status: string;
  renewalAt: string | null;
};

export default function SettingsPage() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [paymentLink, setPaymentLink] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [billingStatus, paymentLinkPayload] = await Promise.all([
          apiFetch<BillingStatus>("/api/billing/status"),
          apiFetch<{ url: string }>("/api/billing/payment-link").catch(() => ({ url: "" }))
        ]);

        setStatus(billingStatus);
        setPaymentLink(paymentLinkPayload.url);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load billing settings");
      }
    }

    void load();
  }, []);

  return (
    <section className="page-grid">
      <article className="panel">
        <h2>Billing status</h2>
        {error ? <p className="error">{error}</p> : null}
        {!error && !status ? <p className="muted">Loading...</p> : null}

        {status ? (
          <>
            <p>
              <strong>Plan:</strong> {status.plan}
            </p>
            <p>
              <strong>Status:</strong> {status.status}
            </p>
            <p>
              <strong>Renewal:</strong> {status.renewalAt ? new Date(status.renewalAt).toLocaleString() : "n/a"}
            </p>
          </>
        ) : null}
      </article>

      <article className="panel">
        <h2>Upgrade</h2>
        {paymentLink ? (
          <a href={paymentLink} target="_blank" rel="noreferrer">
            <button type="button">Open payment link</button>
          </a>
        ) : (
          <p className="muted">Payment link helper is disabled.</p>
        )}
      </article>
    </section>
  );
}
