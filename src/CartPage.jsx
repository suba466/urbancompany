import { useState, useEffect } from "react";
import CartBlock from "./CartBlock";
import Salon1modal from "./Salon1modal";
import { Row, Col, Button, Container, Form, Modal, Card, Badge } from "react-bootstrap";
import FrequentlyAddedCarousel from "./FrequentlyAddedCarousel";
import { TbCirclePercentageFilled } from "react-icons/tb";
import { MdKeyboardArrowRight, MdPayments } from "react-icons/md";
import AccountModal from "./AccountModal";
import { ImLocation } from "react-icons/im";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import { FaClock } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { MdHomeFilled } from "react-icons/md";
import { MdWork } from "react-icons/md";
import { MdLocationOn } from "react-icons/md";
import { LuClock3 } from "react-icons/lu";

function CartPage() {
  const { cartItems, refreshCart } = useCart();
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
  const [showBookingsModal, setShowBookingsModal]=useState(false);
  const { isLoggedIn, userInfo } = useAuth();
  const handleViewBookings=()=>{
    setShowBookingsModal(true);
  }
 // In CartPage.jsx, update the processPayment function
const processPayment = async () => {
  // First check if all required fields are filled
  if (!selectedAddress) {
    alert("Please select an address first");
    return;
  }
  
  if (!selectedSlot) {
    alert("Please select a time slot");
    return;
  }
  
  // Check if user is logged in
  if (!isLoggedIn) {
    alert("Please login to place an order");
    setShowAccountModal(true);
    setShowLoginView(true);
    return;
  }

  try {
    // Calculate totals
    const itemTotal = calculateItemTotal();
    const tax = calculateTax();
    const tip = calculateTip();
    const slotExtraCharge = calculateSlotExtraCharge();
    const totalPrice = itemTotal + tax + tip + slotExtraCharge;

    // Prepare booking data
    const bookingData = {
      userId: userInfo.userId || `user_${userInfo.phone || "9787081119"}`,
      userEmail: userInfo.email,
      userName: userInfo.name || "Customer",
      userPhone: userInfo.phone || "9787081119",
      userCity: userInfo.city || "",
      serviceName: cartItems.map(item => item.title).join(', '),
      servicePrice: totalPrice.toString(),
      originalPrice: itemTotal.toString(),
      address: selectedAddress,
      scheduledDate: selectedDate ? selectedDate.toISOString() : new Date().toISOString(),
      scheduledTime: selectedSlot.time,
      items: cartItems.map(item => ({
        name: item.title,
        quantity: item.count || 1,
        price: item.price
      })),
      slotExtraCharge: slotExtraCharge,
      tipAmount: tip,
      taxAmount: tax,
      paymentMethod: "Direct Booking", // Or "Cash on Delivery" if you prefer
      status: "Confirmed"
    };

    console.log("Creating booking with data:", bookingData);

    // Send booking to server
    const response = await fetch("http://localhost:5000/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      throw new Error("Failed to create booking");
    }

    const result = await response.json();
    
    // Clear cart after successful booking
    await clearCartFromDatabase();
    
    // Clear local storage
    localStorage.removeItem('selectedAddress');
    
    // Show success message
    alert(` Order placed successfully!\n\nBooking ID: ${result.booking._id}\nAmount: ₹${totalPrice}`);
    
    // Redirect to home or bookings page
    window.location.href = "/";
    
  } catch (error) {
    console.error("Error processing order:", error);
    alert(`Order failed: ${error.message}`);
  }
};

// Add clearCartFromDatabase function
const clearCartFromDatabase = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/carts");
    if (response.ok) {
      const data = await response.json();
      const cartItems = data.carts || [];
      
      // Delete all cart items
      for (const item of cartItems) {
        await fetch(`http://localhost:5000/api/carts/${item._id}`, {
          method: "DELETE"
        });
      }
      
      // Refresh cart context
      refreshCart();
    }
  } catch (error) {
    console.error("Error clearing cart:", error);
  }
};
// Add this function to check if order can be placed
const canPlaceOrder = () => {
  if (!isLoggedIn) return false;
  if (!selectedAddress) return false;
  if (!selectedSlot) return false;
  if (cartItems.length === 0) return false;
  return true;
};
  const timeSlotsData = {
    [new Date().toISOString().split('T')[0]]: [
      { id: 1, time: "10:00 AM", available: true, extraCharge: 0 },
      { id: 2, time: "10:30 AM", available: true, extraCharge: 0 },
      { id: 3, time: "11:00 AM", available: false, extraCharge: 0 },
      { id: 4, time: "11:30 AM", available: true, extraCharge: 0 },
      { id: 5, time: "02:00 PM", available: true, extraCharge: 0 },
      { id: 6, time: "02:30 PM", available: true, extraCharge: 0 },
      { id: 7, time: "07:00 PM", available: true, extraCharge: 100 },
      { id: 8, time: "07:30 PM", available: true, extraCharge: 100 },
    ],
    [new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: [
      { id: 9, time: "09:00 AM", available: true, extraCharge: 0 },
      { id: 10, time: "09:30 AM", available: true, extraCharge: 0 },
      { id: 11, time: "10:00 AM", available: true, extraCharge: 0 },
      { id: 12, time: "11:00 AM", available: true, extraCharge: 0 },
      { id: 13, time: "03:00 PM", available: true, extraCharge: 0 },
      { id: 14, time: "07:00 PM", available: true, extraCharge: 100 },
      { id: 15, time: "07:30 PM", available: true, extraCharge: 100 },
    ],
    [new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: [
      { id: 16, time: "01:00 PM", available: true, extraCharge: 0 },
      { id: 17, time: "01:30 PM", available: true, extraCharge: 0 },
      { id: 18, time: "02:00 PM", available: true, extraCharge: 0 },
      { id: 19, time: "04:00 PM", available: true, extraCharge: 0 },
      { id: 20, time: "04:30 PM", available: false, extraCharge: 0 },
      { id: 21, time: "07:00 PM", available: true, extraCharge: 100 },
      { id: 22, time: "07:30 PM", available: true, extraCharge: 100 },
    ]
  };

  const fetchAddedItems = () => {
    fetch("http://localhost:5000/api/added")
      .then(res => res.json())
      .then(data => setAddedImgs(data.added || []))
      .catch(err => console.error("Failed to load added images:", err));
  };

  useEffect(() => {
    fetchAddedItems();
    refreshCart();
    
    const savedAddress = localStorage.getItem('selectedAddress');
    if (savedAddress) {
      setSelectedAddress(JSON.parse(savedAddress));
    }

    setSelectedDate(new Date());
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedAddress = localStorage.getItem('selectedAddress');
      if (savedAddress) {
        setSelectedAddress(JSON.parse(savedAddress));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
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
    return cartItems.reduce((total, item) => {
      return total + (safePrice(item.price) * (item.count || 1));
    }, 0);
  };

  const calculateTax = () => {
    const itemTotal = calculateItemTotal();
    return Math.round(itemTotal * 0.068);
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
    try {
      await fetch(`http://localhost:5000/api/carts/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: item.count + 1 }),
      });
      refreshCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error("Error increasing item:", error);
    }
  };

  const handleDecrease = async (item) => {
    try {
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
      refreshCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error("Error decreasing item:", error);
    }
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

        const existingItem = cartItems.find(cart => cart.title === item.name);
        
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
        const existingItem = cartItems.find(cart => cart.title === item.name);
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
      refreshCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error("Error handling cart:", error);
    }
  };

  const visibleCarouselItems = addedImgs.filter(img => {
    const inCart = cartItems.some(c => c.title === img.name);
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
    setSelectedSlot(null);
  };

  const handleOpenLocationModal = () => {
    const event = new CustomEvent('openLocationModal');
    window.dispatchEvent(event);
    localStorage.setItem('openLocationModal', 'true');
  };

  const handleAddress = () => {
    handleOpenLocationModal();
  };

  // Function to get address icon based on type
  const getAddressIcon = (addressType) => {
    switch (addressType) {
      case 'home': return <MdHomeFilled style={{ marginRight: "4px", fontSize: "16px", verticalAlign: "text-bottom" }} />;
      case 'work': return <MdWork style={{ marginRight: "4px", fontSize: "16px", verticalAlign: "text-bottom" }} />;
      default: return <MdLocationOn style={{ marginRight: "4px", fontSize: "16px", verticalAlign: "text-bottom" }} />;
    }
  };

  // Function to get address type text
  const getAddressTypeText = (addressType) => {
    switch (addressType) {
      case 'home': return 'Home';
      case 'work': return 'Work';
      default: return 'Other';
    }
  };

  // Function to format full address for display
  const formatFullAddress = (address) => {
    if (!address) return "";
    
    const parts = [];
    
    if (address.doorNo && address.doorNo.trim() !== "") {
      parts.push(address.doorNo.trim());
    }
    
    if (address.mainText && address.mainText.trim() !== "") {
      parts.push(address.mainText.trim());
    }
    
    if (address.subText && address.subText.trim() !== "") {
      parts.push(address.subText.trim());
    }
    
    return parts.join(", ");
  };

  // Function to format address for mobile footer (with truncation if needed)
  const formatMobileAddress = (address) => {
    if (!address) return "";
    
    const fullAddress = formatFullAddress(address);
    
    // For mobile, show full address but truncate if too long
    if (fullAddress.length > 50) {
      return fullAddress.substring(0, 47) + "...";
    }
    
    return fullAddress;
  };

  // Function to format date for mobile footer
  const formatDateForMobile = (date) => {
    if (!date) return "";
    
    // Format: "Wed, Dec 4"
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = getDates();

  const getSlotsForSelectedDate = () => {
    if (!selectedDate) return [];
    const dateKey = selectedDate.toISOString().split('T')[0];
    return timeSlotsData[dateKey] || [];
  };

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

  if (cartItems.length === 0) {
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
        {/* Account Column - Desktop View */}
        <Col md={6} className="d-none d-md-block"
          style={{
            position: "sticky",
            top: "100px",
            border: "1px solid rgba(0,0,0,0.2)",
            borderRadius: "10px",
            padding: "15px",
            height: "fit-content",
            maxHeight: "400px",
            overflow: "hidden"
          }}
        >
          {isLoggedIn ? (
            <div>
              <div className="mb-3">
                <p className="fw-semibold" style={{fontSize:"15px"}}>
                  <ImLocation style={{fontSize:"18px", marginRight: "8px"}}/>
                  Send booking details to
                </p>
                <p style={{marginTop:"-12px", marginLeft: "28px", fontSize: "14px" }}>
                 {userInfo?.phone || "9787081119"}
                </p>
              </div>
              
              <hr />
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <p className="fw-semibold mb-0" style={{fontSize:"15px"}}>
                    <ImLocation style={{fontSize:"18px", marginRight: "8px"}}/>
                    Address
                  </p>
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
                <div style={{ marginLeft: "28px",marginTop:"-12px" }}>
                  {selectedAddress ? (
                    <div>
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <p className="mb-2 fw-semibold" style={{ fontSize: "12px", color: "#6b6b6bff" }}>
                            {getAddressIcon(selectedAddress.addressType)}
                            {getAddressTypeText(selectedAddress.addressType)} • {formatMobileAddress(selectedAddress)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      className="butn w-100" 
                      style={{height:"40px"}}
                      onClick={handleAddress}
                    >
                      Select an address
                    </Button>
                  )}
                </div>
              </div>
              
              <hr />
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <p className="fw-semibold mb-0" style={{fontSize:"15px"}}>
                    <FaClock style={{fontSize:"16px", marginRight: "8px"}}/>
                    Slot
                  </p>
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
                  <div style={{ marginLeft: "28px",marginTop:"-12px" }}>
                    <p className="text-muted mb-2" style={{fontSize:"13px"}}>
                      {selectedDate && formatDateDisplay(selectedDate)} - {selectedSlot.time}
                      {selectedSlot.extraCharge > 0 && (
                        <span className="text-warning ms-2">+{formatPrice(selectedSlot.extraCharge)} extra</span>
                      )}
                    </p>
                  </div>
                ) : (
                  <div style={{ marginLeft: "28px" }}>
                    <Button 
                      className="butn w-100" style={{height:"40px"}} 
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
              
              <div>
                <p className="fw-semibold" style={{fontSize:"15px"}}>
                  <MdPayments style={{fontSize:"20px", marginRight: "8px"}}/>
                  Payment Method
                </p>
                {selectedSlot && selectedAddress && (
                  <div style={{ marginLeft: "28px" }}>
                    // Update button states
<Button
  className="butn fw-bold w-100 p-3"
  disabled={!canPlaceOrder()}
  onClick={processPayment}
>
  {!isLoggedIn ? "Login to Continue" : 
   !selectedAddress ? "Select Address" : 
   !selectedSlot ? "Select Time Slot" : 
   "Place an order"}
</Button>
                  </div>
                )}
                <br />
                <div style={{backgroundColor:"#e1e1e1ff",height:"40px",padding:"10px"}} className="border rounded text-center">
                  <p className="text-muted" style={{fontSize:"12px"}}>By proceeding, you agree to our <a className="fw-semibold" style={{color:"black"}} href="">T&C</a>,<a className="fw-semibold" style={{color:"black"}}  href="">Privacy</a> and <a className="fw-semibold" style={{color:"black"}} href="">Cancellation Policy</a> </p>
                </div>
              </div>
            </div>
          ) : (
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
            carts={cartItems}
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
                carts={cartItems}
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
          <div className="d-none position-sticky bottom-0 d-md-block mt-4 p-3" style={{backgroundColor:"white"}}>
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
                {/* Step 1: No Address Selected - Show Address Button */}
                {!selectedAddress && (
                  <Col xs={12}>
                    <Button 
                      className="butn w-100 fw-bold" 
                      style={{ height: "48px", fontSize: "16px", borderRadius: "8px" }} 
                      onClick={handleAddress}
                    >
                      Add address
                    </Button>
                  </Col>
                )}

                {/* Step 2: Address Selected, No Slot - Show Slot Button */}
                {selectedAddress && !selectedSlot && (
                  <Col xs={12}>
                    <div className="d-flex justify-content-between align-items-center mb-2 p-2">
                      <div style={{ flex: 1 }}>
                        <div className="d-flex align-items-center mb-1">
                          {getAddressIcon(selectedAddress.addressType)}
                          <span style={{ fontSize: "14px" }}>
                            {getAddressTypeText(selectedAddress.addressType)} - 
                          </span>
                          <p className="mb-0" style={{ fontSize: "12px", lineHeight: "1.3" }}>
                            {formatMobileAddress(selectedAddress)}
                          </p>
                        </div>
                      </div>
                      <Button 
                        className="p-1 border-0" 
                        style={{ backgroundColor: "transparent", minWidth: "36px" }}
                        onClick={() => handleAddress(true)}
                      >
                        <MdEdit style={{ color: "#000000ff", fontSize: "18px" }} />
                      </Button>
                    </div>
                    <Button 
                      className="butn w-100 fw-bold" 
                      style={{ height: "48px", fontSize: "16px", borderRadius: "8px" }} 
                      onClick={() => setShowSlotModal(true)}
                    >
                      Select Time Slot
                    </Button>
                  </Col>
                )}

                {/* Step 3: Both Address & Slot Selected - Show Payment Button */}
                {selectedAddress && selectedSlot && (
                  <Col xs={12}>
                    {/* Address Section */}
                    <div className="d-flex justify-content-between align-items-center mb-2 p-2" style={{borderBottom:"1px dashed"}}>
                      <div style={{ flex: 1 }}>
                        <div className="d-flex align-items-center mb-1">
                          {getAddressIcon(selectedAddress.addressType)}
                          <span style={{ fontSize: "14px" }}>
                            {getAddressTypeText(selectedAddress.addressType)} - 
                          </span>
                          <p className="mb-0" style={{ fontSize: "12px", lineHeight: "1.3" }}>
                            {formatMobileAddress(selectedAddress)}
                          </p>
                        </div>
                      </div>
                      <Button 
                        className="p-1 border-0" 
                        style={{ backgroundColor: "transparent", minWidth: "36px" }}
                        onClick={() => handleAddress(true)}
                      >
                        <MdEdit style={{ color: "#000000ff", fontSize: "18px" }} />
                      </Button>
                    </div> 

                    {/* Slot Section */}
                    <div className="d-flex justify-content-between align-items-center  p-2" style={{borderBottom:"3px solid #d4d1d1ff"}}>
                      <div style={{ flex: 1 }}>
                        <div >
                            <p style={{ fontSize: "12px" }}>  <LuClock3 className="fw-bold" style={{ marginRight: "4px", fontSize: "16px" }} />
                              {selectedDate && formatDateForMobile(selectedDate)} - {selectedSlot.time} 
                            </p>
                        </div>
                      </div>
                      <Button 
                        className="p-1 border-0" 
                        style={{ backgroundColor: "transparent", minWidth: "36px" }}
                        onClick={() => setShowSlotModal(true)}
                      >
                        <MdEdit style={{ color: "#000000ff", fontSize: "18px" }} />
                      </Button>
                    </div>

                    {/* Amount and Pay Button */}
                    <div className=" mb-2 p-2">
                    <Button
                      className="butn fw-bold w-100 p-3"
                      disabled={!canPlaceOrder()}
                      onClick={processPayment}
                    >
                      {!isLoggedIn ? "Login to Continue" : 
                      !selectedAddress ? "Select Address" : 
                      !selectedSlot ? "Select Time Slot" : 
                      "Place an order"}
                    </Button>
                    </div> <div className="border rounded text-center" style={{height:"24px",backgroundColor:"#eaeaeaff"}}>
                      <p>By proceedng, you agree to our <a href="" style={{color:"black"}}>T&C</a>,<a href="" style={{color:"black"}}>Privacy</a> and <a href="" style={{color:"black"}}>Cancellation Policy</a></p></div>
                  </Col>
                )}
              </>
            ) : (
              /* Not Logged In - Show Login Button */
              <Col xs={12}>
                <Button 
                  className="butn w-100 fw-bold" 
                  style={{ height: "48px", fontSize: "16px", borderRadius: "8px" }} 
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
          refresh={refreshCart}
        />
      )}

      {/* Account Modal for Login/Profile */}
      <AccountModal
        show={showAccountModal || showBookingsModal}
        totalPrice={totalPrice}
        onHide={() => {
        setShowAccountModal(false);
        setShowBookingsModal(false);
        }}
        initialView={showLoginView ? "login" : "main"}
      />

      {/* Time Slot Selection Modal */}
      <Modal 
        show={showSlotModal} 
        onHide={() => setShowSlotModal(false)} 
        centered 
        size="lg"
        backdrop="static"
      >
        <Modal.Header className="border-bottom-0 pb-0" style={{ padding: '16px 20px 8px 20px' }}>
          <div className="w-100">
            <div className="d-flex justify-content-between align-items-start">
              <div className="flex-grow-1">
                <h5 className="fw-semibold mb-1" style={{ fontSize: '18px', color: '#333' }}>
                  When should the professional arrive?
                </h5>
                <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                  Service will take approx. 5hrs & 40 mins
                </p>
              </div>
              <Button type="button" onClick={() => setShowSlotModal(false)} className="position-absolute border-0 justify-content-center closebtn p-0">X</Button>
            </div>
          </div>
        </Modal.Header>
        
        <Modal.Body style={{ 
          padding: '16px 20px',
          maxHeight: '50vh',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          

          {/* Date Selection Row */}
          <div className="mb-4">
            <div className="d-flex gap-2 overflow-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="d-flex gap-2 overflow-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {dates.map((date, index) => (
                  <Button
                    key={index}
                    variant={selectedDate?.toDateString() === date.toDateString() ? "primary" : "outline-secondary"}
                    className="flex-shrink-0"
                    style={{ 
                      minWidth: "80px", 
                      fontSize: "13px",
                      borderRadius: "8px",
                      borderWidth: "2px"
                    }}
                    onClick={() => handleDateSelect(date)}
                  >
                    {formatDateDisplay(date)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Time Slots */}
          <div className="mb-2">
            <h6 className="fw-semibold mb-2" style={{ fontSize: "15px", color: '#333' }}>
              Select start time of service
            </h6>
            {selectedDate ? (
              <Row className="g-4">
                {getSlotsForSelectedDate().map(slot => (
                  <Col xs={2} key={slot.id} className="mb-2">
                    <div 
                      className={`p-2 border rounded text-center position-relative ${
                        selectedSlot?.id === slot.id ? 'border-primary' : 'border-secondary'
                      } ${!slot.available ? 'bg-light text-muted' : ''}`}
                      style={{ 
                        cursor: slot.available ? 'pointer' : 'not-allowed',
                        backgroundColor: !slot.available ? '#f8f9fa' : 
                                        selectedSlot?.id === slot.id ? '#f0ebff' : '#ffffff',
                        minHeight: '20px',
                        fontSize: "12px",
                        borderRadius: "8px",
                        borderWidth: selectedSlot?.id === slot.id ? '2px' : '1px',
                        borderColor: selectedSlot?.id === slot.id ? '#8b5cf6' : '#dee2e6'
                      }}
                      onClick={() => slot.available && handleSlotSelect(slot)}
                    >
                      {slot.extraCharge > 0 && (
                        <Badge 
                          bg={selectedSlot?.id === slot.id ? "primary" : "warning"}
                          text={selectedSlot?.id === slot.id ? "white" : "dark"}
                          className="position-absolute top-0 start-100 translate-middle"
                          style={{ 
                            fontSize: '0.6rem',
                            fontWeight: '600',
                            padding: '3px 5px'
                          }}
                        >
                          +₹{slot.extraCharge}
                        </Badge>
                      )}
                      
                      <p className="mb-0 fw-semibold" style={{ 
                        fontSize: "11px",
                        color: selectedSlot?.id === slot.id ? '#8b5cf6' : 
                              !slot.available ? '#6c757d' : '#374151'
                      }}>
                        {slot.time}
                      </p>
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="text-center py-3">
                <p className="text-muted" style={{ fontSize: "13px" }}>
                  Please select a date to view available slots
                </p>
              </div>
            )}
          </div>
        </Modal.Body>
        
        <Modal.Footer className="border-top-0" style={{ 
          padding: '12px 20px 16px 20px',
          backgroundColor: '#f8f9fa',
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '12px'
        }}>
          <div className="w-100">
            <Button 
              className="butn w-100" 
              onClick={() => setShowSlotModal(false)}
              disabled={!selectedSlot}
              style={{ 
                fontSize: "13px",
                height: "40px",
                padding: "6px 20px",
                borderRadius: "6px",
                fontWeight: "600"
              }}
            >
              Proceed to checkout
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
      
 
    </div>
  );
}

export default CartPage;