import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './hooks';
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
  const { isAuthenticated, admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => { }} />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <AdminLayout
            userRole="admin"
            userProfile={admin}
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