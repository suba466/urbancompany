import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { useAdminAuth } from './hooks'; // Import from hooks

function AdminLogin({ onLogin }) {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [errorLocal, setErrorLocal] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const logoUrl = 'http://localhost:5000/assets/Uc.png';

  const { login, token, isAuthenticated, error: authError, loading: authLoading } = useAdminAuth();

  // Check for existing token on component mount
  useEffect(() => {
    if (isAuthenticated && token) {
      console.log("Auto-login with existing token");
      // Pass 'admin' role explicitly or derive from store
      onLogin(token, 'admin');
    }
  }, [isAuthenticated, token, onLogin]);

  // Sync auth state to local state if needed, or just use auth vars
  useEffect(() => {
    if (authError) setErrorLocal(authError);
  }, [authError]);

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

    setTouched({ email: true, password: true });

    const emailError = validateEmail(loginData.email);
    const passwordError = validatePassword(loginData.password);

    if (emailError || passwordError) {
      setErrorLocal(emailError || passwordError);
      return;
    }

    setLoadingLocal(true);
    setErrorLocal('');

    try {
      // Use Admin Auth login
      await login(loginData.email, loginData.password);
      // Success handled by useEffect
    } catch (error) {
      console.error('Login error:', error);
      setErrorLocal(error.message || 'Login failed');
    } finally {
      setLoadingLocal(false);
    }
  };

  const emailError = touched.email ? validateEmail(loginData.email) : '';
  const passwordError = touched.password ? validatePassword(loginData.password) : '';
  return (
    <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      <Container fluid className="px-3 px-lg-5 d-flex justify-content-center">
        <Row className="justify-content-center w-100" style={{ maxWidth: "1000px" }}>
          <Col xs={12} lg={10} xl={8} xxl={7}>
            <div className='shadow-lg bg-white' style={{ borderRadius: "15px", overflow: "hidden" }}>
              <Row className="g-0">
                <Col lg={6} className='d-none d-lg-block'>
                  <div
                    style={{
                      background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "white",
                      padding: "2rem"
                    }}
                  >

                    <div className="text-center mb-3">
                      <div className="bg-white p-3 rounded-circle shadow-sm d-inline-block mb-3">
                        <img
                          src={logoUrl}
                          alt="Urban Company Admin"
                          style={{
                            width: "90px",
                            height: "90px",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    </div>

                    <h3 className="text-center mb-1 fw-bold">Urban Company</h3>
                    <p className="text-center mb-0 opacity-75" style={{ fontSize: "1rem" }}>
                      Enterprise Administration Portal
                    </p>
                  </div>
                </Col>

                <Col xs={12} lg={6}>
                  <Card style={{ border: "0px", boxShadow: "none", height: "100%" }}>
                    <Card.Body className="p-4 d-flex flex-column justify-content-center">
                      <div className="mb-3">
                        <h4 className='fw-bold mb-2'>Admin Login</h4>
                        <p className='text-muted mb-2'>Please sign in to continue</p>
                        {errorLocal && !emailError && !passwordError && (
                          <div className="alert alert-danger mt-2 py-2">{errorLocal}</div>
                        )}
                      </div>
                      <Form onSubmit={handleLogin} noValidate>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold mb-1">Username</Form.Label>
                          <Form.Control
                            type="email"
                            placeholder="Enter your email"
                            value={loginData.email}
                            onChange={(e) => {
                              setLoginData({ ...loginData, email: e.target.value });
                              if (touched.email) {
                                setErrorLocal('');
                              }
                            }}
                            onBlur={handleBlur('email')}
                            required
                            className={`cate py-2 ps-3 ${emailError ? 'is-invalid' : ''}`}
                            autoComplete="username"
                            style={{ fontSize: "1rem" }}
                          />
                          {emailError && (
                            <div className="text-danger small mt-1">
                              {emailError}
                            </div>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold mb-1">Password</Form.Label>
                          <InputGroup hasValidation>
                            <Form.Control
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              value={loginData.password}
                              onChange={(e) => {
                                setLoginData({ ...loginData, password: e.target.value });
                                if (touched.password) {
                                  setErrorLocal('');
                                }
                              }}
                              onBlur={handleBlur('password')}
                              required
                              className={`cate py-2 ps-3 ${passwordError ? 'is-invalid' : ''}`}
                              autoComplete="current-password"
                              style={{
                                fontSize: "1rem",
                                borderRight: "none",
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0
                              }}
                            />
                            <Button
                              variant="outline-secondary"
                              onClick={() => setShowPassword(!showPassword)}
                              style={{
                                backgroundColor: "white",
                                borderColor: "#000000ff",
                                borderLeft: "none",
                                zIndex: 0
                              }}
                             className={`cate py-2 ps-3 ${passwordError ? 'is-invalid' : ''}`}
                            >
                              {showPassword ? <FaEyeSlash color="#6c757d" /> : <FaEye color="#6c757d" />}
                            </Button>
                            {passwordError && (
                              <Form.Control.Feedback type="invalid">
                                {passwordError}
                              </Form.Control.Feedback>
                            )}
                          </InputGroup>
                        </Form.Group>

                        <Button
                          type="submit"
                          className="w-100 py-2 mb-3"
                          disabled={loadingLocal}
                          style={{
                            background: "#000000",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                          }}
                        >
                          {loadingLocal ? (
                            <>
                              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                              <span className="ms-2">Signing in...</span>
                            </>
                          ) : 'Sign In'}
                        </Button>
                      </Form>

                      <div className="border-top pt-3">
                        <h6 className="fw-bold mb-2">Admin credentials:</h6>
                        <div>
                          <div>
                            <p className='text-muted mb-0 small'>Username : admin@urbancompany.com</p>
                          </div>
                          <div>
                            <p className='text-muted mb-0 small'>Password : admin123</p>
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