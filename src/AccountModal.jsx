import { useState, useEffect, useRef } from "react";
import { Modal, Button, Container, Row, Col, Form } from "react-bootstrap";
import { LuNotepadText } from "react-icons/lu";
import { IoMdHelpCircleOutline, IoMdLogOut } from "react-icons/io";
import { MdAccountCircle, MdOutlineArrowForwardIos } from "react-icons/md";
import { BiLeftArrowAlt } from "react-icons/bi";
import { PiNotepadLight } from "react-icons/pi";
import { useAuth } from "./AuthContext";

function AccountModal({ show, onHide, initialView = "main" }) { // ADD THIS PROP
  const [logo1, setLogo1] = useState("");
  const [currentView, setCurrentView] = useState(initialView); // SET INITIAL STATE FROM PROP
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
        
        if (data && data.logo1) {
          const logoUrl = data.logo1.startsWith('http') 
            ? data.logo1
            : `http://localhost:5000${data.logo1}`;
          setLogo1(logoUrl);
        } else {
          setLogo1("http://localhost:5000/assets/urban.png");
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

  // Reset state when modal opens - UPDATED TO USE initialView
  useEffect(() => {
    if (show) {
      setCurrentView(initialView); // USE THE PROP HERE
      setShowOtpInput(false);
      setPhoneNumber("");
      setOtp(["","","","","",""]);
      setTimer(30);
      setCanResend(false);
    }
  }, [show, initialView]); // ADD initialView TO DEPENDENCY ARRAY

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

  // ... rest of your component remains EXACTLY THE SAME
  // (handleNavigation, handlePhoneSubmit, handleOtpChange, etc.)

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

  // ... ALL OTHER FUNCTIONS REMAIN EXACTLY THE SAME
  // (handleOtpChange, handleOtpKeyDown, handleOtpSubmit, handleResendCode, etc.)

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
        name: data.user.name,
        phone: data.user.phoneNumber
      });

      setCurrentView("main");
      setShowOtpInput(false);
      setOtp(["","","","","",""]);
      setTimer(30);
      setCanResend(false);
      
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

  // Render login view
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
          <h5 className="fw-semibold mb-1">Subashre</h5> {/* Changed here */}
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

  // ... REST OF YOUR COMPONENT REMAINS EXACTLY THE SAME
  // (renderProfileDetailsView, renderBookingsView, renderPlansView, renderHelpView, renderAboutView, getViewTitle, renderMainContent)

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