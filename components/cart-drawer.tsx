"use client";

import { useState } from "react";
import { getCartTotal, getEffectivePrice, useCartStore } from "@/lib/cart-store";

type Stage = "cart" | "form" | "payment" | "done";

export default function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);

  const [stage, setStage] = useState<Stage>("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<{ orderNumber: string; totalAmount: number } | null>(null);

  async function placeOrder() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      setOrder({ orderNumber: data.orderNumber, totalAmount: data.totalAmount });
      setStage("payment");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  async function simulatePayment() {
    if (!order) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${order.orderNumber}/confirm`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment simulation failed");
      setStage("done");
      clearCart();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment simulation failed");
    } finally {
      setBusy(false);
    }
  }

  function finish() {
    setStage("cart");
    setOrder(null);
    setError("");
    closeCart();
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-20 bg-black/40" onClick={closeCart} />}
      <aside
        className={`fixed right-0 top-0 z-30 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <h2 className="font-semibold">
            {stage === "cart" || stage === "form" ? "Your Cart" : "Checkout"}
          </h2>
          <button onClick={closeCart} className="text-neutral-500 hover:text-neutral-900">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {(stage === "cart" || stage === "form") &&
            (items.length === 0 ? (
              <p className="py-16 text-center text-neutral-500">Your cart is empty.</p>
            ) : (
              items.map((item) => {
                const unit = getEffectivePrice(item.product, item.quantity);
                return (
                  <div key={item.product.id} className="mb-4 rounded-lg border border-neutral-200 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-xs text-neutral-500">KES {unit.toLocaleString()} per unit</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 10)}
                          className="h-8 w-8 rounded border border-neutral-300"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          min={item.product.moq}
                          onChange={(e) => updateQuantity(item.product.id, Number(e.target.value))}
                          className="w-20 rounded border border-neutral-300 px-2 py-1 text-sm"
                        />
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 10)}
                          className="h-8 w-8 rounded border border-neutral-300"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-semibold">KES {(unit * item.quantity).toLocaleString()}</p>
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">MOQ {item.product.moq}</p>
                  </div>
                );
              })
            ))}

          {stage === "payment" && order && (
            <div className="rounded-lg border border-neutral-200 p-4 text-sm">
              <p className="font-semibold">Order {order.orderNumber}</p>
              <p className="mt-1 text-neutral-600">Total: KES {order.totalAmount.toLocaleString()}</p>
              <p className="mt-3 text-neutral-600">
                In production, an M-Pesa prompt would now appear on {phone}. We are in SIMULATION
                mode, so click the green button below to pretend you entered your PIN.
              </p>
            </div>
          )}

          {stage === "done" && order && (
            <div className="py-16 text-center">
              <p className="text-4xl">✅</p>
              <p className="mt-3 font-semibold">Order confirmed!</p>
              <p className="mt-1 text-sm text-neutral-600">
                Your order number is <span className="font-mono font-bold">{order.orderNumber}</span>.
                Save it to track your order.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-neutral-200 px-4 py-3">
          {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

          {stage === "cart" && (
            <>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-neutral-600">Total</span>
                <span className="text-lg font-bold">KES {getCartTotal(items).toLocaleString()}</span>
              </div>
              <button
                disabled={items.length === 0}
                onClick={() => setStage("form")}
                className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-40"
              >
                Checkout with M-Pesa
              </button>
            </>
          )}

          {stage === "form" && (
            <div className="space-y-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name / company"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="M-Pesa phone e.g. 0712345678"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
              />
              <button
                disabled={busy}
                onClick={placeOrder}
                className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-40"
              >
                {busy ? "Placing order..." : `Place Order - KES ${getCartTotal(items).toLocaleString()}`}
              </button>
              <button
                onClick={() => setStage("cart")}
                className="w-full rounded-lg border border-neutral-300 py-2 text-sm text-neutral-600 hover:border-neutral-500"
              >
                Back to cart
              </button>
            </div>
          )}

          {stage === "payment" && (
            <button
              disabled={busy}
              onClick={simulatePayment}
              className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-40"
            >
              {busy ? "Confirming..." : "Simulate successful M-Pesa payment"}
            </button>
          )}

          {stage === "done" && (
            <button
              onClick={finish}
              className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
            >
              Continue shopping
            </button>
          )}
        </div>
      </aside>
    </>
  );
}