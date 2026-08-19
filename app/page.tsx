"use client";

import { useEffect, useRef, useState } from "react";
import CartDrawer from "@/components/cart-drawer";
import ProductModal from "@/components/product-modal";
import { useCartStore } from "@/lib/cart-store";

const WHATSAPP_NUMBER = "254712345678"; // TODO: replace with your real WhatsApp business number

type Category = { id: string; name: string; slug: string };
type PriceTier = { minQty: number; price: number };
type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  images: string | null;
  price: number;
  moq: number;
  buyType: string;
  colours: string | null;
  printingType: string | null;
  featured: boolean;
  category: Category | null;
  priceTiers: PriceTier[];
};

type CartAdd = {
  id: string;
  name: string;
  price: number;
  moq: number;
  buyType: string;
  priceTiers: PriceTier[];
};

function pill(active: boolean) {
  return `whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition ${
    active
      ? "border-brand bg-brand text-white"
      : "border-line bg-white text-ink-muted hover:border-ink-muted"
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

function tierRows(p: Product): PriceTier[] {
  const tiers = [...p.priceTiers].sort((a, b) => a.minQty - b.minQty);
  if (tiers.length === 0) return [];
  const first = tiers[0];
  const last = tiers[tiers.length - 1];
  return last.minQty === first.minQty ? [first] : [first, last];
}

function parsePhotos(p: Product): string[] {
  if (p.images) {
    try {
      const arr = JSON.parse(p.images);
      if (Array.isArray(arr) && arr.length > 0) {
        return arr.filter((x) => typeof x === "string");
      }
    } catch {
      // fall back to cover
    }
  }
  return p.image ? [p.image] : [];
}

function ProductCard({
  p,
  i,
  onAdd,
  onOpen,
}: {
  p: Product;
  i: number;
  onAdd: (item: CartAdd) => void;
  onOpen: () => void;
}) {
  const photos = parsePhotos(p);
  const [idx, setIdx] = useState(0);
  const current = photos.length > 0 ? photos[Math.min(idx, photos.length - 1)] : null;

  return (
    <div
      onClick={onOpen}
      style={{ animationDelay: `${Math.min(i, 11) * 40}ms` }}
      className="animate-fade-up relative cursor-pointer rounded-xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand"
    >
      <span className={`stamp ${p.buyType === "checkout" ? "stamp-stock" : "stamp-order"}`}>
        {p.buyType === "checkout" ? "In stock" : "Made to order"}
      </span>

      <div className="flex h-28 items-center justify-center overflow-hidden rounded-lg border border-line bg-paper text-4xl">
        {current ? (
          <img src={current} alt={p.name} className="h-full w-full object-contain" />
        ) : (
          emojiFor(p.category?.slug ?? undefined)
        )}
      </div>

      {photos.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {photos.map((url, j) => (
            <button
              key={url}
              onClick={(e) => {
                e.stopPropagation();
                setIdx(j);
              }}
              aria-label={`View photo ${j + 1} of ${p.name}`}
              className={`h-9 w-9 overflow-hidden rounded-md border-2 transition ${
                j === Math.min(idx, photos.length - 1)
                  ? "border-brand"
                  : "border-line opacity-70 hover:opacity-100"
              }`}
            >
              <img src={url} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
          {p.category?.name}
        </span>
        {p.featured && <span className="text-xs text-brand">★ Featured</span>}
      </div>

      <h3 className="mt-2 font-display font-semibold">{p.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{p.description}</p>

      <div className="mt-3 space-y-1 rounded-lg bg-paper px-3 py-2 font-mono-data text-xs text-ink-muted">
        {tierRows(p).length > 0 ? (
          tierRows(p).map((t, index) => (
            <div key={t.minQty} className="flex justify-between">
              <span>{index === 1 ? `${t.minQty}+` : t.minQty} units</span>
              <span>KES {t.price.toLocaleString()}</span>
            </div>
          ))
        ) : (
          <div className="flex justify-between">
            <span>{p.moq}+ units</span>
            <span>KES {p.price.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-xs text-ink-muted">From</p>
          <p className="font-mono-data font-semibold">KES {bestPrice(p).toLocaleString()}</p>
        </div>
        <p className="font-mono-data text-xs text-ink-muted">MOQ {p.moq}</p>
      </div>

      <div className="mt-3">
        {p.buyType === "checkout" ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd({
                id: p.id,
                name: p.name,
                price: p.price,
                moq: p.moq,
                buyType: p.buyType,
                priceTiers: p.priceTiers,
              });
            }}
            className="w-full rounded-lg bg-brand py-2 text-sm font-medium text-white transition hover:brightness-110"
          >
            Add to cart
          </button>
        ) : (
          <a
            onClick={(e) => e.stopPropagation()}
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              `Hello BrandBox! I'm interested in ${p.name} (MOQ ${p.moq}). Please share a quote.`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-lg border border-ink py-2 text-center text-sm font-medium text-ink transition hover:bg-ink hover:text-white"
          >
            Enquire
          </a>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hero, setHero] = useState({ products: 0, categories: 0 });
  const [selected, setSelected] = useState<Product | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const addItem = useCartStore((s) => s.addItem);
  const cartCount = items.length;

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories));

    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        const all: Product[] = d.products ?? [];
        const stocked = new Set(all.map((p) => p.category?.id).filter(Boolean));
        setHero({ products: all.length, categories: stocked.size });
      });
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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      const typing = t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement;
      if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-10 bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <h1 className="font-display text-xl font-bold tracking-tight">
            Brand<span className="text-brand">Box</span>
          </h1>

          <div className="relative order-3 w-full sm:order-2 sm:ml-auto sm:w-auto sm:max-w-md sm:flex-1">
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search mugs, pens, tote bags..."
              className="w-full rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm outline-none placeholder:text-white/40 focus:border-brand"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-white/20 px-1.5 text-[10px] text-white/50">
              /
            </kbd>
          </div>

          <button
            onClick={openCart}
            className="relative ml-auto rounded-full border border-white/20 px-4 py-1.5 text-sm font-medium transition hover:border-brand sm:ml-0"
          >
            Cart
            {cartCount > 0 && (
              <span
                key={cartCount}
                className="animate-bump absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs font-bold text-white"
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-6 pt-10">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          Promotional products with transparent bulk pricing
        </h2>
        <p className="mt-2 text-ink-muted">
          {hero.products} products across {hero.categories} categories.
        </p>
      </section>

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
          <p className="py-20 text-center text-ink-muted">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="py-20 text-center text-ink-muted">No products match your search.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard
                key={p.id}
                p={p}
                i={i}
                onAdd={(item) => addItem(item)}
                onOpen={() => setSelected(p)}
              />
            ))}
          </div>
        )}
      </section>

      <ProductModal
        product={selected}
        onClose={() => setSelected(null)}
        onAdd={(item, quantity) => addItem(item, quantity)}
        whatsapp={WHATSAPP_NUMBER}
      />

      <CartDrawer />
    </main>
  );
}