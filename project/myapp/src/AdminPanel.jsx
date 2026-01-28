import { useEffect } from 'react';
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
  const { isAuthenticated, admin, logout, role } = useAdminAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  // Check for token expiration
  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      try {
        // Simple JWT decode (header.payload.signature)
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          console.log('Admin session expired. Logging out.');
          handleLogout();
        }
      } catch (error) {
        console.error('Error checking token expiration:', error);
      }
    };

    // Check on mount
    checkTokenExpiration();

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, [logout, navigate]);

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
            userRole={role || 'user'}
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