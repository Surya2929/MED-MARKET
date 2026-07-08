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