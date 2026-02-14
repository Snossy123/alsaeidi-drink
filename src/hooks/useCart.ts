import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
  size?: "s" | "m" | "l" | null;
}

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const addToCart = (product: any, size: "s" | "m" | "l" | null = null, priceOverride?: number) => {
    const price = priceOverride !== undefined ? priceOverride : Number(product.price);
    
    const existingItem = cart.find(
      (item) => item.id === product.id && item.price === price && item.size === size
    );

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id && item.price === price && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { 
        id: product.id, 
        name: product.name, 
        price, 
        quantity: 1, 
        size,
        barcode: product.barcode 
      }]);
    }

    toast({
      title: "تم إضافة المنتج",
      description: `تم إضافة ${product.name} إلى السلة`,
    });
  };

  const updateQuantity = (id: string | number, newQuantity: number, price: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => !(item.id === id && item.price === price)));
    } else {
      setCart(cart.map(item =>
        (item.id === id && item.price === price) ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (id: string | number, price: number) => {
    setCart(cart.filter(item => !(item.id === id && item.price === price)));
  };

  const clearCart = () => setCart([]);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return { 
    cart, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    calculateTotal 
  };
};
