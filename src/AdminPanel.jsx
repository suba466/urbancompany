// AdminPanel.jsx - Updated with New Menu Structure
import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Form, Button, 
  Spinner, Modal, Nav, Navbar, Badge,
  Dropdown, Pagination, InputGroup, Alert
} from 'react-bootstrap';
import { MdOutlineNoteAlt } from "react-icons/md";import { SiCashapp } from "react-icons/si";
import { 
  FaUserSecret, 
  FaCut, 
  FaSnowflake, 
  FaBroom, 
  FaWrench, 
  FaTools,
  FaClipboardList,
  FaRupeeSign
} from "react-icons/fa";
function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [adminLogo, setAdminLogo] = useState('/assets/Uc.png');
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Dashboard States
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  
  // Staff Management States
  const [staff, setStaff] = useState([]);
  const [staffSearch, setStaffSearch] = useState('');
  const [staffPage, setStaffPage] = useState(1);
  const [staffTotalPages, setStaffTotalPages] = useState(1);
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    profileImage: null,
    permissions: {
      dashboard: false,
      bookings: false,
      staff: false,
      category: false,products:false,
      reports: false,
      settings: false
    },
    isActive: true
  });
  
  // Form feedback
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  
  // Edit Staff States
  const [editStaffModal, setEditStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [editStaffData, setEditStaffData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    profileImage: '',
    permissions: {
      dashboard: false,
      bookings: false,
      staff: false,
      category: false,product:false,
      reports: false,
      settings: false
    },
    isActive: true
  });
  const [editProfileImageFile, setEditProfileImageFile] = useState(null);
  const [editProfileImagePreview, setEditProfileImagePreview] = useState('');
  
  // User Management States
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    password: '',
    profileImage: null,
    isActive: true
  });
    // Category Management States
  const [categories, setCategories] = useState([
    { _id: '1', name: 'Salon for Women', description: 'Beauty services', icon: 'FaCut', order: 1, isActive: true },
    { _id: '2', name: 'AC Repair', description: 'Appliance services', icon: 'FaSnowflake', order: 2, isActive: true },
    { _id: '3', name: 'Cleaning', description: 'Home cleaning', icon: 'FaBroom', order: 3, isActive: true },
    { _id: '4', name: 'Plumbing', description: 'Plumber services', icon: 'FaWrench', order: 4, isActive: true },
    { _id: '5', name: 'Electrician', description: 'Electrical services', icon: 'FaTools', order: 5, isActive: true }
  ]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: 'FaCut',
    order: 0,
    isActive: true
  });
  
  // Product Management States
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
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
  const [productImage, setProductImage] = useState(null);
  
  // Bookings Management States
  const [bookings, setBookings] = useState([]);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingTotalPages, setBookingTotalPages] = useState(1);
  
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
        setRecentBookings(data.recentBookings || []);
        setRecentUsers(data.recentUsers || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchStaff = async (page = 1, search = '') => {
    try {
      let url = `http://localhost:5000/api/admin/staff?page=${page}&limit=10&search=${search}`;
      
      const response = await fetch(url, {
        headers: { 'admin-token': 'admin-secret-token' }
      });
      const data = await response.json();
      if (data.success) {
        setStaff(data.staff || []);
        setStaffTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchUsers = async (page = 1, search = '') => {
    try {
      let url = `http://localhost:5000/api/admin/users?page=${page}&limit=10&search=${search}`;
      
      const response = await fetch(url, {
        headers: { 'admin-token': 'admin-secret-token' }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
        setUserTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const mockCategories = [
        { _id: '1', name: 'Salon for Women', description: 'Beauty services', icon: '✂️', order: 1, isActive: true },
        { _id: '2', name: 'AC Repair', description: 'Appliance services', icon: '❄️', order: 2, isActive: true },
        { _id: '3', name: 'Cleaning', description: 'Home cleaning', icon: '🧹', order: 3, isActive: true },
        { _id: '4', name: 'Plumbing', description: 'Plumber services', icon: '🔧', order: 4, isActive: true },
        { _id: '5', name: 'Electrician', description: 'Electrical services', icon: '💡', order: 5, isActive: true }
      ];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const mockProducts = [
        { _id: '1', name: 'Hair Shampoo', description: 'Premium hair care shampoo', category: 'Salon', price: '₹299', discountPrice: '₹249', stock: 50, isActive: true },
        { _id: '2', name: 'Cleaning Solution', description: 'Multi-surface cleaner', category: 'Cleaning', price: '₹199', discountPrice: '₹149', stock: 100, isActive: true },
        { _id: '3', name: 'Tool Kit', description: 'Professional repair tools', category: 'Repair', price: '₹1299', discountPrice: '₹999', stock: 20, isActive: true }
      ];
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchBookings = async (page = 1, search = '', status = '') => {
    try {
      let url = `http://localhost:5000/api/admin/bookings?page=${page}&limit=10&search=${search}`;
      if (status) url += `&status=${status}`;
      
      const response = await fetch(url, {
        headers: { 'admin-token': 'admin-secret-token' }
      });
      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings || []);
        setBookingTotalPages(data.pagination?.pages || 1);
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

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
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
      case 'add-user':
        setShowAddUserModal(true);
        fetchUsers();
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
        // Load settings if needed
        break;
      default:
        break;
    }
  };

  // Staff Management Functions
  const handleAddStaff = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);
    
    if (!newStaff.name || !newStaff.email || !newStaff.phone || !newStaff.designation) {
      setFormError("Please fill all required fields");
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('name', newStaff.name);
      formData.append('email', newStaff.email);
      formData.append('phone', newStaff.phone);
      formData.append('designation', newStaff.designation);
      formData.append('permissions', JSON.stringify(newStaff.permissions));
      formData.append('isActive', newStaff.isActive);
      
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }

      const response = await fetch('http://localhost:5000/api/admin/staff', {
        method: 'POST',
        headers: { 
          'admin-token': 'admin-secret-token'
        },
        body: formData
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
          profileImage: null,
          permissions: {
            dashboard: false,
            bookings: false,
            staff: false,
            services: false,
            packages: false,
            categories: false,
            offers: false,
            reports: false,
            settings: false
          },
          isActive: true
        });
        setProfileImageFile(null);
        setProfileImagePreview('');
        
        // Refresh staff list
        setTimeout(() => {
          fetchStaff();
        }, 500);
        
        setTimeout(() => {
          setFormSuccess(false);
        }, 5000);
        
      } else {
        setFormError(data.error || 'Failed to add staff member');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      setFormError('Failed to add staff member. Please try again.');
    }
  };

  // User Management Functions
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', newUser.name);
      formData.append('email', newUser.email);
      formData.append('phone', newUser.phone);
      formData.append('city', newUser.city);
      formData.append('password', newUser.password);

      const response = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: { 'admin-token': 'admin-secret-token' },
        body: formData
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
          password: '',
          profileImage: null,
          isActive: true
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

  // Category Functions
  const handleAddCategory = async (e) => {
    e.preventDefault();
    alert('Category added successfully!');
    setShowAddCategoryModal(false);
    setNewCategory({ name: '', description: '', icon: '', order: 0, isActive: true });
    fetchCategories();
  };

  // Product Functions
  const handleAddProduct = async (e) => {
    e.preventDefault();
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
  };

  // Settings Functions
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
          fetchStaff();
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
      alert('User deleted successfully!');
      fetchUsers();
    }
  };

  const deleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      alert('Category deleted successfully!');
      fetchCategories();
    }
  };

  const deleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      alert('Product deleted successfully!');
      fetchProducts();
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

  // Open Edit Staff Modal
  const openEditStaff = (staffMember) => {
    setEditingStaff(staffMember);
    setEditStaffData({
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      designation: staffMember.designation,
      profileImage: staffMember.profileImage || '',
      permissions: staffMember.permissions || {
        dashboard: false,
        bookings: false,
        staff: false,
        services: false,
        packages: false,
        categories: false,
        offers: false,
        reports: false,
        settings: false
      },
      isActive: staffMember.isActive
    });
    setEditProfileImagePreview('');
    setEditProfileImageFile(null);
    setEditStaffModal(true);
  };

  // Handle Edit Profile Image Change
  const handleEditProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Edit Staff Submit
  const handleEditStaffSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);
    
    try {
      const formData = new FormData();
      formData.append('name', editStaffData.name);
      formData.append('email', editStaffData.email);
      formData.append('phone', editStaffData.phone);
      formData.append('designation', editStaffData.designation);
      formData.append('permissions', JSON.stringify(editStaffData.permissions));
      formData.append('isActive', editStaffData.isActive);
      
      if (editProfileImageFile) {
        formData.append('profileImage', editProfileImageFile);
      }

      const response = await fetch(`http://localhost:5000/api/admin/staff/${editingStaff._id}`, {
        method: 'PUT',
        headers: { 
          'admin-token': 'admin-secret-token'
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFormSuccess(true);
        setEditStaffModal(false);
        
        // Refresh staff list
        fetchStaff(staffPage, staffSearch);
        
        setTimeout(() => {
          setFormSuccess(false);
        }, 3000);
      } else {
        setFormError(data.error || 'Failed to update staff member');
      }
    } catch (error) {
      console.error('Error updating staff:', error);
      setFormError('Failed to update staff member. Please try again.');
    }
  };

  const viewStaffPermissions = (staffMember) => {
    const permissions = staffMember.permissions || {};
    const permissionList = Object.entries(permissions)
      .filter(([key, value]) => value)
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
      .join(', ');
    
    alert(`Permissions for ${staffMember.name}:\n${permissionList || 'No permissions'}`);
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
        fetchBookings(bookingPage, bookingSearch, bookingStatus);
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
          fetchBookings(bookingPage, bookingSearch, bookingStatus);
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
      <Container className='d-flex justify-content-center align-items-center' style={{ marginTop: "150px"}}>
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
                    padding: "20px",marginTop:"0px"
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
                        <span style={{  fontSize: "30px" }}><FaUserSecret /></span>
                      </div>
                    </div>
                    <h5 className="text-muted mb-2">Total Users</h5>
                    <h2 className="mb-0" >{stats?.totalUsers || 0}</h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-0 shadow-sm">
                  <Card.Body className="py-4">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <div>
                        <span style={{  fontSize: "30px" }}><MdOutlineNoteAlt /></span>
                      </div>
                    </div>
                    <h5 className="text-muted mb-2">Total Bookings</h5>
                    <h2 className="mb-0" >{stats?.totalBookings || 0}</h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-0 shadow-sm">
                  <Card.Body className="py-4">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <div >
                        <span style={{  fontSize: "30px" }}><SiCashapp /></span>
                      </div>
                    </div>
                    <h5 className="text-muted mb-2">Total Revenue</h5>
                    <h2 className="mb-0" >₹{stats?.totalRevenue?.toLocaleString() || 0}</h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-0 shadow-sm">
                  <Card.Body className="py-4">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <div className="rounded-circle p-3" style={{ background: "rgba(237, 100, 166, 0.1)" }}>
                        <span style={{ color: "#ed64a6", fontSize: "24px" }}>🔧</span>
                      </div>
                    </div>
                    <h5 className="text-muted mb-2">Active Services</h5>
                    <h2 className="mb-0" style={{ color: "#ed64a6" }}>{stats?.totalServices || 0}</h2>
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
                      <Table hover responsive>
                        <thead>
                          <tr>
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
                                <div className="d-flex align-items-center">
                                  <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3" 
                                       style={{ width: "40px", height: "40px" }}>
                                    {booking.userName?.charAt(0) || 'C'}
                                  </div>
                                  <div>
                                    <strong>{booking.userName}</strong><br/>
                                    <small className="text-muted">{booking.userEmail}</small>
                                  </div>
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
                        <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3" 
                             style={{ width: "40px", height: "40px" }}>
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <strong>{user.name}</strong><br/>
                          <small className="text-muted">{user.email}</small>
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
          <Card className="border-0 shadow-sm">
            <Card.Header className="border-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Add New Staff</h5>
                <p className="text-muted mb-0">Add new staff members to the system</p>
              </div>
              <div className="d-flex gap-2">
                <Button 
                  variant="secondary" 
                  onClick={() => handleMenuClick('manage-staff')}
                >
                  <i className="bi bi-arrow-left me-2"></i>View All Staff
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {formSuccess && (
                <Alert variant="success" onClose={() => setFormSuccess(false)} dismissible>
                  <Alert.Heading>Success!</Alert.Heading>
                  <p>Staff member has been added successfully.</p>
                </Alert>
              )}
              
              {formError && (
                <Alert variant="danger" onClose={() => setFormError('')} dismissible>
                  <Alert.Heading>Error!</Alert.Heading>
                  <p>{formError}</p>
                </Alert>
              )}
              
              <Form onSubmit={handleAddStaff}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name *</Form.Label>
                      <Form.Control
                        type="text"
                        value={newStaff.name}
                        onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                        required
                        placeholder="Enter full name"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        value={newStaff.email}
                        onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                        required
                        placeholder="Enter email address"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone *</Form.Label>
                      <Form.Control
                        type="tel"
                        value={newStaff.phone}
                        onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                        required
                        placeholder="Enter phone number"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Designation *</Form.Label>
                      <Form.Select
                        value={newStaff.designation}
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
                
                <Form.Group className="mb-3">
                  <Form.Label>Profile Picture</Form.Label>
                  <div className="d-flex align-items-center gap-3">
                    <div style={{ 
                      width: '100px', 
                      height: '100px', 
                      borderRadius: '50%', 
                      overflow: 'hidden',
                      border: '2px solid #dee2e6'
                    }}>
                      {profileImagePreview ? (
                        <img 
                          src={profileImagePreview} 
                          alt="Profile Preview" 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div className="bg-light w-100 h-100 d-flex flex-column align-items-center justify-content-center">
                          <i className="bi bi-person" style={{ fontSize: '30px', color: '#6c757d' }}></i>
                          <small className="text-muted mt-1">No image selected</small>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setProfileImageFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfileImagePreview(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="mb-2"
                      />
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => {
                            setProfileImagePreview('');
                            setProfileImageFile(null);
                          }}
                          disabled={!profileImagePreview}
                        >
                          <i className="bi bi-x-circle me-1"></i> Remove
                        </Button>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => document.querySelector('input[type="file"]').click()}
                        >
                          <i className="bi bi-upload me-1"></i> Browse
                        </Button>
                      </div>
                      <Form.Text className="text-muted">
                        Optional. If no image is selected, initials will be shown instead.
                      </Form.Text>
                    </div>
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Permissions</Form.Label>
                  <div className="border p-3 rounded">
                    <Row>
                      {Object.keys(newStaff.permissions || {}).map((permission) => (
                        <Col md={4} key={permission}>
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
                            className="mb-2"
                          />
                        </Col>
                      ))}
                    </Row>
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Check
                    type="checkbox"
                    label="Active Staff Member"
                    checked={newStaff.isActive}
                    onChange={(e) => setNewStaff({...newStaff, isActive: e.target.checked})}
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-end gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      setNewStaff({
                        name: '',
                        email: '',
                        phone: '',
                        designation: '',
                        profileImage: null,
                        permissions: {
                          dashboard: false,
                          bookings: false,
                          staff: false,
                          services: false,
                          packages: false,
                          categories: false,
                          offers: false,
                          reports: false,
                          settings: false
                        },
                        isActive: true
                      });
                      setProfileImagePreview('');
                      setProfileImageFile(null);
                    }}
                  >
                    Clear Form
                  </Button>
                  <Button variant="primary" type="submit">
                    <i className="bi bi-person-plus me-2"></i>Add Staff
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        );

      case 'manage-staff':
        return (
          <Card className="border-0 shadow-sm">
            <Card.Header className="border-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Manage Staff</h5>
                <p className="text-muted mb-0">View and manage all staff members</p>
              </div>
              <div className="d-flex gap-2">
                <Form.Control
                  type="search"
                  placeholder="Search staff..."
                  value={staffSearch}
                  onChange={(e) => {
                    setStaffSearch(e.target.value);
                    fetchStaff(1, e.target.value);
                  }}
                  style={{ width: '250px' }}
                />
                <Button 
                  variant="primary"
                  onClick={() => handleMenuClick('add-staff')}
                >
                  <i className="bi bi-person-plus me-2"></i>Add New Staff
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {formSuccess && (
                <Alert variant="success" onClose={() => setFormSuccess(false)} dismissible>
                  <Alert.Heading>Success!</Alert.Heading>
                  <p>Staff member updated successfully!</p>
                </Alert>
              )}
              
              <div className="table-responsive">
                <Table hover responsive style={{ minWidth: '800px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>ID</th>
                      <th style={{ width: '80px' }}>Profile</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th style={{ width: '120px' }}>Designation</th>
                      <th style={{ width: '100px' }}>Status</th>
                      <th style={{ width: '80px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((staffMember) => (
                      <tr key={staffMember._id}>
                        <td><small className="text-muted">{staffMember._id?.substring(0, 8)}...</small></td>
                        <td>
                          <div style={{ 
                            width: '50px', 
                            height: '50px', 
                            borderRadius: '50%', 
                            overflow: 'hidden',
                            border: '2px solid #dee2e6'
                          }}>
                            {staffMember.profileImage && staffMember.profileImage !== '' ? (
                              <img 
                                src={`http://localhost:5000${staffMember.profileImage}`} 
                                alt={staffMember.name}
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  // Fallback to initials
                                  e.target.style.display = 'none';
                                  const parent = e.target.parentElement;
                                  const initials = getInitials(staffMember.name);
                                  parent.innerHTML = `
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
                                      ${initials}
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
                                {getInitials(staffMember.name)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{staffMember.name}</strong>
                          </div>
                        </td>
                        <td>
                          <div className="text-truncate" style={{ maxWidth: '200px' }}>
                            {staffMember.email}
                          </div>
                        </td>
                        <td>{staffMember.phone}</td>
                        <td>
                          <Badge bg={
                            staffMember.designation === 'Manager' ? 'primary' :
                            staffMember.designation === 'Supervisor' ? 'info' :
                            staffMember.designation === 'Technician' ? 'warning' :
                            staffMember.designation === 'Admin' ? 'danger' : 'secondary'
                          }>
                            {staffMember.designation}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={staffMember.isActive ? 'success' : 'secondary'}>
                            {staffMember.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <Dropdown>
                            <Dropdown.Toggle variant="light" size="sm">
                              <i className="bi bi-three-dots"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => openEditStaff(staffMember)}>
                                <i className="bi bi-pencil me-2"></i>Edit
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => viewStaffPermissions(staffMember)}>
                                <i className="bi bi-shield-check me-2"></i>View Permissions
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item className="text-danger" onClick={() => deleteStaff(staffMember._id)}>
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
              <div className="d-flex justify-content-center mt-3">
                <Pagination>
                  <Pagination.Prev 
                    onClick={() => staffPage > 1 && fetchStaff(staffPage - 1, staffSearch)} 
                    disabled={staffPage === 1}
                  />
                  {[...Array(staffTotalPages)].map((_, i) => (
                    <Pagination.Item 
                      key={i + 1} 
                      active={i + 1 === staffPage}
                      onClick={() => fetchStaff(i + 1, staffSearch)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next 
                    onClick={() => staffPage < staffTotalPages && fetchStaff(staffPage + 1, staffSearch)} 
                    disabled={staffPage === staffTotalPages}
                  />
                </Pagination>
              </div>
            </Card.Body>
          </Card>
        );

      case 'add-user':
        return (
          <Card className="border-0 shadow-sm">
            <Card.Header className="border-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Add New User</h5>
                <p className="text-muted mb-0">Register a new user account</p>
              </div>
              <div className="d-flex gap-2">
                <Button 
                  variant="secondary" 
                  onClick={() => handleMenuClick('manage-users')}
                >
                  <i className="bi bi-arrow-left me-2"></i>View All Users
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleAddUser}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name *</Form.Label>
                      <Form.Control
                        type="text"
                        value={newUser.name}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        required
                        placeholder="Enter full name"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        required
                        placeholder="Enter email address"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone *</Form.Label>
                      <Form.Control
                        type="tel"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                        required
                        placeholder="Enter phone number"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
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
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Password *</Form.Label>
                      <Form.Control
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        required
                        placeholder="Enter password"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex justify-content-end gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      setNewUser({
                        name: '',
                        email: '',
                        phone: '',
                        city: '',
                        password: '',
                        profileImage: null,
                        isActive: true
                      });
                    }}
                  >
                    Clear Form
                  </Button>
                  <Button variant="primary" type="submit">
                    <i className="bi bi-person-plus me-2"></i>Add User
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
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
                    fetchUsers(1, e.target.value);
                  }}
                  style={{ width: '250px' }}
                />
                <Button 
                  variant="primary"
                  onClick={() => handleMenuClick('add-user')}
                >
                  <i className="bi bi-person-plus me-2"></i>Add New User
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Profile</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>City</th>
                      <th>Joined Date</th>
                      <th style={{ width: '100px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
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
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Dropdown>
                            <Dropdown.Toggle variant="light" size="sm">
                              <i className="bi bi-three-dots"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item>
                                <i className="bi bi-pencil me-2"></i>Edit
                              </Dropdown.Item>
                              <Dropdown.Item>
                                <i className="bi bi-eye me-2"></i>View Details
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item className="text-danger" onClick={() => deleteUser(user._id)}>
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
              <div className="d-flex justify-content-center mt-3">
                <Pagination>
                  <Pagination.Prev 
                    onClick={() => userPage > 1 && fetchUsers(userPage - 1, userSearch)} 
                    disabled={userPage === 1}
                  />
                  {[...Array(userTotalPages)].map((_, i) => (
                    <Pagination.Item 
                      key={i + 1} 
                      active={i + 1 === userPage}
                      onClick={() => fetchUsers(i + 1, userSearch)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next 
                    onClick={() => userPage < userTotalPages && fetchUsers(userPage + 1, userSearch)} 
                    disabled={userPage === userTotalPages}
                  />
                </Pagination>
              </div>
            </Card.Body>
          </Card>
        );

      case 'add-category':
        return (
          <Card className="border-0 shadow-sm">
            <Card.Header className="border-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Add New Category</h5>
                <p className="text-muted mb-0">Create a new service category</p>
              </div>
              <div className="d-flex gap-2">
                <Button 
                  variant="secondary" 
                  onClick={() => handleMenuClick('manage-categories')}
                >
                  <i className="bi bi-arrow-left me-2"></i>View All Categories
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleAddCategory}>
                <Form.Group className="mb-3">
                  <Form.Label>Category Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    required
                    placeholder="Enter category name"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    placeholder="Enter category description"
                  />
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Icon</Form.Label>
                      <Form.Control
                        type="text"
                        value={newCategory.icon}
                        onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                        placeholder="e.g., ✂️, 🔧, 🧹"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Display Order</Form.Label>
                      <Form.Control
                        type="number"
                        value={newCategory.order}
                        onChange={(e) => setNewCategory({...newCategory, order: parseInt(e.target.value)})}
                        placeholder="0"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Active Category"
                    checked={newCategory.isActive}
                    onChange={(e) => setNewCategory({...newCategory, isActive: e.target.checked})}
                  />
                </Form.Group>
                <div className="d-flex justify-content-end gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      setNewCategory({ name: '', description: '', icon: '', order: 0, isActive: true });
                    }}
                  >
                    Clear Form
                  </Button>
                  <Button variant="primary" type="submit">
                    Add Category
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        );

      case 'manage-categories':
        return (
          <Card className="border-0 shadow-sm">
            <Card.Header className="border-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Manage Categories</h5>
                <p className="text-muted mb-0">View and manage all service categories</p>
              </div>
              <div className="d-flex gap-2">
                <Form.Control
                  type="search"
                  placeholder="Search categories..."
                  style={{ width: '250px' }}
                />
                <Button 
                  variant="primary"
                  onClick={() => handleMenuClick('add-category')}
                >
                  <i className="bi bi-plus-circle me-2"></i>Add New Category
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Icon</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th style={{ width: '80px' }}>Order</th>
                      <th style={{ width: '100px' }}>Status</th>
                      <th style={{ width: '100px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category._id}>
                        <td style={{ fontSize: '24px' }}>{category.icon}</td>
                        <td><strong>{category.name}</strong></td>
                        <td>{category.description}</td>
                        <td>{category.order}</td>
                        <td>
                          <Badge bg={category.isActive ? 'success' : 'secondary'}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <Dropdown>
                            <Dropdown.Toggle variant="light" size="sm">
                              <i className="bi bi-three-dots"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item><i className="bi bi-pencil me-2"></i>Edit</Dropdown.Item>
                              <Dropdown.Item><i className="bi bi-eye me-2"></i>View Services</Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item className="text-danger" onClick={() => deleteCategory(category._id)}>
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
                  <Form.Label>Product Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProductImage(e.target.files[0])}
                  />
                  <Form.Text className="text-muted">
                    Recommended size: 800x600 px. Max 5MB.
                  </Form.Text>
                </Form.Group>
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
                      setProductImage(null);
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
              <div className="table-responsive">
                <Table hover responsive>
                  <thead>
                    <tr>
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
                          <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            overflow: 'hidden',
                            border: '1px solid #dee2e6'
                          }}>
                            <img 
                              src="/assets/default-product.png" 
                              alt={product.name}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover'
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{product.name}</strong>
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
                        <td>{product.stock}</td>
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
                              <Dropdown.Item><i className="bi bi-pencil me-2"></i>Edit</Dropdown.Item>
                              <Dropdown.Item><i className="bi bi-eye me-2"></i>View Details</Dropdown.Item>
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
                    fetchBookings(1, bookingSearch, e.target.value);
                  }}
                  style={{ width: '150px' }}
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
                  style={{ width: '250px' }}
                />
              </div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th style={{ width: '120px' }}>Booking ID</th>
                      <th style={{ width: '200px' }}>Customer</th>
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
                        <td><small className="text-muted">{booking._id?.substring(0, 8)}...</small></td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-2" 
                                 style={{ width: "30px", height: "30px" }}>
                              {booking.userName?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <strong>{booking.userName}</strong><br/>
                              <small className="text-muted">{booking.userEmail}</small>
                            </div>
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
                          <Dropdown>
                            <Dropdown.Toggle variant="light" size="sm">
                              <i className="bi bi-three-dots"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => updateBookingStatus(booking._id, 'Confirmed')}>
                                <i className="bi bi-check-circle me-2"></i>Confirm
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => updateBookingStatus(booking._id, 'Completed')}>
                                <i className="bi bi-check-all me-2"></i>Complete
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => updateBookingStatus(booking._id, 'Cancelled')}>
                                <i className="bi bi-x-circle me-2"></i>Cancel
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item>
                                <i className="bi bi-eye me-2"></i>View Details
                              </Dropdown.Item>
                              <Dropdown.Item className="text-danger" onClick={() => deleteBooking(booking._id)}>
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
              <div className="d-flex justify-content-center mt-3">
                <Pagination>
                  <Pagination.Prev 
                    onClick={() => bookingPage > 1 && fetchBookings(bookingPage - 1, bookingSearch, bookingStatus)} 
                    disabled={bookingPage === 1}
                  />
                  {[...Array(bookingTotalPages)].map((_, i) => (
                    <Pagination.Item 
                      key={i + 1} 
                      active={i + 1 === bookingPage}
                      onClick={() => fetchBookings(i + 1, bookingSearch, bookingStatus)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next 
                    onClick={() => bookingPage < bookingTotalPages && fetchBookings(bookingPage + 1, bookingSearch, bookingStatus)} 
                    disabled={bookingPage === bookingTotalPages}
                  />
                </Pagination>
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
                    <Dropdown.Item><i className="bi bi-file-earmark-excel me-2"></i>Export as Excel</Dropdown.Item>
                    <Dropdown.Item><i className="bi bi-file-earmark-pdf me-2"></i>Export as PDF</Dropdown.Item>
                    <Dropdown.Item><i className="bi bi-printer me-2"></i>Print Report</Dropdown.Item>
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
    <div className="d-flex" style={{ minHeight: '100vh', overflowX: 'hidden' }}>
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
            
            {/* Staff Management Dropdown */}
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
                  <i className="bi bi-people me-2"></i>Staff Management
                </span>
                <i className="bi bi-chevron-down ms-auto"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ width: '100%' }}>
                <Dropdown.Item onClick={() => handleMenuClick('add-staff')}>
                  <i className="bi bi-person-plus me-2"></i>Add Staff
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleMenuClick('manage-staff')}>
                  <i className="bi bi-people-fill me-2"></i>Manage Staff
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
            {/* User Management Dropdown */}
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
                  <i className="bi bi-person-badge me-2"></i>User Management
                </span>
                <i className="bi bi-chevron-down ms-auto"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ width: '100%' }}>
                <Dropdown.Item onClick={() => handleMenuClick('add-user')}>
                  <i className="bi bi-person-plus me-2"></i>Add User
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleMenuClick('manage-users')}>
                  <i className="bi bi-people-fill me-2"></i>Manage Users
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
            {/* Category Management Dropdown */}
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
            
            {/* Product Management Dropdown */}
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

        {/* Edit Staff Modal */}
        <Modal show={editStaffModal} onHide={() => setEditStaffModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Edit Staff Member</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {formError && (
              <Alert variant="danger" onClose={() => setFormError('')} dismissible>
                <Alert.Heading>Error!</Alert.Heading>
                <p>{formError}</p>
              </Alert>
            )}
            
            <Form onSubmit={handleEditStaffSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name *</Form.Label>
                    <Form.Control
                      type="text"
                      value={editStaffData.name}
                      onChange={(e) => setEditStaffData({...editStaffData, name: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      value={editStaffData.email}
                      onChange={(e) => setEditStaffData({...editStaffData, email: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone *</Form.Label>
                    <Form.Control
                      type="tel"
                      value={editStaffData.phone}
                      onChange={(e) => setEditStaffData({...editStaffData, phone: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Designation *</Form.Label>
                    <Form.Select
                      value={editStaffData.designation}
                      onChange={(e) => setEditStaffData({...editStaffData, designation: e.target.value})}
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
              
              <Form.Group className="mb-3">
                <Form.Label>Profile Picture</Form.Label>
                <div className="d-flex align-items-center gap-3">
                  <div style={{ 
                    width: '100px', 
                    height: '100px', 
                    borderRadius: '50%', 
                    overflow: 'hidden',
                    border: '2px solid #dee2e6'
                  }}>
                    {editProfileImagePreview ? (
                      <img 
                        src={editProfileImagePreview} 
                        alt="New Profile Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : editStaffData.profileImage && editStaffData.profileImage !== '' ? (
                      <img 
                        src={`http://localhost:5000${editStaffData.profileImage}`}
                        alt="Current Profile"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          // Show initials on error
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          const initials = getInitials(editStaffData.name);
                          parent.innerHTML = `
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
                              ${initials}
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
                        {getInitials(editStaffData.name)}
                      </div>
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleEditProfileImageChange}
                      className="mb-2"
                      id="edit-profile-image-input"
                    />
                    <div className="d-flex gap-2">
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => {
                          setEditProfileImagePreview('');
                          setEditProfileImageFile(null);
                        }}
                        disabled={!editProfileImagePreview}
                      >
                        <i className="bi bi-x-circle me-1"></i> Remove New
                      </Button>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => document.getElementById('edit-profile-image-input').click()}
                      >
                        <i className="bi bi-upload me-1"></i> Browse
                      </Button>
                    </div>
                    <Form.Text className="text-muted">
                      Leave empty to keep current image
                    </Form.Text>
                  </div>
                </div>
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Label>Permissions</Form.Label>
                <div className="border p-3 rounded">
                  <Row>
                    {Object.keys(editStaffData.permissions || {}).map((permission) => (
                      <Col md={4} key={permission}>
                        <Form.Check
                          type="checkbox"
                          id={`edit-permission-${permission}`}
                          label={permission.charAt(0).toUpperCase() + permission.slice(1)}
                          checked={editStaffData.permissions[permission]}
                          onChange={(e) => setEditStaffData({
                            ...editStaffData,
                            permissions: {
                              ...editStaffData.permissions,
                              [permission]: e.target.checked
                            }
                          })}
                          className="mb-2"
                        />
                      </Col>
                    ))}
                  </Row>
                </div>
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Check
                  type="checkbox"
                  label="Active Staff Member"
                  checked={editStaffData.isActive}
                  onChange={(e) => setEditStaffData({...editStaffData, isActive: e.target.checked})}
                />
              </Form.Group>
              
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setEditStaffModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  <i className="bi bi-save me-2"></i>Save Changes
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Add Category Modal */}
        <Modal show={showAddCategoryModal} onHide={() => setShowAddCategoryModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Category</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleAddCategory}>
              <Form.Group className="mb-3">
                <Form.Label>Category Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  required
                  placeholder="Enter category name"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  placeholder="Enter category description"
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Icon</Form.Label>
                    <Form.Control
                      type="text"
                      value={newCategory.icon}
                      onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                      placeholder="e.g., ✂️, 🔧, 🧹"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Display Order</Form.Label>
                    <Form.Control
                      type="number"
                      value={newCategory.order}
                      onChange={(e) => setNewCategory({...newCategory, order: parseInt(e.target.value)})}
                      placeholder="0"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Active Category"
                  checked={newCategory.isActive}
                  onChange={(e) => setNewCategory({...newCategory, isActive: e.target.checked})}
                />
              </Form.Group>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowAddCategoryModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Add Category
                </Button>
              </div>
            </Form>
          </Modal.Body>
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
                />
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