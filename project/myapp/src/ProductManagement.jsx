import React, { useState, useEffect } from 'react';
import {
  Card, Table, Form, Button, Alert,
  Badge, Row, Col, InputGroup, Modal, Spinner
} from 'react-bootstrap';
import { MdModeEdit, MdOutlineDelete } from "react-icons/md";
import { IoEyeSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import TableControls from './TableControls';
import {
  getTableElement,
  getCSVHeadersFromData,
  exportAsPDF,
  exportAsExcel,
  exportAsCSV
} from './downloadUtils';

function ProductManagement({ isAdding }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAllProducts, setSelectAllProducts] = useState(false);
  const [showFormView, setShowFormView] = useState(isAdding || false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  // Modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Pagination state
  const [productPage, setProductPage] = useState(1);
  const [productPerPage, setProductPerPage] = useState(10);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [productTotalItems, setProductTotalItems] = useState(0);

  const [newProduct, setNewProduct] = useState({
    name: '',
    title: '',
    category: '',
    subcategory: '',
    price: '',
    rating: '',
    duration: '',
    isActive: true,
    items: [{ name: '', description: '' }],
    img: ''
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [imageFile, setImageFile] = useState(null);

  const getAuthToken = () => {
    return localStorage.getItem('adminToken');
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const getAuthHeadersMultipart = () => {
    const token = getAuthToken();
    return {
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchProducts = async (page = 1, search = '', perPage = productPerPage) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString(),
        ...(search && { search })
      }).toString();

      const response = await fetch(`${window.API_URL}/api/admin/packages?${params}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.packages || []);
        setProductTotalItems(data.total || data.packages?.length || 0);
        setProductTotalPages(data.totalPages || 1);
        setProductPage(data.currentPage || page);
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
      const response = await fetch(`${window.API_URL}/api/admin/categories`, {
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
      const response = await fetch(`${window.API_URL}/api/admin/subcategories`, {
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
      const response = await fetch(`${window.API_URL}/api/admin/packages/${productId}`, {
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
    fetchCategories();
    fetchSubcategories();

    if (isAdding) {
      setShowFormView(true);
      setIsEditing(false);
      setEditingProductId(null);
      resetForm();
    } else {
      setShowFormView(false);
      fetchProducts();
    }
  }, [isAdding]);

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

  const validateForm = () => {
    const errors = {};
    if (!newProduct.name.trim()) errors.name = 'Product name is required';
    if (!newProduct.category) errors.category = 'Category is required';
    if (!newProduct.price) errors.price = 'Price is required';
    if (!newProduct.duration) errors.duration = 'Duration is required';
    return errors;
  };

  const handleImageUpload = async (productId) => {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch(`${window.API_URL}/api/admin/packages/${productId}/upload-image`, {
        method: 'POST',
        headers: getAuthHeadersMultipart(),
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        return data.imageUrl;
      }
      return null;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    const touched = {};
    Object.keys(newProduct).forEach(key => {
      touched[key] = true;
    });
    setTouchedFields(touched);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setLoading(true);

    try {
      const productData = {
        ...newProduct,
        title: newProduct.title || newProduct.subcategory || newProduct.name,
        subcategory: newProduct.subcategory || null,
        price: newProduct.price.toString(),
        rating: newProduct.rating || "4.5",
        isActive: true
      };

      if (isEditing && editingProductId) {
        // Update existing product
        const response = await fetch(`${window.API_URL}/api/admin/packages/${editingProductId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(productData)
        });

        const data = await response.json();
        if (data.success) {
          // Upload image if selected
          if (imageFile) {
            const imageUrl = await handleImageUpload(editingProductId);
            if (imageUrl) {
              // Update product with image URL
              await fetch(`${window.API_URL}/api/admin/packages/${editingProductId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ ...productData, img: imageUrl })
              });
            }
          }

          setFormSuccess(true);
          setTimeout(() => {
            setFormSuccess(false);
            resetForm();
            setIsEditing(false);
            setEditingProductId(null);
            setShowFormView(false);
            fetchProducts();
          }, 1500);
        } else {
          alert(data.error || 'Failed to update product');
        }
      } else {
        // Create new product
        const response = await fetch(`${window.API_URL}/api/admin/packages`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(productData)
        });

        const data = await response.json();
        if (data.success && data.package?._id) {
          // Upload image if selected
          if (imageFile) {
            const imageUrl = await handleImageUpload(data.package._id);
            if (imageUrl) {
              // Update product with image URL
              await fetch(`${window.API_URL}/api/admin/packages/${data.package._id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ img: imageUrl })
              });
            }
          }

          setFormSuccess(true);
          setTimeout(() => {
            setFormSuccess(false);
            resetForm();
            setShowFormView(false);
            fetchProducts();
          }, 1500);
        } else {
          alert(data.error || 'Failed to add product');
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewProduct({
      name: '',
      title: '',
      category: '',
      subcategory: '',
      price: '',
      rating: '',
      duration: '',
      isActive: true,
      items: [{ name: '', description: '' }],
      img: ''
    });
    setImageFile(null);
    setFilteredSubcategories([]);
    setFormErrors({});
    setTouchedFields({});
    setIsEditing(false);
    setEditingProductId(null);
  };

  const handleCancel = () => {
    resetForm();
    if (isAdding) {
      navigate(-1);
    } else {
      setShowFormView(false);
    }
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
      title: newProduct.title || subcategory
    });
  };

  const handleInputChange = (field, value) => {
    setNewProduct({ ...newProduct, [field]: value });
    if (!touchedFields[field]) {
      setTouchedFields({ ...touchedFields, [field]: true });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
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

  // Function to get initials from product name
  const getInitials = (name) => {
    if (!name || typeof name !== 'string' || name.trim() === '') return 'NA';

    const nameParts = name.trim().split(' ').filter(part => part.length > 0);

    if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }

    return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
  };

  // View Product Details
  const handleViewProduct = async (productId) => {
    try {
      const product = await fetchProductById(productId);
      if (product) {
        setSelectedProduct(product);
        setShowViewModal(true);
      } else {
        alert('Failed to load product details');
      }
    } catch (error) {
      console.error('Error loading product for view:', error);
      alert('Failed to load product details');
    }
  };

  const handleEditProduct = async (productId) => {
    try {
      const product = await fetchProductById(productId);
      if (product) {
        const formattedProduct = {
          name: product.name || '',
          title: product.title || product.subcategory || product.name || '',
          category: product.category || '',
          subcategory: product.subcategory || '',
          price: product.price || '',
          rating: product.rating || '',
          duration: product.duration || '',
          isActive: product.isActive !== undefined ? product.isActive : true,
          items: product.items && product.items.length > 0
            ? product.items.map(item => ({
              name: item.name || '',
              description: item.description || ''
            }))
            : [{ name: '', description: '' }],
          img: product.img || ''
        };

        setNewProduct(formattedProduct);
        setIsEditing(true);
        setEditingProductId(productId);
        setShowFormView(true);

        window.scrollTo(0, 0);
      } else {
        alert('Failed to load product data');
      }
    } catch (error) {
      console.error('Error loading product for edit:', error);
      alert('Failed to load product data');
    }
  };

  // Toggle Product Status
  const toggleProductStatus = async (productId, currentStatus) => {
    const newStatus = !currentStatus;

    try {
      const response = await fetch(`${window.API_URL}/api/admin/packages/${productId}/toggle-status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isActive: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        setProducts(prevProducts =>
          prevProducts.map(product =>
            product._id === productId
              ? { ...product, isActive: newStatus }
              : product
          )
        );
      } else {
        console.error('Failed to toggle status:', data.error);
        setProducts(prevProducts =>
          prevProducts.map(product =>
            product._id === productId
              ? { ...product, isActive: currentStatus }
              : product
          )
        );
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product._id === productId
            ? { ...product, isActive: currentStatus }
            : product
        )
      );
    }
  };

  const deleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`${window.API_URL}/api/admin/packages/${productId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (response.ok) {
          alert('Product deleted successfully');
          fetchProducts(productPage, productSearch, productPerPage);
        } else {
          alert('Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const handleBulkDeleteClick = async () => {
    if (selectedProducts.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)?`)) {
      try {
        const response = await fetch(`${window.API_URL}/api/admin/bulk-delete`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            entity: 'packages',
            ids: selectedProducts
          })
        });

        const data = await response.json();
        if (data.success) {
          alert(`Successfully deleted ${selectedProducts.length} product(s)`);
          setSelectedProducts([]);
          setSelectAllProducts(false);
          fetchProducts(productPage, productSearch, productPerPage);
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

  // Prepare product data for export
  const prepareProductDataForExport = () => {
    return products.map(product => ({
      'Product Name': product.name || '',
      'Title': product.title || '',
      'Category': product.category || '',
      'Subcategory': product.subcategory || '',
      'Price': `₹${product.price || '0'}`,
      'Duration': product.duration || '',
      'Status': product.isActive ? 'Active' : 'Inactive',
      'Rating': product.rating || '',
      'Image URL': product.img ? `${window.API_URL}${product.img}` : '',
      'Items Count': product.items?.length || 0
    }));
  };

  // Export functions using downloadUtils
  const handleExportPDF = () => {
    const tableElement = getTableElement();
    if (tableElement) {
      exportAsPDF(tableElement, 'products');
    } else {
      // Fallback: Create a temporary element
      const exportData = prepareProductDataForExport();
      if (exportData.length > 0) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = `
          <h2>Products Report</h2>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
          <p>Total: ${productTotalItems} products</p>
          <table border="1">
            <thead>
              <tr>
                ${Object.keys(exportData[0]).map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${exportData.map(row => `
                <tr>
                  ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        document.body.appendChild(tempDiv);
        exportAsPDF(tempDiv, 'products');
        document.body.removeChild(tempDiv);
      } else {
        alert('No data available to export');
      }
    }
  };

  const handleExportExcel = () => {
    const exportData = prepareProductDataForExport();
    if (exportData.length > 0) {
      exportAsExcel(exportData, 'products');
    } else {
      alert('No data available to export');
    }
  };

  const handleExportCSV = () => {
    const exportData = prepareProductDataForExport();
    if (exportData.length > 0) {
      const headers = getCSVHeadersFromData(exportData);
      exportAsCSV(exportData, headers, 'products');
    } else {
      alert('No data available to export');
    }
  };

  const ViewProductModal = () => (
    <Modal
      show={showViewModal}
      onHide={() => setShowViewModal(false)}
      centered
      size="md"
    >
      <Modal.Body
        className="p-4"
        tabIndex={0}
        style={{
          maxHeight: '500px',
          overflowY: 'auto'
        }}
      >
        {/* Modal Title */}
        <div className="mb-4">
          <h5 className="fw-bold mb-1">Product Details</h5>
        </div>

        {selectedProduct && (
          <>
            {/* Centered Image & Title */}
            <div className="text-center mb-4">
              <div className="mb-3">
                {selectedProduct.img ? (
                  <img
                    src={`${window.API_URL}${selectedProduct.img}`}
                    alt={selectedProduct.name}
                    style={{
                      width: '150px',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      border: '3px solid #dee2e6'
                    }}
                  />
                ) : (
                  " "
                )}
              </div> <h5 className="fw-bold mb-2">{selectedProduct.name}</h5>
            </div>

            {/* Categories */}
            <div className="mb-3">
              <div className="text-muted small mb-1">Category</div>
              <div className="d-flex flex-wrap gap-2">
                <Badge bg="dark">{selectedProduct.category}</Badge>
                {selectedProduct.subcategory && (
                  <Badge bg="danger">{selectedProduct.subcategory}</Badge>
                )}
              </div>
            </div>

            {/* Price  */}
            <div className="mb-3">
              <div className="text-muted small mb-1">Pricing</div>
              <div className="row g-3">
                <div className="col-6">
                  <div className="fw-semibold">₹{selectedProduct.price || '0'}</div>
                  <div className="text-muted" style={{ fontSize: '12px' }}>Selling Price</div>
                </div>

                
              </div>
            </div>

            {/* Duration & Rating */}
            <div className="row g-3 mb-3">
              <div className="col-6">
                <div className="text-muted small">Duration</div>
                <div className="fw-bold">{selectedProduct.duration || '—'}</div>
              </div>
              {selectedProduct.rating && (
                <div className="col-6">
                  <div className="text-muted small">Rating</div>
                  <div className="fw-bold d-flex align-items-center">
                    <i className="bi bi-star-fill text-warning me-1"></i>
                    {selectedProduct.rating}
                  </div>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="mb-3">
              <div className="text-muted small mb-2">Status</div>
              <div className="d-flex align-items-center">
                <Badge bg={selectedProduct.isActive ? 'success' : 'danger'} className="me-2">
                  {selectedProduct.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Form.Check
                  type="switch"
                  id="status-switch"
                  checked={selectedProduct.isActive}
                  onChange={(e) => {
                    toggleProductStatus(selectedProduct._id, selectedProduct.isActive);
                    setSelectedProduct({
                      ...selectedProduct,
                      isActive: e.target.checked
                    });
                  }}
                  label={selectedProduct.isActive ? 'Enabled' : 'Disabled'}
                />
              </div>
            </div>

            {/* Service Items */}
            {selectedProduct.items && selectedProduct.items.length > 0 && (
              <div className="mb-3">
                <div className="text-muted small mb-2">Service Items ({selectedProduct.items.length})</div>
                <div className="border rounded p-3">
                  {selectedProduct.items.map((item, index) => (
                    <div key={index} className={index < selectedProduct.items.length - 1 ? "mb-2" : ""}>
                      <div className="fw-medium">• {item.name}</div>
                      {item.description && (
                        <div className="text-muted small ms-3 mt-1">{item.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image URL */}
            {selectedProduct.img && (
              <div className="mt-3">
                <div className="text-muted small mb-1">Image URL</div>
                <div className="bg-light p-2 rounded">
                  <small className="text-break d-block" style={{ fontSize: '11px' }}>
                    {`${window.API_URL}${selectedProduct.img}`}
                  </small>
                </div>
              </div>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0">
        <Button
          variant="secondary"
          onClick={() => setShowViewModal(false)}
          style={{ borderRadius: "50px" }}
        >
          Close
        </Button>
        <Button
          variant="dark"
          onClick={() => {
            setShowViewModal(false);
            handleEditProduct(selectedProduct._id);
          }}
          style={{ borderRadius: "50px" }}
        >
          Edit
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Show Form View
  if (showFormView) {
    const formTitle = isEditing ? 'Edit Product' : 'Add New Product';

    return (
      <div className="p-3">
        {/* Card 1: Product Management Header */}
        <Card className="shadow-lg mb-4">
          <Card.Body style={{ marginLeft: "23px", marginRight: "10px" }}>
            <h5 className="mb-0 fw-semibold">
              Product Management
              <span className="text-muted mx-2" style={{ fontSize: "14px", fontWeight: "normal" }}>•</span>
              <span className="text-muted" style={{ fontSize: "14px", fontWeight: "normal" }}>{formTitle}</span>
            </h5>
          </Card.Body>
        </Card>

        {/* Card 2: Product Details Form */}
        <Card className="shadow-lg">
          <Card.Body style={{ marginLeft: "23px", marginRight: "10px" }}>
            {formSuccess && (
              <Alert variant="success" className="mb-4">
                <i className="bi bi-check-circle-fill me-2"></i>
                {isEditing ? 'Product updated successfully!' : 'Product added successfully!'}
                <div className="mt-2">
                  <small>The form has been reset. You can add another product.</small>
                </div>
              </Alert>
            )}

            <div className='mb-4'>
              <h5>{formTitle}</h5>
              <p className='text-muted' style={{ fontSize: "12px" }}>
                {isEditing ? 'Update the product details' : 'Use the below form to create a new product'}
              </p>
            </div>

            <Form onSubmit={handleAddProduct} noValidate>
              {/* Category Selection */}
              <div>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Select
                        value={newProduct.category}
                        className={`cate ${touchedFields.category && formErrors.category ? 'is-invalid' : ''}`}
                        onChange={handleCategoryChange}
                        isInvalid={touchedFields.category && !!formErrors.category}
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
                      <Form.Select
                        value={newProduct.subcategory}
                        className={`cate`}
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
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* Product Details */}
              <div>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Control
                        type="text"
                        className={`cate py-3 ${touchedFields.name && formErrors.name ? 'is-invalid' : ''}`}
                        value={newProduct.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        isInvalid={touchedFields.name && !!formErrors.name}
                        placeholder="Enter package name"
                      />
                      {formErrors.name && (
                        <Form.Control.Feedback type="invalid">
                          {formErrors.name}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Control
                        type="text"
                        className={`cate ${touchedFields.duration && formErrors.duration ? 'is-invalid' : ''}`}
                        value={newProduct.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        isInvalid={touchedFields.duration && !!formErrors.duration}
                        placeholder="Duration"
                      />
                      {formErrors.duration && (
                        <Form.Control.Feedback type="invalid">
                          {formErrors.duration}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <InputGroup className={`cate ${touchedFields.price && formErrors.price ? 'is-invalid' : ''}`}>
                        <InputGroup.Text>₹</InputGroup.Text>
                        <Form.Control className='border-0'
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                          isInvalid={touchedFields.price && !!formErrors.price}
                          placeholder="Enter the selling price"
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
                 
               
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Control
                        type="text"
                        className="cate"
                        value={newProduct.rating}
                        onChange={(e) => handleInputChange('rating', e.target.value)}
                        placeholder="Reviews"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <div className="mb-4">
                      <Form.Group>
                        <div className="position-relative">
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="cate"
                          />
                          <div>
                            {imageFile ? (
                              <span className="text-truncate d-block" title={imageFile.name}>
                                {imageFile.name}
                              </span>
                            ) : newProduct.img ? (
                              <span className="text-truncate d-block" title={newProduct.img.split('/').pop()}>
                                {newProduct.img.split('/').pop()}
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                        <Form.Text className="text-muted small mt-1">
                          {imageFile ? (
                            <span>
                              Selected: <strong>{imageFile.name}</strong> ({Math.round(imageFile.size / 1024)} KB)
                            </span>
                          ) : newProduct.img ? (
                            <span>
                              Current: <strong>{newProduct.img.split('/').pop()}</strong>
                            </span>
                          ) : (
                            'Upload a product image (JPEG, PNG, etc.)'
                          )}
                        </Form.Text>
                      </Form.Group>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Service Items */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0 fw-semibold">Service Items</h6>
                  <Button variant="outline-primary" size="sm" onClick={addItem}>
                    <i className="bi bi-plus-circle me-2"></i>Add Item
                  </Button>
                </div>
                {newProduct.items.map((item, index) => (
                  <Row key={index} className="mb-3 align-items-center">
                    <Col md={5}>
                      <Form.Control
                        type="text"
                        className="cate"
                        value={item.name}
                        onChange={(e) => handleItemsChange(index, 'name', e.target.value)}
                        placeholder="Service item name"
                      />
                    </Col>
                    <Col md={5}>
                      <Form.Control
                        type="text"
                        className="cate"
                        value={item.description}
                        onChange={(e) => handleItemsChange(index, 'description', e.target.value)}
                        placeholder="Description"
                      />
                    </Col>
                    <Col md={2}>
                      {newProduct.items.length > 1 && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeItem(index)}
                          title="Remove item"
                        >
                          <MdOutlineDelete />
                        </Button>
                      )}
                    </Col>
                  </Row>
                ))}
              </div>

              {/* Submit Buttons */}
              <div className="d-flex justify-content-center gap-3 mt-4">
                <Button
                  variant="outline-dark"
                  type="button"
                  onClick={handleCancel}
                  style={{ minWidth: '100px', borderRadius: "50px" }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="dark"
                  type="submit"
                  style={{ minWidth: '100px', borderRadius: "50px" }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {isEditing ? 'Updating...' : 'Submitting...'}
                    </>
                  ) : (
                    'Submit'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Table View
  return (
    <div className="p-3">
      {/* Card 1: Product Management Header */}
      <Card className="shadow-lg">
        <Card.Body style={{ marginLeft: "23px", marginRight: "10px" }}>
          <h5 className="mb-0 fw-semibold">
            Product Management
            <span className="text-muted mx-2" style={{ fontSize: "14px", fontWeight: "normal" }}>•</span>
            <span className="text-muted" style={{ fontSize: "14px", fontWeight: "normal" }}>Manage Products</span>
          </h5>
        </Card.Body>
      </Card>
      <br />

      {/* Card 2: Products Table with Controls */}
      <Card className="shadow-lg">
        <Card.Header className="border-0" style={{ backgroundColor: "white" }}>
          <Row style={{ marginLeft: "12px", marginRight: "10px" }}>
            <Col style={{ marginTop: "10px" }}>
              <h5 className="mb-1 fw-semibold">Manage Products</h5>
              <p className='text-muted' style={{ fontSize: "10.5px" }}>View and manage all your products</p>
            </Col>
            <Col>
              <TableControls
                itemsPerPage={productPerPage}
                onItemsPerPageChange={(perPage) => {
                  setProductPerPage(perPage);
                  fetchProducts(1, productSearch, perPage);
                }}
                currentPage={productPage}
                totalPages={productTotalPages}
                totalItems={productTotalItems}
                onPageChange={(page) => {
                  setProductPage(page);
                  fetchProducts(page, productSearch, productPerPage);
                }}
                searchValue={productSearch}
                onSearchChange={(e) => {
                  setProductSearch(e.target.value);
                  fetchProducts(1, e.target.value, productPerPage);
                }}
                searchPlaceholder="Search products..."
                onDownloadPDF={handleExportPDF}
                onDownloadExcel={handleExportExcel}
                onDownloadCSV={handleExportCSV}
                selectedCount={selectedProducts.length}
                onBulkDelete={handleBulkDeleteClick}
                showBulkActions={false}
                bulkEntityName="products"
              />
            </Col>
          </Row>
        </Card.Header>

        <Card.Body style={{ marginLeft: "25px", marginRight: "25px" }}>
          {/* Bulk Selection Alert */}
          {selectedProducts.length > 0 && (
            <Alert variant="dark" className="d-flex justify-content-between align-items-center mb-3">
              <span>
                <i className="bi bi-check-circle-fill me-2"></i>
                {selectedProducts.length} product(s) selected
              </span>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDeleteClick}
              >
                <i className="bi bi-trash me-2"></i>Delete Selected
              </Button>
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3 text-muted">Loading products...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover style={{ border: "2px solid #000000" }}>
                <thead>
                  <tr>
                    <th>
                      <Form.Check
                        type="checkbox"
                        className='check'
                        checked={selectAllProducts}
                        onChange={handleSelectAllProducts}
                      />
                    </th>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Subcategory</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5">
                        <div className="text-muted">
                          <i className="bi bi-box-seam display-4 mb-3"></i>
                          <p className="mb-0">No products found</p>
                          <small>Click "Add Product" to create your first product</small>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product._id}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            className='check'
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => handleProductSelect(product._id)}
                          />
                        </td>
                        <td>
                          <div style={{
                            width: '150px',
                            height: '90px',
                            overflow: 'hidden',
                            border: '1px solid #dee2e6',
                            borderRadius: '8px',
                            position: 'relative'
                          }}>
                            {product.img ? (
                              <img
                                src={`${window.API_URL}${product.img}`}
                                alt={product.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                                <span className="text-muted">No Image</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong className="d-block">{product.name || 'Unnamed'}</strong>
                          </div>
                        </td>
                        <td>
                          {product.category || 'Uncategorized'}
                        </td>
                        <td>
                          {product.subcategory ? (
                            <p className="mb-0">{product.subcategory}</p>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <div>
                            <strong className="d-block">₹{product.price || '0'}</strong>
                            
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Form.Check
                              type="switch"
                              id={`status-switch-${product._id}`}
                              checked={product.isActive}
                              onChange={() => toggleProductStatus(product._id, product.isActive)}
                              label={
                                <span>
                                  {product.isActive !== false ? 'Enabled' : 'Disabled'}
                                </span>
                              }
                            />
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="warning"
                              size="sm"
                              title="Edit"
                              onClick={() => handleEditProduct(product._id)}
                            >
                              <MdModeEdit />
                            </Button>
                            <Button
                              variant="dark"
                              size="sm"
                              title="View Details"
                              onClick={() => handleViewProduct(product._id)}
                            >
                              <IoEyeSharp />
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              title="Delete"
                              onClick={() => deleteProduct(product._id)}
                            >
                              <MdOutlineDelete />
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

      {/* View Product Modal */}
      <ViewProductModal />
    </div>
  );
}

export default ProductManagement;
