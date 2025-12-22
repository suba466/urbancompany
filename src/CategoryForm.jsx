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
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing && categoryData) {
      setFormData({
        name: categoryData.name || '',
        description: categoryData.description || '',
        key:
          categoryData.key ||
          categoryData.name?.toLowerCase().replace(/ /g, '-') ||
          '',
        order: categoryData.order || 0,
        isActive:
          categoryData.isActive !== undefined
            ? categoryData.isActive
            : true
      });

      if (categoryData.img) {
        setPreviewUrl(`http://localhost:5000${categoryData.img}`);
      }
    }
  }, [isEditing, categoryData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    setFormError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSuccess(false);
    setFormError('');

    if (!validateForm()) return;

    try {
      await onSubmit(formData, imageFile);
      setFormSuccess(true);

      setTimeout(() => {
        setFormSuccess(false);
      }, 5000);
    } catch (err) {
      setFormError(err.message || 'Failed to save category');
    }
  };

  const triggerFileInput = () => {
    document.getElementById('categoryImageUpload').click();
  };

  return (
    <div className="p-3">
      <Card className="shadow-lg">
        <Card.Body style={{ marginLeft: '25px', marginRight: '25px' }}>
          <h5 className="mb-0 fw-semibold">
            {isEditing ? (
              'Edit Category'
            ) : (
              <>
                Category Management
                <span
                  className="text-muted mx-2"
                  style={{ fontSize: '14px' }}
                >
                  •
                </span>
                <span className="text-muted" style={{ fontSize: '14px' }}>
                  New Category
                </span>
              </>
            )}
          </h5>
        </Card.Body>
      </Card>

      <br />

      <Card className="border-0 shadow-lg">
        <Card.Body style={{ marginLeft: '25px', marginRight: '25px' }}>
          <h5 className="fw-semibold mb-1">
          {isEditing ? 'Edit Category' : 'New Category'}
        </h5>
        <p className="text-muted" style={{ fontSize: '12px' }}>
          {isEditing
            ? 'Use below form to edit Category'
            : 'Use below form to create a new Category'}
        </p>
          {formSuccess && (
            <Alert
              variant="success"
              style={{ height: '50px' }}
              onClose={() => setFormSuccess(false)}
              dismissible
            >
              <p className="mb-0">
                {isEditing
                  ? 'Category updated successfully'
                  : 'Category added successfully'}
              </p>
            </Alert>
          )}

          {formError && (
            <Alert
              variant="danger"
              onClose={() => setFormError('')}
              dismissible
            >
              <Alert.Heading>Error!</Alert.Heading>
              <p>{formError}</p>
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Control
                    type="text"
                    placeholder="Category name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    isInvalid={!!errors.name}
                    className="cate"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Control
                    type="text"
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value
                      })
                    }
                    className="cate"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    Category Image
                  </Form.Label>

                  <div
                    className="text-center"
                    style={{
                      border: '2px dashed #000',
                      borderRadius: '5px',height:"100px",
                      backgroundColor: '#f8f9fa',
                      cursor: 'pointer'
                    }}
                    onClick={triggerFileInput}
                  >
                    <div className="d-flex align-items-center h-100">
                      <div style={{ width: '100px' }}>
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            style={{
                              width: '80px',
                              height: '80px',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />
                        ) : (
                          <i
                            className="bi bi-image"
                            style={{ fontSize: '40px' }}
                          ></i>
                        )}
                      </div>

                      <div className="flex-grow-1 text-center">
                        <p className="mb-1 fw-semibold">
                          {previewUrl
                            ? 'Click to change image'
                            : 'Click to upload image'}
                        </p>
                        <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                          JPG, PNG up to 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <Form.Control
                    id="categoryImageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="d-none"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-center gap-3">
              <Button variant="outline-dark" onClick={onCancel} className="cat">
                Cancel
              </Button>

              <Button variant="dark" type="submit" className="cat">
                <i
                  className={`bi ${
                    isEditing ? 'bi-pencil' : 'bi-plus-circle'
                  } me-2`}
                ></i>
                Submit
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default CategoryForm;
