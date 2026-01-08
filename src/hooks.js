import { useDispatch, useSelector } from 'react-redux';
import {
  loginUser,
  registerUser,
  logoutUser,
  updateProfile,
  selectAuth,
  selectCart,
  selectBookings,
  selectIsAuthenticated,
  selectUser,
  selectUserRole,
  selectToken,
  selectPermissions,
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

// Auth hooks
export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);

  return {
    ...auth,
    login: (email, password, isAdmin = false) =>
      dispatch(loginUser({ email, password, isAdmin })).unwrap(),
    register: (userData) => dispatch(registerUser(userData)).unwrap(),
    logout: () => dispatch(logoutUser()),
    updateProfile: (profileData) => dispatch(updateProfile(profileData)).unwrap()
  };
};

export const useUser = () => useSelector(selectUser);
export const useUserRole = () => useSelector(selectUserRole);
export const useToken = () => useSelector(selectToken);
export const usePermissions = () => useSelector(selectPermissions);
export const useIsAuthenticated = () => useSelector(selectIsAuthenticated);

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