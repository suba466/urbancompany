import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useCallback } from 'react';
import {
  loginCustomer,
  registerCustomer,
  logoutCustomer,
  updateCustomerProfile,
  loginAdmin,
  logoutAdmin,
  selectCustomerAuth,
  selectCustomerUser,
  selectCustomerIsAuthenticated,
  selectCustomerToken,
  selectAdminAuth,
  selectAdminUser,
  selectAdminIsAuthenticated,
  selectAdminPermissions,
  selectCart,
  selectBookings,
  selectCartItems,
  selectCartCount,
  selectCartTotal,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  setCustomerEmail,
  setBookings,
  setPlans,
  setCustomerUser,
  updateCustomerLocalState,
  syncCartWithLocalStorage
} from './store';

// Custom hook to sync auth state with localStorage
export const useAuthSync = () => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Check localStorage on initial load only
    const customerToken = localStorage.getItem('customerToken');
    const customerInfo = localStorage.getItem('customerInfo');
    
    if (customerToken && customerInfo) {
      try {
        const user = JSON.parse(customerInfo);
        // Only dispatch if we have valid data
        dispatch(setCustomerUser(user));
        console.log("✅ Auth state initialized from localStorage");
      } catch (error) {
        console.error("Error parsing customer info:", error);
      }
    }
    
    // Listen for storage events (from other tabs/windows) - but be careful
    const handleStorageChange = (event) => {
      // Only handle specific keys to avoid unnecessary updates
      if (event.key === 'customerToken' || event.key === 'customerInfo') {
        // Use setTimeout to avoid immediate dispatch during render
        setTimeout(() => {
          dispatch(updateCustomerLocalState());
        }, 0);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [dispatch]); // Only depend on dispatch
};

// Utility function to notify auth state changes
export const notifyAuthChange = () => {
  window.dispatchEvent(new CustomEvent('authStateChanged'));
};

// Customer Auth Hook
export const useCustomerAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector(selectCustomerAuth);
  
  // Memoize the sync function to prevent unnecessary re-renders
  const syncAuth = useCallback(() => {
    dispatch(updateCustomerLocalState());
  }, [dispatch]);

  return {
    ...auth,
    login: async (email, password) => {
      const result = await dispatch(loginCustomer({ email, password })).unwrap();
      notifyAuthChange();
      return result;
    },
    register: async (userData) => {
      const result = await dispatch(registerCustomer(userData)).unwrap();
      notifyAuthChange();
      return result;
    },
    logout: () => {
      dispatch(logoutCustomer());
      notifyAuthChange();
    },
    updateProfile: (profileData) => dispatch(updateCustomerProfile(profileData)).unwrap(),
    syncAuth // Export the memoized function
  };
};

// Admin Auth Hook
export const useAdminAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector(selectAdminAuth);

  return {
    ...auth,
    login: (email, password) => dispatch(loginAdmin({ email, password })).unwrap(),
    logout: () => dispatch(logoutAdmin())
  };
};

// Main Auth Hook (for customer-facing components)
export const useAuth = () => {
  // Use auth sync hook only once at the top level
  useAuthSync();
  
  const dispatch = useDispatch();
  const auth = useSelector(selectCustomerAuth);
  
  // Memoize functions to prevent unnecessary re-renders
  const login = useCallback(async (email, password) => {
    const result = await dispatch(loginCustomer({ email, password })).unwrap();
    notifyAuthChange();
    return result;
  }, [dispatch]);

  const register = useCallback(async (userData) => {
    const result = await dispatch(registerCustomer(userData)).unwrap();
    notifyAuthChange();
    return result;
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch(logoutCustomer());
    notifyAuthChange();
  }, [dispatch]);

  const updateProfile = useCallback((profileData) => {
    return dispatch(updateCustomerProfile(profileData)).unwrap();
  }, [dispatch]);

  const syncAuth = useCallback(() => {
    dispatch(updateCustomerLocalState());
  }, [dispatch]);

  return {
    ...auth,
    login,
    register,
    logout,
    updateProfile,
    syncAuth
  };
};

// Specific selectors hooks
export const useCustomerUser = () => useSelector(selectCustomerUser);
export const useCustomerIsAuthenticated = () => useSelector(selectCustomerIsAuthenticated);
export const useCustomerToken = () => useSelector(selectCustomerToken);

export const useAdminUser = () => useSelector(selectAdminUser);
export const useAdminPermissions = () => useSelector(selectAdminPermissions);

// Cart hooks - UPDATED VERSION
export const useCart = () => {
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);

  // Sync cart with localStorage on mount only
  useEffect(() => {
    dispatch(syncCartWithLocalStorage());
  }, [dispatch]);

  // Listen for cart cleared events
  useEffect(() => {
    const handleCartCleared = () => {
      console.log("Cart cleared event received in useCart hook");
      // Force clear localStorage
      localStorage.setItem('cartItems', JSON.stringify([]));
      // Dispatch sync to update Redux state
      dispatch(syncCartWithLocalStorage());
    };

    const handleCartUpdated = () => {
      console.log("Cart updated event received");
      dispatch(syncCartWithLocalStorage());
    };

    window.addEventListener('cartCleared', handleCartCleared);
    window.addEventListener('cartUpdated', handleCartUpdated);
    
    return () => {
      window.removeEventListener('cartCleared', handleCartCleared);
      window.removeEventListener('cartUpdated', handleCartUpdated);
    };
  }, [dispatch]);

  // Clear cart with force option
  const clearCartWithForce = useCallback(() => {
    // Clear from Redux (this also clears localStorage)
    dispatch(clearCart());
    // Force clear localStorage directly
    localStorage.setItem('cartItems', JSON.stringify([]));
    // Dispatch sync immediately
    dispatch(syncCartWithLocalStorage());
    // Trigger event
    window.dispatchEvent(new CustomEvent('cartCleared'));
  }, [dispatch]);

  return {
    ...cart,
    items: useSelector(selectCartItems),
    count: useSelector(selectCartCount),
    total: useSelector(selectCartTotal),
    addItem: (item) => dispatch(addToCart(item)),
    removeItem: (productId) => dispatch(removeFromCart(productId)),
    updateItem: (productId, count) => dispatch(updateCartItem({ productId, count })),
    clear: clearCartWithForce, // Use the enhanced clear function
    setEmail: (email) => dispatch(setCustomerEmail(email))
  };
};

// Helper function to clear cart from database
export const clearCartFromDatabase = async (userEmail) => {
  if (!userEmail) {
    console.log("No user email provided for database cart clearing");
    return;
  }
  
  try {
    // Get cart items for this user from database
    const response = await fetch(`http://localhost:5000/api/carts/email/${userEmail}`);
    
    if (response.ok) {
      const data = await response.json();
      const userCartItems = data.carts || [];
      
      console.log(`Found ${userCartItems.length} cart items to delete for ${userEmail}`);
      
      // Delete each cart item
      const deletePromises = userCartItems.map(async (item) => {
        try {
          const deleteResponse = await fetch(`http://localhost:5000/api/carts/${item._id}`, {
            method: "DELETE"
          });
          if (deleteResponse.ok) {
            console.log(`Deleted cart item: ${item._id}`);
          }
        } catch (error) {
          console.error(`Failed to delete cart item ${item._id}:`, error);
        }
      });
      
      await Promise.all(deletePromises);
      console.log(`Successfully cleared ${userCartItems.length} cart items from database`);
    } else {
      console.log("No cart items found or error fetching cart items");
    }
  } catch (error) {
    console.error("Error clearing cart from database:", error);
    // Don't throw error, just log it
  }
};

// Bookings hooks
export const useBookings = () => {
  const dispatch = useDispatch();
  const bookings = useSelector(selectBookings);

  return {
    ...bookings,
    setBookings: (bookings) => dispatch(setBookings(bookings)),
    setPlans: (plans) => dispatch(setPlans(plans))
  };
};