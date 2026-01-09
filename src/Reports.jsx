import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Form, Button, Dropdown } from 'react-bootstrap';

function Reports() {
  const [reports, setReports] = useState({
    dailyBookings: 0,
    monthlyRevenue: 0,
    customerGrowth: 0,
    topCategories: []
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/admin/reports', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setReports(data.reports);
      } else {
        // Fallback to mock data
        const mockReports = {
          dailyBookings: 45,
          monthlyRevenue: 125000,
          customerGrowth: '12%',
          topCategories: [
            { name: 'Salon', bookings: 120, revenue: 45000 },
            { name: 'Cleaning', bookings: 85, revenue: 38000 },
            { name: 'Repairs', bookings: 65, revenue: 28000 },
            { name: 'Plumbing', bookings: 42, revenue: 19000 }
          ]
        };
        setReports(mockReports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Fallback to mock data
      const mockReports = {
        dailyBookings: 45,
        monthlyRevenue: 125000,
        customerGrowth: '12%',
        topCategories: [
          { name: 'Salon', bookings: 120, revenue: 45000 },
          { name: 'Cleaning', bookings: 85, revenue: 38000 },
          { name: 'Repairs', bookings: 65, revenue: 28000 },
          { name: 'Plumbing', bookings: 42, revenue: 19000 }
        ]
      };
      setReports(mockReports);
    }
  };

  const exportAsPDF = () => {
    const tableElement = document.querySelector('.table-responsive');
    // PDF export logic here
    alert('PDF export functionality would be implemented here');
  };

  const exportAsExcel = () => {
    // Excel export logic here
    alert('Excel export functionality would be implemented here');
  };

  const exportAsCSV = () => {
    // CSV export logic here
    alert('CSV export functionality would be implemented here');
  };

  return (
    <>
     <Card className="shadow-lg">
      <Card.Body style={{ marginLeft: '25px', marginRight: '25px' }}>
        <h5 className="mb-0 fw-semibold">Report Management
        </h5>
      </Card.Body>
      </Card> <br />
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center border-0 shadow-lg">
            <Card.Body className="py-4">
              <h5 className="text-muted mb-2">Daily Bookings</h5>
              <h2 className="mb-0" style={{ color: "#667eea" }}>{reports.dailyBookings}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-lg">
            <Card.Body className="py-4">
              <h5 className="text-muted mb-2">Monthly Revenue</h5>
              <h2 className="mb-0" style={{ color: "#38b2ac" }}>₹{reports.monthlyRevenue.toLocaleString()}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-lg">
            <Card.Body className="py-4">
              <h5 className="text-muted mb-2">Customer Growth</h5>
              <h2 className="mb-0" style={{ color: "#ed64a6" }}>{reports.customerGrowth}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-lg">
            <Card.Body className="py-4">
              <h5 className="text-muted mb-2">Avg. Order Value</h5>
              <h2 className="mb-0" style={{ color: "#764ba2" }}>₹1,250</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-lg mb-4">
        <Card.Header className="border-0">
          <h5>Top Categories by Revenue</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover style={{ border: "2px solid" }}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Bookings</th>
                  <th>Revenue</th>
                  <th>Avg. Price</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                {reports.topCategories.map((cat, index) => (
                  <tr key={index}>
                    <td><strong>{cat.name}</strong></td>
                    <td>{cat.bookings}</td>
                    <td>₹{cat.revenue.toLocaleString()}</td>
                    <td>₹{(cat.revenue / cat.bookings).toFixed(0)}</td>
                    <td>
                      <Badge bg="success">+12%</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-lg">
        <Card.Header className="border-0 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Report Actions</h5>
          <Dropdown>
            <Dropdown.Toggle variant="primary">
              <i className="bi bi-download me-2"></i>Export
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={exportAsPDF}>
                <i className="bi bi-file-earmark-pdf me-2"></i>Export as PDF
              </Dropdown.Item>
              <Dropdown.Item onClick={exportAsExcel}>
                <i className="bi bi-file-earmark-excel me-2"></i>Export as Excel
              </Dropdown.Item>
              <Dropdown.Item onClick={exportAsCSV}>
                <i className="bi bi-file-earmark-text me-2"></i>Export as CSV
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6>Generate Custom Reports</h6>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Report Type</Form.Label>
                  <Form.Select className='cate'>
                    <option>Sales Report</option>
                    <option>Customer Report</option>
                    <option>Booking Report</option>
                    <option>Revenue Report</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label >Date Range</Form.Label>
                  <Row>
                    <Col >
                      <Form.Control type="date" className='cate'/>
                    </Col>
                    <Col>
                      <Form.Control type="date" className='cate'/>
                    </Col>
                  </Row>
                </Form.Group>
                <Button variant="primary">Generate Report</Button>
              </Form>
            </Col>
            <Col md={6}>
              <h6>Quick Stats</h6>
              <div className="list-group" style={{border:"2px solid black"}}>
                <div className="list-group-item d-flex justify-content-between">
                  <span>Total Services Offered</span>
                  <strong>8</strong>
                </div>
                <div className="list-group-item d-flex justify-content-between">
                  <span>Active Bookings Today</span>
                  <strong>12</strong>
                </div>
                <div className="list-group-item d-flex justify-content-between">
                  <span>New Customers Today</span>
                  <strong>8</strong>
                </div>
                <div className="list-group-item d-flex justify-content-between">
                  <span>Revenue Today</span>
                  <strong>₹15,250</strong>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
}

export default Reports;