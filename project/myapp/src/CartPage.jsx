import { useState, useEffect } from "react";
import CartBlock from "./CartBlock";
import Salon1modal from "./Salon1modal";
import { Row, Col, Button, Container, Form, Modal, Card, Badge } from "react-bootstrap";
import FrequentlyAddedCarousel from "./FrequentlyAddedCarousel";
import { TbCirclePercentageFilled } from "react-icons/tb";
import { MdKeyboardArrowRight, MdPayments } from "react-icons/md";
import AccountModal from "./AccountModal";
import { ImLocation } from "react-icons/im";
import { FaClock } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { MdHomeFilled } from "react-icons/md";
import { MdWork } from "react-icons/md";
import { MdLocationOn } from "react-icons/md";
import { LuClock3 } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useAuth, useCart } from "./hooks";
import { useDispatch } from 'react-redux';
import { syncCartWithLocalStorage } from './store';

function CartPage() {
  const dispatch = useDispatch();
  const { items: cartItems, clear: clearCart, updateItem, removeItem } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

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
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [showConfirmAddressModal, setShowConfirmAddressModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleViewBookings = () => {
    setShowBookingsModal(true);
  };

  // Enhanced clearCartFromDatabase function
  const clearCartFromDatabase = async () => {
    try {
      // If user is not authenticated, we can't clear from DB by email
      if (!user?.email) {
        console.log("User not authenticated, skipping DB cart clearing");
        return;
      }

      const customerEmail = user.email;

      // First, get all cart items for this user
      const response = await fetch(`http://localhost:5000/api/cart/${customerEmail}`);

      if (response.ok) {
        const data = await response.json();
        const userCartItems = data.cartItems || data.carts || [];

        console.log(`Found ${userCartItems.length} cart items to delete for ${customerEmail}`);

        // Delete each cart item
        const deletePromises = userCartItems.map(async (item) => {
          try {
            await fetch(`http://localhost:5000/api/carts/${item._id}`, {
              method: "DELETE"
            });
            console.log(`Deleted cart item: ${item._id}`);
          } catch (error) {
            console.error(`Failed to delete cart item ${item._id}:`, error);
          }
        });

        await Promise.all(deletePromises);
        console.log(`Successfully cleared ${userCartItems.length} cart items from database`);
      } else {
        console.log("No cart items found or error fetching cart items");
      }
    } catch (error) {
      console.error("Error clearing cart from database:", error);
      // Don't throw error, just log it
    }
  };

  // Debug function
  const debugCartState = () => {
    console.log("=== CART DEBUG INFO ===");
    console.log("Redux cart items:", cartItems);
    console.log("Redux cart count:", cartItems.length);
    console.log("LocalStorage cart:", JSON.parse(localStorage.getItem('cartItems') || '[]'));
    console.log("User email:", user?.email);
    console.log("Is authenticated:", isAuthenticated);
    console.log("=========================");
  };

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
    if (!isAuthenticated) {
      alert("Please login to place an order");
      setShowAccountModal(true);
      setShowLoginView(true);
      return;
    }

    // Validate user info
    if (!user || !user.email) {
      alert("User information is incomplete. Please login again.");
      setShowAccountModal(true);
      setShowLoginView(true);
      return;
    }

    // Check if cart is empty
    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add services first.");
      return;
    }

    // Debug cart state before processing
    debugCartState();

    setIsProcessing(true);

    try {
      // Calculate totals
      const itemTotal = calculateItemTotal();
      const tax = calculateTax();
      const tip = calculateTip();
      const slotExtraCharge = calculateSlotExtraCharge();
      const totalPrice = itemTotal + tax + tip + slotExtraCharge;

      // Prepare booking data
      const bookingData = {
        customerId: user.id || user.customerId || `customer_${user.email}`,
        customerEmail: user.email,
        customerName: user.name || "Customer",
        customerPhone: user.phone || "9787081119",
        customerCity: user.city || "",
        serviceName: cartItems.length > 0 ? cartItems.map(item => item.title).join(', ') : "Beauty Services",
        servicePrice: totalPrice.toString(),
        originalPrice: itemTotal.toString(),
        address: selectedAddress,
        scheduledDate: selectedDate ? selectedDate.toISOString() : new Date().toISOString(),
        scheduledTime: selectedSlot.time,
        // Use cartItems instead of mapping to items for consistency
        cartItems: cartItems.map(item => ({
          productId: item.productId || item._id,
          name: item.title || item.name,
          price: typeof item.price === 'string'
            ? item.price
            : `₹${item.price}`,
          count: item.count || 1,
          quantity: item.count || 1
        })),
        slotExtraCharge: slotExtraCharge,
        tipAmount: tip,
        taxAmount: tax,
        paymentMethod: "UPI",
        status: "Confirmed",
        paymentStatus: "Paid"
      };

      console.log("📤 Sending booking data to server:", bookingData);

      // Send booking to server
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();
      console.log("📥 Server response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to create booking");
      }

      // Clear cart after successful booking - DO THIS SYNCHRONOUSLY
      try {
        // Show success message BEFORE clearing cart so UI background remains visible
        const successMessage = `✅ Order placed successfully!\n`;

        alert(successMessage);

        console.log("Starting cart clearing process...");

        // 1. Clear from Redux store first (this also clears localStorage)
        clearCart();
        console.log("✅ Cart cleared from Redux store and localStorage");

        // 2. Clear from database
        await clearCartFromDatabase();
        console.log("✅ Cart cleared from database");

        // 3. Clear address from localStorage
        localStorage.removeItem('selectedAddress');

        // 4. Force a cart sync with localStorage
        window.dispatchEvent(new CustomEvent('cartCleared'));
        window.dispatchEvent(new CustomEvent('cartUpdated'));

        // 5. Dispatch action to sync cart state
        dispatch(syncCartWithLocalStorage());

        // 6. Force update localStorage
        localStorage.setItem('cartItems', JSON.stringify([]));

        console.log("✅ All cart clearing operations completed");

        // Debug cart state after clearing
        debugCartState();

        // Alert was here, moved up

        // Reset form state
        setSelectedAddress(null);
        setSelectedSlot(null);
        setSelectedDate(new Date());
        setSelectedTip(0);
        setCustomTip("");

        setTimeout(() => {
          navigate('/');
        }, 100);

      } catch (clearError) {
        console.error("Error clearing cart:", clearError);
        // Even if cart clearing fails, still show success and redirect
        const fallbackMessage = `✅ Order placed successfully!\n
Your Order ID: ${result.booking?._id || result._id || result.bookingId}\n
Amount Paid: ₹${totalPrice}\n
Note: There was an issue clearing your cart. Please refresh the page manually.`;

        alert(fallbackMessage);

        // Force clear localStorage as backup
        localStorage.setItem('cartItems', JSON.stringify([]));
        navigate('/');
      }

    } catch (error) {
      console.error("❌ Error processing order:", error);
      alert(`❌ Order failed: ${error.message}\n\nPlease try again or contact support.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Test function for debugging
  const testBookingCreation = async () => {
    console.log("🔍 Testing booking creation...");

    const testData = {
      customerId: "test_customer_123",
      customerEmail: "test@example.com",
      customerName: "Test Customer",
      customerPhone: "9876543210",
      customerCity: "Test City",
      serviceName: "Test Service",
      servicePrice: "1000",
      originalPrice: "1000",
      address: {
        doorNo: "123",
        mainText: "Test Street",
        subText: "Test Area",
        addressType: "home"
      },
      scheduledDate: new Date().toISOString(),
      scheduledTime: "10:00 AM",
      items: [{
        name: "Test Item",
        quantity: 1,
        price: "1000"
      }],
      slotExtraCharge: 0,
      tipAmount: 0,
      taxAmount: 0,
      paymentMethod: "UPI",
      status: "Confirmed"
    };

    try {
      console.log("📤 Sending test data:", testData);

      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      });

      const result = await response.json();
      console.log("📥 Test response:", result);

      if (response.ok) {
        console.log("✅ Test booking created successfully!");
        return true;
      } else {
        console.error("❌ Test failed:", result.error);
        return false;
      }
    } catch (error) {
      console.error("❌ Test error:", error);
      return false;
    }
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
    console.log("🔍 CartPage Auth State:", {
      isAuthenticated,
      user,
      customerToken: localStorage.getItem('customerToken'),
      customerInfo: localStorage.getItem('customerInfo'),
      pathname: window.location.pathname
    });

    // Only listen for auth changes if needed
    const handleAuthChange = () => {
      console.log("CartPage received auth change event");
    };

    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchAddedItems();

    const savedAddress = localStorage.getItem('selectedAddress');
    if (savedAddress) {
      try {
        setSelectedAddress(JSON.parse(savedAddress));
      } catch (error) {
        console.error("Error parsing saved address:", error);
      }
    }

    setSelectedDate(new Date());
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedAddress = localStorage.getItem('selectedAddress');
      if (savedAddress) {
        try {
          setSelectedAddress(JSON.parse(savedAddress));
        } catch (error) {
          console.error("Error parsing saved address:", error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const interval = setInterval(() => {
      const savedAddress = localStorage.getItem('selectedAddress');
      if (savedAddress && !selectedAddress) {
        try {
          setSelectedAddress(JSON.parse(savedAddress));
        } catch (error) {
          console.error("Error parsing saved address:", error);
        }
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [selectedAddress]);

  const safePrice = (price) => {
    if (!price) return 0;
    const priceStr = price.toString();
    const cleaned = priceStr.replace(/[₹,]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

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
          updateItem(existingItem._id || existingItem.productId, existingItem.count + 1);
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
            updateItem(existingItem._id || existingItem.productId, existingItem.count - 1);
          } else {
            await fetch(`http://localhost:5000/api/carts/${existingItem._id}`, {
              method: "DELETE"
            });
            removeItem(existingItem._id || existingItem.productId);
          }
        }
      }
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

  const getAddressIcon = (addressType) => {
    switch (addressType) {
      case 'home': return <MdHomeFilled style={{ marginRight: "4px", fontSize: "16px", verticalAlign: "text-bottom" }} />;
      case 'work': return <MdWork style={{ marginRight: "4px", fontSize: "16px", verticalAlign: "text-bottom" }} />;
      default: return <MdLocationOn style={{ marginRight: "4px", fontSize: "16px", verticalAlign: "text-bottom" }} />;
    }
  };

  const getAddressTypeText = (addressType) => {
    switch (addressType) {
      case 'home': return 'Home';
      case 'work': return 'Work';
      default: return 'Other';
    }
  };

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

  const formatMobileAddress = (address) => {
    if (!address) return "";

    const fullAddress = formatFullAddress(address);

    if (fullAddress.length > 50) {
      return fullAddress.substring(0, 47) + "...";
    }

    return fullAddress;
  };

  const formatDateForMobile = (date) => {
    if (!date) return "";

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

  const canPlaceOrder = () => {
    if (!isAuthenticated) {
      return false;
    }
    if (!selectedAddress) {
      return false;
    }
    if (!selectedSlot) {
      return false;
    }
    if (cartItems.length === 0) {
      return false;
    }
    if (!user?.email) {
      return false;
    }
    return true;
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
              style={{ padding: "10px", width: "33%" }}
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
          <Button
            variant="outline-warning"
            className="mt-3"
            onClick={testBookingCreation}
          >
            Test Booking API
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="container mt-4">
      <Row>
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
          {isAuthenticated ? (
            <div>
              <div className="mb-3">
                <p className="fw-semibold" style={{ fontSize: "15px" }}>
                  <ImLocation style={{ fontSize: "18px", marginRight: "8px" }} />
                  Send booking details to
                </p>
                <p style={{ marginTop: "-12px", marginLeft: "28px", fontSize: "14px" }}>
                  {user?.phone || "9787081119"}
                </p>
              </div>

              <hr />

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <p className="fw-semibold mb-0" style={{ fontSize: "15px" }}>
                    <ImLocation style={{ fontSize: "18px", marginRight: "8px" }} />
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
                </div><p></p>
                <div style={{ marginLeft: "28px", marginTop: "-12px" }}>
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
                      style={{ height: "40px" }}
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
                  <p className="fw-semibold mb-0" style={{ fontSize: "15px" }}>
                    <FaClock style={{ fontSize: "16px", marginRight: "8px" }} />
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
                  <div style={{ marginLeft: "28px", marginTop: "-12px" }}>
                    <p className="text-muted mb-2" style={{ fontSize: "13px" }}>
                      {selectedDate && formatDateDisplay(selectedDate)} - {selectedSlot.time}
                      {selectedSlot.extraCharge > 0 && (
                        <span className="text-warning ms-2">+{formatPrice(selectedSlot.extraCharge)} extra</span>
                      )}
                    </p>
                  </div>
                ) : (
                  <div style={{ marginLeft: "28px" }}>
                    <Button
                      className="butn w-100" style={{ height: "40px" }}
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
                <p className="fw-semibold" style={{ fontSize: "15px" }}>
                  <MdPayments style={{ fontSize: "20px", marginRight: "8px" }} />
                  Payment Method
                </p>
                {selectedSlot && selectedAddress && (
                  <div style={{ marginLeft: "28px" }}>
                    <Button
                      className="butn fw-bold w-100 p-3"
                      disabled={!canPlaceOrder() || isProcessing}
                       onClick={() => {
                         setShowConfirmAddressModal(false);
                         processPayment(); }}
                    >
                      {isProcessing ? "Processing..." :
                        !isAuthenticated ? "Login to Continue" :
                          !selectedAddress ? "Select Address" :
                            !selectedSlot ? "Select Time Slot" :
                              "Place an order"}
                    </Button>
                  </div>
                )}
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

        <Col xs={12} md={6}>
          <CartBlock
            formatPrice={formatPrice}
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

          <div style={{ border: "1px solid #d9d9d9", borderRadius: "8px", marginTop: "15px" }}>
            <div style={{ padding: "12px" }}>
              <Row className="align-items-center">
                <Col xs={8}>
                  <h5 className="fw-semibold mb-1" style={{ fontSize: "14px" }}>
                    <TbCirclePercentageFilled style={{ color: "rgb(22, 108, 52)", fontSize: "20px" }} />
                    Coupons and offers
                  </h5>
                </Col>
                <Col xs={4} className="text-end">
                  <Button
                    className="border-0 fw-semibold"
                    style={{ backgroundColor: "transparent", color: "#6e42e5", fontSize: "13px", padding: "4px 8px" }}
                  >
                    5 offers <MdKeyboardArrowRight style={{ fontSize: "18px" }} />
                  </Button>
                </Col>
              </Row>
            </div>
          </div>

          <div style={{ border: "1px solid #d9d9d9", borderRadius: "8px", marginTop: "15px" }}>
            <div style={{ padding: "12px" }}>
              <h5 className="fw-semibold mb-2">Payment summary</h5>
              <Row className="mb-1">
                <Col><p style={{ fontSize: "14px" }}>Item total</p></Col>
                <Col className="text-end"><p style={{ fontSize: "14px" }}>{formatPrice(itemTotal)}</p></Col>
              </Row>
              <Row className="mb-1">
                <Col><p style={{ textDecoration: "underline dotted", cursor: "pointer", fontSize: "14px" }} title="18% GST">Taxes and fee</p></Col>
                <Col className="text-end"><p style={{ fontSize: "14px" }}>{formatPrice(tax)}</p></Col>
              </Row>

              {slotExtraCharge > 0 && (
                <Row className="mb-1">
                  <Col><p style={{ fontSize: "14px" }}>Evening slot charge</p></Col>
                  <Col className="text-end"><p style={{ fontSize: "14px" }}>{formatPrice(slotExtraCharge)}</p></Col>
                </Row>
              )}

              {tip > 0 && (
                <Row className="mb-1">
                  <Col><p style={{ fontSize: "14px" }}>Tip</p></Col>
                  <Col className="text-end"><p style={{ fontSize: "14px" }}>{formatPrice(tip)}</p></Col>
                </Row>
              )}
              <hr />
              <Row className="mb-1">
                <Col><p className="fw-semibold" style={{ fontSize: "14px" }}>Total price</p></Col>
                <Col className="text-end"><p className="fw-semibold" style={{ fontSize: "14px" }}>{formatPrice(totalPrice)}</p></Col>
              </Row>
              <hr />
              <Row className="mb-1">
                <Col><p className="fw-semibold" style={{ fontSize: "14px" }}>Amount to pay</p></Col>
                <Col className="text-end"><p className="fw-semibold" style={{ fontSize: "14px" }}>{formatPrice(totalPrice)}</p></Col>
              </Row>
              <hr />

              <div className="mt-2">
                <p className="fw-semibold mb-1" style={{ fontSize: "14px" }}>Add a tip to thank the professional</p>
                <div className="d-flex gap-2 mb-2 align-items-center flex-wrap">
                  {[50, 75, 100].map(amount => (
                    <Button
                      key={amount}
                      onClick={() => handleTipSelect(amount)}
                      className="edit fw-semibold"
                      style={{
                        backgroundColor: selectedTip === amount ? "#f0ebff" : "white",
                        borderColor: selectedTip === amount ? "#6e42e5" : "#e0e0e0",
                        color: selectedTip === amount ? "#6e42e5" : "black",
                        borderRadius: "6px",
                        padding: "6px 12px",
                        fontSize: "13px",
                        border: `1px solid ${selectedTip === amount ? "#6e42e5" : "#e0e0e0"}`
                      }}
                    >
                      ₹{amount}
                    </Button>
                  ))}
                  {showCustomTip ? (
                    <div className="d-flex gap-2 align-items-center">
                      <span className="fw-semibold" style={{ fontSize: "14px" }}>₹</span>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        value={customTip}
                        onChange={handleCustomTipChange}
                        style={{ width: "80px", padding: "6px 8px", border: "1px solid #6e42e5", borderRadius: "6px", fontSize: "13px" }}
                        autoFocus
                        min="25"
                      />
                      <Button
                        variant="primary"
                        onClick={handleCustomTipSubmit}
                        style={{ borderRadius: "6px", padding: "6px 12px", fontSize: "13px", backgroundColor: "#6e42e5", borderColor: "#6e42e5" }}
                      >
                        Add
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleCustomTipClick}
                      className="edit fw-semibold"
                      style={{
                        backgroundColor: customTip ? "#f0ebff" : "white",
                        borderColor: customTip ? "#6e42e5" : "#e0e0e0",
                        color: customTip ? "#6e42e5" : "black",
                        borderRadius: "6px",
                        padding: "6px 12px",
                        fontSize: "13px",
                        border: `1px solid ${customTip ? "#6e42e5" : "#e0e0e0"}`
                      }}
                    >
                      {customTip ? `₹${customTip}` : "Custom"}
                    </Button>
                  )}
                </div>
                <p className="text-muted small mb-2" style={{ fontSize: "12px" }}>100% of your tip goes to the professional.</p>
                {(tip > 0 || customTip) && (
                  <Button variant="link" className="p-0 text-danger" style={{ fontSize: "12px" }} onClick={handleRemoveTip}>Remove tip</Button>
                )}
              </div>
            </div>
          </div>

          <div className="d-none position-sticky bottom-0 d-md-block mt-4 p-3" style={{ backgroundColor: "white" }}>
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

      <div className="d-md-none position-fixed bottom-0 start-0 end-0 bg-white border-top shadow-lg py-3"
        style={{ zIndex: 1050 }}>
        <Container>
          <Row className="align-items-center">
            {isAuthenticated ? (
              <>
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

                {selectedAddress && !selectedSlot && (
                  <Col xs={12}>
                    <div className="d-flex justify-content-between align-items-center mb-2 p-2">
                      <div style={{ flex: 1 }}>
                        <div className="d-flex align-items-center mb-1">
                          {getAddressIcon(selectedAddress.addressType)}
                          <span style={{ fontSize: "14px" }}>
                            {getAddressTypeText(selectedAddress.addressType)} -
                          </span>
                          <p className="mb-0" style={{ fontSize: "11px", lineHeight: "1.3" }}>
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

                {selectedAddress && selectedSlot && (
                  <Col xs={12}>
                    <div className="d-flex justify-content-between align-items-center mb-2 p-2" style={{ borderBottom: "1px dashed" }}>
                      <div style={{ flex: 1 }}>
                        <div className="d-flex align-items-center mb-1">
                          {getAddressIcon(selectedAddress.addressType)}
                          <span style={{ fontSize: "14px" }}>
                            {getAddressTypeText(selectedAddress.addressType)} -
                          </span>
                          <p className="mb-0" style={{ fontSize: "11px", lineHeight: "1.3" }}>
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

                    <div className="d-flex justify-content-between align-items-center  p-2" style={{ borderBottom: "3px solid #d4d1d1ff" }}>
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

                    <div className=" mb-2 p-2">
                      <Button
                        className="butn fw-bold w-100 p-3"
                        disabled={!canPlaceOrder() || isProcessing}
                        onClick={() => setShowConfirmAddressModal(true)}
                      >
                        {isProcessing ? "Processing..." :
                          !isAuthenticated ? "Login to Continue" :
                            !selectedAddress ? "Select Address" :
                              !selectedSlot ? "Select Time Slot" :
                                "Place an order"}
                      </Button>
                    </div>
                  </Col>
                )}
              </>
            ) : (
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

      <div className="d-md-none" style={{ height: "80px" }}></div>

      {showModal && (
        <Salon1modal
          show={showModal}
          onHide={() => setShowModal(false)}
          selectedItem={selectedPkg}
        />
      )}

      <AccountModal
        show={showAccountModal || showBookingsModal}
        totalPrice={totalPrice}
        onHide={() => {
          setShowAccountModal(false);
          setShowBookingsModal(false);
        }}
        initialView={showLoginView ? "login" : "main"}
      />

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

        <Modal.Body
          tabIndex={0}
          style={{
            padding: '16px 20px',
            maxHeight: '50vh',
            overflowY: 'auto'
          }}>

          <div className="mb-4">
            <div className="d-flex gap-2 overflow-auto pb-2" tabIndex={0}>
              <div className="d-flex gap-2 overflow-auto" tabIndex={0}>
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

          <div className="mb-2">
            <h6 className="fw-semibold mb-2" style={{ fontSize: "15px", color: '#333' }}>
              Select start time of service
            </h6>
            {selectedDate ? (
              <Row className="g-4">
                {getSlotsForSelectedDate().map(slot => (
                  <Col xs={3} key={slot.id} className="mb-2">
                    <div
                      className={`p-2  border rounded text-center position-relative ${selectedSlot?.id === slot.id ? 'border-primary' : 'border-secondary'
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