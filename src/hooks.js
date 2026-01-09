import { useDispatch, useSelector } from 'react-redux';
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
  setPlans
} from './store';

// Customer Auth Hook
export const useCustomerAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector(selectCustomerAuth);

  return {
    ...auth,
    login: (email, password) => dispatch(loginCustomer({ email, password })).unwrap(),
    register: (userData) => dispatch(registerCustomer(userData)).unwrap(),
    logout: () => dispatch(logoutCustomer()),
    updateProfile: (profileData) => dispatch(updateCustomerProfile(profileData)).unwrap()
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

// Legacy support / Convenience for Customer
// Most components (Navbar, Cart, etc.) are customer-facing.
export const useAuth = useCustomerAuth;

// Specific selectors hooks
export const useCustomerUser = () => useSelector(selectCustomerUser);
export const useCustomerIsAuthenticated = () => useSelector(selectCustomerIsAuthenticated);

export const useAdminUser = () => useSelector(selectAdminUser);
export const useAdminPermissions = () => useSelector(selectAdminPermissions);

// Cart hooks
export const useCart = () => {
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);

  return {
    ...cart,
    items: useSelector(selectCartItems),
    count: useSelector(selectCartCount),
    total: useSelector(selectCartTotal),
    addItem: (item) => dispatch(addToCart(item)),
    removeItem: (productId) => dispatch(removeFromCart(productId)),
    updateItem: (productId, count) => dispatch(updateCartItem({ productId, count })),
    clear: () => dispatch(clearCart()),
    setEmail: (email) => dispatch(setCustomerEmail(email))
  };
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