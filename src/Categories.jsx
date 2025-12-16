import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, Table, Form, Button, Alert, Badge, Spinner,
  Row, Col
} from 'react-bootstrap';
import { MdModeEdit, MdOutlineDelete } from "react-icons/md";
import TableControls from './TableControls';
import { IoEyeSharp } from "react-icons/io5";
import { 
  getTableElement, 
  exportAsPDF, 
  exportAsExcel, 
  exportAsCSV,
  getCSVHeadersFromData
} from './downloadUtils'; 

function Categories({
  categories,
  onEdit,
  onToggleStatus,
  itemsPerPage = 10,
  onItemsPerPageChange,
  searchQuery = "",
  onSearchChange,
  loading = false,
  // New props for pagination
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange
}) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loadingImages, setLoadingImages] = useState({});
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [perPage, setPerPage] = useState(itemsPerPage);

  // Filter categories based on search term (client-side)
  const filteredCategories = useMemo(() => {
    if (!localSearch.trim()) {
      return categories;
    }
    
    const searchTerm = localSearch.toLowerCase().trim();
    return categories.filter(category => {
      return (
        (category.name && category.name.toLowerCase().includes(searchTerm)) ||
        (category.description && category.description.toLowerCase().includes(searchTerm)) ||
        (category.category && category.category.toLowerCase().includes(searchTerm)) ||
        (category.key && category.key.toLowerCase().includes(searchTerm))
      );
    });
  }, [categories, localSearch]);

  const handleSelect = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(filteredCategories.map(c => c._id));
    }
    setSelectAll(!selectAll);
  };

  const handleBulkDeleteClick = () => {
    if (selectedCategories.length > 0 && onBulkDelete) {
      onBulkDelete(selectedCategories);
      setSelectedCategories([]);
      setSelectAll(false);
    }
  };

  // Immediate search filtering (client-side)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    if (onItemsPerPageChange) {
      onItemsPerPageChange(newPerPage);
    }
  };

  // Download functions using utilities
  const handleDownloadPDF = () => {
    const tableElement = getTableElement('.table-responsive');
    if (tableElement) {
      exportAsPDF(tableElement, 'categories');
    }
  };

  const handleDownloadExcel = () => {
    const dataForExport = filteredCategories.map(cat => ({
      'Name': cat.name,
      'Description': cat.description || 'No description',
      'Status': cat.isActive !== false ? 'Active' : 'Inactive',
      'Image URL': cat.img ? `http://localhost:5000${cat.img}` : 'No Image',
      'Key': cat.key || ''
    }));
    
    exportAsExcel(dataForExport, 'categories');
  };

  const handleDownloadCSV = () => {
    const dataForExport = filteredCategories.map(cat => ({
      'Name': cat.name,
      'Description': cat.description || 'No description',
      'Status': cat.isActive !== false ? 'Active' : 'Inactive',
      'Image URL': cat.img ? `http://localhost:5000${cat.img}` : 'No Image',
      'Key': cat.key || ''
    }));
    
    const headers = getCSVHeadersFromData(dataForExport);
    exportAsCSV(dataForExport, headers, 'categories');
  };

  // Reset selection when categories change
  useEffect(() => {
    setSelectedCategories([]);
    setSelectAll(false);
  }, [categories]);

  // Update local search when prop changes
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Update local perPage when prop changes
  useEffect(() => {
    setPerPage(itemsPerPage);
  }, [itemsPerPage]);

  // Function to get initials from category name
  const getInitials = (name) => {
    if (!name || typeof name !== 'string' || name.trim() === '') return 'NA';
    
    const nameParts = name.trim().split(' ').filter(part => part.length > 0);
    
    if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    
    return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
  };

  // Function to check if image exists
  const checkImageExists = (imgUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = imgUrl;
    });
  };

  // Test image URLs when component mounts or categories change
  useEffect(() => {
    const testImages = async () => {
      const results = {};
      for (const category of categories) {
        if (category.img) {
          const fullUrl = `http://localhost:5000${category.img}`;
          const exists = await checkImageExists(fullUrl);
          results[category._id] = exists;
        }
      }
      setLoadingImages(results);
    };

    if (categories.length > 0) {
      testImages();
    }
  }, [categories]);

  return (
    <div>
      <Card className="shadow-lg">
        <Card.Body style={{ marginLeft: "25px", marginRight: "25px" }}>
          <h5 className="mb-0 fw-semibold">
            <>
              Category Management
              <span className="text-muted mx-2" style={{ fontSize: "14px", fontWeight: "normal" }}>•</span>
              <span className="text-muted " style={{ fontSize: "14px", fontWeight: "normal" }}>Manage Categories</span>
            </>
          </h5>
        </Card.Body>
      </Card>

      <br />

      <Card className="border-0 shadow-sm">
        <Card.Header className="border-0" style={{backgroundColor:"white"}}>
          <Row style={{ marginLeft: "25px", marginRight: "25px" }}>
            <Col>
              <h5 className="mb-1 fw-semibold" style={{marginTop:"10px"}}>Manage Categories</h5>
              <p className='text-muted' style={{ fontSize: "10.5px" }}>Use this form to update category details</p>
            </Col>
            <Col>
             {/* Table Controls */}
          <TableControls
            // Pagination props
            itemsPerPage={perPage}
            onItemsPerPageChange={handlePerPageChange}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={onPageChange}
            
            // Search props
            searchValue={localSearch}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search categories..."
            
            // Download props
            onDownloadPDF={handleDownloadPDF}
            onDownloadExcel={handleDownloadExcel}
            onDownloadCSV={handleDownloadCSV}
            dataType="categories"
            
            // Additional options
            showPerPage={true}
            showDownload={true}
            showSearch={true}
            // Add this to force show arrows
            showPagination={true}
          /></Col>
          </Row>
        </Card.Header>

        <Card.Body style={{ marginLeft: "25px", marginRight: "25px" }}>
          {/* Bulk Selection Alert */}
          {selectedCategories.length > 0 && (
            <Alert variant="dark" className="d-flex justify-content-between align-items-center mb-3">
              <span>
                <i className="bi bi-check-circle-fill me-2"></i>
                {selectedCategories.length} category(ies) selected
              </span>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDeleteClick}
              >
                <i className="bi bi-trash me-2"></i>Delete Selected
              </Button>
            </Alert>
          )}
          {/* Categories Table */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Loading categories...</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table striped bordered hover style={{border:"2px solid"}}>
                  <thead>
                    <tr>
                      <th >
                        <Form.Check
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          style={{ 
                            fontSize: "14px",
                            '--bs-border-width': '2px',
                            '--bs-border-color': '#000000',
                          }}
                        />
                      </th>
                      <th >Image</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th >Status</th>
                      <th >Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          <div className="mb-3">
                            <i className="bi bi-search" style={{ fontSize: '48px', color: '#6c757d' }}></i>
                          </div>
                          <h5>No Categories Found</h5>
                          <p className="text-muted">
                            {localSearch ? `No categories found for "${localSearch}"` : 'No categories available'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((category) => {
                        const imageUrl = category.img
                          ? `http://localhost:5000${category.img}`
                          : 'http://localhost:5000/assets/default-category.png';

                        return (
                          <tr key={category._id} className="align-middle">
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={selectedCategories.includes(category._id)}
                                onChange={() => handleSelect(category._id)}
                                style={{ 
                                  fontSize: "14px",
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
                                border: '1px solid #dee2e6',
                                borderRadius: '8px',
                                position: 'relative'
                              }}>
                                {loadingImages[category._id] === undefined ? (
                                  // Loading state
                                  <div className='d-flex align-items-center justify-content-center w-100 h-100' style={{
                                    background: '#f8f9fa'
                                  }}>
                                    <Spinner animation="border" size="sm" />
                                  </div>
                                ) : loadingImages[category._id] === false || !category.img ? (
                                  // Fallback when image doesn't exist
                                  <div className='d-flex fw-bold align-items-center justify-content-center w-100 h-100' style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    fontSize: '16px'
                                  }}>
                                    {getInitials(category.name)}
                                  </div>
                                ) : (
                                  // Show actual image
                                  <img
                                    src={imageUrl}
                                    alt={category.name}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                  />
                                )}
                              </div>
                            </td>
                            <td>
                              <div>
                                <strong>{category.name}</strong>
                                {category.key && (
                                  <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
                                    Key: {category.key}
                                  </small>
                                )}
                              </div>
                            </td>
                            <td>
                              <div style={{ maxWidth: '200px' }}>
                                <span className="text-truncate d-inline-block" style={{ maxWidth: '100%' }}>
                                  {category.description || 'No description'}
                                </span>
                              </div>
                            </td>
                          
                            <td>
                              <Form.Check
                                type="switch"
                                id={`category-active-${category._id}`}
                                checked={category.isActive !== false}
                                onChange={(e) => {
                                  if (onToggleStatus) {
                                    onToggleStatus(category._id, e.target.checked);
                                  }
                                }}
                                label={
                                  <span>
                                    {category.isActive !== false ? 'Enable' : 'Disable'}
                                  </span>
                                }
                              />
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <Button
                                  variant="warning"
                                  size="sm"
                                  onClick={() => onEdit && onEdit(category)}
                                  title="Edit Category"
                                  style={{
                                    minWidth: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <MdModeEdit />
                                </Button>
                                <Button
                                variant="dark"size="sm"
                                onClick={() => handleViewCategory(category)}
                                title="View User Details">
                                  <IoEyeSharp />
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => onDelete && onDelete(category._id)}
                                  title="Delete Category"
                                  style={{
                                    minWidth: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <MdOutlineDelete />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </div>

              {filteredCategories.length === 0 && categories.length > 0 && (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="bi bi-search" style={{ fontSize: '48px', color: '#6c757d' }}></i>
                  </div>
                  <h5>No Categories Found</h5>
                  <p className="text-muted mb-4">
                    No categories match "{localSearch}"
                  </p>
                  <Button
                    variant="outline-primary"
                    onClick={() => {
                      setLocalSearch('');
                      if (onSearchChange) {
                        onSearchChange('');
                      }
                    }}
                    style={{ borderRadius: '6px' }}
                  >
                    <i className="bi bi-x-circle me-2"></i>Clear Search
                  </Button>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default Categories;