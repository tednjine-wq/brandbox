"use client";

import { useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  order: number;
  _count: { products: number };
};

const inp =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-orange-500";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    if (res.ok) setCategories(data.categories ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Failed to add category");
      return;
    }
    setName("");
    setDescription("");
    load();
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <h2 className="text-lg font-semibold">Categories</h2>
      <p className="text-sm text-neutral-500">
        Create the shelves your products will sit on.
      </p>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            className={inp}
            placeholder="Category name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className={inp}
            placeholder="Short description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button
          onClick={add}
          disabled={busy}
          className="mt-3 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-40"
        >
          {busy ? "Adding..." : "+ Add Category"}
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Slug</th>
              <th className="px-4 py-2">Products</th>
              <th className="px-4 py-2">Order</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-neutral-500">{c.slug}</td>
                <td className="px-4 py-3">{c._count.products}</td>
                <td className="px-4 py-3">{c.order}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}