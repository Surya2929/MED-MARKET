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
        // Agar pehle se cart me hai, to usme purani + nayi quantity jod do
        return prev.map((i) => i.inventoryId === item.inventoryId ? { ...i, quantity: i.quantity + qty } : i);
      }
      // Agar naya hai, to direct selected quantity daal do
      return [...prev, { ...item, quantity: qty }];
    });
    alert(`${qty} item(s) added to cart successfully! 🛒`);
  };

  const removeFromCart = (inventoryId) => {
    setCart((prev) => prev.filter((i) => i.inventoryId !== inventoryId));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};