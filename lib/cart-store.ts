import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Tier = { minQty: number; price: number };

export type CartProduct = {
  id: string;
  name: string;
  price: number;
  moq: number;
  buyType: string;
  priceTiers: Tier[];
};

type CartItem = { product: CartProduct; quantity: number };

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

export function getActiveTier(product: CartProduct, quantity: number): Tier | null {
  const tiers = [...product.priceTiers].sort((a, b) => a.minQty - b.minQty);
  let active: Tier | null = null;
  for (const tier of tiers) {
    if (quantity >= tier.minQty) active = tier;
  }
  return active;
}

export function getEffectivePrice(product: CartProduct, quantity: number): number {
  const tier = getActiveTier(product, quantity);
  return tier ? tier.price : product.price;
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce(
    (sum, item) => sum + getEffectivePrice(item.product, item.quantity) * item.quantity,
    0
  );
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (product, quantity) => {
        const qty = Math.max(quantity ?? product.moq, product.moq);
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, quantity: qty }] };
        });
        get().openCart();
      },
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId
              ? { ...i, quantity: Math.max(quantity || 0, i.product.moq) }
              : i
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    { name: "brandbox-cart" }
  )
);