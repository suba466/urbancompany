import React, { useState } from "react";
import { Modal, Button, Container, Row, Col, Form } from "react-bootstrap";
import { CgProfile } from "react-icons/cg";
import { LuNotepadText } from "react-icons/lu";
import { IoMdHelpCircleOutline, IoMdLogOut } from "react-icons/io";
import { MdAccountCircle, MdOutlineArrowForwardIos } from "react-icons/md";
import { BiLeftArrowAlt } from "react-icons/bi";
import { FaMobileAlt } from "react-icons/fa";

function AccountModal({ show, onHide }) {
  const [currentView, setCurrentView] = useState("main"); // main, profile, login, about, bookings, help
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    if (currentView !== "main") {
      setCurrentView("main");
      // Reset login state when going back to main
      setShowOtpInput(false);
      setPhoneNumber("");
      setOtp("");
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
    // Simulate OTP sending
    setTimeout(() => {
      setIsLoading(false);
      setShowOtpInput(true);
      alert(`OTP sent to ${phoneNumber}`);
    }, 1500);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }
    
    setIsLoading(true);
    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false);
      setIsLoggedIn(true);
      setUserName("User"); // You can set actual user name from API response
      setCurrentView("main");
      setShowOtpInput(false);
      setPhoneNumber("");
      setOtp("");
    }, 1500);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("");
    setCurrentView("main");
  };

  // Render login view - OTP based
  const renderLoginView = () => (
    <div className="account-detail-view">
      <div className="text-center mb-4">
        <MdAccountCircle size={60} className="text-muted mb-2" />
        <h5 className="fw-bold">Welcome to Urban Company</h5>
        <p className="text-muted small">Login with your mobile number</p>
      </div>

      {!showOtpInput ? (
        // Phone Number Input
        <Form onSubmit={handlePhoneSubmit}>
          <div className="mb-3">
            <Form.Label className="fw-medium">Mobile Number</Form.Label>
            <div className="input-group">
              <span className="input-group-text">+91</span>
              <Form.Control
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                required
              />
            </div>
            <Form.Text className="text-muted">
              We'll send an OTP to this number
            </Form.Text>
          </div>
          
          <Button 
            type="submit" 
            className="butn fw-bold py-2 w-100"
            disabled={isLoading || phoneNumber.length !== 10}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sending OTP...
              </>
            ) : (
              "Send OTP"
            )}
          </Button>
        </Form>
      ) : (
        // OTP Input
        <Form onSubmit={handleOtpSubmit}>
          <div className="mb-3">
            <Form.Label className="fw-medium">Enter OTP</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              required
            />
            <Form.Text className="text-muted">
              OTP sent to +91 {phoneNumber}
            </Form.Text>
          </div>
          
          <div className="d-grid gap-2">
            <Button 
              type="submit" 
              className="butn fw-bold py-2"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>
            
            <Button 
              variant="link" 
              className="text-muted"
              onClick={() => setShowOtpInput(false)}
              disabled={isLoading}
            >
              Change Number
            </Button>
          </div>
        </Form>
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
    <div className="account-main-view">
      {/* Header with user info */}
      <div className="text-center mb-4">
        <MdAccountCircle size={60} className="text-primary mb-2" />
        <h5 className="fw-bold">Welcome, {userName}!</h5>
        <p className="text-muted small">+91 {phoneNumber}</p>
      </div>

      {/* Account Menu Items */}
      <div className="account-menu">
        {[
          { icon: <CgProfile size={20} />, label: "Profile", view: "profile" },
          { icon: <LuNotepadText size={20} />, label: "Bookings", view: "bookings" },
          { icon: <IoMdHelpCircleOutline size={20} />, label: "Help Center", view: "help" },
        ].map((item, index) => (
          <div 
            key={index}
            className="account-menu-item d-flex justify-content-between align-items-center py-3 border-bottom"
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
        
        {/* About UC */}
        <div 
          className="account-menu-item d-flex justify-content-between align-items-center py-3 border-bottom"
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

        {/* Logout Option */}
        <div 
          className="account-menu-item d-flex justify-content-between align-items-center py-3 text-danger"
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

  const renderProfileView = () => (
    <div className="account-detail-view">
      <h6 className="fw-bold mb-4">Profile</h6>
      <div className="account-menu">
        {[
          { label: "Personal Information", description: "Name, phone number, email" },
          { label: "Addresses", description: "Saved addresses for services" },
          { label: "Payment Methods", description: "Cards, UPI, wallets" },
          { label: "Notifications", description: "Push & email notifications" },
        ].map((item, index) => (
          <div key={index} className="account-menu-item py-3 border-bottom">
            <div className="fw-medium">{item.label}</div>
            <div className="text-muted small">{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAboutView = () => (
    <div className="account-detail-view">
      <h6 className="fw-bold mb-4">About Urban Company</h6>
      <div className="account-menu">
        {[
          { label: "About Us", description: "Learn about our mission and values" },
          { label: "Careers", description: "Join our team" },
          { label: "Press", description: "Latest news and media kit" },
          { label: "Blog", description: "Stories and updates" },
          { label: "Contact Us", description: "Get in touch with us" },
        ].map((item, index) => (
          <div key={index} className="account-menu-item py-3 border-bottom">
            <div className="fw-medium">{item.label}</div>
            <div className="text-muted small">{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBookingsView = () => (
    <div className="account-detail-view">
      <h6 className="fw-bold mb-4">My Bookings</h6>
      <div className="text-center py-5">
        <LuNotepadText size={48} className="text-muted mb-3" />
        <p className="text-muted">No bookings yet</p>
        <Button className="butn fw-bold mt-2">
          Book a Service
        </Button>
      </div>
      
      <div className="account-menu mt-4">
        <div className="account-menu-item py-3 border-bottom">
          <div className="fw-medium">Booking History</div>
          <div className="text-muted small">View all your past bookings</div>
        </div>
        <div className="account-menu-item py-3">
          <div className="fw-medium">Upcoming Bookings</div>
          <div className="text-muted small">Manage your upcoming services</div>
        </div>
      </div>
    </div>
  );

  const renderHelpView = () => (
    <div className="account-detail-view">
      <h6 className="fw-bold mb-4">Help Center</h6>
      <div className="account-menu">
        {[
          { label: "FAQs", description: "Frequently asked questions" },
          { label: "Service Issues", description: "Problems with your service" },
          { label: "Payment Help", description: "Billing and payment issues" },
          { label: "Cancellation & Refunds", description: "Cancel services and get refunds" },
          { label: "Contact Support", description: "24/7 customer support" },
        ].map((item, index) => (
          <div key={index} className="account-menu-item py-3 border-bottom">
            <div className="fw-medium">{item.label}</div>
            <div className="text-muted small">{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const getViewTitle = () => {
    const titles = {
      main: isLoggedIn ? "Account" : "Login",
      profile: "Profile",
      login: "Login with OTP",
      about: "About Urban Company",
      bookings: "My Bookings",
      help: "Help Center"
    };
    return titles[currentView] || "Account";
  };

  // Determine what to show in main view based on login status
  const renderMainContent = () => {
    if (!isLoggedIn) {
      if (currentView === "login") {
        return renderLoginView();
      } else {
        return (
          <div className="account-main-view">
            {/* Simple Login Button View */}
            <div className="text-center mb-4">
              <MdAccountCircle size={60} className="text-muted mb-2" />
              <h5 className="fw-bold">Welcome to Urban Company</h5>
              <p className="text-muted small">Login to access your account</p>
            </div>

            <div className="d-grid gap-3">
              <Button 
                className="butn fw-bold py-2"
                onClick={() => handleNavigation("login")}
              >
                <FaMobileAlt className="me-2" />
                Login with Mobile OTP
              </Button>
              
              <div className="account-menu">
                {/* About UC - Always visible */}
                <div 
                  className="account-menu-item d-flex justify-content-between align-items-center py-3"
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
      return renderMainViewAfterLogin();
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide}
      centered
      fullscreen="sm-down"
      className="account-modal"
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
          {currentView === "main" && renderMainContent()}
          {currentView === "profile" && isLoggedIn && renderProfileView()}
          {currentView === "login" && renderLoginView()}
          {currentView === "about" && renderAboutView()}
          {currentView === "bookings" && isLoggedIn && renderBookingsView()}
          {currentView === "help" && renderHelpView()}
        </Container>
      </Modal.Body>
    </Modal>
  );
}

export default AccountModal;