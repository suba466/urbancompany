// Categories.jsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { MdModeEdit, MdOutlineDelete } from "react-icons/md";

function Categories({ categories, onEdit, onDelete, onBulkDelete, onToggleStatus }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loadingImages, setLoadingImages] = useState({});

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
      setSelectedCategories(categories.map(c => c._id));
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

  // Function to get initials from category name
  const getInitials = (name) => {
    if (!name) return 'NA';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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

  // Test image URLs when component mounts
  useEffect(() => {
    const testImages = async () => {
      const results = {};
      for (const category of categories) {
        if (category.img) {
          const fullUrl = `http://localhost:5000${category.img}`;
          const exists = await checkImageExists(fullUrl);
          results[category._id] = exists;
          console.log(`Image for ${category.name}:`, {
            url: fullUrl,
            exists,
            imgPath: category.img
          });
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
      <Card>
        <Card.Body className="border-0 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">Category management</h5>
          
        </div>
        <div className="d-flex gap-2">
          <Form.Control
            type="search"
            placeholder="Search categories..."
            style={{ border:"2px solid ",width: '250px', height: "40px", marginTop: "10px" }}
          />
        </div>
      </Card.Body>
      </Card>
    <Card className="border-0 shadow-sm">
      <Card.Body>
        {selectedCategories.length > 0 && (
          <Alert variant="dark" className="d-flex justify-content-between align-items-center">
            <span>{selectedCategories.length} category(ies) selected</span>
            <Button 
              variant="danger" 
              size="sm"
              onClick={handleBulkDeleteClick}
            >
              <i className="bi bi-trash me-2"></i>Delete Selected
            </Button>
          </Alert>
        )}
        
        <div className="table-responsive">
          <Table hover responsive>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <Form.Check
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                <th style={{ width: '80px' }}>Image</th>
                <th>Name</th>
                <th>Description</th>
                <th>Category</th>
                <th style={{ width: '80px' }}>Order</th>
                <th style={{ width: '120px' }}>Status</th>
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const imageUrl = category.img 
                  ? `http://localhost:5000${category.img}`
                  : 'http://localhost:5000/assets/default-category.png';
                
                return (
                  <tr key={category._id}>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={selectedCategories.includes(category._id)}
                        onChange={() => handleSelect(category._id)}
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
                          <div style={{ 
                            width: '100%', 
                            height: '100%', 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f8f9fa'
                          }}>
                            <Spinner animation="border" size="sm" />
                          </div>
                        ) : loadingImages[category._id] === false || !category.img ? (
                          // Fallback when image doesn't exist
                          <div style={{ 
                            width: '100%', 
                            height: '100%', 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
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
                          <small className="text-muted d-block">Key: {category.key}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: '200px' }}>
                        {category.description || 'No description'}
                      </div>
                    </td>
                    <td>
                      <Badge bg="secondary">
                        {category.category || 'General'}
                      </Badge>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark" style={{ fontSize: '14px' }}>
                        {category.order || 0}
                      </span>
                    </td>
                    <td>
                      <Form.Check
                        type="switch"
                        id={`category-active-${category._id}`}
                        checked={category.isActive}
                        onChange={(e) => {
                          if (onToggleStatus) {
                            onToggleStatus(category._id, e.target.checked);
                          }
                        }}
                        label={category.isActive ? 'Enable' : 'Disable'}
                      />
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button 
                          variant="warning" 
                          size="sm"
                          onClick={() => onEdit && onEdit(category)}
                          title="Edit Category"
                        >
                          <MdModeEdit/>
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => onDelete && onDelete(category._id)}
                          title="Delete Category"
                        >
                          <MdOutlineDelete/>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
        
        {categories.length === 0 && (
          <div className="text-center py-5">
            <div className="mb-3">
              <i className="bi bi-folder-x" style={{ fontSize: '48px', color: '#6c757d' }}></i>
            </div>
            <h5>No Categories Found</h5>
            <p className="text-muted">Add your first category to get started</p>
            <Button variant="primary" onClick={() => window.location.hash = '#add-category'}>
              <i className="bi bi-plus-circle me-2"></i>Add Category
            </Button>
          </div>
        )}
      </Card.Body>
    </Card></div>
  );
}

export default Categories;