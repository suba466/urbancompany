import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import CustomerManagement from './CustomerManagement';
import CategoryManagement from './CategoryManagement';
import SubcategoryManagement from './SubcategoryManagement';
import ProductManagement from './ProductManagement';
import BookingManagement from './BookingManagement';
import Reports from './Reports';
import Settings from './Settings';
import Profile from './Profile';
import AdminLogin from './AdminLogin';

function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check authentication status from localStorage
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const role = localStorage.getItem('userRole');

      if (token && role) {
        setIsLoggedIn(true);
        setUserRole(role);
        fetchUserProfile(role);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };

    // Listen for storage changes (for logout from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'userRole') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');

    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
      fetchUserProfile(role);
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
      // Redirect to admin login
      navigate('/admin');
    }
  };

  const fetchUserProfile = async (role) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        handleLogout();
        return;
      }

      const endpoint = role === 'admin'
        ? 'http://localhost:5000/api/admin/profile'
        : 'http://localhost:5000/api/admin/user-profile';

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        // Token expired or invalid
        handleLogout();
        return;
      }

      const data = await response.json();
      if (data.success) {
        setUserProfile(data.profile);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      handleLogout();
    }
  };

  const handleLogin = (token, role) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', role);
    setIsLoggedIn(true);
    setUserRole(role);
    fetchUserProfile(role);

  };

  const handleLogout = () => {
    // Clear all local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userPermissions');

    // Clear state
    setIsLoggedIn(false);
    setUserRole(null);
    setUserProfile(null);



    // Redirect to admin login
    navigate('/admin');
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <AdminLayout
            userRole={userRole}
            userProfile={userProfile}
            onLogout={handleLogout}
          />
        }
      >
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<AdminDashboard />} />

        {/* User Management */}
        <Route path="users" element={<UserManagement />} />
        <Route path="users/add" element={<UserManagement isAdding={true} />} />
        <Route path="users/edit/:id" element={<UserManagement isEditing={true} />} />

        {/* Customer Management */}
        <Route path="customers" element={<CustomerManagement />} />

        {/* Catalog Management */}
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="categories/add" element={<CategoryManagement isAdding={true} />} />
        <Route path="categories/edit/:id" element={<CategoryManagement isEditing={true} />} />

        <Route path="subcategories" element={<SubcategoryManagement />} />
        <Route path="subcategories/add" element={<SubcategoryManagement isAdding={true} />} />
        <Route path="subcategories/edit/:id" element={<SubcategoryManagement isEditing={true} />} />

        {/* Product Management */}
        <Route path="products" element={<ProductManagement />} />
        <Route path="products/add" element={<ProductManagement isAdding={true} />} />

        {/* Other Management */}
        <Route path="bookings" element={<BookingManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />

        {/* Profile */}
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default AdminPanel;