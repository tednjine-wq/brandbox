"use client";

import { useEffect, useState } from "react";
import CartDrawer from "@/components/cart-drawer";
import { useCartStore } from "@/lib/cart-store";

const WHATSAPP_NUMBER = "254712345678"; // TODO: replace with your real WhatsApp business number

type Category = { id: string; name: string; slug: string };
type PriceTier = { minQty: number; price: number };
type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  moq: number;
  buyType: string;
  featured: boolean;
  category: Category | null;
  priceTiers: PriceTier[];
};

function pill(active: boolean) {
  return `whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition ${
    active
      ? "border-neutral-900 bg-neutral-900 text-white"
      : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500"
  }`;
}

function emojiFor(slug?: string) {
  switch (slug) {
    case "drinkware": return "☕";
    case "apparel": return "👕";
    case "stationery": return "🖊️";
    case "bags": return "🎒";
    case "tech-accessories": return "💾";
    case "event-items": return "🎪";
    default: return "📦";
  }
}

function bestPrice(p: Product) {
  if (p.priceTiers.length > 0) {
    return Math.min(...p.priceTiers.map((t) => t.price));
  }
  return p.price;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories));
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category]);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold tracking-tight">
            Brand<span className="text-orange-600">Box</span>
          </h1>
          <div className="flex items-center gap-3">
            <p className="hidden text-sm text-neutral-500 sm:block">
              Branded merchandise, Kenya
            </p>
            <button
              onClick={openCart}
              className="relative rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-sm font-medium hover:border-neutral-500"
            >
              Cart
              {items.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-xs font-bold text-white">
                  {items.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-4 pt-8">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Promotional products with transparent bulk pricing
        </h2>
        <p className="mt-2 text-neutral-600">
          Browse {products.length} products across {categories.length} categories.
        </p>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search mugs, pens, tote bags..."
          className="w-full rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500"
        />
      </div>

      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-6">
        <button onClick={() => setCategory(null)} className={pill(!category)}>
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.slug)}
            className={pill(category === c.slug)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        {loading ? (
          <p className="py-20 text-center text-neutral-500">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="py-20 text-center text-neutral-500">
            No products match your search.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-28 items-center justify-center rounded-lg bg-neutral-100 text-4xl">
                  {emojiFor(p.category?.slug ?? undefined)}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                    {p.category?.name}
                  </span>
                  {p.featured && (
                    <span className="text-xs text-amber-600">★ Featured</span>
                  )}
                </div>
                <h3 className="mt-2 font-semibold">{p.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
                  {p.description}
                </p>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-neutral-500">From</p>
                    <p className="font-bold">KES {bestPrice(p).toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-neutral-500">MOQ {p.moq}</p>
                </div>
                <div className="mt-3">
                  {p.buyType === "checkout" ? (
                    <button
                      onClick={() =>
                        addItem({
                          id: p.id,
                          name: p.name,
                          price: p.price,
                          moq: p.moq,
                          buyType: p.buyType,
                          priceTiers: p.priceTiers,
                        })
                      }
                      className="w-full rounded-lg bg-neutral-900 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        `Hello BrandBox! I'm interested in ${p.name} (MOQ ${p.moq}). Please share a quote.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full rounded-lg bg-green-600 py-2 text-center text-sm font-medium text-white hover:bg-green-500"
                    >
                      Enquire on WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <CartDrawer />
    </main>
  );
}