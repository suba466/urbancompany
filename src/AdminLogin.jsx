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
    <Container className='d-flex justify-content-center align-items-center' style={{ minHeight: "100vh"}}>
      <Row className='w-75 shadow-lg' style={{ border: "1px solid #dee2e6", borderRadius: "15px", overflow: "hidden" }}>
        <Col md={6} className='p-0 d-none d-md-block' >
          <div 
            style={{
              background: "#000000",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              color: "white",
              padding: "3rem 2rem"
            }}
          >
            <div className="text-center mb-4">
              <img 
                src={logoUrl}
                alt="Urban Company Admin" 
                style={{ 
                  width: "180px", 
                  height: "180px", 
                  objectFit: "contain",
                  backgroundColor: "white",
                  borderRadius: "88px",
                  padding: "20px",
                  marginTop: "0px"
                }}
              />
            </div> <br />
            
            <h3 className="text-center mb-3" style={{ fontWeight: "bold" }}>Urban Company Admin</h3>
            <p className="text-center">Home service platform</p>
          </div>
        </Col>
        
        <Col xs={12} md={6} className="p-5">
          <Card style={{ border: "0px", boxShadow: "none", backgroundColor: "transparent" }}>
            <Card.Body className="p-0">
              <div className="mb-4">
                <h6 className='fw-semibold'>Admin Login</h6>
                {error && <div className="alert alert-danger">{error}</div>}
              </div>
              <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">  
                <Form.Control
                  type="email"
                  placeholder="Username"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  required
                  className="py-2"
                  style={{ borderRadius: "8px", border: "2px solid #000000ff" }}
                  autoComplete="username"
                />
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                  className="py-2"
                  style={{ borderRadius: "8px", border: "2px solid #000000ff" }}
                  autoComplete="current-password"
                />
              </Form.Group>
              
              <Button 
                type="submit" 
                className="w-100 py-3" 
                disabled={loading}
                style={{ 
                  background: "#000000",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  fontSize: "16px",
                  transition: "all 0.3s"
                }}
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">Signing in...</span>
                  </>
                ) : 'Sign In'}
              </Button>
            </Form> <br />
            <div >
              <h6 >Admin credentials:</h6>
              <p className='text-muted mb-0'>Username: admin@urbancompany.com</p>
              <p className='text-muted mb-0'>Password: admin123</p>
            </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AdminLogin;