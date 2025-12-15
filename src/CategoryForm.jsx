// In CategoryForm.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';

function CategoryForm({ isEditing, categoryData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && categoryData) {
      setFormData({
        name: categoryData.name || '',
        description: categoryData.description || '',
        category: categoryData.category || 'General',
        isActive: categoryData.isActive !== undefined ? categoryData.isActive : true
      });
      
      if (categoryData.img) {
        setPreviewUrl(`http://localhost:5000${categoryData.img}`);
      }
    }
  }, [isEditing, categoryData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setImageFile(file);
      setError('');
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }
    
    try {
      await onSubmit(formData, imageFile);
    } catch (err) {
      setError(err.message || 'Failed to save category');
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="p-3">
      <Card className="shadow-lg">
        <Card.Body style={{marginLeft:"25px",marginRight:"25px"}}>
          <h5 className="mb-0 fw-semibold">
            {isEditing ? 'Edit Category' : (
              <>
                Category Management
                <span className="text-muted mx-2" style={{fontSize:"14px",fontWeight:"normal"}}>•</span>
                <span className="text-muted " style={{fontSize:"14px",fontWeight:"normal"}}>New Category</span>
              </>
            )}
          </h5>
        </Card.Body>
      </Card> 
      
      <br />
      
      <Card className="border-0 shadow-lg ">
        <Card.Body style={{marginLeft:"25px",marginRight:"25px"}}>
          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}
          
          <div className="mb-4">
            {isEditing ? (
              <>
                <h5 className="fw-semibold mb-1">Edit Category</h5>
                <p className='text-muted' style={{fontSize:"12px"}}>Update the category details</p>
              </>
            ) : (
              <>
                <h5 className="fw-semibold mb-1">New Category</h5>
                <p className='text-muted' style={{fontSize:"12px"}}>Use the below form to create a new category</p>
              </>
            )}
          </div>
          
          <Form onSubmit={handleSubmit}>
            <Row>
              {/* Left Column - Form Fields */}
              <Col md={7}>
                <div style={{ paddingRight: '30px' }}>
                  <Form.Group className="mb-4">
                    <Form.Control
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      placeholder="Category name"
                      style={{ 
                        border: "2px solid #000000",
                        borderRadius: "5px",height:"45px"
                      }}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Description"
                      style={{ 
                        border: "2px solid #000000",
                        borderRadius: "5px",height:"55px"
                      }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      label="Enable"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="fw-medium" 
                      style={{ fontSize: "14px",
                                '--bs-border-width': '2px',
                                '--bs-border-color': '#000000',}}
                    />
                  </Form.Group>
                </div>
              </Col>
              
              {/* Right Column - Image Upload */}
              <Col md={5}>
                <div style={{ 
                  borderLeft: "1px solid #dee2e6", 
                  paddingLeft: "30px",
                  height: "100%"
                }}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium mb-3 d-block text-center">Category Image</Form.Label>
                    <div className="text-center">
                      <div style={{ 
                        border: "2px dashed #000000",
                        borderRadius: "12px",
                        padding: "20px",
                        backgroundColor: "#f8f9fa",
                        marginBottom: "20px"
                      }}>
                        {previewUrl ? (
                          <>
                            <img 
                              src={previewUrl} 
                              alt="Preview" 
                              style={{ 
                                width: '200px', 
                                height: '200px', 
                                objectFit: 'cover',
                                borderRadius: '8px',
                                marginBottom: '15px',
                                border: "1px solid #dee2e6"
                              }}
                            />
                          </>
                        ) : (
                          <div 
                            className="d-flex flex-column align-items-center justify-content-center"
                            style={{ 
                              minHeight: '200px',
                              cursor: 'pointer'
                            }}
                            onClick={() => document.getElementById('imageUpload').click()}
                          >
                            <i className="bi bi-cloud-arrow-up" style={{ 
                              fontSize: '48px', 
                              color: '#6c757d',
                              marginBottom: '15px'
                            }}></i>
                            <p className="text-muted mb-2">Click to upload image</p>
                            <p className="text-muted" style={{ fontSize: '12px' }}>
                              JPG, PNG up to 5MB
                            </p>
                            <p className="text-muted" style={{ fontSize: '12px' }}>
                              Recommended: 300x300px
                            </p>
                          </div>
                        )}
                        
                        <Form.Control
                          id="imageUpload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="d-none"
                        />
                      </div>
                      
                      <Button 
                        variant="outline-dark" 
                        className="w-100"
                        onClick={() => document.getElementById('imageUpload').click()}
                        style={{ border: "2px solid #000000" }}
                      >
                        <i className="bi bi-upload me-2"></i>
                        {previewUrl ? 'Change Image' : 'Upload Image'}
                      </Button>
                    </div>
                  </Form.Group>
                </div>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-center gap-3 mt-5  ">
              <Button 
                variant="outline-dark" 
                onClick={handleCancel}
                style={{ minWidth: '100px',borderRadius:"50px" }}
              >
                Cancel
              </Button>
              
              <Button 
                variant="dark" 
                type="submit"
                style={{ minWidth: '100px',borderRadius:"50px" }}
              >
                <i className={`bi ${isEditing ? 'bi-pencil' : 'bi-plus-circle'} me-2`}></i>
                {isEditing ? 'Update' : 'Submit'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default CategoryForm;