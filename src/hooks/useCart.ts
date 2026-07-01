import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
  size?: "s" | "m" | "l" | null;
}

const normalizeId = (id: string | number) => String(id);

const normalizePrice = (price: number | string) => Number(price).toFixed(2);

const cartLineKey = (id: string | number, price: number | string, size?: "s" | "m" | "l" | null) =>
  `${normalizeId(id)}|${normalizePrice(price)}|${size ?? ""}`;

const itemsMatch = (
  item: CartItem,
  id: string | number,
  price: number | string,
  size: "s" | "m" | "l" | null = null
) => cartLineKey(item.id, item.price, item.size) === cartLineKey(id, price, size);

export const mergeCartItems = (items: CartItem[]): CartItem[] => {
  const merged = new Map<string, CartItem>();

  for (const item of items) {
    const key = cartLineKey(item.id, item.price, item.size);
    const existing = merged.get(key);
    if (existing) {
      existing.quantity += Number(item.quantity);
    } else {
      merged.set(key, {
        ...item,
        price: Number(item.price),
        quantity: Number(item.quantity),
      });
    }
  }

  return Array.from(merged.values());
};

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const addToCart = (product: any, size: "s" | "m" | "l" | null = null, priceOverride?: number) => {
    const price = priceOverride !== undefined ? priceOverride : Number(product.price);

    setCart((prev) => {
      const existingItem = prev.find((item) => itemsMatch(item, product.id, price, size));

      if (existingItem) {
        return prev.map((item) =>
          itemsMatch(item, product.id, price, size)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price,
          quantity: 1,
          size,
          barcode: product.barcode,
        },
      ];
    });

    toast({
      title: "تم إضافة المنتج",
      description: `تم إضافة ${product.name} إلى السلة`,
    });
  };

  const updateQuantity = (id: string | number, newQuantity: number, price: number) => {
    setCart((prev) => {
      if (newQuantity <= 0) {
        return prev.filter((item) => !itemsMatch(item, id, price, item.size ?? null));
      }
      return prev.map((item) =>
        itemsMatch(item, id, price, item.size ?? null) ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const removeFromCart = (id: string | number, price: number) => {
    setCart((prev) => prev.filter((item) => !itemsMatch(item, id, price, item.size ?? null)));
  };

  const clearCart = () => setCart([]);

  const loadCart = useCallback((items: CartItem[]) => setCart(mergeCartItems(items)), []);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,
    calculateTotal,
  };
};
