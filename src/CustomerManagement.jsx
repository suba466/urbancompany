import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Button, Alert, Badge, Row, Col, Modal } from 'react-bootstrap';
import { MdOutlineDelete } from "react-icons/md";
import { IoEyeSharp } from "react-icons/io5";
import TableControls from './TableControls';
import {
  prepareCustomerDataForExport,
  getCSVHeadersFromData,
  exportAsPDF,
  exportAsExcel,
  exportAsCSV
} from './downloadUtils';

function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerPage, setCustomerPage] = useState(1);
  const [customerTotalPages, setCustomerTotalPages] = useState(1);
  const [customerPerPage, setCustomerPerPage] = useState(10);
  const [customerTotalItems, setCustomerTotalItems] = useState(0);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectAllCustomers, setSelectAllCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchCustomers = async (page = 1, search = '', perPage = customerPerPage) => {
    try {
      let url = `http://localhost:5000/api/admin/customers?page=${page}&limit=${perPage}`;

      // Build query params properly
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      if (params.toString()) {
        url += `&${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers || []);
        setCustomerTotalPages(data.pagination?.pages || 1);
        setCustomerTotalItems(data.pagination?.total || 0);
        setSelectedCustomers([]);
        setSelectAllCustomers(false);
        setCustomerPerPage(perPage);
        setCustomerPage(data.pagination?.page || page);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const deleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/customers/${customerId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
          alert('Customer deleted successfully');
          fetchCustomers(customerPage, customerSearch, customerPerPage);
        } else {
          alert(data.error || 'Failed to delete customer');
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Failed to delete customer');
      }
    }
  };

  const handleBulkDelete = async (selectedIds) => {
    if (selectedIds.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} customer(s)?`)) {
      try {
        const response = await fetch('http://localhost:5000/api/admin/bulk-delete', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            entity: 'customers',
            ids: selectedIds
          })
        });

        const data = await response.json();
        if (data.success) {
          alert(`Successfully deleted ${selectedIds.length} customer(s)`);
          setSelectedCustomers([]);
          setSelectAllCustomers(false);
          fetchCustomers(customerPage, customerSearch, customerPerPage);
        } else {
          alert(data.error || 'Failed to delete customers');
        }
      } catch (error) {
        console.error('Error deleting customers:', error);
        alert('Failed to delete customers');
      }
    }
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerId)) {
        return prev.filter(id => id !== customerId);
      } else {
        return [...prev, customerId];
      }
    });
  };

  const handleSelectAllCustomers = () => {
    if (selectAllCustomers) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c._id));
    }
    setSelectAllCustomers(!selectAllCustomers);
  };

  // Handle search change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setCustomerSearch(value);
    fetchCustomers(1, value, customerPerPage);
  };

  // Handle per page change
  const handlePerPageChange = (perPage) => {
    setCustomerPerPage(perPage);
    fetchCustomers(1, customerSearch, perPage);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCustomerPage(page);
    fetchCustomers(page, customerSearch, customerPerPage);
  };

  // View customer details
  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
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

  const displayPassword = () => {
    return '••••••';
  };

  // Format date for modal display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  // Block/Unblock single customer
  const toggleCustomerStatus = async (customerId, isActive) => {
    const action = isActive ? 'unblock' : 'block';
    const confirmMessage = `Are you sure you want to ${action} this customer?`;

    if (window.confirm(confirmMessage)) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/customers/${customerId}/block`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ isActive: !isActive })
        });

        const data = await response.json();
        if (data.success) {
          alert(`Customer ${action}ed successfully`);
          fetchCustomers(customerPage, customerSearch, customerPerPage);
        } else {
          alert(data.error || `Failed to ${action} customer`);
        }
      } catch (error) {
        console.error(`Error ${action}ing customer:`, error);
        alert(`Failed to ${action} customer`);
      }
    }
  };

  // Bulk block/unblock
  const handleBulkBlock = async (selectedIds, isActive) => {
    if (selectedIds.length === 0) return;

    const action = isActive ? 'activate' : 'block';
    const confirmMessage = `Are you sure you want to ${action} ${selectedIds.length} customer(s)?`;

    if (window.confirm(confirmMessage)) {
      try {
        const response = await fetch('http://localhost:5000/api/admin/customers/bulk-block', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            ids: selectedIds,
            isActive: isActive
          })
        });

        const data = await response.json();
        if (data.success) {
          alert(`Successfully ${action}ed ${data.modifiedCount} customer(s)`);
          setSelectedCustomers([]);
          fetchCustomers(customerPage, customerSearch, customerPerPage);
        } else {
          alert(data.error || `Failed to ${action} customers`);
        }
      } catch (error) {
        console.error(`Error ${action}ing customers:`, error);
        alert(`Failed to ${action} customers`);
      }
    }
  };

  return (
    <div>
      <Card className="shadow-lg">
        <Card.Body style={{ marginLeft: "25px", marginRight: "25px" }}>
          <h5 className="fw-semibold mb-0">
            Customer Management
            <span className="text-muted mx-2" style={{ fontSize: "14px", fontWeight: "normal" }}>•</span>
            <span className="text-muted" style={{ fontSize: "14px", fontWeight: "normal" }}>Manage Customers</span>
          </h5>
        </Card.Body>
      </Card>
      <br />
      <Card className="border-0 shadow-lg">
        <Card.Header className="border-0" style={{ backgroundColor: "white" }}>
          <Row style={{ marginLeft: "25px", marginRight: "25px" }}>
            <Col>
              <h5 className="mb-1 fw-semibold" style={{ marginTop: "10px" }}>Manage Customers</h5>
              <p className="text-muted mb-0" style={{ fontSize: "12px" }}>View and manage all registered customers</p>
            </Col>
            <Col>
              <TableControls
                itemsPerPage={customerPerPage}
                onItemsPerPageChange={handlePerPageChange}
                currentPage={customerPage}
                totalPages={customerTotalPages}
                totalItems={customerTotalItems}
                onPageChange={handlePageChange}
                searchValue={customerSearch}
                onSearchChange={handleSearchChange}
                searchPlaceholder="Search customers..."
                onDownloadPDF={() => {
                  const tableElement = document.querySelector('.table-responsive');
                  exportAsPDF(tableElement, 'customers');
                }}
                onDownloadExcel={() => {
                  const customerData = prepareCustomerDataForExport(customers);
                  exportAsExcel(customerData, 'customers');
                }}
                onDownloadCSV={() => {
                  const customerData = prepareCustomerDataForExport(customers);
                  const headers = getCSVHeadersFromData(customerData);
                  exportAsCSV(customerData, headers, 'customers');
                }}
                selectedCount={selectedCustomers.length}
                onBulkDelete={() => handleBulkDelete(selectedCustomers)}
                onBulkBlock={() => handleBulkBlock(selectedCustomers, false)}
                onBulkUnblock={() => handleBulkBlock(selectedCustomers, true)}
                showBulkActions={selectedCustomers.length > 0}
                bulkEntityName="customers"
                className="mb-3"
              />
            </Col>
          </Row>
        </Card.Header>

        <Card.Body style={{ marginLeft: "25px", marginRight: "25px" }}>
          {/* Bulk Selection Alert */}
          {selectedCustomers.length > 0 && (
            <Alert variant="dark" className="d-flex justify-content-between align-items-center mb-3">
              <span>
                <i className="bi bi-check-circle-fill me-2"></i>
                {selectedCustomers.length} customer(s) selected
              </span>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleBulkDelete(selectedCustomers)}
              >
                Delete Selected
              </Button>
            </Alert>
          )}

          <div className="table-responsive">
            <Table striped bordered hover style={{ border: "2px solid" }}>
              <thead>
                <tr>
                  <th >
                    <Form.Check
                      type="checkbox" className='check'
                      checked={selectAllCustomers}
                      onChange={handleSelectAllCustomers}
                    />
                  </th>
                  <th >Profile</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th >Password</th>
                  <th>Status</th> {/* Add this */}
                  <th>Joined Date</th>
                  <th >Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5"> {/* Update colspan */}
                      <div className="text-muted">
                        <i className="bi bi-people display-4 mb-3"></i>
                        <p className="mb-0">No customers found</p>
                        <small>{customerSearch ? "Try adjusting your search" : "No customers available"}</small>
                      </div>
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer._id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          className='check'
                          checked={selectedCustomers.includes(customer._id)}
                          onChange={() => handleCustomerSelect(customer._id)}
                        />
                      </td>
                      <td>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: '2px solid #dee2e6'
                        }}>
                          {customer.profileImage ? (
                            <img
                              src={`http://localhost:5000${customer.profileImage}`}
                              alt={customer.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '18px'
                            }}>
                              {getInitials(customer.name)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td><strong>{customer.name}</strong></td>
                      <td>{customer.email}</td>
                      <td>{customer.phone}</td>
                      <td>{customer.city}</td>
                      <td>
                        <small className="text-muted" style={{ letterSpacing: '2px', fontFamily: 'monospace' }}>
                          {displayPassword()}
                        </small>
                      </td>
                      <td>
                        <Badge bg={customer.isActive !== false ? 'success' : 'danger'}>
                          {customer.isActive !== false ? 'Active' : 'Blocked'}
                        </Badge>
                      </td>
                      <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex gap-1 justify-content-center">
                          <Button
                            variant="dark"
                            size="sm"
                            onClick={() => handleViewCustomer(customer)}
                            title="View Customer Details"
                          >
                            <IoEyeSharp />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteCustomer(customer._id)}
                            title="Delete Customer"
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

      {/* Customer Details Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered>
        <Button
          type="button"
          onClick={() => setShowViewModal(false)}
          className="position-absolute border-0 justify-content-center closebtn p-0"
          title="Close"
        >
          X
        </Button>
        <Modal.Body className="p-4"
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <style>
            {`
              .modal-body::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>

          <Modal.Title><h5>Customer Details</h5></Modal.Title>

          {selectedCustomer && (
            <div>
              {/* Profile Image and Name */}
              <div className="text-center mb-4">
                <div className="mb-3">
                  {selectedCustomer.profileImage ? (
                    <img
                      src={`http://localhost:5000${selectedCustomer.profileImage}`}
                      alt={selectedCustomer.name}
                      style={{
                        width: '150px',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        border: '3px solid #dee2e6'
                      }}
                    />
                  ) : (
                    <div className='gradient'>
                      {getInitials(selectedCustomer.name)}
                    </div>
                  )}
                </div>
                <h5 className="mb-1">{selectedCustomer.name}</h5>
                <p className="text-muted mb-0">Customer ID: {selectedCustomer._id?.substring(0, 8)}...</p>
              </div>

              {/* Customer Details */}
              <div className="list-group list-group-flush">
                <div className="list-group-item px-0 border-top-0">
                  <small className="text-muted d-block">Full Name</small>
                  <span className="fw-semibold">{selectedCustomer.name}</span>
                </div>

                <div className="list-group-item px-0">
                  <small className="text-muted d-block">Email Address</small>
                  <span>{selectedCustomer.email}</span>
                </div>

                <div className="list-group-item px-0">
                  <small className="text-muted d-block">Phone Number</small>
                  <span>{selectedCustomer.phone || 'Not provided'}</span>
                </div>

                <div className="list-group-item px-0">
                  <small className="text-muted d-block">City</small>
                  <span>{selectedCustomer.city || 'Not specified'}</span>
                </div>

                <div className="list-group-item px-0">
                  <small className="text-muted d-block">Account Status</small>
                  <Badge bg={selectedCustomer.isActive !== false ? 'success' : 'danger'}>
                    {selectedCustomer.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="list-group-item px-0">
                  <small className="text-muted d-block">Joined Date</small>
                  <span>{formatDate(selectedCustomer.createdAt)}</span>
                </div>

                {selectedCustomer.profileImage && (
                  <div className="list-group-item px-0 border-bottom-0">
                    <small className="text-muted d-block">Profile Image URL</small>
                    <small className="text-truncate d-block" style={{ maxWidth: '100%' }}>
                      {`http://localhost:5000${selectedCustomer.profileImage}`}
                    </small>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="secondary"
            onClick={() => setShowViewModal(false)}
            style={{ borderRadius: "50px" }}
          >
            Close
          </Button>

        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CustomerManagement;