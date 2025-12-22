import React, { useState } from 'react';
import {
  Card, Table, Form, Button, Alert,
  Row, Col, Spinner
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
  onView,                // 👈 NEW
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

  const handleDelete = (subcategory) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${subcategory.name}"?\nThis action cannot be undone.`
    );
    if (confirmDelete) {
      onDelete(subcategory._id);
    }
  };

  const handleExport = (format) => {
    const data = subcategories.map(sub => ({
      'Subcategory ID': sub._id,
      'Name': sub.name,
      'Parent Category': sub.categoryName,
      'Status': sub.isActive ? 'Active' : 'Inactive',
      'Created': new Date(sub.createdAt).toLocaleDateString()
    }));

    if (format !== 'csv') {
      alert(`${format.toUpperCase()} export requires extra library`);
      return;
    }

    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const content = `${headers}\n${rows}`;

    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subcategories.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
                searchValue={searchQuery}
                onSearchChange={onSearchChange}
                searchPlaceholder="Search subcategories..."
                onDownloadCSV={() => handleExport('csv')}
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
            <Table bordered hover>
              <thead>
                <tr>
                  <th>
                    <Form.Check
                      checked={selectAllSubcategories}
                      onChange={onSelectAll}
                    />
                  </th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {subcategories.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No subcategories found
                    </td>
                  </tr>
                ) : (
                  subcategories.map(sub => (
                    <tr key={sub._id}>
                      <td>
                        <Form.Check
                          checked={selectedSubcategories.includes(sub._id)}
                          onChange={() => onSelect(sub._id)}
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

                      <td><strong>{sub.name}</strong></td>
                      <td>{sub.categoryName || 'Unknown'}</td>

                      <td>
                        <Form.Check
                          type="switch"
                          checked={sub.isActive}
                          onChange={() =>
                            onToggleStatus(sub._id, !sub.isActive)
                          }
                          label={sub.isActive ? 'Enable' : 'Disable'}
                        />
                      </td>

                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="info"
                            size="sm"
                            title="View"
                            onClick={() => onView(sub)}   // 👈 VIEW
                          >
                            <IoEyeSharp />
                          </Button>

                          <Button
                            variant="warning"
                            size="sm"
                            title="Edit"
                            onClick={() => onEdit(sub)}
                          >
                            <MdModeEdit />
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
