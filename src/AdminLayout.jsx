import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom'; // Add useNavigate and Link
import { Navbar, Container, Nav, Dropdown, Button } from 'react-bootstrap';
import AdminSidebar from './AdminSidebar';

function AdminLayout({ userRole, userProfile, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="d-flex" style={{ minHeight: '100vh', overflowX: 'hidden', backgroundColor: "#acacacff" }}>
      {/* Sidebar */}
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userRole={userRole}
      />

      {/* Main Content */}
      <div style={{
        marginLeft: sidebarOpen ? '250px' : '70px',
        flex: 1,
        transition: 'margin-left 0.3s',
        minWidth: '0'
      }}>
        {/* Top Navbar */}
        <Navbar bg="light" expand="lg" className="shadow-lg sticky-top">
          <Container fluid>
            <Button variant="light" onClick={() => setSidebarOpen(!sidebarOpen)} className="me-3">
              <i className={`bi bi-${sidebarOpen ? 'chevron-left' : 'list'}`}></i>
            </Button>
            <Navbar.Brand className="fw-bold" style={{ maxWidth: "200px" }}>
              Urban Company {userRole === 'admin' ? 'Admin' : 'User'}
            </Navbar.Brand>

            <Navbar.Toggle aria-controls="navbar-nav" />
            <Navbar.Collapse id="navbar-nav" className="justify-content-end">
              <Nav className="align-items-center">
                <Dropdown align="end">
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
                  <Dropdown.Menu>
                    <Dropdown.Item
                      onClick={() => navigate('/admin/profile')}
                    >
                      <i className="bi bi-person-circle me-2"></i>Profile
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => navigate('/admin/settings')}
                    >
                      <i className="bi bi-gear me-2"></i>Settings
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={onLogout}>
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
          <Outlet />
        </Container>
      </div>
    </div>
  );
}

export default AdminLayout;