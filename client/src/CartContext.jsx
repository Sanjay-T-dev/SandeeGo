import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'foodiego-cart';

export function CartProvider({ children }) {
  // cart = { restaurant: {id, name, delivery_fee, emoji} | null, items: [{id, name, price, quantity}] }
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { restaurant: null, items: [] };
    } catch {
      return { restaurant: null, items: [] };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addItem = (restaurant, item) => {
    setCart((prev) => {
      // When adding an item from a different restaurant, the cart will be reset.
      if (prev.restaurant && prev.restaurant.id !== restaurant.id) {
        if (!window.confirm('Cart-la vera restaurant items irukku. Clear panni ithu add pannattuma?')) return prev;
        return {
          restaurant: pick(restaurant),
          items: [{ id: item.id, name: item.name, price: item.price, quantity: 1 }],
        };
      }
      const existing = prev.items.find((i) => i.id === item.id);
      const items = existing
        ? prev.items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev.items, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
      return { restaurant: pick(restaurant), items };
    });
  };

  const changeQty = (itemId, delta) => {
    setCart((prev) => {
      const items = prev.items
        .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0);
      return { restaurant: items.length ? prev.restaurant : null, items };
    });
  };

  const clearCart = () => setCart({ restaurant: null, items: [] });

  const value = useMemo(() => {
    const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const count = cart.items.reduce((s, i) => s + i.quantity, 0);
    const deliveryFee = cart.restaurant ? cart.restaurant.delivery_fee : 0;
    return { cart, addItem, changeQty, clearCart, subtotal, count, deliveryFee, total: subtotal + deliveryFee };
  }, [cart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

const pick = (r) => ({ id: r.id, name: r.name, delivery_fee: r.delivery_fee, emoji: r.emoji });

export const useCart = () => useContext(CartContext);
