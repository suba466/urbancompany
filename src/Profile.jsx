import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Spinner, Button, Modal, Form, Alert } from 'react-bootstrap';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    designation: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState({});

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

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userRole = localStorage.getItem('userRole');
      const endpoint = userRole === 'admin' 
        ? 'http://localhost:5000/api/admin/profile'
        : 'http://localhost:5000/api/admin/user-profile';
      
      const response = await fetch(endpoint, {
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
        setEditForm({
          name: data.profile.name || '',
          email: data.profile.email || '',
          phone: data.profile.phone || '',
          designation: data.profile.designation || ''
        });
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

  const validateEditForm = () => {
    const newErrors = {};
    if (!editForm.name.trim()) newErrors.name = 'Name is required';
    if (!editForm.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(editForm.email)) newErrors.email = 'Email is invalid';
    if (!editForm.phone.trim()) newErrors.phone = 'Phone is required';
    if (!editForm.designation.trim()) newErrors.designation = 'Designation is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    if (!passwordForm.currentPassword.trim()) newErrors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword.trim()) newErrors.newPassword = 'New password is required';
    else if (passwordForm.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (!passwordForm.confirmPassword.trim()) newErrors.confirmPassword = 'Please confirm password';
    else if (passwordForm.newPassword !== passwordForm.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormSuccess(false);
    setFormError('');
    
    if (!validateEditForm()) {
      setFormError('Please fix the errors in the form');
      return;
    }

    try {
      const userRole = localStorage.getItem('userRole');
      const endpoint = userRole === 'admin' 
        ? 'http://localhost:5000/api/admin/profile'
        : 'http://localhost:5000/api/admin/user-profile';
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editForm)
      });
      
      const data = await response.json();
      if (data.success) {
        setFormSuccess(true);
        fetchProfile();
        setTimeout(() => setShowEditModal(false), 2000);
      } else {
        setFormError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setFormError('Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setFormSuccess(false);
    setFormError('');
    
    if (!validatePasswordForm()) {
      setFormError('Please fix the errors in the form');
      return;
    }

    try {
      const userRole = localStorage.getItem('userRole');
      const endpoint = userRole === 'admin' 
        ? 'http://localhost:5000/api/admin/change-password'
        : 'http://localhost:5000/api/admin/user-change-password';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setFormSuccess(true);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setFormSuccess(false), 3000);
      } else {
        setFormError(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setFormError('Failed to change password');
    }
  };

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPermissions = (permissions) => {
    if (!permissions || typeof permissions !== 'object') return [];
    return Object.entries(permissions)
      .filter(([key, value]) => value)
      .map(([key]) => key);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-person-x" style={{ fontSize: '48px', color: '#6c757d' }}></i>
        <p className="mt-2">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="p-3">
      <Card className="p-3 shadow-lg">
        <div className="border-0 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">My Profile</h5>
          <Button 
            variant="dark" 
            onClick={() => setShowEditModal(true)}
            size="sm"
          >
            <i className="bi bi-pencil me-2"></i>Edit Profile
          </Button>
        </div>
      </Card>
      
      <br />
      
      <Row>
        <Col md={4}>
          <Card className="shadow-lg">
            <Card.Body className="text-center">
              <div className="mb-3">
                {profile.profileImage ? (
                  <img 
                    src={`http://localhost:5000${profile.profileImage}`} 
                    alt={profile.name}
                    style={{ 
                      width: '150px', 
                      height: '150px', 
                      objectFit: 'cover',
                      borderRadius: '50%',
                      border: '4px solid #dee2e6'
                    }}
                  />
                ) : (
                  <div style={{ 
                    width: '150px', 
                    height: '150px', 
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '48px',
                    margin: '0 auto',
                    border: '4px solid #dee2e6'
                  }}>
                    {getInitials(profile.name)}
                  </div>
                )}
              </div>
              <h4 className="mb-2">{profile.name}</h4>
              <Badge bg="success" className="mb-3" style={{ fontSize: '14px', padding: '6px 12px' }}>
                {profile.designation || 'User'}
              </Badge>
              <div className="mt-3">
                <Badge bg={profile.isActive ? 'success' : 'secondary'} className="me-2">
                  {profile.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge bg="info">
                  {localStorage.getItem('userRole') === 'admin' ? 'Admin' : 'User'}
                </Badge>
              </div>
            </Card.Body>
          </Card>

          {/* Change Password Card */}
          <Card className="shadow-lg mt-4">
            <Card.Header className="bg-white">
              <h6 className="mb-0">Change Password</h6>
            </Card.Header>
            <Card.Body>
              {formSuccess && activeTab === 'password' && (
                <Alert variant="success" onClose={() => setFormSuccess(false)} dismissible>
                  Password changed successfully!
                </Alert>
              )}
              
              {formError && activeTab === 'password' && (
                <Alert variant="danger" onClose={() => setFormError('')} dismissible>
                  {formError}
                </Alert>
              )}

              <Form onSubmit={handlePasswordSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    isInvalid={!!errors.currentPassword}
                    placeholder="Enter current password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.currentPassword}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    isInvalid={!!errors.newPassword}
                    placeholder="Enter new password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.newPassword}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    isInvalid={!!errors.confirmPassword}
                    placeholder="Confirm new password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button variant="dark" type="submit" className="w-100">
                  Change Password
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="shadow-lg h-100">
            <Card.Body>
              <div className="list-group list-group-flush">
                <div className="list-group-item">
                  <div className="row">
                    <div className="col-4 text-muted">Email</div>
                    <div className="col-8">
                      <strong>{profile.email}</strong>
                    </div>
                  </div>
                </div>
                
                {profile.phone && (
                  <div className="list-group-item">
                    <div className="row">
                      <div className="col-4 text-muted">Phone</div>
                      <div className="col-8">
                        <strong>{profile.phone}</strong>
                      </div>
                    </div>
                  </div>
                )}
                
                {profile.designation && (
                  <div className="list-group-item">
                    <div className="row">
                      <div className="col-4 text-muted">Designation</div>
                      <div className="col-8">
                        <strong>{profile.designation}</strong>
                      </div>
                    </div>
                  </div>
                )}
                
                {profile.permissions && (
                  <div className="list-group-item">
                    <div className="row">
                      <div className="col-4 text-muted">Permissions</div>
                      <div className="col-8">
                        <div className="d-flex flex-wrap gap-1">
                          {formatPermissions(profile.permissions).map((permission, index) => (
                            <Badge key={index} bg="secondary" className="me-1 mb-1">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="list-group-item">
                  <div className="row">
                    <div className="col-4 text-muted">Account Status</div>
                    <div className="col-8">
                      <Badge bg={profile.isActive ? 'success' : 'secondary'}>
                        {profile.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {profile.lastLogin && (
                  <div className="list-group-item">
                    <div className="row">
                      <div className="col-4 text-muted">Last Login</div>
                      <div className="col-8">
                        {formatDate(profile.lastLogin)}
                      </div>
                    </div>
                  </div>
                )}
                
                {profile.createdAt && (
                  <div className="list-group-item">
                    <div className="row">
                      <div className="col-4 text-muted">Account Created</div>
                      <div className="col-8">
                        {formatDate(profile.createdAt)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formSuccess && activeTab === 'profile' && (
            <Alert variant="success" onClose={() => setFormSuccess(false)} dismissible>
              Profile updated successfully!
            </Alert>
          )}
          
          {formError && activeTab === 'profile' && (
            <Alert variant="danger" onClose={() => setFormError('')} dismissible>
              {formError}
            </Alert>
          )}

          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                isInvalid={!!errors.name}
                placeholder="Enter your name"
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                isInvalid={!!errors.email}
                placeholder="Enter your email"
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                isInvalid={!!errors.phone}
                placeholder="Enter your phone number"
              />
              <Form.Control.Feedback type="invalid">
                {errors.phone}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Designation</Form.Label>
              <Form.Control
                type="text"
                value={editForm.designation}
                onChange={(e) => setEditForm({...editForm, designation: e.target.value})}
                isInvalid={!!errors.designation}
                placeholder="Enter your designation"
              />
              <Form.Control.Feedback type="invalid">
                {errors.designation}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button variant="dark" type="submit">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Profile;