"use client";

import { useEffect, useState } from "react";
import { Clock, Coins, MessageCircle, Package, ShoppingCart, Star } from "lucide-react";

type Stats = {
  products: number;
  orders: number;
  revenue: number;
  pending: number;
  enquiries: number;
  featured: number;
};

export default function AdminKpis() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/stats");
      if (res.ok) setStats(await res.json());
    }
    load();
    window.addEventListener("brandbox:refresh", load);
    return () => window.removeEventListener("brandbox:refresh", load);
  }, []);

  if (!stats) return null;

  const cards = [
    { label: "Products", value: String(stats.products), border: "border-l-red-500", iconBg: "bg-red-100", iconText: "text-red-500", Icon: Package },
    { label: "Orders", value: String(stats.orders), border: "border-l-sky-500", iconBg: "bg-sky-100", iconText: "text-sky-500", Icon: ShoppingCart },
    { label: "Revenue", value: `KES ${stats.revenue.toLocaleString()}`, border: "border-l-amber-500", iconBg: "bg-amber-100", iconText: "text-amber-500", Icon: Coins },
    { label: "Pending", value: String(stats.pending), border: "border-l-orange-500", iconBg: "bg-orange-100", iconText: "text-orange-500", Icon: Clock },
    { label: "Enquiries", value: String(stats.enquiries), border: "border-l-violet-500", iconBg: "bg-violet-100", iconText: "text-violet-500", Icon: MessageCircle },
    { label: "Featured", value: String(stats.featured), border: "border-l-rose-500", iconBg: "bg-rose-100", iconText: "text-rose-500", Icon: Star },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 pt-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-xl border border-l-4 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg ${c.border}`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.iconBg}`}>
              <c.Icon className={`h-5 w-5 ${c.iconText}`} />
            </div>
            <p className="mt-2 text-xs font-medium uppercase tracking-wider text-neutral-500">
              {c.label}
            </p>
            <p className="text-xl font-bold leading-tight">{c.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}