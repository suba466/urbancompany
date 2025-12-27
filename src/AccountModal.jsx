import { useState, useEffect, useRef } from "react";
import { Modal, Button, Container, Row, Col, Form, Spinner, Alert, Card, Badge } from "react-bootstrap";
import { LuNotepadText } from "react-icons/lu";
import { IoMdHelpCircleOutline, IoMdLogOut } from "react-icons/io";
import { MdAccountCircle, MdOutlineArrowForwardIos, MdLocationOn, MdEdit, MdCameraAlt } from "react-icons/md";
import { BiLeftArrowAlt } from "react-icons/bi";
import { PiNotepadLight } from "react-icons/pi";
import { useAuth } from "./AuthContext";
import { IoSettingsOutline } from "react-icons/io5";

function AccountModal({ show, totalPrice = () => {}, onHide, initialView = "main" }) {
  const [logo1, setLogo1] = useState("");
  const [currentView, setCurrentView] = useState(initialView);
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const fileInputRef = useRef(null);
  const profileFileInputRef = useRef(null);
  const [profilePreview, setProfilePreview] = useState(null);
  
  // Registration states
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    confirmPassword: "",
    profilePicture: null,
    profileFile: null
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
    city: "",
    profileFile: null
  });

  const { isLoggedIn, userInfo, login, logout } = useAuth();
  
  // Create safe reference for backward compatibility
  const customerInfo = userInfo || {
    id: '',
    name: '',
    email: '',
    phone: '',
    city: '',
    profileImage: '',
    title: 'Ms'
  };

  // Update the useEffect that loads profile data
  useEffect(() => {
    if (isLoggedIn && show && userInfo.email) {
      loadCustomerData();
      
      // Initialize profile data with customer info
      setProfileData({
        title: userInfo.title || "Ms",
        name: userInfo.name || "",
        email: userInfo.email || "",
        phone: userInfo.phone || "",
        city: userInfo.city || "",
        profileFile: null
      });

      console.log("Profile data initialized with:", {
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        city: userInfo.city,
        title: userInfo.title
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

  const loadCustomerData = async () => {
    try {
      setLoadingBookings(true);
      if (!userInfo.email) {
        console.log("No email found");
        setBookings([]);
        return;
      }
      
      const customerEmail = userInfo.email;
      console.log("Fetching bookings for:", customerEmail);
      
      // Load bookings from server
      const bookingsResponse = await fetch(`http://localhost:5000/api/bookings/${customerEmail}`);
      
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        console.log("📋 Bookings received:", {
          count: bookingsData.bookings?.length || 0,
          bookings: bookingsData.bookings
        });
        
        // Debug: Check what's in each booking
        if (bookingsData.bookings && bookingsData.bookings.length > 0) {
          bookingsData.bookings.forEach((booking, index) => {
            console.log(`Booking ${index + 1}:`, {
              id: booking._id,
              serviceName: booking.serviceName,
              hasCartItems: !!booking.cartItems,
              cartItemsCount: booking.cartItems?.length || 0,
              hasItems: !!booking.items,
              itemsCount: booking.items?.length || 0,
              cartItems: booking.cartItems
            });
          });
        }
        
        setBookings(bookingsData.bookings || []);
      } else {
        console.log("Failed to fetch bookings");
        setBookings([]);
      }

      // Load plans from same email
      const plansResponse = await fetch(`http://localhost:5000/api/plans/${customerEmail}`);
      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setPlans(plansData.plans || []);
      }
      
    } catch (error) {
      console.error("Error loading customer data:", error);
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
      setProfilePreview(null);
      // Reset form data
      setRegisterData({
        name: "",
        email: "",
        phone: "",
        city: "",
        password: "",
        confirmPassword: "",
        profilePicture: null,
        profileFile: null
      });
      setLoginData({
        email: "",
        password: ""
      });
    }
  }, [show, initialView]);

  const handleBack = () => {
    if (["profile-details", "bookings", "plans", "help", "about", "edit-profile", "register", "login"].includes(currentView)) {
      setCurrentView("main");
      setProfilePreview(null);
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

  // Handle profile picture upload for registration
  const handleProfilePictureUpload = (event, isRegistration = false) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("Please select an image smaller than 2MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file");
        return;
      }

      // Create preview URL for display
      const previewUrl = URL.createObjectURL(file);
      if (isRegistration) {
        setRegisterData(prev => ({
          ...prev,
          profilePicture: previewUrl,
          profileFile: file
        }));
      }
    }
  };

  // Handle profile image upload for profile edit
  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("Please select an image smaller than 2MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file");
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfilePreview(previewUrl);
      setProfileData(prev => ({
        ...prev,
        profileFile: file
      }));
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

  // Handle profile change
  const handleProfileChange = (field, value) => {
    console.log(`Changing ${field} to:`, value);
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // DEBUG: Log all registration data
    console.log("=== REGISTRATION DATA ===");
    console.log("Name:", registerData.name);
    console.log("Email:", registerData.email);
    console.log("Phone:", registerData.phone);
    console.log("City:", registerData.city);
    console.log("Password:", registerData.password);
    console.log("Confirm Password:", registerData.confirmPassword);
    console.log("Profile File:", registerData.profileFile);
    console.log("========================");
    
    // Validation
    if (!registerData.name || registerData.name.trim() === "") {
      console.log("Validation failed: Name is empty");
      alert("Please enter your name");
      return;
    }

    if (!registerData.email || registerData.email.trim() === "") {
      console.log("Validation failed: Email is empty");
      alert("Please enter your email");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(registerData.email)) {
      console.log("Validation failed: Invalid email format");
      alert("Please enter a valid email address");
      return;
    }

    if (!registerData.phone || registerData.phone.trim() === "" || registerData.phone.length !== 10) {
      console.log("Validation failed: Phone is invalid");
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    if (!registerData.city || registerData.city.trim() === "") {
      console.log("Validation failed: City is empty");
      alert("Please enter your city");
      return;
    }

    if (!registerData.password || registerData.password === "") {
      console.log("Validation failed: Password is empty");
      alert("Please enter a password");
      return;
    }

    if (registerData.password.length < 6) {
      console.log("Validation failed: Password too short");
      alert("Password must be at least 6 characters long");
      return;
    }

    if (!registerData.confirmPassword || registerData.confirmPassword === "") {
      console.log("Validation failed: Confirm password is empty");
      alert("Please confirm your password");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      console.log("Validation failed: Passwords don't match");
      console.log("Password:", registerData.password);
      console.log("Confirm Password:", registerData.confirmPassword);
      alert("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('name', registerData.name);
      formData.append('email', registerData.email);
      formData.append('phone', registerData.phone);
      formData.append('city', registerData.city);
      formData.append('password', registerData.password);
      
      // Append profile picture if exists
      if (registerData.profileFile) {
        formData.append('profileImage', registerData.profileFile);
        console.log("Appending profile image:", registerData.profileFile.name);
      }

      console.log("Sending registration request...");
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Registration response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to register");
      }

      // Auto login after successful registration
      login({
        name: data.customer.name,
        email: data.customer.email,
        phone: data.customer.phone,
        city: data.customer.city,
        customerId: data.customer.id,
        profileImage: data.customer.profileImage,
        title: data.customer.title || "Ms"
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

  // Handle customer login
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
        name: data.customer.name,
        email: data.customer.email,
        phone: data.customer.phone,
        city: data.customer.city,
        customerId: data.customer.id,
        profileImage: data.customer.profileImage,
        title: data.customer.title || "Ms"
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
    setProfilePreview(null);
    onHide();
  };

  // Handle profile save
  const handleProfileSave = async () => {
    console.log("=== DEBUG START ===");
    console.log("📋 Profile data to save:", profileData);
    console.log("👤 Full userInfo object:", userInfo);
    console.log("🆔 Customer ID value:", userInfo.id);
    console.log("🆔 Customer ID type:", typeof userInfo.id);
    console.log("=== DEBUG END ===");
    
    // Validation
    if (!userInfo.id || userInfo.id === "undefined" || userInfo.id === "") {
      console.error("❌ Invalid customerId:", userInfo.id);
      alert("Customer ID is missing or invalid. Please:\n1. Log out\n2. Clear browser cache\n3. Log in again");
      return;
    }

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
      alert("Please enter a valid phone number (10 digits)");
      return;
    }

    if (!profileData.city.trim()) {
      alert("Please enter your city");
      return;
    }

    setIsLoading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('customerId', userInfo.id);
      formData.append('name', profileData.name);
      formData.append('email', profileData.email);
      formData.append('phone', profileData.phone);
      formData.append('city', profileData.city);
      formData.append('title', profileData.title || "Ms");
      
      // Append profile file if exists
      if (profileData.profileFile) {
        formData.append('profileImage', profileData.profileFile);
        console.log("📤 Uploading profile image:", profileData.profileFile.name);
      }

      console.log("📤 Sending update request to server...");
      console.log("🔗 Endpoint: http://localhost:5000/api/update-profile");
      console.log("🆔 Customer ID being sent:", userInfo.id);

      const response = await fetch("http://localhost:5000/api/update-profile", {
        method: "POST",
        body: formData,
      });

      console.log("📥 Response status:", response.status);
      console.log("📥 Response headers:", response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Profile update response:", data);
        
        // Clean up preview URL if exists
        if (profilePreview) {
          URL.revokeObjectURL(profilePreview);
        }
        
        // Update customer info in context
        const updatedUserInfo = {
          ...userInfo,
          name: data.customer.name,
          email: data.customer.email,
          phone: data.customer.phone,
          city: data.customer.city,
          title: data.customer.title || "Ms",
          profileImage: data.customer.profileImage
        };
        
        console.log("🔄 Updating context with:", updatedUserInfo);
        login(updatedUserInfo);

        setProfilePreview(null);
        setCurrentView("main");
        alert("Profile updated successfully!");
      } else {
        const errorText = await response.text();
        console.error("❌ Update failed - Response text:", errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || "Failed to update profile");
        } catch {
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
      }
      
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      alert("Failed to update profile: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Render profile picture component
  const renderProfilePicture = (pictureUrl, size = 80, editable = false, onEditClick = null) => {
    // Construct full URL if it's a relative path
    const getFullImageUrl = (url) => {
      if (!url) return null;
      if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) {
        return url;
      }
      if (url.startsWith('/assets/')) {
        return `http://localhost:5000${url}`;
      }
      return `http://localhost:5000/assets/${url}`;
    };

    const fullImageUrl = getFullImageUrl(pictureUrl);

    return (
      <div 
        className="position-relative d-inline-block"
        style={{ cursor: editable ? 'pointer' : 'default' }}
        onClick={editable ? onEditClick : null}
      >
        {fullImageUrl ? (
          <img
            src={fullImageUrl}
            alt="Profile"
            className="rounded-circle border"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              objectFit: 'cover'
            }}
            onError={(e) => {
              console.error("Error loading profile image:", fullImageUrl);
              // If image fails to load, show default avatar
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div
            className="rounded-circle border d-flex align-items-center justify-content-center bg-light"
            style={{
              width: `${size}px`,
              height: `${size}px`
            }}
          >
            <MdAccountCircle 
              size={size} 
              className="text-muted"
            />
          </div>
        )}
        {editable && (
          <div 
            className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-1 border border-white"
            style={{ width: '28px', height: '28px' }}
          >
            <MdCameraAlt size={16} className="text-white" />
          </div>
        )}
      </div>
    );
  };

  // Render registration view with profile picture
  const renderRegisterView = () => (
    <div>
      <Form onSubmit={handleRegister}>
        <div className="text-center mb-4">
          {renderProfilePicture(
            registerData.profilePicture, 
            100, 
            true,
            () => fileInputRef.current?.click()
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleProfilePictureUpload(e, true)}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <div className="mt-2">
            <button
              type="button"
              className="btn btn-link p-0 text-decoration-none"
              onClick={() => fileInputRef.current?.click()}
              style={{ fontSize: "14px", color: "#6e42e5" }}
            >
              {registerData.profilePicture ? "Change Photo" : "Add Profile Photo"}
            </button>
          </div>
        </div>

        <div className="mb-3">
          <p style={{fontSize:"13px"}}>Join Urban Company for the best home services</p>
          
          {/* Name */}
          <Form.Group className="mb-3">
            <Form.Label>Full Name *</Form.Label>
            <Form.Control
              type="text" className="cate p-3"
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
              type="email"className="cate p-3"
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
              type="tel"className="cate p-3"
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
              type="text"className="cate p-3"
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
              type="password"className="cate p-3"
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
              type="password"className="cate p-3"
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

  // Render login view with profile picture
  const renderLoginView = () => (
    <div>   
      <Form onSubmit={handleLogin}>
        <div className="mb-3">
          {/* Email */}
          <Form.Group className="mb-3">
            <Form.Label>Email Address *</Form.Label>
            <Form.Control
              type="email"className="cate p-3"
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
              type="password"className="cate p-3"
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
  const renderProfileEditView = () => {
    console.log("Edit View - Current Profile Data:", profileData);
    console.log("Edit View - Current User Info:", userInfo);
    
    // Use preview if exists, otherwise use existing profile image
    const displayImage = profilePreview || userInfo.profileImage;
    
    return (
      <div>
        <div className="text-center mb-4">
          <div 
            className="position-relative d-inline-block"
            style={{ cursor: 'pointer' }}
            onClick={() => profileFileInputRef.current?.click()}
          >
            {renderProfilePicture(displayImage, 100, true)}
            <input
              type="file"
              ref={profileFileInputRef}
              onChange={handleProfileImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
          <div className="mt-2">
            <button
              type="button"
              className="btn btn-link p-0 text-decoration-none"
              onClick={() => profileFileInputRef.current?.click()}
              style={{ fontSize: "14px", color: "#6e42e5" }}
            >
              Change Photo
            </button>
          </div>
          <h4 className="mt-3">My Profile</h4>
          <p className="text-muted small">Edit your profile information</p>
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
                          (profileData.title || userInfo.title || "Ms") === title 
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
                      value={profileData.name || userInfo.name || ""}
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
                  value={profileData.email || userInfo.email || ""}
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
                value={profileData.phone || userInfo.phone || ""}
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
                maxLength={10}
              />
            </div>

            {/* Box 4: City */}
            <div className="border rounded p-2 mb-0" style={{height:"55px"}}>
              <p className="text-muted small mb-0" style={{fontSize:"12px"}}>City</p>
              <Form.Control
                type="text"
                value={profileData.city || userInfo.city || ""}
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  };

  // Render bookings view - UPDATED to show cart items
  const renderBookingsView = () => {
    // Calculate total for each booking
    const calculateBookingTotal = (booking) => {
      if (booking.isCurrent && totalPrice) {
        return totalPrice;
      }
      if (booking.servicePrice) {
        return Number(booking.servicePrice) || 0;
      }
      // Calculate from cart items
      if (booking.cartItems && booking.cartItems.length > 0) {
        return booking.cartItems.reduce((sum, item) => {
          const price = Number(item.price?.replace(/[^0-9.-]+/g, "")) || 0;
          const count = item.count || 1;
          return sum + (price * count);
        }, 0);
      }
      // Calculate from items
      if (booking.items && booking.items.length > 0) {
        return booking.items.reduce((sum, item) => {
          const price = Number(item.price?.replace(/[^0-9.-]+/g, "")) || 0;
          const quantity = item.quantity || 1;
          return sum + (price * quantity);
        }, 0);
      }
      
      return 0;
    };

    return (
      <div className="p-2">
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
              Your completed orders will appear here
            </p>
          </div>
        ) : (
          <div className="d-grid gap-3">
            {bookings.map((booking) => {
              const bookingTotal = calculateBookingTotal(booking);
              
              return (
                <Card key={booking._id} className="border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <p className="fw-semibold mb-1">
                          Order #{booking._id?.toString().substring(0, 8) || "N/A"}
                        </p>
                        <p className="small text-muted mb-0">
                          {new Date(booking.bookingDate || booking.createdAt || Date.now()).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })} at {booking.scheduledTime || "10:00 AM"}
                        </p>
                      </div>
                      <span className={`badge ${
                        booking.status === 'Confirmed' ? 'bg-success' : 
                        booking.status === 'Completed' ? 'bg-primary' : 
                        booking.status === 'Cancelled' ? 'bg-danger' : 'bg-warning'
                      }`}>
                        {booking.status || 'Confirmed'}
                      </span>
                    </div>
                    
                    {/* Display service name */}
                    <div className="mb-3">
                      <p className="small fw-semibold mb-2">
                        Service: {booking.serviceName || "Multiple Services"}
                      </p>
                    </div>
                    
                    {/* Display CART ITEMS if available */}
                    {booking.cartItems && booking.cartItems.length > 0 ? (
                      <div className="mb-3">
                        <p className="small fw-semibold mb-2">🛒 Cart Items:</p>
                        <div>
                          {booking.cartItems.map((item, index) => {
                            const itemPrice = Number(item.price?.replace(/[^0-9.-]+/g, "")) || 0;
                            const count = item.count || 1;
                            const totalItemPrice = itemPrice * count;
                            const itemName = item.name || item.title || `Item ${index + 1}`;
                            
                            return (
                              <div key={index} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                <div>
                                  <p className="mb-1 small">{itemName}</p>
                                  <p className="mb-0 text-muted" style={{ fontSize: "11px" }}>
                                    Qty: {count} × ₹{itemPrice.toLocaleString('en-IN')}
                                  </p>
                                </div>
                                <p className="mb-0 small">
                                  ₹{totalItemPrice.toLocaleString('en-IN')}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : booking.items && booking.items.length > 0 ? (
                      <div className="mb-3">
                        <p className="small fw-semibold mb-2">Services:</p>
                        <div>
                          {booking.items.map((item, index) => {
                            const itemPrice = Number(item.price?.replace(/[^0-9.-]+/g, "")) || 0;
                            const quantity = item.quantity || 1;
                            const totalItemPrice = itemPrice * quantity;
                            
                            return (
                              <div key={index} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                <div>
                                  <p className="mb-1 small">{item.name}</p>
                                  <p className="mb-0 text-muted" style={{ fontSize: "11px" }}>
                                    Qty: {quantity} × ₹{itemPrice.toLocaleString('en-IN')}
                                  </p>
                                </div>
                                <p className="mb-0 small ">
                                  ₹{totalItemPrice.toLocaleString('en-IN')}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    {/* Total Amount */}
                    <div className="pt-2">
                      <div className="d-flex justify-content-between mt-2 pt-2 border-top">
                        <span className="fw-semibold">Total Amount:</span>
                        <span className="fw-semibold">
                          ₹{bookingTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Address */}
                    {booking.address && (
                      <div className="d-flex align-items-start mt-3">
                        <MdLocationOn size={14} className="text-muted mt-1 me-2 flex-shrink-0" />
                        <div className="flex-grow-1">
                          <p className="small text-muted mb-1">
                            {booking.address.doorNo && `${booking.address.doorNo}, `}
                            {booking.address.mainText || "Selected Address"}
                            {booking.address.subText && `, ${booking.address.subText}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="mt-3 pt-2 border-top d-flex gap-2">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        className="flex-grow-1"
                        onClick={() => {
                          // Create detailed message
                          let details = `📋 Booking Details\n`;
                          details += `────────────────\n`;
                          details += `Booking ID: ${booking._id}\n`;
                          details += `Date: ${new Date(booking.bookingDate || booking.createdAt).toLocaleDateString('en-IN')}\n`;
                          details += `Time: ${booking.scheduledTime || "10:00 AM"}\n`;
                          details += `Status: ${booking.status || 'Confirmed'}\n\n`;
                          
                          if (booking.cartItems && booking.cartItems.length > 0) {
                            details += `🛒 Cart Items:\n`;
                            booking.cartItems.forEach((item, index) => {
                              const itemPrice = Number(item.price?.replace(/[^0-9.-]+/g, "")) || 0;
                              const count = item.count || 1;
                              const itemName = item.name || item.title || `Item ${index + 1}`;
                              details += `  ${index + 1}. ${itemName}\n`;
                              details += `     ₹${itemPrice} × ${count} = ₹${itemPrice * count}\n`;
                            });
                          } else if (booking.items && booking.items.length > 0) {
                            details += `🛒 Services:\n`;
                            booking.items.forEach((item, index) => {
                              const itemPrice = Number(item.price?.replace(/[^0-9.-]+/g, "")) || 0;
                              const quantity = item.quantity || 1;
                              details += `  ${index + 1}. ${item.name}\n`;
                              details += `     ₹${itemPrice} × ${quantity} = ₹${itemPrice * quantity}\n`;
                            });
                          }
                          
                          details += `\n💰 Payment Summary:\n`;
                          details += `  Amount to Pay: ₹${bookingTotal}\n`;
                          
                          if (booking.paymentMethod) {
                            details += `  Payment Method: ${booking.paymentMethod}\n`;
                          }
                          
                          details += `\n📍 Address:\n`;
                          if (booking.address) {
                            details += `  ${booking.address.doorNo ? booking.address.doorNo + ', ' : ''}`;
                            details += `${booking.address.mainText || ''}`;
                            details += `${booking.address.subText ? ', ' + booking.address.subText : ''}`;
                          }
                          
                          alert(details);
                        }}
                      >
                        View Details
                      </Button>
                      {/* DELETE BUTTON */}
                      <Button 
                        variant="outline-dark" 
                        size="sm"
                        onClick={async () => {
                          if (window.confirm("Are you sure you want to delete this booking record?")) {
                            try {
                              const response = await fetch(`http://localhost:5000/api/bookings/${booking._id}`, {
                                method: "DELETE"
                              });
                              
                              if (response.ok) {
                                alert("Booking deleted successfully!");
                                // Refresh bookings
                                loadCustomerData();
                              } else {
                                alert("Failed to delete booking");
                              }
                            } catch (error) {
                              console.error("Error deleting booking:", error);
                              alert("Error deleting booking. Please try again.");
                            }
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Render plans view
  const renderPlansView = () => (
    <div>
      
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

    // Render plans view
  const renderSettingsView = () => (
    <div style={{padding:"10px"}}>
      <h5 className="fw-semibold">Order related messages</h5>
      <p className="text-muted">Order related messages can't be turned off as they are important for service experience</p>
      <hr style={{border:"2px solid"}}/>
    </div>
  );

  // Render main view after login with profile picture
  const renderMainViewAfterLogin = () => {
    // Debug logging
    console.log("Debug - In renderMainViewAfterLogin");
    console.log("Debug - userInfo:", userInfo);
    console.log("Debug - customerInfo:", customerInfo);
    
    if (!userInfo) {
      console.error("userInfo is undefined!");
      return <div className="p-3">Loading user information...</div>;
    }
    
    return (
      <div>
        <div 
          className="mb-4 p-3"
          style={{ cursor: "pointer" }}
          onClick={() => handleNavigation("profile-details")}
        >
          <div className="d-flex align-items-center gap-3">
            {renderProfilePicture(userInfo.profileImage, 60, false)}
            <div className="flex-grow-1">
              <h5 className="fw-semibold mb-1">{userInfo.name || "Customer"}</h5>
              <p className="small text-muted mb-0">
                +91 {userInfo.phone || ""}
              </p>
              <p className="small text-muted mb-1">{userInfo.email || ""}</p>
            </div>
            <MdOutlineArrowForwardIos size={14} className="text-muted" />
          </div>
        </div>

        <div>
          {[
            { icon: <PiNotepadLight size={20} />, label: "My plans", view: "plans" },
            { icon: <LuNotepadText size={20} />, label: "Bookings", view: "bookings" },
            { icon: <IoMdHelpCircleOutline size={20} />, label: "Help Center", view: "help" },
            {icon: <IoSettingsOutline size={20}/>, label: "Settings", view: "settings"}
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
  };

  // Render help view
  const renderHelpView = () => (
    <div style={{padding:"20px"}}>
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
    <div style={{padding:"12px"}}>
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
      <div className="text-center mb-4">
        
        <p className="text-muted small">Login or create an account to manage your bookings</p>
      </div>

      <div className="d-grid">
        <Button 
          variant="outline-primary" 
          className="fw-bold" 
          style={{height: "45px"}}
          onClick={() => handleNavigation("register")}
        >
          Create Account
        </Button>
        <p></p>

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
      plans: "My plans ",
      settings:"Settings ",
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
        case "settings":
          return renderSettingsView();
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
        fullscreen="sm-down" className="account-modal"
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
          <Button type="button" onClick={() => onHide()} className="position-absolute border-0 justify-content-center closebtn p-0">X</Button>
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