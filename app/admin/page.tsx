"use client";

import { useEffect, useState } from "react";
import AdminProducts from "@/components/admin-products";

type AdminOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  status: string;
  totalAmount: number;
  items: { productName: string; quantity: number }[];
};

const STATUSES = ["pending", "confirmed", "production", "delivered"];

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  useEffect(() => {
    fetch("/api/admin/session").then((r) => r.json()).then((d) => setLoggedIn(d.loggedIn));
  }, []);

  async function login() {
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) setLoggedIn(true);
    else setError(data.error || "Login failed");
  }

  async function loadOrders() {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    if (res.ok) setOrders(data.orders);
  }

  useEffect(() => {
    if (loggedIn) loadOrders();
  }, [loggedIn]);

  async function updateStatus(orderNumber: string, status: string) {
    await fetch("/api/admin/orders/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, status }),
    });
    loadOrders();
  }

  if (loggedIn === null) return <main className="min-h-screen bg-neutral-50" />;

  if (!loggedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold">
            Brand<span className="text-orange-600">Box</span> Admin
          </h1>
          <p className="mt-1 text-sm text-neutral-500">Sign in to manage your shop.</p>
          <div className="mt-4 space-y-2">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              onClick={login}
              className="w-full rounded-lg bg-neutral-900 py-2 text-sm font-medium text-white hover:bg-neutral-700"
            >
              Sign In
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">
            Brand<span className="text-orange-600">Box</span> Admin
          </h1>
          <a href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
            ← Back to store
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="text-lg font-semibold">Orders</h2>
        <p className="text-sm text-neutral-500">
          Update each order as it moves through fulfilment.
        </p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Items</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.customerName}</p>
                      <p className="text-xs text-neutral-500">{o.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-600">
                      {o.items.map((i) => `${i.productName} x${i.quantity}`).join(", ")}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      KES {o.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.orderNumber, e.target.value)}
                        className="rounded-lg border border-neutral-300 px-2 py-1 text-xs"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
            <AdminProducts />
    </main>
  );
}