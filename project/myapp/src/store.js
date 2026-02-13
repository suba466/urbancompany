import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks for Customer Authentication
export const loginCustomer = createAsyncThunk(
  'customerAuth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });

      if (response.data.success) {
        const token = response.data.token;
        const userInfo = response.data.user || response.data.customer;
        const role = 'user';

        localStorage.setItem('customerToken', token);
        localStorage.setItem('customerInfo', JSON.stringify(userInfo));

        return { token, user: userInfo, role };
      }
      return rejectWithValue(response.data.error || 'Login failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

export const registerCustomer = createAsyncThunk(
  'customerAuth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(userData).forEach(key => {
        if (userData[key]) formData.append(key, userData[key]);
      });

      const response = await axios.post('http://localhost:5000/api/register', formData);

      if (response.data.success) {
        const token = response.data.token;
        const userInfo = response.data.customer;

        localStorage.setItem('customerToken', token);
        localStorage.setItem('customerInfo', JSON.stringify(userInfo));

        return {
          user: userInfo,
          token: token
        };
      }
      return rejectWithValue(response.data.error || 'Registration failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Registration failed');
    }
  }
);

export const logoutCustomer = createAsyncThunk(
  'customerAuth/logout',
  async (_, { dispatch }) => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerInfo');
    dispatch(clearCustomerAuth());
    return null;
  }
);

export const updateCustomerProfile = createAsyncThunk(
  'customerAuth/updateProfile',
  async ({ customerId, ...profileData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('customerId', customerId);
      Object.keys(profileData).forEach(key => {
        if (profileData[key]) formData.append(key, profileData[key]);
      });

      const response = await axios.post('http://localhost:5000/api/update-profile', formData);

      if (response.data.success) {
        const updatedUser = response.data.customer;
        localStorage.setItem('customerInfo', JSON.stringify(updatedUser));
        return updatedUser;
      }
      return rejectWithValue(response.data.error || 'Update failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Update failed');
    }
  }
);

export const fetchCustomerProfile = createAsyncThunk(
  'customerAuth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) return rejectWithValue('No token found');

      const response = await axios.get('http://localhost:5000/api/customer/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        localStorage.setItem('customerInfo', JSON.stringify(response.data.customer));
        return response.data.customer;
      }
      return rejectWithValue(response.data.error || 'Failed to fetch profile');
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch profile');
    }
  }
);

// Async thunks for Admin Authentication
export const loginAdmin = createAsyncThunk(
  'adminAuth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', { email, password });

      if (response.data.success) {
        const token = response.data.token;
        const adminInfo = response.data.admin || response.data.user;

        // Determine role: 'admin' for superuser, 'user' for others (to trigger permission checks)
        const role = email === 'admin@urbancompany.com' ? 'admin' : 'user';

        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminInfo', JSON.stringify(adminInfo));

        const permissions = adminInfo?.permissions || {};
        localStorage.setItem('adminPermissions', JSON.stringify(permissions));

        return { token, admin: { ...adminInfo, role }, role, permissions };
      }
      return rejectWithValue(response.data.error || 'Admin Login failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Admin Login failed');
    }
  }
);

export const logoutAdmin = createAsyncThunk(
  'adminAuth/logout',
  async (_, { dispatch }) => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    localStorage.removeItem('adminPermissions');
    dispatch(clearAdminAuth());
    return null;
  }
);

// Customer Auth Slice
const customerAuthSlice = createSlice({
  name: 'customerAuth',
  initialState: {
    token: localStorage.getItem('customerToken') || null,
    user: JSON.parse(localStorage.getItem('customerInfo') || 'null'),
    role: 'user',
    isAuthenticated: !!localStorage.getItem('customerToken'),
    loading: false,
    error: null,
  },
  reducers: {
    clearCustomerAuth: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setCustomerUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.token = localStorage.getItem('customerToken');
    },
    setCustomerAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    updateCustomerLocalState: (state) => {
      // Sync with localStorage
      const token = localStorage.getItem('customerToken');
      const user = JSON.parse(localStorage.getItem('customerInfo') || 'null');

      state.token = token;
      state.user = user;
      state.isAuthenticated = !!token;
    }
  },
  extraReducers: (builder) => {
    builder
      // Customer Login
      .addCase(loginCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Customer Register
      .addCase(registerCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Customer Logout
      .addCase(logoutCustomer.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Update Customer Profile
      .addCase(updateCustomerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateCustomerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Customer Profile
      .addCase(fetchCustomerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchCustomerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearCustomerAuth,
  setCustomerUser,
  setCustomerAuth,
  updateCustomerLocalState
} = customerAuthSlice.actions;

// Admin Auth Slice
const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState: (() => {
    const token = localStorage.getItem('adminToken') || null;
    const admin = JSON.parse(localStorage.getItem('adminInfo') || 'null');
    const permissions = JSON.parse(localStorage.getItem('adminPermissions') || '{}');
    const isAuthenticated = !!token;

    // STRICT ROLE RE-CALCULATION ON RELOAD
    // Even if localStorage says 'admin' role, verify email.
    // If admin is null, default role doesn't matter much (unauth), but safer to say 'user'.
    const role = (admin && admin.email === 'admin@urbancompany.com') ? 'admin' : 'user';

    return {
      token,
      admin,
      permissions,
      role,
      isAuthenticated,
      loading: false,
      error: null,
    };
  })(),
  reducers: {
    clearAdminAuth: (state) => {
      state.token = null;
      state.admin = null;
      state.permissions = {};
      state.isAuthenticated = false;
      state.error = null;
    },
    setAdminUser: (state, action) => {
      state.admin = action.payload;
      localStorage.setItem('adminInfo', JSON.stringify(action.payload));
    }
  },
  extraReducers: (builder) => {
    builder
      // Admin Login
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.admin = action.payload.admin;
        state.role = action.payload.role;
        state.permissions = action.payload.permissions;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Admin Logout
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.token = null;
        state.admin = null;
        state.permissions = {};
        state.isAuthenticated = false;
        state.error = null;
      });
  }
});

export const { clearAdminAuth, setAdminUser } = adminAuthSlice.actions;

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: JSON.parse(localStorage.getItem('cartItems') || '[]'),
    customerEmail: null,
    loading: false
  },
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find(item => item.productId === action.payload.productId);

      const price = typeof action.payload.price === 'string'
        ? parseFloat(action.payload.price.replace(/[₹,]/g, ""))
        : Number(action.payload.price) || 0;

      const payload = {
        ...action.payload,
        price: price,
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
      const index = state.items.findIndex(item => item.productId === action.payload.productId);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      state.customerEmail = null;
      localStorage.removeItem('cartItems');
      localStorage.removeItem('customerEmail');
    },
    setCustomerEmail: (state, action) => {
      state.customerEmail = action.payload;
    },
    syncCartWithLocalStorage: (state) => {
      const items = JSON.parse(localStorage.getItem('cartItems') || '[]');
      state.items = items;
    },
    // Force clear cart (for debugging)
    forceClearCart: (state) => {
      state.items = [];
      localStorage.setItem('cartItems', JSON.stringify([]));
    }
  }
});

export const {
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  setCustomerEmail,
  syncCartWithLocalStorage,
  forceClearCart
} = cartSlice.actions;

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
    customerAuth: customerAuthSlice.reducer,
    adminAuth: adminAuthSlice.reducer,
    cart: cartSlice.reducer,
    bookings: bookingsSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

// Selectors
// Customer Selectors
export const selectCustomerAuth = (state) => state.customerAuth;
export const selectCustomerUser = (state) => state.customerAuth.user;
export const selectCustomerIsAuthenticated = (state) => state.customerAuth.isAuthenticated;
export const selectCustomerLoading = (state) => state.customerAuth.loading;
export const selectCustomerError = (state) => state.customerAuth.error;
export const selectCustomerToken = (state) => state.customerAuth.token;

// Admin Selectors
export const selectAdminAuth = (state) => state.adminAuth;
export const selectAdminUser = (state) => state.adminAuth.admin;
export const selectAdminIsAuthenticated = (state) => state.adminAuth.isAuthenticated;
export const selectAdminPermissions = (state) => state.adminAuth.permissions;
export const selectAdminLoading = (state) => state.adminAuth.loading;
export const selectAdminError = (state) => state.adminAuth.error;

// Cart and Bookings Selectors
export const selectCart = (state) => state.cart;
export const selectBookings = (state) => state.bookings;
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.items.reduce((total, item) => total + item.count, 0);
export const selectCartTotal = (state) =>
  state.cart.items.reduce((total, item) => {
    let price = 0;
    if (typeof item.price === 'string') {
      price = parseFloat(item.price.replace(/[^0-9.-]+/g, "")) || 0;
    } else if (typeof item.price === 'number') {
      price = item.price;
    }
    return total + (price * (item.count || 1));
  }, 0);

export default store;