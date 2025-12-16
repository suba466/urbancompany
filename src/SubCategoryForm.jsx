import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const SubCategoryForm = ({ 
  isEditing, 
  categoryData, 
  categories, // Parent categories list
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: '',
    order: 0,
    isActive: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && categoryData) {
      setFormData({
        name: categoryData.name || '',
        description: categoryData.description || '',
        parentCategory: categoryData.parentCategory || '',
        order: categoryData.order || 0,
        isActive: categoryData.isActive !== false
      });
      if (categoryData.img) {
        setImagePreview(`http://localhost:5000${categoryData.img}`);
      }
    }
  }, [isEditing, categoryData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(formData, imageFile);
    } catch (err) {
      setError('Failed to save sub-category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={8} className="mx-auto">
          <Card className="border-0 shadow-sm">
            <Card.Header className="border-0">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">{isEditing ? 'Edit Sub-Category' : 'Add New Sub-Category'}</h5>
                  <p className="text-muted mb-0">
                    {isEditing ? 'Update sub-category details' : 'Create a new sub-category'}
                  </p>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={onCancel}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to List
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Sub-Category Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        disabled={loading}
                        placeholder="Enter sub-category name"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Parent Category <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        value={formData.parentCategory}
                        onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })}
                        required
                        disabled={loading}
                      >
                        <option value="">Select Parent Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={loading}
                    placeholder="Enter description (optional)"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Order</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                        min={0}
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <div className="mt-2">
                        <Form.Check
                          type="switch"
                          label="Active"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          disabled={loading}
                        />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Image (Optional)</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                  />
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
                          border: '2px solid #dee2e6'
                        }}
                      />
                    </div>
                  )}
                </Form.Group>

                <div className="d-flex gap-2 mt-4">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading || !formData.name || !formData.parentCategory}
                  >
                    {loading ? 'Saving...' : (isEditing ? 'Update Sub-Category' : 'Add Sub-Category')}
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={onCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SubCategoryForm;