import React, { useState, useEffect } from 'react'; // Add useEffect
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';

function AdminLogin({ onLogin }) {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const logoUrl = 'http://localhost:5000/assets/Uc.png';

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole) {
      // Auto-login if token exists
      console.log("Auto-login with existing token");
      onLogin(token, userRole);
    }
  }, [onLogin]);

  // Validation functions
  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Email is invalid';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 3) return 'Password must be at least 3 characters';
    return '';
  };

  const handleBlur = (field) => () => {
    setTouched({ ...touched, [field]: true });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched on submit
    setTouched({ email: true, password: true });
    
    // Check for validation errors
    const emailError = validateEmail(loginData.email);
    const passwordError = validatePassword(loginData.password);
    
    if (emailError || passwordError) {
      setError(emailError || passwordError);
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const isAdminEmail = loginData.email.includes('@urbancompany.com') ||
        loginData.email.includes('admin');

      const endpoint = isAdminEmail
        ? 'http://localhost:5000/api/admin/login'
        : 'http://localhost:5000/api/admin/user-login';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user info
        localStorage.setItem('authToken', data.token);
        
        if (isAdminEmail) {
          localStorage.setItem('userRole', 'admin');
          localStorage.setItem('userPermissions', JSON.stringify(data.admin?.permissions || {}));
          localStorage.setItem('userInfo', JSON.stringify(data.admin || {}));
        } else {
          localStorage.setItem('userRole', 'user');
          localStorage.setItem('userPermissions', JSON.stringify(data.user?.permissions || {}));
          localStorage.setItem('userInfo', JSON.stringify(data.user || {}));
        }

        // Store login timestamp
        localStorage.setItem('loginTime', Date.now().toString());
        
        onLogin(data.token, isAdminEmail ? 'admin' : 'user');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const emailError = touched.email ? validateEmail(loginData.email) : '';
  const passwordError = touched.password ? validatePassword(loginData.password) : '';

  return (
    <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "100vh" }}>
      <Container fluid className="px-3 px-lg-5">
        <Row className="justify-content-center">
          <Col xs={12} lg={10} xl={8} xxl={7}>
            <div className='shadow-lg bg-white' style={{ borderRadius: "15px", overflow: "hidden" }}>
              <Row className="g-0">
                <Col lg={6} className='d-none d-lg-block'>
                  <div
                    style={{
                      background: "#000000",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "white",
                      padding: "3rem"
                    }}
                  >
                    <div className="text-center mb-4">
                      <img
                        src={logoUrl}
                        alt="Urban Company Admin"
                        style={{
                          width: "160px",
                          height: "160px",
                          objectFit: "contain",
                          backgroundColor: "white",
                          borderRadius: "50%",
                          padding: "20px"
                        }}
                      />
                    </div>

                    <h3 className="text-center mb-2" style={{ fontWeight: "bold", fontSize: "1.8rem" }}>Urban Company Admin</h3>
                    <p className="text-center mb-0" style={{ fontSize: "1.1rem" }}>Home service platform</p>
                  </div>
                </Col>

                <Col xs={12} lg={6}>
                  <Card style={{ border: "0px", boxShadow: "none", height: "100%" }}>
                    <Card.Body className="p-5">
                      <div className="mb-4">
                        <h4 className='fw-bold mb-2'>Admin Login</h4>
                        <p className='text-muted mb-3'>Please sign in to continue</p>
                        {error && !emailError && !passwordError && (
                          <div className="alert alert-danger mt-2 py-3">{error}</div>
                        )}
                      </div>
                      <Form onSubmit={handleLogin} noValidate>
                        <Form.Group className="mb-4">
                          <Form.Label className="small fw-bold mb-2">Username</Form.Label>
                          <Form.Control
                            type="email"
                            placeholder="Enter your email"
                            value={loginData.email}
                            onChange={(e) => {
                              setLoginData({ ...loginData, email: e.target.value });
                              if (touched.email) {
                                setError('');
                              }
                            }}
                            onBlur={handleBlur('email')}
                            required
                            className={`cate py-3 ${emailError ? 'is-invalid' : ''}`}
                            autoComplete="username"
                            style={{ fontSize: "1rem" }}
                          />
                          {emailError && (
                            <div className="text-danger small mt-1">
                              {emailError}
                            </div>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-5">
                          <Form.Label className="small fw-bold mb-2">Password</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="Enter your password"
                            value={loginData.password}
                            onChange={(e) => {
                              setLoginData({ ...loginData, password: e.target.value });
                              if (touched.password) {
                                setError('');
                              }
                            }}
                            onBlur={handleBlur('password')}
                            required
                            className={`cate py-3 ${passwordError ? 'is-invalid' : ''}`}
                            autoComplete="current-password"
                            style={{ fontSize: "1rem" }}
                          />
                          {passwordError && (
                            <div className="text-danger small mt-1">
                              {passwordError}
                            </div>
                          )}
                        </Form.Group>

                        <Button
                          type="submit"
                          className="w-100 py-3 mb-4"
                          disabled={loading}
                          style={{
                            background: "#000000",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                          }}
                        >
                          {loading ? (
                            <>
                              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                              <span className="ms-2">Signing in...</span>
                            </>
                          ) : 'Sign In'}
                        </Button>
                      </Form>

                      <div className="border-top pt-4">
                        <h6 className="fw-bold mb-3">Admin credentials:</h6>
                        <div>
                          <div>
                            <p className='text-muted mb-1'>Username : admin@urbancompany.com</p>
                          </div>
                          <div>
                            <p className='text-muted mb-1'>Password : admin123</p>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default AdminLogin;