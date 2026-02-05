import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import API_URL from './config';

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
  const [touchedFields, setTouchedFields] = useState({});

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
        setPreviewUrl(`${API_URL}${categoryData.img}`);
      }
    }
  }, [isEditing, categoryData]);

  // Field-by-field validation
  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Category name is required';
        } else {
          delete newErrors.name;
        }
        break;

      case 'description':
        if (!value.trim()) {
          newErrors.description = 'Description is required';
        } else {
          delete newErrors.description;
        }
        break;

      case 'key':
        if (!value.trim()) {
          newErrors.key = 'Key is required';
        } else if (!/^[a-z0-9-]+$/.test(value)) {
          newErrors.key = 'Key can only contain lowercase letters, numbers, and hyphens';
        } else {
          delete newErrors.key;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData({ ...formData, [fieldName]: value });

    // Auto-validate if field was touched before
    if (touchedFields[fieldName]) {
      validateField(fieldName, value);
    }
  };

  const handleFieldBlur = (fieldName) => {
    setTouchedFields({ ...touchedFields, [fieldName]: true });
    validateField(fieldName, formData[fieldName]);
  };

  const validateForm = () => {
    // Mark all fields as touched
    const allTouched = {};
    ['name', 'description', 'key'].forEach(field => {
      allTouched[field] = true;
    });
    setTouchedFields(allTouched);

    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.key.trim()) {
      newErrors.key = 'Key is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.key)) {
      newErrors.key = 'Key can only contain lowercase letters, numbers, and hyphens';
    }

    // Auto-generate key from name if key is empty
    if (!formData.key.trim() && formData.name.trim()) {
      const generatedKey = formData.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({ ...prev, key: generatedKey }));
      delete newErrors.key; // Remove key error since we generated it
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

    if (!validateForm()) {
      setFormError("Please fix the errors in the form");
      return;
    }

    try {
      // Auto-generate key from name if empty
      let finalFormData = { ...formData };
      if (!finalFormData.key.trim() && finalFormData.name.trim()) {
        const generatedKey = finalFormData.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
        finalFormData.key = generatedKey;
      }

      await onSubmit(finalFormData, imageFile);
      setFormSuccess(true);

      // Reset form if not editing
      if (!isEditing) {
        resetForm();
      }

      setTimeout(() => {
        setFormSuccess(false);
      }, 5000);
    } catch (err) {
      setFormError(err.message || 'Failed to save category');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      key: '',
      order: 0,
      isActive: true
    });
    setImageFile(null);
    setPreviewUrl('');
    setErrors({});
    setTouchedFields({});
  };

  const triggerFileInput = () => {
    document.getElementById('categoryImageUpload').click();
  };

  // Auto-generate key when name changes
  useEffect(() => {
    if (formData.name && !formData.key && !isEditing) {
      const generatedKey = formData.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({ ...prev, key: generatedKey }));
    }
  }, [formData.name, isEditing]);

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

          <Form onSubmit={handleSubmit} noValidate>
            <Row className="mb-2">
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Control
                    type="text"
                    placeholder="Category name"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    onBlur={() => handleFieldBlur('name')}
                    isInvalid={touchedFields.name && !!errors.name}
                    className={`cate ${touchedFields.name && errors.name ? 'is-invalid' : ''}`}
                    required
                  />
                  {touchedFields.name && errors.name && (
                    <Form.Control.Feedback type="invalid">
                      {errors.name}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Control
                    type="text"
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    onBlur={() => handleFieldBlur('description')}
                    isInvalid={touchedFields.description && !!errors.description}
                    className={`cate ${touchedFields.description && errors.description ? 'is-invalid' : ''}`}
                    required
                  />
                  {touchedFields.description && errors.description && (
                    <Form.Control.Feedback type="invalid">
                      {errors.description}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    Category Image
                  </Form.Label>

                  <div
                    className="text-center"
                    style={{
                      border: `2px ${previewUrl ? 'solid' : 'dashed'} #000`,
                      borderRadius: '5px',
                      height: '100px',
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

                  {!previewUrl && !isEditing && (
                    <small className="text-danger d-block mt-1">
                      Category image is recommended
                    </small>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-center gap-3">
              <Button
                variant="outline-dark"
                onClick={() => {
                  resetForm();
                  onCancel();
                }}
                className="cat"
                type="button"
              >
                Cancel
              </Button>

              <Button variant="dark" type="submit" className="cat">
                <i
                  className={`bi ${isEditing ? 'bi-pencil' : 'bi-plus-circle'
                    } me-2`}
                ></i>
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