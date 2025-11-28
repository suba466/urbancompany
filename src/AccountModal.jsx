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
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  
  // Registration states
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    confirmPassword: ""
  });

  // Login states
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Profile editing states
  const [profileData, setProfileData] = useState({
    title: "Ms",
    name: "",
    email: "",
    phone: "",
    city: ""
  });

  const { isLoggedIn, userInfo, login, logout } = useAuth();

  // Update the useEffect that loads profile data
  useEffect(() => {
    if (isLoggedIn && show && userInfo.email) {
      loadUserData();
      // Initialize profile data with user info
      setProfileData({
        title: userInfo.title || "Ms",
        name: userInfo.name || "",
        email: userInfo.email || "",
        phone: userInfo.phone || "",
        city: userInfo.city || ""
      });
    }
  }, [isLoggedIn, show, userInfo]);

  // Add this useEffect to debug the booking loading
  useEffect(() => {
    console.log("Debug - Current state:", {
      isLoggedIn,
      userInfo,
      bookingsCount: bookings.length,
      bookings,
      loadingBookings
    });
  }, [bookings, loadingBookings, isLoggedIn, userInfo]);

  // Add this function to check all bookings in database
  const checkAllBookings = async () => {
    try {
      console.log("Checking ALL bookings in database...");
      const response = await fetch("http://localhost:5000/api/all-bookings");
      if (response.ok) {
        const allBookings = await response.json();
        console.log("All bookings in database:", allBookings);
        
        // Check if any booking matches current user's email
        const userBookings = allBookings.filter(booking => 
          booking.userEmail === userInfo.email
        );
        console.log("User's bookings:", userBookings);
      }
    } catch (error) {
      console.error("Error checking all bookings:", error);
    }
  };

  const loadUserData = async () => {
    try {
      setLoadingBookings(true);
      if (!userInfo.email) {
        console.log("No email found");
        setBookings([]);
        return;
      }
      
      const userEmail = userInfo.email;
      console.log("Fetching bookings for:", userEmail);
      
      // Load bookings from server
      const bookingsResponse = await fetch(`http://localhost:5000/api/bookings/${userEmail}`);
      
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        console.log("Bookings received:", bookingsData.bookings);
        setBookings(bookingsData.bookings || []);
      } else {
        console.log("Failed to fetch bookings");
        setBookings([]);
      }

      // Load plans from same email
      const plansResponse = await fetch(`http://localhost:5000/api/plans/${userEmail}`);
      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setPlans(plansData.plans || []);
      }
      
    } catch (error) {
      console.error("Error loading user data:", error);
      setBookings([]);
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

  // Reset state when modal opens
  useEffect(() => {
    if (show) {
      setCurrentView(initialView);
      setIsLoading(false);
      // Reset form data
      setRegisterData({
        name: "",
        email: "",
        phone: "",
        city: "",
        password: "",
        confirmPassword: ""
      });
      setLoginData({
        email: "",
        password: ""
      });
    }
  }, [show, initialView]);

  // Call checkAllBookings when bookings view loads
  useEffect(() => {
    if (currentView === "bookings" && isLoggedIn) {
      checkAllBookings();
    }
  }, [currentView, isLoggedIn]);

  const handleBack = () => {
    if (["profile-details", "bookings", "plans", "help", "about", "edit-profile", "register", "login"].includes(currentView)) {
      setCurrentView("main");
    } else {
      onHide();
    }
  };

  const handleNavigation = (view) => {
    if (view === "profile-details") {
      setCurrentView("edit-profile");
    } else {
      setCurrentView(view);
    }
  };

  // Handle registration form changes
  const handleRegisterChange = (field, value) => {
    setRegisterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle login form changes
  const handleLoginChange = (field, value) => {
    setLoginData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle user registration
  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!registerData.name.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!registerData.email.trim()) {
      alert("Please enter your email");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(registerData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (!registerData.phone.trim() || registerData.phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    if (!registerData.city.trim()) {
      alert("Please enter your city");
      return;
    }

    if (!registerData.password) {
      alert("Please enter a password");
      return;
    }

    if (registerData.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          phone: registerData.phone,
          city: registerData.city,
          password: registerData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register");
      }

      // Auto login after successful registration
      login({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        city: data.user.city,
        userId: data.user.id
      });

      setCurrentView("main");
      onHide();
      alert("Registration successful! Welcome to Urban Company");
      
    } catch (error) {
      console.error("Error registering:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!loginData.email.trim()) {
      alert("Please enter your email");
      return;
    }

    if (!loginData.password) {
      alert("Please enter your password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to login");
      }

      // Login successful
      login({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        city: data.user.city,
        userId: data.user.id
      });

      setCurrentView("main");
      onHide();
      alert("Login successful!");
      
    } catch (error) {
      console.error("Error logging in:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentView("main");
    setBookings([]);
    setPlans([]);
    onHide();
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

    if (!profileData.city.trim()) {
      alert("Please enter your city");
      return;
    }

    try {
      // Update user info in context
      login({
        ...userInfo,
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        city: profileData.city,
        title: profileData.title
      });

      // Update profile in backend
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
          city: profileData.city,
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

  // Profile change handler
  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Render registration view
  const renderRegisterView = () => (
    <div>
      <Form onSubmit={handleRegister}>
        <div className="mb-3">
          <p style={{fontSize:"13px"}}>Join Urban Company for the best home services</p>
          
          {/* Name */}
          <Form.Group className="mb-3">
            <Form.Label>Full Name *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your full name"
              value={registerData.name}
              onChange={(e) => handleRegisterChange('name', e.target.value)}
              required
              style={{ height: "45px" }}
            />
          </Form.Group>

          {/* Email */}
          <Form.Group className="mb-3">
            <Form.Label>Email Address *</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={registerData.email}
              onChange={(e) => handleRegisterChange('email', e.target.value)}
              required
              style={{ height: "45px" }}
            />
          </Form.Group>

          {/* Phone */}
          <Form.Group className="mb-3">
            <Form.Label>Phone Number *</Form.Label>
            <Form.Control
              type="tel"
              placeholder="Enter 10-digit phone number"
              value={registerData.phone}
              onChange={(e) => handleRegisterChange('phone', e.target.value.replace(/\D/g, ""))}
              maxLength={10}
              required
              style={{ height: "45px" }}
            />
          </Form.Group>

          {/* City */}
          <Form.Group className="mb-3">
            <Form.Label>City *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your city"
              value={registerData.city}
              onChange={(e) => handleRegisterChange('city', e.target.value)}
              required
              style={{ height: "45px" }}
            />
          </Form.Group>

          {/* Password */}
          <Form.Group className="mb-3">
            <Form.Label>Password *</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password (min 6 characters)"
              value={registerData.password}
              onChange={(e) => handleRegisterChange('password', e.target.value)}
              required
              style={{ height: "45px" }}
            />
          </Form.Group>

          {/* Confirm Password */}
          <Form.Group className="mb-3">
            <Form.Label>Confirm Password *</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm your password"
              value={registerData.confirmPassword}
              onChange={(e) => handleRegisterChange('confirmPassword', e.target.value)}
              required
              style={{ height: "45px" }}
            />
          </Form.Group>
        </div>
        
        <Button 
          type="submit" 
          style={{height: "45px"}}
          className="butn fw-semibold w-100"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>

        <div className="text-center mt-3">
          <p className="small text-muted">
            Already have an account?{" "}
            <button 
              type="button" 
              className="btn btn-link text-decoration-none p-0"
              onClick={() => setCurrentView("login")}
              style={{ fontSize: "14px", color: "#6e42e5" }}
            >
              Login here
            </button>
          </p>
        </div>
      </Form>

      <div className="text-center mt-4 pt-3 border-top">
        <p className="small text-muted">
          By creating an account, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </p>
      </div>
    </div>
  );

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

      <Form onSubmit={handleLogin}>
        <div className="mb-3">
          <h5 className="fw-bold">Login to Your Account</h5>
          <p style={{fontSize:"13px"}}>Welcome back! Please enter your details</p>
          
          {/* Email */}
          <Form.Group className="mb-3">
            <Form.Label>Email Address *</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={loginData.email}
              onChange={(e) => handleLoginChange('email', e.target.value)}
              required
              style={{ height: "45px" }}
            />
          </Form.Group>

          {/* Password */}
          <Form.Group className="mb-3">
            <Form.Label>Password *</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={loginData.password}
              onChange={(e) => handleLoginChange('password', e.target.value)}
              required
              style={{ height: "45px" }}
            />
          </Form.Group>

          {/* Forgot Password */}
          <div className="text-end mb-3">
            <button 
              type="button" 
              className="btn btn-link text-decoration-none p-0"
              onClick={() => alert("Forgot password feature coming soon!")}
              style={{ fontSize: "14px", color: "#6e42e5" }}
            >
              Forgot Password?
            </button>
          </div>
        </div>
        
        <Button 
          type="submit" 
          style={{height: "45px"}}
          className="butn fw-semibold w-100"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </Button>

        <div className="text-center mt-3">
          <p className="small text-muted">
            Don't have an account?{" "}
            <button 
              type="button" 
              className="btn btn-link text-decoration-none p-0"
              onClick={() => setCurrentView("register")}
              style={{ fontSize: "14px", color: "#6e42e5" }}
            >
              Sign up here
            </button>
          </p>
        </div>
      </Form>

      <div className="text-center mt-4 pt-3 border-top">
        <p className="small text-muted">
          By logging in, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </p>
      </div>
    </div>
  );

  // Render profile editing view
  const renderProfileEditView = () => (
    <div>
      <div className="text-center mb-4">
        <h4>My Profile</h4>
      </div>
      
      <Card className="border-0 shadow-sm">
        <Card.Body>
          {/* Box 1: Title Selection + Name */}
          <div className="border rounded mb-3" style={{height:"55px"}}>
            <Row>
              <Col xs={3} className="p-3">
                <div 
                  className="border rounded-pill d-flex"
                  style={{
                    border: "1px solid #dee2e6",
                    overflow: "hidden",
                    width: "75px",
                    height: "32px"
                  }}
                >
                  {['Mr', 'Ms'].map((title, index) => (
                    <button
                      key={title}
                      type="button"
                      className={`btn border-0 rounded-0 flex-fill ${
                        profileData.title === title 
                          ? 'btn-dark' 
                          : 'btn-outline-secondary'
                      }`}
                      onClick={() => handleProfileChange('title', title)}
                      style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        padding: '8px 10px',
                        borderRadius: index === 0 ? '50px 0 0 50px' : 
                                      index === 1 ? '0 50px 50px 0' : '0'
                      }}
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </Col>
              <Col>
                <p className="text-muted small mb-0" style={{marginTop:"8px",fontSize:"12px"}}>Name</p>
                <div className="">
                  <Form.Control
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="border-0 p-0"
                    style={{ 
                      background: "transparent",
                      fontSize:"12px",
                      outline: "none",
                      boxShadow: "none"
                    }}
                    placeholder="Enter your name"
                  />
                </div>
              </Col>
            </Row>
          </div>

          {/* Box 2: Email */}
          <div className="border rounded p-2 mb-3" style={{height:"55px"}}>
            <p className="text-muted small mb-0" style={{fontSize:"12px"}}>Email</p>
            <div>
              <Form.Control
                type="email"
                value={profileData.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                placeholder="Enter email"
                className="border-0 p-0"
                style={{ 
                  background: "transparent",
                  outline: "none",
                  boxShadow: "none",
                  width: "100%",
                  fontSize:"12px"
                }}
              />
            </div>
          </div>

          {/* Box 3: Phone Number */}
          <div className="border rounded p-2 mb-3" style={{height:"55px"}}>
            <p className="text-muted small mb-0" style={{fontSize:"12px"}}>Phone Number</p>
            <Form.Control
              type="tel"
              value={profileData.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value.replace(/\D/g, ""))}
              placeholder="Enter phone number"
              className="border-0 p-0"
              style={{ 
                background: "transparent",
                outline: "none",
                boxShadow: "none",
                height: "32px",
                fontSize: "12px"
              }}
            />
          </div>

          {/* Box 4: City */}
          <div className="border rounded p-2 mb-0" style={{height:"55px"}}>
            <p className="text-muted small mb-0" style={{fontSize:"12px"}}>City</p>
            <Form.Control
              type="text"
              value={profileData.city}
              onChange={(e) => handleProfileChange('city', e.target.value)}
              placeholder="Enter your city"
              className="border-0 p-0"
              style={{ 
                background: "transparent",
                outline: "none",
                boxShadow: "none",
                height: "32px",
                fontSize: "12px"
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2 pt-3">
            <Button
              className="butn flex-grow-1 py-2" 
              style={{backgroundColor:"black",height:"40px"}}
              onClick={handleProfileSave}
            >
              Save Changes
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );

  // Render bookings view (same as before, but using email instead of phone)
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
          <p className="small text-muted">
            Your completed orders will appear here<br />
            <small>User: {userInfo.email}</small>
          </p>
        </div>
      ) : (
        <div className="d-grid gap-3">
          {bookings.map((booking) => (
            <Card key={booking._id} className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="fw-semibold mb-1">{booking.serviceName || "Beauty Services"}</h6>
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
                    <strong>Booking ID:</strong> {booking._id?.substring(0, 8)}...
                  </p>
                  <p className="small text-muted mb-1">
                    <strong>Date:</strong> {new Date(booking.bookingDate || Date.now()).toLocaleDateString('en-IN')}
                  </p>
                  <p className="small text-muted mb-1">
                    <strong>Amount Paid:</strong> ₹{booking.servicePrice || "0"}
                  </p>
                </div>

                {booking.address && (
                  <div className="d-flex align-items-start mb-2">
                    <MdLocationOn size={14} className="text-muted mt-1 me-2" />
                    <p className="small text-muted mb-0 flex-grow-1">
                      {booking.address.doorNo && `${booking.address.doorNo}, `}
                      {booking.address.mainText || "Selected Address"}
                    </p>
                  </div>
                )}

                <div className="mt-3 pt-2 border-top">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => {
                      alert(`Booking Details:\n\nService: ${booking.serviceName}\nDate: ${new Date(booking.bookingDate).toLocaleDateString()}\nAmount: ₹${booking.servicePrice}\nStatus: ${booking.status}`);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Render plans view (same as before)
  const renderPlansView = () => (
    <div>
      <h6 className="fw-bold mb-3">My Plans</h6>
      
      {plans.length === 0 ? (
        <div className="text-center py-5">
          <PiNotepadLight size={48} className="text-muted mb-3" />
          <p className="text-muted">No active plans</p>
          <p className="small text-muted">Your subscription plans will appear here</p>
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
            <h5 className="fw-semibold mb-1">{userInfo.name || "User"}</h5>
            <p className="small text-muted mb-1">{userInfo.email}</p>
            <p className="small text-muted mb-0">
              {userInfo.phone} • {userInfo.city}
            </p>
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

  // Render help view (same as before)
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

  // Render about view (same as before)
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

  // Render main view when not logged in
  const renderMainViewNotLoggedIn = () => (
    <div>
      <div className="d-grid">
         <Button 
          variant="outline-primary" 
          className="fw-bold " 
          style={{height: "45px"}}
          onClick={() => handleNavigation("register")}
        >
          Create Account
        </Button><br />
        <p>Alread a registered user?</p>

        <Button 
          className="butn fw-bold" 
          style={{height: "45px"}}
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

  const getViewTitle = () => {
    const titles = {
      main: isLoggedIn ? "Profile" : "Profile",
      login: "Login",
      register: "Create Account",
      "edit-profile": "My Profile",
      about: "About Urban Company",
      bookings: "My Bookings",
      plans: "My Plans",
      help: "Help Center"
    };
    return titles[currentView] || "Profile";
  };

  const renderMainContent = () => {
    if (!isLoggedIn) {
      switch (currentView) {
        case "login":
          return renderLoginView();
        case "register":
          return renderRegisterView();
        default:
          return renderMainViewNotLoggedIn();
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
    </>
  );
}

export default AccountModal;