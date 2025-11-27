import { useState, useEffect, useRef } from "react";
import { Modal, Button, Container, Row, Col, Form, Spinner, Alert, Card, Badge } from "react-bootstrap";
import { LuNotepadText } from "react-icons/lu";
import { IoMdHelpCircleOutline, IoMdLogOut } from "react-icons/io";
import { MdAccountCircle, MdOutlineArrowForwardIos, MdLocationOn, MdEdit } from "react-icons/md";
import { BiLeftArrowAlt } from "react-icons/bi";
import { PiNotepadLight } from "react-icons/pi";
import { useAuth } from "./AuthContext";

function AccountModal({ show, onHide, initialView = "main" }) {
  const [logo1, setLogo1] = useState("");
  const [currentView, setCurrentView] = useState(initialView);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ code: "+91", name: "India" });
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isHuman, setIsHuman] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  
  // Profile editing states
  const [profileData, setProfileData] = useState({
    title: "Ms",
    name: "",
    email: "",
    phone: ""
  });
  const [isEditing, setIsEditing] = useState(false);

  const { isLoggedIn, userInfo, login, logout } = useAuth();
  const otpInputRefs = useRef([]);
  
  const countries = [
    { code: "+91", name: "India (+91)" },
    { code: "+65", name: "Singapore (+65)" },
    { code: "+971", name: "UAE (+971)"},
    { code: "+966", name: "KSA (+966)" },
  ];

  // Update the useEffect that loads profile data
useEffect(() => {
  if (isLoggedIn && show && userInfo.phone) {
    loadUserData();
    // Initialize profile data with user info
    setProfileData({
      title: userInfo.title || "Ms", // Add title to userInfo if available
      name: userInfo.name || "Suba shree",
      email: userInfo.email || "",
      phone: userInfo.phone || ""
    });
  }
}, [isLoggedIn, show, userInfo.phone, userInfo.name, userInfo.email, userInfo.title]);

  const loadUserData = async () => {
    try {
      setLoadingBookings(true);
      
      // Load bookings from server
      const bookingsResponse = await fetch(`http://localhost:5000/api/bookings/${userInfo.phone}`);
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData.bookings || []);
      }

      // Load plans from server
      const plansResponse = await fetch(`http://localhost:5000/api/plans/${userInfo.phone}`);
      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setPlans(plansData.plans || []);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Fetch logo
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/static-data");
        if (response.ok) {
          const data = await response.json();
          if (data && data.logo1) {
            const logoUrl = data.logo1.startsWith('http') 
              ? data.logo1
              : `http://localhost:5000${data.logo1}`;
            setLogo1(logoUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
        setLogo1("http://localhost:5000/assets/urban.png");
      }
    };

    fetchLogo();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (showOtpInput && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [showOtpInput, timer]);

  // Reset state when modal opens
  useEffect(() => {
    if (show) {
      setCurrentView(initialView);
      setShowOtpInput(false);
      setPhoneNumber("");
      setOtp(["","","","","",""]);
      setTimer(30);
      setCanResend(false);
      setIsHuman(false);
      setIsEditing(false);
    }
  }, [show, initialView]);

  const handleBack = () => {
    if (["profile-details", "bookings", "plans", "help", "about", "edit-profile"].includes(currentView)) {
      setCurrentView("main");
      setIsEditing(false);
    } else if (currentView !== "main") {
      setCurrentView("main");
      setShowOtpInput(false);
      setPhoneNumber("");
      setOtp(["","","","","",""]);
      setTimer(30);
      setCanResend(false);
      setIsHuman(false);
      setIsEditing(false);
    } else {
      onHide();
    }
  };

  const handleNavigation = (view) => {
    if(view ==="profile-details"){
      setCurrentView("edit-profile");
    }else{
      setCurrentView(view);
    }
  };

  // Human verification checkbox handler
  const handleHumanVerification = (e) => {
    setIsHuman(e.target.checked);
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (phoneNumber.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    if (!isHuman) {
      alert("Please verify that you are human");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          countryCode: selectedCountry.code
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setShowOtpInput(true);
      setTimer(30);
      setCanResend(false);
      
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // OTP handling functions
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }

      if (newOtp.every(digit => digit !== "") && index === 5) {
        handleOtpSubmit(newOtp.join(""));
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (enteredOtp = null) => {
    const otpValue = enteredOtp || otp.join("");
    
    if (otpValue.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          countryCode: selectedCountry.code,
          otp: otpValue
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify OTP");
      }

      login({
        name: data.user.name || "Suba shree",
        phone: data.user.phoneNumber,
        userId: data.user.id,
        email: data.user.email || ""
      });

      setCurrentView("main");
      setShowOtpInput(false);
      setOtp(["","","","","",""]);
      setTimer(30);
      setCanResend(false);
      setIsHuman(false);
      
      onHide();
      
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async (method) => {
    if (canResend) {
      try {
        const response = await fetch("http://localhost:5000/api/resend-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: phoneNumber,
            countryCode: selectedCountry.code,
            method: method
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to resend OTP");
        }

        setTimer(30);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        otpInputRefs.current[0]?.focus();
        
      } catch (error) {
        console.error("Error resending OTP:", error);
        alert(error.message);
      }
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentView("main");
    setBookings([]);
    setPlans([]);
    onHide();
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowCountryModal(false);
  };


const handleProfileSave = async () => {
  // Basic validation
  if (!profileData.name.trim()) {
    alert("Please enter your name");
    return;
  }

  if (!profileData.email.trim()) {
    alert("Please enter your email");
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(profileData.email)) {
    alert("Please enter a valid email address");
    return;
  }

  if (!profileData.phone.trim() || profileData.phone.length < 10) {
    alert("Please enter a valid phone number");
    return;
  }

  try {
    // Update user info in context
    login({
      ...userInfo,
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      title: profileData.title
    });

    // Here you can also make an API call to update the profile in your backend
    const response = await fetch("http://localhost:5000/api/update-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userInfo.userId,
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        title: profileData.title
      }),
    });

    if (response.ok) {
      setCurrentView("main");
      alert("Profile updated successfully!");
    } else {
      throw new Error("Failed to update profile");
    }
    
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Failed to update profile");
  }
};

 const handleProfileCancel = () => {
  // Reset to original user info values
  setProfileData({
    title: userInfo.title || "Ms",
    name: userInfo.name || "Suba shree",
    email: userInfo.email || "",
    phone: userInfo.phone || ""
  });
  setCurrentView("main");
};

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Render profile editing view (this is now the main profile page)
  const renderProfileEditView = () => (
    <div>
      <div className="text-center mb-4">
        <h6 className="fw-bold">My Profile</h6>
      </div>
      
      <Card className="border-0 shadow-sm">
        <Card.Body>
          {/* Title Selection - Capsule Format */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Title</label>
            <div className="d-flex gap-2 flex-wrap">
              {['Mr', 'Ms', 'Mrs', 'Dr'].map((title) => (
                <button
                  key={title}
                  type="button"
                  className={`btn ${
                    profileData.title === title 
                      ? 'btn-primary' 
                      : 'btn-outline-secondary'
                  } rounded-pill px-4 py-2`}
                  onClick={() => handleProfileChange('title', title)}
                  style={{
                    border: profileData.title === title ? 'none' : '1px solid #dee2e6',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {title}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name Field */}
          <div className="mb-3">
            <Form.Label className="fw-semibold">Full Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your full name"
              value={profileData.name}
              onChange={(e) => handleProfileChange('name', e.target.value)}
              className="py-2"
            />
          </div>

          {/* Email Field */}
          <div className="mb-3">
            <Form.Label className="fw-semibold">Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email address"
              value={profileData.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              className="py-2"
            />
          </div>

          {/* Phone Number Field - Also Editable */}
          <div className="mb-4">
            <Form.Label className="fw-semibold">Phone Number</Form.Label>
            <Form.Control
              type="tel"
              placeholder="Enter your phone number"
              value={profileData.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value.replace(/\D/g, ""))}
              className="py-2"
            />
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2 pt-3">
            <Button
              variant="outline-secondary"
              className="flex-grow-1 py-2"
              onClick={handleProfileCancel}
            >
              Cancel
            </Button>
            <Button
              className="butn flex-grow-1 py-2"
              onClick={handleProfileSave}
            >
              Save Changes
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );

  // Render bookings view
  const renderBookingsView = () => (
    <div>
      <h6 className="fw-bold mb-3">My Bookings</h6>
      
      {loadingBookings ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading your bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-5">
          <LuNotepadText size={48} className="text-muted mb-3" />
          <p className="text-muted">No bookings yet</p>
          <p className="small text-muted">Your completed orders will appear here</p>
        </div>
      ) : (
        <div className="d-grid gap-3">
          {bookings.map((booking) => (
            <Card key={booking._id} className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="fw-semibold mb-1">{booking.serviceName}</h6>
                  <span className={`badge ${
                    booking.status === 'Confirmed' ? 'bg-success' : 
                    booking.status === 'Completed' ? 'bg-primary' : 
                    booking.status === 'Cancelled' ? 'bg-danger' : 'bg-warning'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="mb-2">
                  <p className="small text-muted mb-1">
                    <strong>Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}
                  </p>
                  {booking.scheduledTime && (
                    <p className="small text-muted mb-1">
                      <strong>Time:</strong> {booking.scheduledTime}
                    </p>
                  )}
                  <p className="small text-muted mb-1">
                    <strong>Price:</strong> ₹{booking.servicePrice}
                  </p>
                </div>

                {booking.address && (
                  <div className="d-flex align-items-start mb-2">
                    <MdLocationOn size={14} className="text-muted mt-1 me-2" />
                    <p className="small text-muted mb-0 flex-grow-1">
                      {booking.address.doorNo}, {booking.address.landmark}
                    </p>
                  </div>
                )}

                {booking.items && booking.items.length > 0 && (
                  <div className="mt-2">
                    <p className="small fw-semibold mb-1">Services:</p>
                    {booking.items.map((item, index) => (
                      <p key={index} className="small text-muted mb-0">
                        • {item.name}
                      </p>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Render plans view
  const renderPlansView = () => (
    <div>
      <h6 className="fw-bold mb-3">My Plans</h6>
      
      {plans.length === 0 ? (
        <div className="text-center py-5">
          <PiNotepadLight size={48} className="text-muted mb-3" />
          <p className="text-muted">No active plans</p>
          <p className="small text-muted">Your subscription plans will appear here</p>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={() => {
              alert("Browse our plans to subscribe");
            }}
          >
            Browse Plans
          </Button>
        </div>
      ) : (
        <div className="d-grid gap-3">
          {plans.map((plan) => (
            <Card key={plan._id} className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="fw-semibold mb-1">{plan.name}</h6>
                  <span className="badge bg-primary">{plan.status}</span>
                </div>
                <p className="small text-muted mb-1">Validity: {plan.validity}</p>
                <p className="small text-muted mb-1">Services: {plan.services}</p>
                <p className="small fw-semibold mb-0">Price: ₹{plan.price}</p>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
  // Render login view with human verification
  const renderLoginView = () => (
    <div>
      <div>
        <img 
          src={logo1} 
          alt="UC Logo" 
          style={{ height: "30px", marginLeft: "10px" }} 
          onError={(e) => {
            e.target.src = "http://localhost:5000/assets/urban.png";
          }}
        /> 
      </div>
      <br />

      {!showOtpInput ? (
        <Form onSubmit={handlePhoneSubmit}>
          <div className="mb-3">
            <h5 className="fw-bold">Enter your phone number</h5>
            <p style={{fontSize:"13px"}}>We'll send you a text with a verification code. Standard tariff may apply</p>
            
            <div className="d-flex mb-3">
              <div>
                <div 
                  className="form-control d-flex justify-content-between align-items-center"
                  style={{ 
                    height: "45px", 
                    cursor: "pointer",
                    border: "1px solid #ced4da",
                    backgroundColor: "#fff",
                    width: "80px"
                  }}
                  onClick={() => setShowCountryModal(true)}
                >
                  <div>
                    <span style={{ fontWeight: "500" }}>{selectedCountry.code}</span>
                  </div>
                  <span className="text-muted">▼</span>
                </div>
              </div>
              
              <div>
                <Form.Control
                  type="tel"
                  placeholder="Phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  required
                  style={{ height: "45px", width: "290px" }}
                />
              </div>
            </div>

            {/* Human Verification Checkbox */}
            <Form.Check 
              type="checkbox"
              id="human-verification"
              label="I verify that I am a human"
              checked={isHuman}
              onChange={handleHumanVerification}
              className="mb-3"
            />
          </div>
          
          <Button 
            type="submit" 
            style={{height: "40px"}}
            className={`butn fw-semibold w-100 ${(isLoading || phoneNumber.length !== 10 || !isHuman) ? 'btn-secondary' : ''}`}
            disabled={isLoading || phoneNumber.length !== 10 || !isHuman}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sending OTP...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </Form>
      ) : (
        <div className="verification-view">
          <h5 className="fw-bold mb-3">Enter verification code</h5>
          <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
            A 6-digit code has been sent to<br />
            <span className="fw-semibold">{selectedCountry.code} {phoneNumber}</span>
          </p>

          <div className="d-flex justify-content-between mb-4">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <Form.Control
                key={index}
                ref={(el) => (otpInputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={otp[index]}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="text-center fw-bold"
                style={{
                  width: "45px",
                  height: "50px",
                  fontSize: "18px",
                  border: "2px solid #dee2e6",
                  borderRadius: "8px"
                }}
              />
            ))}
          </div>

          <div className="text-center mb-4">
            <p className="text-muted" style={{ fontSize: "14px" }}>
              {canResend ? (
                "Didn't receive the code?"
              ) : (
                `Resend code in ${timer} seconds`
              )}
            </p>
          </div>

          {canResend && (
            <div className="text-center mb-4">
              <p className="fw-semibold mb-2" style={{ fontSize: "14px" }}>Resend via:</p>
              <div className="d-flex justify-content-center gap-3">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleResendCode("SMS")}
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                >
                  SMS
                </Button>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => handleResendCode("WhatsApp")}
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                >
                  WhatsApp
                </Button>
              </div>
            </div>
          )}

          <Button 
            onClick={() => handleOtpSubmit()}
            className={`butn fw-semibold w-100 ${(isLoading || otp.join("").length !== 6) ? 'btn-secondary' : ''}`}
            disabled={isLoading || otp.join("").length !== 6}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>

          <div className="text-center">
            <button 
              type="button" 
              className="btn btn-link text-decoration-none p-0"
              onClick={() => {
                setShowOtpInput(false);
                setTimer(30);
                setCanResend(false);
                setOtp(["","","","","",""]);
                setIsHuman(false);
              }}
              style={{ fontSize: "14px" }}
            >
              Change phone number
            </button>
          </div>
        </div>
      )}

      <div className="text-center mt-4 pt-3 border-top">
        <p className="small text-muted">
          By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </p>
      </div>
    </div>
  );

  // Render main view after login
  const renderMainViewAfterLogin = () => (
    <div>
      <div 
        className="mb-4 p-3"
        style={{ cursor: "pointer" }}
        onClick={() => handleNavigation("profile-details")}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-semibold mb-1">Suba shree</h5>
            <p className="small text-muted mb-0">{userInfo.phone}</p>
          </div>
          <MdOutlineArrowForwardIos size={14} className="text-muted" />
        </div>
      </div>

      <div>
        {[
          { icon: <PiNotepadLight size={20} />, label: "My plans", view: "plans" },
          { icon: <LuNotepadText size={20} />, label: "Bookings", view: "bookings" },
          { icon: <IoMdHelpCircleOutline size={20} />, label: "Help Center", view: "help" },
        ].map((item, index) => (
          <div 
            key={index}
            className="d-flex justify-content-between align-items-center py-3 border-bottom"
            onClick={() => handleNavigation(item.view)}
            style={{ cursor: "pointer" }}
          >
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted">{item.icon}</span>
              <span className="fw-medium">{item.label}</span>
            </div>
            <MdOutlineArrowForwardIos size={14} className="text-muted" />
          </div>
        ))}
        
        <div 
          className="d-flex justify-content-between align-items-center py-3 border-bottom"
          onClick={() => handleNavigation("about")}
          style={{ cursor: "pointer" }}
        >
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted">
              <img 
                src={logo1 || "http://localhost:5000/assets/urban.png"} 
                alt="UC" 
                style={{ width: "20px", height: "20px", objectFit: "contain" }}
                onError={(e) => {
                  e.target.src = "http://localhost:5000/assets/urban.png";
                }}
              />
            </span>
            <span className="fw-medium">About Urban Company</span>
          </div>
          <MdOutlineArrowForwardIos size={14} className="text-muted" />
        </div>

        <div 
          className="d-flex justify-content-between align-items-center py-3 text-danger"
          onClick={handleLogout}
          style={{ cursor: "pointer" }}
        >
          <div className="d-flex align-items-center gap-3">
            <span className="text-danger">
              <IoMdLogOut size={20} />
            </span>
            <span className="fw-medium">Logout</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render help view
  const renderHelpView = () => (
    <div>
      <h6 className="fw-bold mb-3">Help Center</h6>
      <p className="text-muted">Contact support for any assistance:</p>
      <ul className="text-muted">
        <li>Email: support@urbancompany.com</li>
        <li>Phone: 1800-123-4567</li>
        <li>WhatsApp: +91-9876543210</li>
      </ul>
    </div>
  );

  // Render about view
  const renderAboutView = () => (
    <div>
      <h6 className="fw-bold mb-3">About Urban Company</h6>
      <p className="text-muted">
        Urban Company is a platform that helps customers book reliable home services like 
        beauty treatments, massages, cleaning, plumbing, carpentry, appliance repair, painting, etc.
      </p>
      <p className="text-muted">
        Our mission is to empower millions of professionals worldwide to deliver services at home 
        like never seen before.
      </p>
    </div>
  );

  const getViewTitle = () => {
    const titles = {
      main: isLoggedIn ,
      "edit-profile": "My Profile",
      login: "Login",
      about: "About Urban Company",
      bookings: "My Bookings",
      plans: "My Plans",
      help: "Help Center"
    };
    return titles[currentView] ;
  };

  
  const renderMainContent = () => {
    if (!isLoggedIn) {
      if (currentView === "login") {
        return renderLoginView();
      } else {
        return (
          <div>
            <div className="d-grid">
              <h5 className="fw-semibold">Profile</h5>
              <Button 
                className="butn fw-bold" 
                style={{width: "100px", height: "40px"}}
                onClick={() => handleNavigation("login")}
              >
                Login 
              </Button>
              
              <div>
                <div 
                  className="d-flex justify-content-between align-items-center py-3"
                  onClick={() => handleNavigation("about")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="text-muted">
                      <img 
                        src={logo1 || "http://localhost:5000/assets/urban.png"} 
                        alt="UC" 
                        style={{ width: "20px", height: "20px", objectFit: "contain" }}
                        onError={(e) => {
                          e.target.src = "http://localhost:5000/assets/urban.png";
                        }}
                      />
                    </span>
                    <span className="fw-medium">About Urban Company</span>
                  </div>
                  <MdOutlineArrowForwardIos size={14} className="text-muted" />
                </div>
              </div>
            </div>
          </div>
        );
      }
    } else {
      switch (currentView) {
        case "main":
          return renderMainViewAfterLogin();
        case "edit-profile":
          return renderProfileEditView();
        case "bookings":
          return renderBookingsView();
        case "plans":
          return renderPlansView();
        case "help":
          return renderHelpView();
        case "about":
          return renderAboutView();
        default:
          return renderMainViewAfterLogin();
      }
    }
  };

  return (
    <>
      <Modal 
        show={show} 
        onHide={onHide}
        centered
        fullscreen="sm-down"
      >
        <Modal.Header className="border-bottom-0">
          <Container fluid>
            <Row className="align-items-center">
              <Col xs={2}>
                <Button 
                  variant="link" 
                  className="p-0 text-dark"
                  onClick={handleBack}
                >
                  <BiLeftArrowAlt size={24} />
                </Button>
              </Col>
              <Col xs={8} className="text-center">
                <h5 className="fw-bold mb-0">{getViewTitle()}</h5>
              </Col>
              <Col xs={2}></Col>
            </Row>
          </Container>
        </Modal.Header>
        
        <Modal.Body>
          <Container fluid>
            {renderMainContent()}
          </Container>
        </Modal.Body>
      </Modal>

      <Modal 
        show={showCountryModal} 
        onHide={() => setShowCountryModal(false)}
        centered
        size="sm"
      >
        <Modal.Header className="border-bottom-0 pb-0">
          <Modal.Title className="w-100">
            <h6 className="fw-bold mb-0">Select a Country</h6>
          </Modal.Title>
          <Button 
            variant="close"
            className="p-1"
            onClick={() => setShowCountryModal(false)}
            aria-label="Close"
          />
        </Modal.Header>
        
        <Modal.Body className="pt-0">
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {countries.map((country, index) => (
              <div
                key={country.code}
                className={`py-2 ${
                  selectedCountry.code === country.code ? 'bg-light rounded' : ''
                } ${index !== countries.length - 1 ? 'border-bottom' : ''}`}
                style={{ 
                  cursor: "pointer",
                  transition: "background-color 0.2s ease"
                }}
                onClick={() => handleCountrySelect(country)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  if (selectedCountry.code !== country.code) {
                    e.target.style.backgroundColor = '#fff';
                  }
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-medium">{country.name}</span>
                  {selectedCountry.code === country.code && (
                    <span className="text-primary">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AccountModal;