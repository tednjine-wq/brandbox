"use client";

import { getCartTotal, getEffectivePrice, useCartStore } from "@/lib/cart-store";

export default function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/40" onClick={closeCart} />
      )}
      <aside
        className={`fixed right-0 top-0 z-30 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <h2 className="font-semibold">Your Cart</h2>
          <button
            onClick={closeCart}
            className="text-neutral-500 hover:text-neutral-900"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <p className="py-16 text-center text-neutral-500">Your cart is empty.</p>
          ) : (
            items.map((item) => {
              const unit = getEffectivePrice(item.product, item.quantity);
              return (
                <div
                  key={item.product.id}
                  className="mb-4 rounded-lg border border-neutral-200 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-xs text-neutral-500">
                        KES {unit.toLocaleString()} per unit
                      </p>
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
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 10)
                        }
                        className="h-8 w-8 rounded border border-neutral-300"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        min={item.product.moq}
                        onChange={(e) =>
                          updateQuantity(item.product.id, Number(e.target.value))
                        }
                        className="w-20 rounded border border-neutral-300 px-2 py-1 text-sm"
                      />
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 10)
                        }
                        className="h-8 w-8 rounded border border-neutral-300"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-semibold">
                      KES {(unit * item.quantity).toLocaleString()}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    MOQ {item.product.moq}
                  </p>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-neutral-200 px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-neutral-600">Total</span>
            <span className="text-lg font-bold">
              KES {getCartTotal(items).toLocaleString()}
            </span>
          </div>
          <button className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-700">
            Checkout with M-Pesa
          </button>
        </div>
      </aside>
    </>
  );
}