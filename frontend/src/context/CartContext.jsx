import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('medCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // 🚀 NEW: Amazon-style "Added to Cart" popup — set whenever addToCart runs, auto-dismisses
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('medCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const addToCart = (item, qty) => {
    setCart((prev) => {
      // 🚀 Ek order sirf ek hi store se ho sakta hai (checkout single storeId use karta hai)
      if (prev.length > 0 && String(prev[0].storeId) !== String(item.storeId)) {
        const confirmSwitch = window.confirm(
          `Your cart has items from "${prev[0].storeName}". Adding this item will clear your cart and start a new order from "${item.storeName}". Continue?`
        );
        if (!confirmSwitch) return prev;
        return [{ ...item, quantity: Math.min(qty, item.stock) }];
      }

      const existing = prev.find((i) => i.inventoryId === item.inventoryId);
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, item.stock);
        return prev.map((i) => i.inventoryId === item.inventoryId ? { ...i, quantity: newQty } : i);
      }
      return [...prev, { ...item, quantity: Math.min(qty, item.stock) }];
    });

    // 🚀 NEW: trigger the Amazon-style popup with this item's info
    setToast({ name: item.medicineName, price: item.price, qty, imageUrl: item.imageUrl });
  };

  const updateQuantity = (inventoryId, newQty, stockLimit) => {
    if (newQty < 1) {
      removeFromCart(inventoryId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.inventoryId === inventoryId
          ? { ...item, quantity: Math.min(newQty, stockLimit) }
          : item
      )
    );
  };

  const removeFromCart = (inventoryId) => {
    setCart((prev) => prev.filter((i) => i.inventoryId !== inventoryId));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity, toast, dismissToast: () => setToast(null) }}>
      {children}
    </CartContext.Provider>
  );
};