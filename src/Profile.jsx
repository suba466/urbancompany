import React, { useState, useEffect } from 'react';
import { Card, Spinner, Badge } from 'react-bootstrap';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

// In Profile.jsx, improve the fetchProfile function:
const fetchProfile = async () => {
  try {
    setLoading(true);
    
    // Check if user is authenticated
    const token = getAuthToken();
    if (!token) {
      // Redirect to login if no token
      window.location.href = '/admin/login';
      return;
    }
    
    const userRole = localStorage.getItem('userRole');
    const endpoint = userRole === 'admin' 
      ? 'http://localhost:5000/api/admin/profile'
      : 'http://localhost:5000/api/admin/user-profile';
    
    const response = await fetch(endpoint, {
      headers: getAuthHeaders()
    });
    
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.clear();
      window.location.href = '/admin/login';
      return;
    }
    
    const data = await response.json();
    if (data.success) {
      setProfile(data.profile);
    } else {
      console.error('Failed to fetch profile:', data.error);
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchProfile();
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get active permissions from the profile
  const getActivePermissions = () => {
    if (!profile || !profile.permissions) return [];
    
    const permissionNames = [
      'Dashboard',
      'Users',
      'Customer',
      'Catalog',
      'Product',
      'Bookings',
      'Reports',
      'Settings'
    ];
    
    return permissionNames.filter(permission => 
      profile.permissions[permission] === true
    );
  };

  // Check if user has any specific permissions (not admin)
  const hasSpecificPermissions = () => {
    if (!profile || !profile.permissions) return false;
    
    // Admins have all permissions, so check if any specific ones are true
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'admin') return false;
    
    return getActivePermissions().length > 0;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="text-center">
          <p className="text-muted">Profile not found</p>
        </div>
      </div>
    );
  }

  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';
  const activePermissions = getActivePermissions();

  return (
    <div>
      <Card className="shadow-lg">
        <Card.Body style={{marginLeft:"25px",marginRight:"25px"}}>
          <h5 className="fw-semibold mb-0">Profile</h5>
        </Card.Body>
      </Card>
      <br />
      
      <Card className="border-0 shadow-lg">
        <Card.Body style={{marginLeft:"25px",marginRight:"25px"}}>
          {/* Profile Header */}
          <div className="text-center mb-4">
            <div className="mb-3">
              {profile.profileImage ? (
                <img 
                  src={`http://localhost:5000${profile.profileImage}`} 
                  alt={profile.name}
                  className="rounded-circle"
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    objectFit: 'cover',
                    border: '3px solid #e0e0e0'
                  }}
                />
              ) : (
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontSize: '32px',
                    fontWeight: '600'
                  }}
                >
                  {getInitials(profile.name)}
                </div>
              )}
            </div>
            
            <h4 className="mb-2">{profile.name}</h4>

            <div className="d-flex justify-content-center gap-2">
              
              <h6 bg={isAdmin ? 'warning' : 'info'}>
                {isAdmin ? 'Admin' : 'User'}
              </h6>
            </div>
          </div>

          {/* Profile Details in simple vertical layout */}
          <div className=" pt-4">
            
            {/* Email */}
            <div className="mb-4">
              <h6 className="text-muted mb-2">Email</h6>
              <p className="mb-0 fs-5">{profile.email}</p>
            </div>
            
            {/* Designation */}
            {profile.designation && (
              <div className="mb-4">
                <h6 className="text-muted mb-2">Designation</h6>
                <p className="mb-0 fs-5">{profile.designation}</p>
              </div>
            )}
            
            {/* Permissions Section */}
            <div className="mb-4">
              <h6 className="text-muted mb-2">Permissions</h6>
              
              {isAdmin ? (
                <div>
                  <Badge bg="warning" className="px-3 py-2 mb-2 fs-6">
                    Full Administrative Access
                  </Badge>
                  <p className="text-muted small mb-0">
                    You have access to all system modules and features
                  </p>
                </div>
              ) : activePermissions.length > 0 ? (
                <div>
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {activePermissions.map((permission, index) => (
                      <Badge key={index} bg="primary" className="px-3 py-2">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-muted small mb-0">
                    You have access to {activePermissions.length} module(s)
                  </p>
                </div>
              ) : (
                <div>
                  <Badge bg="secondary" className="px-3 py-2 mb-2">
                    No Specific Permissions
                  </Badge>
                  <p className="text-muted small mb-0">
                    You don't have access to any specific modules
                  </p>
                </div>
              )}
            </div>
            
            {/* All Permissions List (for reference) */}
            <div className="mb-4">
              <h6 className="text-muted mb-2">Available System Modules</h6>
              <div className="row">
                {[
                  'Dashboard',
                  'Users', 
                  'Customer',
                  'Catalog',
                  'Product',
                  'Bookings',
                  'Reports',
                  'Settings'
                ].map((module, index) => {
                  const hasAccess = isAdmin || (profile.permissions && profile.permissions[module] === true);
                  
                  return (
                    <div key={index} className="col-6 col-md-4 mb-2">
                      <div className="d-flex align-items-center">
                        <div 
                          className={`rounded-circle me-2 ${hasAccess ? 'bg-success' : 'bg-secondary'}`}
                          style={{ width: '8px', height: '8px' }}
                        />
                        <span className={hasAccess ? 'text-dark' : 'text-muted'}>
                          {module}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Joined Date */}
            {profile.createdAt && (
              <div className="mb-4">
                <h6 className="text-muted mb-2">Joined Date</h6>
                <p className="mb-0 fs-5">{formatDate(profile.createdAt)}</p>
              </div>
            )}
            
            {/* Account Status */}
            <div className="mb-4">
              <h6 className="text-muted mb-2">Account Status</h6>
              <div className="d-flex align-items-center gap-2">
                <Badge bg={profile.isActive ? 'success' : 'danger'} className="px-3 py-2">
                  {profile.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <span className={profile.isActive ? 'text-success' : 'text-danger'}>
                  {profile.isActive ? 'Your account is active' : 'Your account is inactive'}
                </span>
              </div>
            </div>
            
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Profile;