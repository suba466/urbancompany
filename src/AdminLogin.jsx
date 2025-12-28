import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';

function AdminLogin({ onLogin }) {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const logoUrl = 'http://localhost:5000/assets/Uc.png';

  const handleLogin = async (e) => {
    e.preventDefault();
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
        localStorage.setItem('authToken', data.token);

        if (isAdminEmail) {
          localStorage.setItem('userRole', 'admin');
          localStorage.setItem('userPermissions', JSON.stringify(data.admin?.permissions || {}));
        } else {
          localStorage.setItem('userRole', 'user');
          localStorage.setItem('userPermissions', JSON.stringify(data.user?.permissions || {}));
        }

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

  return (
    <div className="d-flex justify-content-center align-items-start bg-light pt-5" style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
      <Row className="justify-content-center w-100 m-0">
        <Col xs={12} md={11} lg={10} xl={8}>
          <div className='shadow-lg bg-white' style={{ borderRadius: "15px", overflow: "hidden" }}>
            <Row className="g-0">
              <Col md={6} className='d-none d-md-block'>
                <div
                  style={{
                    background: "#000000",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "white",
                    padding: "1.5rem"
                  }}
                >
                  <div className="text-center mb-4">
                    <img
                      src={logoUrl}
                      alt="Urban Company Admin"
                      style={{
                        width: "140px",
                        height: "140px",
                        objectFit: "contain",
                        backgroundColor: "white",
                        borderRadius: "50%",
                        padding: "15px"
                      }}
                    />
                  </div>

                  <h3 className="text-center mb-2" style={{ fontWeight: "bold" }}>Urban Company Admin</h3>
                  <p className="text-center mb-0">Home service platform</p>
                </div>
              </Col>

              <Col xs={12} md={6} className="p-3">
                <Card style={{ border: "0px", boxShadow: "none" }}>
                  <Card.Body className="p-2">
                    <div className="mb-4">
                      <h5 className='fw-bold mb-1'>Admin Login</h5>
                      <p className='text-muted small mb-0'>Please sign in to continue</p>
                      {error && <div className="alert alert-danger mt-2 py-2 small">{error}</div>}
                    </div>
                    <Form onSubmit={handleLogin}>
                      <Form.Group className="mb-3">
                        <Form.Control
                          type="email"
                          placeholder="Username"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          required
                          className="cate py-2"
                          autoComplete="username"
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Control
                          type="password"
                          placeholder="Password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                          className="cate py-2"
                          autoComplete="current-password"
                        />
                      </Form.Group>

                      <Button
                        type="submit"
                        className="w-100 py-2 mb-4"
                        disabled={loading}
                        style={{
                          background: "#000000",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: "bold",
                          fontSize: "16px",
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

                    <div className="border-top pt-3">
                      <h6 className="small fw-bold mb-2">Admin credentials:</h6>
                      <p className='text-muted small mb-0'>Username: admin@urbancompany.com</p>
                      <p className='text-muted small mb-0'>Password: admin123</p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default AdminLogin;