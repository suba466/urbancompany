import React from 'react';
import { Nav, Dropdown, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

function AdminSidebar({ sidebarOpen, userRole }) {
  const location = useLocation();
  const logoUrl = 'http://localhost:5000/assets/Uc.png';
  
  // Helper function to check if a route is active
  const isActive = (path) => {
    if (path === '/admin/dashboard' && (location.pathname === '/admin' || location.pathname === '/admin/dashboard')) {
      return true;
    }
    return location.pathname.startsWith(path);
  };

  // Helper function to check if any of the given paths are active
  const isAnyActive = (paths) => {
    return paths.some(path => isActive(path));
  };

  // Helper function to get menu item style
  const getMenuItemStyle = (path) => {
    return {
      color: isActive(path) ? '#000' : 'white',
      background: isActive(path) ? 'white' : 'transparent',
      borderRadius: '8px',
      padding: '10px 15px',
      textDecoration: 'none',
      display: 'block',
      marginBottom: '8px',
      transition: 'all 0.2s',
      border: isActive(path) ? '1px solid #dee2e6' : 'none'
    };
  };

  // Helper function to get dropdown toggle style
  const getDropdownToggleStyle = (paths) => {
    const active = isAnyActive(paths);
    return {
      color: active ? '#000' : 'white',
      background: active ? 'white' : 'transparent',
      borderRadius: '8px',
      padding: '10px 15px',
      textDecoration: 'none',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
      transition: 'all 0.2s',
      border: active ? '1px solid #dee2e6' : 'none',
      width: '100%',
      textAlign: 'left'
    };
  };

  return (
    <div style={{ 
      width: sidebarOpen ? '250px' : '0',
      background: '#000000',
      color: 'white',
      padding: sidebarOpen ? '20px 0' : '0',
      position: 'fixed',
      height: '100vh',
      zIndex: 1000,
      overflowY: 'auto',
      overflowX: 'hidden',
      transition: 'all 0.3s'
    }}>
      {sidebarOpen && (
        <>
          <div className="text-center mb-4 px-3">
            <img 
              src={logoUrl}
              alt="Urban Company" 
              style={{ 
                width: '80px', 
                height: '80px', 
                objectFit: 'contain',
                backgroundColor: 'white',
                borderRadius: '50%',
                padding: '10px'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml;base64," + btoa(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
                    <rect width="80" height="80" fill="white" rx="40"/>
                    <text x="40" y="45" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="black">UC</text>
                  </svg>
                `);
              }}
            />
            <h5 className="mt-3 mb-0" style={{ color: 'white' }}>Urban Company</h5>
            <small className="text-muted">
              {userRole === 'admin' ? 'Admin Panel' : 'User Panel'}
            </small>
          </div>

          <Nav className="flex-column px-3">
            {/* Dashboard */}
            <Nav.Link 
              as={Link}
              to="/admin/dashboard"
              style={getMenuItemStyle('/admin/dashboard')}
            >
              <i className="bi bi-speedometer2 me-2"></i>Dashboard
            </Nav.Link>
            
            {/* User Management */}
            {(userRole === 'admin' || (userRole === 'user' && localStorage.getItem('userPermissions')?.includes('Users'))) && (
              <Dropdown className="mb-2">
                <Dropdown.Toggle 
                  as={Nav.Link} 
                  style={getDropdownToggleStyle(['/admin/users', '/admin/users/add', '/admin/users/edit'])}
                >
                  <span>
                    <i className="bi bi-people me-2"></i>User Management
                  </span>
                  <i className="bi bi-chevron-down ms-auto"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ width: '100%' }}>
                  {userRole === 'admin' && (
                    <Dropdown.Item 
                      as={Link} 
                      to="/admin/users/add"
                      className={isActive('/admin/users/add') ? 'active' : ''}
                    >
                      <i className="bi bi-person-plus me-2"></i>Add user
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item 
                    as={Link} 
                    to="/admin/users"
                    className={isActive('/admin/users') ? 'active' : ''}
                  >
                    <i className="bi bi-people-fill me-2"></i>Manage users
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}

            {/* Catalog Management */}
            {(userRole === 'admin' || (userRole === 'user' && localStorage.getItem('userPermissions')?.includes('Catalog'))) && (
              <Dropdown className="mb-2">
                <Dropdown.Toggle 
                  as={Nav.Link} 
                  style={getDropdownToggleStyle([
                    '/admin/categories', 
                    '/admin/categories/add', 
                    '/admin/categories/edit',
                    '/admin/subcategories',
                    '/admin/subcategories/add',
                    '/admin/subcategories/edit'
                  ])}
                >
                  <span>
                    <i className="bi bi-diagram-3 me-2"></i>Catalog
                  </span>
                  <i className="bi bi-chevron-down ms-auto"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ width: '100%' }}>
                  {/* Category Dropdown */}
                  <Dropdown className="dropdown-submenu">
                    <Dropdown.Toggle 
                      as={Nav.Link} 
                      style={{ 
                        color: isAnyActive(['/admin/categories', '/admin/categories/add', '/admin/categories/edit']) ? '#000' : '#6c757d',
                        background: 'transparent',
                        borderRadius: '0',
                        padding: '8px 15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        textDecoration: 'none'
                      }}
                    >
                      <span>
                        <i className="bi bi-tags me-2"></i>Category
                      </span>
                      <i className="bi bi-chevron-right ms-auto"></i>
                    </Dropdown.Toggle>
                    <Dropdown.Menu style={{ 
                      position: 'absolute',
                      left: '100%',
                      top: '0',
                      width: '180px',
                      marginTop: '-1px',
                      zIndex: 1050
                    }}>
                      <Dropdown.Item 
                        as={Link} 
                        to="/admin/categories/add"
                        className={isActive('/admin/categories/add') ? 'active' : ''}
                      >
                        <i className="bi bi-plus-circle me-2"></i>Add Category
                      </Dropdown.Item>
                      <Dropdown.Item 
                        as={Link} 
                        to="/admin/categories"
                        className={isActive('/admin/categories') ? 'active' : ''}
                      >
                        <i className="bi bi-list-check me-2"></i>Manage Categories
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  
                  {/* Subcategory Dropdown */}
                  <Dropdown className="dropdown-submenu">
                    <Dropdown.Toggle 
                      as={Nav.Link} 
                      style={{ 
                        color: isAnyActive(['/admin/subcategories', '/admin/subcategories/add', '/admin/subcategories/edit']) ? '#000' : '#6c757d',
                        background: 'transparent',
                        borderRadius: '0',
                        padding: '8px 15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        textDecoration: 'none'
                      }}
                    >
                      <span>
                        <i className="bi bi-diagram-2 me-2"></i>Subcategory
                      </span>
                      <i className="bi bi-chevron-right ms-auto"></i>
                    </Dropdown.Toggle>
                    <Dropdown.Menu style={{ 
                      position: 'absolute',
                      left: '100%',
                      top: '0',
                      width: '180px',
                      marginTop: '-1px',
                      zIndex: 1050
                    }}>
                      <Dropdown.Item 
                        as={Link} 
                        to="/admin/subcategories/add"
                        className={isActive('/admin/subcategories/add') ? 'active' : ''}
                      >
                        <i className="bi bi-plus-circle me-2"></i>Add Subcategory
                      </Dropdown.Item>
                      <Dropdown.Item 
                        as={Link} 
                        to="/admin/subcategories"
                        className={isActive('/admin/subcategories') ? 'active' : ''}
                      >
                        <i className="bi bi-list-check me-2"></i>Manage Subcategories
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Dropdown.Menu>
              </Dropdown>
            )}
          
            {/* Product Management */}
            {(userRole === 'admin' || (userRole === 'user' && localStorage.getItem('userPermissions')?.includes('Product'))) && (
              <Dropdown className="mb-2">
                <Dropdown.Toggle 
                  as={Nav.Link} 
                  style={getDropdownToggleStyle(['/admin/products', '/admin/products/add'])}
                >
                  <span>
                    <i className="bi bi-box-seam me-2"></i>Product
                  </span>
                  <i className="bi bi-chevron-down ms-auto"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ width: '100%' }}>
                  <Dropdown.Item 
                    as={Link} 
                    to="/admin/products/add"
                    className={isActive('/admin/products/add') ? 'active' : ''}
                  >
                    <i className="bi bi-plus-circle me-2"></i>Add Product
                  </Dropdown.Item>
                  <Dropdown.Item 
                    as={Link} 
                    to="/admin/products"
                    className={isActive('/admin/products') ? 'active' : ''}
                  >
                    <i className="bi bi-box-seam me-2"></i>Manage Products
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
            
            {/* Bookings */}
            {(userRole === 'admin' || (userRole === 'user' && localStorage.getItem('userPermissions')?.includes('Bookings'))) && (
              <Nav.Link 
                as={Link}
                to="/admin/bookings"
                style={getMenuItemStyle('/admin/bookings')}
              >
                <i className="bi bi-calendar-check me-2"></i>Bookings
              </Nav.Link>
            )}

            {/* Customer Management */}
            {(userRole === 'admin' || (userRole === 'user' && localStorage.getItem('userPermissions')?.includes('Customer'))) && (
              <Nav.Link 
                as={Link}
                to="/admin/customers"
                style={getMenuItemStyle('/admin/customers')}
              >
                <i className="bi bi-person-badge me-2"></i>Customers
              </Nav.Link>
            )}
            
            {/* Reports */}
            {(userRole === 'admin' || (userRole === 'user' && localStorage.getItem('userPermissions')?.includes('Reports'))) && (
              <Nav.Link 
                as={Link}
                to="/admin/reports"
                style={getMenuItemStyle('/admin/reports')}
              >
                <i className="bi bi-graph-up me-2"></i>Reports
              </Nav.Link>
            )}
            
            {/* Settings */}
            {(userRole === 'admin' || (userRole === 'user' && localStorage.getItem('userPermissions')?.includes('Settings'))) && (
              <Nav.Link 
                as={Link}
                to="/admin/settings"
                style={getMenuItemStyle('/admin/settings')}
              >
                <i className="bi bi-gear me-2"></i>Settings
              </Nav.Link>
            )}

            {/* Profile */}
            <Nav.Link 
              as={Link}
              to="/admin/profile"
              style={getMenuItemStyle('/admin/profile')}
            >
              <i className="bi bi-person-circle me-2"></i>Profile
            </Nav.Link>
          </Nav>
          
          <div className="px-3 mt-4">
            <Button 
              variant="outline-light" 
              className="w-100"
              onClick={() => {
                localStorage.clear();
                window.location.href = '/admin';
              }}
              style={{
                borderRadius: '8px',
                padding: '10px',
                fontWeight: '500'
              }}
            >
              <i className="bi bi-box-arrow-left me-2"></i>Logout
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminSidebar;