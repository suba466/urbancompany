import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Button, Alert, Badge, Row, Col, Dropdown } from 'react-bootstrap';
import { MdOutlineDelete } from "react-icons/md";
import TableControls from './TableControls';
import {
  prepareBookingDataForExport,
  getCSVHeadersFromData,
  exportAsPDF,
  exportAsExcel,
  exportAsCSV
} from './downloadUtils';

function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingTotalPages, setBookingTotalPages] = useState(1);
  const [bookingPerPage, setBookingPerPage] = useState(10);
  const [bookingTotalItems, setBookingTotalItems] = useState(0);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [selectAllBookings, setSelectAllBookings] = useState(false);

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

  const fetchBookings = async (page = 1, search = '', status = '', perPage = bookingPerPage) => {
    try {
      let url = `${window.API_URL}/api/admin/bookings?page=${page}&limit=${perPage}`;

      // Build query params
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);

      if (params.toString()) {
        url += `&${params.toString()}`;
      }

      console.log('Fetching bookings from:', url);

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      const data = await response.json();

      if (data.success) {
        // Create unique list of emails to fetch
        const customerEmails = [...new Set(data.bookings.map(b => b.customerEmail).filter(email => email && email.trim() !== ''))];

        // Fetch customer profile images
        const customersResponse = await fetch(`${window.API_URL}/api/admin/customers-by-emails`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ emails: customerEmails })
        });

        const customersData = await customersResponse.json();
        const customerMap = {};

        // Create map with normalized emails
        if (customersData.success) {
          customersData.customers.forEach(customer => {
            const normalizedEmail = customer.email.toLowerCase().trim();
            customerMap[normalizedEmail] = {
              name: customer.name,
              profileImage: customer.profileImage
            };
          });
        }

        console.log('Customer Map created:', Object.keys(customerMap).length, 'entries');

        // Add profile images to bookings
        const bookingsWithProfiles = data.bookings.map(booking => {
          const emailKey = (booking.customerEmail || '').toLowerCase().trim();
          const customerDetails = customerMap[emailKey];

          let validProfileImage = '';
          if (customerDetails?.profileImage) {
            // Check if it's already an absolute URL (e.g. Google Auth) or relative
            if (customerDetails.profileImage.startsWith('http')) {
              validProfileImage = customerDetails.profileImage;
            } else {
              validProfileImage = `${window.API_URL}${customerDetails.profileImage}`;
            }
          }

          return {
            ...booking,
            customerName: customerDetails?.name || booking.customerName,
            customerProfileImage: validProfileImage // Now contains full usable URL
          };
        });

        setBookings(bookingsWithProfiles || []);
        setBookingTotalPages(data.pagination?.pages || 1);
        setBookingTotalItems(data.pagination?.total || 0);
        setSelectedBookings([]);
        setSelectAllBookings(false);
        setBookingPerPage(perPage);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const deleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        const response = await fetch(`${window.API_URL}/api/admin/bookings/${bookingId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
          alert('Booking deleted successfully');
          fetchBookings(bookingPage, bookingSearch, bookingStatus, bookingPerPage);
        } else {
          alert(data.error || 'Failed to delete booking');
        }
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Failed to delete booking');
      }
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`${window.API_URL}/api/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      if (data.success) {
        // Update the local state immediately
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking._id === bookingId 
              ? { ...booking, status: newStatus }
              : booking
          )
        );
        alert(`Booking status updated to ${newStatus}`);
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status');
    }
  };

  const handleBulkDelete = async (selectedIds) => {
    if (selectedIds.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} booking(s)?`)) {
      try {
        const response = await fetch(`${window.API_URL}/api/admin/bulk-delete`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            entity: 'bookings',
            ids: selectedIds
          })
        });

        const data = await response.json();
        if (data.success) {
          alert(`Successfully deleted ${selectedIds.length} booking(s)`);
          setSelectedBookings([]);
          setSelectAllBookings(false);
          fetchBookings(bookingPage, bookingSearch, bookingStatus, bookingPerPage);
        } else {
          alert(data.error || 'Failed to delete bookings');
        }
      } catch (error) {
        console.error('Error deleting bookings:', error);
        alert('Failed to delete bookings');
      }
    }
  };

  const handleBookingSelect = (bookingId) => {
    setSelectedBookings(prev => {
      if (prev.includes(bookingId)) {
        return prev.filter(id => id !== bookingId);
      } else {
        return [...prev, bookingId];
      }
    });
  };

  const handleSelectAllBookings = () => {
    if (selectAllBookings) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(bookings.map(b => b._id));
    }
    setSelectAllBookings(!selectAllBookings);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setBookingSearch(value);
    fetchBookings(1, value, bookingStatus, bookingPerPage);
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setBookingStatus(value);
    fetchBookings(1, bookingSearch, value, bookingPerPage);
  };

  const handlePerPageChange = (perPage) => {
    setBookingPerPage(perPage);
    fetchBookings(1, bookingSearch, bookingStatus, perPage);
  };

  const handlePageChange = (page) => {
    setBookingPage(page);
    fetchBookings(page, bookingSearch, bookingStatus, bookingPerPage);
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'Completed': return 'success';
      case 'Confirmed': return 'primary';
      case 'Pending': return 'warning';
      case 'Cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div>
      <Card className="shadow-lg">
        <Card.Body style={{ marginLeft: "25px", marginRight: "25px" }}>
          <h5 className="mb-0 fw-semibold">
            Booking Management
            <span className="text-muted mx-2" style={{ fontSize: "14px", fontWeight: "normal" }}>•</span>
            <span className="text-muted" style={{ fontSize: "14px", fontWeight: "normal" }}>Manage Bookings</span>
          </h5>
        </Card.Body>
      </Card> <br />

      <Card className="border-0 shadow-lg">
        <Card.Header className="border-0" style={{ backgroundColor: "white" }}>
          <Row style={{ marginLeft: "25px", marginRight: "25px" }}>
            <Col md={4}>
              <h5 className="mb-1 fw-semibold" style={{ marginTop: "10px" }}>Manage Bookings</h5>
              <p className='text-muted' style={{ fontSize: "10.5px" }}>Use this form to manage booking details</p>
            </Col>
            <Col md={8}>
              <TableControls
                itemsPerPage={bookingPerPage}
                onItemsPerPageChange={handlePerPageChange}
                currentPage={bookingPage}
                totalPages={bookingTotalPages}
                totalItems={bookingTotalItems}
                onPageChange={handlePageChange}
                searchValue={bookingSearch}
                onSearchChange={handleSearchChange}
                searchPlaceholder="Search bookings..."
                onDownloadPDF={() => {
                  const tableElement = document.querySelector('.table');
                  exportAsPDF(tableElement, 'bookings');
                }}
                onDownloadExcel={() => {
                  const bookingData = prepareBookingDataForExport(bookings);
                  exportAsExcel(bookingData, 'bookings');
                }}
                onDownloadCSV={() => {
                  const bookingData = prepareBookingDataForExport(bookings);
                  const headers = getCSVHeadersFromData(bookingData);
                  exportAsCSV(bookingData, headers, 'bookings');
                }}
                selectedCount={selectedBookings.length}
                onBulkDelete={() => handleBulkDelete(selectedBookings)}
                showBulkActions={selectedBookings.length > 0}
                bulkEntityName="bookings"
                className="mb-3"
                additionalActions={
                  <Form.Select
                    value={bookingStatus} className='text-muted'
                    onChange={handleStatusChange}
                    style={{
                      height: "40px",
                      width: "150px", borderRadius: "0px",
                      marginRight: "10px", border: "2px solid black"
                    }}
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </Form.Select>
                }
              />
            </Col>
          </Row>
        </Card.Header>

        <Card.Body style={{ marginLeft: "25px", marginRight: "25px" }}>
          {/* Bulk Selection Alert */}
          {selectedBookings.length > 0 && (
            <Alert variant="dark" className="d-flex justify-content-between align-items-center mb-3">
              <span>
                <i className="bi bi-check-circle-fill me-2"></i>
                {selectedBookings.length} booking(s) selected
              </span>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleBulkDelete(selectedBookings)}
              >
                Delete Selected
              </Button>
            </Alert>
          )}

          <div style={{ overflowX: "auto" }}>
            <Table striped bordered hover style={{ border: "2px solid #000000" }}>
              <thead>
                <tr>
                  <th>
                    <Form.Check
                      type="checkbox"
                      className='check'
                      checked={selectAllBookings}
                      onChange={handleSelectAllBookings}
                    />
                  </th>
                  <th>Profile</th>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <div className="text-muted">
                        <i className="bi bi-calendar-x display-4 mb-3"></i>
                        <p className="mb-0">No bookings found</p>
                        <small>{bookingSearch || bookingStatus ? "Try adjusting your search or filter" : "No bookings available"}</small>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          className='check'
                          checked={selectedBookings.includes(booking._id)}
                          onChange={() => handleBookingSelect(booking._id)}
                        />
                      </td>
                      <td>
                        <div style={{
                          width: '45px',
                          height: '45px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: '2px solid #dee2e6',
                          margin: '0 auto'
                        }}>
                          {booking.customerProfileImage ? (
                            <img
                              src={booking.customerProfileImage}
                              alt={booking.customerName}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.customerName)}&background=random`;
                              }}
                            />
                          ) : (
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(booking.customerName)}&background=random&color=fff&size=128`}
                              alt={booking.customerName}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          )}
                        </div>
                      </td>
                      <td><small className="text-muted">{booking._id?.substring(0, 8)}...</small></td>
                      <td>
                        <div>
                          <strong>{booking.customerName}</strong><br />
                          <small className="text-muted">{booking.customerEmail}</small>
                        </div>
                      </td>
                      <td>{booking.serviceName}</td>
                      <td><strong>₹{booking.servicePrice}</strong></td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle 
                            as={Badge}
                            bg={getStatusBadgeColor(booking.status)}
                            className="cursor-pointer"
                            style={{ cursor: 'pointer' }}
                          >
                            {booking.status}
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            <Dropdown.Item 
                              onClick={() => updateBookingStatus(booking._id, 'Pending')}
                              className={booking.status === 'Pending' ? 'active fw-bold' : ''}
                            >
                              <Badge bg="warning" className="me-2">Pending</Badge>
                              {booking.status === 'Pending' && '✓'}
                            </Dropdown.Item>
                            <Dropdown.Item 
                              onClick={() => updateBookingStatus(booking._id, 'Confirmed')}
                              className={booking.status === 'Confirmed' ? 'active fw-bold' : ''}
                            >
                              <Badge bg="primary" className="me-2">Confirmed</Badge>
                              {booking.status === 'Confirmed' && '✓'}
                            </Dropdown.Item>
                            <Dropdown.Item 
                              onClick={() => updateBookingStatus(booking._id, 'Completed')}
                              className={booking.status === 'Completed' ? 'active fw-bold' : ''}
                            >
                              <Badge bg="success" className="me-2">Completed</Badge>
                              {booking.status === 'Completed' && '✓'}
                            </Dropdown.Item>
                            <Dropdown.Item 
                              onClick={() => updateBookingStatus(booking._id, 'Cancelled')}
                              className={booking.status === 'Cancelled' ? 'active fw-bold' : ''}
                            >
                              <Badge bg="danger" className="me-2">Cancelled</Badge>
                              {booking.status === 'Cancelled' && '✓'}
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                      <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="text-center">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteBooking(booking._id)}
                            title="Delete Booking"
                          >
                            <MdOutlineDelete />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default BookingManagement;
