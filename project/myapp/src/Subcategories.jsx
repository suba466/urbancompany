import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, Table, Form, Button, Alert,
  Row, Col, Spinner
} from 'react-bootstrap';
import { MdModeEdit, MdOutlineDelete } from "react-icons/md";
import { IoEyeSharp } from "react-icons/io5";
import TableControls from './TableControls';
import {
  exportAsPDF,
  generatePDFReportHTML,
  exportAsCSV,
  exportAsExcel,
  getCSVHeadersFromData
} from './downloadUtils';

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
  onView,
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
  // Local state for search - initialize with prop value
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [localSubcategories, setLocalSubcategories] = useState(subcategories);

  // Update local subcategories when prop changes
  useEffect(() => {
    setLocalSubcategories(subcategories);
  }, [subcategories]);

  // Update local search when prop changes
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Filter subcategories based on search term (client-side filtering)
  const filteredSubcategories = useMemo(() => {
    // Fix: Check if localSearch is a string before calling trim()
    if (!localSearch || typeof localSearch !== 'string' || !localSearch.trim()) {
      return localSubcategories;
    }

    const searchTerm = localSearch.toLowerCase().trim();
    return localSubcategories.filter(sub => {
      return (
        (sub.name && sub.name.toLowerCase().includes(searchTerm)) ||
        (sub.categoryName && sub.categoryName.toLowerCase().includes(searchTerm))
      );
    });
  }, [localSubcategories, localSearch]);

  const handleDelete = (subcategory) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${subcategory.name}"?\nThis action cannot be undone.`
    );
    if (confirmDelete) {
      onDelete(subcategory._id);
    }
  };

  // Handle status toggle
  const handleStatusToggle = (subcategoryId, isActive) => {
    // Update local state immediately
    setLocalSubcategories(prevSubcategories =>
      prevSubcategories.map(subcategory =>
        subcategory._id === subcategoryId
          ? { ...subcategory, isActive }
          : subcategory
      )
    );

    // Call the parent function to update on server
    if (onToggleStatus) {
      onToggleStatus(subcategoryId, isActive);
    }
  };

  const prepareDataForExport = () => {
    return filteredSubcategories.map(sub => ({
      'Subcategory ID': sub._id,
      'Name': sub.name,
      'Parent Category': sub.categoryName,
      'Status': sub.isActive ? 'Active' : 'Inactive',
      'Created': new Date(sub.createdAt).toLocaleDateString()
    }));
  };

  const handleExportCSV = () => {
    const data = prepareDataForExport();
    const headers = getCSVHeadersFromData(data);
    exportAsCSV(data, headers, 'subcategories');
  };

  const handleExportExcel = () => {
    const data = prepareDataForExport();
    exportAsExcel(data, 'subcategories');
  };

  const handleDownloadPDF = () => {
    const data = filteredSubcategories.map(sub => ({
      'Image': sub.img ? `http://localhost:5000${sub.img}` : null,
      'Name': sub.name,
      'Category': sub.categoryName || 'Unknown',
      'Status': sub.isActive ? 'Active' : 'Inactive'
    }));
    const headers = ['Image', 'Name', 'Category', 'Status'];
    const element = generatePDFReportHTML('Subcategory Report', headers, data);
    exportAsPDF(element, 'subcategories');
  };

  // Handle search change - FIXED: Accept event object
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading subcategories...</p>
      </div>
    );
  }

  return (
    <div>
      <Card className="shadow-lg">
        <Card.Body>
          <h5 className="fw-semibold mb-0">
            Subcategory Management
            <span className="text-muted mx-2">•</span>
            <span className="text-muted fs-6">Manage Subcategories</span>
          </h5>
        </Card.Body>
      </Card>

      <br />

      <Card className="shadow-lg">
        <Card.Header className="bg-white border-0">
          <Row>
            <Col>
              <h6 className="fw-semibold">Manage Subcategories</h6>
              <small className="text-muted">
                Organize services into subcategories
              </small>
            </Col>
            <Col>
              <TableControls
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={onItemsPerPageChange}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={onPageChange}
                searchValue={localSearch}
                onSearchChange={handleSearchChange}
                searchPlaceholder="Search subcategories..."
                onDownloadCSV={handleExportCSV}
                onDownloadExcel={handleExportExcel}
                onDownloadPDF={handleDownloadPDF}
                selectedCount={selectedSubcategories.length}
                onBulkDelete={() => onBulkDelete(selectedSubcategories)}
                showBulkActions
                bulkEntityName="subcategories"
              />
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {selectedSubcategories.length > 0 && (
            <Alert variant="dark" className="d-flex justify-content-between">
              <span>{selectedSubcategories.length} selected</span>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onBulkDelete(selectedSubcategories)}
              >
                Delete Selected
              </Button>
            </Alert>
          )}

          <div className="table-responsive">
            <Table striped bordered hover style={{ border: "2px solid" }}>
              <thead>
                <tr>
                  <th>
                    <Form.Check
                      checked={selectAllSubcategories}
                      onChange={onSelectAll} className='check'
                    />
                  </th>
                  <th style={{ width: "80px" }}>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSubcategories.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      {localSearch && typeof localSearch === 'string' && localSearch.trim() ? (
                        <div>
                          <i className="bi bi-search mb-3" style={{ fontSize: '48px', color: '#6c757d' }}></i>
                          <h5>No Subcategories Found</h5>
                          <p className="text-muted">No subcategories match "{localSearch}"</p>
                        </div>
                      ) : (
                        <div>
                          <i className="bi bi-folder2-open mb-3" style={{ fontSize: '48px', color: '#6c757d' }}></i>
                          <h5>No Subcategories Found</h5>
                          <p className="text-muted">No subcategories available. Click "Add Subcategory" to create one.</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredSubcategories.map(sub => (
                    <tr key={sub._id}>
                      <td>
                        <Form.Check
                          checked={selectedSubcategories.includes(sub._id)}
                          onChange={() => onSelect(sub._id)} className='check'
                        />
                      </td>

                      <td>
                        <img
                          src={sub.img
                            ? `http://localhost:5000${sub.img}`
                            : 'https://via.placeholder.com/40'}
                          alt={sub.name}
                          width="40"
                          height="40"
                          style={{ objectFit: 'cover', borderRadius: '6px' }}
                        />
                      </td>

                      <td>
                        <strong>{sub.name}</strong>
                      </td>
                      <td>{sub.categoryName || 'Unknown'}</td>

                      <td>
                        <Form.Check
                          type="switch"
                          checked={sub.isActive}
                          onChange={(e) => handleStatusToggle(sub._id, e.target.checked)}
                          label={sub.isActive ? 'Enabled' : 'Disabled'}
                        />
                      </td>

                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="warning"
                            size="sm"
                            title="Edit"
                            onClick={() => onEdit(sub)}
                          >
                            <MdModeEdit />
                          </Button>

                          <Button
                            variant="dark"
                            size="sm"
                            title="View"
                            onClick={() => onView(sub)}
                          >
                            <IoEyeSharp />
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            title="Delete"
                            onClick={() => handleDelete(sub)}
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
};

export default Subcategories;