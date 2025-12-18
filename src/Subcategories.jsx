import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Form, Button, Alert, Badge, 
  Row, Col, Dropdown, Spinner, Modal 
} from 'react-bootstrap';
import { MdModeEdit, MdOutlineDelete } from "react-icons/md";
import { IoEyeSharp } from "react-icons/io5";
import TableControls from './TableControls';

const Subcategories = ({
  subcategories = [],
  selectedSubcategories = [],
  selectAllSubcategories = false,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onBulkDelete,
  onToggleStatus,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  searchQuery = '',
  onSearchChange,
  itemsPerPage = 10,
  onItemsPerPageChange,
  onAddSubcategory,
  loading = false
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState(null);

  const handleDelete = (subcategory) => {
    setSubcategoryToDelete(subcategory);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (subcategoryToDelete) {
      onDelete(subcategoryToDelete._id);
    }
    setShowDeleteModal(false);
    setSubcategoryToDelete(null);
  };

  const handleExport = (format) => {
    const data = subcategories.map(sub => ({
      'Subcategory ID': sub._id,
      'Name': sub.name,
      'Key': sub.key,
      'Parent Category': sub.categoryName,
      'Description': sub.description,
      'Status': sub.isActive ? 'Active' : 'Inactive',
      'Order': sub.order,
      'Created': new Date(sub.createdAt).toLocaleDateString()
    }));

    let content, mimeType, filename;
    
    if (format === 'csv') {
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(row => Object.values(row).join(',')).join('\n');
      content = `${headers}\n${rows}`;
      mimeType = 'text/csv';
      filename = 'subcategories.csv';
    } else if (format === 'excel') {
      // For Excel, you'd typically use a library like xlsx
      console.log('Export as Excel:', data);
      alert('Excel export would require additional library (xlsx)');
      return;
    } else {
      // PDF export
      console.log('Export as PDF');
      alert('PDF export would require additional library (jspdf)');
      return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading subcategories...</p>
      </div>
    );
  }

  return (
    <div>
      <Card className="shadow-lg">
        <Card.Body style={{ marginLeft: "23px", marginRight: "10px" }}>
          <h5 className="mb-0 fw-semibold">
            Subcategory Management
            <span className="text-muted mx-2" style={{ fontSize: "14px", fontWeight: "normal" }}>•</span>
            <span className="text-muted" style={{ fontSize: "14px", fontWeight: "normal" }}>Manage Subcategories</span>
          </h5>
        </Card.Body>
      </Card>
      <br />
      
      <Card className="shadow-lg" style={{ border: "5px" }}>
        <Card.Header className="border-0" style={{ backgroundColor: "white" }}>
          <Row style={{ marginLeft: "12px", marginRight: "10px" }}>
            <Col style={{ marginTop: "10px" }}>
              <h5 className="mb-1 fw-semibold">Manage Subcategories</h5>
              <p className='text-muted' style={{ fontSize: "10.5px" }}>
                Organize services into subcategories under main categories
              </p>
            </Col>
            <Col>
              <TableControls
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={onItemsPerPageChange}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={onPageChange}
                searchValue={searchQuery}
                onSearchChange={onSearchChange}
                searchPlaceholder="Search subcategories..."
                onDownloadPDF={() => handleExport('pdf')}
                onDownloadExcel={() => handleExport('excel')}
                onDownloadCSV={() => handleExport('csv')}
                selectedCount={selectedSubcategories.length}
                onBulkDelete={() => onBulkDelete(selectedSubcategories)}
                showBulkActions={true}
                bulkEntityName="subcategories"
                
              />
            </Col>
          </Row>
        </Card.Header>
        
        <Card.Body style={{ marginLeft: "20px", marginRight: "20px" }}>
          {/* Bulk Selection Alert */}
          {selectedSubcategories.length > 0 && (
            <Alert variant="dark" className="d-flex justify-content-between align-items-center mb-3">
              <span>
                <i className="bi bi-check-circle-fill me-2"></i>
                {selectedSubcategories.length} subcategory(ies) selected
              </span>
              <div>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => onSelectAll(false)}
                  className="me-2"
                >
                  Clear Selection
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onBulkDelete(selectedSubcategories)}
                >
                  <i className="bi bi-trash me-2"></i>Delete Selected
                </Button>
              </div>
            </Alert>
          )}

          <div className="table-responsive">
            <Table striped bordered hover style={{ border: "2px solid" }}>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>
                    <Form.Check
                      type="checkbox"
                      checked={selectAllSubcategories}
                      onChange={onSelectAll}
                      style={{
                        fontSize: "14px",
                        '--bs-border-width': '2px',
                        '--bs-border-color': '#000000',
                      }}
                    />
                  </th>
                  <th style={{ width: '80px' }}>Image</th>
                  <th>Name</th>
                  <th>Key</th>
                  <th>Parent Category</th>
                  <th>Description</th>
                  <th style={{ width: '80px' }}>Order</th>
                  <th style={{ width: '100px' }}>Status</th>
                  <th style={{ width: '120px' }}>Created</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subcategories.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-4">
                      <i className="bi bi-folder-x" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
                      <p className="mt-2 mb-0">No subcategories found</p>
                      <p className="text-muted">Click "Add Subcategory" to create your first subcategory</p>
                    </td>
                  </tr>
                ) : (
                  subcategories.map((subcategory) => (
                    <tr key={subcategory._id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedSubcategories.includes(subcategory._id)}
                          onChange={() => onSelect(subcategory._id)}
                          style={{
                            fontSize: "14px",
                            '--bs-border-width': '2px',
                            '--bs-border-color': '#000000',
                          }}
                        />
                      </td>
                      <td>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '2px solid #dee2e6'
                        }}>
                          {subcategory.img ? (
                            <img
                              src={`http://localhost:5000${subcategory.img}`}
                              alt={subcategory.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = `
                                  <div style="
                                    width: 100%;
                                    height: 100%;
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    color: white;
                                    font-weight: bold;
                                    font-size: 16px;
                                    border-radius: 6px;
                                  ">
                                    ${subcategory.name.charAt(0).toUpperCase()}
                                  </div>
                                `;
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
                              fontSize: '16px',
                              borderRadius: '6px'
                            }}>
                              {subcategory.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <strong>{subcategory.name}</strong>
                      </td>
                      <td>
                        <code>{subcategory.key}</code>
                      </td>
                      <td>
                        <Badge bg="info" className="me-1">
                          {subcategory.categoryName || 'Unknown'}
                        </Badge>
                      </td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '200px' }}>
                          {subcategory.description || 'No description'}
                        </div>
                      </td>
                      <td className="text-center">
                        {subcategory.order}
                      </td>
                      <td>
                        <Form.Check
                          type="switch"
                          checked={subcategory.isActive}
                          onChange={() => onToggleStatus(subcategory._id, !subcategory.isActive)}
                          label={subcategory.isActive ? 'Active' : 'Inactive'}
                        />
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(subcategory.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => onEdit(subcategory)}
                            title="Edit Subcategory"
                          >
                            <MdModeEdit />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(subcategory)}
                            title="Delete Subcategory"
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

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {subcategoryToDelete && (
            <>
              <p>Are you sure you want to delete the subcategory:</p>
              <div className="alert alert-warning">
                <strong>{subcategoryToDelete.name}</strong>
                {subcategoryToDelete.categoryName && (
                  <div className="mt-1">
                    <small>Parent Category: {subcategoryToDelete.categoryName}</small>
                  </div>
                )}
              </div>
              <p className="text-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                This action cannot be undone. Any packages using this subcategory will be updated.
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete Subcategory
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Subcategories;