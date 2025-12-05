// AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Form, Button, 
  Spinner, Modal, Nav, Navbar, Offcanvas, Badge,
  Dropdown, Alert, Pagination
} from 'react-bootstrap';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

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
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [topServices, setTopServices] = useState([]);
  
  // User Management States
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  
  // Bookings Management States
  const [bookings, setBookings] = useState([]);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingTotalPages, setBookingTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Services Management States
  const [services, setServices] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    key: '',
    description: '',
    category: '',
    order: 0,
    isActive: true
  });
  const [serviceImage, setServiceImage] = useState(null);
  
  // Packages Management States
  const [packages, setPackages] = useState([]);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [packageForm, setPackageForm] = useState({
    title: '',
    rating: '',
    bookings: '',
    price: '',
    originalPrice: '',
    duration: '',
    description: '',
    category: '',
    items: [{ text: '', description: '' }],
    content: [{ value: '', details: '' }],
    ratingBreak: [{ stars: 5, value: 100, count: '0' }]
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
        setMonthlyRevenue(data.monthlyRevenue || []);
        setTopServices(data.topServices || []);
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

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    switch(menu) {
      case 'dashboard':
        fetchDashboardData();
        break;
      case 'users':
        fetchUsers();
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

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(serviceForm).forEach(key => {
        if (key === 'items' || key === 'content') {
          formData.append(key, JSON.stringify(serviceForm[key]));
        } else {
          formData.append(key, serviceForm[key]);
        }
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
        alert('Service created successfully');
        setShowServiceModal(false);
        setServiceForm({
          name: '',
          key: '',
          description: '',
          category: '',
          order: 0,
          isActive: true
        });
        setServiceImage(null);
        fetchServices();
      } else {
        alert(data.error || 'Failed to create service');
      }
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Failed to create service');
    }
  };

  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/addpackages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'admin-token': 'admin-secret-token'
        },
        body: JSON.stringify(packageForm)
      });
      
      const data = await response.json();
      if (data.message) {
        alert('Package created successfully');
        setShowPackageModal(false);
        setPackageForm({
          title: '',
          rating: '',
          bookings: '',
          price: '',
          originalPrice: '',
          duration: '',
          description: '',
          category: '',
          items: [{ text: '', description: '' }],
          content: [{ value: '', details: '' }],
          ratingBreak: [{ stars: 5, value: 100, count: '0' }]
        });
        fetchPackages();
      } else {
        alert(data.error || 'Failed to create package');
      }
    } catch (error) {
      console.error('Error creating package:', error);
      alert('Failed to create package');
    }
  };

  // Format revenue data for charts
  const revenueData = monthlyRevenue.map(item => ({
    name: `${item._id.month}/${item._id.year}`,
    revenue: item.revenue,
    bookings: item.bookings
  }));

  const serviceData = topServices.map(item => ({
    name: item._id,
    value: item.count,
    revenue: item.revenue
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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

  // Render different content based on active menu
  const renderContent = () => {
    switch(activeMenu) {
      case 'dashboard':
        return (
          <>
            {/* Stats Cards */}
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

            {/* Charts Row */}
            <Row className="mb-4">
              <Col md={8}>
                <Card className="border-0 shadow-sm">
                  <Card.Header className="border-0">
                    <h5>Monthly Revenue Trend</h5>
                  </Card.Header>
                  <Card.Body>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#667eea" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm">
                  <Card.Header className="border-0">
                    <h5>Top Services</h5>
                  </Card.Header>
                  <Card.Body>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={serviceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {serviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Bookings']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Recent Bookings */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="border-0 d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">Recent Bookings</h5>
                  <p className="text-muted mb-0">Latest bookings from your customers</p>
                </div>
                <Button variant="outline-primary" size="sm" onClick={() => handleMenuClick('bookings')}>
                  View All
                </Button>
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
              <Form className="d-flex">
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
              </Form>
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
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td><small className="text-muted">{user._id.substring(0, 8)}...</small></td>
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
                      <td><small className="text-muted">{booking._id.substring(0, 8)}...</small></td>
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
                          <Dropdown.Toggle variant="light" size="sm" id="dropdown-basic">
                            Actions
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => updateBookingStatus(booking._id, 'Confirmed')}>
                              Mark as Confirmed
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => updateBookingStatus(booking._id, 'Completed')}>
                              Mark as Completed
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => updateBookingStatus(booking._id, 'Cancelled')}>
                              Mark as Cancelled
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item className="text-danger" onClick={() => deleteBooking(booking._id)}>
                              Delete Booking
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
              <Button variant="primary" onClick={() => setShowServiceModal(true)}>
                <i className="bi bi-plus-circle me-2"></i>Add New Service
              </Button>
            </Card.Header>
            <Card.Body>
              <Row>
                {services.map((service) => (
                  <Col md={4} key={service._id} className="mb-3">
                    <Card className="h-100">
                      <Card.Img 
                        variant="top" 
                        src={`http://localhost:5000${service.img}`} 
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <Card.Body>
                        <Card.Title>{service.name}</Card.Title>
                        <Card.Text>{service.description}</Card.Text>
                        <div className="d-flex justify-content-between align-items-center">
                          <Badge bg={service.isActive ? 'success' : 'secondary'}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <small className="text-muted">Order: {service.order}</small>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>

            {/* Add Service Modal */}
            <Modal show={showServiceModal} onHide={() => setShowServiceModal(false)} size="lg">
              <Modal.Header closeButton>
                <Modal.Title>Add New Service</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form onSubmit={handleServiceSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Service Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={serviceForm.name}
                          onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Form.Control
                          type="text"
                          value={serviceForm.category}
                          onChange={(e) => setServiceForm({...serviceForm, category: e.target.value})}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                      required
                    />
                  </Form.Group>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Order</Form.Label>
                        <Form.Control
                          type="number"
                          value={serviceForm.order}
                          onChange={(e) => setServiceForm({...serviceForm, order: parseInt(e.target.value)})}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Service Image</Form.Label>
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={(e) => setServiceImage(e.target.files[0])}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Active Service"
                      checked={serviceForm.isActive}
                      onChange={(e) => setServiceForm({...serviceForm, isActive: e.target.checked})}
                    />
                  </Form.Group>
                  <div className="d-flex justify-content-end gap-2">
                    <Button variant="secondary" onClick={() => setShowServiceModal(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                      Create Service
                    </Button>
                  </div>
                </Form>
              </Modal.Body>
            </Modal>
          </Card>
        );

      case 'packages':
        return (
          <Card className="border-0 shadow-sm">
            <Card.Header className="border-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Packages Management</h5>
                <p className="text-muted mb-0">Manage all service packages</p>
              </div>
              <Button variant="primary" onClick={() => setShowPackageModal(true)}>
                <i className="bi bi-plus-circle me-2"></i>Add New Package
              </Button>
            </Card.Header>
            <Card.Body>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Rating</th>
                    <th>Bookings</th>
                    <th>Duration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg) => (
                    <tr key={pkg._id}>
                      <td>
                        <strong>{pkg.title}</strong><br/>
                        <small className="text-muted">{pkg.description.substring(0, 50)}...</small>
                      </td>
                      <td>{pkg.category}</td>
                      <td>
                        <strong>₹{pkg.price}</strong><br/>
                        <small className="text-muted text-decoration-line-through">₹{pkg.originalPrice}</small>
                      </td>
                      <td>{pkg.rating}</td>
                      <td>{pkg.bookings}</td>
                      <td>{pkg.duration}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-2">
                          Edit
                        </Button>
                        <Button variant="outline-danger" size="sm">
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>

            {/* Add Package Modal */}
            <Modal show={showPackageModal} onHide={() => setShowPackageModal(false)} size="lg">
              <Modal.Header closeButton>
                <Modal.Title>Add New Package</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form onSubmit={handlePackageSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Package Title</Form.Label>
                        <Form.Control
                          type="text"
                          value={packageForm.title}
                          onChange={(e) => setPackageForm({...packageForm, title: e.target.value})}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Form.Control
                          type="text"
                          value={packageForm.category}
                          onChange={(e) => setPackageForm({...packageForm, category: e.target.value})}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                          type="text"
                          value={packageForm.price}
                          onChange={(e) => setPackageForm({...packageForm, price: e.target.value})}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Original Price</Form.Label>
                        <Form.Control
                          type="text"
                          value={packageForm.originalPrice}
                          onChange={(e) => setPackageForm({...packageForm, originalPrice: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Duration</Form.Label>
                        <Form.Control
                          type="text"
                          value={packageForm.duration}
                          onChange={(e) => setPackageForm({...packageForm, duration: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Rating</Form.Label>
                        <Form.Control
                          type="text"
                          value={packageForm.rating}
                          onChange={(e) => setPackageForm({...packageForm, rating: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Bookings Count</Form.Label>
                        <Form.Control
                          type="text"
                          value={packageForm.bookings}
                          onChange={(e) => setPackageForm({...packageForm, bookings: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={packageForm.description}
                      onChange={(e) => setPackageForm({...packageForm, description: e.target.value})}
                      required
                    />
                  </Form.Group>
                  <div className="d-flex justify-content-end gap-2">
                    <Button variant="secondary" onClick={() => setShowPackageModal(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                      Create Package
                    </Button>
                  </div>
                </Form>
              </Modal.Body>
            </Modal>
          </Card>
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
          zIndex: 1000
        }}>
          <div className="text-center mb-4">
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
            
            <Nav.Link 
              className={`mb-2 ${activeMenu === 'users' ? 'active' : ''}`}
              onClick={() => handleMenuClick('users')}
              style={{ 
                color: activeMenu === 'users' ? '#000' : 'white',
                background: activeMenu === 'users' ? 'white' : 'transparent',
                borderRadius: '8px',
                padding: '10px 15px'
              }}
            >
              <i className="bi bi-people me-2"></i>User Management
            </Nav.Link>
            
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
              <i className="bi bi-calendar-check me-2"></i>Booking Management
            </Nav.Link>
            
            <Nav.Link 
              className={`mb-2 ${activeMenu === 'services' ? 'active' : ''}`}
              onClick={() => handleMenuClick('services')}
              style={{ 
                color: activeMenu === 'services' ? '#000' : 'white',
                background: activeMenu === 'services' ? 'white' : 'transparent',
                borderRadius: '8px',
                padding: '10px 15px'
              }}
            >
              <i className="bi bi-tools me-2"></i>Services Management
            </Nav.Link>
            
            <Nav.Link 
              className={`mb-2 ${activeMenu === 'packages' ? 'active' : ''}`}
              onClick={() => handleMenuClick('packages')}
              style={{ 
                color: activeMenu === 'packages' ? '#000' : 'white',
                background: activeMenu === 'packages' ? 'white' : 'transparent',
                borderRadius: '8px',
                padding: '10px 15px'
              }}
            >
              <i className="bi bi-box-seam me-2"></i>Packages Management
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
                <Nav.Link active>{activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)}</Nav.Link>
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
    </div>
  );
}

export default AdminPanel;