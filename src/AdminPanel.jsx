// AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Form, Button, 
  Spinner, Modal, Nav, Navbar, Badge,
  Dropdown, Pagination, Tabs, Tab, InputGroup
} from 'react-bootstrap';

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
    password: ''
  });
  
  // Category Management States
  const [categories, setCategories] = useState([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: '',
    order: 0,
    isActive: true
  });
  
  // Bookings Management States
  const [bookings, setBookings] = useState([]);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingTotalPages, setBookingTotalPages] = useState(1);
  
  // Services Management States
  const [services, setServices] = useState([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    isActive: true
  });
  const [serviceImage, setServiceImage] = useState(null);
  
  // Packages Management States
  const [packages, setPackages] = useState([]);
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [newPackage, setNewPackage] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    duration: '',
    category: '',
    items: [{ text: '', description: '' }]
  });
  
  // Offers Management States
  const [offers, setOffers] = useState([]);
  const [showAddOfferModal, setShowAddOfferModal] = useState(false);
  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    discount: '',
    validUntil: '',
    code: ''
  });
  
  // Reports States
  const [reports, setReports] = useState({
    dailyBookings: 0,
    monthlyRevenue: 0,
    userGrowth: 0,
    topCategories: []
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

  const fetchUsers = async (page = 1, search = '') => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users?page=${page}&limit=10&search=${search}`, {
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
      // This would need a categories endpoint in your backend
      // For now, let's create mock data
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

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/services?limit=100', {
        headers: { 'admin-token': 'admin-secret-token' }
      });
      const data = await response.json();
      if (data.success) {
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/packages?limit=100', {
        headers: { 'admin-token': 'admin-secret-token' }
      });
      const data = await response.json();
      if (data.success) {
        setPackages(data.packages || []);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchOffers = async () => {
    try {
      // Mock offers data - you would need to create an offers endpoint
      const mockOffers = [
        { _id: '1', title: 'Festival Special', description: '25% off on all services', discount: '25%', validUntil: '2024-12-31', code: 'FEST25' },
        { _id: '2', title: 'First Time User', description: 'Extra 20% off for new users', discount: '20%', validUntil: '2024-12-31', code: 'NEW20' },
        { _id: '3', title: 'Weekend Special', description: '15% off on weekends', discount: '15%', validUntil: '2024-12-31', code: 'WEEKEND15' }
      ];
      setOffers(mockOffers);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const fetchReports = async () => {
    try {
      // Mock reports data
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
      case 'users':
        fetchUsers();
        break;
      case 'categories':
        fetchCategories();
        break;
      case 'bookings':
        fetchBookings();
        break;
      case 'services':
        fetchServices();
        break;
      case 'packages':
        fetchPackages();
        break;
      case 'offers':
        fetchOffers();
        break;
      case 'reports':
        fetchReports();
        break;
      default:
        break;
    }
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
        alert('User added successfully');
        setShowAddUserModal(false);
        setNewUser({ name: '', email: '', phone: '', city: '', password: '' });
        fetchUsers();
      } else {
        alert(data.error || 'Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    // This would need a backend endpoint
    alert('Category added successfully! (Backend integration needed)');
    setShowAddCategoryModal(false);
    setNewCategory({ name: '', description: '', icon: '', order: 0, isActive: true });
    fetchCategories();
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(newService).forEach(key => {
        formData.append(key, newService[key]);
      });
      if (serviceImage) {
        formData.append('image', serviceImage);
      }

      const response = await fetch('http://localhost:5000/api/services', {
        method: 'POST',
        headers: { 'admin-token': 'admin-secret-token' },
        body: formData
      });
      
      const data = await response.json();
      if (data.message) {
        alert('Service added successfully');
        setShowAddServiceModal(false);
        setNewService({
          name: '',
          description: '',
          category: '',
          price: '',
          duration: '',
          isActive: true
        });
        setServiceImage(null);
        fetchServices();
      } else {
        alert(data.error || 'Failed to add service');
      }
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Failed to add service');
    }
  };

  const handleAddPackage = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/addpackages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'admin-token': 'admin-secret-token'
        },
        body: JSON.stringify(newPackage)
      });
      
      const data = await response.json();
      if (data.message) {
        alert('Package added successfully');
        setShowAddPackageModal(false);
        setNewPackage({
          title: '',
          description: '',
          price: '',
          originalPrice: '',
          duration: '',
          category: '',
          items: [{ text: '', description: '' }]
        });
        fetchPackages();
      } else {
        alert(data.error || 'Failed to add package');
      }
    } catch (error) {
      console.error('Error adding package:', error);
      alert('Failed to add package');
    }
  };

  const handleAddOffer = async (e) => {
    e.preventDefault();
    // This would need a backend endpoint
    alert('Offer added successfully! (Backend integration needed)');
    setShowAddOfferModal(false);
    setNewOffer({
      title: '',
      description: '',
      discount: '',
      validUntil: '',
      code: ''
    });
    fetchOffers();
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      // This would need a backend endpoint
      alert('User deleted successfully! (Backend integration needed)');
      fetchUsers();
    }
  };

  const deleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      // This would need a backend endpoint
      alert('Category deleted successfully! (Backend integration needed)');
      fetchCategories();
    }
  };

  const deleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/services/${serviceId}`, {
          method: 'DELETE',
          headers: { 'admin-token': 'admin-secret-token' }
        });
        const data = await response.json();
        if (data.message) {
          alert('Service deleted successfully');
          fetchServices();
        } else {
          alert(data.error || 'Failed to delete service');
        }
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Failed to delete service');
      }
    }
  };

  const deletePackage = async (packageId) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/packages/${packageId}`, {
          method: 'DELETE',
          headers: { 'admin-token': 'admin-secret-token' }
        });
        const data = await response.json();
        if (data.message) {
          alert('Package deleted successfully');
          fetchPackages();
        } else {
          alert(data.error || 'Failed to delete package');
        }
      } catch (error) {
        console.error('Error deleting package:', error);
        alert('Failed to delete package');
      }
    }
  };

  const deleteOffer = async (offerId) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      // This would need a backend endpoint
      alert('Offer deleted successfully! (Backend integration needed)');
      fetchOffers();
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
                      <div className="rounded-circle p-3" style={{ background: "rgba(102, 126, 234, 0.1)" }}>
                        <span style={{ color: "#667eea", fontSize: "24px" }}>👥</span>
                      </div>
                    </div>
                    <h5 className="text-muted mb-2">Total Users</h5>
                    <h2 className="mb-0" style={{ color: "#667eea" }}>{stats?.totalUsers || 0}</h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-0 shadow-sm">
                  <Card.Body className="py-4">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <div className="rounded-circle p-3" style={{ background: "rgba(118, 75, 162, 0.1)" }}>
                        <span style={{ color: "#764ba2", fontSize: "24px" }}>📅</span>
                      </div>
                    </div>
                    <h5 className="text-muted mb-2">Total Bookings</h5>
                    <h2 className="mb-0" style={{ color: "#764ba2" }}>{stats?.totalBookings || 0}</h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-0 shadow-sm">
                  <Card.Body className="py-4">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <div className="rounded-circle p-3" style={{ background: "rgba(56, 178, 172, 0.1)" }}>
                        <span style={{ color: "#38b2ac", fontSize: "24px" }}>💰</span>
                      </div>
                    </div>
                    <h5 className="text-muted mb-2">Total Revenue</h5>
                    <h2 className="mb-0" style={{ color: "#38b2ac" }}>₹{stats?.totalRevenue?.toLocaleString() || 0}</h2>
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

      case 'users':
        return (
          <Card className="border-0 shadow-sm">
            <Card.Header className="border-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">User Management</h5>
                <p className="text-muted mb-0">Manage all registered users</p>
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
                <Dropdown>
                  <Dropdown.Toggle variant="primary">
                    <i className="bi bi-plus-circle me-2"></i>Actions
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setShowAddUserModal(true)}>
                      <i className="bi bi-person-plus me-2"></i>Add New User
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <i className="bi bi-download me-2"></i>Export Users
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Card.Header>
            <Card.Body>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Profile</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td><small className="text-muted">{user._id?.substring(0, 8)}...</small></td>
                      <td>
                        {user.profileImage ? (
                          <img 
                            src={`http://localhost:5000${user.profileImage}`} 
                            alt={user.name}
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" 
                               style={{ width: "40px", height: "40px" }}>
                            {user.name?.charAt(0) || 'U'}
                          </div>
                        )}
                      </td>
                      <td>{user.name}</td>
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
                            <Dropdown.Item><i className="bi bi-eye me-2"></i>View Details</Dropdown.Item>
                            <Dropdown.Item><i className="bi bi-pencil me-2"></i>Edit User</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item className="text-danger" onClick={() => deleteUser(user._id)}>
                              <i className="bi bi-trash me-2"></i>Delete User
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="d-flex justify-content-center">
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

      case 'categories':
        return (
          <Card className="border-0 shadow-sm">
            <Card.Header className="border-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Category Management</h5>
                <p className="text-muted mb-0">Manage service categories</p>
              </div>
              <Dropdown>
                <Dropdown.Toggle variant="primary">
                  <i className="bi bi-plus-circle me-2"></i>Actions
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setShowAddCategoryModal(true)}>
                    <i className="bi bi-folder-plus me-2"></i>Add New Category
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <i className="bi bi-arrow-down-up me-2"></i>Reorder Categories
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Card.Header>
            <Card.Body>
              <Row>
                {categories.map((category) => (
                  <Col md={4} key={category._id} className="mb-3">
                    <Card>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5>{category.icon} {category.name}</h5>
                            <p className="text-muted mb-2">{category.description}</p>
                            <Badge bg={category.isActive ? 'success' : 'secondary'}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <span className="ms-2 text-muted">Order: {category.order}</span>
                          </div>
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
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
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
                <Dropdown>
                  <Dropdown.Toggle variant="primary">
                    <i className="bi bi-plus-circle me-2"></i>Actions
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item>
                      <i className="bi bi-calendar-plus me-2"></i>Add Manual Booking
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <i className="bi bi-download me-2"></i>Export Bookings
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Card.Header>
            <Card.Body>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
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
              <div className="d-flex justify-content-center">
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

      case 'services':
        return (
          <Card className="border-0 shadow-sm">
            <Card.Header className="border-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Services Management</h5>
                <p className="text-muted mb-0">Manage all services</p>
              </div>
              <div className="d-flex gap-2">
                <Form.Control
                  type="search"
                  placeholder="Search services..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  style={{ width: '250px' }}
                />
                <Dropdown>
                  <Dropdown.Toggle variant="primary">
                    <i className="bi bi-plus-circle me-2"></i>Actions
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setShowAddServiceModal(true)}>
                      <i className="bi bi-plus-circle me-2"></i>Add New Service
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <i className="bi bi-upload me-2"></i>Bulk Import
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                {services.filter(service => 
                  service.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                  service.description.toLowerCase().includes(serviceSearch.toLowerCase())
                ).map((service) => (
                  <Col md={4} key={service._id} className="mb-3">
                    <Card className="h-100">
                      {service.img && (
                        <Card.Img 
                          variant="top" 
                          src={`http://localhost:5000${service.img}`} 
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                      )}
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <Card.Title>{service.name}</Card.Title>
                            <Card.Text className="text-muted">{service.description}</Card.Text>
                            <div className="d-flex gap-2">
                              <Badge bg="secondary">{service.category}</Badge>
                              <Badge bg={service.isActive ? 'success' : 'secondary'}>
                                {service.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                          <Dropdown>
                            <Dropdown.Toggle variant="light" size="sm">
                              <i className="bi bi-three-dots"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item><i className="bi bi-pencil me-2"></i>Edit</Dropdown.Item>
                              <Dropdown.Item><i className="bi bi-eye me-2"></i>View Details</Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item className="text-danger" onClick={() => deleteService(service._id)}>
                                <i className="bi bi-trash me-2"></i>Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        );

      case 'packages':
        return (
          <Card className="border-0 shadow-sm">
            <Card.Header className="border-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Packages Management</h5>
                <p className="text-muted mb-0">Manage service packages</p>
              </div>
              <Dropdown>
                <Dropdown.Toggle variant="primary">
                  <i className="bi bi-plus-circle me-2"></i>Actions
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setShowAddPackageModal(true)}>
                    <i className="bi bi-box-seam me-2"></i>Add New Package
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <i className="bi bi-tags me-2"></i>Manage Pricing
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Card.Header>
            <Card.Body>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Package</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Duration</th>
                    <th>Items</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg) => (
                    <tr key={pkg._id}>
                      <td>
                        <strong>{pkg.title}</strong><br/>
                        <small className="text-muted">{pkg.description?.substring(0, 50)}...</small>
                      </td>
                      <td>{pkg.category}</td>
                      <td>
                        <strong>₹{pkg.price}</strong><br/>
                        {pkg.originalPrice && (
                          <small className="text-muted text-decoration-line-through">₹{pkg.originalPrice}</small>
                        )}
                      </td>
                      <td>{pkg.duration}</td>
                      <td>{pkg.items?.length || 0} items</td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="light" size="sm">
                            <i className="bi bi-three-dots"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item><i className="bi bi-pencil me-2"></i>Edit</Dropdown.Item>
                            <Dropdown.Item><i className="bi bi-eye me-2"></i>View Details</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item className="text-danger" onClick={() => deletePackage(pkg._id)}>
                              <i className="bi bi-trash me-2"></i>Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        );

      case 'offers':
        return (
          <Card className="border-0 shadow-sm">
            <Card.Header className="border-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Offers Management</h5>
                <p className="text-muted mb-0">Manage discounts and promotions</p>
              </div>
              <Dropdown>
                <Dropdown.Toggle variant="primary">
                  <i className="bi bi-plus-circle me-2"></i>Actions
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setShowAddOfferModal(true)}>
                    <i className="bi bi-percent me-2"></i>Add New Offer
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <i className="bi bi-megaphone me-2"></i>Promote Offers
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Card.Header>
            <Card.Body>
              <Row>
                {offers.map((offer) => (
                  <Col md={4} key={offer._id} className="mb-3">
                    <Card className="h-100 border-primary">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5>{offer.title}</h5>
                            <p className="text-muted">{offer.description}</p>
                            <div className="mb-3">
                              <Badge bg="success" className="me-2">{offer.discount} OFF</Badge>
                              <Badge bg="info">Code: {offer.code}</Badge>
                            </div>
                            <small className="text-muted">Valid until: {offer.validUntil}</small>
                          </div>
                          <Dropdown>
                            <Dropdown.Toggle variant="light" size="sm">
                              <i className="bi bi-three-dots"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item><i className="bi bi-pencil me-2"></i>Edit</Dropdown.Item>
                              <Dropdown.Item><i className="bi bi-copy me-2"></i>Copy Code</Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item className="text-danger" onClick={() => deleteOffer(offer._id)}>
                                <i className="bi bi-trash me-2"></i>Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
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

      default:
        return null;
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
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
                  color: ['users', 'categories'].includes(activeMenu) ? '#000' : 'white',
                  background: ['users', 'categories'].includes(activeMenu) ? 'white' : 'transparent',
                  borderRadius: '8px',
                  padding: '10px 15px'
                }}
              >
                <i className="bi bi-people me-2"></i>User Management
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleMenuClick('users')}>
                  <i className="bi bi-person me-2"></i>Manage Users
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleMenuClick('categories')}>
                  <i className="bi bi-tags me-2"></i>Manage Categories
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
                  color: ['services', 'packages', 'offers'].includes(activeMenu) ? '#000' : 'white',
                  background: ['services', 'packages', 'offers'].includes(activeMenu) ? 'white' : 'transparent',
                  borderRadius: '8px',
                  padding: '10px 15px'
                }}
              >
                <i className="bi bi-tools me-2"></i>Services
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleMenuClick('services')}>
                  <i className="bi bi-tools me-2"></i>Manage Services
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleMenuClick('packages')}>
                  <i className="bi bi-box-seam me-2"></i>Manage Packages
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleMenuClick('offers')}>
                  <i className="bi bi-percent me-2"></i>Manage Offers
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
          </Nav>
        </div>
      )}

      {/* Main Content */}
      <div style={{ 
        marginLeft: sidebarOpen ? '250px' : '0', 
        flex: 1,
        transition: 'margin-left 0.3s'
      }}>
        {/* Top Navbar */}
        <Navbar bg="light" expand="lg" className="shadow-sm">
          <Container fluid>
            <Button variant="light" onClick={() => setSidebarOpen(!sidebarOpen)} className="me-3">
              <i className={`bi bi-${sidebarOpen ? 'chevron-left' : 'chevron-right'}`}></i>
            </Button>
            
            <Navbar.Brand href="#" className="d-none d-md-block">
              <strong>Admin Panel</strong>
            </Navbar.Brand>
            
            <Navbar.Toggle aria-controls="navbarScroll" />
            <Navbar.Collapse id="navbarScroll">
              <Nav className="me-auto my-2 my-lg-0">
                <Nav.Link active>
                  {activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)}
                </Nav.Link>
              </Nav>
              
              <div className="d-flex align-items-center">
                <span className="me-3">
                  Welcome, <strong>Admin</strong>
                </span>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => {
                    setIsLoggedIn(false);
                    localStorage.removeItem('adminToken');
                  }}
                >
                  <i className="bi bi-box-arrow-right me-1"></i>Logout
                </Button>
              </div>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* Page Content */}
        <Container fluid className="py-4">
          {renderContent()}
        </Container>
      </div>

      {/* Add User Modal */}
      <Modal show={showAddUserModal} onHide={() => setShowAddUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddUser}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                value={newUser.phone}
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                value={newUser.city}
                onChange={(e) => setNewUser({...newUser, city: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                required
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

      {/* Add Category Modal */}
      <Modal show={showAddCategoryModal} onHide={() => setShowAddCategoryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddCategory}>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newCategory.description}
                onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Icon</Form.Label>
              <Form.Control
                type="text"
                value={newCategory.icon}
                onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                placeholder="e.g., ✂️, 🧹, 🔧"
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Order</Form.Label>
                  <Form.Control
                    type="number"
                    value={newCategory.order}
                    onChange={(e) => setNewCategory({...newCategory, order: parseInt(e.target.value)})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Active Category"
                    checked={newCategory.isActive}
                    onChange={(e) => setNewCategory({...newCategory, isActive: e.target.checked})}
                  />
                </Form.Group>
              </Col>
            </Row>
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

      {/* Add Service Modal */}
      <Modal show={showAddServiceModal} onHide={() => setShowAddServiceModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddService}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Service Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService({...newService, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={newService.category}
                    onChange={(e) => setNewService({...newService, category: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newService.description}
                onChange={(e) => setNewService({...newService, description: e.target.value})}
                required
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (₹)</Form.Label>
                  <Form.Control
                    type="text"
                    value={newService.price}
                    onChange={(e) => setNewService({...newService, price: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration</Form.Label>
                  <Form.Control
                    type="text"
                    value={newService.duration}
                    onChange={(e) => setNewService({...newService, duration: e.target.value})}
                    placeholder="e.g., 1 hour, 2 hours"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Service Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setServiceImage(e.target.files[0])}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active Service"
                checked={newService.isActive}
                onChange={(e) => setNewService({...newService, isActive: e.target.checked})}
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowAddServiceModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Add Service
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Add Package Modal */}
      <Modal show={showAddPackageModal} onHide={() => setShowAddPackageModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Package</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddPackage}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Package Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={newPackage.title}
                    onChange={(e) => setNewPackage({...newPackage, title: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={newPackage.category}
                    onChange={(e) => setNewPackage({...newPackage, category: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newPackage.description}
                onChange={(e) => setNewPackage({...newPackage, description: e.target.value})}
                required
              />
            </Form.Group>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (₹)</Form.Label>
                  <Form.Control
                    type="text"
                    value={newPackage.price}
                    onChange={(e) => setNewPackage({...newPackage, price: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Original Price (₹)</Form.Label>
                  <Form.Control
                    type="text"
                    value={newPackage.originalPrice}
                    onChange={(e) => setNewPackage({...newPackage, originalPrice: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration</Form.Label>
                  <Form.Control
                    type="text"
                    value={newPackage.duration}
                    onChange={(e) => setNewPackage({...newPackage, duration: e.target.value})}
                    placeholder="e.g., 2 hours"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Package Items</Form.Label>
              {newPackage.items.map((item, index) => (
                <Row key={index} className="mb-2">
                  <Col md={6}>
                    <Form.Control
                      type="text"
                      placeholder="Item name"
                      value={item.text}
                      onChange={(e) => {
                        const newItems = [...newPackage.items];
                        newItems[index].text = e.target.value;
                        setNewPackage({...newPackage, items: newItems});
                      }}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => {
                        const newItems = [...newPackage.items];
                        newItems[index].description = e.target.value;
                        setNewPackage({...newPackage, items: newItems});
                      }}
                    />
                  </Col>
                </Row>
              ))}
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={() => setNewPackage({
                  ...newPackage, 
                  items: [...newPackage.items, { text: '', description: '' }]
                })}
              >
                <i className="bi bi-plus"></i> Add Item
              </Button>
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowAddPackageModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Add Package
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Add Offer Modal */}
      <Modal show={showAddOfferModal} onHide={() => setShowAddOfferModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Offer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddOffer}>
            <Form.Group className="mb-3">
              <Form.Label>Offer Title</Form.Label>
              <Form.Control
                type="text"
                value={newOffer.title}
                onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newOffer.description}
                onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                required
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Discount</Form.Label>
                  <Form.Control
                    type="text"
                    value={newOffer.discount}
                    onChange={(e) => setNewOffer({...newOffer, discount: e.target.value})}
                    required
                    placeholder="e.g., 25%"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Valid Until</Form.Label>
                  <Form.Control
                    type="date"
                    value={newOffer.validUntil}
                    onChange={(e) => setNewOffer({...newOffer, validUntil: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Offer Code</Form.Label>
              <Form.Control
                type="text"
                value={newOffer.code}
                onChange={(e) => setNewOffer({...newOffer, code: e.target.value})}
                required
                placeholder="e.g., FEST25"
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowAddOfferModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Add Offer
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default AdminPanel;