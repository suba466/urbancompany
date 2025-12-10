import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Form, Button, 
  Spinner, Modal, Nav, Navbar, Badge,
  Dropdown,  Alert
} from 'react-bootstrap';
import { MdModeEdit } from "react-icons/md";
import { MdOutlineDelete } from "react-icons/md";
import { FaFileExcel, FaFilePdf, FaFileCsv } from "react-icons/fa";
import { FcBusinessman } from "react-icons/fc";
import { FcPlanner } from "react-icons/fc";
import { FcBullish } from "react-icons/fc";
import { FcSupport } from "react-icons/fc";
// Import download libraries
import jsPDF from 'jspdf';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import Categories from './Categories';
import CategoryForm from './CategoryForm';
import { IoEyeSharp } from "react-icons/io5";
import "./Urbancom.css"; 
function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
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
  
  // Staff Bulk Selection
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [selectAllStaff, setSelectAllStaff] = useState(false);
  
  // Form feedback
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [editStaffId, setEditStaffId] = useState(null);
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [showStaffDetails, setShowStaffDetails]=useState(false);
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

  // Fetch functions
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

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      const data = await response.json();
      if (data.success) {
        setIsLoggedIn(true);
        localStorage.setItem('adminToken', 'admin-secret-token');
        fetchDashboardData();
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

const fetchDashboardData = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/admin/dashboard', {
      headers: { 'admin-token': 'admin-secret-token' }
    });
    const data = await response.json();
    if (data.success) {
      setStats(data.stats);
      
      // Transform recent bookings to include profile images from users
      const transformedBookings = data.recentBookings?.map(booking => {
        // Find matching user from recent users
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
        headers: { 'admin-token': 'admin-secret-token' }
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
        headers: { 'admin-token': 'admin-secret-token' }
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
      headers: { 'admin-token': 'admin-secret-token' }
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
      
      // Log each category with its image
      data.services.forEach((service, index) => {
        console.log(`Category ${index + 1}:`, {
          name: service.name,
          img: service.img,
          hasImg: !!service.img,
          fullUrl: `http://localhost:5000${service.img}`
        });
      });
      
      // Ensure each service has proper img field
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
        headers: { 'admin-token': 'admin-secret-token' }
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
      headers: { 'admin-token': 'admin-secret-token' }
    });
    const data = await response.json();
    if (data.success) {
      // Get user emails from bookings
      const userEmails = data.bookings.map(b => b.userEmail);
      
      // Fetch user profile images
      const usersResponse = await fetch(`http://localhost:5000/api/admin/users-by-emails`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'admin-token': 'admin-secret-token'
        },
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
      headers: { 
        'Content-Type': 'application/json',
        'admin-token': 'admin-secret-token'
      },
      body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    if (data.success) {
      fetchCategories(); // Refresh the list
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
        headers: { 
          'Content-Type': 'application/json',
          'admin-token': 'admin-secret-token' 
        },
        body: JSON.stringify({ 
          entity: backendEntity, // Use backend entity name
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
                <FaFilePdf className="text-secondary" />
              </Button>
              <Button 
                style={{backgroundColor:"white",border:"1px solid #000000"}}
                onClick={() => downloadTableAsExcel(dataType)}
                title="Download as Excel"
              >
                <FaFileExcel className="text-secondary" />
              </Button>
              <Button 
                 style={{backgroundColor:"white",border:"1px solid #000000"}}
                onClick={() => downloadTableAsCSV(dataType)}
                title="Download as CSV"
              >
                <FaFileCsv className="text-secondary" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleMenuClick = (menu) => {
  setActiveMenu(menu);
  setIsEditingStaff(false);
  setEditStaffId(null);
  setIsEditingCategory(false); // Add this
  setEditCategoryId(null); // Add this
  
  // Reset form when switching away from add-staff
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
  }
  
  // Reset category edit state when not in add-category
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

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);
    
    if (!newStaff.name || !newStaff.email || !newStaff.phone || !newStaff.designation) {
      setFormError("Please fill all required fields");
      return;
    }
    
    try {
      const url = isEditingStaff 
        ? `http://localhost:5000/api/admin/staff/${editStaffId}`
        : 'http://localhost:5000/api/admin/staff';
      
      const method = isEditingStaff ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'admin-token': 'admin-secret-token'
        },
        body: JSON.stringify(newStaff)
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

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/admin/services', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'admin-token': 'admin-secret-token'
        },
        body: JSON.stringify(newCategory)
      });
      
      if (response.ok) {
        alert('Category added successfully!');
        setShowAddCategoryModal(false);
        setNewCategory({ name: '', description: '', icon: '', order: 0, isActive: true });
        fetchCategories();
      } else {
        alert('Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/admin/packages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'admin-token': 'admin-secret-token'
        },
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
          headers: { 'admin-token': 'admin-secret-token' }
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
          headers: { 'admin-token': 'admin-secret-token' }
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

  const deleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/services/${categoryId}`, {
          method: 'DELETE',
          headers: { 'admin-token': 'admin-secret-token' }
        });
        
        if (response.ok) {
          alert('Category deleted successfully');
          fetchCategories();
        } else {
          alert('Failed to delete category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category');
      }
    }
  };

  const deleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/packages/${productId}`, {
          method: 'DELETE',
          headers: { 'admin-token': 'admin-secret-token' }
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
        headers: { 
          'Content-Type': 'application/json',
          'admin-token': 'admin-secret-token'
        },
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
          headers: { 'admin-token': 'admin-secret-token' }
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
    fetchAdminLogo();
    if (isLoggedIn) {
      fetchDashboardData();
    }
  }, [isLoggedIn]);

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
                <div className=" mb-4">
                 <h6 className='fw-semibold'>Log in as a admin user</h6>
                 </div>
                
                <Form onSubmit={handleAdminLogin}>
                  <Form.Group className="mb-3">   
                    <Form.Control
                      type="email"
                      placeholder="username"
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
                      placeholder="password "
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
                  
                  <div className="text-center mt-4 pt-3" style={{ borderTop: "1px solid #eee" }}>
                    <p className="text-muted mb-2">
                      <small>
                        Default Admin Credentials
                      </small>
                    </p>
                    <div style={{ 
                      background: "#f8f9fa", 
                      padding: "10px", 
                      borderRadius: "6px",
                      fontSize: "14px"
                    }}>
                      <div className="mb-1">
                        <strong>Email:</strong> admin@urbancompany.com
                      </div>
                      <div>
                        <strong>Password:</strong> admin123
                      </div>
                    </div>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  const renderContent = () => {
    switch(activeMenu) {
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
  return (
    <div className="p-3">
      <Card className="shadow-lg p-3">
        <Card.Body>
          <h5 className="mb-0 fw-semibold">
            {isEditingStaff ? 'Edit Staff' : (
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
      
      <Card className="shadow-lg p-3">
        <Card.Body className="">
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
            {isEditingStaff ? 'Edit Staff' : (
              <>
                <h6 className="fw-semibold mb-1">New user </h6>
                <p className='text-muted' style={{fontSize:"12px"}}>Use the below form to update the profile</p>
              </>
            )}
          </div>
          
          <Form onSubmit={handleAddStaff} className="pt-2">
           
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="mb-1 fw-medium">Name</Form.Label>
                      <Form.Control
                        type="text" 
                        style={{border:"2px solid",height:"50px"}}
                        value={newStaff.name}
                        onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                        required
                        placeholder="Enter full name"
                        autoComplete="name"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} >
                    <Form.Group className="mb-3">
                      <Form.Label className="mb-1 fw-medium">E-mail</Form.Label>
                      <Form.Control
                        type="email" 
                        style={{border:"2px solid",height:"50px"}}
                        value={newStaff.email}
                        onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                        required
                        placeholder="Enter email address"
                        autoComplete="email"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="mb-1 fw-medium">Contact Number</Form.Label>
                      <Form.Control
                        type="tel" 
                        style={{border:"2px solid",height:"50px"}}
                        value={newStaff.phone}
                        onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                        required
                        placeholder="Enter phone number"
                        autoComplete="tel"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="mb-1 fw-medium">Designation</Form.Label>
                      <Form.Select
                        value={newStaff.designation} 
                        style={{border:"2px solid",height:"50px"}}
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
                
                {/* Only show password fields when not editing */}
                {!isEditingStaff && (
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="mb-1 fw-medium">Password</Form.Label>
                        <Form.Control
                          type="password"
                          value={newStaff.password} 
                          onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                          placeholder="Enter password"
                          className="font-monospace"
                          style={{ letterSpacing: '1px',border:"2px solid",height:"50px" }}
                          autoComplete="new-password"
                          required={!isEditingStaff}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="mb-1 fw-medium">Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          value={confirmPassword} 
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          className="font-monospace"
                          style={{ letterSpacing: '1px',border:"2px solid",height:"50px" }}
                          autoComplete="new-password"
                          required={!isEditingStaff}
                        />
                        {confirmPassword && newStaff.password !== confirmPassword && (
                          <small className="text-danger">Passwords do not match</small>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                )}
                
                <Form.Group className="mb-4">
                  <Form.Label className='fw-semibold mb-3'>Permissions</Form.Label>
                  <div className="px-1">
                    <Row>
                      {Object.keys(newStaff.permissions || {}).map((permission) => (
                        <Col xs={6} sm={4} md={3} lg={2} key={permission}>
                          <div 
                            className="d-flex align-items-center mb-2 p-2 rounded"
                            style={{
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onClick={() => setNewStaff({
                              ...newStaff,
                              permissions: {
                                ...newStaff.permissions,
                                [permission]: !newStaff.permissions[permission]
                              }
                            })}
                          >
                            <div className="flex-grow-1">
                              <Form.Check
                                type="checkbox"
                                id={`permission-${permission}`}
                                label={permission.charAt(0).toUpperCase() + permission.slice(1)}
                                checked={newStaff.permissions[permission]}
                                onChange={(e) => setNewStaff({
                                  ...newStaff,
                                  permissions: {
                                    ...newStaff.permissions,
                                    [permission]: e.target.checked
                                  }
                                })}
                                className="mb-0"
                              />
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                    
                    {/* Summary of selected permissions */}
                    {Object.values(newStaff.permissions).filter(v => v).length > 0 && (
                      <div className="mt-3 pt-3 border-top">
                        <small className="text-muted d-block mb-2">Selected Permissions:</small>
                        <div>
                          {Object.entries(newStaff.permissions)
                            .filter(([key, value]) => value)
                            .map(([permission], index, arr) => (
                              <span key={permission}>
                                {permission.charAt(0).toUpperCase() + permission.slice(1)}
                                {index < arr.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                        </div>
                        <small className="text-muted mt-2 d-block">
                          {Object.values(newStaff.permissions).filter(v => v).length} permission(s) selected
                        </small>
                      </div>
                    )}
                  </div>
                </Form.Group>
                
                <div className="d-flex justify-content-end gap-2 mt-4">
                 <div className="d-flex justify-content-center gap-3 mt-4">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    // Go back to previous page (manage-staff)
                    handleMenuClick('manage-staff');
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
                    if (isEditingStaff) {
                      setEditStaffId(null);
                      setIsEditingStaff(false);
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button variant={isEditingStaff ? "warning" : "dark"} type="submit">
                  <i className={`bi ${isEditingStaff ? 'bi-pencil' : 'bi-person-plus'} me-2`}></i>
                  Submit
                </Button>
              </div>
                </div>
             
          </Form>
        </Card.Body>
      </Card>
    </div>
  );

      case 'manage-staff':
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
                  placeholder="Search staff..."
                  value={staffSearch}
                  onChange={(e) => {
                    setStaffSearch(e.target.value);
                    fetchStaff(1, e.target.value, staffPerPage);
                  }}
                  style={{ width: '250px', height: "40px", marginTop: "10px" }}
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
                <Alert variant="info" className="d-flex justify-content-between align-items-center">
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
          </Card></div>
        );
      case 'manage-users':
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
                              onClick={() => deleteStaff(staffMember._id)}
                              title="Delete Staff"
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
            headers: { 'admin-token': 'admin-secret-token' },
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
                              onClick={() => deleteStaff(staffMember._id)}
                              title="Delete Staff"
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
      {sidebarOpen && (
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
            <small className="text-muted">Admin Panel</small>
          </div>

          <Nav className="flex-column px-3">
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
                <Dropdown.Item onClick={() => handleMenuClick('add-staff')}>
                  <i className="bi bi-person-plus me-2"></i>Add user
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleMenuClick('manage-staff')}>
                  <i className="bi bi-people-fill me-2"></i>Manage user
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
           
            
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
                <Dropdown.Item onClick={() => handleMenuClick('add-category')}>
                  <i className="bi bi-folder-plus me-2"></i>Add Category
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleMenuClick('manage-categories')}>
                  <i className="bi bi-folder-fill me-2"></i>Manage Categories
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
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
                <Dropdown.Item onClick={() => handleMenuClick('add-product')}>
                  <i className="bi bi-plus-circle me-2"></i>Add Product
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleMenuClick('manage-products')}>
                  <i className="bi bi-box-seam me-2"></i>Manage Products
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
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
            
             <Dropdown className="mb-2">
              <Dropdown.Toggle 
                as={Nav.Link} 
                style={{ 
                  color: ['manage-users'].includes(activeMenu) ? '#000' : 'white',
                  background: [ 'manage-users'].includes(activeMenu) ? 'white' : 'transparent',
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
          </Nav>
          
        </div>
      )}

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
            <Navbar.Brand className="fw-bold">Urban Company Admin</Navbar.Brand>
            
            <Navbar.Toggle aria-controls="navbar-nav" />
            <Navbar.Collapse id="navbar-nav" className="justify-content-end">
              <Nav className="align-items-center">
                <Dropdown>
                  <Dropdown.Toggle variant="light" className="d-flex align-items-center">
                    <span className="d-none d-md-inline">Admin User</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end">
                    <Dropdown.Item>
                      <i className="bi bi-person me-2"></i>Profile
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <i className="bi bi-gear me-2"></i>Settings
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => {
                      localStorage.removeItem('adminToken');
                      setIsLoggedIn(false);
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
        
        <Modal show={showStaffDetails} onHide={() => setShowStaffDetails(false)} size="lg">
            <Modal.Header className='closebtn' closeButton>
              
            </Modal.Header>
            <Modal.Body>
              {selectedStaffDetails && (
                <div>
                  <Row className="mb-4">
                    <Col md={9}>
                      <h4>{selectedStaffDetails.name}</h4>
                      <p className="text-muted mb-1">
                        <i className="bi bi-envelope me-2"></i>
                        {selectedStaffDetails.email}
                      </p>
                      <p className="text-muted mb-1">
                        <i className="bi bi-telephone me-2"></i>
                        {selectedStaffDetails.phone}
                      </p>
                      <p className="text-muted mb-0">
                        <i className="bi bi-briefcase me-2"></i>
                        {selectedStaffDetails.designation}
                      </p>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Card className="mb-3">
                        <Card.Body>
                          <h6 className="mb-3">Contact Information</h6>
                          <div className="mb-2">
                            <strong>Email:</strong>
                            <p className="text-muted mb-0">{selectedStaffDetails.email}</p>
                          </div>
                          <div className="mb-2">
                            <strong>Phone:</strong>
                            <p className="text-muted mb-0">{selectedStaffDetails.phone}</p>
                          </div>
                          <div>
                            <strong>Designation:</strong>
                            <p className="text-muted mb-0">{selectedStaffDetails.designation}</p>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="mb-3">
                        <Card.Body>
                          <h6 className="mb-3">Account Information</h6>
                          <div className="mb-2">
                            <strong>Account Created:</strong>
                            <p className="text-muted mb-0">
                              {selectedStaffDetails.createdAt ? new Date(selectedStaffDetails.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div className="mb-2">
                            <strong>Last Updated:</strong>
                            <p className="text-muted mb-0">
                              {selectedStaffDetails.updatedAt ? new Date(selectedStaffDetails.updatedAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <strong>Password:</strong>
                            <p className="text-muted mb-0" style={{ letterSpacing: '2px', fontFamily: 'monospace' }}>
                              {displayPassword()}
                            </p>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <Card>
                    <Card.Body>
                      <h6 className="mb-3">Permissions</h6>
                      <Row>
                        {selectedStaffDetails.permissions && Object.entries(selectedStaffDetails.permissions).map(([permission, hasPermission]) => (
                          <Col md={4} key={permission}>
                            <div className="d-flex align-items-center mb-2">
                              <Badge 
                                bg={hasPermission ? "success" : "secondary"} 
                                className="me-2"
                                style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                {hasPermission ? '✓' : '✗'}
                              </Badge>
                              <span>{permission.charAt(0).toUpperCase() + permission.slice(1)}</span>
                            </div>
                          </Col>
                        ))}
                      </Row>
                      <div className="mt-3 pt-3 border-top">
                        <small className="text-muted">
                          Total permissions granted: {Object.values(selectedStaffDetails.permissions || {}).filter(v => v).length} out of {Object.keys(selectedStaffDetails.permissions || {}).length}
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowStaffDetails(false)}>
                Close
              </Button>
              <Button variant="warning" onClick={() => {
                setShowStaffDetails(false);
                handleEditStaff(selectedStaffDetails);
              }}>
                <i className="bi bi-pencil me-2"></i>Edit Staff
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