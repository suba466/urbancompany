import React, { createContext, useState, useContext, useEffect } from 'react';
const CartContext = createContext();

export const useCart = () => useContext(CartContext);
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  // Load cart items from database on mount
  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await fetch(`${window.API_URL}/api/carts`);
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.carts || []);
        updateCartCount(data.carts || []);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const updateCartCount = (items) => {
    const total = items.reduce((sum, item) => sum + (item.count || 1), 0);
    setCartCount(total);
  };

  const addToCart = async (item) => {
    try {
      const response = await fetch(`${window.API_URL}/api/addcarts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      if (response.ok) {
        fetchCartItems(); // Refresh cart items
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const removeFromCart = async (id) => {
    try {
      await fetch(`${window.API_URL}/api/carts/${id}`, {
        method: "DELETE",
      });
      fetchCartItems(); // Refresh cart items
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const clearCart = async () => {
    try {
      const items = [...cartItems];
      for (const item of items) {
        await fetch(`${window.API_URL}/api/carts/${item._id}`, {
          method: "DELETE",
        });
      }
      fetchCartItems(); // Refresh cart items
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      addToCart,
      removeFromCart,
      clearCart,
      refreshCart: fetchCartItems
    }}>
      {children}
    </CartContext.Provider>
  );
};
