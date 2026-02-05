import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { FcBusinessman, FcPlanner, FcBullish, FcSupport } from "react-icons/fc";
import { useAdminAuth } from './hooks';
import API_URL from './config';

function AdminDashboard() {
  const { role, admin } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);

  // Helper to check permissions
  const hasPermission = (perm) => {
    if (role === 'admin') return true;
    const permissions = admin?.permissions || {};
    // Handle singular/plural variations
    if (perm === 'Users') return permissions['Users'] || permissions['User'];
    if (perm === 'Catalog') return permissions['Catalog'] || permissions['Category'] || permissions['Categories'];
    if (perm === 'Product') return permissions['Product'] || permissions['Products'];
    if (perm === 'Bookings') return permissions['Bookings'] || permissions['Booking'];
    if (perm === 'Customer') return permissions['Customer'] || permissions['Customers'];
    if (perm === 'Reports') return permissions['Reports'] || permissions['Report'];
    if (perm === 'Settings') return permissions['Settings'] || permissions['Setting'];
    return permissions[perm];
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data && data.success) {
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getInitials = (name) => {
    if (!name || name.trim() === '') return 'NA';
    const parts = name.trim().split(' ');
    if (parts.length === 0) return 'NA';
    let initials = parts[0][0].toUpperCase();
    if (parts.length > 1 && parts[parts.length - 1][0].toUpperCase() !== initials) {
      initials += parts[parts.length - 1][0].toUpperCase();
    }
    return initials;
  };

  return (
    <>
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center border-0 shadow-lg">
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
          <Card className="text-center border-0 shadow-lg">
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
          <Card className="text-center border-0 shadow-lg">
            <Card.Body className="py-4">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <div >
                  <span style={{ fontSize: "30px" }}><FcBullish /></span>
                </div>
              </div>
              <h6 className="text-muted mb-2">Total Revenue</h6>
              <h2 className="mb-0" >₹{stats?.totalRevenue?.toLocaleString() || 0}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center border-0 shadow-lg">
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
          <Card className="border-0 shadow-lg">
            <Card.Header className="border-0">
              <h5>Recent Bookings</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ overflowX: 'auto' }}>
                <Table striped bordered hover style={{ border: "2px solid", minwidth: "600px" }}>
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
                                src={`${API_URL}${booking.customerProfileImage}`}
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
                            <strong>{booking.customerName}</strong><br />
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
          <Card className="border-0 shadow-lg">
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
                        src={`${API_URL}${customer.profileImage}`}
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
                    <strong>{customer.name || 'Unknown Customer'}</strong><br />
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
}

export default AdminDashboard;