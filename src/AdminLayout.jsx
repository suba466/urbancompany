import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom'; // Add useNavigate and Link
import { Navbar, Container, Nav, Dropdown, Button } from 'react-bootstrap';
import { MdMenu } from "react-icons/md";
import AdminSidebar from './AdminSidebar';

function AdminLayout({ userRole, userProfile, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Reverting to 992px (standard tablet breakpoint).
  // < 992px: Mobile/Tablet (Toggle view)
  // >= 992px: Desktop (Full sidebar, no toggle)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const navigate = useNavigate();

  // Update the useEffect in AdminLayout.js:
useEffect(() => {
  const handleResize = () => {
    const mobile = window.innerWidth < 992;
    setIsMobile(mobile);
    
    // Only adjust sidebar state on resize, not on initial load
    // This prevents the sidebar from opening when switching from mobile to desktop
    if (mobile && sidebarOpen) {
      setSidebarOpen(false);
    }
    // Don't automatically open sidebar on desktop resize
    // Let user's preference persist
  };

  window.addEventListener('resize', handleResize);
  
  // Initial check - but don't change sidebar state on mount
  const initialMobile = window.innerWidth < 992;
  setIsMobile(initialMobile);
  
  // If it's desktop on initial load AND sidebar is not explicitly closed, open it
  if (!initialMobile && sidebarOpen === false) {
    // Keep it as user set it
  }

  return () => window.removeEventListener('resize', handleResize);
}, [sidebarOpen]); // Add sidebarOpen as dependency

  return (
    <div className="d-flex position-relative" style={{ minHeight: '100vh', overflowX: 'hidden', backgroundColor: "#acacacff" }}>
      {/* Mobile Overlay Backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userRole={userRole}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <div style={{
        marginLeft: isMobile ? '0' : (sidebarOpen ? '250px' : '70px'),
        flex: 1,
        transition: 'margin-left 0.3s',
        minWidth: '0',
        width: '100%'
      }}>
        {/* Top Navbar */}
        <Navbar bg="light" expand={false} className="shadow-lg sticky-top">
          <Container fluid className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              {isMobile && (
                <Button variant="light" onClick={() => setSidebarOpen(!sidebarOpen)} className="me-3 d-flex align-items-center justify-content-center">
                  <MdMenu size={24} />
                </Button>
              )}
              <Navbar.Brand className="fw-bold" style={{ maxWidth: "200px" }}>
                Urban Company {userRole === 'admin' ? 'Admin' : 'User'}
              </Navbar.Brand>
            </div>

            <Nav className="align-items-center ms-auto">
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" className="d-flex align-items-center border-0 bg-transparent">
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
                    <i className="bi bi-person-circle me-2" style={{ fontSize: '1.2rem' }}></i>
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