import React, { useState, useEffect } from "react";
import CartBlock from "./CartBlock";
import Salon1modal from "./Salon1modal";
import { Row, Col, Button, Container, Form, Modal, Card, Badge, Dropdown } from "react-bootstrap";
import FrequentlyAddedCarousel from "./FrequentlyAddedCarousel";
import { TbCirclePercentageFilled } from "react-icons/tb";
import { MdKeyboardArrowRight, MdEdit, MdMoreVert, MdDelete } from "react-icons/md";
import AccountModal from "./AccountModal";
import { ImLocation } from "react-icons/im";
import { useAuth } from "./AuthContext";
import { FaClock } from "react-icons/fa";
import { MdPayments } from "react-icons/md";

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
  const [showLoginView, setShowLoginView] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const { isLoggedIn, userInfo } = useAuth();

  // Enhanced time slots data with proper dates (only next 3 days)
  const timeSlotsData = {
    // Today
    [new Date().toISOString().split('T')[0]]: [
      { id: 1, time: "10:00 AM", available: true, extraCharge: 0 },
      { id: 2, time: "10:30 AM", available: true, extraCharge: 0 },
      { id: 3, time: "11:00 AM", available: false, extraCharge: 0 },
      { id: 4, time: "11:30 AM", available: true, extraCharge: 0 },
      { id: 5, time: "02:00 PM", available: true, extraCharge: 0 },
      { id: 6, time: "02:30 PM", available: true, extraCharge: 0 },
      { id: 7, time: "07:00 PM", available: true, extraCharge: 100 }, // ₹100 extra
      { id: 8, time: "07:30 PM", available: true, extraCharge: 100 }, // ₹100 extra
    ],
    // Tomorrow
    [new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: [
      { id: 9, time: "09:00 AM", available: true, extraCharge: 0 },
      { id: 10, time: "09:30 AM", available: true, extraCharge: 0 },
      { id: 11, time: "10:00 AM", available: true, extraCharge: 0 },
      { id: 12, time: "11:00 AM", available: true, extraCharge: 0 },
      { id: 13, time: "03:00 PM", available: true, extraCharge: 0 },
      { id: 14, time: "07:00 PM", available: true, extraCharge: 100 }, // ₹100 extra
      { id: 15, time: "07:30 PM", available: true, extraCharge: 100 }, // ₹100 extra
    ],
    // Day after tomorrow
    [new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: [
      { id: 16, time: "01:00 PM", available: true, extraCharge: 0 },
      { id: 17, time: "01:30 PM", available: true, extraCharge: 0 },
      { id: 18, time: "02:00 PM", available: true, extraCharge: 0 },
      { id: 19, time: "04:00 PM", available: true, extraCharge: 0 },
      { id: 20, time: "04:30 PM", available: false, extraCharge: 0 },
      { id: 21, time: "07:00 PM", available: true, extraCharge: 100 }, // ₹100 extra
      { id: 22, time: "07:30 PM", available: true, extraCharge: 100 }, // ₹100 extra
    ]
  };

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

  // Check for saved address when component loads
  useEffect(() => {
    fetchCarts();
    fetchAddedItems();
    
    // Check if address is saved in localStorage
    const savedAddress = localStorage.getItem('selectedAddress');
    if (savedAddress) {
      setSelectedAddress(JSON.parse(savedAddress));
    }

    // Set today as default selected date
    setSelectedDate(new Date());
  }, []);

  // Listen for address updates from UrbanNav
  useEffect(() => {
    const handleStorageChange = () => {
      const savedAddress = localStorage.getItem('selectedAddress');
      if (savedAddress) {
        setSelectedAddress(JSON.parse(savedAddress));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically
    const interval = setInterval(() => {
      const savedAddress = localStorage.getItem('selectedAddress');
      if (savedAddress && !selectedAddress) {
        setSelectedAddress(JSON.parse(savedAddress));
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [selectedAddress]);

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

  const calculateSlotExtraCharge = () => {
    return selectedSlot?.extraCharge || 0;
  };

  const calculateTotalPrice = () => {
    const itemTotal = calculateItemTotal();
    const tax = calculateTax();
    const tip = calculateTip();
    const slotExtraCharge = calculateSlotExtraCharge();
    return itemTotal + tax + tip + slotExtraCharge;
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
    setShowLoginView(true);
  };

  const handleAccountModalClose = () => {
    setShowAccountModal(false);
    setShowLoginView(false);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null); // Reset slot when date changes
  };

  const handleProceedToPayment = () => {
    if (!selectedSlot) {
      alert("Please select a time slot");
      return;
    }
    // Navigate to payment page
    alert(`Proceeding to payment for slot: ${selectedSlot.time}`);
    // window.location.href = "/payment";
  };

  // Function to open UrbanNav's location modal
  const handleOpenLocationModal = () => {
    const event = new CustomEvent('openLocationModal');
    window.dispatchEvent(event);
    localStorage.setItem('openLocationModal', 'true');
  };

  // Format address for display
  const formatAddressDisplay = (address) => {
    if (!address) return "";
    const parts = [];
    if (address.doorNo) parts.push(address.doorNo);
    if (address.mainText) parts.push(address.mainText);
    if (address.subText) {
      const firstPart = address.subText.split(',')[0];
      parts.push(firstPart);
    }
    
    let formattedAddress = parts.join(', ');
    
    // Truncate if too long
    if (formattedAddress.length > 20) {
      formattedAddress = formattedAddress.substring(0, 20) + '...';
    }
    
    return formattedAddress;
  };

  // Get address type display name
  const getAddressTypeDisplay = (addressType) => {
    switch (addressType) {
      case 'home': return 'Home';
      case 'work': return 'Work';
      case 'other': return 'Other';
      default: return 'Home';
    }
  };

  // Get only next 3 dates
  const getDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 3; i++) { // Only 3 days
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = getDates();

  // Get slots for selected date
  const getSlotsForSelectedDate = () => {
    if (!selectedDate) return [];
    const dateKey = selectedDate.toISOString().split('T')[0];
    return timeSlotsData[dateKey] || [];
  };

  // Format date for display
  const formatDateDisplay = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const itemTotal = calculateItemTotal();
  const tax = calculateTax();
  const tip = calculateTip();
  const slotExtraCharge = calculateSlotExtraCharge();
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
            height: isLoggedIn ? "auto" : "150px",
          }}
        >
          {isLoggedIn ? (
            <div>
              {/* Send booking details section */}
              <div className="mb-3">
                <h5 className="fw-semibold">
                  <ImLocation style={{fontSize:"20px", marginRight: "8px"}}/>
                  Send booking details to
                </h5>
                <p className="mb-1" style={{ marginLeft: "28px", fontSize: "14px" }}>
                 {userInfo?.phone || "9787081119"}
                </p>
              </div>
              
              <hr />
              
              {/* Address section */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="fw-semibold mb-0">
                    <ImLocation style={{fontSize:"20px", marginRight: "8px"}}/>
                    Address
                  </h5>
                  {selectedAddress && (
                    <Button 
                      size="sm"
                      onClick={handleOpenLocationModal}
                      className="d-flex align-items-center fw-semibold gap-1 edit"
                    >
                      Edit
                    </Button>
                  )}
                </div>
                <div style={{ marginLeft: "28px" }}>
                  {selectedAddress ? (
                    <div >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          {/* Address Type - First line */}
                          <p className="mb-2 fw-semibold" style={{ fontSize: "14px",color:"#6b6b6bff" }}>
                            {getAddressTypeDisplay(selectedAddress.addressType)} <span className="fw-normal">• {formatAddressDisplay(selectedAddress)}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      className="butn"
                      onClick={handleOpenLocationModal}
                    >
                      Select an address
                    </Button>
                  )}
                </div>
              </div>
              
              <hr />
              
              {/* Slot section */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="fw-semibold mb-0">
                    <FaClock style={{fontSize:"18px", marginRight: "8px"}}/>
                    Slot
                  </h5>
                  {selectedSlot && (
                    <Button 
                      className="edit fw-semibold" 
                      size="sm"
                      onClick={() => setShowSlotModal(true)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
                {selectedSlot ? (
                  <div style={{ marginLeft: "28px" }}>
                    <p className="mb-1 fw-semibold">{selectedSlot.time}</p>
                    <p className="text-muted small mb-2">
                      {selectedDate && formatDateDisplay(selectedDate)}
                      {selectedSlot.extraCharge > 0 && (
                        <span className="text-warning ms-2">+{formatPrice(selectedSlot.extraCharge)} extra</span>
                      )}
                    </p>
                  </div>
                ) : (
                  <div style={{ marginLeft: "28px" }}>
                    <Button 
                      className="butn w-100" style={{height:"42px"}} 
                      onClick={() => setShowSlotModal(true)}
                      disabled={!selectedAddress}
                    >
                      Select time & date
                    </Button>
                    {!selectedAddress && (
                      <p className="text-muted small mt-1">Please select address first</p>
                    )}
                  </div>
                )}
              </div>     
              <hr />
              
              {/* Payment section */}
              <div>
                <h5 className="fw-semibold">
                  <MdPayments style={{fontSize:"20px", marginRight: "8px"}}/>
                  Payment Method
                </h5>
                {selectedSlot && (
                  <div style={{ marginLeft: "28px" }}>
                    <Button className="butn" onClick={handleProceedToPayment}>
                      Proceed to Payment
                    </Button>
                  </div>
                )}
              </div>
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
              
              {/* Slot Extra Charge */}
              {slotExtraCharge > 0 && (
                <Row className="mb-1">
                  <Col><p style={{fontSize:"14px"}}>Evening slot charge</p></Col>
                  <Col className="text-end"><p style={{fontSize:"14px"}}>{formatPrice(slotExtraCharge)}</p></Col>
                </Row>
              )}
              
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

          {/* Amount to Pay Section - Only in 2nd column for desktop */}
          <div className="d-none position-sticky bottom-0 d-md-block mt-4 p-3 " style={{backgroundColor:"white"}} >
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

      {/* Fixed Bottom Footer for Mobile Only */}
      <div className="d-md-none position-fixed bottom-0 start-0 end-0 bg-white border-top shadow-lg py-3"
           style={{ zIndex: 1050 }}>
        <Container>
          <Row className="align-items-center">
            {isLoggedIn ? (
              <>
                <Col xs={6}>
                  <h5 className="fw-bold mb-0" style={{ fontSize: "16px" }}>
                    Amount to Pay
                  </h5>
                </Col>
                <Col xs={6} className="text-end">
                  <h5 className="fw-bold mb-0" style={{ fontSize: "16px" }}>
                    {formatPrice(totalPrice)}
                  </h5>
                </Col>
              </>
            ) : (
              <Col xs={12}>
                <Button 
                  className="butn w-100 fw-bold" 
                  style={{ height: "45px", fontSize: "16px" }} 
                  onClick={handleLogin}
                >
                  Login to Continue
                </Button>
              </Col>
            )}
          </Row>
        </Container>
      </div>

      {/* Add padding to bottom to prevent content from being hidden behind fixed footer (mobile only) */}
      <div className="d-md-none" style={{ height: "80px" }}></div>

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
        onHide={handleAccountModalClose}
        initialView={showLoginView ? "login" : "main"}
      />

      {/* Time Slot Selection Modal */}
      <Modal show={showSlotModal} onHide={() => setShowSlotModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Select Time Slot</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Date Selection Row */}
          <div className="mb-4">
            <h6 className="fw-semibold mb-3">Select Date</h6>
            <div className="d-flex gap-2 overflow-auto pb-2">
              {dates.map((date, index) => (
                <Button
                  key={index}
                  variant={selectedDate?.toDateString() === date.toDateString() }
                  className="flex-shrink-0 button"
                  style={{ minWidth: "100px" ,fontSize:"15px"}}
                  onClick={() => handleDateSelect(date)}
                >
                  {formatDateDisplay(date)}
                </Button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className="mb-4">
            <h6 className="fw-semibold mb-3">
              Available Time Slots {selectedDate && `- ${formatDateDisplay(selectedDate)}`}
            </h6>
            {selectedDate ? (
              <Row>
                {getSlotsForSelectedDate().map(slot => (
                  <Col md={2} key={slot.id} className="mb-3">
                    <div 
                      className={`p-3 border rounded text-center position-relative ${
                        selectedSlot?.id === slot.id ? 'border-primary bg-light' : ''
                      } ${!slot.available ? 'bg-light text-muted' : ''}`}
                      style={{ 
                        cursor: slot.available ? 'pointer' : 'not-allowed',
                        backgroundColor: !slot.available ? '#f8f9fa' : '',
                        minHeight: '0px'
                      }}
                      onClick={() => slot.available && handleSlotSelect(slot)}
                    >
                      {/* ₹100 Overlay Badge */}
                      {slot.extraCharge > 0 && (
                        <Badge 
                          bg="warning" 
                          text="dark"
                          className="position-absolute  m-1"
                          style={{ fontSize: '0.7rem',top:"-12px",right:"-5px" }}
                        >
                          +₹{slot.extraCharge}
                        </Badge>
                      )}
                      
                      <p className="mb-0">{slot.time}</p>
                      
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted">Please select a date to view available slots</p>
              </div>
            )}
          </div>

          {/* Selected Address Display */}
          {selectedAddress && (
            <div className="border-top pt-3">
              <h6 className="fw-semibold mb-2">Service Address</h6>
              <p className="text-muted mb-0">
                {formatAddressDisplay(selectedAddress)}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSlotModal(false)}>
            Cancel
          </Button>
          <Button 
            className="butn" 
            onClick={() => {
              setShowSlotModal(false);
            }}
            disabled={!selectedSlot}
          >
            Confirm Slot
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CartPage;