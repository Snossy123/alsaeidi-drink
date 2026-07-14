import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export interface CartModifier {
  id: number;
  name: string;
  price: number;
}

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
  size?: "s" | "m" | "l" | null;
  modifiers?: CartModifier[];
}

const normalizeId = (id: string | number) => String(id);

const normalizePrice = (price: number | string) => Number(price).toFixed(2);

export const modifiersFingerprint = (modifiers?: CartModifier[] | null) => {
  if (!modifiers?.length) return "";
  return [...modifiers]
    .map((m) => `${m.id}:${Number(m.price).toFixed(2)}`)
    .sort()
    .join(",");
};

export const cartLineKey = (
  id: string | number,
  price: number | string,
  size?: "s" | "m" | "l" | null,
  modifiers?: CartModifier[] | null
) =>
  `${normalizeId(id)}|${normalizePrice(price)}|${size ?? ""}|${modifiersFingerprint(modifiers)}`;

const itemsMatch = (
  item: CartItem,
  id: string | number,
  price: number | string,
  size: "s" | "m" | "l" | null = null,
  modifiers?: CartModifier[] | null
) => cartLineKey(item.id, item.price, item.size, item.modifiers) === cartLineKey(id, price, size, modifiers);

export const mergeCartItems = (items: CartItem[]): CartItem[] => {
  const merged = new Map<string, CartItem>();

  for (const item of items) {
    const key = cartLineKey(item.id, item.price, item.size, item.modifiers);
    const existing = merged.get(key);
    if (existing) {
      existing.quantity += Number(item.quantity);
    } else {
      merged.set(key, {
        ...item,
        price: Number(item.price),
        quantity: Number(item.quantity),
        modifiers: item.modifiers ? [...item.modifiers] : [],
      });
    }
  }

  return Array.from(merged.values());
};

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const addToCart = (
    product: any,
    size: "s" | "m" | "l" | null = null,
    priceOverride?: number,
    modifiers: CartModifier[] = []
  ) => {
    const basePrice = priceOverride !== undefined ? priceOverride : Number(product.price);
    const modifiersTotal = modifiers.reduce((sum, m) => sum + Number(m.price || 0), 0);
    const price = Number((basePrice + modifiersTotal).toFixed(2));
    const sortedModifiers = [...modifiers].sort((a, b) => a.id - b.id);

    setCart((prev) => {
      const existingItem = prev.find((item) => itemsMatch(item, product.id, price, size, sortedModifiers));

      if (existingItem) {
        return prev.map((item) =>
          itemsMatch(item, product.id, price, size, sortedModifiers)
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
          modifiers: sortedModifiers,
        },
      ];
    });

    toast({
      title: "تم إضافة المنتج",
      description: `تم إضافة ${product.name} إلى السلة`,
    });
  };

  const updateQuantity = (
    id: string | number,
    newQuantity: number,
    price: number,
    size: "s" | "m" | "l" | null = null,
    modifiers: CartModifier[] = []
  ) => {
    setCart((prev) => {
      if (newQuantity <= 0) {
        return prev.filter((item) => !itemsMatch(item, id, price, size, modifiers));
      }
      return prev.map((item) =>
        itemsMatch(item, id, price, size, modifiers) ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const removeFromCart = (
    id: string | number,
    price: number,
    size: "s" | "m" | "l" | null = null,
    modifiers: CartModifier[] = []
  ) => {
    setCart((prev) => prev.filter((item) => !itemsMatch(item, id, price, size, modifiers)));
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
