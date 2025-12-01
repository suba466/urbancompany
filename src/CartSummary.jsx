import React, { useState, useEffect } from 'react';
import { Container, Button, Row, Col, Badge, Spinner, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { BiLeftArrowAlt } from 'react-icons/bi';
import { FaShoppingCart } from "react-icons/fa";

function CartSummary() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart } = useCart();
  const [salonData, setSalonData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch salon for women data to get the actual image
  useEffect(() => {
    const fetchSalonData = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/salonforwomen");
        if (!response.ok) {
          throw new Error('Failed to fetch salon for women data');
        }
        const data = await response.json();
        setSalonData(data.salonforwomen || []);
      } catch (error) {
        console.error("Error fetching salon data: ", error);
        // Fallback to static data
        try {
          const staticResponse = await fetch("http://localhost:5000/api/static-data");
          const staticData = await staticResponse.json();
          setSalonData(staticData.salonforwomen || []);
        } catch (staticError) {
          console.error("Error fetching static data:", staticError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSalonData();
  }, []);

  const handleContinueShopping = () => {
    navigate('/salon'); 
  };

  const handleCheckout = () => {
    navigate('/cart'); // Navigate to full cart page
  };

  // Group items by category/salon type
  const groupedItems = cartItems.reduce((groups, item) => {
    const category = item.category || 'Salon for women';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  // Get the actual salon image from fetched data
  const getSalonImage = () => {
    if (salonData && salonData.length > 0) {
      // Try to get the "Super saver packages" image first (the first item in your array)
      const superSaverPackage = salonData.find(item => item.name === "Super saver packages");
      if (superSaverPackage && superSaverPackage.img) {
        return superSaverPackage.img.startsWith("http") 
          ? superSaverPackage.img 
          : `http://localhost:5000${superSaverPackage.img}`;
      }
      
      // Fallback to the first salon item's image
      const firstSalon = salonData[0];
      if (firstSalon.img) {
        return firstSalon.img.startsWith("http") 
          ? firstSalon.img 
          : `http://localhost:5000${firstSalon.img}`;
      }
    }
    
    // Default fallback image
    return "http://localhost:5000/assets/super.webp";
  };

  return (
    <Container className="py-4 min-vh-100">
      <Button 
        variant="link" 
        className="p-0 text-dark me-3"
        onClick={handleContinueShopping}
      >
        <BiLeftArrowAlt size={28} />
      </Button>
      
      {/* Header with Back Button */}
      <div className="mt-5 mb-4">
        <h3 className="fw-bold mb-0">
          <span>
            <FaShoppingCart style={{color:"#4433caff"}} /> 
          </span> Your Cart
        </h3>
      </div>

      {/* Cart Content */}
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
              {Object.entries(groupedItems).map(([category, items], catIndex) => (
                <div key={catIndex} className="border-bottom">
                  <div className="p-3 pb-2">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center">
                        {/* Show icon for Salon for women */}
                        {category === 'Salon for women' ? (
                          <div className="me-2">
                            {loading ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <img
                                src={getSalonImage()}
                                alt="Salon for women"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "8px",
                                  objectFit: "cover"
                                }}
                                onError={(e) => {
                                  e.target.src = "http://localhost:5000/assets/placeholder.png";
                                }}
                              />
                            )}
                          </div>
                        ) : null}
                        <h5 className="fw-bold text-dark mb-0">
                          {category}
                        </h5>
                      </div>
                      <Badge bg="light" text="dark">
                        {items.length} service{items.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    {items.map((item, index) => (
                      <div key={index} className="mb-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-1">
                              <h6 className="mb-0 fw-semibold">{item.title || "Service"}</h6>
                              {item.count > 1 && (
                                <Badge bg="light" text="dark" className="ms-2">
                                  ×{item.count}
                                </Badge>
                              )}
                            </div>
                            
                            {item.description && (
                              <p className="text-muted small mb-1">{item.description}</p>
                            )}
                            
                            {item.content && item.content.length > 0 && (
                              <div className="mt-2">
                                <div className="d-flex align-items-center mb-1">
                                  <span className="text-muted small">Make your own package</span>
                                  <Badge bg="light" text="dark" className="ms-2 small">
                                    ×1
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>

          {/* Action Buttons */}
          <div className="d-flex gap-3">
            <Button 
              variant="outline-secondary" 
              className="flex-grow-1 py-3"
              onClick={handleContinueShopping}
            >
              Add services
            </Button>
            <Button 
              variant="primary" 
              className="flex-grow-1 py-3 fw-bold"
              onClick={handleCheckout}
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