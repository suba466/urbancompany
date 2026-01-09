import { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner, Dropdown, ButtonGroup } from 'react-bootstrap';
import { exportAsExcel, exportAsCSV, exportAsPDF } from './downloadUtils';
import { FaFileExcel, FaFilePdf, FaFileCsv } from "react-icons/fa";

function Reports() {
  const [reportType, setReportType] = useState('Catalog');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthToken = () => {
    return localStorage.getItem('adminToken');
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const handleGenerateReport = async (format) => {
    // Validate Date Range
    if (!startDate || !endDate) {
      setError('Please select both start and end dates to generate the report.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let dataToExport = [];
      let filename = reportType;

      if (reportType === 'Catalog') {
        const [catRes, subRes] = await Promise.all([
          fetch('http://localhost:5000/api/admin/categories?limit=1000', { headers: getAuthHeaders() }),
          fetch('http://localhost:5000/api/admin/subcategories?limit=1000', { headers: getAuthHeaders() })
        ]);

        const categories = (await catRes.json()).categories || [];
        const subcategories = (await subRes.json()).subcategories || [];

        dataToExport = subcategories.map(sub => {
          const catName = sub.categoryId?.name || sub.categoryName || 'Unassigned';
          return {
            'Category Name': catName,
            'Subcategory Name': sub.name,
            'Subcategory Status': sub.isActive ? 'Active' : 'Inactive',
            'Category Status': categories.find(c => c._id === (sub.categoryId?._id || sub.categoryId))?.isActive ? 'Active' : 'Inactive' || 'Unknown'
          };
        });

      } else if (reportType === 'Products') {
        const response = await fetch('http://localhost:5000/api/admin/packages?limit=1000', { headers: getAuthHeaders() });
        const data = await response.json();
        const products = data.packages || [];

        dataToExport = products.map(p => ({
          'Product Name': p.name,
          'Category': p.category?.name || p.category || 'N/A',
          'Subcategory': p.subcategory?.name || p.subcategory || 'N/A',
          'Price': p.price,
          'Discount Price': p.discountPrice || 'N/A',
          'Rating': p.rating,
          'Status': p.isActive ? 'Active' : 'Inactive',
          'Created At': new Date(p.createdAt).toLocaleDateString()
        }));

      } else if (reportType === 'Bookings') {
        let url = 'http://localhost:5000/api/admin/bookings?limit=1000';

        const response = await fetch(url, { headers: getAuthHeaders() });
        const data = await response.json();
        let bookings = data.bookings || [];

        if (startDate) {
          const start = new Date(startDate);
          bookings = bookings.filter(b => new Date(b.createdAt) >= start);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          bookings = bookings.filter(b => new Date(b.createdAt) <= end);
        }

        dataToExport = bookings.map(b => ({
          'Booking ID': b._id,
          'Customer Name': b.customer?.name || b.customerName || 'N/A',
          'Service': b.serviceName || b.items?.map(i => i.name).join(', ') || 'N/A',
          'Total Amount': b.totalAmount || b.price,
          'Status': b.status,
          'Date': new Date(b.date || b.createdAt).toLocaleDateString(),
          'Time': b.time || 'N/A'
        }));
      }

      if (dataToExport.length === 0) {
        setError('No data found for the selected criteria.');
      } else {
        const timestamp = new Date().toISOString().split('T')[0];
        const finalFilename = `${filename}_Report_${timestamp}`;

        if (format === 'excel') {
          exportAsExcel(dataToExport, finalFilename);
        } else if (format === 'csv') {
          const headers = Object.keys(dataToExport[0]);
          exportAsCSV(dataToExport, headers, finalFilename);
        } else if (format === 'pdf') {
          const headers = Object.keys(dataToExport[0]);
          let html = `<h2 style="text-align: center; margin-bottom: 20px;">${filename} Report</h2>`;
          html += `<p style="text-align: center; margin-bottom: 20px;">Generated on: ${new Date().toLocaleDateString()}</p>`;
          html += '<table style="width:100%; border-collapse: collapse; font-size: 10px;">';
          html += '<thead><tr>';
          headers.forEach(h => html += `<th style="border:1px solid #ddd; padding: 6px; background-color: #f2f2f2; text-align: left;">${h}</th>`);
          html += '</tr></thead><tbody>';
          dataToExport.forEach(row => {
            html += '<tr>';
            headers.forEach(h => html += `<td style="border:1px solid #ddd; padding: 6px;">${row[h] || ''}</td>`);
            html += '</tr>';
          });
          html += '</tbody></table>';

          const element = document.createElement('div');
          element.innerHTML = html;
          exportAsPDF(element, finalFilename);
        }
      }

    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card className="shadow-lg">
        <Card.Body style={{ marginLeft: '25px', marginRight: '25px' }}>
          <h5 className="mb-0 fw-semibold">Report Management</h5>
        </Card.Body>
      </Card>
      <br />

      <Card className="border-0 shadow-lg" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <Card.Header className="bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h5 className="mb-0">Generate Reports</h5>
            <p className="text-muted small mb-0">Select the data range and download format.</p>
          </div>
          <div className="d-flex gap-2 mt-2 mt-md-0">
            <Button
              variant="outline-light"
              style={{ border: "1px solid #000000"}}
              disabled={loading}
              onClick={() => handleGenerateReport('pdf')}
              title="Download as PDF"
              size="sm"
            >
              {loading ? <Spinner as="span" animation="border" size="sm" /> : <><FaFilePdf className="text-danger" /> </>}
            </Button>
            <Button
              variant="outline-light"
              style={{ border: "1px solid #000000" }}
              disabled={loading}
              onClick={() => handleGenerateReport('excel')}
              title="Download as Excel"
              size="sm"
            >
              {loading ? <Spinner as="span" animation="border" size="sm" /> : <><FaFileExcel className="text-success " /> </>}
            </Button>
            <Button
              variant="outline-light"
              style={{ border: "1px solid #000000" }}
              disabled={loading}
              onClick={() => handleGenerateReport('csv')}
              title="Download as CSV"
              size="sm"
            >
              {loading ? <Spinner as="span" animation="border" size="sm" /> : <><FaFileCsv className="text-primary" /> </>}
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}

          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Report Type</Form.Label>
              <Form.Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="shadow-sm py-2"
              >
                <option value="Catalog">Catalog (Categories & Subcategories)</option>
                <option value="Products">Products</option>
                <option value="Bookings">Bookings</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Date Range</Form.Label>
              <Row>
                <Col md={6} className="mb-3 mb-md-0">
                  <Form.Label className="text-muted small">From</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="shadow-sm"
                    required
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="text-muted small">To</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="shadow-sm"
                    required
                  />
                </Col>
              </Row>
            </Form.Group>

            {/* Download buttons moved to Header */}
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Reports;