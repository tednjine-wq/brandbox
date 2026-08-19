"use client";

import { useEffect, useState } from "react";
import { vatBreakdown } from "@/lib/vat";

type Tier = { minQty: number; price: number };
type Product = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  images: string | null;
  price: number;
  moq: number;
  buyType: string;
  colours: string | null;
  printingType: string | null;
  category: { name: string; slug: string } | null;
  priceTiers: Tier[];
};

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

function effectivePrice(p: Product, qty: number): number {
  const tiers = [...p.priceTiers].sort((a, b) => a.minQty - b.minQty);
  let price = p.price;
  for (const t of tiers) if (qty >= t.minQty) price = t.price;
  return price;
}

export default function ProductModal({
  product,
  onClose,
  onAdd,
  whatsapp,
}: {
  product: Product | null;
  onClose: () => void;
  onAdd: (
    item: { id: string; name: string; price: number; moq: number; buyType: string; priceTiers: Tier[] },
    quantity: number
  ) => void;
  whatsapp: string;
}) {
  const [qty, setQty] = useState(0);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (product) {
      setQty(product.moq);
      setIdx(0);
    }
  }, [product]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!product) return null;

  const photos = parsePhotos(product);
  const current = photos.length > 0 ? photos[Math.min(idx, photos.length - 1)] : null;
  const quantity = Math.max(qty || product.moq, product.moq);
  const unit = effectivePrice(product, quantity);
  const lineTotal = unit * quantity;
  const breakdown = vatBreakdown(lineTotal);
  const tiers = [...product.priceTiers].sort((a, b) => a.minQty - b.minQty);
  const colours = product.colours
    ? product.colours.split(",").map((c) => c.trim()).filter(Boolean)
    : [];
  const methods = product.printingType
    ? product.printingType.split(",").map((c) => c.trim()).filter(Boolean)
    : [];

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-line bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex h-56 items-center justify-center bg-paper text-6xl sm:h-64">
          {current ? (
            <img src={current} alt={product.name} className="h-full w-full object-contain p-2" />
          ) : (
            "📦"
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow hover:text-ink"
          >
            ✕
          </button>
          <span className={`stamp ${product.buyType === "checkout" ? "stamp-stock" : "stamp-order"}`}>
            {product.buyType === "checkout" ? "In stock" : "Made to order"}
          </span>
        </div>

        {photos.length > 1 && (
          <div className="flex flex-wrap gap-1.5 px-5 pt-3">
            {photos.map((url, j) => (
              <button
                key={url}
                onClick={() => setIdx(j)}
                className={`h-12 w-12 overflow-hidden rounded-md border-2 ${
                  j === Math.min(idx, photos.length - 1)
                    ? "border-brand"
                    : "border-line opacity-70 hover:opacity-100"
                }`}
              >
                <img src={url} alt="" className="h-full w-full object-contain bg-white" />
              </button>
            ))}
          </div>
        )}

        <div className="p-5 sm:p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-brand">
            {product.category?.name}
          </p>
          <h2 className="mt-1 font-display text-xl font-bold sm:text-2xl">{product.name}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{product.description}</p>

          {(colours.length > 0 || methods.length > 0) && (
            <div className="mt-4 rounded-lg bg-paper px-3 py-2 text-sm">
              {colours.length > 0 && (
                <p>
                  <span className="font-medium">Colours:</span>{" "}
                  <span className="text-ink-muted">{colours.join(", ")}</span>
                </p>
              )}
              {methods.length > 0 && (
                <p className="mt-1">
                  <span className="font-medium">Branding:</span>{" "}
                  <span className="text-ink-muted">{methods.join(", ")}</span>
                </p>
              )}
            </div>
          )}

          <div className="mt-4">
            <p className="text-sm font-medium">Bulk pricing (excl. VAT)</p>
            <div className="mt-2 space-y-1.5">
              {tiers.length === 0 && (
                <div className="flex justify-between rounded-lg bg-paper px-3 py-2 font-mono-data text-sm">
                  <span>{product.moq}+ units</span>
                  <span>KES {product.price.toLocaleString()}/unit</span>
                </div>
              )}
              {tiers.map((t, i) => {
                const next = tiers[i + 1];
                const range = next ? `${t.minQty}–${next.minQty - 1}` : `${t.minQty}+`;
                const active = quantity >= t.minQty && (!next || quantity < next.minQty);
                const off = Math.round((1 - t.price / product.price) * 100);
                return (
                  <div
                    key={t.minQty}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 font-mono-data text-sm ${
                      active ? "border-brand/40 bg-brand/10" : "border-transparent bg-paper"
                    }`}
                  >
                    <span>{range} units</span>
                    <span className="flex items-center gap-2">
                      {off > 0 && (
                        <span className="rounded border border-red-200 bg-red-50 px-1.5 text-[10px] font-bold text-red-700">
                          {off}% OFF
                        </span>
                      )}
                      KES {t.price.toLocaleString()}/unit
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty(Math.max(quantity - 10, product.moq))}
                className="h-10 w-10 rounded-lg border border-line text-lg hover:border-brand"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                min={product.moq}
                onChange={(e) => setQty(Number(e.target.value))}
                className="h-10 w-20 rounded-lg border border-line px-2 text-center font-mono-data text-sm"
              />
              <button
                onClick={() => setQty(quantity + 10)}
                className="h-10 w-10 rounded-lg border border-line text-lg hover:border-brand"
              >
                +
              </button>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-ink-muted">
                {quantity} units × KES {unit.toLocaleString()}
              </p>
              <p className="text-xs text-ink-muted">
                + VAT 16%: KES {breakdown.vat.toLocaleString()}
              </p>
              <p className="font-mono-data text-lg font-bold">
                KES {breakdown.total.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            MOQ {product.moq} units · Prices exclude 16% VAT, added at checkout
          </p>

          <div className="mt-4">
            {product.buyType === "checkout" ? (
              <button
                onClick={() => {
                  onAdd(
                    {
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      moq: product.moq,
                      buyType: product.buyType,
                      priceTiers: product.priceTiers,
                    },
                    quantity
                  );
                  onClose();
                }}
                className="w-full rounded-lg bg-brand py-3 text-sm font-semibold text-white hover:brightness-110"
              >
                Add to cart — KES {breakdown.total.toLocaleString()}
              </button>
            ) : (
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                  `Hello BrandBox! I'd like a quote for ${product.name} at ${quantity} units (MOQ ${product.moq}).`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-lg border border-ink py-3 text-center text-sm font-semibold text-ink hover:bg-ink hover:text-white"
              >
                Enquire on WhatsApp for {quantity} units
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}