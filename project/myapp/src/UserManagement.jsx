import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Form, Button, Alert,
  Table, Badge, Modal, InputGroup
} from 'react-bootstrap';
import { MdModeEdit, MdOutlineDelete } from "react-icons/md";
import { IoEyeSharp } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import TableControls from './TableControls';
import {
  prepareUserDataForExport,
  getCSVHeadersFromData,
  exportAsPDF,
  exportAsExcel,
  exportAsCSV
} from './downloadUtils';

function UserManagement({ isAdding, isEditing, userId }) {
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userPerPage, setUserPerPage] = useState(10);
  const [userTotalItems, setUserTotalItems] = useState(0);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    password: '',
    permissions: {
      Dashboard: false,
      Users: false,
      Customer: false,
      Catalog: false,
      Product: false,
      Bookings: false,
      Reports: false,
      Settings: false
    }
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAllUsers, setSelectAllUsers] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [editUserId, setEditUserId] = useState(null);
  const [isEditingUser, setIsEditingUser] = useState(isEditing || false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Auth User Data for Permission Filtering
  const [currentUserRole, setCurrentUserRole] = useState('admin');
  const [currentUserPermissions, setCurrentUserPermissions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('adminPermissions') || '{}');
    } catch {
      return {};
    }
  });

  const getAuthToken = () => {
    return localStorage.getItem('adminToken');
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchUsers = async (page = 1, search = '', perPage = userPerPage) => {
    try {
      let url = `${window.API_URL}/api/admin/users?page=${page}&limit=${perPage}&search=${search}`;

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      const data = await response.json();

      if (data.success) {
        setUsers(data.users || []);
        setUserTotalPages(data.pagination?.pages || 1);
        setUserTotalItems(data.pagination?.total || 0);
        setSelectedUsers([]);
        setSelectAllUsers(false);
        setUserPerPage(perPage);
        setUserPage(page);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    setIsEditingUser(!!isEditing);
    if (!isAdding && !isEditing) {
      fetchUsers();
    }
    if (isEditing && userId) {
      fetchUserDetails(userId);
    }
  }, [isAdding, isEditing, userId]);

  const fetchUserDetails = async (id) => {
    try {
      const response = await fetch(`${window.API_URL}/api/admin/users/${id}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        handleEditUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  // Field-by-field validation
  const validateField = (name, value) => {
    const errors = { ...formErrors };

    switch (name) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Name is required';
        } else {
          delete errors.name;
        }
        break;

      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errors.email = 'Email is invalid';
        } else {
          delete errors.email;
        }
        break;

      case 'phone':
        if (!value.trim()) {
          errors.phone = 'Phone is required';
        } else if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) {
          errors.phone = 'Phone must be 10 digits';
        } else {
          delete errors.phone;
        }
        break;

      case 'designation':
        if (!value) {
          errors.designation = 'Designation is required';
        } else {
          delete errors.designation;
        }
        break;

      case 'password':
        const isPasswordPlaceholder = value === '********';
        const isPasswordEmpty = value.trim() === '';

        if (!isEditingUser) {
          if (!value || value.trim() === '') {
            errors.password = 'Password is required';
          } else if (value.length < 6) {
            errors.password = 'Password must be at least 6 characters';
          } else {
            delete errors.password;
          }
        } else {
          if (!isPasswordPlaceholder && !isPasswordEmpty) {
            if (value.length < 6) {
              errors.password = 'Password must be at least 6 characters';
            } else {
              delete errors.password;
            }
          } else {
            delete errors.password;
          }
        }
        break;

      case 'confirmPassword':
        const isPasswordPlaceholderCP = newUser.password === '********';
        const isPasswordEmptyCP = newUser.password.trim() === '';

        if (!isEditingUser) {
          if (!value) {
            errors.confirmPassword = 'Please confirm password';
          } else if (newUser.password !== value) {
            errors.confirmPassword = 'Passwords do not match';
          } else {
            delete errors.confirmPassword;
          }
        } else {
          if (!isPasswordPlaceholderCP && !isPasswordEmptyCP) {
            if (!value) {
              errors.confirmPassword = 'Please confirm password';
            } else if (newUser.password !== value) {
              errors.confirmPassword = 'Passwords do not match';
            } else {
              delete errors.confirmPassword;
            }
          } else if (isPasswordPlaceholderCP && value && value.trim() !== '') {
            errors.confirmPassword = 'Please leave confirm password empty if not changing password';
          } else {
            delete errors.confirmPassword;
          }
        }
        break;

      default:
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (field, value) => {
    if (field === 'password') {
      setNewUser({ ...newUser, password: value });
    } else if (field === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setNewUser({ ...newUser, [field]: value });
    }

    // Auto-validate if field was touched before
    if (touchedFields[field]) {
      validateField(field, value);
    }
  };

  const handleFieldBlur = (field) => {
    setTouchedFields({ ...touchedFields, [field]: true });

    let value;
    if (field === 'password') {
      value = newUser.password;
    } else if (field === 'confirmPassword') {
      value = confirmPassword;
    } else {
      value = newUser[field];
    }

    validateField(field, value);
  };

  const validateUserForm = () => {
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(newUser).forEach(key => {
      if (key !== 'permissions') allTouched[key] = true;
    });

    const isPasswordPlaceholder = newUser.password === '********';
    const isPasswordEmpty = newUser.password.trim() === '';

    if (!isEditingUser || (!isPasswordPlaceholder && !isPasswordEmpty)) {
      allTouched.password = true;
      allTouched.confirmPassword = true;
    }

    setTouchedFields(allTouched);

    // Validate all fields
    const errors = {};

    if (!newUser.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!newUser.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      errors.email = 'Email is invalid';
    }

    if (!newUser.phone.trim()) {
      errors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(newUser.phone.replace(/\D/g, ''))) {
      errors.phone = 'Phone must be 10 digits';
    }

    if (!newUser.designation) {
      errors.designation = 'Designation is required';
    }

    const isPasswordPlaceholderVal = newUser.password === '********';
    const isPasswordEmptyVal = newUser.password.trim() === '';

    if (!isEditingUser) {
      if (!newUser.password || newUser.password.trim() === '') {
        errors.password = 'Password is required';
      } else if (newUser.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }

      if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm password';
      } else if (newUser.password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    } else {
      if (!isPasswordPlaceholderVal && !isPasswordEmptyVal) {
        if (newUser.password.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        }

        if (!confirmPassword) {
          errors.confirmPassword = 'Please confirm password';
        } else if (newUser.password !== confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
      } else if (isPasswordPlaceholderVal && confirmPassword && confirmPassword.trim() !== '') {
        errors.confirmPassword = 'Please leave confirm password empty if not changing password';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!validateUserForm()) {
      setFormError("Please fix the errors in the form");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newUser.name);
      formData.append('email', newUser.email);
      formData.append('phone', newUser.phone);
      formData.append('designation', newUser.designation);

      const isPasswordPlaceholder = newUser.password === '********';
      const isPasswordEmpty = newUser.password.trim() === '';

      if (!isPasswordPlaceholder && !isPasswordEmpty) {
        formData.append('password', newUser.password);
      }

      formData.append('permissions', JSON.stringify(newUser.permissions));
      formData.append('isActive', newUser.isActive !== undefined ? newUser.isActive : true);

      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      const url = isEditingUser
        ? `${window.API_URL}/api/admin/users/${editUserId}`
        : `${window.API_URL}/api/admin/users`;

      const method = isEditingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setFormSuccess(true);
        if (!isEditingUser) {
          resetForm();
        }
        setFormErrors({});
        setTouchedFields({});
      } else {
        setFormError(data.error || (isEditingUser ? 'Failed to update user' : 'Failed to add user'));
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setFormError(`Failed to ${isEditingUser ? 'update' : 'add'} user. Please try again.`);
    }
  };

  const resetForm = () => {
    setNewUser({
      name: '',
      email: '',
      phone: '',
      designation: '',
      password: '',
      permissions: {
        Dashboard: false,
        Users: false,
        Customer: false,
        Catalog: false,
        Product: false,
        Bookings: false,
        Reports: false,
        Settings: false
      }
    });
    setConfirmPassword('');
    setProfileImage(null);
    setProfileImagePreview("");
    setFormErrors({});
    setTouchedFields({});
    setEditUserId(null);
    setIsEditingUser(false);
  };

  const handleEditUser = (userMember) => {
    setNewUser({
      name: userMember.name || '',
      email: userMember.email || '',
      phone: userMember.phone || '',
      designation: userMember.designation || '',
      password: '********',
      isActive: userMember.isActive !== undefined ? userMember.isActive : true,
      permissions: userMember.permissions || {
        Dashboard: false,
        Users: false,
        Customer: false,
        Catalog: false,
        Product: false,
        Bookings: false,
        Reports: false,
        Settings: false
      }
    });

    if (userMember.profileImage) {
      setProfileImagePreview(`${window.API_URL}${userMember.profileImage}`);
    } else {
      setProfileImagePreview("");
    }

    setEditUserId(userMember._id);
    setIsEditingUser(true);
    setProfileImage(null);
    setConfirmPassword('');
    setFormSuccess(false);
    setFormError('');
    setFormErrors({});
    setTouchedFields({});
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`${window.API_URL}/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
          alert('User deleted successfully');
          fetchUsers(userPage, userSearch, userPerPage);
        } else {
          alert(data.error || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleBulkDelete = async (selectedIds) => {
    if (selectedIds.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} user(s)?`)) {
      try {
        const response = await fetch(`${window.API_URL}/api/admin/bulk-delete`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            entity: 'users',
            ids: selectedIds
          })
        });

        const data = await response.json();
        if (data.success) {
          alert(`Successfully deleted ${selectedIds.length} user(s)`);
          setSelectedUsers([]);
          setSelectAllUsers(false);
          fetchUsers(userPage, userSearch, userPerPage);
        } else {
          alert(data.error || 'Failed to delete users');
        }
      } catch (error) {
        console.error('Error deleting users:', error);
        alert('Failed to delete users');
      }
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAllUsers = () => {
    if (selectAllUsers) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u._id));
    }
    setSelectAllUsers(!selectAllUsers);
  };

  const handleViewUser = (userMember) => {
    setSelectedUserDetails(userMember);
    setShowUserDetails(true);
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      // Update local state immediately
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId
            ? { ...user, isActive }
            : user
        )
      );

      if (selectedUserDetails && selectedUserDetails._id === userId) {
        setSelectedUserDetails(prev => ({ ...prev, isActive }));
      }

      const response = await fetch(`${window.API_URL}/api/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isActive })
      });

      const data = await response.json();

      if (!data.success) {
        // Revert
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId
              ? { ...user, isActive: !isActive }
              : user
          )
        );
        if (selectedUserDetails && selectedUserDetails._id === userId) {
          setSelectedUserDetails(prev => ({ ...prev, isActive: !isActive }));
        }
        alert(`Failed to update status: ${data.error}`);
      }
    } catch (error) {
      // Revert
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId
            ? { ...user, isActive: !isActive }
            : user
        )
      );
      if (selectedUserDetails && selectedUserDetails._id === userId) {
        setSelectedUserDetails(prev => ({ ...prev, isActive: !isActive }));
      }
      console.error('Error updating status:', error);
    }
  };

  const formatPermissions = (permissions) => {
    if (!permissions) return <Badge bg="dark" className="me-1 px-3 py-2">None</Badge>;

    const activePermissions = Object.entries(permissions)
      .filter(([key, value]) => value)
      .map(([key]) => key);

    if (activePermissions.length === 0) return <Badge bg="dark" className="me-1 px-3 py-2">None</Badge>;

    const permissionGradients = {
      'Dashboard': 'linear-gradient(135deg, #141E30 0%, #243B55 100%)',
      'Users': 'linear-gradient(135deg, #0F2027 0%, #203A43 100%)',
      'Customer': 'linear-gradient(135deg, #1A2980 0%, #26D0CE 100%)',
      'Catalog': 'linear-gradient(135deg, #232526 0%, #61809fff 100%)',
      'Product': 'linear-gradient(135deg, #8E0E00 0%, #1F1C18 100%)',
      'Bookings': 'linear-gradient(135deg, #3A1C71 0%, #d82739ff 50%, #FFAF7B 100%)',
      'Reports': 'linear-gradient(135deg, #16222A 0%, #3A6073 100%)',
      'Settings': 'linear-gradient(135deg, #000000 0%, #434343 100%)'
    };

    return (
      <div className="d-flex flex-wrap" style={{ gap: '6px' }}>
        {activePermissions.map((permission) => {
          const gradient = permissionGradients[permission] || 'linear-gradient(135deg, #2C3E50 0%, #4CA1AF 100%)';
          const textColor = '#ffffff';

          return (
            <span
              key={permission}
              className="badge"
              style={{
                background: gradient,
                color: textColor,
                borderRadius: '15px',
                fontSize: "13.5px",
                boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
                lineHeight: '1.4',
                display: 'inline-flex',
                minHeight: '28px'
              }}>
              {permission}
            </span>
          );
        })}
      </div>
    );
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

  const displayPassword = () => {
    return '••••••';
  };

  if (isAdding || isEditingUser) {
    return (
      <div className="p-3">
        <Card className="shadow-lg">
          <Card.Body style={{ marginLeft: "25px", marginRight: "25px" }}>
            <h5 className="mb-0 fw-semibold">
              {isEditingUser ? 'Edit User' : (
                <>
                  User Management
                  <span className="text-muted mx-2" style={{ fontSize: "14px", fontWeight: "normal" }}>•</span>
                  <span className="text-muted " style={{ fontSize: "14px", fontWeight: "normal" }}>New User</span>
                </>
              )}
            </h5>
          </Card.Body>
        </Card>

        <br />

        <Card className="shadow-lg">
          <Card.Body className="p-6" style={{ marginLeft: "25px", marginRight: "25px" }}>
            {formSuccess && (
              <Alert variant="success" style={{ height: "50px" }} onClose={() => setFormSuccess(false)} dismissible>
                <p>{isEditingUser ? 'User updated successfully' : 'User has been added successfully'}</p>
              </Alert>
            )}

            {formError && (
              <Alert variant="danger" onClose={() => setFormError('')} dismissible>
                <Alert.Heading>Error!</Alert.Heading>
                <p>{formError}</p>
              </Alert>
            )}

            <div className="mb-4">
              {isEditingUser ? (
                <>
                  <h5 className="fw-semibold mb-1">Edit user</h5>
                  <p className='text-muted' style={{ fontSize: "12px" }}>Update the user profile</p>
                </>
              ) : (
                <>
                  <h5 className="fw-semibold mb-1">New user </h5>
                  <p className='text-muted' style={{ fontSize: "12px" }}>Use the below form to create a new profile</p>
                </>
              )}
            </div>

            <Form onSubmit={handleAddUser} className="pt-2" noValidate>
              {/* First Row with Name and Email */}
              <Row className="mb-4 gx-5">
                <Col md={6}>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      className={`cate py-3 ${touchedFields.name && formErrors.name ? 'is-invalid' : ''}`}
                      value={newUser.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      onBlur={() => handleFieldBlur('name')}
                      required
                      placeholder="Name"
                      autoComplete="name"
                    />
                    {touchedFields.name && formErrors.name && (
                      <small className="text-danger d-block mt-1">{formErrors.name}</small>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Control
                      type="email"
                      className={`cate py-3 ${touchedFields.email && formErrors.email ? 'is-invalid' : ''}`}
                      value={newUser.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      onBlur={() => handleFieldBlur('email')}
                      required
                      placeholder="E-mail"
                      autoComplete="email"
                    />
                    {touchedFields.email && formErrors.email && (
                      <small className="text-danger d-block mt-1">{formErrors.email}</small>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              {/* Second Row with Contact Number and Designation */}
              <Row className="mb-4 gx-5">
                <Col md={6}>
                  <Form.Group>
                    <Form.Control
                      type="tel"
                      className={`py-3 ${touchedFields.phone && formErrors.phone ? 'is-invalid' : ''}`}
                      style={{
                        borderRadius: "5px",
                        border: touchedFields.phone && formErrors.phone ? "2px solid #dc3545" : "2px solid #000000",
                        height: "45px"
                      }}
                      value={newUser.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      onBlur={() => handleFieldBlur('phone')}
                      required
                      placeholder="Contact number"
                      autoComplete="tel"
                    />
                    {touchedFields.phone && formErrors.phone && (
                      <small className="text-danger d-block mt-1">{formErrors.phone}</small>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Select
                      value={newUser.designation}
                      className={`cate ${touchedFields.designation && formErrors.designation ? 'is-invalid' : ''}`}
                      onChange={(e) => handleFieldChange('designation', e.target.value)}
                      onBlur={() => handleFieldBlur('designation')}
                      required
                    >
                      <option value="">Select Designation</option>
                      <option value="Manager">Manager</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Technician">Technician</option>
                      <option value="Customer Support">Customer Support</option>
                      <option value="Admin">Admin</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                    {touchedFields.designation && formErrors.designation && (
                      <small className="text-danger d-block mt-1">{formErrors.designation}</small>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              {/* Password Fields */}
              <Row className="mb-4 gx-5">
                <Col md={3}>
                  <Form.Group>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        className={`cate py-3 ${touchedFields.password && formErrors.password ? 'is-invalid' : ''}`}
                        value={newUser.password}
                        onChange={(e) => handleFieldChange('password', e.target.value)}
                        onBlur={() => handleFieldBlur('password')}
                        placeholder="Password"
                        autoComplete={isEditingUser ? "off" : "new-password"}
                        required={!isEditingUser}
                        style={{
                          border: touchedFields.password && formErrors.password ? "2px solid #dc3545" : "2px solid #000000",
                          borderRight: "none",
                          height: "45px",
                          borderTopRightRadius: 0,
                          borderBottomRightRadius: 0
                        }}
                      />
                      <Button
                        variant="outline-secondary"
                        style={{
                          backgroundColor: "white",
                          borderColor: touchedFields.password && formErrors.password ? "#dc3545" : "#000000",
                          borderWidth: "2px",
                          borderLeft: "none",
                          height: "45px",
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0
                        }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash size={14} color="#6c757d" /> : <FaEye size={14} color="#6c757d" />}
                      </Button>
                    </InputGroup>
                    {touchedFields.password && formErrors.password && (
                      <small className="text-danger d-block mt-1">{formErrors.password}</small>
                    )}
                    {isEditingUser && (
                      <small className="text-muted d-block mt-1">
                        Leave as "********" to keep current password
                      </small>
                    )}
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <InputGroup>
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        className={`cate py-3 ${touchedFields.confirmPassword && formErrors.confirmPassword ? 'is-invalid' : ''}`}
                        value={confirmPassword}
                        onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                        onBlur={() => handleFieldBlur('confirmPassword')}
                        placeholder="Confirm password"
                        autoComplete={isEditingUser ? "off" : "new-password"}
                        required={!isEditingUser}
                        style={{
                          border: touchedFields.confirmPassword && formErrors.confirmPassword ? "2px solid #dc3545" : "2px solid #000000",
                          borderRight: "none",
                          height: "45px",
                          borderTopRightRadius: 0,
                          borderBottomRightRadius: 0
                        }}
                      />
                      <Button
                        variant="outline-secondary"
                        style={{
                          backgroundColor: "white",
                          borderColor: touchedFields.confirmPassword && formErrors.confirmPassword ? "#dc3545" : "#000000",
                          borderWidth: "2px",
                          borderLeft: "none",
                          height: "45px",
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0
                        }}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <FaEyeSlash size={14} color="#6c757d" /> : <FaEye size={14} color="#6c757d" />}
                      </Button>
                    </InputGroup>
                    {touchedFields.confirmPassword && formErrors.confirmPassword && (
                      <small className="text-danger d-block mt-1">{formErrors.confirmPassword}</small>
                    )}
                    {isEditingUser && (
                      <small className="text-muted d-block mt-1">
                        Leave empty if not changing password
                      </small>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <div className="d-flex gap-3">
                      <Form.Control
                        type="file"
                        accept="image/*"
                        className="cate"
                        style={{ border: "2px solid #000000", height: "45px", paddingTop: "10px" }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setProfileImage(file);
                            setProfileImagePreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                      {profileImagePreview && (
                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: "2px solid #000000" }}>
                          <img
                            src={profileImagePreview}
                            alt="Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                      )}
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {/* Permissions Section */}
              <Form.Group className="my-4">
                <Form.Label className='fw-semibold mb-43' style={{ fontSize: "14px" }}>Permissions</Form.Label>
                <div className="px-1">
                  <Row className="gy-2 gx-5">
                    {[
                      'Dashboard',
                      'Users',
                      'Customer',
                      'Catalog',
                      'Product',
                      'Bookings',
                      'Reports',
                      'Settings'
                    ].filter(permission => {
                      // If admin, show all. If user, show only what they have.
                      if (currentUserRole === 'admin') return true;
                      return currentUserPermissions && currentUserPermissions[permission];
                    }).map((permission) => (
                      <Col xs={6} sm={4} md={3} lg={2} key={permission}>
                        <div
                          className="d-flex align-items-center p-2 rounded"
                          style={{
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            backgroundColor: newUser.permissions[permission] ? '#e9ecef' : 'transparent'
                          }}
                          onClick={() => setNewUser({
                            ...newUser,
                            permissions: {
                              ...newUser.permissions,
                              [permission]: !newUser.permissions[permission]
                            }
                          })}
                        >
                          <Form.Check
                            type="checkbox"
                            id={`permission-${permission}`}
                            label={permission}
                            checked={newUser.permissions[permission] || false}
                            onChange={(e) => setNewUser({
                              ...newUser,
                              permissions: {
                                ...newUser.permissions,
                                [permission]: e.target.checked
                              }
                            })}
                            className="mb-0"
                            style={{
                              fontSize: "13px",
                              '--bs-border-width': '2px',
                              '--bs-border-color': '#000000',
                            }}
                          />
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              </Form.Group>

              {/* Action Buttons */}
              <div className="d-flex justify-content-center gap-3 mt-4">
                <Button
                  variant="outline-dark"
                  onClick={() => {
                    resetForm();
                    window.history.back();
                  }}
                  style={{ minWidth: '100px', borderRadius: "50px" }}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  variant="dark"
                  type="submit"
                  style={{ minWidth: '100px', borderRadius: "50px" }}
                >Submit
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div >
    );
  }

  return (
    <div>
      <Card className="shadow-lg">
        <Card.Body style={{ marginLeft: "23px", marginRight: "10px" }}>
          <h5 className="mb-0 fw-semibold">
            User Management
            <span className="text-muted mx-2" style={{ fontSize: "14px", fontWeight: "normal" }}>•</span>
            <span className="text-muted" style={{ fontSize: "14px", fontWeight: "normal" }}>Manage Users</span>
          </h5>
        </Card.Body>
      </Card>
      <br />
      <Card className="shadow-lg" style={{ border: "5px" }}>
        <Card.Header className="border-0" style={{ backgroundColor: "white" }}>
          <Row style={{ marginLeft: "12px", marginRight: "10px" }}>
            <Col style={{ marginTop: "10px" }}>
              <h5 className="mb-1 fw-semibold">Manage users</h5>
              <p className='text-muted' style={{ fontSize: "10.5px" }}>Use this form to update user profiles</p>
            </Col>
            <Col>
              <TableControls
                itemsPerPage={userPerPage}
                onItemsPerPageChange={(perPage) => {
                  setUserPerPage(perPage);
                  fetchUsers(1, userSearch, perPage);
                }}
                currentPage={userPage}
                totalPages={userTotalPages}
                totalItems={userTotalItems}
                onPageChange={(page) => {
                  setUserPage(page);
                  fetchUsers(page, userSearch, userPerPage);
                }}
                searchValue={userSearch}
                onSearchChange={(e) => {
                  setUserSearch(e.target.value);
                  fetchUsers(1, e.target.value, userPerPage);
                }}
                searchPlaceholder="Search users..."
                onDownloadPDF={() => {
                  const tableElement = document.querySelector('.table');
                  exportAsPDF(tableElement, 'users');
                }}
                onDownloadExcel={() => {
                  const userData = prepareUserDataForExport(users);
                  exportAsExcel(userData, 'users');
                }}
                onDownloadCSV={() => {
                  const userData = prepareUserDataForExport(users);
                  const headers = getCSVHeadersFromData(userData);
                  exportAsCSV(userData, headers, 'users');
                }}
                selectedCount={selectedUsers.length}
                onBulkDelete={() => handleBulkDelete(selectedUsers)}
                showBulkActions={false}
                bulkEntityName="users"
              />
            </Col>
          </Row>
        </Card.Header>
        <Card.Body style={{ marginLeft: "20px", marginRight: "20px" }}>

          {selectedUsers.length > 0 && (
            <Alert variant="dark" className="d-flex justify-content-between align-items-center mb-3">
              <span>
                <i className="bi bi-check-circle-fill me-2"></i>
                {selectedUsers.length} user(s) selected
              </span>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleBulkDelete(selectedUsers)}
              >
                Delete Selected
              </Button>
            </Alert>
          )}

          <div style={{ overflowX: "auto" }}>
            <Table striped bordered hover size="sm" style={{ border: "2px solid", fontSize: "14px" }}>
              <thead>
                <tr>
                  <th>
                    <Form.Check
                      type="checkbox"
                      checked={selectAllUsers}
                      onChange={handleSelectAllUsers}
                      className='check'
                    />
                  </th>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact no</th>
                  <th>Password</th>
                  <th>Permissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleUserSelect(user._id)}
                        className='check'
                      />
                    </td>

                    <td>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid #dee2e6'
                      }}>
                        {user.profileImage ? (
                          <img
                            src={`${window.API_URL}${user.profileImage}`}
                            alt={user.name}
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
                            {getInitials(user.name)}
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      {user.name}
                    </td>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: '200px' }}>
                        {user.email}
                      </div>
                    </td>
                    <td>{user.phone}</td>
                    <td>
                      {displayPassword()}
                    </td>
                    <td>
                      <div style={{ maxWidth: '200px' }}>
                        {formatPermissions(user.permissions)}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          title="Edit User"
                        >
                          <MdModeEdit />
                        </Button>
                        <Button
                          variant="dark"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                          title="View User Details"
                        >
                          <IoEyeSharp />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => deleteUser(user._id)}
                          title="Delete User"
                        >
                          <MdOutlineDelete />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* User Details Modal */}
      <Modal show={showUserDetails} onHide={() => setShowUserDetails(false)} centered>

        <Modal.Body
          className="p-4"
          tabIndex={0}
        >

          {selectedUserDetails && (
            <div>
              <div className="text-center mb-4">
                <div className="mb-3">
                  {selectedUserDetails.profileImage ? (
                    <img
                      src={`${window.API_URL}${selectedUserDetails.profileImage}`}
                      alt={selectedUserDetails.name}
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid #dee2e6'
                      }}

                    />
                  ) : (
                    <div style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '32px',
                      margin: '0 auto',
                      border: '3px solid #dee2e6'
                    }}>
                      {getInitials(selectedUserDetails.name)}
                    </div>
                  )}
                </div>
                <h5 className="mb-1">{selectedUserDetails.name}</h5>
                <p className="text-muted mb-3">{selectedUserDetails.designation}</p>
              </div>

              <div className="list-group list-group-flush">
                <div className="list-group-item px-0 border-top-0">
                  <small className="text-muted d-block">Email</small>
                  <span>{selectedUserDetails.email}</span>
                </div>
                <div className="list-group-item px-0">
                  <small className="text-muted d-block">Phone</small>
                  <span>{selectedUserDetails.phone}</span>
                </div>
                <div className="list-group-item px-0">
                  <small className="text-muted d-block">Active Permissions</small>
                  <span>
                    {Object.entries(selectedUserDetails.permissions || {})
                      .filter(([key, value]) => value)
                      .map(([permission]) => permission)
                      .join(', ')}
                  </span>
                </div>
                <div className="list-group-item px-0">
                  <small className="text-muted d-block">Status</small>
                  <Form.Check
                    type="switch"
                    id="user-status-switch"
                    checked={selectedUserDetails.isActive}
                    onChange={(e) => updateUserStatus(selectedUserDetails._id, e.target.checked)}
                    label={selectedUserDetails.isActive ? 'Active' : 'Inactive'}
                  />
                </div>
                <div className="list-group-item px-0 border-bottom-0">
                  <small className="text-muted d-block">Member Since</small>
                  <span>
                    {selectedUserDetails.createdAt ? new Date(selectedUserDetails.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowUserDetails(false)} style={{ borderRadius: "50px" }}>
            Close
          </Button>
          <Button
            variant="dark" style={{ borderRadius: "50px" }}
            onClick={() => {
              setShowUserDetails(false);
              handleEditUser(selectedUserDetails);
            }}
          >
            Edit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default UserManagement;
