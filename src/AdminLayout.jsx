import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar, Container, Nav, Dropdown, Button } from 'react-bootstrap';
import AdminSidebar from './AdminSidebar';

function AdminLayout({ userRole, userProfile, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="d-flex" style={{ minHeight: '100vh', overflowX: 'hidden', backgroundColor: "#acacacff" }}>
      {/* Sidebar */}
      <AdminSidebar 
        sidebarOpen={sidebarOpen} 
        userRole={userRole} 
      />

      {/* Main Content */}
      <div style={{ 
        marginLeft: sidebarOpen ? '250px' : '0', 
        flex: 1,
        transition: 'margin-left 0.3s',
        minWidth: '0'
      }}>
        {/* Top Navbar */}
        <Navbar bg="light" expand="lg" className="shadow-lg">
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
                    <Dropdown.Item href="/admin">
                      <i className="bi bi-person-circle me-2"></i>Profile
                    </Dropdown.Item>
                    <Dropdown.Item href="/admin/settings">
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