import React, { useState, useEffect } from 'react';
import { Nav, Dropdown, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

function AdminSidebar({ sidebarOpen, setSidebarOpen, userRole, isMobile }) {
  const location = useLocation();
  const [catOpen, setCatOpen] = useState(false);
  const [subCatOpen, setSubCatOpen] = useState(false);
  const [permissions, setPermissions] = useState({});
  const logoUrl = 'http://localhost:5000/assets/Uc.png';

  useEffect(() => {
    try {
      const stored = localStorage.getItem('adminPermissions');
      if (stored) {
        setPermissions(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

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
    // On mobile, items are always left-aligned since width is fixed 250px when open
    const alignCondition = isMobile ? true : sidebarOpen;

    return {
      color: isActive(path) ? '#000' : 'white',
      background: isActive(path) ? 'white' : 'transparent',
      borderRadius: '8px',
      padding: '10px 15px',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px',
      transition: 'all 0.2s',
      border: isActive(path) ? '1px solid #dee2e6' : 'none',
      justifyContent: alignCondition ? 'flex-start' : 'center'
    };
  };

  // Helper function to get dropdown toggle style
  const getDropdownToggleStyle = (paths) => {
    const active = isAnyActive(paths);
    const alignCondition = isMobile ? true : sidebarOpen;

    return {
      color: active ? '#000' : 'white',
      background: active ? 'white' : 'transparent',
      borderRadius: '8px',
      padding: '10px 15px',
      textDecoration: 'none',
      display: 'flex',
      justifyContent: alignCondition ? 'space-between' : 'center',
      alignItems: 'center',
      marginBottom: '8px',
      transition: 'all 0.2s',
      border: active ? '1px solid #dee2e6' : 'none',
      width: '100%',
      textAlign: 'left'
    };
  };

  const handleSidebarClick = () => {
    if (!sidebarOpen && setSidebarOpen && !isMobile) {
      setSidebarOpen(true);
    }
  };

  const sidebarWidth = isMobile ? '250px' : (sidebarOpen ? '250px' : '70px');
  const sidebarTransform = isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none';

  return (
    <div
      onClick={handleSidebarClick}
      style={{
        width: sidebarWidth,
        transform: sidebarTransform,
        background: '#000000',
        color: 'white',
        padding: '20px 0',
        position: 'fixed',
        left: 0,
        height: '100vh',
        zIndex: 1045,
        overflowY: (isMobile || sidebarOpen) ? 'auto' : 'visible',
        overflowX: 'hidden',
        transition: 'width 0.3s ease, transform 0.3s ease'
      }}
    >
      <div className="text-center mb-4 px-2">
        <img
          src={logoUrl}
          alt="Urban Company"
          style={{
            width: sidebarOpen ? '80px' : '40px',
            height: sidebarOpen ? '80px' : '40px',
            objectFit: 'contain',
            backgroundColor: 'white',
            borderRadius: '50%',
            padding: '5px',
            transition: 'all 0.3s'
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
        {sidebarOpen && (
          <>
            <h5 className="mt-3 mb-0 text-truncate" style={{ color: 'white' }}>Urban Company</h5>
            <small className="text-muted text-truncate d-block">
              {userRole === 'admin' ? 'Admin Panel' : 'User Panel'}
            </small>
          </>
        )}
      </div>

      <Nav className="flex-column px-2">
        {/* Dashboard */}
        <Nav.Link
          as={Link}
          to="/admin/dashboard"
          style={getMenuItemStyle('/admin/dashboard')}
          title="Dashboard"
        >
          <i className="bi bi-speedometer2" style={{ fontSize: '1.2rem', marginRight: sidebarOpen ? '0.5rem' : '0' }}></i>
          {sidebarOpen && <span>Dashboard</span>}
        </Nav.Link>

        {/* User Management */}
        {(userRole === 'admin' || (userRole === 'user' && (permissions['Users'] || permissions['User']))) && (
          <Dropdown className="mb-2" drop={sidebarOpen ? 'down' : 'end'}>
            <Dropdown.Toggle
              as={Nav.Link}
              style={getDropdownToggleStyle(['/admin/users', '/admin/users/add', '/admin/users/edit'])}
            >
              <div className="d-flex align-items-center">
                <i className="bi bi-people" style={{ fontSize: '1.2rem', marginRight: sidebarOpen ? '0.5rem' : '0' }}></i>
                {sidebarOpen && <span>User Management</span>}
              </div>
              {sidebarOpen && <i className="bi bi-chevron-down ms-auto"></i>}
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ width: sidebarOpen ? '100%' : '200px' }}>
              <Dropdown.Item
                as={Link}
                to="/admin/users/add"
                className={isActive('/admin/users/add') ? 'active' : ''}
              >
                <i className="bi bi-person-plus me-2"></i>Add user
              </Dropdown.Item>
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
        {(userRole === 'admin' || (userRole === 'user' && (permissions['Catalog'] || permissions['Category'] || permissions['Categories'] || permissions['Subcategory'] || permissions['Subcategories']))) && (
          <Dropdown className="mb-2" drop={sidebarOpen ? 'down' : 'end'}>
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
              <div className="d-flex align-items-center">
                <i className="bi bi-diagram-3" style={{ fontSize: '1.2rem', marginRight: sidebarOpen ? '0.5rem' : '0' }}></i>
                {sidebarOpen && <span>Catalog</span>}
              </div>
              {sidebarOpen && <i className="bi bi-chevron-down ms-auto"></i>}
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ width: sidebarOpen ? '100%' : '220px' }}>

              {/* Category Section */}
              <div
                className="dropdown-item py-2 px-3 d-flex justify-content-between align-items-center"
                style={{ cursor: 'pointer', backgroundColor: isAnyActive(['/admin/categories', '/admin/categories/add', '/admin/categories/edit']) ? '#f8f9fa' : 'transparent', color: isAnyActive(['/admin/categories', '/admin/categories/add', '/admin/categories/edit']) ? '#000' : '#212529' }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setCatOpen(!catOpen);
                }}
              >
                <span className="d-flex align-items-center"><i className="bi bi-tags me-2"></i>Category</span>
                <i className={`bi bi-chevron-${catOpen ? 'up' : 'down'}`}></i>
              </div>

              {catOpen && (
                <div className="bg-light border-top border-bottom">
                  <Dropdown.Item
                    as={Link}
                    to="/admin/categories/add"
                    className={`ps-4 ${isActive('/admin/categories/add') ? 'active' : ''}`}
                  >
                    <i className="bi bi-plus-circle me-2"></i>Add Category
                  </Dropdown.Item>
                  <Dropdown.Item
                    as={Link}
                    to="/admin/categories"
                    className={`ps-4 ${isActive('/admin/categories') ? 'active' : ''}`}
                  >
                    <i className="bi bi-list-check me-2"></i>Manage Categories
                  </Dropdown.Item>
                </div>
              )}

              {/* Subcategory Section */}
              <div
                className="dropdown-item py-2 px-3 d-flex justify-content-between align-items-center"
                style={{ cursor: 'pointer', backgroundColor: isAnyActive(['/admin/subcategories', '/admin/subcategories/add', '/admin/subcategories/edit']) ? '#f8f9fa' : 'transparent', color: isAnyActive(['/admin/subcategories', '/admin/subcategories/add', '/admin/subcategories/edit']) ? '#000' : '#212529' }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setSubCatOpen(!subCatOpen);
                }}
              >
                <span className="d-flex align-items-center"><i className="bi bi-diagram-2 me-2"></i>Subcategory</span>
                <i className={`bi bi-chevron-${subCatOpen ? 'up' : 'down'}`}></i>
              </div>

              {subCatOpen && (
                <div className="bg-light border-top border-bottom">
                  <Dropdown.Item
                    as={Link}
                    to="/admin/subcategories/add"
                    className={`ps-4 ${isActive('/admin/subcategories/add') ? 'active' : ''}`}
                  >
                    <i className="bi bi-plus-circle me-2"></i>Add Subcategory
                  </Dropdown.Item>
                  <Dropdown.Item
                    as={Link}
                    to="/admin/subcategories"
                    className={`ps-4 ${isActive('/admin/subcategories') ? 'active' : ''}`}
                  >
                    <i className="bi bi-list-check me-2"></i>Manage Subcategories
                  </Dropdown.Item>
                </div>
              )}

            </Dropdown.Menu>
          </Dropdown>
        )}

        {/* Product Management */}
        {(userRole === 'admin' || (userRole === 'user' && (permissions['Product'] || permissions['Products']))) && (
          <Dropdown className="mb-2" drop={sidebarOpen ? 'down' : 'end'}>
            <Dropdown.Toggle
              as={Nav.Link}
              style={getDropdownToggleStyle(['/admin/products', '/admin/products/add'])}
            >
              <div className="d-flex align-items-center">
                <i className="bi bi-box-seam" style={{ fontSize: '1.2rem', marginRight: sidebarOpen ? '0.5rem' : '0' }}></i>
                {sidebarOpen && <span>Product</span>}
              </div>
              {sidebarOpen && <i className="bi bi-chevron-down ms-auto"></i>}
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ width: sidebarOpen ? '100%' : '200px' }}>
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
        {(userRole === 'admin' || (userRole === 'user' && (permissions['Bookings'] || permissions['Booking']))) && (
          <Nav.Link
            as={Link}
            to="/admin/bookings"
            style={getMenuItemStyle('/admin/bookings')}
            title="Bookings"
          >
            <i className="bi bi-calendar-check" style={{ fontSize: '1.2rem', marginRight: sidebarOpen ? '0.5rem' : '0' }}></i>
            {sidebarOpen && <span>Bookings</span>}
          </Nav.Link>
        )}

        {/* Customer Management */}
        {(userRole === 'admin' || (userRole === 'user' && (permissions['Customer'] || permissions['Customers']))) && (
          <Nav.Link
            as={Link}
            to="/admin/customers"
            style={getMenuItemStyle('/admin/customers')}
            title="Customers"
          >
            <i className="bi bi-person-badge" style={{ fontSize: '1.2rem', marginRight: sidebarOpen ? '0.5rem' : '0' }}></i>
            {sidebarOpen && <span>Customers</span>}
          </Nav.Link>
        )}

        {/* Reports */}
        {(userRole === 'admin' || (userRole === 'user' && (permissions['Reports'] || permissions['Report']))) && (
          <Nav.Link
            as={Link}
            to="/admin/reports"
            style={getMenuItemStyle('/admin/reports')}
            title="Reports"
          >
            <i className="bi bi-graph-up" style={{ fontSize: '1.2rem', marginRight: sidebarOpen ? '0.5rem' : '0' }}></i>
            {sidebarOpen && <span>Reports</span>}
          </Nav.Link>
        )}

        {/* Settings */}
        {(userRole === 'admin' || (userRole === 'user' && (permissions['Settings'] || permissions['Setting']))) && (
          <Nav.Link
            as={Link}
            to="/admin/settings"
            style={getMenuItemStyle('/admin/settings')}
            title="Settings"
          >
            <i className="bi bi-gear" style={{ fontSize: '1.2rem', marginRight: sidebarOpen ? '0.5rem' : '0' }}></i>
            {sidebarOpen && <span>Settings</span>}
          </Nav.Link>
        )}

        {/* Profile */}
        <Nav.Link
          as={Link}
          to="/admin/profile"
          style={getMenuItemStyle('/admin/profile')}
          title="Profile"
        >
          <i className="bi bi-person-circle" style={{ fontSize: '1.2rem', marginRight: sidebarOpen ? '0.5rem' : '0' }}></i>
          {sidebarOpen && <span>Profile</span>}
        </Nav.Link>
      </Nav>

      <div className="px-2 mt-4">
        {sidebarOpen ? (
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
        ) : (
          <Button
            variant="outline-light"
            className="w-100 d-flex justify-content-center"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/admin';
            }}
            style={{
              borderRadius: '8px',
              padding: '10px',
            }}
            title="Logout"
          >
            <i className="bi bi-box-arrow-left"></i>
          </Button>
        )}
      </div>
    </div>
  );
}

export default AdminSidebar;