import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Form, Button, 
  Spinner, Modal, Nav, Navbar, Badge,
  Dropdown, Alert
} from 'react-bootstrap';
import { MdModeEdit } from "react-icons/md";
import { MdOutlineDelete } from "react-icons/md";
import { FcBusinessman, FcPlanner, FcBullish, FcSupport } from "react-icons/fc";
import Categories from './Categories';
import CategoryForm from './CategoryForm';
import { IoEyeSharp } from "react-icons/io5";
import TableControls from './TableControls';
import { 
  prepareUserDataForExport, 
  prepareCustomerDataForExport, 
  prepareBookingDataForExport,
  getCSVHeadersFromData,
  exportAsPDF,
  exportAsExcel,
  exportAsCSV
} from './downloadUtils';
import "./Urbancom.css";


function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginType, setLoginType] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [adminLogo, setAdminLogo] = useState('/assets/Uc.png');
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({
    users: {},
    customer: {},
    product: {},
    category: {},
    settings: {}
  });

  const [touchedFields, setTouchedFields] = useState({
    users: {},
    customer: {},
    product: {},
    category: {},
    settings: {}
  });
  
  // Dashboard States
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  
  // User Management States
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userPerPage, setUserPerPage] = useState(10);
  const [userTotalItems, setUserTotalItems] = useState(0);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    password: '',
    permissions: {
      Dashboard: false,
      Users: false,
      Customer: false,
      Category: false,
      Product: false,
      Bookings: false,
      Reports: false,
      Settings: false
    }
  });
  
  // Profile Image States
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  
  // User Bulk Selection
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAllUsers, setSelectAllUsers] = useState(false);
  
  // Form feedback
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [editUserId, setEditUserId] = useState(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  
  // Customer Management States
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerPage, setCustomerPage] = useState(1);
  const [customerTotalPages, setCustomerTotalPages] = useState(1);
  const [customerPerPage, setCustomerPerPage] = useState(10);
  const [customerTotalItems, setCustomerTotalItems] = useState(0);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    password: ''
  });
  
  // Customer Bulk Selection
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectAllCustomers, setSelectAllCustomers] = useState(false);
  
  // Category Management States
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryTotalPages, setCategoryTotalPages] = useState(1);
  const [categoryPerPage, setCategoryPerPage] = useState(10);
  const [categoryTotalItems, setCategoryTotalItems] = useState(0);
  const [categorySearch, setCategorySearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectAllCategories, setSelectAllCategories] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  const [editCategoryId, setEditCategoryId] = useState(null);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editCategory, setEditCategory] = useState({
    name: '',
    description: '',
    category: '',
    order: 0,
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
    customerGrowth: 0,
    topCategories: []
  });

  // Settings States
  const [settings, setSettings] = useState({
    siteTitle: 'Urban Company',
    contactEmail: 'support@urbancompany.com',
    contactPhone: '1800-123-4567',
    address: '123 Business Street, City, Country'
  });

  // Profile States
  const [adminProfile, setAdminProfile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Format permissions with badges - Updated for consistent padding
const formatPermissions = (permissions) => {
  if (!permissions) return <Badge bg="dark" className="me-1 px-3 py-2">None</Badge>;
  
  const activePermissions = Object.entries(permissions)
    .filter(([key, value]) => value)
    .map(([key]) => key);
  
  if (activePermissions.length === 0) return <Badge bg="dark" className="me-1 px-3 py-2">None</Badge>;
  
  const permissionGradients = {
    'Dashboard': 'linear-gradient(135deg, #141E30 0%, #243B55 100%)',
    'Users': 'linear-gradient(135deg, #0F2027 0%, #203A43 100%)',
    'Customer': 'linear-gradient(135deg, #1A2980 0%, #26D0CE 100%)',
    'Category': 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    'Product': 'linear-gradient(135deg, #8E0E00 0%, #1F1C18 100%)',
    'Bookings': 'linear-gradient(135deg, #3A1C71 0%, #d82739ff 50%, #FFAF7B 100%)',
    'Reports': 'linear-gradient(135deg, #16222A 0%, #3A6073 100%)',
    'Settings': 'linear-gradient(135deg, #000000 0%, #434343 100%)'
  };

  return (
    <div className="d-flex flex-wrap" style={{ gap: '6px' }}>
      {activePermissions.map((permission) => {
        const gradient = permissionGradients[permission] || 'linear-gradient(135deg, #2C3E50 0%, #4CA1AF 100%)';
        const textColor = '#ffffff';
        
        return (
          <span
            key={permission}
            className="badge"
            style={{
              background: gradient,
              color: textColor,
              borderRadius: '15px',
              fontSize: "13.5px",
              boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
              lineHeight: '1.4',
              display: 'inline-flex',
              minHeight: '28px'
            }}>
            {permission}
          </span>
        );
      })}
    </div>
  );
};

  const validateUserForm = () => {
    const errors = {};
    
    if (!newUser.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!newUser.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!newUser.phone.trim()) {
      errors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(newUser.phone.replace(/\D/g, ''))) {
      errors.phone = 'Phone must be 10 digits';
    }
    
    if (!newUser.designation) {
      errors.designation = 'Designation is required';
    }
    
    // Skip password validation when editing (unless password is being changed)
    if (!isEditingUser) {
      if (!newUser.password) {
        errors.password = 'Password is required';
      } else if (newUser.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm password';
      } else if (newUser.password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    } else if (newUser.password !== '********' && newUser.password.length > 0) {
      // If editing and password is being changed (not placeholder)
      if (newUser.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm password';
      } else if (newUser.password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setFormErrors(prev => ({ ...prev, users: errors }));
    return Object.keys(errors).length === 0;
  };

  // Handle field blur for immediate feedback
  const handleFieldBlur = (formType, fieldName) => {
    setTouchedFields(prev => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        [fieldName]: true
      }
    }));
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

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/user-profile', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setUserProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!userPermissions) return false;
    if (userRole === 'admin') return true;
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

  const handleViewUser = (userMember) => {
    setSelectedUserDetails(userMember);
    setShowUserDetails(true);
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
        : 'http://localhost:5000/api/admin/user-login';
      
      console.log('Attempting login as:', isAdminEmail ? 'Admin' : 'User');
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      const data = await response.json();
      console.log('Login response:', data);
      
      if (data.success) {
        setIsLoggedIn(true);
        
        // ALWAYS reset to dashboard when logging in
        setActiveMenu('dashboard');
        
        // Store token and user info
        localStorage.setItem('authToken', data.token);
        
        if (isAdminEmail) {
          localStorage.setItem('userRole', 'admin');
          localStorage.setItem('userPermissions', JSON.stringify(data.admin?.permissions || {}));
          setUserRole('admin');
          setUserPermissions(data.admin?.permissions || {});
        } else {
          localStorage.setItem('userRole', 'user');
          localStorage.setItem('userPermissions', JSON.stringify(data.user?.permissions || {}));
          setUserRole('user');
          setUserPermissions(data.user?.permissions || {});
        }
        
        fetchDashboardData();
      } else {
        // If admin login fails, try user login
        if (isAdminEmail) {
          console.log('Admin login failed, trying user login...');
          // Try user login
          const userResponse = await fetch('http://localhost:5000/api/admin/user-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
          });
          
          const userData = await userResponse.json();
          if (userData.success) {
            setIsLoggedIn(true);
            
            // ALWAYS reset to dashboard when logging in
            setActiveMenu('dashboard');
            
            localStorage.setItem('authToken', userData.token);
            localStorage.setItem('userRole', 'user');
            localStorage.setItem('userPermissions', JSON.stringify(userData.user?.permissions || {}));
            setUserRole('user');
            setUserPermissions(userData.user?.permissions || {});
            fetchDashboardData();
          } else {
            alert(data.error || userData.error || 'Login failed');
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
          const customer = data.recentCustomers?.find(u => u.email === booking.customerEmail);
          return {
            ...booking,
            customerProfileImage: customer?.profileImage || '',
            customerName: customer?.name || booking.customerName
          };
        }) || [];
        
        setRecentBookings(transformedBookings);
        setRecentCustomers(data.recentCustomers || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

 const fetchUsers = async (page = 1, search = '', perPage = userPerPage) => {
  try {
    let url = `http://localhost:5000/api/admin/users?page=${page}&limit=${perPage}&search=${search}`;
    
    console.log('Fetching users:', { page, perPage, search });
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    
    if (data.success) {
      console.log('Users fetched successfully:', {
        page: data.pagination?.page || page,
        totalPages: data.pagination?.pages || totalPages,
        totalItems: data.pagination?.total || userTotalItems,
        usersCount: data.users?.length || 0
      });
      
      setUsers(data.users || []);
      setUserTotalPages(data.pagination?.pages || 1);
      setUserTotalItems(data.pagination?.total || 0);
      setSelectedUsers([]);
      setSelectAllUsers(false);
      setUserPerPage(perPage);
      setUserPage(page);
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};
  const fetchCustomers = async (page = 1, search = '', perPage = customerPerPage) => {
    try {
      let url = `http://localhost:5000/api/admin/customers?page=${page}&limit=${perPage}&search=${search}`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers || []);
        setCustomerTotalPages(data.pagination?.pages || 1);
        setCustomerTotalItems(data.pagination?.total || 0);
        setSelectedCustomers([]);
        setSelectAllCustomers(false);
        setCustomerPerPage(perPage);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

 const fetchCategories = async (page = 1, search = '', perPage = categoryPerPage) => {
  try {
    console.log(`Fetching categories from admin API... Page: ${page}, Search: ${search}, PerPage: ${perPage}`);
    
    let url = `http://localhost:5000/api/admin/services?page=${page}&limit=${perPage}&sort=-createdAt`;
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    
    const response = await fetch(url, {
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
      
      setCategories(formattedCategories);
      
      // Set pagination data if available
      if (data.pagination) {
        setCategoryTotalPages(data.pagination.pages || 1);
        setCategoryTotalItems(data.pagination.total || 0);
        setCategoryPerPage(data.pagination.limit || perPage);
        setCategoryPage(data.pagination.page || page);
      }
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
        // Get customer emails from bookings
        const customerEmails = data.bookings.map(b => b.customerEmail);
        
        // Fetch customer profile images
        const customersResponse = await fetch(`http://localhost:5000/api/admin/customers-by-emails`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ emails: customerEmails })
        });
        
        const customersData = await customersResponse.json();
        const customerMap = {};
        
        if (customersData.success) {
          customersData.customers.forEach(customer => {
            customerMap[customer.email] = {
              name: customer.name,
              profileImage: customer.profileImage
            };
          });
        }
        
        // Add profile images to bookings
        const bookingsWithProfiles = data.bookings.map(booking => ({
          ...booking,
          customerName: customerMap[booking.customerEmail]?.name || booking.customerName,
          customerProfileImage: customerMap[booking.customerEmail]?.profileImage || ''
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
        customerGrowth: '12%',
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

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerId)) {
        return prev.filter(id => id !== customerId);
      } else {
        return [...prev, customerId];
      }
    });
  };

  const handleSelectAllCustomers = () => {
    if (selectAllCustomers) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c._id));
    }
    setSelectAllCustomers(!selectAllCustomers);
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
    'users': 'user(s)',
    'customers': 'customer(s)',
    'categories': 'category(ies)',
    'products': 'product(s)',
    'bookings': 'booking(s)'
  };

  const backendEntityMap = {
    'users': 'users',
    'customers': 'customers',
    'categories': 'services',
    'products': 'packages', 
    'bookings': 'bookings'
  };

  const backendEntity = backendEntityMap[entity];
  
  // Single confirmation alert
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
        // Single success notification
        alert(`Successfully deleted ${selectedIds.length} ${entityNames[entity]}`);
        
        // Reset selection and refresh data
        switch(entity) {
          case 'users':
            setSelectedUsers([]);
            setSelectAllUsers(false);
            fetchUsers(userPage, userSearch, userPerPage);
            break;
          case 'customers':
            setSelectedCustomers([]);
            setSelectAllCustomers(false);
            fetchCustomers(customerPage, customerSearch, customerPerPage);
            break;
          case 'categories':
            setSelectedCategories([]);
            setSelectAllCategories(false);
            fetchCategories(categoryPage, categorySearch, categoryPerPage);
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

  // Function to get initials from name
const getInitials = (name) => {
  if (!name || name.trim() === '') return 'NA';
  
  // Clean up the name and get initials
  const parts = name.trim().split(' ');
  if (parts.length === 0) return 'NA';
  
  // Get first letter of first part
  let initials = parts[0][0].toUpperCase();
  
  // Get first letter of last part if exists and different from first
  if (parts.length > 1 && parts[parts.length - 1][0].toUpperCase() !== initials) {
    initials += parts[parts.length - 1][0].toUpperCase();
  }
  
  return initials;
};

  const handleMenuClick = (menu) => {
    // Check permission before switching menu
    const permissionMap = {
      'dashboard': 'Dashboard',
      'add-user': 'Users',
      'manage-users': 'Users',
      'manage-customers': 'Customer',
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

     setActiveMenu(menu);
    setIsEditingUser(false);
    setEditUserId(null);
    setIsEditingCategory(false);
    setEditCategoryId(null);
    
    // Reset forms when switching away
    if (menu !== 'add-user') {
      setNewUser({
        name: '',
        email: '',
        phone: '',
        designation: '',
        password: '',
        permissions: {
          Dashboard: false,
          Users: false,
          Customer: false,
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
    }
    
    // Reset customer form when switching away
    if (menu !== 'manage-customers') {
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        city: '',
        password: ''
      });
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
      case 'add-user':
        setShowAddUserForm(true);
        fetchUsers();
        break;
      case 'manage-users':
        setShowAddUserForm(false);
        fetchUsers();
        break;
      case 'manage-customers':
        setShowAddCustomerModal(false);
        fetchCustomers();
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

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);
    
    // Mark all fields as touched
    const touched = {};
    Object.keys(newUser).forEach(key => {
      if (key !== 'permissions') touched[key] = true;
    });
    
    // Only require password fields when not editing or when password is being changed
    if (!isEditingUser || (isEditingUser && newUser.password !== '********')) {
      touched.password = true;
      touched.confirmPassword = true;
    }
    
    setTouchedFields(prev => ({ ...prev, users: touched }));
    
    // Validate form
    if (!validateUserForm()) {
      setFormError("Please fix the errors in the form");
      return;
    }
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', newUser.name);
      formData.append('email', newUser.email);
      formData.append('phone', newUser.phone);
      formData.append('designation', newUser.designation);
      
      // Only send password if it's not the placeholder and not empty
      if (newUser.password !== '********' && newUser.password.trim()) {
        formData.append('password', newUser.password);
      }
      
      formData.append('permissions', JSON.stringify(newUser.permissions));
      formData.append('isActive', newUser.isActive !== undefined ? newUser.isActive : true);
      
      // Add profile image if exists
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }
      
      const url = isEditingUser 
        ? `http://localhost:5000/api/admin/users/${editUserId}`
        : 'http://localhost:5000/api/admin/users';
      
      const method = isEditingUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFormSuccess(true);
        
        // Reset form and errors
        setNewUser({
          name: '',
          email: '',
          phone: '',
          designation: '',
          password: '',
          permissions: {
            Dashboard: false,
            Users: false,
            Customer: false,
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
        setFormErrors(prev => ({ ...prev, users: {} }));
        setTouchedFields(prev => ({ ...prev, users: {} }));
        
        // Reset editing state
        setEditUserId(null);
        setIsEditingUser(false);
        
        // Refresh user list
        setTimeout(() => {
          fetchUsers();
        }, 500);
        
        setTimeout(() => {
          setFormSuccess(false);
        }, 5000);
        
      } else {
        setFormError(data.error || (isEditingUser ? 'Failed to update user' : 'Failed to add user'));
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setFormError(`Failed to ${isEditingUser ? 'update' : 'add'} user. Please try again.`);
    }
  };

  // Function to handle editing user
  const handleEditUser = (userMember) => {
    setNewUser({
      name: userMember.name || '',
      email: userMember.email || '',
      phone: userMember.phone || '',
      designation: userMember.designation || '',
      password: '********',
      isActive: userMember.isActive !== undefined ? userMember.isActive : true,
      permissions: userMember.permissions || {
        Dashboard: false,
        Users: false,
        Customer: false,
        Category: false,
        Product: false,
        Bookings: false,
        Reports: false,
        Settings: false
      }
    });
    
    // Set profile image preview if exists
    if (userMember.profileImage) {
      setProfileImagePreview(`http://localhost:5000${userMember.profileImage}`);
    } else {
      setProfileImagePreview("");
    }
    
    setEditUserId(userMember._id);
    setIsEditingUser(true);
    setActiveMenu('add-user');
    setProfileImage(null);
    setConfirmPassword(''); 
    setFormSuccess(false); 
    setFormError(''); 
    
    // Reset touched fields and errors
    setTouchedFields(prev => ({ ...prev, users: {} }));
    setFormErrors(prev => ({ ...prev, users: {} }));
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

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  };

  // Delete Functions
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

  const deleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/customers/${customerId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
          alert('Customer deleted successfully');
          fetchCustomers(customerPage, customerSearch, customerPerPage);
        } else {
          alert(data.error || 'Failed to delete customer');
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Failed to delete customer');
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
      
      // ALWAYS start with dashboard on page load
      setActiveMenu('dashboard');
      
      fetchDashboardData();
      fetchCustomers(); // Fetch customers on load
      
      // Fetch appropriate profile
      if (role === 'admin') {
        fetchAdminProfile();
      } else {
        fetchUserProfile();
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
                  <h6 className='fw-semibold'>Log in as {loginType === 'admin' ? 'Admin' : 'User'}</h6>
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
                <h6 >Admin credentials:</h6>
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
            {userRole === 'admin' ? 'Admin Panel' : 'User Panel'}
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
          
          {/* User Management - Only for admin and users with Users permission */}
          {(userRole === 'admin' || hasPermission('Users')) && (
            <Dropdown className="mb-2">
              <Dropdown.Toggle 
                as={Nav.Link} 
                style={{ 
                  color: ['add-user', 'manage-users'].includes(activeMenu) ? '#000' : 'white',
                  background: ['add-user', 'manage-users'].includes(activeMenu) ? 'white' : 'transparent',
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
                  <Dropdown.Item onClick={() => handleMenuClick('add-user')}>
                    <i className="bi bi-person-plus me-2"></i>Add user
                  </Dropdown.Item>
                )}
                <Dropdown.Item onClick={() => handleMenuClick('manage-users')}>
                  <i className="bi bi-people-fill me-2"></i>Manage users
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

           {/* Customer Management */}
          {(userRole === 'admin' || hasPermission('Customer')) && (
            <Nav.Link 
              className={`mb-2 ${activeMenu === 'manage-customers' ? 'active' : ''}`}
              onClick={() => handleMenuClick('manage-customers')}
              style={{ 
                color: activeMenu === 'manage-customers' ? '#000' : 'white',
                background: activeMenu === 'manage-customers' ? 'white' : 'transparent',
                borderRadius: '8px',
                padding: '10px 15px'
              }}
            >
              <i className="bi bi-person-badge me-2"></i>Customers
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
    // ALWAYS default to dashboard if no menu is active
    if (!activeMenu) {
      setActiveMenu('dashboard');
      return null;
    }
    
    // Check permission for current menu
    const permissionMap = {
      'dashboard': 'Dashboard',
      'add-user': 'Users',
      'manage-users': 'Users',
      'manage-customers': 'Customer',
      'add-category': 'Category',
      'manage-categories': 'Category',
      'add-product': 'Product',
      'manage-products': 'Product',
      'bookings': 'Bookings',
      'reports': 'Reports',
      'settings': 'Settings',
      'profile': 'Dashboard'
    };

    const requiredPermission = permissionMap[activeMenu];
    
    if (requiredPermission && !hasPermission(requiredPermission)) {
      // Show access denied message briefly
      setTimeout(() => {
        handleMenuClick('dashboard');
      }, 100);
      
      return (
        <Container className="text-center py-5">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h3 className="text-danger">Access Denied</h3>
              <p>You don't have permission to access this section.</p>
              <p>Redirecting to Dashboard...</p>
              <Spinner animation="border" variant="primary" />
            </Card.Body>
          </Card>
        </Container>
      );
    }

    switch(activeMenu) {
      case 'profile':
        return (
          <div>
            <Card className="p-3 shadow-lg">
              <div className="border-0">
                <h5 className="mb-0">My Profile</h5>
              </div>
            </Card><br />
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
                  userProfile ? (
                    <div className="profile-info">
                      <div className="text-center mb-4">
                        <div className="mb-3">
                          {userProfile.profileImage ? (
                            <img 
                              src={`http://localhost:5000${userProfile.profileImage}`} 
                              alt={userProfile.name}
                              style={{ 
                                width: '100px', 
                                height: '100px', 
                                objectFit: 'cover',
                                borderRadius: '50%',
                                border: '3px solid #dee2e6'
                              }}
                            />
                          ) : (
                            <i className="bi bi-person-circle" style={{ fontSize: "80px", color: "#6c757d" }}></i>
                          )}
                        </div>
                        <h4>{userProfile.name}</h4>
                        <Badge bg="info" className="mb-2">{userProfile.position}</Badge>
                      </div>
                      
                      <div className="list-group list-group-flush">
                        <div className="list-group-item">
                          <div className="row">
                            <div className="col-4 text-muted">Email</div>
                            <div className="col-8">
                              <strong>{userProfile.email}</strong>
                            </div>
                          </div>
                        </div>
                        
                        <div className="list-group-item">
                          <div className="row">
                            <div className="col-4 text-muted">Phone</div>
                            <div className="col-8">
                              <strong>{userProfile.phone}</strong>
                            </div>
                          </div>
                        </div>
                        
                        <div className="list-group-item">
                          <div className="row">
                            <div className="col-4 text-muted">Designation</div>
                            <div className="col-8">
                              <strong>{userProfile.designation}</strong>
                            </div>
                          </div>
                        </div>
                        
                        <div className="list-group-item">
                          <div className="row">
                            <div className="col-4 text-muted">Status</div>
                            <div className="col-8">
                              <Badge bg={userProfile.isActive ? 'success' : 'secondary'}>
                                {userProfile.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="list-group-item">
                          <div className="row">
                            <div className="col-4 text-muted">Permissions</div>
                            <div className="col-8">
                              {Object.entries(userProfile.permissions || {})
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
                              {new Date(userProfile.createdAt).toLocaleDateString()}
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
            </Card>
          </div>
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
                    <h6 className="text-muted mb-2">Total Customers</h6>
                    <h2 className="mb-0" >{stats?.totalCustomers || 0}</h2>
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
                      <Table striped bordered hover style={{border:"2px solid"}}>
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
                                  {booking.customerProfileImage ? (
                                    <img 
                                      src={`http://localhost:5000${booking.customerProfileImage}`} 
                                      alt={booking.customerName}
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
                                      {getInitials(booking.customerName)}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div>
                                  <strong>{booking.customerName}</strong><br/>
                                  <small className="text-muted">{booking.customerEmail}</small>
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
                    <h5>Recent Customers</h5>
                  </Card.Header>
                  <Card.Body>
                    {recentCustomers.slice(0, 5).map((customer) => (
                      <div key={customer._id} className="d-flex align-items-center mb-3">
                        <div style={{ 
                          width: '50px', 
                          height: '50px', 
                          borderRadius: '50%', 
                          overflow: 'hidden',
                          border: '2px solid #dee2e6',
                          flexShrink: 0,
                          marginRight: '12px'
                        }}>
                          {customer.profileImage ? (
                            <img 
                              src={`http://localhost:5000${customer.profileImage}`} 
                              alt={customer.name}
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
                                    ${getInitials(customer.name)}
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
                              {getInitials(customer.name)}
                            </div>
                          )}
                        </div>
                        <div style={{ flexGrow: 1 }}>
                          <strong>{customer.name || 'Unknown Customer'}</strong><br/>
                          <small className="text-muted">{customer.email || 'No email'}</small>
                          <small className="d-block text-muted">
                            Joined: {new Date(customer.createdAt).toLocaleDateString()}
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

      case 'add-user':
        if (!hasPermission('Users')) {
          return (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <h3 className="text-danger">Access Denied</h3>
                <p>You don't have permission to add users.</p>
              </Card.Body>
            </Card>
          );
        }
        
        return (
          <div className="p-3" >
            <Card className="shadow-lg " >
              <Card.Body  style={{marginLeft:"25px",marginRight:"25px"}}>
                <h5 className="mb-0 fw-semibold">
                  {isEditingUser ? 'Edit User' : (
                    <>
                      User Management
                      <span className="text-muted mx-2" style={{fontSize:"14px",fontWeight:"normal"}}>•</span>
                      <span className="text-muted " style={{fontSize:"14px",fontWeight:"normal"}}>New User</span>
                    </>
                  )}
                </h5>
              </Card.Body>
            </Card>
            
            <br />
            
            <Card className="shadow-lg">
              <Card.Body className="p-6"  style={{marginLeft:"25px",marginRight:"25px"}}>
                {formSuccess && (
                  <Alert variant="success" style={{height:"50px"}} onClose={() => setFormSuccess(false)} dismissible>
                    <p>{isEditingUser ? 'User updated successfully' : 'User has been added successfully'}</p>
                  </Alert>
                )}
                
                {formError && (
                  <Alert variant="danger" onClose={() => setFormError('')} dismissible>
                    <Alert.Heading>Error!</Alert.Heading>
                    <p>{formError}</p>
                  </Alert>
                )}

                <div className="mb-4">
                  {isEditingUser ? (
                    <>
                      <h5 className="fw-semibold mb-1">Edit user</h5>
                      <p className='text-muted' style={{fontSize:"12px"}}>Update the user profile</p>
                    </>
                  ) : (
                    <>
                      <h5 className="fw-semibold mb-1">New user </h5>
                      <p className='text-muted' style={{fontSize:"12px"}}>Use the below form to create a new profile</p>
                    </>
                  )}
                </div>
                
                <Form onSubmit={handleAddUser} className="pt-2">
                 
                  {/* First Row with Name and Email */}
                  <Row  className="mb-4 gx-5">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Control
                          type="text" 
                          style={{borderRadius:"5px",border:"2px solid #000000",height:"45px"}}
                          value={newUser.name}
                          onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                          onBlur={() => handleFieldBlur('users', 'name')}
                          required
                          placeholder="Name"
                          autoComplete="name"
                          className="py-3 "
                        />
                        {touchedFields.users?.name && formErrors.users?.name && (
                          <small className="text-danger d-block mt-1">{formErrors.users.name}</small>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Control
                          type="email" 
                          style={{borderRadius:"5px",border:"2px solid #000000",height:"45px"}}
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                          onBlur={() => handleFieldBlur('users', 'email')}
                          required
                          placeholder="E-mail"
                          autoComplete="email"
                          className="py-3"
                        />
                        {touchedFields.users?.email && formErrors.users?.email && (
                          <small className="text-danger d-block mt-1">{formErrors.users.email}</small>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Second Row with Contact Number and Designation */}
                  <Row  className="mb-4 gx-5">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Control
                          type="tel" 
                          style={{borderRadius:"5px",border:"2px solid #000000",height:"45px"}}
                          value={newUser.phone}
                          onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                          onBlur={() => handleFieldBlur('users', 'phone')}
                          required
                          placeholder="Contact number"
                          autoComplete="tel"
                          className="py-3"
                        />
                        {touchedFields.users?.phone && formErrors.users?.phone && (
                          <small className="text-danger d-block mt-1">{formErrors.users.phone}</small>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Select
                          value={newUser.designation}
                          style={{borderRadius:"5px",border:"2px solid #000000",height:"45px"}}
                          onChange={(e) => setNewUser({...newUser, designation: e.target.value})}
                          onBlur={() => handleFieldBlur('users', 'designation')}
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
                        {touchedFields.users?.designation && formErrors.users?.designation && (
                          <small className="text-danger d-block mt-1">{formErrors.users.designation}</small>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Password Fields - Only when not editing */}
                  {!isEditingUser && (
                    <Row  className="mb-4 gx-5">
                      <Col md={3}>
                        <Form.Group>
                          <Form.Control
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                            onBlur={() => handleFieldBlur('users', 'password')}
                            placeholder="Password"
                            style={{borderRadius:"5px",border:"2px solid #000000",height:"45px"}}
                            autoComplete="new-password"
                            required
                            className="py-3"
                          />
                          {touchedFields.users?.password && formErrors.users?.password && (
                            <small className="text-danger d-block mt-1">{formErrors.users.password}</small>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={3} className="mb-3">
                        <Form.Group>
                          <Form.Control
                            type="password"
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onBlur={() => handleFieldBlur('users', 'confirmPassword')}
                            placeholder="Confirm password"
                            style={{borderRadius:"5px",border:"2px solid #000000",height:"45px"}}
                            autoComplete="new-password"
                            required
                            className="py-3"
                          />
                          {touchedFields.users?.confirmPassword && formErrors.users?.confirmPassword && (
                            <small className="text-danger d-block mt-1">{formErrors.users.confirmPassword}</small>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6} >
                      <Form.Group>
                       <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setProfileImage(file);
                              setProfileImagePreview(URL.createObjectURL(file));
                            }
                          }}
                          className="py-2"
                          style={{borderRadius:"5px",border:"2px solid #000000",height:"45px"}}
                        />
                        
                        {profileImagePreview && (
                          <div className="mt-2 text-center">
                            <img 
                              src={profileImagePreview} 
                              alt="Preview" 
                              style={{ 
                                width: '100px', 
                                height: '60px', 
                                objectFit: 'cover'
                              }}
                            />
                            
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    </Row>
                  )}

                  {/* Permissions Section */}
                  <Form.Group className="my-4">
                    <Form.Label className='fw-semibold mb-43' style={{fontSize:"14px"}}>Permissions</Form.Label>
                    <div className="px-1">
                      <Row className=" gy-2  gx-5">
                        {[
                          'Dashboard',
                          'Users',
                          'Customer',
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
                                backgroundColor: newUser.permissions[permission] ? '#e9ecef' : 'transparent'
                              }}
                              onClick={() => setNewUser({
                                ...newUser,
                                permissions: {
                                  ...newUser.permissions,
                                  [permission]: !newUser.permissions[permission]
                                }
                              })}
                            >
                             <Form.Check
                              type="checkbox"
                              id={`permission-${permission}`}
                              label={permission}
                              checked={newUser.permissions[permission] || false}
                              onChange={(e) => setNewUser({
                                ...newUser,
                                permissions: {
                                  ...newUser.permissions,
                                  [permission]: e.target.checked
                                }
                              })}
                              className="mb-0"
                              style={{ 
                                fontSize: "13px",
                                '--bs-border-width': '2px',
                                '--bs-border-color': '#000000',
                              }}
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
                      variant="outline-dark" 
                      onClick={() => {
                        handleMenuClick('manage-users');
                        setNewUser({
                          name: '',
                          email: '',
                          phone: '',
                          designation: '',
                          password: '',
                          permissions: {
                            Dashboard: false,
                            Users: false,
                            Customer: false,
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
                        if (isEditingUser) {
                          setEditUserId(null);
                          setIsEditingUser(false);
                        }
                      }}
                      style={{ minWidth: '100px',borderRadius:"50px" }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="dark" 
                      type="submit"
                      style={{ minWidth: '100px',borderRadius:"50px" }}
                    >
                      <i className={`bi ${isEditingUser ? 'bi-pencil' : 'bi-person-plus'} me-2`}></i>
                     Submit
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>
        );

     case 'manage-users':
    return (
      <div>
        <Card className="shadow-lg">
          <Card.Body style={{ marginLeft: "23px", marginRight: "10px" }}>
            <h5 className="mb-0 fw-semibold">
              User Management
              <span className="text-muted mx-2" style={{ fontSize: "14px", fontWeight: "normal" }}>•</span>
              <span className="text-muted" style={{ fontSize: "14px", fontWeight: "normal" }}>Manage Users</span>
            </h5>
          </Card.Body>
        </Card>
        <br />
        <Card className="shadow-lg" style={{ border: "5px" }}>
          <Card.Header className="border-0" style={{ backgroundColor: "white" }}>
            <Row style={{ marginLeft: "12px", marginRight: "10px" }}>
              <Col style={{ marginTop: "10px" }}>
                <h5 className="mb-1 fw-semibold">Manage users</h5>
                <p className='text-muted' style={{ fontSize: "10.5px" }}>Use this form to update user profiles</p>
              </Col>
              <Col>
                {/* Single TableControls component with all features */}
                <TableControls
                  itemsPerPage={userPerPage}
                  onItemsPerPageChange={(perPage) => {
                    setUserPerPage(perPage);
                    fetchUsers(1, userSearch, perPage);
                  }}
                  currentPage={userPage}
                  totalPages={userTotalPages}
                  totalItems={userTotalItems}
                  onPageChange={(page) => {
                    setUserPage(page);
                    fetchUsers(page, userSearch, userPerPage);
                  }}
                  searchValue={userSearch}
                  onSearchChange={(e) => {
                    setUserSearch(e.target.value);
                    fetchUsers(1, e.target.value, userPerPage);
                  }}
                  searchPlaceholder="Search users..."
                  onDownloadPDF={() => {
                    const tableElement = document.querySelector('.table-responsive');
                    exportAsPDF(tableElement, 'users');
                  }}
                  onDownloadExcel={() => {
                    const userData = prepareUserDataForExport(users);
                    exportAsExcel(userData, 'users');
                  }}
                  onDownloadCSV={() => {
                    const userData = prepareUserDataForExport(users);
                    const headers = getCSVHeadersFromData(userData);
                    exportAsCSV(userData, headers, 'users');
                  }}selectedCount={selectedUsers.length}
                  onBulkDelete={() => handleBulkDelete('users', selectedUsers)}
                  showBulkActions={false} 
                  bulkEntityName="users"
                />
              </Col>
            </Row>
          </Card.Header>
          <Card.Body style={{ marginLeft: "20px", marginRight: "20px" }}>
            
            
            {/* Bulk Selection Alert - Similar to Categories component */}
            {selectedUsers.length > 0 && (
              <Alert variant="dark" className="d-flex justify-content-between align-items-center mb-3">
                <span>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {selectedUsers.length} user(s) selected
                </span>
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
              <Table striped bordered hover style={{ border: "2px solid" }} >
                <thead>
                  <tr>
                    <th>
                      <Form.Check
                        type="checkbox"
                        checked={selectAllUsers}
                        onChange={handleSelectAllUsers}
                        style={{
                          fontSize: "14px",
                          '--bs-border-width': '2px',
                          '--bs-border-color': '#000000',
                        }}
                      />
                    </th>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Contact no</th>
                    <th>Password</th>
                    <th>Permissions</th>
                    <th>Actions</th>
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
                          style={{
                            fontSize: "14px",
                            '--bs-border-width': '2px',
                            '--bs-border-color': '#000000',
                          }}
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
                  </td>
                      
                      <td>
                        {user.name}
                      </td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '200px' }}>
                          {user.email}
                        </div>
                      </td>
                      <td>{user.phone}</td>
                      <td>
                        {displayPassword(user.password)}
                      </td>
                      <td>
                        <div style={{ maxWidth: '200px' }}>
                          {formatPermissions(user.permissions)}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            title="Edit User"
                          >
                            <MdModeEdit />
                          </Button>
                          <Button
                            variant="dark"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                            title="View User Details"
                          >
                            <IoEyeSharp />
                          </Button>
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
      </div>
  );
        
      case 'manage-customers':
        if (!hasPermission('Customer')) {
          return (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <h3 className="text-danger">Access Denied</h3>
                <p>You don't have permission to manage customers.</p>
              </Card.Body>
            </Card>
          );
        }
        
        return (
          <div>
            <Card className="shadow-lg">
              <Card.Body  style={{marginLeft:"25px",marginRight:"25px"}}>
                <h5 className="fw-semibold mb-0">Customer Management</h5>
                <p className='text-muted' style={{fontSize:"12px"}}>View and manage all registered customers</p>
              </Card.Body>
            </Card>
            <br />
            <Card className="border-0 shadow-sm">
              <Card.Header className="border-0">
                <div>
                  <h5 className="mb-1 fw-semibold">Manage Customers</h5>
                  <p className="text-muted mb-0" style={{fontSize:"12px"}}>View and manage all registered customers</p>
                </div>
              </Card.Header>
              <Card.Body>
                {/* Table Controls */}
                <TableControls
                  itemsPerPage={customerPerPage}
                  onItemsPerPageChange={(perPage) => {
                    setCustomerPerPage(perPage);
                    fetchCustomers(1, customerSearch, perPage);
                  }}
                  currentPage={customerPage}
                  totalPages={customerTotalPages}
                  totalItems={customerTotalItems}
                  onPageChange={(page) => {
                    setCustomerPage(page);
                    fetchCustomers(page, customerSearch, customerPerPage);
                  }}
                  searchValue={customerSearch}
                  onSearchChange={(e) => {
                    setCustomerSearch(e.target.value);
                    fetchCustomers(1, e.target.value, customerPerPage);
                  }}
                  searchPlaceholder="Search customers..."
                  onDownloadPDF={() => {
                    const tableElement = document.querySelector('.table-responsive');
                    exportAsPDF(tableElement, 'customers');
                  }}
                  onDownloadExcel={() => {
                    const customerData = prepareCustomerDataForExport(customers);
                    exportAsExcel(customerData, 'customers');
                  }}
                  onDownloadCSV={() => {
                    const customerData = prepareCustomerDataForExport(customers);
                    const headers = getCSVHeadersFromData(customerData);
                    exportAsCSV(customerData, headers, 'customers');
                  }}
                  selectedCount={selectedCustomers.length}
                  onBulkDelete={() => handleBulkDelete('customers', selectedCustomers)}
                  showBulkActions={selectedCustomers.length > 0}
                  bulkEntityName="customers"
                  className="mb-3"
                />
                
                <div className="table-responsive">
                  <Table hover responsive>
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>
                          <Form.Check
                            type="checkbox"
                            checked={selectAllCustomers}
                            onChange={handleSelectAllCustomers}
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
                      {customers.map((customer) => (
                        <tr key={customer._id}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedCustomers.includes(customer._id)}
                              onChange={() => handleCustomerSelect(customer._id)}
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
                            {customer.profileImage ? (
                              <img 
                                src={`http://localhost:5000${customer.profileImage}`} 
                                alt={customer.name}
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
                                      font-size: 18px;
                                    ">
                                      ${getInitials(customer.name)}
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
                                fontSize: '18px'
                              }}>
                                {getInitials(customer.name)}
                              </div>
                            )}
                          </div>
                        </td>
                          <td><strong>{customer.name}</strong></td>
                          <td>{customer.email}</td>
                          <td>{customer.phone}</td>
                          <td>{customer.city}</td>
                          <td>
                            <small className="text-muted" style={{ letterSpacing: '2px', fontFamily: 'monospace' }}>
                              {displayPassword(customer.password)}
                            </small>
                          </td>
                          <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="text-center">
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => deleteCustomer(customer._id)}
                                title="Delete Customer"
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
          </div>
        );
        
    case 'manage-categories':
  return (
    <Categories 
      categories={categories}
      onEdit={(category) => {
        setIsEditingCategory(true);
        setEditCategoryId(category._id);
        setEditCategory(category);
        setActiveMenu('add-category');
      }}
      // Remove the confirmation alert here
      onDelete={(categoryId) => {
        // Directly call bulk delete with single ID
        handleBulkDelete('categories', [categoryId]);
      }}
      onBulkDelete={(selectedIds) => {
        handleBulkDelete('categories', selectedIds);
      }}
      onToggleStatus={(categoryId, isActive) => {
        updateCategory(categoryId, { isActive });
      }}
      
      // Add these pagination props:
      currentPage={categoryPage}
      totalPages={categoryTotalPages}
      totalItems={categoryTotalItems}
      onPageChange={(page) => {
        setCategoryPage(page);
        fetchCategories(page, categorySearch, categoryPerPage);
      }}
      
      // Add these search props:
      searchQuery={categorySearch}
      onSearchChange={(value) => {
        setCategorySearch(value);
        fetchCategories(1, value, categoryPerPage);
      }}
      itemsPerPage={categoryPerPage}
      onItemsPerPageChange={(perPage) => {
        setCategoryPerPage(perPage);
        fetchCategories(1, categorySearch, perPage);
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
            </Card.Header>
            <Card.Body>
              {/* Table Controls */}
              <TableControls
                itemsPerPage={bookingPerPage}
                onItemsPerPageChange={(perPage) => {
                  setBookingPerPage(perPage);
                  fetchBookings(1, bookingSearch, bookingStatus, perPage);
                }}
                currentPage={bookingPage}
                totalPages={bookingTotalPages}
                totalItems={bookingTotalItems}
                onPageChange={(page) => {
                  setBookingPage(page);
                  fetchBookings(page, bookingSearch, bookingStatus, bookingPerPage);
                }}
                searchValue={bookingSearch}
                onSearchChange={(e) => setBookingSearch(e.target.value)}
                searchPlaceholder="Search bookings..."
                onDownloadPDF={() => {
                  const tableElement = document.querySelector('.table-responsive');
                  exportAsPDF(tableElement, 'bookings');
                }}
                onDownloadExcel={() => {
                  const bookingData = prepareBookingDataForExport(bookings);
                  exportAsExcel(bookingData, 'bookings');
                }}
                onDownloadCSV={() => {
                  const bookingData = prepareBookingDataForExport(bookings);
                  const headers = getCSVHeadersFromData(bookingData);
                  exportAsCSV(bookingData, headers, 'bookings');
                }}
                selectedCount={selectedBookings.length}
                onBulkDelete={() => handleBulkDelete('bookings', selectedBookings)}
                showBulkActions={selectedBookings.length > 0}
                bulkEntityName="bookings"
                additionalActions={
                  <Form.Select 
                    value={bookingStatus} 
                    onChange={(e) => {
                      setBookingStatus(e.target.value);
                      fetchBookings(1, bookingSearch, e.target.value, bookingPerPage);
                    }}
                    style={{ height: "40px", width: "150px" }}
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </Form.Select>
                }
                className="mb-3"
              />
              
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
                            {booking.customerProfileImage ? (
                              <img 
                                src={`http://localhost:5000${booking.customerProfileImage}`} 
                                alt={booking.customerName}
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
                                      ${getInitials(booking.customerName)}
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
                                {getInitials(booking.customerName)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td><small className="text-muted">{booking._id?.substring(0, 8)}...</small></td>
                        <td>
                          <div>
                            <strong>{booking.customerName}</strong><br/>
                            <small className="text-muted">{booking.customerEmail}</small>
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
                    <h5 className="text-muted mb-2">Customer Growth</h5>
                    <h2 className="mb-0" style={{ color: "#ed64a6" }}>{reports.customerGrowth}</h2>
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
                    <Dropdown.Item onClick={() => {
                      const tableElement = document.querySelector('.table-responsive');
                      exportAsPDF(tableElement, 'reports');
                    }}>
                      <i className="bi bi-file-earmark-pdf me-2"></i>Export as PDF
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => {
                      const reportData = reports.topCategories.map(cat => ({
                        'Category': cat.name,
                        'Bookings': cat.bookings,
                        'Revenue': `₹${cat.revenue}`,
                        'Avg. Price': `₹${(cat.revenue / cat.bookings).toFixed(0)}`,
                        'Growth': '+12%'
                      }));
                      exportAsExcel(reportData, 'reports');
                    }}>
                      <i className="bi bi-file-earmark-excel me-2"></i>Export as Excel
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => {
                      const reportData = reports.topCategories.map(cat => ({
                        'Category': cat.name,
                        'Bookings': cat.bookings,
                        'Revenue': `₹${cat.revenue}`,
                        'Avg. Price': `₹${(cat.revenue / cat.bookings).toFixed(0)}`,
                        'Growth': '+12%'
                      }));
                      const headers = ['Category', 'Bookings', 'Revenue', 'Avg. Price', 'Growth'];
                      exportAsCSV(reportData, headers, 'reports');
                    }}>
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
                          <option>Customer Report</option>
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
                        <span>New Customers Today</span>
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
              Urban Company {userRole === 'admin' ? 'Admin' : 'User'} Panel
            </Navbar.Brand>
            
            <Navbar.Toggle aria-controls="navbar-nav" />
            <Navbar.Collapse id="navbar-nav" className="justify-content-end">
              <Nav className="align-items-center">
                <Dropdown>
                  <Dropdown.Toggle variant="light" className="d-flex align-items-center">
                    {userRole === 'user' && userProfile?.profileImage ? (
                      <img 
                        src={`http://localhost:5000${userProfile.profileImage}`} 
                        alt="Profile"
                        style={{ 
                          width: '30px', 
                          height: '30px', 
                          borderRadius: '50%',
                          marginRight: '8px',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <i className="bi bi-person-circle me-2"></i>
                    )}
                    <span className="d-none d-md-inline">
                      {userRole === 'admin' ? 'Admin User' : userProfile?.name || 'User'}
                    </span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end">
                    <Dropdown.Item onClick={() => {
                      if (userRole === 'admin') {
                        fetchAdminProfile();
                      } else {
                        fetchUserProfile();
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
        
        {/* User Details Modal */}
        <Modal show={showUserDetails} onHide={() => setShowUserDetails(false)} centered>
           <Button type="button" onClick={() => setShowUserDetails(false)} className="position-absolute border-0 justify-content-center closebtn p-0">X</Button>
          <Modal.Body>
            {selectedUserDetails && (
              <div>
                <div className="text-center mb-4">
                <div className="mb-3">
                  {selectedUserDetails.profileImage ? (
                    <img 
                      src={`http://localhost:5000${selectedUserDetails.profileImage}`} 
                      alt={selectedUserDetails.name}
                      style={{ 
                        width: '100px', 
                        height: '100px', 
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid #dee2e6'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div style="
                            width: 100px;
                            height: 100px;
                            border-radius: 50%;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: bold;
                            font-size: 32px;
                            margin: 0 auto;
                            border: 3px solid #dee2e6
                          ">
                            ${getInitials(selectedUserDetails.name)}
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div style={{ 
                      width: '100px', 
                      height: '100px', 
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '32px',
                      margin: '0 auto',
                      border: '3px solid #dee2e6'
                    }}>
                      {getInitials(selectedUserDetails.name)}
                    </div>
                  )}
                </div>
                <h5 className="mb-1">{selectedUserDetails.name}</h5>
                <p className="text-muted mb-3">{selectedUserDetails.designation}</p>
              </div>

                <div className="list-group list-group-flush">
                  <div className="list-group-item px-0 border-top-0">
                    <small className="text-muted d-block">Email</small>
                    <span>{selectedUserDetails.email}</span>
                  </div>
                  <div className="list-group-item px-0">
                    <small className="text-muted d-block">Phone</small>
                    <span>{selectedUserDetails.phone}</span>
                  </div>
                  <div className="list-group-item px-0">
                    <small className="text-muted d-block">Active Permissions</small>
                    <span>
                      {Object.entries(selectedUserDetails.permissions || {})
                        .filter(([key, value]) => value)
                        .map(([permission]) => permission)
                        .join(', ')}
                    </span>
                  </div>
                  <div className="list-group-item px-0">
                    <small className="text-muted d-block">Status</small>
                    <Badge bg={selectedUserDetails.isActive ? 'success' : 'secondary'}>
                      {selectedUserDetails.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="list-group-item px-0 border-bottom-0">
                    <small className="text-muted d-block">Member Since</small>
                    <span>
                      {selectedUserDetails.createdAt ? new Date(selectedUserDetails.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="secondary" onClick={() => setShowUserDetails(false)} style={{borderRadius:"50px"}}>
              Close
            </Button>
            <Button 
              variant="dark"  style={{borderRadius:"50px"}}
              onClick={() => {
                setShowUserDetails(false);
                handleEditUser(selectedUserDetails);
              }}
            >
              Edit
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default AdminPanel;