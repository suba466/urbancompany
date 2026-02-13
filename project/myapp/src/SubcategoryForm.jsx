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
  const [touchedFields, setTouchedFields] = useState({});
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

  // Field-by-field validation
  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };
    
    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Subcategory name is required';
        } else {
          delete newErrors.name;
        }
        break;
        
      case 'categoryId':
        if (!value) {
          newErrors.categoryId = 'Parent category is required';
        } else {
          delete newErrors.categoryId;
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

  const handleNameChange = (e) => {
    const name = e.target.value;
    const key = name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    const updatedFormData = {
      ...formData,
      name,
      key
    };
    
    setFormData(updatedFormData);
    
    // Auto-validate if name was touched before
    if (touchedFields.name) {
      validateField('name', name);
    }
    if (touchedFields.key) {
      validateField('key', key);
    }
  };

  const validateForm = () => {
    // Mark all required fields as touched
    const allTouched = {};
    ['name', 'categoryId', 'key'].forEach(field => {
      allTouched[field] = true;
    });
    setTouchedFields(allTouched);
    
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Subcategory name is required';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Parent category is required';
    }
    
    if (!formData.key.trim()) {
      newErrors.key = 'Key is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.key)) {
      newErrors.key = 'Key can only contain lowercase letters, numbers, and hyphens';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      await onSubmit(formData, imageFile);
      setFormSuccess(true);

      // Reset form if not editing
      if (!subcategoryData) {
        resetForm();
      }

      setTimeout(() => {
        setFormSuccess(false);
      }, 5000);
    } catch (error) {
      setFormError(
        error.message || 'Failed to save subcategory. Please try again.'
      );
    }
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

  const resetForm = () => {
    setFormData({
      name: '',
      key: '',
      categoryId: '',
      isActive: true
    });
    setImageFile(null);
    setImagePreview('');
    setErrors({});
    setTouchedFields({});
    setSearchTerm('');
  };

  // Auto-generate key when name changes
  useEffect(() => {
    if (formData.name && !formData.key && !subcategoryData) {
      const generatedKey = formData.name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({ ...prev, key: generatedKey }));
    }
  }, [formData.name, subcategoryData]);

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

        <Form onSubmit={handleSubmit} noValidate>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                
                <Form.Select
                  value={formData.categoryId}
                  onChange={(e) => handleFieldChange('categoryId', e.target.value)}
                  onBlur={() => handleFieldBlur('categoryId')}
                  isInvalid={touchedFields.categoryId && !!errors.categoryId}
                  className={`cate ${touchedFields.categoryId && errors.categoryId ? 'is-invalid' : ''}`}
                  required
                >
                  <option value="">Select Category</option>
                  {filteredCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name} {!cat.isActive && '(Inactive)'}
                    </option>
                  ))}
                </Form.Select>
                {touchedFields.categoryId && errors.categoryId && (
                  <Form.Control.Feedback type="invalid">
                    {errors.categoryId}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  onBlur={() => handleFieldBlur('name')}
                  isInvalid={touchedFields.name && !!errors.name}
                  placeholder="Subcategory name"
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
          </Row>
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2">
                  Subcategory Image
                </Form.Label>

                <div
                  className="d-flex align-items-center"
                  style={{
                    border: `2px ${imagePreview ? 'solid' : 'dashed'} #000`,
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
                
                {!imagePreview && !subcategoryData && (
                  <small className="text-dark d-block mt-1">
                    Subcategory image is recommended
                  </small>
                )}
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-center gap-3 mt-4">
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
              <i className={`bi ${subcategoryData ? 'bi-pencil' : 'bi-plus-circle'} me-2`}></i>
              {subcategoryData ? 'Update' : 'Submit'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SubcategoryForm;