import React, { useState, useEffect } from "react";
import CartBlock from "./CartBlock";
import Salon1modal from "./Salon1modal";
import { Row, Col, Button, Container, Form } from "react-bootstrap";
import FrequentlyAddedCarousel from "./FrequentlyAddedCarousel";
import { TbCirclePercentageFilled } from "react-icons/tb";
import { MdKeyboardArrowRight } from "react-icons/md";

function CartPage() {
  const [carts, setCarts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [addedImgs, setAddedImgs] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [showCustomTip, setShowCustomTip] = useState(false);
  const [selectedTip, setSelectedTip] = useState(0);
  const [customTip, setCustomTip] = useState("");

  const fetchCarts = () => {
    fetch("http://localhost:5000/api/carts")
      .then(res => res.json())
      .then(data => setCarts(data.carts || []));
  };

  const fetchAddedItems = () => {
    fetch("http://localhost:5000/api/added")
      .then(res => res.json())
      .then(data => setAddedImgs(data.added || []))
      .catch(err => console.error("Failed to load added images:", err));
  };

  useEffect(() => {
    fetchCarts();
    fetchAddedItems();
  }, []);

  const safePrice = (price) =>
    Number((price || "0").toString().replace(/[₹,]/g, ""));

  const formatPrice = (amount) => `₹${amount.toLocaleString("en-IN")}`;

  // Calculate total price from cart items
  const calculateItemTotal = () => {
    return carts.reduce((total, item) => {
      return total + (safePrice(item.price) * (item.count || 1));
    }, 0);
  };

  // Calculate tax (18% GST)
  const calculateTax = () => {
    const itemTotal = calculateItemTotal();
    return Math.round(itemTotal * 0.18); // 18% GST
  };

  // Calculate tip amount
  const calculateTip = () => {
    if (customTip) {
      const tipAmount = safePrice(customTip);
      return tipAmount >= 25 ? tipAmount : 0;
    }
    return selectedTip;
  };

  // Calculate total price (item total + tax + tip)
  const calculateTotalPrice = () => {
    const itemTotal = calculateItemTotal();
    const tax = calculateTax();
    const tip = calculateTip();
    return itemTotal + tax + tip;
  };

  const handleIncrease = async (item) => {
    await fetch(`http://localhost:5000/api/carts/${item._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: item.count + 1 }),
    });
    fetchCarts();
  };

  const handleDecrease = async (item) => {
    if (item.count <= 1) {
      await fetch(`http://localhost:5000/api/carts/${item._id}`, {
        method: "DELETE",
      });
    } else {
      await fetch(`http://localhost:5000/api/carts/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: item.count - 1 }),
      });
    }
    fetchCarts();
  };

  const handleAddToCart = async (item, extraSelected = [], price, discount = 0, action = "add") => {
    try {
      if (action === "add") {
        const cartPayload = {
          productId: item.key || item.name,
          title: item.name,
          price: item.price,
          count: 1,
          content: [{ 
            details: item.name, 
            price: item.price 
          }],
          savedSelections: extraSelected,
          isFrequentlyAdded: true
        };

        const existingItem = carts.find(cart => cart.title === item.name);
        
        if (existingItem) {
          await fetch(`http://localhost:5000/api/carts/${existingItem._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              ...cartPayload, 
              count: existingItem.count + 1 
            })
          });
        } else {
          await fetch("http://localhost:5000/api/addcarts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cartPayload)
          });
        }
      } else if (action === "remove") {
        const existingItem = carts.find(cart => cart.title === item.name);
        if (existingItem) {
          if (existingItem.count > 1) {
            await fetch(`http://localhost:5000/api/carts/${existingItem._id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ count: existingItem.count - 1 })
            });
          } else {
            await fetch(`http://localhost:5000/api/carts/${existingItem._id}`, {
              method: "DELETE"
            });
          }
        }
      }
      fetchCarts();
    } catch (error) {
      console.error("Error handling cart:", error);
    }
  };

  const visibleCarouselItems = addedImgs.filter(img => {
    const inCart = carts.some(c => c.title === img.name);
    return !inCart;
  });

  const openEditModal = (item) => {
    setSelectedPkg(item);
    setShowModal(true);
  };

  const handleExploreServices = () => {
    window.location.href = "/salon";
  };

  // Tip handlers
  const handleTipSelect = (amount) => {
    setSelectedTip(amount);
    setCustomTip("");
    setShowCustomTip(false);
  };

  const handleCustomTipClick = () => {
    setShowCustomTip(true);
    setSelectedTip(0);
    setCustomTip("");
  };

  const handleCustomTipChange = (e) => {
    const value = e.target.value;
    setCustomTip(value);
  };

  const handleCustomTipKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCustomTipSubmit();
    }
  };

  const handleCustomTipSubmit = () => {
    const tipAmount = safePrice(customTip);
    
    if (tipAmount < 25) {
      alert("Minimum tip amount is ₹25");
      return;
    }
    
    setShowCustomTip(false);
  };

  const handleRemoveTip = () => {
    setSelectedTip(0);
    setCustomTip("");
    setShowCustomTip(false);
  };

  // Calculate prices
  const itemTotal = calculateItemTotal();
  const tax = calculateTax();
  const tip = calculateTip();
  const totalPrice = calculateTotalPrice();

  // If cart is empty, show empty state
  if (carts.length === 0) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center" >
        <div className="text-center mt-5">
          <div >
            <img
            src="http://localhost:5000/assets/cart.png"
            alt="cart-placeholder" 
            style={{padding: "10px",width:"33%" }}
          />
          </div>
          
          <h3 className="fw-bold text-muted mb-3">Hey, it feels so empty here</h3>
          <p className="text-muted mb-4" style={{ fontSize: "16px" }}>
            Lets add some services
          </p>
          
          <Button
            className="butn fw-bold"
            onClick={handleExploreServices}
            style={{
              padding: "12px 32px",
              fontSize: "16px",
              borderRadius: "8px"
            }}
          >
            Explore Services
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="container mt-4 ">
      <Row>
        <Col
          style={{
            position:"sticky",top:"100px",
            border: "1px solid rgba(0,0,0,0.2)",
            borderRadius: "10px",
            padding: "15px",
            height: "150px",
          }}
        >
          <p className="fw-semibold mb-1">Account</p>
          <p style={{ fontSize: "13px", color: "#555" }}>
            To book the service, please login or sign up
          </p>
          <Button className="butn w-100 fw-bold" style={{ height: "40px" }}>
            Login
          </Button>
        </Col>

        <Col>
          <CartBlock
            carts={carts}
            formatPrice={formatPrice}
            safePrice={safePrice}
            handleIncrease={handleIncrease}
            handleDecrease={handleDecrease}
            hideViewButton={true}
            onEdit={openEditModal}
          />
          
          {/* ---------------- Frequently Added Section with Checkbox ---------------- */}
          {visibleCarouselItems.length > 0 && (
            <div 
              className="mt-4 p-4" 
              style={{ 
                border: "1px solid #e0e0e0", 
                borderRadius: "10px",
                backgroundColor: "#fafafa"
              }}
            >
              <h4 className="fw-bold mb-3">Frequently added together</h4>
              <FrequentlyAddedCarousel
                items={visibleCarouselItems}
                carts={carts}
                onAdd={(item) => handleAddToCart(item, [], item.price, 0, "add")}
                onRemove={(item) => handleAddToCart(item, [], item.price, 0, "remove")}
              />

              {/* Checkbox Section */}
              <div className="mt-4 pt-3 border-top">
                <Form.Check 
                  type="checkbox"
                  id="frequently-added-checkbox"
                  label="Avoid calling before reaching the location"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  style={{ 
                    fontSize: "16px",
                    fontWeight: "500"
                  }}
                />
              </div>
            </div>
          )}
          
          <br />
          <div style={{border:"1px solid #d9d9d9ff",borderRadius:"8px"}}>
            <div style={{padding:"20px" }}>
              <Row>
                <Col xs={8}> 
                  <h5 className="fw-semibold">
                    <TbCirclePercentageFilled style={{color:"rgb(22, 108, 52)",fontSize:"25px"}}/> 
                    Coupons and offers
                  </h5>
                </Col>
                <Col>
                  <Button className="border-0 fw-semibold" style={{backgroundColor:"transparent",color:"#6e42e5"}}>
                    5 offers <MdKeyboardArrowRight style={{fontSize:"25px"}} />
                  </Button>
                </Col>
              </Row>
            </div>
          </div>

          <br />
          <div style={{border:"1px solid #d9d9d9ff",borderRadius:"8px"}}>
            <div style={{padding:"20px" }}>
              <h4 className="fw-semibold">Payment summary</h4>
              <br />
              <Row className="mb-2">
                <Col><p>Item total</p></Col>
                <Col className="text-end"><p>{formatPrice(itemTotal)}</p></Col>
              </Row>
              <Row className="mb-2">
                <Col>
                  <p style={{textDecoration:"underline dotted", cursor: "pointer"}} title="18% GST">
                    Taxes and fee
                  </p>
                </Col>
                <Col className="text-end"><p>{formatPrice(tax)}</p></Col>
              </Row>

              {/* Tip Section in Payment Summary */}
              {tip > 0 && (
                <Row className="mb-2">
                  <Col>
                    <p>Tip</p>
                  </Col>
                  <Col className="text-end">
                    <p>{formatPrice(tip)}</p>
                  </Col>
                </Row>
              )}

              <hr />
              <Row className="mb-2">
                <Col><p className="fw-semibold">Total price</p></Col>
                <Col className="text-end"><p className="fw-semibold">{formatPrice(totalPrice)}</p></Col>
              </Row>
              <hr />
              <Row>
                <Col><p className="fw-semibold">Amount to pay</p></Col>
                <Col className="text-end"><p className="fw-semibold">{formatPrice(totalPrice)}</p></Col>
              </Row>
              <hr />
            </div>

            <div style={{ padding: "20px" }}>
              <Row className="align-items-center">
                <Col>
                  <p className="fw-semibold mb-2">Add a tip to thank the professional</p>
                  
                  {/* Tip Buttons with Inline Custom Input */}
                  <div className="d-flex gap-2 mb-3 align-items-center flex-wrap">
                    <Button 
                      onClick={() => handleTipSelect(50)}
                      className="edit fw-semibold"
                      style={{ 
                        color: selectedTip === 50 ?  "black":"",
                        borderRadius: "8px",
                        padding: "8px 16px"
                      }}
                    >
                      ₹50
                    </Button>
                    <Button 
                      onClick={() => handleTipSelect(75)}
                      className="edit fw-semibold"
                      style={{ 
                        color: selectedTip === 75 ?  "black":"",
                        borderRadius: "8px",
                        padding: "8px 16px"
                      }}
                    >
                      ₹75
                    </Button>
                    <Button 
                      onClick={() => handleTipSelect(100)}
                      className="edit fw-semibold"
                      style={{ 
                        color: selectedTip === 100 ? "black":"",
                        borderRadius: "8px",
                        padding: "8px 16px"
                      }}
                    >
                      ₹100
                    </Button>
                    
                    {/* Inline Custom Tip Input */}
                    {showCustomTip ? (
                      <div className="d-flex gap-2 align-items-center">
                        <span className="fw-semibold">₹</span>
                        <input
                          type="number"
                          placeholder="Enter amount"
                          value={customTip}
                          onChange={handleCustomTipChange}
                          style={{
                            width: "100px",
                            padding: "8px 12px",
                            border: "1px solid #6e42e5",
                            borderRadius: "8px",
                            fontSize: "14px"
                          }}
                          autoFocus
                          min="25"
                        />
                        <Button 
                          variant="primary"
                          onClick={handleCustomTipSubmit}
                          style={{ 
                            borderRadius: "8px",
                            padding: "8px 16px"
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={handleCustomTipClick}
                        className="edit fw-semibold"
                        style={{ 
                          color: customTip ? "white" : "black",
                          borderRadius: "8px",
                          padding: "8px 16px"
                        }}
                      >
                        Custom
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-muted small mb-3">100% of your tip goes to the professional.</p>

                  {/* Remove Tip Button */}
                  {(tip > 0) && (
                    <Button 
                      variant="link" 
                      className="p-0 text-danger"
                      onClick={handleRemoveTip}
                    >
                      Remove tip
                    </Button>
                  )}
                </Col>
              </Row>
            </div>
          </div>

          {/* Amount to Pay Section */}
          <div className="mt-4 p-3 position-sticky bottom-0 " style={{backgroundColor:"white",height:"100px"}} >
            <Row className="align-items-center">
              <Col>
                <h5 className="fw-bold mb-0">Amount to Pay</h5>
              </Col>
              <Col className="text-end">
                <h5 className="fw-bold mb-0">{formatPrice(totalPrice)}</h5>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      {showModal && (
        <Salon1modal
          show={showModal}
          onHide={() => setShowModal(false)}
          selectedItem={selectedPkg}
          refresh={fetchCarts}
        />
      )}
    </div>
  );
}

export default CartPage;