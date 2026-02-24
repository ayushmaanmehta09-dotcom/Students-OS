"use client";

import { FormEvent, useEffect, useState } from "react";

import { apiFetch } from "@/lib/http-client";

type PaymentLog = {
  id: string;
  payee: string;
  amount_cents: number;
  currency: string;
  paid_at: string;
  status: string;
  proof_url: string | null;
};

export default function PaymentsPage() {
  const [items, setItems] = useState<PaymentLog[]>([]);
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const payload = await apiFetch<{ items: PaymentLog[] }>("/api/payment-logs");
      setItems(payload.items);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load payment logs");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await apiFetch("/api/payment-logs", {
      method: "POST",
      body: {
        payee,
        amountCents: Math.round(Number(amount) * 100),
        currency: "EUR",
        paidAt: new Date(paidAt).toISOString(),
        proofUrl: proofUrl || null,
        status: "paid"
      }
    });
    setPayee("");
    setAmount("");
    setPaidAt("");
    setProofUrl("");
    await load();
  }

  return (
    <section className="page-grid">
      <article className="panel">
        <h2>Add payment proof</h2>
        <form onSubmit={(event) => void createPayment(event)}>
          <label className="label" htmlFor="payee">
            Payee
          </label>
          <input id="payee" value={payee} onChange={(event) => setPayee(event.target.value)} required />

          <label className="label" htmlFor="amount">
            Amount (major units)
          </label>
          <input id="amount" type="number" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required />

          <label className="label" htmlFor="paid-at">
            Paid at
          </label>
          <input
            id="paid-at"
            type="datetime-local"
            value={paidAt}
            onChange={(event) => setPaidAt(event.target.value)}
            required
          />

          <label className="label" htmlFor="proof-url">
            Proof URL (optional)
          </label>
          <input id="proof-url" value={proofUrl} onChange={(event) => setProofUrl(event.target.value)} />

          <button type="submit">Save</button>
        </form>
      </article>

      <article className="panel" style={{ gridColumn: "1 / -1" }}>
        <h2>Payment logs</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Payee</th>
              <th>Amount</th>
              <th>Paid at</th>
              <th>Status</th>
              <th>Proof</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.payee}</td>
                <td>
                  {item.currency} {(item.amount_cents / 100).toFixed(2)}
                </td>
                <td>{new Date(item.paid_at).toLocaleString()}</td>
                <td>{item.status}</td>
                <td>
                  {item.proof_url ? (
                    <a href={item.proof_url} target="_blank" rel="noreferrer">
                      View
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {error ? <p className="error">{error}</p> : null}
      </article>
    </section>
  );
}
