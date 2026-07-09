import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('medCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('medCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item, qty) => {
    setCart((prev) => {
      // 🚀 FIX: Ek order sirf ek hi store se ho sakta hai (checkout single storeId use karta hai)
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
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};