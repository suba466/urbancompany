import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Form, Button, Alert, 
  Badge, Dropdown, Row, Col, Modal 
} from 'react-bootstrap';

function ProductManagement({ isAdding }) {
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAllProducts, setSelectAllProducts] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(isAdding || false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    discountPrice: '',
    stock: 0,
    isActive: true
  });

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
    try {
      const response = await fetch('http://localhost:5000/api/admin/packages', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.packages || []);
        setSelectedProducts([]);
        setSelectAllProducts(false);
      } else {
        // Fallback to mock data
        const mockProducts = [
          { _id: '1', name: 'Hair Shampoo', description: 'Premium hair care shampoo', category: 'Salon', price: '₹299', discountPrice: '₹249', stock: 50, isActive: true },
          { _id: '2', name: 'Cleaning Solution', description: 'Multi-surface cleaner', category: 'Cleaning', price: '₹199', discountPrice: '₹149', stock: 100, isActive: true },
          { _id: '3', name: 'Tool Kit', description: 'Professional repair tools', category: 'Repair', price: '₹1299', discountPrice: '₹999', stock: 20, isActive: true }
        ];
        setProducts(mockProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    if (!isAdding) {
      fetchProducts();
    }
  }, [isAdding]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/admin/packages', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newProduct)
      });
      
      if (response.ok) {
        alert('Product added successfully!');
        setShowAddProductModal(false);
        setNewProduct({
          name: '',
          description: '',
          category: '',
          price: '',
          discountPrice: '',
          stock: 0,
          isActive: true
        });
        fetchProducts();
      } else {
        alert('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
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

  if (isAdding || showAddProductModal) {
    return (
      <Modal show={true} onHide={() => setShowAddProductModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddProduct}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    required
                    placeholder="Enter product name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Salon">Salon</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Repair">Repair</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrician">Electrician</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                placeholder="Enter product description"
              />
            </Form.Group>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    required
                    placeholder="Enter price"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Discount Price (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    value={newProduct.discountPrice}
                    onChange={(e) => setNewProduct({...newProduct, discountPrice: e.target.value})}
                    placeholder="Enter discount price"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock Quantity *</Form.Label>
                  <Form.Control
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                    required
                    placeholder="Enter stock quantity"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active Product"
                checked={newProduct.isActive}
                onChange={(e) => setNewProduct({...newProduct, isActive: e.target.checked})}
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setShowAddProductModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Add Product
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <Card.Header className="border-0 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">Manage Products</h5>
          <p className="text-muted mb-0">View and manage all products</p>
        </div>
        <div className="d-flex gap-2">
          <Form.Control
            type="search"
            placeholder="Search products..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            style={{ width: '250px' }}
          />
          <Button 
            variant="primary"
            onClick={() => setShowAddProductModal(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>Add New Product
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {selectedProducts.length > 0 && (
          <Alert variant="info" className="d-flex justify-content-between align-items-center">
            <span>{selectedProducts.length} product(s) selected</span>
            <Button 
              variant="danger" 
              size="sm"
              onClick={() => handleBulkDelete(selectedProducts)}
            >
              <i className="bi bi-trash me-2"></i>Delete Selected
            </Button>
          </Alert>
        )}
        
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
                <th style={{ width: '80px' }}>Image</th>
                <th>Product</th>
                <th>Category</th>
                <th style={{ width: '120px' }}>Price</th>
                <th style={{ width: '80px' }}>Stock</th>
                <th style={{ width: '100px' }}>Status</th>
                <th style={{ width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => handleProductSelect(product._id)}
                    />
                  </td>
                  <td>
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      overflow: 'hidden',
                      border: '1px solid #dee2e6'
                    }}>
                      {product.img ? (
                        <img 
                          src={`http://localhost:5000${product.img}`} 
                          alt={product.name}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div className="bg-light w-100 h-100 d-flex align-items-center justify-content-center">
                          <i className="bi bi-box" style={{ fontSize: '24px', color: '#6c757d' }}></i>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong>{product.name || product.title}</strong>
                      <small className="text-muted d-block">{product.description?.substring(0, 50)}...</small>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>
                    <div>
                      <strong>{product.price}</strong>
                      {product.discountPrice && (
                        <small className="text-muted text-decoration-line-through d-block">{product.discountPrice}</small>
                      )}
                    </div>
                  </td>
                  <td>{product.stock || 'N/A'}</td>
                  <td>
                    <Badge bg={product.isActive ? 'success' : 'secondary'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    <Dropdown>
                      <Dropdown.Toggle variant="light" size="sm">
                        <i className="bi bi-three-dots"></i>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item>
                          <i className="bi bi-eye me-2"></i>View Details
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item className="text-danger" onClick={() => deleteProduct(product._id)}>
                          <i className="bi bi-trash me-2"></i>Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ProductManagement;