import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';

function CategoryForm({ isEditing, categoryData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    key: '',
    order: 0,
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
        key: categoryData.key || categoryData.name?.toLowerCase().replace(/ /g, '-') || '',
        order: categoryData.order || 0,
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
      
      <Card className="border-0 shadow-lg">
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
            <Row className="mb-3">
              {/* Name Field */}
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    placeholder="Category name"
                    style={{ 
                      border: "2px solid #000000",
                      borderRadius: "5px",
                      height:"45px"
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Control
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Description"
                    style={{ 
                      border: "2px solid #000000",
                      borderRadius: "5px", 
                      height:"45px"
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            
            {/* Image Upload Section */}
            <div className="mb-3">
              <Form.Group>
                <Form.Label className="fw-semibold mb-3 d-block text-center">Category Image</Form.Label>
                <div className="d-flex justify-content-center">
                  <div style={{ 
                    width: '100%',
                    maxWidth: '400px'
                  }}>
                    <div style={{ 
                      border: "2px dashed #000000",
                      borderRadius: "12px",
                      backgroundColor: "#f8f9fa",
                      marginBottom: "15px",
                      overflow: 'hidden'
                    }}>
                      {previewUrl ? (
                        <div className="text-center p-3">
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            style={{ 
                              width: '150px', 
                              height: '150px', 
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: "1px solid #dee2e6",
                              margin: '10px auto'
                            }}
                          />
                        </div>
                      ) : (
                        <div 
                          className="d-flex flex-column align-items-center justify-content-center p-4"
                          style={{ 
                            minHeight: '180px',
                            cursor: 'pointer'
                          }}
                          onClick={() => document.getElementById('imageUpload').click()}
                        >
                          <i 
                            className="bi bi-cloud-arrow-up" 
                            style={{ 
                              fontSize: '40px', 
                              color: '#6c757d',
                              marginBottom: '10px'
                            }}
                          ></i>
                          <p className="text-muted mb-1">Click to upload image</p>
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
                      style={{ 
                        border: "2px solid #000000",
                        height: '45px'
                      }}
                    >
                      <i className="bi bi-upload me-2"></i>
                      {previewUrl ? 'Change Image' : 'Upload Image'}
                    </Button>
                  </div>
                </div>
              </Form.Group>
            </div>
            
            <div className="d-flex justify-content-center gap-3 ">
              <Button 
                variant="outline-dark" 
                onClick={handleCancel}
                style={{ 
                  minWidth: '100px',
                  borderRadius: "50px",
                  height: '45px'
                }}
              >
                Cancel
              </Button>
              
              <Button 
                variant="dark" 
                type="submit"
                style={{ 
                  minWidth: '100px',
                  borderRadius: "50px",
                  height: '45px'
                }}
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