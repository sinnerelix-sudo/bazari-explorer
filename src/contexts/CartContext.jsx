import { createContext, useContext, useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

import { API_BASE as API } from "@/lib/api";
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
  const [loading, setLoading] = useState(false);
  const [deliveryConfig, setDeliveryConfig] = useState({ fee: 5, free_limit: 50 });

  const fetchDeliveryConfig = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/settings/delivery`);
      setDeliveryConfig(data);
    } catch (err) {
      console.error("Delivery config load failed:", err);
    }
  }, []);

  const fetchCart = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await axios.get(`${API}/cart`, { withCredentials: true });
      setCart(data);
    } catch {
      // not logged in
    }
  }, [user]);

  useEffect(() => {
    fetchDeliveryConfig();
  }, [fetchDeliveryConfig]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/cart/add`, { product_id: productId, quantity }, { withCredentials: true });
      setCart(data);
      return true;
    } catch (err) {
      console.error("Add to cart failed:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await axios.put(`${API}/cart/update`, { product_id: productId, quantity }, { withCredentials: true });
      setCart(data);
    } catch (err) {
      console.error("Update cart failed:", err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const { data } = await axios.delete(`${API}/cart/remove/${productId}`, { withCredentials: true });
      setCart(data);
    } catch (err) {
      console.error("Remove from cart failed:", err);
    }
  };

  const clearCart = async () => {
    try {
      const { data } = await axios.delete(`${API}/cart/clear`, { withCredentials: true });
      setCart(data);
    } catch (err) {
      console.error("Clear cart failed:", err);
    }
  };

  const isFreeDelivery = cart.total >= deliveryConfig.free_limit;
  const currentDeliveryFee = isFreeDelivery ? 0 : deliveryConfig.fee;
  const finalTotal = cart.total + currentDeliveryFee;

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        loading, 
        deliveryConfig,
        currentDeliveryFee,
        isFreeDelivery,
        finalTotal,
        fetchCart, 
        addToCart, 
        updateQuantity, 
        removeFromCart, 
        clearCart,
        fetchDeliveryConfig
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
