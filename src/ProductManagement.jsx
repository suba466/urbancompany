import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Form, Button, Alert, 
  Badge, Row, Col, InputGroup, Container 
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function ProductManagement({ isAdding }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAllProducts, setSelectAllProducts] = useState(false);
  const [showFormView, setShowFormView] = useState(isAdding || false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    title: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    originalPrice: '',
    discountPrice: '',
    rating: '4.5',
    bookings: '100+',
    duration: '',
    stock: 0,
    isActive: true,
    items: [{ name: '', description: '' }],
    content: [{ title: '', description: '' }]
  });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/packages', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.packages || []);
      } else {
        console.error('Error fetching products:', data.error);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/categories', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/subcategories', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setSubcategories(data.subcategories || []);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchProductById = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/packages/${productId}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success && data.package) {
        return data.package;
      }
      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log("Component mounted, isAdding:", isAdding);
    
    // Always fetch categories and subcategories (needed for both views)
    fetchCategories();
    fetchSubcategories();
    
    // If isAdding is true, show form view for adding new product
    if (isAdding) {
      setShowFormView(true);
      setIsEditing(false);
      setEditingProductId(null);
      resetForm();
    } else {
      // If isAdding is false, show table view and fetch products
      setShowFormView(false);
      fetchProducts();
    }
  }, [isAdding]);

  // Reset view when isAdding prop changes
  useEffect(() => {
    if (isAdding) {
      setShowFormView(true);
      setIsEditing(false);
      setEditingProductId(null);
      resetForm();
    } else {
      setShowFormView(false);
    }
  }, [isAdding]);

  // Filter subcategories based on selected category
  useEffect(() => {
    if (newProduct.category && subcategories.length > 0) {
      const filtered = subcategories.filter(sub => 
        sub.categoryName === newProduct.category
      );
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [newProduct.category, subcategories]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setFormErrors({});
    
    // Simple validation
    const errors = {};
    if (!newProduct.name.trim()) errors.name = 'Product name is required';
    if (!newProduct.category) errors.category = 'Category is required';
    if (!newProduct.price) errors.price = 'Price is required';
    if (!newProduct.duration) errors.duration = 'Duration is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      // Prepare product data
      const productData = {
        ...newProduct,
        title: newProduct.title || newProduct.subcategory || newProduct.name,
        subcategory: newProduct.subcategory || null,
        price: newProduct.price.toString(),
        originalPrice: newProduct.originalPrice || newProduct.price.toString(),
        discountPrice: newProduct.discountPrice || '',
        rating: newProduct.rating || "4.5",
        bookings: newProduct.bookings || "100+",
        stock: parseInt(newProduct.stock) || 0,
        isActive: newProduct.isActive !== undefined ? newProduct.isActive : true
      };
      
      console.log("Sending product data:", productData);
      
      if (isEditing && editingProductId) {
        // Update existing product
        const response = await fetch(`http://localhost:5000/api/admin/packages/${editingProductId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(productData)
        });
        
        const data = await response.json();
        if (data.success) {
          setFormSuccess(true);
          setTimeout(() => {
            setFormSuccess(false);
            resetForm();
            setIsEditing(false);
            setEditingProductId(null);
            // Go back to previous page (admin dashboard or wherever you came from)
            navigate(-1);
            alert('Product updated successfully!');
          }, 1000);
        } else {
          alert(data.error || 'Failed to update product');
        }
      } else {
        // Create new product
        const response = await fetch('http://localhost:5000/api/admin/packages', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(productData)
        });
        
        const data = await response.json();
        if (data.success) {
          setFormSuccess(true);
          setTimeout(() => {
            setFormSuccess(false);
            resetForm();
            // After successful add, go back to previous page
            navigate(-1);
            alert('Product added successfully!');
          }, 1000);
        } else {
          alert(data.error || 'Failed to add product');
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product: ' + error.message);
    }
  };

  const resetForm = () => {
    setNewProduct({
      name: '',
      title: '',
      description: '',
      category: '',
      subcategory: '',
      price: '',
      originalPrice: '',
      discountPrice: '',
      rating: '4.5',
      bookings: '100+',
      duration: '',
      stock: 0,
      isActive: true,
      items: [{ name: '', description: '' }],
      content: [{ title: '', description: '' }]
    });
    setFilteredSubcategories([]);
    setFormErrors({});
    setIsEditing(false);
    setEditingProductId(null);
  };

  const handleCancel = () => {
    resetForm();
    // Go back to the previous page (admin dashboard)
    navigate(-1);
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setNewProduct({ 
      ...newProduct, 
      category: category,
      subcategory: ''
    });
  };

  const handleSubcategoryChange = (e) => {
    const subcategory = e.target.value;
    setNewProduct({ 
      ...newProduct, 
      subcategory: subcategory,
      // Auto-fill title with subcategory name if title is empty
      title: newProduct.title || subcategory
    });
  };

  const handleItemsChange = (index, field, value) => {
    const updatedItems = [...newProduct.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setNewProduct({ ...newProduct, items: updatedItems });
  };

  const addItem = () => {
    setNewProduct({
      ...newProduct,
      items: [...newProduct.items, { name: '', description: '' }]
    });
  };

  const removeItem = (index) => {
    if (newProduct.items.length > 1) {
      const updatedItems = [...newProduct.items];
      updatedItems.splice(index, 1);
      setNewProduct({ ...newProduct, items: updatedItems });
    }
  };

  const handleContentChange = (index, field, value) => {
    const updatedContent = [...newProduct.content];
    updatedContent[index] = { ...updatedContent[index], [field]: value };
    setNewProduct({ ...newProduct, content: updatedContent });
  };

  const addContent = () => {
    setNewProduct({
      ...newProduct,
      content: [...newProduct.content, { title: '', description: '' }]
    });
  };

  const removeContent = (index) => {
    if (newProduct.content.length > 1) {
      const updatedContent = [...newProduct.content];
      updatedContent.splice(index, 1);
      setNewProduct({ ...newProduct, content: updatedContent });
    }
  };

  const handleEditProduct = async (productId) => {
    try {
      const product = await fetchProductById(productId);
      if (product) {
        // Format the product data for the form
        const formattedProduct = {
          name: product.name || '',
          title: product.title || product.subcategory || product.name || '',
          description: product.description || '',
          category: product.category || '',
          subcategory: product.subcategory || '',
          price: product.price || '',
          originalPrice: product.originalPrice || product.price || '',
          discountPrice: product.discountPrice || '',
          rating: product.rating || '4.5',
          bookings: product.bookings || '100+',
          duration: product.duration || '',
          stock: product.stock || 0,
          isActive: product.isActive !== undefined ? product.isActive : true,
          items: product.items && product.items.length > 0 
            ? product.items.map(item => ({
                name: item.name || '',
                description: item.description || ''
              }))
            : [{ name: '', description: '' }],
          content: product.content && product.content.length > 0
            ? product.content.map(cont => ({
                title: cont.title || '',
                description: cont.description || ''
              }))
            : [{ title: '', description: '' }]
        };
        
        setNewProduct(formattedProduct);
        setIsEditing(true);
        setEditingProductId(productId);
        setShowFormView(true);
        
        // Scroll to top of form
        window.scrollTo(0, 0);
      } else {
        alert('Failed to load product data');
      }
    } catch (error) {
      console.error('Error loading product for edit:', error);
      alert('Failed to load product data');
    }
  };

  const deleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/packages/${productId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        
        if (response.ok) {
          alert('Product deleted successfully');
          fetchProducts();
        } else {
          alert('Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const handleBulkDelete = async (selectedIds) => {
    if (selectedIds.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} product(s)?`)) {
      try {
        const response = await fetch('http://localhost:5000/api/admin/bulk-delete', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ 
            entity: 'packages',
            ids: selectedIds 
          })
        });
        
        const data = await response.json();
        if (data.success) {
          alert(`Successfully deleted ${selectedIds.length} product(s)`);
          setSelectedProducts([]);
          setSelectAllProducts(false);
          fetchProducts();
        } else {
          alert(data.error || 'Failed to delete products');
        }
      } catch (error) {
        console.error('Error deleting products:', error);
        alert('Failed to delete products');
      }
    }
  };

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAllProducts = () => {
    if (selectAllProducts) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p._id));
    }
    setSelectAllProducts(!selectAllProducts);
  };

  // Show Form View (when adding new product or editing)
  if (showFormView) {
    const formTitle = isEditing ? 'Edit Product' : 'Add New Product';
    const submitButtonText = isEditing ? 'Update Product' : 'Add Product';
    
    return (
      <Container fluid>
        <div className="p-3">
          {/* Title Card */}
          <Card className="shadow-lg mb-4">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="fw-semibold mb-1">{formTitle}</h5>
                  <p className="text-muted mb-0">
                    {isEditing ? 'Update the product details below' : 'Fill in the details to create a new product'}
                  </p>
                </div>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleCancel}
                  >
                    <i className="bi bi-arrow-left me-2"></i>Back
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Form Card */}
          <Card className="shadow-lg mb-4">
            <Card.Body className="p-4">
              {formSuccess && (
                <Alert variant="success" className="mb-4">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {isEditing ? 'Product updated successfully!' : 'Product added successfully!'}
                </Alert>
              )}

              <Form onSubmit={handleAddProduct}>
                {/* Basic Information */}
                <Card className="mb-4 border-0 shadow-sm">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0 fw-semibold">Basic Information</h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Product Name *</Form.Label>
                          <Form.Control
                            type="text"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                            isInvalid={!!formErrors.name}
                            placeholder="Enter product name (e.g., Premium Hair Care)"
                          />
                          {formErrors.name && (
                            <Form.Control.Feedback type="invalid">
                              {formErrors.name}
                            </Form.Control.Feedback>
                          )}
                          <small className="text-muted">This is the actual service package name</small>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Display Title</Form.Label>
                          <Form.Control
                            type="text"
                            value={newProduct.title}
                            onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                            placeholder="Enter display title (will auto-fill with subcategory)"
                          />
                          <small className="text-muted">This will appear as the main heading in frontend</small>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        placeholder="Enter product description"
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>

                {/* Category & Pricing */}
                <Card className="mb-4 border-0 shadow-sm">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0 fw-semibold">Category & Pricing</h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Category *</Form.Label>
                          <Form.Select
                            value={newProduct.category}
                            onChange={handleCategoryChange}
                            isInvalid={!!formErrors.category}
                          >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                              <option key={cat._id} value={cat.name}>
                                {cat.name}
                              </option>
                            ))}
                          </Form.Select>
                          {formErrors.category && (
                            <Form.Control.Feedback type="invalid">
                              {formErrors.category}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Subcategory (Optional)</Form.Label>
                          <Form.Select
                            value={newProduct.subcategory}
                            onChange={handleSubcategoryChange}
                            disabled={!newProduct.category || filteredSubcategories.length === 0}
                          >
                            <option value="">Select Subcategory</option>
                            {!newProduct.category ? (
                              <option value="" disabled>Select a category first</option>
                            ) : filteredSubcategories.length === 0 ? (
                              <option value="" disabled>No subcategories for this category</option>
                            ) : (
                              filteredSubcategories.map((sub) => (
                                <option key={sub._id} value={sub.name}>
                                  {sub.name}
                                </option>
                              ))
                            )}
                          </Form.Select>
                          <small className="text-muted">This helps organize products</small>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Price (₹) *</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>₹</InputGroup.Text>
                            <Form.Control
                              type="number"
                              value={newProduct.price}
                              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                              isInvalid={!!formErrors.price}
                              placeholder="Selling price"
                              min="0"
                              step="0.01"
                            />
                          </InputGroup>
                          {formErrors.price && (
                            <Form.Control.Feedback type="invalid">
                              {formErrors.price}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Original Price (₹)</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>₹</InputGroup.Text>
                            <Form.Control
                              type="number"
                              value={newProduct.originalPrice}
                              onChange={(e) => setNewProduct({...newProduct, originalPrice: e.target.value})}
                              placeholder="Original price"
                              min="0"
                              step="0.01"
                            />
                          </InputGroup>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Discount Price (₹)</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>₹</InputGroup.Text>
                            <Form.Control
                              type="number"
                              value={newProduct.discountPrice}
                              onChange={(e) => setNewProduct({...newProduct, discountPrice: e.target.value})}
                              placeholder="Discount price"
                              min="0"
                              step="0.01"
                            />
                          </InputGroup>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Additional Details */}
                <Card className="mb-4 border-0 shadow-sm">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0 fw-semibold">Additional Details</h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Duration *</Form.Label>
                          <Form.Control
                            type="text"
                            value={newProduct.duration}
                            onChange={(e) => setNewProduct({...newProduct, duration: e.target.value})}
                            isInvalid={!!formErrors.duration}
                            placeholder="e.g., 90 mins"
                          />
                          {formErrors.duration && (
                            <Form.Control.Feedback type="invalid">
                              {formErrors.duration}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Rating</Form.Label>
                          <Form.Control
                            type="number"
                            value={newProduct.rating}
                            onChange={(e) => setNewProduct({...newProduct, rating: e.target.value})}
                            placeholder="4.5"
                            step="0.1"
                            min="0"
                            max="5"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Stock Quantity</Form.Label>
                          <Form.Control
                            type="number"
                            value={newProduct.stock}
                            onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                            placeholder="Enter stock quantity"
                            min="0"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Bookings Display</Form.Label>
                          <Form.Control
                            type="text"
                            value={newProduct.bookings}
                            onChange={(e) => setNewProduct({...newProduct, bookings: e.target.value})}
                            placeholder="e.g., 100+"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Service Items */}
                <Card className="mb-4 border-0 shadow-sm">
                  <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-semibold">Service Items</h6>
                    <Button variant="outline-primary" size="sm" onClick={addItem}>
                      <i className="bi bi-plus-circle me-2"></i>Add Item
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    {newProduct.items.map((item, index) => (
                      <Row key={index} className="mb-3 align-items-center">
                        <Col md={5}>
                          <Form.Control
                            type="text"
                            value={item.name}
                            onChange={(e) => handleItemsChange(index, 'name', e.target.value)}
                            placeholder="Service item name (e.g., Hair Wash)"
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Control
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemsChange(index, 'description', e.target.value)}
                            placeholder="Description (e.g., With premium shampoo)"
                          />
                        </Col>
                        <Col md={1}>
                          {newProduct.items.length > 1 && (
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => removeItem(index)}
                              title="Remove item"
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          )}
                        </Col>
                      </Row>
                    ))}
                    <small className="text-muted">These are the services included in the package</small>
                  </Card.Body>
                </Card>

                {/* Additional Content */}
                <Card className="mb-4 border-0 shadow-sm">
                  <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-semibold">Additional Content (Optional)</h6>
                    <Button variant="outline-secondary" size="sm" onClick={addContent}>
                      <i className="bi bi-plus-circle me-2"></i>Add Content
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    {newProduct.content.map((content, index) => (
                      <Row key={index} className="mb-3 align-items-center">
                        <Col md={5}>
                          <Form.Control
                            type="text"
                            value={content.title}
                            onChange={(e) => handleContentChange(index, 'title', e.target.value)}
                            placeholder="Content title"
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Control
                            type="text"
                            value={content.description}
                            onChange={(e) => handleContentChange(index, 'description', e.target.value)}
                            placeholder="Content description"
                          />
                        </Col>
                        <Col md={1}>
                          {newProduct.content.length > 1 && (
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => removeContent(index)}
                              title="Remove content"
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          )}
                        </Col>
                      </Row>
                    ))}
                    <small className="text-muted">Additional information about the package</small>
                  </Card.Body>
                </Card>

                {/* Status */}
                <Card className="mb-4 border-0 shadow-sm">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0 fw-semibold">Status</h6>
                  </Card.Header>
                  <Card.Body>
                    <Form.Check
                      type="checkbox"
                      label="Active Product"
                      checked={newProduct.isActive}
                      onChange={(e) => setNewProduct({...newProduct, isActive: e.target.checked})}
                    />
                    <small className="text-muted">Active products will be visible to customers</small>
                  </Card.Body>
                </Card>

                {/* Submit Buttons */}
                <div className="d-flex justify-content-center gap-3">
                  <Button 
                    variant="outline-secondary" 
                    type="button"
                    onClick={handleCancel}
                    style={{ minWidth: '150px' }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    style={{ minWidth: '150px' }}
                  >
                    <i className="bi bi-plus-circle me-2"></i>{submitButtonText}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </Container>
    );
  }

  // Table View (Manage Products)
  return (
    <Container fluid>
      <div className="p-3">
        {/* Title Card */}
        <Card className="border-0 shadow-lg mb-4">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-semibold mb-1">Manage Products</h5>
                <p className="text-muted mb-0">View and manage all products</p>
              </div>
              <Button 
                variant="primary"
                onClick={() => {
                  resetForm();
                  setShowFormView(true);
                }}
              >
                <i className="bi bi-plus-circle me-2"></i>Add New Product
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Table Card */}
        <Card className="border-0 shadow-lg mb-4">
          <Card.Header className="border-0 bg-white d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <Form.Control
                type="search"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                style={{ width: '250px' }}
              />
            </div>
          </Card.Header>
          <Card.Body>
            {selectedProducts.length > 0 && (
              <Alert variant="info" className="d-flex justify-content-between align-items-center mb-4">
                <span>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {selectedProducts.length} product(s) selected
                </span>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleBulkDelete(selectedProducts)}
                >
                  <i className="bi bi-trash me-2"></i>Delete Selected
                </Button>
              </Alert>
            )}
            
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading products...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <Form.Check
                          type="checkbox"
                          checked={selectAllProducts}
                          onChange={handleSelectAllProducts}
                        />
                      </th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Subcategory</th>
                      <th style={{ width: '120px' }}>Price</th>
                      <th style={{ width: '80px' }}>Stock</th>
                      <th style={{ width: '100px' }}>Status</th>
                      <th style={{ width: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-5">
                          <div className="text-muted">
                            <i className="bi bi-box-seam display-4 mb-3"></i>
                            <p className="mb-0">No products found</p>
                            <small>Click "Add New Product" to create your first product</small>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      products
                        .filter(product => 
                          productSearch === '' || 
                          (product.name && product.name.toLowerCase().includes(productSearch.toLowerCase())) ||
                          (product.title && product.title.toLowerCase().includes(productSearch.toLowerCase())) ||
                          (product.category && product.category.toLowerCase().includes(productSearch.toLowerCase()))
                        )
                        .map((product) => (
                          <tr key={product._id}>
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={selectedProducts.includes(product._id)}
                                onChange={() => handleProductSelect(product._id)}
                              />
                            </td>
                            <td>
                              <div>
                                <strong className="d-block">{product.name || 'Unnamed'}</strong>
                                <small className="text-muted">
                                  {product.title && (
                                    <span className="d-block">Title: {product.title}</span>
                                  )}
                                  {product.description ? product.description.substring(0, 50) + '...' : 'No description'}
                                </small>
                              </div>
                            </td>
                            <td>
                              <Badge bg="secondary" className="px-3 py-2">
                                {product.category || 'Uncategorized'}
                              </Badge>
                            </td>
                            <td>
                              <div>
                                {product.subcategory ? (
                                  <Badge bg="info" className="px-3 py-2">
                                    {product.subcategory}
                                  </Badge>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div>
                                <strong className="d-block">₹{product.price || '0'}</strong>
                                {product.originalPrice && product.originalPrice !== product.price && (
                                  <small className="text-muted text-decoration-line-through d-block">
                                    ₹{product.originalPrice}
                                  </small>
                                )}
                              </div>
                            </td>
                            <td>
                              <Badge bg={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}>
                                {product.stock || 0}
                              </Badge>
                            </td>
                            <td>
                              <Badge bg={product.isActive ? 'success' : 'secondary'}>
                                {product.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  title="Edit"
                                  onClick={() => handleEditProduct(product._id)}
                                >
                                  <i className="bi bi-pencil"></i>
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  title="Delete"
                                  onClick={() => deleteProduct(product._id)}
                                >
                                  <i className="bi bi-trash"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default ProductManagement;