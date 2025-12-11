import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Form, Button, 
  Spinner, Modal, Nav, Navbar, Badge,
  Dropdown, Alert, Tabs, Tab
} from 'react-bootstrap';
import { MdModeEdit } from "react-icons/md";
import { MdOutlineDelete } from "react-icons/md";
import { FaFileExcel, FaFilePdf, FaFileCsv } from "react-icons/fa";
import { FcBusinessman, FcPlanner, FcBullish, FcSupport } from "react-icons/fc";

import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import Categories from './Categories';
import CategoryForm from './CategoryForm';
import { IoEyeSharp } from "react-icons/io5";
import "./Urbancom.css";

function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginType, setLoginType] = useState('admin'); // 'admin' or 'staff'
  const [loading, setLoading] = useState(false);
  const [adminLogo, setAdminLogo] = useState('/assets/Uc.png');
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Dashboard States
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  
  // User Management States
  const [staff, setStaff] = useState([]);
  const [staffSearch, setStaffSearch] = useState('');
  const [staffPage, setStaffPage] = useState(1);
  const [staffTotalPages, setStaffTotalPages] = useState(1);
  const [staffPerPage, setStaffPerPage] = useState(10);
  const [staffTotalItems, setStaffTotalItems] = useState(0);
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    password: '',
    permissions: {
      Dashboard: false,
      Staff: false,
      User: false,
      Category: false,
      Product: false,
      Bookings: false,
      Reports: false,
      Settings: false
    }
  });
const [profileImage, setProfileImage] = useState(null);
const [profileImagePreview, setProfileImagePreview] = useState("");
const [uploadingImage, setUploadingImage] = useState(false);
  
  // Staff Bulk Selection
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [selectAllStaff, setSelectAllStaff] = useState(false);
  
  // Form feedback
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [editStaffId, setEditStaffId] = useState(null);
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [showStaffDetails, setShowStaffDetails] = useState(false);
  const [selectedStaffDetails, setSelectedStaffDetails] = useState(null);
  
  // User Management States
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userPerPage, setUserPerPage] = useState(10);
  const [userTotalItems, setUserTotalItems] = useState(0);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    password: ''
  });
  
  // User Bulk Selection
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAllUsers, setSelectAllUsers] = useState(false);
  
  // Category Management States
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectAllCategories, setSelectAllCategories] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: '',
    order: 0,
    isActive: true
  });
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editCategory, setEditCategory] = useState({
    name: '',
    description: '',
    category: '',
    order: 0,
    isActive: true
  });
  
  // Product Management States
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAllProducts, setSelectAllProducts] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    discountPrice: '',
    stock: 0,
    isActive: true
  });
  
  // Bookings Management States
  const [bookings, setBookings] = useState([]);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingTotalPages, setBookingTotalPages] = useState(1);
  const [bookingPerPage, setBookingPerPage] = useState(10);
  const [bookingTotalItems, setBookingTotalItems] = useState(0);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [selectAllBookings, setSelectAllBookings] = useState(false);
  
  // Reports States
  const [reports, setReports] = useState({
    dailyBookings: 0,
    monthlyRevenue: 0,
    userGrowth: 0,
    topCategories: []
  });

  // Settings States
  const [settings, setSettings] = useState({
    siteTitle: 'Urban Company',
    siteLogo: '',
    contactEmail: 'support@urbancompany.com',
    contactPhone: '1800-123-4567',
    address: '123 Business Street, City, Country'
  });

 // Function to handle image upload
const uploadProfileImage = async (file) => {
  try {
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('profileImage', file);

    const response = await fetch('http://localhost:5000/api/upload/upload-profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: formData
    });

    const data = await response.json();
    if (data.success) {
      return data.imageUrl;
    } else {
      throw new Error(data.error || 'Failed to upload image');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  } finally {
    setUploadingImage(false);
  }
};


  const fetchAdminProfile = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/admin/profile', {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (data.success) {
      setAdminProfile(data.profile);
    }
  } catch (error) {
    console.error('Error fetching admin profile:', error);
  }
};

const fetchStaffProfile = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/admin/staff-profile', {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (data.success) {
      setStaffProfile(data.profile);
    }
  } catch (error) {
    console.error('Error fetching staff profile:', error);
  }
};

// Add new state for profiles
const [adminProfile, setAdminProfile] = useState(null);
const [staffProfile, setStaffProfile] = useState(null);

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!userPermissions) return false;
    if (userRole === 'admin') return true; // Admin has all permissions
    return userPermissions[permission] === true;
  };

  // Get JWT token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Set authentication headers
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchAdminLogo = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/static-data');
      if (response.ok) {
        const data = await response.json();
        if (data && data.logo) {
          setAdminLogo(data.logo);
        }
      }
    } catch (error) {
      console.error('Error fetching admin logo:', error);
    }
  };

  const handleViewStaff = (staffMember) => {
    setSelectedStaffDetails(staffMember);
    setShowStaffDetails(true);
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    // Auto-detect login type based on email domain or pattern
    const isAdminEmail = loginData.email.includes('@urbancompany.com') || 
                        loginData.email.includes('admin');
    
    const endpoint = isAdminEmail 
      ? 'http://localhost:5000/api/admin/login'
      : 'http://localhost:5000/api/admin/staff-login';
    
    console.log('Attempting login as:', isAdminEmail ? 'Admin' : 'Staff');
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });
    
    const data = await response.json();
    console.log('Login response:', data);
    
    if (data.success) {
      setIsLoggedIn(true);
      
      // Store token and user info
      localStorage.setItem('authToken', data.token);
      
      if (isAdminEmail) {
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userPermissions', JSON.stringify(data.admin?.permissions || {}));
        setUserRole('admin');
        setUserPermissions(data.admin?.permissions || {});
      } else {
        localStorage.setItem('userRole', 'staff');
        localStorage.setItem('userPermissions', JSON.stringify(data.staff?.permissions || {}));
        setUserRole('staff');
        setUserPermissions(data.staff?.permissions || {});
      }
      
      fetchDashboardData();
    } else {
      // If admin login fails, try staff login (or vice versa)
      if (isAdminEmail) {
        console.log('Admin login failed, trying staff login...');
        // Try staff login
        const staffResponse = await fetch('http://localhost:5000/api/admin/staff-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData)
        });
        
        const staffData = await staffResponse.json();
        if (staffData.success) {
          setIsLoggedIn(true);
          localStorage.setItem('authToken', staffData.token);
          localStorage.setItem('userRole', 'staff');
          localStorage.setItem('userPermissions', JSON.stringify(staffData.staff?.permissions || {}));
          setUserRole('staff');
          setUserPermissions(staffData.staff?.permissions || {});
          fetchDashboardData();
        } else {
          alert(data.error || staffData.error || 'Login failed');
        }
      } else {
        alert(data.error || 'Login failed');
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed. Please check your connection.');
  } finally {
    setLoading(false);
  }
};

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        
        const transformedBookings = data.recentBookings?.map(booking => {
          const user = data.recentUsers?.find(u => u.email === booking.userEmail);
          return {
            ...booking,
            userProfileImage: user?.profileImage || '',
            userName: user?.name || booking.userName
          };
        }) || [];
        
        setRecentBookings(transformedBookings);
        setRecentUsers(data.recentUsers || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchStaff = async (page = 1, search = '', perPage = staffPerPage) => {
    try {
      let url = `http://localhost:5000/api/admin/staff?page=${page}&limit=${perPage}&search=${search}`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setStaff(data.staff || []);
        setStaffTotalPages(data.pagination?.pages || 1);
        setStaffTotalItems(data.pagination?.total || 0);
        setSelectedStaff([]);
        setSelectAllStaff(false);
        setStaffPerPage(perPage);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchUsers = async (page = 1, search = '', perPage = userPerPage) => {
    try {
      let url = `http://localhost:5000/api/admin/users?page=${page}&limit=${perPage}&search=${search}`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
        setUserTotalPages(data.pagination?.pages || 1);
        setUserTotalItems(data.pagination?.total || 0);
        setSelectedUsers([]);
        setSelectAllUsers(false);
        setUserPerPage(perPage);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log("🔍 Fetching categories from admin API...");
      const response = await fetch('http://localhost:5000/api/admin/services', {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        console.error("Failed to fetch categories:", response.status);
        setCategories([]);
        return;
      }
      
      const data = await response.json();
      console.log("Categories API response:", data);
      
      if (data.success && data.services && Array.isArray(data.services)) {
        console.log(`Found ${data.services.length} categories`);
        
        const formattedCategories = data.services.map(service => ({
          ...service,
          img: service.img || '/assets/default-category.png'
        }));
        
        console.log("Setting categories state");
        setCategories(formattedCategories);
      } else {
        console.error("Invalid response format:", data);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/packages', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.packages || []);
        setSelectedProducts([]);
        setSelectAllProducts(false);
      } else {
        // Fallback to mock data
        const mockProducts = [
          { _id: '1', name: 'Hair Shampoo', description: 'Premium hair care shampoo', category: 'Salon', price: '₹299', discountPrice: '₹249', stock: 50, isActive: true },
          { _id: '2', name: 'Cleaning Solution', description: 'Multi-surface cleaner', category: 'Cleaning', price: '₹199', discountPrice: '₹149', stock: 100, isActive: true },
          { _id: '3', name: 'Tool Kit', description: 'Professional repair tools', category: 'Repair', price: '₹1299', discountPrice: '₹999', stock: 20, isActive: true }
        ];
        setProducts(mockProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchBookings = async (page = 1, search = '', status = '', perPage = bookingPerPage) => {
    try {
      let url = `http://localhost:5000/api/admin/bookings?page=${page}&limit=${perPage}&search=${search}`;
      if (status) url += `&status=${status}`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        // Get user emails from bookings
        const userEmails = data.bookings.map(b => b.userEmail);
        
        // Fetch user profile images
        const usersResponse = await fetch(`http://localhost:5000/api/admin/users-by-emails`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ emails: userEmails })
        });
        
        const usersData = await usersResponse.json();
        const userMap = {};
        
        if (usersData.success) {
          usersData.users.forEach(user => {
            userMap[user.email] = {
              name: user.name,
              profileImage: user.profileImage
            };
          });
        }
        
        // Add profile images to bookings
        const bookingsWithProfiles = data.bookings.map(booking => ({
          ...booking,
          userName: userMap[booking.userEmail]?.name || booking.userName,
          userProfileImage: userMap[booking.userEmail]?.profileImage || ''
        }));
        
        setBookings(bookingsWithProfiles || []);
        setBookingTotalPages(data.pagination?.pages || 1);
        setBookingTotalItems(data.pagination?.total || 0);
        setSelectedBookings([]);
        setSelectAllBookings(false);
        setBookingPerPage(perPage);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const mockReports = {
        dailyBookings: 45,
        monthlyRevenue: 125000,
        userGrowth: '12%',
        topCategories: [
          { name: 'Salon', bookings: 120, revenue: 45000 },
          { name: 'Cleaning', bookings: 85, revenue: 38000 },
          { name: 'Repairs', bookings: 65, revenue: 28000 },
          { name: 'Plumbing', bookings: 42, revenue: 19000 }
        ]
      };
      setReports(mockReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  // Checkbox selection handlers
  const handleStaffSelect = (staffId) => {
    setSelectedStaff(prev => {
      if (prev.includes(staffId)) {
        return prev.filter(id => id !== staffId);
      } else {
        return [...prev, staffId];
      }
    });
  };

  const handleSelectAllStaff = () => {
    if (selectAllStaff) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(staff.map(s => s._id));
    }
    setSelectAllStaff(!selectAllStaff);
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAllUsers = () => {
    if (selectAllUsers) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u._id));
    }
    setSelectAllUsers(!selectAllUsers);
  };

  const updateCategory = async (categoryId, updateData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/services/${categoryId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      if (data.success) {
        fetchCategories();
      } else {
        console.error("Failed to update category:", data.error);
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAllProducts = () => {
    if (selectAllProducts) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p._id));
    }
    setSelectAllProducts(!selectAllProducts);
  };

  const handleBookingSelect = (bookingId) => {
    setSelectedBookings(prev => {
      if (prev.includes(bookingId)) {
        return prev.filter(id => id !== bookingId);
      } else {
        return [...prev, bookingId];
      }
    });
  };

  const handleSelectAllBookings = () => {
    if (selectAllBookings) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(bookings.map(b => b._id));
    }
    setSelectAllBookings(!selectAllBookings);
  };

  // Common bulk delete function
  const handleBulkDelete = async (entity, selectedIds) => {
    if (selectedIds.length === 0) return;
    
    const entityNames = {
      'staff': 'staff member(s)',
      'users': 'user(s)',
      'categories': 'category(ies)',
      'products': 'product(s)',
      'bookings': 'booking(s)'
    };

    // Map frontend entity names to backend entity names
    const backendEntityMap = {
      'staff': 'staff',
      'users': 'users',
      'categories': 'services',
      'products': 'packages', 
      'bookings': 'bookings'
    };

    const backendEntity = backendEntityMap[entity];
    
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} ${entityNames[entity]}?`)) {
      try {
        const response = await fetch('http://localhost:5000/api/admin/bulk-delete', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ 
            entity: backendEntity,
            ids: selectedIds 
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          alert(data.message);
          
          // Reset selection and refresh data
          switch(entity) {
            case 'staff':
              setSelectedStaff([]);
              setSelectAllStaff(false);
              fetchStaff(staffPage, staffSearch, staffPerPage);
              break;
            case 'users':
              setSelectedUsers([]);
              setSelectAllUsers(false);
              fetchUsers(userPage, userSearch, userPerPage);
              break;
            case 'categories':
              setSelectedCategories([]);
              setSelectAllCategories(false);
              fetchCategories();
              break;
            case 'products':
              setSelectedProducts([]);
              setSelectAllProducts(false);
              fetchProducts();
              break;
            case 'bookings':
              setSelectedBookings([]);
              setSelectAllBookings(false);
              fetchBookings(bookingPage, bookingSearch, bookingStatus, bookingPerPage);
              fetchDashboardData();
              break;
          }
        } else {
          alert(data.error || `Failed to delete ${entity}`);
        }
      } catch (error) {
        console.error(`Error deleting ${entity}:`, error);
        alert(`Failed to delete ${entity}`);
      }
    }
  };

  // Helper function to display password (always shows 6 dots)
  const displayPassword = () => {
    return '••••••';
  };

  // Helper function to format permissions as comma-separated text
  const formatPermissions = (permissions) => {
    if (!permissions) return <span className="text-muted">None</span>;
    
    const activePermissions = Object.entries(permissions)
      .filter(([key, value]) => value)
      .map(([key]) => key);
    
    if (activePermissions.length === 0) return <span className="text-muted">None</span>;
    
    return (
      <div>
        {activePermissions.map((permission, index) => (
          <span key={permission}>
            {permission.charAt(0).toUpperCase() + permission.slice(1)}
            {index < activePermissions.length - 1 ? ', ' : ''}
          </span>
        ))}
      </div>
    );
  };

  // Download functions for tables
  const downloadTableAsPDF = (dataType = '') => {
    const element = document.querySelector('.table-responsive');
    if (!element) {
      alert('No table found to download');
      return;
    }
    
    const options = {
      margin: 1,
      filename: `${dataType || 'table'}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().from(element).set(options).save();
  };

  const downloadTableAsExcel = (dataType = '') => {
    let data = [];
    let headers = [];
    
    // Get data based on current active menu
    switch(activeMenu) {
      case 'manage-staff':
        data = staff.map(s => ({
          'Name': s.name,
          'Email': s.email,
          'Phone': s.phone,
          'Designation': s.designation,
          'Permissions': Object.entries(s.permissions || {})
            .filter(([key, value]) => value)
            .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
            .join(', ')
        }));
        break;
        
      case 'manage-users':
        data = users.map(u => ({
          'Name': u.name,
          'Email': u.email,
          'Phone': u.phone,
          'City': u.city,
          'Joined Date': new Date(u.createdAt).toLocaleDateString()
        }));
        break;
        
      case 'bookings':
        data = bookings.map(b => ({
          'Customer': b.userName,
          'Email': b.userEmail,
          'Service': b.serviceName,
          'Price': `₹${b.servicePrice}`,
          'Status': b.status,
          'Date': new Date(b.createdAt).toLocaleDateString()
        }));
        break;
        
      default:
        // Fallback: Try to get data from table
        const table = document.querySelector('table');
        if (table) {
          headers = Array.from(table.querySelectorAll('thead th'))
            .map(th => th.textContent.trim())
            .filter(h => h); // Remove empty headers
          
          const rows = table.querySelectorAll('tbody tr');
          data = Array.from(rows).map(row => {
            const cells = row.querySelectorAll('td');
            return Array.from(cells).reduce((obj, cell, index) => {
              if (headers[index]) {
                // Remove checkbox content
                const text = cell.textContent.trim();
                obj[headers[index]] = text.includes('checkbox') ? '' : text;
              }
              return obj;
            }, {});
          });
        }
    }
    
    if (data.length === 0) {
      alert('No data available to export');
      return;
    }
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    XLSX.writeFile(workbook, `${dataType || 'data'}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const downloadTableAsCSV = (dataType = '') => {
    let data = [];
    let headers = [];
    
    // Get data based on current active menu
    switch(activeMenu) {
      case 'manage-staff':
        headers = ['Name', 'Email', 'Phone', 'Designation', 'Permissions'];
        data = staff.map(s => [
          s.name,
          s.email,
          s.phone,
          s.designation,
          Object.entries(s.permissions || {})
            .filter(([key, value]) => value)
            .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
            .join(', ')
        ]);
        break;
        
      case 'manage-users':
        headers = ['Name', 'Email', 'Phone', 'City', 'Joined Date'];
        data = users.map(u => [
          u.name,
          u.email,
          u.phone,
          u.city,
          new Date(u.createdAt).toLocaleDateString()
        ]);
        break;
        
      case 'bookings':
        headers = ['Customer', 'Email', 'Service', 'Price', 'Status', 'Date'];
        data = bookings.map(b => [
          b.userName,
          b.userEmail,
          b.serviceName,
          `₹${b.servicePrice}`,
          b.status,
          new Date(b.createdAt).toLocaleDateString()
        ]);
        break;
        
      default:
        // Fallback: Try to get data from table
        const table = document.querySelector('table');
        if (table) {
          headers = Array.from(table.querySelectorAll('thead th'))
            .map(th => th.textContent.trim())
            .filter(h => h && !h.includes('checkbox')); // Remove empty headers and checkboxes
          
          const rows = table.querySelectorAll('tbody tr');
          data = Array.from(rows).map(row => {
            const cells = row.querySelectorAll('td');
            return Array.from(cells).map((cell, index) => {
              // Skip checkbox cells
              if (cell.querySelector('input[type="checkbox"]')) {
                return '';
              }
              return cell.textContent.trim();
            }).filter((_, index) => headers[index]); // Only include columns with headers
          });
        }
    }
    
    if (data.length === 0) {
      alert('No data available to export');
      return;
    }
    
    // Combine headers and data
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${dataType || 'data'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination component with dropdown
  const CustomPagination = ({ 
    currentPage, 
    totalPages, 
    totalItems,
    itemsPerPage,
    onPageChange, 
    onItemsPerPageChange,
    showDownload = true,
    dataType = '' // 'staff', 'users', 'bookings', etc.
  }) => {
    return (
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="d-flex align-items-center">
          <Dropdown className="me-3">
            <Dropdown.Toggle style={{backgroundColor:"white",border:"1px solid #000000",color:"black"}} size="sm">
              {itemsPerPage} per page
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => onItemsPerPageChange(10)}>10 per page</Dropdown.Item>
              <Dropdown.Item onClick={() => onItemsPerPageChange(15)}>15 per page</Dropdown.Item>
              <Dropdown.Item onClick={() => onItemsPerPageChange(20)}>20 per page</Dropdown.Item>
              <Dropdown.Item onClick={() => onItemsPerPageChange(50)}>50 per page</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          
          {showDownload && (
            <div className="d-flex gap-2">
              <Button 
                style={{backgroundColor:"white",border:"1px solid #000000"}}
                onClick={() => downloadTableAsPDF(dataType)}
                title="Download as PDF"
              >
                <FaFilePdf className="text-danger" />
              </Button>
              <Button 
                style={{backgroundColor:"white",border:"1px solid #000000"}}
                onClick={() => downloadTableAsExcel(dataType)}
                title="Download as Excel"
              >
                <FaFileExcel className="text-danger" />
              </Button>
              <Button 
                style={{backgroundColor:"white",border:"1px solid #000000"}}
                onClick={() => downloadTableAsCSV(dataType)}
                title="Download as CSV"
              >
                <FaFileCsv className="text-danger" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleMenuClick = (menu) => {
    // Check permission before switching menu
    const permissionMap = {
      'dashboard': 'Dashboard',
      'add-staff': 'Staff',
      'manage-staff': 'Staff',
      'manage-users': 'User',
      'add-category': 'Category',
      'manage-categories': 'Category',
      'add-product': 'Product',
      'manage-products': 'Product',
      'bookings': 'Bookings',
      'reports': 'Reports',
      'settings': 'Settings',
      'profile':'Dashboard'
    };

    const requiredPermission = permissionMap[menu];
    if (requiredPermission && !hasPermission(requiredPermission)) {
      alert("You don't have permission to access this section");
      return;
    }

    setActiveMenu(menu);
    setIsEditingStaff(false);
    setEditStaffId(null);
    setIsEditingCategory(false);
    setEditCategoryId(null);
    
    // Reset forms when switching away
    if (menu !== 'add-staff') {
      setNewStaff({
        name: '',
        email: '',
        phone: '',
        designation: '',
        password: '',
        permissions: {
          Dashboard: false,
          Staff: false,
          User: false,
          Category: false,
          Product: false,
          Bookings: false,
          Reports: false,
          Settings: false
        }
      });
      setConfirmPassword('');
    }
    
    // Reset category edit state
    if (menu !== 'add-category') {
      setIsEditingCategory(false);
      setEditCategoryId(null);
      setEditCategory({
        name: '',
        description: '',
        category: '',
        order: 0,
        isActive: true
      });
    }
    
    // Fetch data based on menu
    switch(menu) {
      case 'dashboard':
        fetchDashboardData();
        break;
      case 'add-staff':
        setShowAddStaffForm(true);
        fetchStaff();
        break;
      case 'manage-staff':
        setShowAddStaffForm(false);
        fetchStaff();
        break;
      case 'manage-users':
        setShowAddUserModal(false);
        fetchUsers();
        break;
      case 'add-category':
        setShowAddCategoryModal(true);
        fetchCategories();
        break;
      case 'manage-categories':
        setShowAddCategoryModal(false);
        fetchCategories();
        break;
      case 'add-product':
        setShowAddProductModal(true);
        fetchProducts();
        break;
      case 'manage-products':
        setShowAddProductModal(false);
        fetchProducts();
        break;
      case 'bookings':
        fetchBookings();
        break;
      case 'reports':
        fetchReports();
        break;
      case 'settings':
        break;
      default:
        break;
    }
  };

  // Update handleAddStaff function
const handleAddStaff = async (e) => {
  e.preventDefault();
  setFormError('');
  setFormSuccess(false);
  
  if (!newStaff.name || !newStaff.email || !newStaff.phone || !newStaff.designation || !newStaff.password) {
    setFormError("Please fill all required fields");
    return;
  }
  
  if (newStaff.password !== confirmPassword) {
    setFormError("Passwords do not match");
    return;
  }
  
  try {
    let staffData = { ...newStaff };
    
    // Upload profile image if exists
    if (profileImage) {
      try {
        const imageUrl = await uploadProfileImage(profileImage);
        staffData.profileImage = imageUrl;
      } catch (error) {
        setFormError("Failed to upload profile image: " + error.message);
        return;
      }
    }
    
    const url = isEditingStaff 
      ? `http://localhost:5000/api/admin/staff/${editStaffId}`
      : 'http://localhost:5000/api/admin/staff';
    
    const method = isEditingStaff ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(staffData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      setFormSuccess(true);
      
      // Reset form
      setNewStaff({
        name: '',
        email: '',
        phone: '',
        designation: '',
        password: '',
        permissions: {
          Dashboard: false,
          Staff: false,
          User: false,
          Category: false,
          Product: false,
          Bookings: false,
          Reports: false,
          Settings: false
        }
      });
      setConfirmPassword('');
      setProfileImage(null);
      setProfileImagePreview("");
      
      // Reset editing state
      setEditStaffId(null);
      setIsEditingStaff(false);
      
      // Refresh staff list
      setTimeout(() => {
        fetchStaff();
      }, 500);
      
      setTimeout(() => {
        setFormSuccess(false);
      }, 5000);
      
    } else {
      setFormError(data.error || (isEditingStaff ? 'Failed to update staff member' : 'Failed to add staff member'));
    }
  } catch (error) {
    console.error('Error saving staff:', error);
    setFormError(`Failed to ${isEditingStaff ? 'update' : 'add'} staff member. Please try again.`);
  }
};

  // Function to handle editing staff
  const handleEditStaff = (staffMember) => {
    setNewStaff({
      name: staffMember.name || '',
      email: staffMember.email || '',
      phone: staffMember.phone || '',
      designation: staffMember.designation || '',
      password: '', // Don't show password for security
      permissions: staffMember.permissions || {
        Dashboard: false,
        Staff: false,
        User: false,
        Category: false,
        Product: false,
        Bookings: false,
        Reports: false,
        Settings: false
      }
    });
    setEditStaffId(staffMember._id);
    setIsEditingStaff(true);
    setActiveMenu('add-staff');
  };


  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/admin/packages', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newProduct)
      });
      
      if (response.ok) {
        alert('Product added successfully!');
        setShowAddProductModal(false);
        setNewProduct({
          name: '',
          description: '',
          category: '',
          price: '',
          discountPrice: '',
          stock: 0,
          isActive: true
        });
        fetchProducts();
      } else {
        alert('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      
      const data = await response.json();
      if (data.success) {
        alert('User added successfully!');
        setShowAddUserModal(false);
        setNewUser({
          name: '',
          email: '',
          phone: '',
          city: '',
          password: ''
        });
        fetchUsers();
      } else {
        alert(data.error || 'Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  };

  // Delete Functions
  const deleteStaff = async (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/staff/${staffId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
          alert('Staff member deleted successfully');
          fetchStaff(staffPage, staffSearch, staffPerPage);
        } else {
          alert(data.error || 'Failed to delete staff member');
        }
      } catch (error) {
        console.error('Error deleting staff:', error);
        alert('Failed to delete staff member');
      }
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
          alert('User deleted successfully');
          fetchUsers(userPage, userSearch, userPerPage);
        } else {
          alert(data.error || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };



  const deleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/packages/${productId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        
        if (response.ok) {
          alert('Product deleted successfully');
          fetchProducts();
        } else {
          alert('Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  // Function to get initials from name
  const getInitials = (name) => {
    if (!name) return 'NA';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        alert('Booking status updated successfully');
        fetchBookings(bookingPage, bookingSearch, bookingStatus, bookingPerPage);
        fetchDashboardData();
      } else {
        alert(data.error || 'Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status');
    }
  };

  const deleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/bookings/${bookingId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
          alert('Booking deleted successfully');
          fetchBookings(bookingPage, bookingSearch, bookingStatus, bookingPerPage);
          fetchDashboardData();
        } else {
          alert(data.error || 'Failed to delete booking');
        }
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Failed to delete booking');
      }
    }
  };

  useEffect(() => {
  // Check if user is already logged in
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('userRole');
  const permissions = localStorage.getItem('userPermissions');
  
  if (token && role && permissions) {
    setIsLoggedIn(true);
    setUserRole(role);
    setUserPermissions(JSON.parse(permissions));
    fetchDashboardData();
    
    // Fetch appropriate profile
    if (role === 'admin') {
      fetchAdminProfile();
    } else {
      fetchStaffProfile();
    }
  }
  
  fetchAdminLogo();
}, []);

  if (!isLoggedIn) {
    return (
      <Container className='d-flex justify-content-center align-items-center' style={{ minHeight: "100vh"}}>
        <Row className='w-75 shadow-lg' style={{ border: "1px solid #dee2e6", borderRadius: "15px", overflow: "hidden" }}>
          <Col md={6} className='p-0 d-none d-md-block' >
            <div 
              style={{
                background: "#000000",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                color: "white",
                padding: "3rem 2rem"
              }}
            >
              <div className="text-center mb-4">
                <img 
                  src={`http://localhost:5000${adminLogo}`} 
                  alt="Urban Company Admin" 
                  style={{ 
                    width: "180px", 
                    height: "180px", 
                    objectFit: "contain",
                    backgroundColor: "white",
                    borderRadius: "88px",
                    padding: "20px",
                    marginTop: "0px"
                  }}
                />
              </div> <br />
              
              <h3 className="text-center mb-3" style={{ fontWeight: "bold" }}>Urban Company Admin</h3>
              <p className="text-center">Home service platform</p>
            </div>
          </Col>
          
          <Col xs={12} md={6} className="p-5">
            <Card style={{ border: "0px", boxShadow: "none", backgroundColor: "transparent" }}>
              <Card.Body className="p-0">
                <div className="mb-4">
                  <h6 className='fw-semibold'>Log in as {loginType === 'admin' ? 'Admin' : 'Staff'}</h6>
                </div>
                <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">  
                  <Form.Control
                    type="email"
                    placeholder="Username"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    required
                    className="py-2"
                    style={{ borderRadius: "8px", border: "2px solid #000000ff" }}
                    autoComplete="username"
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    required
                    className="py-2"
                    style={{ borderRadius: "8px", border: "2px solid #000000ff" }}
                    autoComplete="current-password"
                  />
                </Form.Group>
                
                <Button 
                  type="submit" 
                  className="w-100 py-3" 
                  disabled={loading}
                  style={{ 
                    background: "#000000",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "16px",
                    transition: "all 0.3s"
                  }}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">Signing in...</span>
                    </>
                  ) : 'Sign In'}
                </Button>
              </Form> <br />
              <div >
                <h6 >Admin ceredentials:</h6>
                <p className='text-muted mb-0'>Username: admin@urbancompany.com</p>
                <p className='text-muted mb-0'>Password: admin123</p>
              </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Render sidebar with permission checks
  const renderSidebar = () => {
    return (
      <div style={{ 
        width: '250px', 
        background: '#000000',
        color: 'white',
        padding: '20px 0',
        position: 'fixed',
        height: '100vh',
        zIndex: 1000,
        overflowY: 'auto'
      }}>
        <div className="text-center mb-4 px-3">
          <img 
            src={`http://localhost:5000${adminLogo}`} 
            alt="Urban Company" 
            style={{ 
              width: '80px', 
              height: '80px', 
              objectFit: 'contain',
              backgroundColor: 'white',
              borderRadius: '50%',
              padding: '10px'
            }}
          />
          <h5 className="mt-3 mb-0">Urban Company</h5>
          <small className="text-muted">
            {userRole === 'admin' ? 'Admin Panel' : 'Staff Panel'}
          </small>
        </div>

        <Nav className="flex-column px-3">
          {/* Dashboard */}
          {hasPermission('Dashboard') && (
            <Nav.Link 
              className={`mb-2 ${activeMenu === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleMenuClick('dashboard')}
              style={{ 
                color: activeMenu === 'dashboard' ? '#000' : 'white',
                background: activeMenu === 'dashboard' ? 'white' : 'transparent',
                borderRadius: '8px',
                padding: '10px 15px'
              }}
            >
              <i className="bi bi-speedometer2 me-2"></i>Dashboard
            </Nav.Link>
          )}
          
          {/* User Management - Only for admin and staff with Staff permission */}
          {(userRole === 'admin' || hasPermission('Staff')) && (
            <Dropdown className="mb-2">
              <Dropdown.Toggle 
                as={Nav.Link} 
                style={{ 
                  color: ['add-staff', 'manage-staff'].includes(activeMenu) ? '#000' : 'white',
                  background: ['add-staff', 'manage-staff'].includes(activeMenu) ? 'white' : 'transparent',
                  borderRadius: '8px',
                  padding: '10px 15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>
                  <i className="bi bi-people me-2"></i>User Management
                </span>
                <i className="bi bi-chevron-down ms-auto"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ width: '100%' }}>
                {userRole === 'admin' && (
                  <Dropdown.Item onClick={() => handleMenuClick('add-staff')}>
                    <i className="bi bi-person-plus me-2"></i>Add user
                  </Dropdown.Item>
                )}
                <Dropdown.Item onClick={() => handleMenuClick('manage-staff')}>
                  <i className="bi bi-people-fill me-2"></i>Manage user
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
          
          {/* Customer Management - Only for admin and staff with User permission */}
          {(userRole === 'admin' || hasPermission('User')) && (
            <Dropdown className="mb-2">
              <Dropdown.Toggle 
                as={Nav.Link} 
                style={{ 
                  color: ['manage-users'].includes(activeMenu) ? '#000' : 'white',
                  background: ['manage-users'].includes(activeMenu) ? 'white' : 'transparent',
                  borderRadius: '8px',
                  padding: '10px 15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>
                  <i className="bi bi-person-badge me-2"></i>Customer Management
                </span>
                <i className="bi bi-chevron-down ms-auto"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ width: '100%' }}>
                <Dropdown.Item onClick={() => handleMenuClick('manage-users')}>
                  <i className="bi bi-people-fill me-2"></i>Manage customer
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
          
          {/* Category Management */}
          {(userRole === 'admin' || hasPermission('Category')) && (
            <Dropdown className="mb-2">
              <Dropdown.Toggle 
                as={Nav.Link} 
                style={{ 
                  color: ['add-category', 'manage-categories'].includes(activeMenu) ? '#000' : 'white',
                  background: ['add-category', 'manage-categories'].includes(activeMenu) ? 'white' : 'transparent',
                  borderRadius: '8px',
                  padding: '10px 15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>
                  <i className="bi bi-tags me-2"></i>Category
                </span>
                <i className="bi bi-chevron-down ms-auto"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ width: '100%' }}>
                {userRole === 'admin' && (
                  <Dropdown.Item onClick={() => handleMenuClick('add-category')}>
                    <i className="bi bi-folder-plus me-2"></i>Add Category
                  </Dropdown.Item>
                )}
                <Dropdown.Item onClick={() => handleMenuClick('manage-categories')}>
                  <i className="bi bi-folder-fill me-2"></i>Manage Categories
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
          
          {/* Product Management */}
          {(userRole === 'admin' || hasPermission('Product')) && (
            <Dropdown className="mb-2">
              <Dropdown.Toggle 
                as={Nav.Link} 
                style={{ 
                  color: ['add-product', 'manage-products'].includes(activeMenu) ? '#000' : 'white',
                  background: ['add-product', 'manage-products'].includes(activeMenu) ? 'white' : 'transparent',
                  borderRadius: '8px',
                  padding: '10px 15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>
                  <i className="bi bi-box-seam me-2"></i>Product
                </span>
                <i className="bi bi-chevron-down ms-auto"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ width: '100%' }}>
                {userRole === 'admin' && (
                  <Dropdown.Item onClick={() => handleMenuClick('add-product')}>
                    <i className="bi bi-plus-circle me-2"></i>Add Product
                  </Dropdown.Item>
                )}
                <Dropdown.Item onClick={() => handleMenuClick('manage-products')}>
                  <i className="bi bi-box-seam me-2"></i>Manage Products
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
          
          {/* Bookings */}
          {(userRole === 'admin' || hasPermission('Bookings')) && (
            <Nav.Link 
              className={`mb-2 ${activeMenu === 'bookings' ? 'active' : ''}`}
              onClick={() => handleMenuClick('bookings')}
              style={{ 
                color: activeMenu === 'bookings' ? '#000' : 'white',
                background: activeMenu === 'bookings' ? 'white' : 'transparent',
                borderRadius: '8px',
                padding: '10px 15px'
              }}
            >
              <i className="bi bi-calendar-check me-2"></i>Bookings
            </Nav.Link>
          )}
          
          {/* Reports */}
          {(userRole === 'admin' || hasPermission('Reports')) && (
            <Nav.Link 
              className={`mb-2 ${activeMenu === 'reports' ? 'active' : ''}`}
              onClick={() => handleMenuClick('reports')}
              style={{ 
                color: activeMenu === 'reports' ? '#000' : 'white',
                background: activeMenu === 'reports' ? 'white' : 'transparent',
                borderRadius: '8px',
                padding: '10px 15px'
              }}
            >
              <i className="bi bi-graph-up me-2"></i>Reports
            </Nav.Link>
          )}
          
          {/* Settings */}
          {(userRole === 'admin' || hasPermission('Settings')) && (
            <Nav.Link 
              className={`mb-2 ${activeMenu === 'settings' ? 'active' : ''}`}
              onClick={() => handleMenuClick('settings')}
              style={{ 
                color: activeMenu === 'settings' ? '#000' : 'white',
                background: activeMenu === 'settings' ? 'white' : 'transparent',
                borderRadius: '8px',
                padding: '10px 15px'
              }}
            >
              <i className="bi bi-gear me-2"></i>Settings
            </Nav.Link>
          )}
        </Nav>
        
        <div className="px-3 mt-4">
          <Button 
            variant="outline-light" 
            className="w-100"
            onClick={() => {
              localStorage.clear();
              setIsLoggedIn(false);
              setUserRole(null);
              setUserPermissions(null);
            }}
          >
            <i className="bi bi-box-arrow-left me-2"></i>Logout
          </Button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    // Check permission for current menu
    const permissionMap = {
      'dashboard': 'Dashboard',
      'add-staff': 'Staff',
      'manage-staff': 'Staff',
      'manage-users': 'User',
      'add-category': 'Category',
      'manage-categories': 'Category',
      'add-product': 'Product',
      'manage-products': 'Product',
      'bookings': 'Bookings',
      'reports': 'Reports',
      'settings': 'Settings'
    };

    const requiredPermission = permissionMap[activeMenu];
    if (requiredPermission && !hasPermission(requiredPermission)) {
      return (
        <Container className="text-center py-5">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h3 className="text-danger">Access Denied</h3>
              <p>You don't have permission to access this section.</p>
              <Button variant="primary" onClick={() => handleMenuClick('dashboard')}>
                Go to Dashboard
              </Button>
            </Card.Body>
          </Card>
        </Container>
      );
    }

    switch(activeMenu) {

      // Add in the switch statement:
case 'profile':
  return (
    <div>
    <Card className="p-3 shadow-lg">
      <div className="border-0">
        <h5 className="mb-0">My Profile</h5>
      </div></Card><br />
      <Card>
      <Card.Body>
        {userRole === 'admin' ? (
          adminProfile ? (
            <div className="profile-info">
              <div className="text-center mb-4">
                <div className="mb-3">
                  <i className="bi bi-person-circle" style={{ fontSize: "80px", color: "#6c757d" }}></i>
                </div>
                <h4>{adminProfile.username}</h4>
                <Badge bg="success" className="mb-2">{adminProfile.position}</Badge>
              </div>
              
              <div className="list-group list-group-flush">
                <div className="list-group-item">
                  <div className="row">
                    <div className="col-4 text-muted">Email</div>
                    <div className="col-8">
                      <strong>{adminProfile.email}</strong>
                    </div>
                  </div>
                </div>
                
               
                
                <div className="list-group-item">
                  <div className="row">
                    <div className="col-4 text-muted">Position</div>
                    <div className="col-8">
                      <strong>{adminProfile.position}</strong>
                    </div>
                  </div>
                </div>
                
                <div className="list-group-item">
                  <div className="row">
                    <div className="col-4 text-muted">Status</div>
                    <div className="col-8">
                      <Badge bg={adminProfile.isActive ? 'success' : 'secondary'}>
                        {adminProfile.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="list-group-item">
                  <div className="row">
                    <div className="col-4 text-muted">Last Login</div>
                    <div className="col-8">
                      {adminProfile.lastLogin ? 
                        new Date(adminProfile.lastLogin).toLocaleString() : 
                        'Never logged in'}
                    </div>
                  </div>
                </div>
                
                <div className="list-group-item">
                  <div className="row">
                    <div className="col-4 text-muted">Account Created</div>
                    <div className="col-8">
                      {new Date(adminProfile.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading profile...</p>
            </div>
          )
        ) : (
          staffProfile ? (
            <div className="profile-info">
              <div className="text-center mb-4">
                <div className="mb-3">
                  <i className="bi bi-person-circle" style={{ fontSize: "80px", color: "#6c757d" }}></i>
                </div>
                <h4>{staffProfile.name}</h4>
                <Badge bg="info" className="mb-2">{staffProfile.position}</Badge>
              </div>
              
              <div className="list-group list-group-flush">
                <div className="list-group-item">
                  <div className="row">
                    <div className="col-4 text-muted">Email</div>
                    <div className="col-8">
                      <strong>{staffProfile.email}</strong>
                    </div>
                  </div>
                </div>
                
                <div className="list-group-item">
                  <div className="row">
                    <div className="col-4 text-muted">Phone</div>
                    <div className="col-8">
                      <strong>{staffProfile.phone}</strong>
                    </div>
                  </div>
                </div>
                
                <div className="list-group-item">
                  <div className="row">
                    <div className="col-4 text-muted">Designation</div>
                    <div className="col-8">
                      <strong>{staffProfile.designation}</strong>
                    </div>
                  </div>
                </div>
                
                <div className="list-group-item">
                  <div className="row">
                    <div className="col-4 text-muted">Status</div>
                    <div className="col-8">
                      <Badge bg={staffProfile.isActive ? 'success' : 'secondary'}>
                        {staffProfile.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="list-group-item">
                  <div className="row">
                    <div className="col-4 text-muted">Permissions</div>
                    <div className="col-8">
                      {Object.entries(staffProfile.permissions || {})
                        .filter(([key, value]) => value)
                        .map(([key]) => key)
                        .join(', ')}
                    </div>
                  </div>
                </div>
                
                <div className="list-group-item">
                  <div className="row">
                    <div className="col-4 text-muted">Account Created</div>
                    <div className="col-8">
                      {new Date(staffProfile.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading profile...</p>
            </div>
          )
        )}
      </Card.Body>
    </Card></div>
  );

      case 'dashboard':
        return (
          <>
            <Row className="mb-4">
              <Col md={3}>
                <Card className="text-center border-0 shadow-sm">
                  <Card.Body className="py-4">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <div>
                        <span style={{ fontSize: "30px" }}><FcBusinessman /></span>
                      </div>
                    </div>
                    <h6 className="text-muted mb-2">Total Users</h6>
                    <h2 className="mb-0" >{stats?.totalUsers || 0}</h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-0 shadow-sm">
                  <Card.Body className="py-4">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <div>
                        <span style={{ fontSize: "30px" }}><FcPlanner /></span>
                      </div>
                    </div>
                    <h6 className="text-muted mb-2">Total Bookings</h6>
                    <h2 className="mb-0" >{stats?.totalBookings || 0}</h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-0 shadow-sm">
                  <Card.Body className="py-4">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <div >
                        <span style={{ fontSize: "30px" }}><FcBullish/></span>
                      </div>
                    </div>
                    <h6 className="text-muted mb-2">Total Revenue</h6>
                    <h2 className="mb-0" >₹{stats?.totalRevenue?.toLocaleString() || 0}</h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-0 shadow-sm">
                  <Card.Body className="py-4">
                    <div className="d-flex align-items-center justify-content-center mb-2">
                      <div >
                        <span style={{ fontSize: "30px" }}><FcSupport /></span>
                      </div>
                    </div>
                    <h6 className="text-muted ">Total Categories</h6>
                    <h2 >{stats?.totalCategories || 0}</h2>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={8}>
                <Card className="border-0 shadow-sm">
                  <Card.Header className="border-0">
                    <h5>Recent Bookings</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table striped bordered hover variant="light">
                        <thead>
                          <tr>
                            <th style={{ width: '80px' }}>Profile</th>
                            <th>Customer</th>
                            <th>Service</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentBookings.slice(0, 5).map((booking) => (
                            <tr key={booking._id}>
                              <td>
                                <div style={{ 
                                  width: '50px', 
                                  height: '50px', 
                                  borderRadius: '50%', 
                                  overflow: 'hidden',
                                  border: '2px solid #dee2e6'
                                }}>
                                  {booking.userProfileImage ? (
                                    <img 
                                      src={`http://localhost:5000${booking.userProfileImage}`} 
                                      alt={booking.userName}
                                      style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover'
                                      }}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = `
                                          <div style="
                                            width: 100%;
                                            height: 100%;
                                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            color: white;
                                            font-weight: bold;
                                            font-size: 16px;
                                          ">
                                            ${getInitials(booking.userName)}
                                          </div>
                                        `;
                                      }}
                                    />
                                  ) : (
                                    <div style={{ 
                                      width: '100%', 
                                      height: '100%', 
                                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: 'white',
                                      fontWeight: 'bold',
                                      fontSize: '16px'
                                    }}>
                                      {getInitials(booking.userName)}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div>
                                  <strong>{booking.userName}</strong><br/>
                                  <small className="text-muted">{booking.userEmail}</small>
                                </div>
                              </td>
                              <td>{booking.serviceName}</td>
                              <td><strong>₹{booking.servicePrice}</strong></td>
                              <td>
                                <Badge bg={
                                  booking.status === 'Completed' ? 'success' :
                                  booking.status === 'Confirmed' ? 'primary' :
                                  booking.status === 'Pending' ? 'warning' : 'danger'
                                }>
                                  {booking.status}
                                </Badge>
                              </td>
                              <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm">
                  <Card.Header className="border-0">
                    <h5>Recent Users</h5>
                  </Card.Header>
                  <Card.Body>
                    {recentUsers.slice(0, 5).map((user) => (
                      <div key={user._id} className="d-flex align-items-center mb-3">
                        <div style={{ 
                          width: '50px', 
                          height: '50px', 
                          borderRadius: '50%', 
                          overflow: 'hidden',
                          border: '2px solid #dee2e6',
                          flexShrink: 0,
                          marginRight: '12px'
                        }}>
                          {user.profileImage ? (
                            <img 
                              src={`http://localhost:5000${user.profileImage}`} 
                              alt={user.name}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = `
                                  <div style="
                                    width: 100%;
                                    height: 100%;
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    color: white;
                                    font-weight: bold;
                                    font-size: 16px;
                                  ">
                                    ${getInitials(user.name)}
                                  </div>
                                `;
                              }}
                            />
                          ) : (
                            <div style={{ 
                              width: '100%', 
                              height: '100%', 
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '16px'
                            }}>
                              {getInitials(user.name)}
                            </div>
                          )}
                        </div>
                        <div style={{ flexGrow: 1 }}>
                          <strong>{user.name || 'Unknown User'}</strong><br/>
                          <small className="text-muted">{user.email || 'No email'}</small>
                          <small className="d-block text-muted">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        );

      case 'add-staff':
        if (!hasPermission('Staff')) {
          return (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <h3 className="text-danger">Access Denied</h3>
                <p>You don't have permission to add staff members.</p>
              </Card.Body>
            </Card>
          );
        }
        
        return (
          <div className="p-3">
            <Card className="shadow-lg p-2">
              <Card.Body>
                <h6 className="mb-0 fw-semibold">
                  {isEditingStaff ? 'Edit Staff' : (
                    <>
                      User Management
                      <span className="text-muted mx-2" style={{fontSize:"14px",fontWeight:"normal"}}>•</span>
                      <span className="text-muted " style={{fontSize:"14px",fontWeight:"normal"}}>New User</span>
                    </>
                  )}
                </h6>
              </Card.Body>
            </Card>
            
            <br />
            
            <Card className="shadow-lg">
              <Card.Body className="p-4">
                {formSuccess && (
                  <Alert variant="success" onClose={() => setFormSuccess(false)} dismissible>
                    <Alert.Heading>Success!</Alert.Heading>
                    <p>{isEditingStaff ? 'Staff member updated successfully' : 'Staff member has been added successfully'}</p>
                  </Alert>
                )}
                
                {formError && (
                  <Alert variant="danger" onClose={() => setFormError('')} dismissible>
                    <Alert.Heading>Error!</Alert.Heading>
                    <p>{formError}</p>
                  </Alert>
                )}

                <div className="mb-4">
                  {isEditingStaff ? (
                    <>
                      <h6 className="fw-semibold mb-1">Edit user</h6>
                      <p className='text-muted' style={{fontSize:"12px"}}>Update the staff member profile</p>
                    </>
                  ) : (
                    <>
                      <h6 className="fw-semibold mb-1">New user </h6>
                      <p className='text-muted' style={{fontSize:"12px"}}>Use the below form to create a new profile</p>
                    </>
                  )}
                </div>
                
                <Form onSubmit={handleAddStaff} className="pt-2">
                  {/* First Row with Name and Email */}
                  <Row  style={{ "--bs-gutter-x": "5.5rem" } } className=" mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Control
                          type="text" 
                          style={{
                            border:"2px solid",
                            height:"50px",
                            fontSize: "14px",
                            width: "100%"
                          }}
                          value={newStaff.name}
                          onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                          required
                          placeholder="Name"
                          autoComplete="name"
                        />
                        
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Control
                          type="email" 
                          style={{
                            border:"2px solid",
                            height:"50px",
                            fontSize: "14px",
                            width: "100%"
                          }}
                          value={newStaff.email}
                          onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                          required
                          placeholder="E-mail"
                          autoComplete="email"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  {/* Second Row with Contact Number and Designation */}
                  <Row style={{ "--bs-gutter-x": "5.5rem" } } className=" mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Control
                          type="tel" 
                          style={{
                            border:"2px solid",
                            height:"50px",
                            fontSize: "14px",
                            width: "100%"
                          }}
                          value={newStaff.phone}
                          onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                          required
                          placeholder="Contact number"
                          autoComplete="tel"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Select
                          value={newStaff.designation} 
                          style={{
                            border:"2px solid",
                            height:"50px",
                            fontSize: "14px",
                            width: "100%"
                          }}
                          onChange={(e) => setNewStaff({...newStaff, designation: e.target.value})}
                          required
                        >
                          <option value="">Select Designation</option>
                          <option value="Manager">Manager</option>
                          <option value="Supervisor">Supervisor</option>
                          <option value="Technician">Technician</option>
                          <option value="Customer Support">Customer Support</option>
                          <option value="Admin">Admin</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  {/* Password Fields - Only when not editing */}
                  {!isEditingStaff && (
                    <Row style={{ "--bs-gutter-x": "5.5rem" } } className=" mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Control
                            type="password"
                            value={newStaff.password} 
                            onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                            placeholder="Password"
                            style={{
                              border:"2px solid",
                              height:"50px",
                              fontSize: "14px",
                              letterSpacing: '1px',
                              fontFamily: 'monospace',
                              width: "100%"
                            }}
                            autoComplete="new-password"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Control
                            type="password"
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            style={{
                              border:"2px solid",
                              height:"50px",
                              fontSize: "14px",
                              letterSpacing: '1px',
                              fontFamily: 'monospace',
                              width: "100%"
                            }}
                            autoComplete="new-password"
                            required
                          />
                          {confirmPassword && newStaff.password !== confirmPassword && (
                            <small className="text-danger mt-1 d-block">Passwords do not match</small>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  )}
                  
                  {/* Permissions Section */}
                  <Form.Group className="my-4">
                    <Form.Label className='fw-semibold mb-3'>Permissions</Form.Label>
                    <div className="px-1">
                      <Row style={{ "--bs-gutter-x": "5.5rem" } } className=" gy-2">
                        {[
                          'Dashboard',
                          'Staff', 
                          'User',
                          'Category',
                          'Product',
                          'Bookings',
                          'Reports',
                          'Settings'
                        ].map((permission) => (
                          <Col xs={6} sm={4} md={3} lg={2} key={permission}>
                            <div 
                              className="d-flex align-items-center p-2 rounded"
                              style={{
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: newStaff.permissions[permission] ? '#e9ecef' : 'transparent'
                              }}
                              onClick={() => setNewStaff({
                                ...newStaff,
                                permissions: {
                                  ...newStaff.permissions,
                                  [permission]: !newStaff.permissions[permission]
                                }
                              })}
                            >
                              <Form.Check
                                type="checkbox"
                                id={`permission-${permission}`}
                                label={permission}
                                checked={newStaff.permissions[permission] || false}
                                onChange={(e) => setNewStaff({
                                  ...newStaff,
                                  permissions: {
                                    ...newStaff.permissions,
                                    [permission]: e.target.checked
                                  }
                                })}
                                className="mb-0"
                                style={{ fontSize: "13px" }}
                              />
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  </Form.Group>
                  
                  {/* Action Buttons */}
                  <div className="d-flex justify-content-center gap-3 mt-4">
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => {
                        handleMenuClick('manage-staff');
                        setNewStaff({
                          name: '',
                          email: '',
                          phone: '',
                          designation: '',
                          password: '',
                          permissions: {
                            Dashboard: false,
                            Staff: false,
                            User: false,
                            Category: false,
                            Product: false,
                            Bookings: false,
                            Reports: false,
                            Settings: false
                          }
                        });
                        setConfirmPassword('');
                        if (isEditingStaff) {
                          setEditStaffId(null);
                          setIsEditingStaff(false);
                        }
                      }}
                      style={{ minWidth: '100px' }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant={isEditingStaff ? "warning" : "dark"} 
                      type="submit"
                      style={{ minWidth: '100px' }}
                    >
                      <i className={`bi ${isEditingStaff ? 'bi-pencil' : 'bi-person-plus'} me-2`}></i>
                      {isEditingStaff ? 'Update' : 'Submit'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>
        );

      case 'manage-staff':
        if (!hasPermission('Staff')) {
          return (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <h3 className="text-danger">Access Denied</h3>
                <p>You don't have permission to manage staff.</p>
              </Card.Body>
            </Card>
          );
        }
        
        return (
          <div>
            <Card>
              <Card className="shadow-lg p-3">
                <Card.Body>
                  <h5 className="mb-0 fw-semibold">
                    {isEditingStaff ? 'Edit Staff' : (
                      <>
                        User Management
                        <span className="text-muted mx-2" style={{fontSize:"14px",fontWeight:"normal"}}>•</span>
                        <span className="text-muted " style={{fontSize:"14px",fontWeight:"normal"}}>Manage User</span>
                      </>
                    )}
                  </h5>
                </Card.Body>
            </Card>
            </Card><br />
            <Card className="shadow-lg  p-3" style={{border:"5px"}}>
              <Card.Header className="border-0 ">
                <Row><Col><h5 className="mb-1 fw-semibold">Manage user</h5>
                <p className='text-muted' style={{fontSize:"12px"}}>Use this form to update your profile</p></Col>
                <Col>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="search"
                    placeholder="Search user..."
                    value={staffSearch}
                    onChange={(e) => {
                      setStaffSearch(e.target.value);
                      fetchStaff(1, e.target.value, staffPerPage);
                    }}
                    style={{ border:"2px solid ",width: '250px', height: "40px", marginTop: "10px" }}
                  />
                  
                  <CustomPagination
                    currentPage={staffPage}
                    totalPages={staffTotalPages}
                    totalItems={staffTotalItems}
                    itemsPerPage={staffPerPage}
                    onPageChange={(page) => {
                      setStaffPage(page);
                      fetchStaff(page, staffSearch, staffPerPage);
                    }}
                    onItemsPerPageChange={(perPage) => {
                      setStaffPerPage(perPage);
                      fetchStaff(1, staffSearch, perPage);
                    }}
                    showDownload={true}
                    dataType="staff"
                  />
                </div></Col></Row>
              </Card.Header>
              <Card.Body>
                {formSuccess && (
                  <Alert variant="success" onClose={() => setFormSuccess(false)} dismissible>
                    <Alert.Heading>Success!</Alert.Heading>
                    <p>Staff member updated successfully!</p>
                  </Alert>
                )}
                
                {selectedStaff.length > 0 && (
                  <Alert variant="dark" className="d-flex justify-content-between align-items-center">
                    <span>{selectedStaff.length} staff member(s) selected</span>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={()=>handleBulkDelete('staff',selectedStaff)}
                    >
                      <i className="bi bi-trash me-2"></i>Delete Selected
                    </Button>
                  </Alert>
                )}
                
                <div className="table-responsive">
                  <Table striped bordered hover style={{border:"2px solid"}}>
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>
                          <Form.Check
                            type="checkbox"
                            checked={selectAllStaff}
                            onChange={handleSelectAllStaff}
                          />
                        </th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Contact no</th>
                        <th>Password</th>
                        <th>Permissions</th>
                        <th style={{ width: '100px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map((staffMember) => (
                        <tr key={staffMember._id}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedStaff.includes(staffMember._id)}
                              onChange={() => handleStaffSelect(staffMember._id)}
                            />
                          </td>
                          
                          <td>
                            <strong>{staffMember.name}</strong>
                          </td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: '200px' }}>
                              {staffMember.email}
                            </div>
                          </td>
                          <td>{staffMember.phone}</td>
                          <td>
                            {displayPassword(staffMember.password)}
                          </td>
                          <td>
                            <div style={{ maxWidth: '200px' }}>
                              {formatPermissions(staffMember.permissions)}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button 
                                variant="warning" 
                                size="sm"
                                onClick={() => handleEditStaff(staffMember)}
                                title="Edit Staff"
                              >
                                <MdModeEdit />
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => deleteStaff(staffMember._id)}
                                title="Delete Staff"
                              >
                                <MdOutlineDelete />
                              </Button>
                              <Button 
                                variant="dark" 
                                size="sm"
                                onClick={() => handleViewStaff(staffMember)}
                                title="View Staff Details"
                              >
                                <IoEyeSharp /> 
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </div>
        );
        
      case 'manage-users':
        if (!hasPermission('User')) {
          return (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <h3 className="text-danger">Access Denied</h3>
                <p>You don't have permission to manage users.</p>
              </Card.Body>
            </Card>
          );
        }
        
        return (
          <Card className="border-0 shadow-sm">
            <Card.Header className="border-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Manage Users</h5>
                <p className="text-muted mb-0">View and manage all registered users</p>
              </div>
              <div className="d-flex gap-2">
                <Form.Control
                  type="search"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    fetchUsers(1, e.target.value, userPerPage);
                  }}
                  style={{height:"40px",marginTop:"8px" }}
                />
                <CustomPagination
                  currentPage={userPage}
                  totalPages={userTotalPages}
                  totalItems={userTotalItems}
                  itemsPerPage={userPerPage}
                  onPageChange={(page) => {
                    setUserPage(page);
                    fetchUsers(page, userSearch, userPerPage);
                  }}
                  onItemsPerPageChange={(perPage) => {
                    setUserPerPage(perPage);
                    fetchUsers(1, userSearch, perPage);
                  }}
                  showDownload={true}
                  dataType="users"
                />
              </div>
            </Card.Header>
            <Card.Body>
              {selectedUsers.length > 0 && (
                <Alert variant="light" className="d-flex justify-content-between align-items-center">
                  <span>{selectedUsers.length} user(s) selected</span>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleBulkDelete('users', selectedUsers)}
                  >
                    <i className="bi bi-trash me-2"></i>Delete Selected
                  </Button>
                </Alert>
              )}
              
              <div className="table-responsive">
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <Form.Check
                          type="checkbox"
                          checked={selectAllUsers}
                          onChange={handleSelectAllUsers}
                        />
                      </th>
                      <th style={{ width: '80px' }}>Profile</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>City</th>
                      <th style={{ width: '150px' }}>Password</th>
                      <th>Joined Date</th>
                      <th style={{ width: '100px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => handleUserSelect(user._id)}
                          />
                        </td>
                        <td>
                          <div style={{ 
                            width: '50px', 
                            height: '50px', 
                            borderRadius: '50%', 
                            overflow: 'hidden',
                            border: '2px solid #dee2e6'
                          }}>
                            {user.profileImage ? (
                              <img 
                                src={`http://localhost:5000${user.profileImage}`} 
                                alt={user.name}
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <div style={{ 
                                width: '100%', 
                                height: '100%', 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '16px'
                              }}>
                                {getInitials(user.name)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td><strong>{user.name}</strong></td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{user.city}</td>
                        <td>
                          <small className="text-muted" style={{ letterSpacing: '2px', fontFamily: 'monospace' }}>
                            {displayPassword(user.password)}
                          </small>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="text-center">
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => deleteUser(user._id)}
                              title="Delete User"
                            >
                              <MdOutlineDelete />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        );
        
      case 'manage-categories':
        if (!hasPermission('Category')) {
          return (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <h3 className="text-danger">Access Denied</h3>
                <p>You don't have permission to manage categories.</p>
              </Card.Body>
            </Card>
          );
        }
        
        return (
          <Categories 
            categories={categories}
            onEdit={(category) => {
              // Set edit mode
              setIsEditingCategory(true);
              setEditCategoryId(category._id);
              setEditCategory(category);
              // Navigate to add-category form in edit mode
              setActiveMenu('add-category');
            }}
            onDelete={(categoryId) => {
              if (window.confirm('Are you sure you want to delete this category?')) {
                handleBulkDelete('categories', [categoryId]);
              }
            }}
            onBulkDelete={(selectedIds) => {
              handleBulkDelete('categories', selectedIds);
            }}
            onToggleStatus={(categoryId, isActive) => {
              // Update category status
              updateCategory(categoryId, { isActive });
            }}
          />
        );
        
      case 'add-category':
        if (!hasPermission('Category')) {
          return (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <h3 className="text-danger">Access Denied</h3>
                <p>You don't have permission to add categories.</p>
              </Card.Body>
            </Card>
          );
        }
        
        return (
          <CategoryForm 
            isEditing={isEditingCategory}
            categoryData={editCategory}
            onSubmit={async (formData, imageFile) => {
              try {
                const formDataToSend = new FormData();
                formDataToSend.append('name', formData.name);
                formDataToSend.append('description', formData.description);
                formDataToSend.append('category', formData.category || 'General');
                formDataToSend.append('order', formData.order);
                formDataToSend.append('isActive', formData.isActive);
                
                if (imageFile) {
                  formDataToSend.append('image', imageFile);
                } else if (isEditingCategory && editCategory.img) {
                  formDataToSend.append('img', editCategory.img);
                }

                const url = isEditingCategory 
                  ? `http://localhost:5000/api/admin/services/${editCategoryId}`
                  : 'http://localhost:5000/api/admin/services';
                
                const response = await fetch(url, {
                  method: isEditingCategory ? 'PUT' : 'POST',
                  headers: { 
                    'Authorization': `Bearer ${getAuthToken()}`
                  },
                  body: formDataToSend
                });
                
                const data = await response.json();
                if (data.success) {
                  alert(`Category ${isEditingCategory ? 'updated' : 'added'} successfully!`);
                  
                  // Reset form and navigate back
                  setIsEditingCategory(false);
                  setEditCategoryId(null);
                  setEditCategory(null);
                  fetchCategories();
                  handleMenuClick('manage-categories');
                } else {
                  alert(data.error || `Failed to ${isEditingCategory ? 'update' : 'add'} category`);
                }
              } catch (error) {
                console.error(`Error ${isEditingCategory ? 'updating' : 'adding'} category:`, error);
                alert(`Failed to ${isEditingCategory ? 'update' : 'add'} category`);
              }
            }}
            onCancel={() => {
              setIsEditingCategory(false);
              setEditCategoryId(null);
              setEditCategory(null);
              handleMenuClick('manage-categories');
            }}
          />
        );
        
      case 'add-product':
        if (!hasPermission('Product')) {
          return (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <h3 className="text-danger">Access Denied</h3>
                <p>You don't have permission to add products.</p>
              </Card.Body>
            </Card>
          );
        }
        
        return (
          <Card className="border-0 shadow-sm">
            <Card.Header className="border-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Add New Product</h5>
                <p className="text-muted mb-0">Add a new product to inventory</p>
              </div>
              <div className="d-flex gap-2">
                <Button 
                  variant="secondary" 
                  onClick={() => handleMenuClick('manage-products')}
                >
                  <i className="bi bi-arrow-left me-2"></i>View All Products
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleAddProduct}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Product Name *</Form.Label>
                      <Form.Control
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        required
                        placeholder="Enter product name"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category *</Form.Label>
                      <Form.Select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Salon">Salon</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Repair">Repair</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Electrician">Electrician</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="Enter product description"
                  />
                </Form.Group>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price (₹) *</Form.Label>
                      <Form.Control
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                        required
                        placeholder="Enter price"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Discount Price (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        value={newProduct.discountPrice}
                        onChange={(e) => setNewProduct({...newProduct, discountPrice: e.target.value})}
                        placeholder="Enter discount price"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Stock Quantity *</Form.Label>
                      <Form.Control
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                        required
                        placeholder="Enter stock quantity"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Active Product"
                    checked={newProduct.isActive}
                    onChange={(e) => setNewProduct({...newProduct, isActive: e.target.checked})}
                  />
                </Form.Group>
                <div className="d-flex justify-content-end gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      setNewProduct({
                        name: '',
                        description: '',
                        category: '',
                        price: '',
                        discountPrice: '',
                        stock: 0,
                        isActive: true
                      });
                    }}
                  >
                    Clear Form
                  </Button>
                  <Button variant="primary" type="submit">
                    Add Product
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        );

      case 'manage-products':
        if (!hasPermission('Product')) {
          return (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <h3 className="text-danger">Access Denied</h3>
                <p>You don't have permission to manage products.</p>
              </Card.Body>
            </Card>
          );
        }
        
        return (
          <Card className="border-0 shadow-sm">
            <Card.Header className="border-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Manage Products</h5>
                <p className="text-muted mb-0">View and manage all products</p>
              </div>
              <div className="d-flex gap-2">
                <Form.Control
                  type="search"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  style={{ width: '250px' }}
                />
                <Button 
                  variant="primary"
                  onClick={() => handleMenuClick('add-product')}
                >
                  <i className="bi bi-plus-circle me-2"></i>Add New Product
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {selectedProducts.length > 0 && (
                <Alert variant="info" className="d-flex justify-content-between align-items-center">
                  <span>{selectedProducts.length} product(s) selected</span>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleBulkDelete('products', selectedProducts)}
                  >
                    <i className="bi bi-trash me-2"></i>Delete Selected
                  </Button>
                </Alert>
              )}
              
              <div className="table-responsive">
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <Form.Check
                          type="checkbox"
                          checked={selectAllProducts}
                          onChange={handleSelectAllProducts}
                        />
                      </th>
                      <th style={{ width: '80px' }}>Image</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th style={{ width: '120px' }}>Price</th>
                      <th style={{ width: '80px' }}>Stock</th>
                      <th style={{ width: '100px' }}>Status</th>
                      <th style={{ width: '100px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => handleProductSelect(product._id)}
                          />
                        </td>
                        <td>
                          <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            overflow: 'hidden',
                            border: '1px solid #dee2e6'
                          }}>
                            {product.img ? (
                              <img 
                                src={`http://localhost:5000${product.img}`} 
                                alt={product.name}
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <div className="bg-light w-100 h-100 d-flex align-items-center justify-content-center">
                                <i className="bi bi-box" style={{ fontSize: '24px', color: '#6c757d' }}></i>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{product.name || product.title}</strong>
                            <small className="text-muted d-block">{product.description?.substring(0, 50)}...</small>
                          </div>
                        </td>
                        <td>{product.category}</td>
                        <td>
                          <div>
                            <strong>{product.price}</strong>
                            {product.discountPrice && (
                              <small className="text-muted text-decoration-line-through d-block">{product.discountPrice}</small>
                            )}
                          </div>
                        </td>
                        <td>{product.stock || 'N/A'}</td>
                        <td>
                          <Badge bg={product.isActive ? 'success' : 'secondary'}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <Dropdown>
                            <Dropdown.Toggle variant="light" size="sm">
                              <i className="bi bi-three-dots"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item>
                                <i className="bi bi-eye me-2"></i>View Details
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item className="text-danger" onClick={() => deleteProduct(product._id)}>
                                <i className="bi bi-trash me-2"></i>Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        );

      case 'bookings':
        if (!hasPermission('Bookings')) {
          return (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <h3 className="text-danger">Access Denied</h3>
                <p>You don't have permission to manage bookings.</p>
              </Card.Body>
            </Card>
          );
        }
        
        return (
          <Card className="border-0 shadow-sm">
            <Card.Header className="border-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Booking Management</h5>
                <p className="text-muted mb-0">Manage all customer bookings</p>
              </div>
              <div className="d-flex gap-2">
                <Form.Select 
                  value={bookingStatus} 
                  onChange={(e) => {
                    setBookingStatus(e.target.value);
                    fetchBookings(1, bookingSearch, e.target.value, bookingPerPage);
                  }}
                  style={{ height:"40px", marginTop:"10px"}}
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </Form.Select>
                <Form.Control
                  type="search"
                  placeholder="Search bookings..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  style={{width:"250px", height:"40px", marginTop:"10px"}}
                />
                <CustomPagination
                  currentPage={bookingPage}
                  totalPages={bookingTotalPages}
                  totalItems={bookingTotalItems}
                  itemsPerPage={bookingPerPage}
                  onPageChange={(page) => {
                    setBookingPage(page);
                    fetchBookings(page, bookingSearch, bookingStatus, bookingPerPage);
                  }}
                  onItemsPerPageChange={(perPage) => {
                    setBookingPerPage(perPage);
                    fetchBookings(1, bookingSearch, bookingStatus, perPage);
                  }}
                  showDownload={true}
                  dataType="bookings"
                />
              </div>
            </Card.Header>
            <Card.Body>
              {selectedBookings.length > 0 && (
                <Alert variant="info" className="d-flex justify-content-between align-items-center">
                  <span>{selectedBookings.length} booking(s) selected</span>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={() => {
                        if (window.confirm(`Confirm ${selectedBookings.length} booking(s)?`)) {
                          selectedBookings.forEach(id => updateBookingStatus(id, 'Confirmed'));
                          setSelectedBookings([]);
                          setSelectAllBookings(false);
                        }
                      }}
                    >
                      <i className="bi bi-check-circle me-2"></i>Confirm Selected
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleBulkDelete('bookings', selectedBookings)}
                    >
                      <i className="bi bi-trash me-2"></i>Delete Selected
                    </Button>
                  </div>
                </Alert>
              )}
              
              <div className="table-responsive">
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <Form.Check
                          type="checkbox"
                          checked={selectAllBookings}
                          onChange={handleSelectAllBookings}
                        />
                      </th>
                      <th style={{ width: '80px' }}>Profile</th>
                      <th style={{ width: '120px' }}>Booking ID</th>
                      <th style={{ width: '180px' }}>Customer</th>
                      <th>Service</th>
                      <th style={{ width: '100px' }}>Price</th>
                      <th style={{ width: '120px' }}>Status</th>
                      <th style={{ width: '120px' }}>Date</th>
                      <th style={{ width: '100px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedBookings.includes(booking._id)}
                            onChange={() => handleBookingSelect(booking._id)}
                          />
                        </td>
                        <td>
                          <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '50%', 
                            overflow: 'hidden',
                            border: '2px solid #dee2e6'
                          }}>
                            {booking.userProfileImage ? (
                              <img 
                                src={`http://localhost:5000${booking.userProfileImage}`} 
                                alt={booking.userName}
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = `
                                    <div style="
                                      width: 100%;
                                      height: 100%;
                                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                      display: flex;
                                      align-items: center;
                                      justify-content: center;
                                      color: white;
                                      font-weight: bold;
                                      font-size: 12px;
                                    ">
                                      ${getInitials(booking.userName)}
                                    </div>
                                  `;
                                }}
                              />
                            ) : (
                              <div style={{ 
                                width: '100%', 
                                height: '100%', 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '12px'
                              }}>
                                {getInitials(booking.userName)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td><small className="text-muted">{booking._id?.substring(0, 8)}...</small></td>
                        <td>
                          <div>
                            <strong>{booking.userName}</strong><br/>
                            <small className="text-muted">{booking.userEmail}</small>
                          </div>
                        </td>
                        <td>{booking.serviceName}</td>
                        <td><strong>₹{booking.servicePrice}</strong></td>
                        <td>
                          <Badge bg={
                            booking.status === 'Completed' ? 'success' :
                            booking.status === 'Confirmed' ? 'primary' :
                            booking.status === 'Pending' ? 'warning' : 'danger'
                          }>
                            {booking.status}
                          </Badge>
                        </td>
                        <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="text-center">
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => deleteBooking(booking._id)}
                              title="Delete Booking"
                            >
                              <MdOutlineDelete />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        );

      case 'reports':
        if (!hasPermission('Reports')) {
          return (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <h3 className="text-danger">Access Denied</h3>
                <p>You don't have permission to view reports.</p>
              </Card.Body>
            </Card>
          );
        }
        
        return (
          <>
            <Row className="mb-4">
              <Col md={3}>
                <Card className="text-center border-0 shadow-sm">
                  <Card.Body className="py-4">
                    <h5 className="text-muted mb-2">Daily Bookings</h5>
                    <h2 className="mb-0" style={{ color: "#667eea" }}>{reports.dailyBookings}</h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-0 shadow-sm">
                  <Card.Body className="py-4">
                    <h5 className="text-muted mb-2">Monthly Revenue</h5>
                    <h2 className="mb-0" style={{ color: "#38b2ac" }}>₹{reports.monthlyRevenue.toLocaleString()}</h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-0 shadow-sm">
                  <Card.Body className="py-4">
                    <h5 className="text-muted mb-2">User Growth</h5>
                    <h2 className="mb-0" style={{ color: "#ed64a6" }}>{reports.userGrowth}</h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-0 shadow-sm">
                  <Card.Body className="py-4">
                    <h5 className="text-muted mb-2">Avg. Order Value</h5>
                    <h2 className="mb-0" style={{ color: "#764ba2" }}>₹1,250</h2>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="border-0">
                <h5>Top Categories by Revenue</h5>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table hover responsive>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Bookings</th>
                        <th>Revenue</th>
                        <th>Avg. Price</th>
                        <th>Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.topCategories.map((cat, index) => (
                        <tr key={index}>
                          <td><strong>{cat.name}</strong></td>
                          <td>{cat.bookings}</td>
                          <td>₹{cat.revenue.toLocaleString()}</td>
                          <td>₹{(cat.revenue / cat.bookings).toFixed(0)}</td>
                          <td>
                            <Badge bg="success">+12%</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
              <Card.Header className="border-0 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Report Actions</h5>
                <Dropdown>
                  <Dropdown.Toggle variant="primary">
                    <i className="bi bi-download me-2"></i>Export
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => downloadTableAsPDF('reports')}>
                      <i className="bi bi-file-earmark-pdf me-2"></i>Export as PDF
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => downloadTableAsExcel('reports')}>
                      <i className="bi bi-file-earmark-excel me-2"></i>Export as Excel
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => downloadTableAsCSV('reports')}>
                      <i className="bi bi-file-earmark-text me-2"></i>Export as CSV
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h6>Generate Custom Reports</h6>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>Report Type</Form.Label>
                        <Form.Select>
                          <option>Sales Report</option>
                          <option>User Report</option>
                          <option>Booking Report</option>
                          <option>Revenue Report</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Date Range</Form.Label>
                        <Row>
                          <Col>
                            <Form.Control type="date" />
                          </Col>
                          <Col>
                            <Form.Control type="date" />
                          </Col>
                        </Row>
                      </Form.Group>
                      <Button variant="primary">Generate Report</Button>
                    </Form>
                  </Col>
                  <Col md={6}>
                    <h6>Quick Stats</h6>
                    <div className="list-group">
                      <div className="list-group-item d-flex justify-content-between">
                        <span>Total Services Offered</span>
                        <strong>{stats?.totalServices || 0}</strong>
                      </div>
                      <div className="list-group-item d-flex justify-content-between">
                        <span>Active Bookings Today</span>
                        <strong>12</strong>
                      </div>
                      <div className="list-group-item d-flex justify-content-between">
                        <span>New Users Today</span>
                        <strong>8</strong>
                      </div>
                      <div className="list-group-item d-flex justify-content-between">
                        <span>Revenue Today</span>
                        <strong>₹15,250</strong>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </>
        );

      case 'settings':
        if (!hasPermission('Settings')) {
          return (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <h3 className="text-danger">Access Denied</h3>
                <p>You don't have permission to access settings.</p>
              </Card.Body>
            </Card>
          );
        }
        
        return (
          <Card className="border-0 shadow-sm">
            <Card.Header className="border-0">
              <h5 className="mb-0">Settings</h5>
              <p className="text-muted mb-0">Manage system settings</p>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSaveSettings}>
                <h6 className="mb-3">General Settings</h6>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Site Title</Form.Label>
                      <Form.Control
                        type="text"
                        value={settings.siteTitle}
                        onChange={(e) => setSettings({...settings, siteTitle: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Contact Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                        autoComplete="email"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Contact Phone</Form.Label>
                      <Form.Control
                        type="text"
                        value={settings.contactPhone}
                        onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
                        autoComplete="tel"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        type="text"
                        value={settings.address}
                        onChange={(e) => setSettings({...settings, address: e.target.value})}
                        autoComplete="street-address"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-4">
                  <Form.Label>Site Logo</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    className="mb-2"
                  />
                  <Form.Text className="text-muted">
                    Upload your company logo. Recommended size: 200x50 px.
                  </Form.Text>
                </Form.Group>
                <div className="d-flex justify-content-end">
                  <Button variant="primary" type="submit">
                    Save Settings
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', overflowX: 'hidden',backgroundColor:"#acacacff" }}>
      {/* Sidebar */}
      {sidebarOpen && renderSidebar()}

      {/* Main Content */}
      <div style={{ 
        marginLeft: sidebarOpen ? '250px' : '0', 
        flex: 1,
        transition: 'margin-left 0.3s',
        minWidth: '0'
      }}>
        {/* Top Navbar */}
        <Navbar bg="light" expand="lg" className="shadow-sm">
          <Container fluid>
            <Button variant="light" onClick={() => setSidebarOpen(!sidebarOpen)} className="me-3">
              <i className={`bi bi-${sidebarOpen ? 'chevron-left' : 'chevron-right'}`}></i>
            </Button>
            <Navbar.Brand className="fw-bold">
              Urban Company {userRole === 'admin' ? 'Admin' : 'Staff'} Panel
              <Badge bg={userRole === 'admin' ? 'success' : 'info'} className="ms-2">
                {userRole}
              </Badge>
            </Navbar.Brand>
            
            <Navbar.Toggle aria-controls="navbar-nav" />
            <Navbar.Collapse id="navbar-nav" className="justify-content-end">
              <Nav className="align-items-center">
                <Dropdown>
                  <Dropdown.Toggle variant="light" className="d-flex align-items-center">
                    <i className="bi bi-person-circle me-2"></i>
                    <span className="d-none d-md-inline">
                      {userRole === 'admin' ? 'Admin User' : 'Staff User'}
                    </span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end">
                  <Dropdown.Item onClick={() => {
                    // Check user role and show appropriate profile
                    if (userRole === 'admin') {
                      // Fetch admin profile details
                      fetchAdminProfile();
                    } else {
                      // Fetch staff profile details
                      fetchStaffProfile();
                    }
                    setActiveMenu('profile');
                  }}>
                    <i className="bi bi-person-circle me-2"></i>Profile
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleMenuClick('settings')}>
                    <i className="bi bi-gear me-2"></i>Settings
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => {
                    localStorage.clear();
                    setIsLoggedIn(false);
                    setUserRole(null);
                    setUserPermissions(null);
                  }}>
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
                </Dropdown>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* Main Content Area */}
        <Container fluid className="py-4">
          {renderContent()}
        </Container>
        
        {/* Staff Details Modal */}
        <Modal show={showStaffDetails} onHide={() => setShowStaffDetails(false)} centered>
          <Modal.Header >
            <Modal.Title className="fw-semibold fs-6">Staff Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedStaffDetails && (
              <div>
                <div className="text-center mb-4">
                  <h5 className="mb-1">{selectedStaffDetails.name}</h5>
                  <p className="text-muted mb-3">{selectedStaffDetails.designation}</p>
                </div>

                <div className="list-group list-group-flush">
                  <div className="list-group-item px-0 border-top-0">
                    <small className="text-muted d-block">Email</small>
                    <span>{selectedStaffDetails.email}</span>
                  </div>
                  <div className="list-group-item px-0">
                    <small className="text-muted d-block">Phone</small>
                    <span>{selectedStaffDetails.phone}</span>
                  </div>
                  <div className="list-group-item px-0">
                    <small className="text-muted d-block">Active Permissions</small>
                    <span>
                      {Object.entries(selectedStaffDetails.permissions || {})
                        .filter(([key, value]) => value)
                        .map(([permission]) => permission)
                        .join(', ')}
                    </span>
                  </div>
                  <div className="list-group-item px-0 border-bottom-0">
                    <small className="text-muted d-block">Member Since</small>
                    <span>
                      {selectedStaffDetails.createdAt ? new Date(selectedStaffDetails.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="secondary" onClick={() => setShowStaffDetails(false)}>
              Close
            </Button>
            <Button 
              variant="warning" 
              onClick={() => {
                setShowStaffDetails(false);
                handleEditStaff(selectedStaffDetails);
              }}
            >
              Edit
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Add User Modal */}
        <Modal show={showAddUserModal} onHide={() => setShowAddUserModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleAddUser}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  required
                  placeholder="Enter full name"
                  autoComplete="name"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                  placeholder="Enter email address"
                  autoComplete="email"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Phone *</Form.Label>
                <Form.Control
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  required
                  placeholder="Enter phone number"
                  autoComplete="tel"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>City *</Form.Label>
                <Form.Control
                  type="text"
                  value={newUser.city}
                  onChange={(e) => setNewUser({...newUser, city: e.target.value})}
                  required
                  placeholder="Enter city"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password *</Form.Label>
                <Form.Control
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                  placeholder="Enter password"
                  className="font-monospace"
                  style={{ letterSpacing: '1px' }}
                  autoComplete="new-password"
                />
                <Form.Text className="text-muted">
                  Will be displayed as •••••• in the user list for security
                </Form.Text>
              </Form.Group>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowAddUserModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Add User
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Add Product Modal */}
        <Modal show={showAddProductModal} onHide={() => setShowAddProductModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleAddProduct}>
              <Form.Group className="mb-3">
                <Form.Label>Product Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  required
                  placeholder="Enter product name"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Category *</Form.Label>
                <Form.Select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Salon">Salon</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Repair">Repair</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrician">Electrician</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Enter product description"
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Price (₹) *</Form.Label>
                    <Form.Control
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      required
                      placeholder="Enter price"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Stock Quantity *</Form.Label>
                    <Form.Control
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                      required
                      placeholder="Enter stock quantity"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowAddProductModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Add Product
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default AdminPanel;