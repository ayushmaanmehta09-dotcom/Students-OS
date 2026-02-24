"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { apiFetch } from "@/lib/http-client";

type Checklist = {
  id: string;
  title: string;
};

type ChecklistItem = {
  id: string;
  label: string;
  is_done: boolean;
};

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [checklistTitle, setChecklistTitle] = useState("");
  const [itemLabel, setItemLabel] = useState("");
  const [error, setError] = useState("");

  const loadChecklists = useCallback(async () => {
    const payload = await apiFetch<{ items: Checklist[] }>("/api/checklists");
    setChecklists(payload.items);
    setSelectedId((current) => current || payload.items[0]?.id || "");
  }, []);

  useEffect(() => {
    void loadChecklists().catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Failed to load checklists");
    });
  }, [loadChecklists]);

  useEffect(() => {
    if (!selectedId) return;
    void apiFetch<{ items: ChecklistItem[] }>(`/api/checklists/${selectedId}`)
      .then((payload) => setItems(payload.items))
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load checklist items");
      });
  }, [selectedId]);

  async function createChecklist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await apiFetch("/api/checklists", {
      method: "POST",
      body: { title: checklistTitle }
    });
    setChecklistTitle("");
    await loadChecklists();
  }

  async function createItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId) return;
    await apiFetch(`/api/checklists/${selectedId}/items`, {
      method: "POST",
      body: { label: itemLabel }
    });
    setItemLabel("");
    const payload = await apiFetch<{ items: ChecklistItem[] }>(`/api/checklists/${selectedId}`);
    setItems(payload.items);
  }

  async function toggleItem(item: ChecklistItem) {
    await apiFetch(`/api/checklist-items/${item.id}`, {
      method: "PATCH",
      body: { isDone: !item.is_done }
    });
    const payload = await apiFetch<{ items: ChecklistItem[] }>(`/api/checklists/${selectedId}`);
    setItems(payload.items);
  }

  return (
    <section className="page-grid">
      <article className="panel">
        <h2 style={{ color: "var(--accent)", marginBottom: "20px" }}>Create checklist</h2>
        <form onSubmit={(event) => void createChecklist(event)}>
          <label className="label" htmlFor="checklist-title">
            Title
          </label>
          <input
            id="checklist-title"
            value={checklistTitle}
            onChange={(event) => setChecklistTitle(event.target.value)}
            required
          />
          <button type="submit">Create</button>
        </form>

        <label className="label" htmlFor="checklist-select" style={{ marginTop: "24px" }}>
          Select checklist
        </label>
        <select id="checklist-select" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
          {checklists.map((checklist) => (
            <option key={checklist.id} value={checklist.id}>
              {checklist.title}
            </option>
          ))}
        </select>
      </article>

      <article className="panel" style={{ gridColumn: "1 / -1" }}>
        <h2 style={{ color: "var(--accent)" }}>Items</h2>
        <form onSubmit={(event) => void createItem(event)} style={{ display: "flex", gap: "12px", alignItems: "flex-end", marginBottom: "24px" }}>
          <div style={{ flex: 1 }}>
            <label className="label" htmlFor="item-label">
              New item
            </label>
            <input id="item-label" value={itemLabel} onChange={(event) => setItemLabel(event.target.value)} required style={{ marginBottom: 0 }} />
          </div>
          <button type="submit">Add item</button>
        </form>

        <table className="table">
          <thead>
            <tr>
              <th>Label</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td style={{ color: item.is_done ? "var(--ink-soft)" : "var(--ink)", textDecoration: item.is_done ? "line-through" : "none" }}>{item.label}</td>
                <td>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 500,
                      background: item.is_done ? "rgba(16, 185, 129, 0.15)" : "rgba(139, 92, 246, 0.15)",
                      color: item.is_done ? "#10b981" : "var(--accent-2)"
                    }}
                  >
                    {item.is_done ? "Completed" : "Open"}
                  </span>
                </td>
                <td>
                  <button className="secondary" type="button" onClick={() => void toggleItem(item)}>
                    Toggle
                  </button>
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
