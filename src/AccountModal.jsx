import { useState, useEffect, useRef } from "react";
import { Modal, Button, Container, Row, Col, Form } from "react-bootstrap";
import { CgProfile } from "react-icons/cg";
import { LuNotepadText } from "react-icons/lu";
import { IoMdHelpCircleOutline, IoMdLogOut } from "react-icons/io";
import { MdAccountCircle, MdOutlineArrowForwardIos } from "react-icons/md";
import { BiLeftArrowAlt } from "react-icons/bi";
import { PiNotepadLight } from "react-icons/pi";
import { useAuth } from "./AuthContext";

function AccountModal({ show, onHide }) {
  const [logo, setLogo] = useState("/assets/Uc.png");
  const [currentView, setCurrentView] = useState("main");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ code: "+91", name: "India", flag: "🇮🇳" });
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [resendMethod, setResendMethod] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("Ms");

  const { isLoggedIn, userInfo, login, logout } = useAuth();
  const otpInputRefs = useRef([]);
  
  const countries = [
    { code: "+91", name: "India (+91)" },
    { code: "+65", name: "Singapore (+65)" },
    { code: "+971", name: "UAE (+971)"},
    { code: "+966", name: "KSA (+966)" },
  ];

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/static-data");
        if (!response.ok) {
          throw new Error('Failed to fetch static data');
        }
        const data = await response.json();
        
        if (data && data.logo) {
          if (data.logo.startsWith('http')) {
            setLogo(data.logo);
          } else {
            setLogo(`http://localhost:5000${data.logo}`);
          }
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
        setLogo("/assets/Uc.png");
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

  const handleBack = () => {
    if (currentView === "profile-details" || currentView === "bookings" || currentView === "plans") {
      setCurrentView("main");
    } else if (currentView !== "main") {
      setCurrentView("main");
      setShowOtpInput(false);
      setPhoneNumber("");
      setOtp(["","","","","",""]);
      setTimer(30);
      setCanResend(false);
    } else {
      onHide();
    }
  };

  const handleNavigation = (view) => {
    setCurrentView(view);
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
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

      // Login successful - use global login function
      login({
        name: data.user.name,
        phone: data.user.phoneNumber
      });

      setCurrentView("main");
      setShowOtpInput(false);
      setOtp(["","","","","",""]);
      setTimer(30);
      setCanResend(false);
      
      // Close modal after successful login
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

        setResendMethod(method);
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
    onHide();
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowCountryModal(false);
  };

  // Reset state when modal opens
  useEffect(() => {
    if (show) {
      setCurrentView("main");
      setShowOtpInput(false);
      setPhoneNumber("");
      setOtp(["","","","","",""]);
      setTimer(30);
      setCanResend(false);
    }
  }, [show]);

  // Render login view
  const renderLoginView = () => (
    <div>
      <div>
        <img 
          src={logo} 
          alt="UC Logo" 
          style={{ height: "30px", marginLeft: "10px" }} 
          onError={(e) => {
            e.target.src = "/assets/Uc.png";
          }}
        /> 
      </div>
      <br />

      {!showOtpInput ? (
        <Form onSubmit={handlePhoneSubmit}>
          <div className="mb-3">
            <h5 className="fw-bold">Enter your phone number</h5>
            <p style={{fontSize:"13px"}}>We'll send you a text with a verification code. Standard tariff may apply</p>
            
            <div className="d-flex">
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
          </div>
          
          <Button 
            type="submit" 
            style={{height: "40px"}}
            className={`butn fw-semibold w-100 ${(isLoading || phoneNumber.length !== 10) ? 'btn-secondary' : ''}`}
            disabled={isLoading || phoneNumber.length !== 10}
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
        style={{ 
          cursor: "pointer",
        }}
        onClick={() => handleNavigation("profile-details")}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-semibold mb-1">{userInfo.name || "User"}</h5>
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
                src="/assets/Uc.png" 
                alt="UC" 
                style={{ width: "20px", height: "20px", objectFit: "contain" }}
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

  // Render profile details view
  const renderProfileDetailsView = () => (
    <div>
      <h5 className="fw-bold mb-4">My Profile</h5>
      <Form>
        <Form.Group className="mb-4 position-relative">
          <div className="position-absolute top-0 start-0 mt-1 ms-3" style={{ zIndex: 5 }}>
            <span className="small text-muted bg-white " style={{marginLeft:"82px"}}>Name</span>
          </div>
          <div className="d-flex gap-2 align-items-center border rounded p-2" style={{ height: "55px", marginTop: "8px" }}>
            <div 
              className="d-flex border rounded-pill overflow-hidden"
              style={{ 
                width: "80px",
                height: "35px",
                cursor: "pointer",
                flexShrink: 0
              }}
            >
              <div
                className={`flex-fill d-flex align-items-center justify-content-center ${
                  selectedTitle === "Mr" 
                    ? 'bg-dark text-white' 
                    : 'bg-light text-dark'
                }`}
                onClick={() => setSelectedTitle("Mr")}
                style={{
                  transition: "all 0.2s ease",
                  borderRight: "1px solid #dee2e6"
                }}
              >
                <span className="fw-medium">Mr</span>
              </div>
              <div
                className={`flex-fill d-flex align-items-center justify-content-center ${
                  selectedTitle === "Ms" 
                    ? 'bg-dark text-white' 
                    : 'bg-light text-dark'
                }`}
                onClick={() => setSelectedTitle("Ms")}
                style={{
                  transition: "all 0.2s ease"
                }}
              >
                <span className="fw-medium">Ms</span>
              </div>
            </div>
            <Form.Control 
              type="text" 
              value={userInfo.name}
              onChange={(e) => login({ ...userInfo, name: e.target.value })}
              placeholder=""
              style={{ 
                height: "40px", 
                flex: 1, 
                border: "none", 
                boxShadow: "none",
                paddingLeft: "0",marginTop:"12px"
              }}
              className="border-0"
            />
          </div>
        </Form.Group>

        <Form.Group className="mb-4 position-relative">
          <div className="position-absolute top-0 start-0 mt-1 ms-3" style={{ zIndex: 5 }}>
            <span className="small text-muted bg-white px-1">Email</span>
          </div>
          <Form.Control 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=""
            style={{ 
              height: "55px", 
              paddingTop: "20px",
              marginTop: "8px"
            }}
          />
        </Form.Group>

        <Form.Group className="mb-4 position-relative">
          <div className="position-absolute top-0 start-0 mt-1 ms-3" style={{ zIndex: 5 }}>
            <span className="small text-muted bg-white px-1" style={{marginLeft:"90px"}}>Phone Number</span>
          </div>
          <div className="d-flex border rounded p-2" style={{ height: "55px", marginTop: "8px" }}>
            <div>
              <div 
                className="form-control d-flex justify-content-between align-items-center"
                style={{ 
                  height: "40px", 
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
            
            <div className="flex-grow-1 ms-2">
              <Form.Control
                type="tel"
                value={userInfo.phone}
                onChange={(e) => login({ ...userInfo, phone: e.target.value.replace(/\D/g, "") })}
                placeholder=""
                style={{ 
                  height: "40px", 
                  border: "none", 
                  boxShadow: "none" ,marginTop:"5px"
                }}
                className="border-0"
              />
            </div>
          </div>
        </Form.Group>

        <Button 
          className="butn fw-semibold w-100"
          style={{ height: "45px" }}
          onClick={() => {
            alert("Profile updated successfully!");
            setCurrentView("main");
          }}
        >
          Save Changes
        </Button>
      </Form>
    </div>
  );

  // Enhanced Bookings View
  const renderBookingsView = () => (
    <div>
      <h5 className="fw-bold mb-4">My Bookings</h5>
      <div className="text-center py-5">
        <div className="mb-4">
          <LuNotepadText size={60} className="text-muted" />
        </div>
        <h6 className="fw-semibold mb-2">No bookings yet</h6>
        <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
          Your upcoming and past bookings will appear here
        </p>
        <Button 
          className="butn fw-semibold"
          onClick={() => window.location.href = "/salon"}
        >
          Book a Service
        </Button>
      </div>
    </div>
  );

  // Enhanced Plans View
  const renderPlansView = () => (
    <div>
      <h5 className="fw-bold mb-4">My Plans</h5>
      <div className="text-center py-5">
        <div className="mb-4">
          <PiNotepadLight size={60} className="text-muted" />
        </div>
        <h6 className="fw-semibold mb-2">No active plans</h6>
        <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
          Your subscription plans will appear here
        </p>
        <Button 
          className="butn fw-semibold"
          onClick={() => window.location.href = "/plans"}
        >
          Explore Plans
        </Button>
      </div>
    </div>
  );

  // Enhanced Help View
  const renderHelpView = () => (
    <div>
      <h5 className="fw-bold mb-4">Help Center</h5>
      <div className="border rounded p-3 mb-3">
        <h6 className="fw-semibold mb-3">Frequently Asked Questions</h6>
        <div className="mb-3">
          <p className="fw-medium mb-1">How do I reschedule my booking?</p>
          <p className="text-muted small mb-0">You can reschedule from the bookings section up to 2 hours before the service.</p>
        </div>
        <div className="mb-3">
          <p className="fw-medium mb-1">What is your cancellation policy?</p>
          <p className="text-muted small mb-0">Free cancellation up to 2 hours before the scheduled service time.</p>
        </div>
        <div>
          <p className="fw-medium mb-1">How can I contact customer support?</p>
          <p className="text-muted small mb-0">Call us at 1800-123-4567 or email support@urbancompany.com</p>
        </div>
      </div>
      <Button 
        variant="outline-primary" 
        className="w-100 fw-semibold"
        onClick={() => window.location.href = "/contact"}
      >
        Contact Support
      </Button>
    </div>
  );

  // Enhanced About View
  const renderAboutView = () => (
    <div>
      <h5 className="fw-bold mb-4">About Urban Company</h5>
      <div className="text-center mb-4">
        <img 
          src="/assets/Uc.png" 
          alt="Urban Company" 
          style={{ width: "80px", height: "80px", objectFit: "contain" }}
        />
      </div>
      <p className="mb-3" style={{ fontSize: "14px" }}>
        Urban Company is a platform for home services, on a mission to empower millions of professionals worldwide.
      </p>
      <p className="mb-3" style={{ fontSize: "14px" }}>
        We provide services in beauty and wellness, cleaning, repair, and more, ensuring quality and convenience for our customers.
      </p>
      <div className="border rounded p-3">
        <h6 className="fw-semibold mb-2">Our Services</h6>
        <ul className="mb-0" style={{ fontSize: "14px" }}>
          <li>Salon & Spa Services</li>
          <li>Home Cleaning</li>
          <li>AC & Appliance Repair</li>
          <li>Plumbing & Electrical</li>
          <li>Painting & Carpentry</li>
        </ul>
      </div>
    </div>
  );

  const getViewTitle = () => {
    const titles = {
      main: isLoggedIn ? "Account" : "Profile",
      "profile-details": "My Profile",
      login: "Login",
      about: "About Urban Company",
      bookings: "My Bookings",
      plans: "My Plans",
      help: "Help Center"
    };
    return titles[currentView] || "Account";
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
                        src="/assets/Uc.png" 
                        alt="UC" 
                        style={{ width: "20px", height: "20px", objectFit: "contain" }}
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
      // When logged in, show different views based on currentView
      switch (currentView) {
        case "main":
          return renderMainViewAfterLogin();
        case "profile-details":
          return renderProfileDetailsView();
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
          <Modal.Title className="w-100 ">
            <h6 className="fw-bold mb-0">Select a Country</h6>
          </Modal.Title>
          <Button 
            className="p-0 border-0 text-dark position-absolute end-0 me-3 closebtn"
            onClick={() => setShowCountryModal(false)}
          >
            X
          </Button>
        </Modal.Header>
        
        <Modal.Body className="pt-0">
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {countries.map((country, index) => (
              <div
                key={country.code}
                className={`py-2  ${
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
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div>
                      <div style={{ fontWeight: "500" }}>{country.name}</div>
                    </div>
                  </div>
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