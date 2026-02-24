"use client";

import { FormEvent, useEffect, useState } from "react";

import { apiFetch } from "@/lib/http-client";

type DeadlineRow = {
  id: string;
  title: string;
  due_date: string;
  status: string;
  currency: string;
  amount_cents: number | null;
};

export default function DeadlinesPage() {
  const [items, setItems] = useState<DeadlineRow[]>([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const payload = await apiFetch<{ items: DeadlineRow[] }>("/api/deadlines");
      setItems(payload.items);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load deadlines");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await apiFetch<{ item: DeadlineRow }>("/api/deadlines", {
        method: "POST",
        body: {
          title,
          dueDate: new Date(dueDate).toISOString(),
          status: "pending",
          currency: "EUR"
        }
      });
      setTitle("");
      setDueDate("");
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create deadline");
    }
  }

  return (
    <section className="page-grid">
      <article className="panel">
        <h2>Add deadline</h2>
        <form onSubmit={onSubmit}>
          <label className="label" htmlFor="deadline-title">
            Title
          </label>
          <input id="deadline-title" value={title} onChange={(event) => setTitle(event.target.value)} required />

          <label className="label" htmlFor="deadline-date">
            Due date
          </label>
          <input
            id="deadline-date"
            type="datetime-local"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            required
          />

          <button type="submit">Create</button>
        </form>
        {error ? <p className="error">{error}</p> : null}
      </article>

      <article className="panel" style={{ gridColumn: "1 / -1" }}>
        <h2>Deadlines</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Due</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{new Date(item.due_date).toLocaleString()}</td>
                <td>{item.status}</td>
                <td>{item.amount_cents ? `${item.currency} ${(item.amount_cents / 100).toFixed(2)}` : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}
