import { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';

const SubcategoryForm = ({ 
  categories, 
  subcategoryData = null,
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    key: '',
    order: 0,
    isActive: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (subcategoryData) {
      setFormData({
        name: subcategoryData.name || '',
        categoryId: subcategoryData.categoryId || '',
        description: subcategoryData.description || '',
        key: subcategoryData.key || '',
        order: subcategoryData.order || 0,
        isActive: subcategoryData.isActive !== undefined ? subcategoryData.isActive : true
      });
      if (subcategoryData.img) {
        setImagePreview(`http://localhost:5000${subcategoryData.img}`);
      }
    }
  }, [subcategoryData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.categoryId) newErrors.categoryId = 'Parent category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData, imageFile);
    }
  };

  // Auto-generate key from name
  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name: name,
      key: prev.key || name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')
    }));
  };

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <h5 className="mb-4">
          {subcategoryData ? 'Edit Subcategory' : 'Add New Subcategory'}
        </h5>
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Subcategory Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  isInvalid={!!errors.name}
                  placeholder="Enter subcategory name"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Parent Category *</Form.Label>
                <Form.Select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  isInvalid={!!errors.categoryId}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name} {!cat.isActive && "(Inactive)"}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.categoryId}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter subcategory description (optional)"
            />
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Key (URL Identifier)</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({...formData, key: e.target.value})}
                  placeholder="e.g., hair-care, facial-treatments"
                />
                <Form.Text className="text-muted">
                  Used in URLs. Auto-generated from name if left empty.
                </Form.Text>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Display Order</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                  min="0"
                />
                <Form.Text className="text-muted">
                  Lower numbers appear first
                </Form.Text>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-4">
            <Form.Label>Image</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
            />
            <Form.Text className="text-muted">
              Recommended: 300x300px, PNG or JPG
            </Form.Text>
            
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                  }}
                />
              </div>
            )}
          </Form.Group>
          
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {subcategoryData ? 'Update' : 'Create'} Subcategory
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SubcategoryForm;