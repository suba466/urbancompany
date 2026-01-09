import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Button, Alert, Badge, Row, Col } from 'react-bootstrap';
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
      let url = `http://localhost:5000/api/admin/bookings?page=${page}&limit=${perPage}`;

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
        // Get customer emails from bookings
        const customerEmails = data.bookings.map(b => b.customerEmail);

        // Fetch customer profile images
        const customersResponse = await fetch(`http://localhost:5000/api/admin/customers-by-emails`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ emails: customerEmails })
        });

        const customersData = await customersResponse.json();
        const customerMap = {};

        if (customersData.success) {
          customersData.customers.forEach(customer => {
            customerMap[customer.email] = {
              name: customer.name,
              profileImage: customer.profileImage
            };
          });
        }

        // Add profile images to bookings
        const bookingsWithProfiles = data.bookings.map(booking => ({
          ...booking,
          customerName: customerMap[booking.customerEmail]?.name || booking.customerName,
          customerProfileImage: customerMap[booking.customerEmail]?.profileImage || ''
        }));

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
        const response = await fetch(`http://localhost:5000/api/admin/bookings/${bookingId}`, {
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

  const handleBulkDelete = async (selectedIds) => {
    if (selectedIds.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} booking(s)?`)) {
      try {
        const response = await fetch('http://localhost:5000/api/admin/bulk-delete', {
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
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: '2px solid #dee2e6'
                        }}>
                          {booking.customerProfileImage ? (
                            <img
                              src={`http://localhost:5000${booking.customerProfileImage}`}
                              alt={booking.customerName}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}

                            />
                          ) : (
                            <div className='gradient'>
                              {getInitials(booking.customerName)}
                            </div>
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
                        <Badge bg={
                          booking.status === 'Completed' ? 'success' :
                            booking.status === 'Confirmed' ? 'primary' :
                              booking.status === 'Pending' ? 'warning' : 'danger'
                        }>
                          {booking.status}
                        </Badge>
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