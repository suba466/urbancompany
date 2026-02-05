import { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner, Table, Pagination } from 'react-bootstrap';
import { exportAsExcel, exportAsCSV, exportAsPDF, generatePDFReportHTML } from './downloadUtils';
import { FaEye, FaFilePdf, FaFileExcel, FaFileCsv } from "react-icons/fa";
import API_URL from './config';

function Reports() {
  const [reportType, setReportType] = useState('Category');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // Helper function to get image URL
  const getImageUrl = (imgPath) => {
    if (!imgPath) return '';
    if (imgPath.startsWith('http')) return imgPath;
    return `${API_URL}${imgPath}`;
  };

  // Helper function to get initials
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

  const generateReport = async () => {
    // Validate Date Range (except for Category/Subcategory which don't have dates)
    if (!startDate || !endDate) {
      if (reportType !== 'Category' && reportType !== 'Subcategory') {
        setError('Please select both start and end dates to generate the report.');
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      let dataToExport = [];
      let reportHeaders = [];

      if (reportType === 'Category') {
        const response = await fetch(`${API_URL}/api/admin/categories?limit=1000`, { headers: getAuthHeaders() });
        const data = await response.json();
        const categories = data.categories || [];

        dataToExport = categories.map(cat => ({
          'Image': cat.img,
          'Name': cat.name,
          'Description': cat.description,
          'Status': cat.isActive ? 'Active' : 'Inactive',
        }));

        reportHeaders = ['Image', 'Name', 'Description', 'Status'];

      } else if (reportType === 'Subcategory') {
        const response = await fetch(`${API_URL}/api/admin/subcategories?limit=1000`, { headers: getAuthHeaders() });
        const data = await response.json();
        const subcategories = data.subcategories || [];

        dataToExport = subcategories.map(sub => ({
          'Image': sub.img,
          'Name': sub.name,
          'Category Name': sub.categoryId?.name || sub.categoryName || 'Unassigned',
          'Status': sub.isActive ? 'Active' : 'Inactive',
        }));

        reportHeaders = ['Image', 'Name', 'Category Name', 'Status'];

      } else if (reportType === 'Products') {
        const response = await fetch(`${API_URL}/api/admin/packages?limit=1000`, { headers: getAuthHeaders() });
        const data = await response.json();
        const products = data.packages || [];

        // Filter by date range
        let filteredProducts = products;
        if (startDate) {
          const start = new Date(startDate);
          filteredProducts = filteredProducts.filter(p => new Date(p.createdAt) >= start);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filteredProducts = filteredProducts.filter(p => new Date(p.createdAt) <= end);
        }

        dataToExport = filteredProducts.map(p => ({
          'Image': p.img,
          'Name': p.name,
          'Category': p.category?.name || p.category || 'N/A',
          'Subcategory': p.subcategory?.name || p.subcategory || 'N/A',
          'Price': `₹${p.price || 0}`,
          'Status': p.isActive ? 'Active' : 'Inactive'
        }));

        reportHeaders = ['Image', 'Name', 'Category', 'Subcategory', 'Price', 'Status'];

      } else if (reportType === 'Bookings') {
        let url = `${API_URL}/api/admin/bookings?limit=1000`;

        const response = await fetch(url, { headers: getAuthHeaders() });
        const data = await response.json();
        let bookings = data.bookings || [];

        // Filter by date range
        if (startDate) {
          const start = new Date(startDate);
          bookings = bookings.filter(b => new Date(b.createdAt) >= start);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          bookings = bookings.filter(b => new Date(b.createdAt) <= end);
        }

        // Extract customer emails from bookings
        const customerEmails = [...new Set(
          bookings
            .map(b => b.customerEmail || b.customer?.email)
            .filter(email => email && email.trim() !== '')
        )];

        // Create a map to store customer profiles
        const customerMap = {};

        // Fetch customer profiles in bulk (similar to BookingManagement)
        if (customerEmails.length > 0) {
          try {
            const customersResponse = await fetch(`${API_URL}/api/admin/customers-by-emails`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({ emails: customerEmails })
            });

            const customersData = await customersResponse.json();

            if (customersData.success && customersData.customers) {
              customersData.customers.forEach(customer => {
                const normalizedEmail = customer.email.toLowerCase().trim();
                let validProfileImage = '';

                if (customer.profileImage) {
                  // Check if it's already an absolute URL (e.g. Google Auth) or relative
                  if (customer.profileImage.startsWith('http')) {
                    validProfileImage = customer.profileImage;
                  } else {
                    validProfileImage = `${API_URL}${customer.profileImage}`;
                  }
                }

                customerMap[normalizedEmail] = {
                  name: customer.name,
                  profileImage: validProfileImage
                };
              });
            }
          } catch (err) {
            console.warn('Could not fetch customer profiles:', err);
          }
        }

        dataToExport = bookings.map(b => {
          // Calculate total amount
          let totalAmount = 0;
          if (b.totalAmount) {
            totalAmount = b.totalAmount;
          } else if (b.price) {
            totalAmount = b.price;
          } else if (b.servicePrice) {
            totalAmount = b.servicePrice;
          } else if (b.items && b.items.length > 0) {
            totalAmount = b.items.reduce((sum, item) => sum + (item.price || 0), 0);
          } else if (b.cartItems && b.cartItems.length > 0) {
            totalAmount = b.cartItems.reduce((sum, item) => {
              const itemPrice = Number(item.price) || 0;
              const count = item.count || 1;
              return sum + (itemPrice * count);
            }, 0);
          }

          // Get service name
          let serviceName = 'N/A';
          if (b.serviceName) {
            serviceName = b.serviceName;
          } else if (b.items && b.items.length > 0) {
            serviceName = b.items.map(i => i.name).join(', ');
          } else if (b.cartItems && b.cartItems.length > 0) {
            serviceName = b.cartItems.map(i => i.name || i.title).join(', ');
          }

          // Get customer info - EXACTLY LIKE BOOKING MANAGEMENT
          const emailKey = (b.customerEmail || b.customer?.email || '').toLowerCase().trim();
          const customerDetails = customerMap[emailKey];

          const customerName = customerDetails?.name || b.customerName || b.customer?.name || 'N/A';
          const profileImage = customerDetails?.profileImage || '';

          return {
            'Profile': profileImage, // Store full URL or empty string
            'Booking ID': b._id ? b._id.substring(0, 8).toUpperCase() : 'N/A',
            'Customer Name': customerName,
            'Customer Email': b.customerEmail || b.customer?.email || 'N/A',
            'Service': serviceName,
            'Price': `₹${totalAmount}`,
            'Status': b.status || 'N/A',
            'Date': b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A',
          };
        });

        reportHeaders = ['Profile', 'Booking ID', 'Customer Name', 'Customer Email', 'Service', 'Price', 'Status', 'Date'];
      }

      if (dataToExport.length === 0) {
        setError('No data found for the selected criteria.');
        setShowTable(false);
      } else {
        setReportData(dataToExport);
        setHeaders(reportHeaders);
        setShowTable(true);
        setCurrentPage(1);
      }

    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again.');
      setShowTable(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (reportData.length === 0) {
      setError('No data to download. Please generate the report first.');
      return;
    }

    const pdfData = reportData.map(row => {
      const newRow = { ...row };
      headers.forEach(h => {
        if ((h.includes('Image') || h.includes('Profile')) && newRow[h] && typeof newRow[h] === 'string' && !newRow[h].startsWith('http')) {
          newRow[h] = `${API_URL}${newRow[h]}`;
        }
      });
      return newRow;
    });

    const title = `${reportType} Report`;
    const element = generatePDFReportHTML(title, headers, pdfData);
    exportAsPDF(element, reportType);
  };

  const handleDownloadExcel = () => {
    if (reportData.length === 0) {
      setError('No data to download. Please generate the report first.');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const finalFilename = `${reportType}_Report_${timestamp}`;

    exportAsExcel(reportData, finalFilename);
  };

  const handleDownloadCSV = () => {
    if (reportData.length === 0) {
      setError('No data to download. Please generate the report first.');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const finalFilename = `${reportType}_Report_${timestamp}`;

    exportAsCSV(reportData, headers, finalFilename);
  };

  // Direct render function for profile images
  const renderProfileImage = (profileImage, customerName) => {
    return (
      <div style={{
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '2px solid #dee2e6',
        margin: '0 auto'
      }}>
        {profileImage ? (
          <img
            src={profileImage}
            alt={customerName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}&background=random`;
            }}
          />
        ) : (
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}&background=random&color=fff&size=128`}
            alt={customerName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        )}
      </div>
    );
  };

  // Direct render function for product/category images
  const renderProductImage = (imgPath, altName) => {
    if (!imgPath) return 'No Image';

    const imageUrl = getImageUrl(imgPath);
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img
          src={imageUrl}
          alt={altName}
          style={{
            width: '50px',
            height: '50px',
            objectFit: 'cover',
            borderRadius: '4px',
            border: '1px solid #dee2e6'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = 'No Image';
          }}
        />
      </div>
    );
  };

  return (
    <div>
      <Card className="shadow-lg">
        <Card.Body style={{ marginLeft: '25px', marginRight: '25px' }}>
          <h5 className="mb-0 fw-semibold">Report Management</h5>
        </Card.Body>
      </Card>
      <br />

      <Card className="border-0 shadow-lg">
        <Card.Header style={{ marginLeft: '25px', marginRight: '25px' }} className="bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h5 className="mb-0">Generate Reports</h5>
            <p className="text-muted small mb-0">Select the data range and download format.</p>
          </div>
        </Card.Header>
        <Card.Body style={{ marginLeft: '25px', marginRight: '25px' }} className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}

          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Report Type</Form.Label>
              <Form.Select
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value);
                  setShowTable(false);
                  setCurrentPage(1);
                }}
                className="cate shadow-sm py-2"
              >
                <option value="Category">Category Report</option>
                <option value="Subcategory">Subcategory Report</option>
                <option value="Products">Products Report</option>
                <option value="Bookings">Bookings Report</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                Date Range {reportType === 'Category' || reportType === 'Subcategory' ? '(Optional)' : '(Required)'}
              </Form.Label>
              <Row>
                <Col md={6} className="mb-3 mb-md-0">
                  <Form.Label className="text-muted small">From</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    max={new Date().toISOString().split('T')[0]} // Restricted to current date
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0); // Reset time for accurate comparison

                      if (selectedDate > new Date()) {
                        alert("Future dates cannot be selected.");
                        return;
                      }

                      setStartDate(e.target.value);
                      setShowTable(false);
                    }}
                    className="cate shadow-sm"
                    required={reportType !== 'Category' && reportType !== 'Subcategory'}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="text-muted small">To</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    max={new Date().toISOString().split('T')[0]} // Restricted to current date
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      if (selectedDate > new Date()) {
                        alert("Future dates cannot be selected.");
                        return;
                      }

                      setEndDate(e.target.value);
                      setShowTable(false);
                    }}
                    className="cate shadow-sm"
                    required={reportType !== 'Category' && reportType !== 'Subcategory'}
                  />
                </Col>
              </Row>
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                variant="dark"
                onClick={generateReport}
                disabled={loading}
                className="px-4"
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FaEye className="me-2" />
                    Generate & View Report
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Report Data Table */}
      {showTable && reportData.length > 0 && (
        <Card className="border-0 shadow-lg mt-4">
          <Card.Header style={{ marginLeft: '25px', marginRight: '25px' }} className="bg-white border-0 pt-4 px-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">{reportType} Report Data</h5>
                <p className="text-muted small mb-0">
                  Showing {reportData.length} records
                  {reportType !== 'Category' && reportType !== 'Subcategory' && ` | Date Range: ${startDate} to ${endDate}`}
                  {` | Generated on: ${new Date().toLocaleDateString()}`}
                </p>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-light"
                  style={{ border: "1px solid #000000" }}
                  onClick={handleDownloadPDF}
                  title="Download as PDF"
                >
                  <FaFilePdf className="text-danger" />
                </Button>
                <Button
                  variant="outline-light"
                  style={{ border: "1px solid #000000" }}
                  onClick={handleDownloadExcel}
                  title="Download as Excel"
                >
                  <FaFileExcel className="text-success" />
                </Button>
                <Button
                  variant="outline-light"
                  style={{ border: "1px solid #000000" }}
                  onClick={handleDownloadCSV}
                  title="Download as CSV"
                >
                  <FaFileCsv className="text-primary" />
                </Button>
              </div>
            </div>
          </Card.Header>
          <Card.Body style={{ marginLeft: '25px', marginRight: '25px' }} className="p-4">
            {/* Download Buttons */}


            {/* Data Table */}
            <div className="table-responsive">
              <Table striped bordered hover style={{ border: "2px solid #000000" }}>
                <thead>
                  <tr>
                    {headers.map((header, index) => (
                      <th key={index} className="fw-semibold" style={{
                        textAlign: header.includes('Image') || header.includes('Profile') ? 'center' : 'left',
                        verticalAlign: 'middle',
                        border: '2px solid #000000'
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {headers.map((header, colIndex) => (
                          <td key={colIndex} style={{
                            textAlign: header.includes('Image') || header.includes('Profile') ? 'center' : 'left',
                            verticalAlign: 'middle',
                            border: '2px solid #000000'
                          }}>
                            {header.includes('Profile') ?
                              renderProfileImage(row[header], row['Customer Name'] || 'Customer') :
                              header.includes('Image') && !header.includes('Profile') ?
                                renderProductImage(row[header], row['Name'] || '') :
                                row[header] || 'N/A'
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {reportData.length > itemsPerPage && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted small">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, reportData.length)} of {reportData.length} entries
                </div>
                <Pagination className="mb-0">
                  <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                  <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />

                  {[...Array(Math.ceil(reportData.length / itemsPerPage))].map((_, idx) => {
                    const pageNumber = idx + 1;
                    // Show current page, first, last, and neighbors
                    if (
                      pageNumber === 1 ||
                      pageNumber === Math.ceil(reportData.length / itemsPerPage) ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <Pagination.Item
                          key={pageNumber}
                          active={pageNumber === currentPage}
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </Pagination.Item>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return <Pagination.Ellipsis key={pageNumber} disabled />;
                    }
                    return null;
                  })}

                  <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(reportData.length / itemsPerPage)))} disabled={currentPage === Math.ceil(reportData.length / itemsPerPage)} />
                  <Pagination.Last onClick={() => setCurrentPage(Math.ceil(reportData.length / itemsPerPage))} disabled={currentPage === Math.ceil(reportData.length / itemsPerPage)} />
                </Pagination>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default Reports;