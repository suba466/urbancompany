import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Form, Button, Badge, Alert } from 'react-bootstrap';
import { MdModeEdit, MdOutlineDelete } from 'react-icons/md';
import TableControls from './TableControls';

const SubCategories = ({
  subCategories,
  onEdit,
  onDelete,
  onBulkDelete,
  onToggleStatus,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  searchQuery,
  onSearchChange,
  itemsPerPage,
  onItemsPerPageChange
}) => {
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      setSelectedIds(subCategories.map(cat => cat._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleBulkAction = () => {
    if (selectedIds.length > 0) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
      setSelectAll(false);
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="shadow-lg">
            <Card.Body style={{ marginLeft: "23px", marginRight: "10px" }}>
              <h5 className="mb-0 fw-semibold">
                Sub-Category Management
                <span className="text-muted mx-2" style={{ fontSize: "14px", fontWeight: "normal" }}>•</span>
                <span className="text-muted" style={{ fontSize: "14px", fontWeight: "normal" }}>Manage Sub-Categories</span>
              </h5>
            </Card.Body>
          </Card>
          <br />
          <Card className="shadow-lg" style={{ border: "5px" }}>
            <Card.Header className="border-0" style={{ backgroundColor: "white" }}>
              <Row style={{ marginLeft: "12px", marginRight: "10px" }}>
                <Col style={{ marginTop: "10px" }}>
                  <h5 className="mb-1 fw-semibold">Manage sub-categories</h5>
                  <p className='text-muted' style={{ fontSize: "10.5px" }}>Use this form to update sub-category profiles</p>
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
                    onSearchChange={(e) => onSearchChange(e.target.value)}
                    searchPlaceholder="Search sub-categories..."
                    selectedCount={selectedIds.length}
                    onBulkDelete={handleBulkAction}
                    showBulkActions={selectedIds.length > 0}
                    bulkEntityName="subcategories"
                  />
                </Col>
              </Row>
            </Card.Header>
            <Card.Body style={{ marginLeft: "20px", marginRight: "20px" }}>
              {selectedIds.length > 0 && (
                <Alert variant="dark" className="d-flex justify-content-between align-items-center mb-3">
                  <span>
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {selectedIds.length} sub-category(s) selected
                  </span>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleBulkAction}
                  >
                    <i className="bi bi-trash me-2"></i>Delete Selected
                  </Button>
                </Alert>
              )}
              
              <div className="table-responsive">
                <Table striped bordered hover style={{ border: "2px solid" }}>
                  <thead>
                    <tr>
                      <th>
                        <Form.Check
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          style={{
                            '--bs-border-width': '2px',
                            '--bs-border-color': '#000000',
                          }}
                        />
                      </th>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Parent Category</th>
                      <th>Status</th>
                      <th>Order</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subCategories.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4 text-muted">
                          No sub-categories found
                        </td>
                      </tr>
                    ) : (
                      subCategories.map((subcat) => (
                        <tr key={subcat._id}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedIds.includes(subcat._id)}
                              onChange={() => handleSelectOne(subcat._id)}
                              style={{
                                '--bs-border-width': '2px',
                                '--bs-border-color': '#000000',
                              }}
                            />
                          </td>
                          <td>
                            <div style={{ 
                              width: '60px', 
                              height: '60px', 
                              overflow: 'hidden',
                              border: '2px solid #dee2e6'
                            }}>
                              <img 
                                src={`http://localhost:5000${subcat.img || '/assets/default-category.png'}`}
                                alt={subcat.name}
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  e.target.src = 'http://localhost:5000/assets/default-category.png';
                                }}
                              />
                            </div>
                          </td>
                          <td>
                            <strong>{subcat.name}</strong>
                          </td>
                          <td>
                            <small className="text-muted">
                              {subcat.description || 'No description'}
                            </small>
                          </td>
                          <td>
                            {subcat.parentCategory ? (
                              <Badge bg="info">{subcat.parentCategory}</Badge>
                            ) : (
                              <Badge bg="secondary">None</Badge>
                            )}
                          </td>
                          <td>
                            <Form.Check
                              type="switch"
                              checked={subcat.isActive}
                              onChange={() => onToggleStatus(subcat._id, !subcat.isActive)}
                            />
                          </td>
                          <td>{subcat.order || 0}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                variant="warning"
                                size="sm"
                                onClick={() => onEdit(subcat)}
                                title="Edit Sub-Category"
                              >
                                <MdModeEdit />
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => onDelete(subcat._id)}
                                title="Delete Sub-Category"
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
        </Col>
      </Row>
    </Container>
  );
};

export default SubCategories;