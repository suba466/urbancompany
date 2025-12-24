import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Button, Alert, Badge,Row, Col } from 'react-bootstrap';
import { MdOutlineDelete } from "react-icons/md";
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
      let url = `http://localhost:5000/api/admin/customers?page=${page}&limit=${perPage}&search=${search}`;
      
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

  return (
    <div>
      <Card className="shadow-lg">
        <Card.Body  style={{marginLeft:"25px",marginRight:"25px"}}>
          <h5 className="fw-semibold mb-0">Customer Management</h5>
          </Card.Body>
      </Card>
      <br />
      <Card className="border-0 shadow-lg">
        <Card.Body style={{marginLeft:"25px",marginRight:"25px"}}>
           <Row><Col>
           <div>
            <h5 className="mb-1 fw-semibold">Manage Customers</h5>
            <p className="text-muted mb-0" style={{fontSize:"12px"}}>View and manage all registered customers</p>
          </div></Col>
          <Col>
          <TableControls
            itemsPerPage={customerPerPage}
            onItemsPerPageChange={(perPage) => {
              setCustomerPerPage(perPage);
              fetchCustomers(1, customerSearch, perPage);
            }}
            currentPage={customerPage}
            totalPages={customerTotalPages}
            totalItems={customerTotalItems}
            onPageChange={(page) => {
              setCustomerPage(page);
              fetchCustomers(page, customerSearch, customerPerPage);
            }}
            searchValue={customerSearch}
            onSearchChange={(e) => {
              setCustomerSearch(e.target.value);
              fetchCustomers(1, e.target.value, customerPerPage);
            }}
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
            showBulkActions={selectedCustomers.length > 0}
            bulkEntityName="customers"
            className="mb-3"
          /></Col></Row>
         
          
          
          <div className="table-responsive">
           <Table striped bordered hover style={{border:"2px solid"}}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <Form.Check
                      type="checkbox"
                      checked={selectAllCustomers}
                      onChange={handleSelectAllCustomers}
                    />
                  </th>
                  <th style={{ width: '80px' }}>Profile</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th style={{ width: '150px' }}>Password</th>
                  <th>Joined Date</th>
                  <th style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id}>
                    <td>
                      <Form.Check
                        type="checkbox"
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
                    <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="text-center">
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
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default CustomerManagement;