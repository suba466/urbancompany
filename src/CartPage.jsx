import React, { useState, useEffect } from "react";
import CartBlock from "./CartBlock";
import Salon1modal from "./Salon1modal";
import { Row, Col, Button, Container, Form } from "react-bootstrap";
import FrequentlyAddedCarousel from "./FrequentlyAddedCarousel";
import { TbCirclePercentageFilled } from "react-icons/tb";
import { MdKeyboardArrowRight } from "react-icons/md";
import AccountModal from "./AccountModal";
import { CgProfile } from "react-icons/cg";
import { useAuth } from "./AuthContext";

function CartPage() {
  const [carts, setCarts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [addedImgs, setAddedImgs] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [showCustomTip, setShowCustomTip] = useState(false);
  const [selectedTip, setSelectedTip] = useState(0);
  const [customTip, setCustomTip] = useState("");
  const [showAccountModal, setShowAccountModal] = useState(false);

  const { isLoggedIn, userInfo, logout } = useAuth();

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

  const calculateItemTotal = () => {
    return carts.reduce((total, item) => {
      return total + (safePrice(item.price) * (item.count || 1));
    }, 0);
  };

  const calculateTax = () => {
    const itemTotal = calculateItemTotal();
    return Math.round(itemTotal * 0.18);
  };

  const calculateTip = () => {
    if (customTip) {
      const tipAmount = safePrice(customTip);
      return tipAmount >= 25 ? tipAmount : 0;
    }
    return selectedTip;
  };

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

  const handleLogin = () => {
    setShowAccountModal(true);
  };

  const handleLogout = () => {
    logout();
  };

  const handleEditProfile = () => {
    setShowAccountModal(true);
  };

  const itemTotal = calculateItemTotal();
  const tax = calculateTax();
  const tip = calculateTip();
  const totalPrice = calculateTotalPrice();

  // If cart is empty, show empty state
  if (carts.length === 0) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center" >
        <div className="text-center mt-5">
          <div>
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
            style={{ padding: "12px 32px", fontSize: "16px", borderRadius: "8px" }}
          >
            Explore Services
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="container mt-4">
      <Row>
        {/* Account Column - Shows different content based on login status */}
        <Col md={6} className="d-none d-md-block"
          style={{
            position:"sticky",
            top:"100px",
            border: "1px solid rgba(0,0,0,0.2)",
            borderRadius: "10px",
            padding: "15px",
            height: isLoggedIn ? "180px" : "150px",
          }}
        >
          {isLoggedIn ? (
            // User Profile Section when logged in
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <p className="fw-semibold mb-0">Account</p>
                <Button 
                  variant="link" 
                  className="p-0 text-primary fw-semibold"
                  style={{ fontSize: "13px" }}
                  onClick={handleEditProfile}
                >
                  Edit
                </Button>
              </div>
              
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "50px", height: "50px" }}>
                  <CgProfile size={24} className="text-muted" />
                </div>
                <div>
                  <h6 className="fw-semibold mb-1">{userInfo.name}</h6>
                  <p className="text-muted small mb-0">{userInfo.phone}</p>
                </div>
              </div>
              
              <Button 
                variant="outline-danger" 
                className="w-100 fw-semibold" 
                style={{ height: "35px", fontSize: "13px" }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            // Login Section when not logged in
            <div>
              <p className="fw-semibold mb-1">Account</p>
              <p style={{ fontSize: "13px", color: "#555" }}>
                To book the service, please login or sign up
              </p>
              <Button 
                className="butn w-100 fw-bold" 
                style={{ height: "40px" }} 
                onClick={handleLogin}
              >
                Login
              </Button>
            </div>
          )}
        </Col>

        {/* Cart Column (full-width on mobile) */}
        <Col xs={12} md={6}>
          <CartBlock
            carts={carts}
            formatPrice={formatPrice}
            safePrice={safePrice}
            handleIncrease={handleIncrease}
            handleDecrease={handleDecrease}
            hideViewButton={true}
            onEdit={openEditModal}
          />

          {visibleCarouselItems.length > 0 && (
            <div className="mt-3 p-2" style={{ border: "1px solid #e0e0e0", borderRadius: "10px", backgroundColor: "#fafafa" }}>
              <h5 className="fw-bold mb-2" style={{ fontSize: "15px" }}>Frequently added together</h5>
              <FrequentlyAddedCarousel
                items={visibleCarouselItems}
                carts={carts}
                onAdd={(item) => handleAddToCart(item, [], item.price, 0, "add")}
                onRemove={(item) => handleAddToCart(item, [], item.price, 0, "remove")}
              />
              <div className="mt-4 pt-3 border-top">
                <Form.Check 
                  type="checkbox"
                  id="frequently-added-checkbox"
                  label="Avoid calling before reaching the location"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  style={{ fontSize: "16px", fontWeight: "500" }}
                />
              </div>
            </div>
          )}

          {/* Coupons Box */}
          <div style={{border:"1px solid #d9d9d9", borderRadius:"8px", marginTop:"15px"}}>
            <div style={{padding:"12px"}}>
              <Row className="align-items-center">
                <Col xs={8}>
                  <h5 className="fw-semibold mb-1" style={{ fontSize: "14px" }}>
                    <TbCirclePercentageFilled style={{color:"rgb(22, 108, 52)",fontSize:"20px"}}/> 
                    Coupons and offers
                  </h5>
                </Col>
                <Col xs={4} className="text-end">
                  <Button 
                    className="border-0 fw-semibold"
                    style={{backgroundColor:"transparent", color:"#6e42e5", fontSize:"13px", padding:"4px 8px"}}
                  >
                    5 offers <MdKeyboardArrowRight style={{fontSize:"18px"}} />
                  </Button>
                </Col>
              </Row>
            </div>
          </div>

          {/* Payment Summary */}
          <div style={{border:"1px solid #d9d9d9",borderRadius:"8px", marginTop:"15px"}}>
            <div style={{padding:"12px"}}>
              <h5 className="fw-semibold mb-2">Payment summary</h5>
              <Row className="mb-1">
                <Col><p style={{fontSize:"14px"}}>Item total</p></Col>
                <Col className="text-end"><p style={{fontSize:"14px"}}>{formatPrice(itemTotal)}</p></Col>
              </Row>
              <Row className="mb-1">
                <Col><p style={{textDecoration:"underline dotted", cursor: "pointer", fontSize:"14px"}} title="18% GST">Taxes and fee</p></Col>
                <Col className="text-end"><p style={{fontSize:"14px"}}>{formatPrice(tax)}</p></Col>
              </Row>
              {tip > 0 && (
                <Row className="mb-1">
                  <Col><p style={{fontSize:"14px"}}>Tip</p></Col>
                  <Col className="text-end"><p style={{fontSize:"14px"}}>{formatPrice(tip)}</p></Col>
                </Row>
              )}
              <hr />
              <Row className="mb-1">
                <Col><p className="fw-semibold" style={{fontSize:"14px"}}>Total price</p></Col>
                <Col className="text-end"><p className="fw-semibold" style={{fontSize:"14px"}}>{formatPrice(totalPrice)}</p></Col>
              </Row>
              <hr />
              <Row className="mb-1">
                <Col><p className="fw-semibold" style={{fontSize:"14px"}}>Amount to pay</p></Col>
                <Col className="text-end"><p className="fw-semibold" style={{fontSize:"14px"}}>{formatPrice(totalPrice)}</p></Col>
              </Row>
              <hr />

              {/* Tip Section */}
              <div className="mt-2">
                <p className="fw-semibold mb-1" style={{fontSize:"14px"}}>Add a tip to thank the professional</p>
                <div className="d-flex gap-2 mb-2 align-items-center flex-wrap">
                  {[50,75,100].map(amount => (
                    <Button 
                      key={amount}
                      onClick={() => handleTipSelect(amount)}
                      className="edit fw-semibold"
                      style={{ color: selectedTip === amount ? "black" : "", borderRadius: "6px", padding: "6px 12px", fontSize:"13px" }}
                    >
                      ₹{amount}
                    </Button>
                  ))}
                  {showCustomTip ? (
                    <div className="d-flex gap-2 align-items-center">
                      <span className="fw-semibold" style={{fontSize:"14px"}}>₹</span>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        value={customTip}
                        onChange={handleCustomTipChange}
                        style={{ width: "80px", padding: "6px 8px", border: "1px solid #6e42e5", borderRadius: "6px", fontSize:"13px" }}
                        autoFocus
                        min="25"
                      />
                      <Button 
                        variant="primary"
                        onClick={handleCustomTipSubmit}
                        style={{ borderRadius: "6px", padding: "6px 12px", fontSize:"13px" }}
                      >
                        Add
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleCustomTipClick}
                      className="edit fw-semibold"
                      style={{ color: customTip ? "white" : "black", borderRadius: "6px", padding: "6px 12px", fontSize:"13px" }}
                    >
                      Custom
                    </Button>
                  )}
                </div>
                <p className="text-muted small mb-2" style={{fontSize:"12px"}}>100% of your tip goes to the professional.</p>
                {tip > 0 && (
                  <Button variant="link" className="p-0 text-danger" style={{fontSize:"12px"}} onClick={handleRemoveTip}>Remove tip</Button>
                )}
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="mt-4 p-3 position-sticky bottom-0 bg-white border-top" style={{height:"100px"}}>
            {isLoggedIn ? (
              // Show Amount to Pay when logged in
              <Row className="align-items-center h-100">
                <Col>
                  <h5 className="fw-bold mb-0">Amount to Pay</h5>
                </Col>
                <Col className="text-end">
                  <h5 className="fw-bold mb-0">{formatPrice(totalPrice)}</h5>
                </Col>
              </Row>
            ) : (
              // Show Login button when not logged in (visible on mobile)
              <div className="d-md-none">
                <Button 
                  className="butn w-100 fw-bold" 
                  style={{ height: "45px" }} 
                  onClick={handleLogin}
                >
                  Login
                </Button>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Salon Modal */}
      {showModal && (
        <Salon1modal
          show={showModal}
          onHide={() => setShowModal(false)}
          selectedItem={selectedPkg}
          refresh={fetchCarts}
        />
      )}

      {/* Account Modal for Login/Profile */}
      <AccountModal
        show={showAccountModal}
        onHide={() => setShowAccountModal(false)}
      />
    </div>
  );
}

export default CartPage;