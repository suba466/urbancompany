import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import API_URL from './config';

function Settings() {
  const [settings, setSettings] = useState({
    siteTitle: 'Urban Company',
    contactEmail: 'support@urbancompany.com',
    contactPhone: '1800-123-4567',
    address: '123 Business Street, City, Country'
  });

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      if (data.success) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  return (
    <div>
      <Card>
        <Card.Body style={{ marginLeft: "25px", marginRight: "25px" }}>
          <h5 className="fw-semibold mb-0">Settings Management</h5>
        </Card.Body>
      </Card><br />

      <Card className="border-0 shadow-lg">

        <Card.Body style={{ marginLeft: "25px", marginRight: "25px" }}>
          <div >
            <h5 className="mb-3">Settings</h5>
            <Row>
              <Col md={6}>
                <h6>Site Title</h6>
                <p>Urban company</p>
              </Col>
              <Col md={6}>
                <h6>Contact e-mail</h6>
                <p>support@urbancompany.com</p>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <h6>Contact Number</h6>
                <p>1800-234-890</p>
              </Col>
              <Col md={6}>
                <h6>Address</h6>
                <p>18, Rs puram, Coimbatore, India</p>
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card></div>
  );
}

export default Settings;