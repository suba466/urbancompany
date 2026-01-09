import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks for authentication
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password, isAdmin = false }, { rejectWithValue }) => {
    try {
      const endpoint = isAdmin
        ? 'http://localhost:5000/api/admin/login'
        : 'http://localhost:5000/api/login';

      const response = await axios.post(endpoint, { email, password });

      if (response.data.success) {
        // Store token and user info
        const token = response.data.token;
        const userInfo = response.data.user || response.data.customer || response.data.admin;

        // Determine role from backend response if available, else fallback
        let userRole = response.data.role;
        if (!userRole) {
          userRole = isAdmin || email.includes('@urbancompany.com') || email.includes('admin') ? 'admin' : 'user';
        }

        // Save to localStorage for persistence
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));

        // Extract permissions
        const permissions = userInfo?.permissions || {};
        localStorage.setItem('userPermissions', JSON.stringify(permissions));

        return {
          token,
          role: userRole,
          user: userInfo,
          permissions: permissions
        };
      }
      return rejectWithValue(response.data.error || 'Login failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(userData).forEach(key => {
        if (userData[key]) formData.append(key, userData[key]);
      });

      const response = await axios.post('http://localhost:5000/api/register', formData);

      if (response.data.success) {
        const { customer } = response.data;
        return {
          user: customer,
          role: 'user',
          token: response.data.token || null
        };
      }
      return rejectWithValue(response.data.error || 'Registration failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userPermissions');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('urbanUser');

    dispatch(clearAuth());
    return null;
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ customerId, ...profileData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('customerId', customerId);
      Object.keys(profileData).forEach(key => {
        if (profileData[key]) formData.append(key, profileData[key]);
      });

      const response = await axios.post('http://localhost:5000/api/update-profile', formData);

      if (response.data.success) {
        return response.data.customer;
      }
      return rejectWithValue(response.data.error || 'Update failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Update failed');
    }
  }
);

export const fetchCustomerProfile = createAsyncThunk(
  'auth/fetchCustomerProfile',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return rejectWithValue('No token found');

      const response = await axios.get('http://localhost:5000/api/customer/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        localStorage.setItem('userInfo', JSON.stringify(response.data.customer));
        return response.data.customer;
      }
      return rejectWithValue(response.data.error || 'Failed to fetch profile');
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch profile');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('authToken') || null,
    role: localStorage.getItem('userRole') || null,
    user: JSON.parse(localStorage.getItem('userInfo') || 'null'),
    permissions: JSON.parse(localStorage.getItem('userPermissions') || '{}'),
    loading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('authToken') && !!localStorage.getItem('userInfo')
  },
  reducers: {
    clearAuth: (state) => {
      state.token = null;
      state.role = null;
      state.user = null;
      state.permissions = {};
      state.isAuthenticated = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('authToken', action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.user = action.payload.user;
        state.permissions = action.payload.permissions;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.role = action.payload.role;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.role = null;
        state.user = null;
        state.permissions = {};
        state.isAuthenticated = false;
      })

      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('userInfo', JSON.stringify(action.payload));
      })

      // Fetch Customer Profile
      .addCase(fetchCustomerProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true; // Confirm authentication
      })
      .addCase(fetchCustomerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Optional: If 401/Invalid Token, maybe logout?
        if (action.payload === 'Invalid Token' || action.payload === 'Access denied') {
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
        }
      });
  }
});

export const { clearAuth, setUser, setToken } = authSlice.actions;

// Cart slice (for customer cart)
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: JSON.parse(localStorage.getItem('cartItems') || '[]'),
    customerEmail: null,
    loading: false
  },
  reducers: {
   // In the cartSlice reducers:
  addToCart: (state, action) => {
    const existingItem = state.items.find(item => item.productId === action.payload.productId);
    
    // Ensure price is a number
    const price = typeof action.payload.price === 'string' 
      ? parseFloat(action.payload.price.replace(/[₹,]/g, "")) 
      : Number(action.payload.price) || 0;
    
    const payload = {
      ...action.payload,
      price: price, // Store as number
      count: action.payload.count || 1
    };
    
    if (existingItem) {
      existingItem.count += payload.count;
    } else {
      state.items.push(payload);
    }
    localStorage.setItem('cartItems', JSON.stringify(state.items));
  },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.productId !== action.payload);
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    updateCartItem: (state, action) => {
      const item = state.items.find(item => item.productId === action.payload.productId);
      if (item) {
        item.count = action.payload.count;
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cartItems');
    },
    setCustomerEmail: (state, action) => {
      state.customerEmail = action.payload;
    }
  }
});

export const { addToCart, removeFromCart, updateCartItem, clearCart, setCustomerEmail } = cartSlice.actions;

// Bookings slice
const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    bookings: [],
    plans: [],
    loading: false,
    error: null
  },
  reducers: {
    setBookings: (state, action) => {
      state.bookings = action.payload;
    },
    setPlans: (state, action) => {
      state.plans = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { setBookings, setPlans, setLoading, setError } = bookingsSlice.actions;

// Configure store
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    cart: cartSlice.reducer,
    bookings: bookingsSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

// Selectors
export const selectAuth = (state) => state.auth;
export const selectCart = (state) => state.cart;
export const selectBookings = (state) => state.bookings;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectUserRole = (state) => state.auth.role;
export const selectToken = (state) => state.auth.token;
export const selectPermissions = (state) => state.auth.permissions;
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.items.reduce((total, item) => total + item.count, 0);
// In your store.js file, update the selectCartTotal selector:

export const selectCartTotal = (state) =>
  state.cart.items.reduce((total, item) => {
    // Handle both string and number prices
    let price = 0;
    if (typeof item.price === 'string') {
      price = parseFloat(item.price.replace(/[^0-9.-]+/g, "")) || 0;
    } else if (typeof item.price === 'number') {
      price = item.price;
    }
    return total + (price * (item.count || 1));
  }, 0);

export default store;