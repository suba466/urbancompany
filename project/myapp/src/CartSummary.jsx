// CartSummary.js
import { useState, useEffect } from 'react';
import { Container, Button, Badge, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BiLeftArrowAlt } from 'react-icons/bi';
import { FaShoppingCart } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import { useCart, useAuth } from './hooks';  // USE REDUX HOOKS
import { getAssetPath } from './config';

function CartSummary() {
  const navigate = useNavigate();
  const { items: cartItems, clearCart } = useCart();  // GET CART FROM REDUX
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleContinueShopping = () => {
    navigate('/salon');
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    navigate('/cart');
  };

  // Clear cart after order is placed (listen for storage event)
  useEffect(() => {
    const handleOrderPlaced = () => {
      clearCart();
    };

    // Listen for custom event when order is placed
    window.addEventListener('orderPlaced', handleOrderPlaced);

    // Also check localStorage for order completion
    const checkOrderCompletion = () => {
      const orderCompleted = localStorage.getItem('orderCompleted');
      if (orderCompleted === 'true') {
        clearCart();
        localStorage.removeItem('orderCompleted');
      }
    };

    checkOrderCompletion();

    return () => {
      window.removeEventListener('orderPlaced', handleOrderPlaced);
    };
  }, [clearCart]);

  // Group items by category
  const groupedItems = cartItems.reduce((groups, item) => {
    const category = item.category || 'Salon for women';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  // Get category image directly
  const getCategoryImage = (category) => {
    const categoryImages = {
      'Salon for women': getAssetPath("/assets/salon.webp"),
      'AC & Appliance Repair': getAssetPath("/assets/ac.webp"),
      'Cleaning': getAssetPath("/assets/clean.webp"),
      'Electrician, Plumber & Carpenters': getAssetPath("/assets/electric.webp"),
      'Native Water Purifier': getAssetPath("/assets/native.webp")
    };

    return categoryImages[category] || getAssetPath("/assets/placeholder.png");
  };

  // Calculate total price for a specific category
  const calculateCategoryTotal = (items) => {
    return items.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const count = item.count || 1;
      return total + (price * count);
    }, 0);
  };

  // Calculate overall total
  const calculateOverallTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const count = item.count || 1;
      return total + (price * count);
    }, 0);
  };

  // Format price
  const formatPrice = (amount) => `₹${amount.toLocaleString("en-IN")}`;

  const totalPrice = calculateOverallTotal();

  return (
    <Container className="py-4 min-vh-100 mx-auto" style={{ width: "100%", maxWidth: "600px" }}>
      <Button
        variant="link"
        className="p-0 text-dark me-3"
        onClick={handleContinueShopping}
      >
        <BiLeftArrowAlt size={28} />
      </Button>

      <div className="mt-5 mb-4">
        <h3 className="fw-bold mb-0">
          <span>
            <FaShoppingCart style={{ color: "#4433caff" }} />
          </span> Your Cart
        </h3>
      </div>

      {cartItems.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <div className="mb-4">
              <i className="bi bi-cart-x" style={{ fontSize: "64px", color: "#ddd" }}></i>
            </div>
            <h4 className="fw-bold text-muted mb-3">Your cart is empty</h4>
            <p className="text-muted mb-4">Add some services to get started</p>
            <Button
              variant="primary"
              onClick={handleContinueShopping}
              size="lg"
            >
              Continue Shopping
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Cart Items */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-0">
              {Object.entries(groupedItems).map(([category, items], catIndex) => {
                const categoryTotal = calculateCategoryTotal(items);

                return (
                  <div key={catIndex} className="border-bottom">
                    <div className="p-3">
                      {/* First Row: Image + Category Name + Badge + Total Amount */}
                      <Row className="align-items-center mb-2">
                        {/* First Column: Image */}
                        <Col xs={1} style={{ width: "70px" }}>
                          <img
                            src={getCategoryImage(category)}
                            alt={category}
                            style={{
                              width: "50px",
                              height: "60px",
                              borderRadius: "8px",
                              objectFit: "cover",
                              border: "1px solid #f0f0f0"
                            }}
                            onError={(e) => {
                              console.error(`Failed to load image for ${category}:`, e.target.src);
                              e.target.src = getAssetPath("/assets/placeholder.png");
                            }}
                          />
                        </Col>

                        {/* Second Column: Category name + Badge + Total */}
                        <Col xs={10} style={{ marginTop: "20px" }}>
                          <Row className="align-items-center">
                            <Col xs={8} sm={9}>
                              <h5 className="fw-bold text-dark mb-0">
                                {category}
                              </h5>
                              <div>
                                <p style={{ color: "#5c5c5cff", fontSize: "14px" }}>
                                  {items.length} service{items.length > 1 ? 's' : ''} <span style={{ fontSize: "14px" }}>
                                    <GoDotFill />{formatPrice(categoryTotal)}
                                  </span>
                                </p>
                              </div>
                            </Col>
                          </Row>
                        </Col>
                      </Row>

                      {/* Second Row: Services list */}
                      <div className="mt-2 ms-5 ps-1">
                        {items.map((item, index) => (
                          <div key={index} className="mb-2">
                            <Row className="align-items-center">
                              <Col xs={8} sm={9}>
                                <div className="d-flex align-items-center">
                                  <GoDotFill style={{
                                    fontSize: "10px",
                                    marginRight: "8px",
                                    color: "#6c757d",
                                    flexShrink: 0
                                  }} />
                                  <span className="text-muted" style={{ fontSize: "13px" }}>
                                    {item.title || "Service"}
                                  </span>
                                  {item.count > 1 && (
                                    <Badge bg="transparent" text="dark" className="ms-2">
                                      ×{item.count}
                                    </Badge>
                                  )}
                                </div>
                              </Col>
                            </Row>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </Card.Body>
          </Card>

          {/* Total Price Display */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-3">
              <Row className="align-items-center">
                <Col>
                  <h5 className="fw-bold mb-0">Total Amount</h5>
                </Col>
                <Col className="text-end">
                  <h5 className="fw-bold mb-0" style={{ color: "#4433caff" }}>
                    {formatPrice(totalPrice)}
                  </h5>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Action Buttons */}
          <div className="d-flex gap-2 gap-md-3 flex-wrap">
            <Button
              className="flex-grow-1 py-3 edit"
              style={{ height: "50px" }}
              onClick={handleContinueShopping}
            >
              Add services
            </Button>
            <Button
              className="flex-grow-1 py-3 fw-bold butn"
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
            >
              Checkout
            </Button>
          </div>
        </>
      )}
    </Container>
  );
}

export default CartSummary;