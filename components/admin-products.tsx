"use client";

import { useEffect, useState } from "react";

type Tier = { minQty: number; price: number };
type Category = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  price: number;
  moq: number;
  buyType: string;
  colours: string | null;
  printingType: string | null;
  featured: boolean;
  active: boolean;
  categoryId: string | null;
  category: Category | null;
  priceTiers: Tier[];
};

const inp =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-orange-500";

const EMPTY_FORM = {
  id: "",
  name: "",
  description: "",
  image: "",
  price: "",
  moq: "",
  buyType: "checkout",
  categoryId: "",
  colours: "",
  printingType: "",
  featured: false,
  active: true,
  tiers: [
    { minQty: "", price: "" },
    { minQty: "", price: "" },
    { minQty: "", price: "" },
  ],
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<any>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function load() {
    const [p, c] = await Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]);
    setProducts(p.products ?? []);
    setCategories(c.categories ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  function openAdd() {
    setError("");
    setForm({ ...EMPTY_FORM, tiers: EMPTY_FORM.tiers.map((t) => ({ ...t })) });
  }

  function openEdit(p: Product) {
    setError("");
    setForm({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      image: p.image ?? "",
      price: String(p.price),
      moq: String(p.moq),
      buyType: p.buyType,
      categoryId: p.categoryId ?? "",
      colours: p.colours ?? "",
      printingType: p.printingType ?? "",
      featured: p.featured,
      active: p.active,
      tiers: p.priceTiers.length
        ? p.priceTiers.map((t) => ({ minQty: String(t.minQty), price: String(t.price) }))
        : [{ minQty: "", price: "" }],
    });
  }

  function updateTier(i: number, key: "minQty" | "price", value: string) {
    setForm({
      ...form,
      tiers: form.tiers.map((t: any, idx: number) => (idx === i ? { ...t, [key]: value } : t)),
    });
  }

  function addTier() {
    setForm({ ...form, tiers: [...form.tiers, { minQty: "", price: "" }] });
  }

  function removeTier(i: number) {
    setForm({ ...form, tiers: form.tiers.filter((_: any, idx: number) => idx !== i) });
  }

  async function uploadPhoto(e: any) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", f);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setError(data.error || "Upload failed");
      return;
    }
    setForm({ ...form, image: data.url });
  }

  async function save() {
    setError("");
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: form.id || undefined,
        name: form.name,
        description: form.description,
        image: form.image || null,
        price: Number(form.price),
        moq: Number(form.moq),
        buyType: form.buyType,
        categoryId: form.categoryId || null,
        colours: form.colours,
        printingType: form.printingType,
        featured: form.featured,
        active: form.active,
        tiers: form.tiers,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Save failed");
      return;
    }
    setForm(null);
    load();
  }

  async function toggle(p: Product) {
    await fetch("/api/admin/products/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id }),
    });
    load();
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Products</h2>
          <p className="text-sm text-neutral-500">Add, edit, and publish your catalog.</p>
        </div>
        <button
          onClick={openAdd}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          + Add Product
        </button>
      </div>

      {form && (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
          <h3 className="font-semibold">{form.id ? "Edit Product" : "New Product"}</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              className={inp}
              placeholder="Product name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <select
              className={inp}
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              className={inp}
              placeholder="Base price (KES) *"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <input
              className={inp}
              placeholder="MOQ"
              type="number"
              value={form.moq}
              onChange={(e) => setForm({ ...form, moq: e.target.value })}
            />
            <select
              className={inp}
              value={form.buyType}
              onChange={(e) => setForm({ ...form, buyType: e.target.value })}
            >
              <option value="checkout">checkout (Add to Cart)</option>
              <option value="enquiry">enquiry (WhatsApp)</option>
            </select>
            <input
              className={inp}
              placeholder="Colours (comma separated)"
              value={form.colours}
              onChange={(e) => setForm({ ...form, colours: e.target.value })}
            />
            <input
              className={inp}
              placeholder="Printing type"
              value={form.printingType}
              onChange={(e) => setForm({ ...form, printingType: e.target.value })}
            />
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                Featured
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                Active
              </label>
            </div>
          </div>

          <div className="mt-3">
            <p className="text-sm font-medium">Product photo</p>
            <div className="mt-2 flex items-center gap-3">
              {form.image ? (
                <img
                  src={form.image}
                  alt="preview"
                  className="h-16 w-16 rounded-lg border border-neutral-300 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-neutral-300 text-xs text-neutral-400">
                  No photo
                </div>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={uploadPhoto}
                className="text-sm"
              />
              {form.image && (
                <button
                  onClick={() => setForm({ ...form, image: "" })}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            {uploading && <p className="mt-1 text-xs text-neutral-500">Uploading...</p>}
          </div>

          <textarea
            className={`${inp} mt-3`}
            rows={3}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="mt-4">
            <p className="text-sm font-medium">Price tiers (optional)</p>
            <div className="mt-2 space-y-2">
              {form.tiers.map((t: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className={`${inp} w-32`}
                    type="number"
                    placeholder="Min qty"
                    value={t.minQty}
                    onChange={(e) => updateTier(i, "minQty", e.target.value)}
                  />
                  <input
                    className={`${inp} w-32`}
                    type="number"
                    placeholder="Unit price"
                    value={t.price}
                    onChange={(e) => updateTier(i, "price", e.target.value)}
                  />
                  <button onClick={() => removeTier(i)} className="text-xs text-red-500 hover:underline">
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addTier} className="mt-2 text-sm text-neutral-600 hover:text-neutral-900">
              + Add tier
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-4 flex gap-2">
            <button
              onClick={save}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
            >
              Save Product
            </button>
            <button
              onClick={() => setForm(null)}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-600 hover:border-neutral-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">MOQ</th>
              <th className="px-4 py-2">Buy type</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    {p.image && (
                      <img
                        src={p.image}
                        alt=""
                        className="h-8 w-8 rounded border border-neutral-200 object-cover"
                      />
                    )}
                    {p.name}
                  </div>
                </td>
                <td className="px-4 py-3 text-neutral-600">{p.category?.name ?? "—"}</td>
                <td className="px-4 py-3">KES {p.price.toLocaleString()}</td>
                <td className="px-4 py-3">{p.moq}</td>
                <td className="px-4 py-3 text-xs">{p.buyType}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggle(p)}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.active ? "bg-green-100 text-green-700" : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    {p.active ? "active" : "hidden"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openEdit(p)}
                    className="text-xs text-neutral-600 hover:text-neutral-900 hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}