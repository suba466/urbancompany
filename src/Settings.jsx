import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';

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
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/admin/settings', {
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
    <Card className="border-0 shadow-lg">
      <Card.Header className="border-0">
        <h5 className="mb-0">Settings</h5>
        <p className="text-muted mb-0">Manage system settings</p>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSaveSettings}>
          <h6 className="mb-3">General Settings</h6>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Site Title</Form.Label>
                <Form.Control
                  type="text"
                  value={settings.siteTitle}
                  onChange={(e) => setSettings({...settings, siteTitle: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Contact Email</Form.Label>
                <Form.Control
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                  autoComplete="email"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Contact Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
                  autoComplete="tel"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({...settings, address: e.target.value})}
                  autoComplete="street-address"
                />
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-end">
            <Button variant="primary" type="submit">
              Save Settings
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default Settings;