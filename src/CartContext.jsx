import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartBySeller, setCartBySeller] = useState([]);
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

  useEffect(() => {
    const onStorage = e => {
      if (e.key === 'auth_token') {
        setToken(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Load cart from server
  const loadCart = async () => {
    try {
      const res = await fetch(`${apiBase}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCartBySeller(data);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  };

  // Add item to cart on server, then reload
  const addToCart = async (sellerId, item) => {
    try {
      const res = await fetch(`${apiBase}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ seller_id: sellerId, ...item }),
      });

      if (!res.ok) {
        console.error('Add to cart failed:', await res.text());
        return;
      }

      // Refresh local cart state from server
      await loadCart();
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const updateQuantity = async (productId, newQty) => {
    await fetch(`${apiBase}/api/cart/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ quantity: newQty }),
    });
    // refresh from server
    await loadCart();
  };
  // Fetch cart data on mount
  useEffect(() => {
    if (token) loadCart();
  }, [token]);

  return (
    <CartContext.Provider value={{ cartBySeller, addToCart, updateQuantity, loadCart, setToken }}>
      {children}
    </CartContext.Provider>
  );
}

// Export the useCart hook
export function useCart() {
  return useContext(CartContext);
}
