import { Container, Button, Row, Col, Card, Modal, Spinner, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function PaymentPage() {
  const [paymentImages, setPaymentImages] = useState({
    upi: "",
    card: "",
    net: ""
  });
  const [selectedMethod, setSelectedMethod] = useState("");
  const [amountToPay, setAmountToPay] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChecked, setIsChecked] = useState(false); // ✅ ADDED: Checkbox state
  
  const location = useLocation();

  // Get amount from URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const amountParam = searchParams.get('amount');
    
    if (amountParam) {
      const amount = parseFloat(amountParam);
      setAmountToPay(amount);
    } else {
      // Fallback: Try to get from sessionStorage
      const storedOrder = sessionStorage.getItem('currentOrder');
      if (storedOrder) {
        try {
          const orderData = JSON.parse(storedOrder);
          setAmountToPay(orderData.total || 0);
        } catch (error) {
          console.error("Error parsing stored order:", error);
        }
      }
    }
  }, [location]);

  // Fetch payment images from backend
  useEffect(() => {
    const fetchPaymentImages = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/static-data");
        
        if (response.ok) {
          const data = await response.json();
          
          const images = {
            upi: data.upi ? `http://localhost:5000${data.upi}` : "http://localhost:5000/assets/upi.webp",
            card: data.card ? `http://localhost:5000${data.card}` : "http://localhost:5000/assets/card.webp",
            net: data.net ? `http://localhost:5000${data.net}` : "http://localhost:5000/assets/net.webp"
          };
          
          setPaymentImages(images);
          setImagesLoaded(true);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching payment images:", error);
        const fallbackImages = {
          upi: "http://localhost:5000/assets/upi.webp",
          card: "http://localhost:5000/assets/card.webp", 
          net: "http://localhost:5000/assets/net.webp"
        };
        setPaymentImages(fallbackImages);
        setImagesLoaded(true);
      }
    };

    fetchPaymentImages();
  }, []);

  const handlePaymentSelect = (method) => {
    setSelectedMethod(method);
    setShowPaymentModal(true);
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setIsProcessing(false);
    setIsChecked(false); // ✅ Reset checkbox when modal closes
  };

  // ✅ ADDED: Checkbox change handler
  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };

 const processPayment = async () => {
  setIsProcessing(true);
  
  try {
    // Get order data from sessionStorage
    const storedOrder = sessionStorage.getItem('currentOrder');
    let orderData = {};
    
    if (storedOrder) {
      orderData = JSON.parse(storedOrder);
    }

    // Get user info from AuthContext or localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    console.log(" Original user phone:", userInfo.phone);
    
    //  FIXED: Extract phone number and ensure consistency
    let userPhone = userInfo.phone || "9787081119";
    
    // Normalize phone number to 10 digits for database storage
    if (userPhone.startsWith('+91') && userPhone.length === 13) {
      userPhone = userPhone.slice(3); // +914569823455 → 4569823455
    } else if (userPhone.startsWith('91') && userPhone.length === 12) {
      userPhone = userPhone.slice(2); // 914569823455 → 4569823455
    }
    
    console.log("✅ Final phone to store:", userPhone);
    
    // Create booking in database with CONSISTENT phone format
    const bookingData = {
      userId: userInfo.userId || "user_" + Date.now(),
      userPhone: userPhone, // ✅ Now always 10 digits
      userName: userInfo.name || "Customer",
      serviceName: orderData.items ? orderData.items.map(item => item.title).join(', ') : "Beauty Services",
      servicePrice: amountToPay.toString(),
      originalPrice: orderData.itemTotal ? orderData.itemTotal.toString() : amountToPay.toString(),
      address: orderData.address || { mainText: "Selected Address" },
      scheduledDate: orderData.scheduledDate || new Date().toISOString(),
      scheduledTime: orderData.scheduledTime || "10:00 AM",
      items: orderData.items || [],
      slotExtraCharge: orderData.slotExtraCharge || 0,
      tipAmount: orderData.tipAmount || 0,
      taxAmount: orderData.taxAmount || 0,
      paymentMethod: selectedMethod,
      status: "Confirmed",
      bookingDate: new Date() // ✅ ADD THIS: Explicit booking date
    };

    console.log("📱 Creating booking with data:", {
      phone: bookingData.userPhone,
      service: bookingData.serviceName,
      amount: bookingData.servicePrice
    });

    const response = await fetch("http://localhost:5000/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Booking creation failed:", errorText);
      throw new Error("Failed to create booking");
    }

    const result = await response.json();
    console.log("✅ Booking created successfully:", result.booking._id);
    
    // ✅ FIX: Clear cart from database after successful payment
    await clearCartFromDatabase();
    
    // Simulate payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      handleCloseModal();
      
      // Show success alert with booking ID
      alert(`🎉 Order placed successfully!\n\nBooking ID: ${result.booking._id}\nAmount: ₹${amountToPay}\nPayment Method: ${selectedMethod.toUpperCase()}`);
      
      // Clear stored order data
      sessionStorage.removeItem('currentOrder');
      
      // Redirect to main page (home page)
      window.location.href = "/";
      
    }, 2000);

  } catch (error) {
    console.error("❌ Error processing payment:", error);
    setIsProcessing(false);
    alert(`Payment failed: ${error.message}`);
  }
};

  // ✅ ADD: Function to clear cart from database
  const clearCartFromDatabase = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/carts");
      if (response.ok) {
        const data = await response.json();
        const cartItems = data.carts || [];
        
        // Delete all cart items one by one
        for (const item of cartItems) {
          await fetch(`http://localhost:5000/api/carts/${item._id}`, {
            method: "DELETE"
          });
        }
        console.log("Cart cleared successfully after payment");
      }
    } catch (error) {
      console.error("Error clearing cart after payment:", error);
    }
  };

  const formatPrice = (amount) => {
    if (!amount || amount <= 0) return "₹0";
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const handleImageError = (imageType, e) => {
    const fallbackSrc = `http://localhost:5000/assets/${imageType}.webp`;
    e.target.src = fallbackSrc;
  };

  // Render payment method specific content in modal
  const renderPaymentModalContent = () => {
    switch (selectedMethod) {
      case 'upi':
        return (
          <div>
            <Form.Label><h4 className="fw-semibold">Add new UPI</h4></Form.Label>
            <Form.Control 
              className="text-muted" 
              style={{fontSize:"12px"}}
              type="text"
              id="inputPassword5" 
              value="12345678@upi"
              aria-describedby="passwordHelpBlock"
              readOnly
            />
            <div className="mt-3">
              <Form.Check 
                type="checkbox"
                id="save-upi-checkbox"
                label="Save my UPI ID securely"
                checked={isChecked}
                onChange={handleCheckboxChange} // FIXED: Added onChange handler
                style={{ fontSize: "14px", fontWeight: "500" }}
              />
            </div>
          </div>
        );
      
      case 'card':
        return (
          <div>
        <h4 className="fw-bold mb-3">Add new card</h4>
            <Form>
              <div className="mb-3">
                <Form.Control 
                  type="text" 
                  placeholder="Card number"
                />
              </div>
              <Row>
                <Col md={6}>
                  <Form.Control 
                    type="text" 
                    placeholder="MM/YY"
                    maxLength="5"
                  />
                </Col>
                <Col md={6}>
                  <Form.Control 
                    type="text" 
                    placeholder="CVV"
                  />
                </Col>
              </Row>
              <div className="mt-3">
                <Form.Check 
                  type="checkbox"
                  id="save-card-checkbox"
                  label="Save this card for future payments"
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                  style={{ fontSize: "14px", fontWeight: "500" }}
                />
              </div>
            </Form>
          </div>
        );
      
      case 'net':
        return (
          <div>
            <h5 className="fw-bold mb-3">Net Banking</h5>
            <div className="mb-3">
              <Form.Label>Select Bank</Form.Label>
              <Form.Select>
                <option>Select your bank</option>
                <option>State Bank of India</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
                <option>Punjab National Bank</option>
                <option>Bank of Baroda</option>
              </Form.Select>
            </div>
            <p className="text-muted small">
              You will be redirected to your bank's secure portal for payment
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={{ backgroundColor: "#ececec", minHeight: "100vh" }}>
      {/* No Navbar - Simple Header */}
     
      <Container className="py-4 fluid" style={{ backgroundColor: "white", borderRadius: "8px" }}>
        <Row>
          <Col xs={2} style={{width:"30px"}}>
            <button 
              onClick={() => window.history.back()}
              style={{ 
                border: "none", 
                backgroundColor: "transparent", 
                fontSize: "18px",
                cursor: "pointer"
              }}
            >
              ← 
            </button>
          </Col>
          <Col>
            <h5 className="fw-bold mb-4">Select payment method</h5>
          </Col>
        </Row>
        <p className="text-muted" style={{ marginTop: "-22px", fontSize: "13px",marginLeft:"30px" }}>
          Amount to pay: <span className="fw-bold">{formatPrice(amountToPay)}</span>
        </p>
        <hr />

        {/* UPI Option */}
        <Card 
          className={`mb-3 border-0 ${selectedMethod === 'upi' ? 'border-primary' : ''}`}
          style={{ 
            cursor: "pointer",
            border: selectedMethod === 'upi' ? '2px solid #007bff' : '1px solid #dee2e6',
            transition: 'all 0.2s ease'
          }}
          onClick={() => handlePaymentSelect('upi')}
        >
          <Card.Body className="py-3">
            <Row className="align-items-center">
              <Col xs={6}>
                <h5 className="fw-semibold text-start m-0">UPI</h5>
              </Col>
              <Col xs={4} className="text-end">
                <span
                  style={{
                    color: "#227d1a",
                    backgroundColor: "#e7ede6",
                    padding: "4px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}
                >
                  MOST POPULAR
                </span>
              </Col>
            </Row>
            <Row>
              <Col xs={2} style={{width:"70px"}}>
                <div className="border rounded" style={{ 
                  width: "40px", 
                  height: "40px", 
                  border:"1px solid #c3c3c3ff"
                }}>
                  {paymentImages.upi && (
                    <img 
                      src={paymentImages.upi} 
                      alt="UPI" 
                      style={{ 
                        width: "100%", 
                        height: "100%", 
                        objectFit: "contain" 
                      }}
                      onError={(e) => handleImageError('upi', e)}
                    />
                  )} 
                </div>
              </Col>
              <Col>
                <p style={{marginTop:"10px", fontSize:"14px"}}>Add a new UPI ID</p>
              </Col>
            </Row>
          </Card.Body>
        </Card> 
        <hr />

        {/* Card Option */}
        <Card 
          className={`mb-3 border-0 ${selectedMethod === 'card' ? 'border-primary' : ''}`}
          style={{ 
            cursor: "pointer",
            border: selectedMethod === 'card' ? '2px solid #007bff' : '1px solid #dee2e6',
            transition: 'all 0.2s ease'
          }}
          onClick={() => handlePaymentSelect('card')}
        >
          <Card.Body className="py-3">
            <Row className="align-items-center">
              <Col xs={10}>
                <h5 className="fw-semibold text-start m-0">Cards</h5>
              </Col>
            </Row>
            <Row>
              <Col xs={2} style={{width:"70px"}}>
                <div className="border rounded" style={{ 
                  width: "40px", 
                  height: "40px", 
                  border:"1px solid #c3c3c3ff"
                }}>
                  {paymentImages.card && (
                    <img 
                      src={paymentImages.card} 
                      alt="Cards" 
                      style={{ 
                        width: "100%", 
                        height: "100%", 
                        objectFit: "contain" 
                      }}
                      onError={(e) => handleImageError('card', e)}
                    />
                  )} 
                </div>
              </Col>
              <Col>
                <p style={{marginTop:"10px", fontSize:"14px"}}>Add new card</p>
              </Col>
            </Row>
          </Card.Body>
        </Card> 
        <hr />

        {/* Net Banking Option */}
        <Card 
          className={`mb-4 border-0 ${selectedMethod === 'net' ? 'border-primary' : ''}`}
          style={{ 
            cursor: "pointer",
            border: selectedMethod === 'net' ? '2px solid #007bff' : '1px solid #dee2e6',
            transition: 'all 0.2s ease'
          }}
          onClick={() => handlePaymentSelect('net')}
        >
          <Card.Body className="py-3">
            <Row className="align-items-center">
              <Col xs={10}>
                <h5 className="fw-semibold text-start m-0">Net Banking</h5>
              </Col>
            </Row>
            <Row>
              <Col xs={2} style={{width:"70px"}}>
                <div className="border rounded" style={{ 
                  width: "40px", 
                  height: "40px", 
                  border:"1px solid #c3c3c3ff"
                }}>
                  {paymentImages.net && (
                    <img 
                      src={paymentImages.net} 
                      alt="Net Banking" 
                      style={{ 
                        width: "100%", 
                        height: "100%", 
                        objectFit: "contain" 
                      }}
                      onError={(e) => handleImageError('net', e)}
                    />
                  )} 
                </div>
              </Col>
              <Col>
                <p style={{marginTop:"10px", fontSize:"14px"}}>Netbanking</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Security Note */}
        <div className="text-center mt-3">
          <p className="text-muted small">
            <i className="bi bi-shield-check me-1"></i>
            Your payment is secure and encrypted
          </p>
        </div>
      </Container>

      {/* Payment Method Modal */}
      <Modal show={showPaymentModal} onHide={handleCloseModal} centered>
        <Button 
          type="button" 
          onClick={handleCloseModal} 
          className="position-absolute border-0 justify-content-center closebtn p-0" 
          style={{ top: '10px', right: '10px', zIndex: 1 }}
        >
          X
        </Button>
        <Modal.Body>
          {renderPaymentModalContent()}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            className="butn fw-bold w-100" 
            onClick={processPayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              `Proceed to pay`
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PaymentPage;