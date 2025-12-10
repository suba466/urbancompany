// In CategoryForm.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';

function CategoryForm({ isEditing, categoryData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'General',
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
        category: categoryData.category || 'General',
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

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="border-0 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">{isEditing ? 'Edit Category' : 'Add New Category'}</h5>
          <p className="text-muted mb-0">{isEditing ? 'Update category details' : 'Add a new category to the system'}</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="secondary" 
            onClick={onCancel}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Categories
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            {error}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Category Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Enter category name"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter category description"
                />
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category Type</Form.Label>
                    <Form.Select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="General">General</option>
                      <option value="Salon">Salon</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Repair">Repair</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrician">Electrician</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Display Order</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                      placeholder="Display order"
                    />
                    <Form.Text className="text-muted">
                      Lower numbers appear first
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Category Image</Form.Label>
                <div className="border rounded p-3 text-center">
                  {previewUrl ? (
                    <div className="mb-3">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        style={{ 
                          width: '150px', 
                          height: '150px', 
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="mb-3">
                      <div style={{ 
                        width: '150px', 
                        height: '150px', 
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6c757d',
                        margin: '0 auto'
                      }}>
                        <i className="bi bi-image" style={{ fontSize: '48px' }}></i>
                      </div>
                    </div>
                  )}
                  
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mb-2"
                  />
                  <Form.Text className="text-muted">
                    Upload category image. Max size: 5MB. Recommended: 300x300px.
                  </Form.Text>
                </div>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Active Category"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-end gap-2">
            <Button 
              variant="secondary" 
              onClick={() => {
                setFormData({
                  name: '',
                  description: '',
                  category: 'General',
                  order: 0,
                  isActive: true
                });
                setImageFile(null);
                setPreviewUrl('');
              }}
            >
              Clear Form
            </Button>
            <Button variant="primary" type="submit">
              <i className={`bi ${isEditing ? 'bi-pencil' : 'bi-plus-circle'} me-2`}></i>
              {isEditing ? 'Update Category' : 'Add Category'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default CategoryForm;