import { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';

const SubcategoryForm = ({
  categories,
  subcategoryData = null,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    categoryId: '',
    isActive: true
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (subcategoryData) {
      setFormData({
        name: subcategoryData.name || '',
        key: subcategoryData.key || '',
        categoryId: subcategoryData.categoryId || '',
        isActive:
          subcategoryData.isActive !== undefined
            ? subcategoryData.isActive
            : true
      });

      if (subcategoryData.img) {
        setImagePreview(`http://localhost:5000${subcategoryData.img}`);
      }
    }
  }, [subcategoryData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.categoryId)
      newErrors.categoryId = 'Parent category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    } catch (error) {
      setFormError(
        error.message || 'Failed to save subcategory. Please try again.'
      );
    }
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      key: name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^a-z0-9-]/g, '')
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('File size should be less than 5MB');
      return;
    }

    setImageFile(file);
    setFormError('');

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    document.getElementById('imageUpload').click();
  };

  // 🔍 Filter categories
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="border-0 shadow-lg">
      <Card.Body style={{ marginLeft: '25px', marginRight: '25px' }}>
        <h5 className="fw-semibold mb-1">
          {subcategoryData ? 'Edit Subcategory' : 'New Subcategory'}
        </h5>
        <p className="text-muted" style={{ fontSize: '12px' }}>
          {subcategoryData
            ? 'Use below form to edit subcategory'
            : 'Use below form to create a new subcategory'}
        </p>

        {formSuccess && (
          <Alert
            variant="success"
            style={{ height: '50px' }}
            onClose={() => setFormSuccess(false)}
            dismissible
          >
            <p className="mb-0">
              {subcategoryData
                ? 'Subcategory updated successfully'
                : 'Subcategory added successfully'}
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
              <Form.Select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                isInvalid={!!errors.categoryId}
                className="cate"
              >
                <option value="">Select Category</option>
                {filteredCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name} {!cat.isActive && '(Inactive)'}
                  </option>
                ))}
              </Form.Select>

              <Form.Control.Feedback type="invalid">
                {errors.categoryId}
              </Form.Control.Feedback>
            </Col>

            <Col md={6}>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                isInvalid={!!errors.name}
                placeholder="Subcategory name"
                className="cate"
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Label className="fw-semibold">
                Subcategory Image
              </Form.Label>

              <div
                className="d-flex align-items-center"
                style={{
                  border: '2px dashed #000',
                  borderRadius: '5px',
                  backgroundColor: '#f8f9fa',
                  height: '100px',
                  cursor: 'pointer'
                }}
                onClick={triggerFileInput}
              >
                <div style={{ width: '100px', textAlign: 'center' }}>
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  ) : (
                    <i className="bi bi-image fs-1 text-muted"></i>
                  )}
                </div>

                <div className="flex-grow-1 text-center">
                  <p className="mb-1 fw-semibold">
                    {imagePreview
                      ? 'Click to change image'
                      : 'Click to upload image'}
                  </p>
                  <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                    JPG, PNG up to 5MB
                  </p>
                </div>
              </div>

              <Form.Control
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="d-none"
              />
            </Col>
          </Row>

          <div className="d-flex justify-content-center gap-3 mt-4">
            <Button variant="outline-dark" onClick={onCancel} className="cat">
              Cancel
            </Button>
            <Button variant="dark" type="submit" className="cat">
              Submit
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SubcategoryForm;
