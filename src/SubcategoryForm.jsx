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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle key change separately
  const handleKeyChange = (e) => {
    const key = e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({
      ...prev,
      key: key
    }));
  };

  // Handle order change
  const handleOrderChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setFormData(prev => ({
      ...prev,
      order: value
    }));
  };

  // Trigger file input click
  const triggerFileInput = () => {
    document.getElementById('imageUpload').click();
  };

  return (
    <Card className="border-0 shadow-lg">
      <Card.Body style={{marginLeft:"25px",marginRight:"25px"}}>
        <h5 className="fw-semibold mb-1">
          {subcategoryData ? 'Edit Subcategory' : 'New Subcategory'}
        </h5>
        <p className='text-muted' style={{fontSize:"12px"}}>
          {subcategoryData ? 'Use below form to edit subcategory' : 'Use below form to create a new subcategory'}
        </p>
        
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  isInvalid={!!errors.name}
                  placeholder="Subcategory name" 
                  className='cate'
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  isInvalid={!!errors.categoryId} 
                  className='cate'
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
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  rows={1}  
                  className='cate py-3'
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description"
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold mb-3 d-block text-center">
                  Subcategory Image
                </Form.Label>
                <div className="d-flex justify-content-center">
                  <div style={{ 
                    width: '100%',
                    maxWidth: '400px'
                  }}>
                    {/* Make the entire dashed box clickable */}
                    <div 
                      style={{ 
                        border: "2px dashed #000000",
                        borderRadius: "12px",
                        backgroundColor: "#f8f9fa",
                        marginBottom: "15px",
                        overflow: 'hidden',
                        cursor: 'pointer'  // Add cursor pointer to entire box
                      }}
                      onClick={triggerFileInput}  // Make entire box clickable
                    >
                      {imagePreview ? (
                        <div className="text-center p-3">
                          <img 
                            src={imagePreview} 
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
                          <p 
                            className="text-muted mb-0" 
                            style={{ fontSize: '12px', cursor: 'pointer' }}
                          >
                            Click to change image
                          </p>
                        </div>
                      ) : (
                        <div 
                          className="d-flex flex-column align-items-center justify-content-center p-4"
                          style={{ 
                            minHeight: '180px'
                          }}
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
                    </div>
                    
                    <Form.Control
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="d-none"
                    />
                    
                    {imageFile && (
                      <p className="text-muted text-center mb-0" style={{ fontSize: '12px' }}>
                        Selected: {imageFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-center gap-3">
            <Button variant="outline-dark" onClick={onCancel}
             className='cat'>
              Cancel
            </Button>
            <Button variant="dark"  type="submit"  className='cat'>
              Submit
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SubcategoryForm;