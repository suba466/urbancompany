import React, { useState, useEffect, useRef } from "react";
import {
  Navbar,Container,Nav,FormControl,Modal,Button,Row,Col, Dropdown,
} from "react-bootstrap";
import { CiLocationOn, CiShoppingCart, CiSearch } from "react-icons/ci";
import { IoIosArrowDown } from "react-icons/io";
import { BiLeftArrowAlt } from "react-icons/bi";
import { LuNotepadText } from "react-icons/lu";
import { CgProfile } from "react-icons/cg";
import { IoMdLocate } from "react-icons/io";
import { useLocation } from "react-router-dom";
import Searchdropdown from "./Searchdropdown.jsx";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { GoHomeFill } from "react-icons/go";
import { MdAccountCircle, MdHome, MdApartment, MdBusinessCenter, MdMyLocation, MdDelete, MdMoreVert } from "react-icons/md";
import AccountModal from "./AccountModal";
import "./Urbancom.css";

function Urbanav() {
  const [logo, setLogo] = useState("http://localhost:5000/assets/Uc.png");
  const [logo1, setLogo1] = useState("http://localhost:5000/assets/urban.png");
  const [searchValue, setSearchValue] = useState("");
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [placeholder, setPlaceholder] = useState("Search for ");
  const [showDropdown, setShowDropdown] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [suggestedLocations, setSuggestedLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showAddressMap, setShowAddressMap] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [currentLocationStatus, setCurrentLocationStatus] = useState("idle"); // idle, fetching, fetched, error
  const [savedAddresses, setSavedAddresses] = useState([]);
  
  const dropdownRef = useRef(null);
  const location = useLocation();
  const fixedText = "Search for ";
  const words = ["'AC Service'", "'Facial'", "'Kitchen Cleaning'"];
  const typingSpeed = 120;
  const erasingSpeed = 80;
  const delayBetweenWords = 1200;

  // Mock location database - only used when searching
  const locationDatabase = [
    {
      id: 1,
      mainText: "Balaji Nagar, New Siddhapudur",
      subText: "Coimbatore, Tamil Nadu 641044",
      fullAddress: "Balaji Nagar, New Siddhapudur, Coimbatore, Tamil Nadu 641044",
      coordinates: { lat: 11.0168, lng: 76.9558 }
    },
    {
      id: 2,
      mainText: "RS Puram",
      subText: "Coimbatore, Tamil Nadu 641002",
      fullAddress: "RS Puram, Coimbatore, Tamil Nadu 641002",
      coordinates: { lat: 11.0168, lng: 76.9558 }
    },
    {
      id: 3,
      mainText: "Gandhipuram",
      subText: "Coimbatore, Tamil Nadu 641012",
      fullAddress: "Gandhipuram, Coimbatore, Tamil Nadu 641012",
      coordinates: { lat: 11.0168, lng: 76.9558 }
    },
    {
      id: 4,
      mainText: "Saravanampatti",
      subText: "Coimbatore, Tamil Nadu 641035",
      fullAddress: "Saravanampatti, Coimbatore, Tamil Nadu 641035",
      coordinates: { lat: 11.0168, lng: 76.9558 }
    }
  ];

  const [addressDetails, setAddressDetails] = useState({
    doorNo: "",
    landmark: "",
    addressType: "home",
    saveAddress: false
  });

  // Load saved addresses from localStorage
  const loadSavedAddresses = () => {
    const saved = localStorage.getItem('savedAddresses');
    if (saved) {
      setSavedAddresses(JSON.parse(saved));
    }
  };

  // Fetch logos from backend
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        console.log("Fetching logos from backend...");
        const response = await fetch("http://localhost:5000/api/static-data");
        if (!response.ok) {
          throw new Error('Failed to fetch static data');
        }
        const data = await response.json();
        console.log("Static data received:", data);
        
        // Set main logo
        if (data && data.logo) {
          const logoUrl = data.logo.startsWith('http') 
            ? data.logo 
            : `http://localhost:5000${data.logo}`;
          console.log("Setting logo URL:", logoUrl);
          setLogo(logoUrl);
        } else {
          // Fallback for main logo
          setLogo("http://localhost:5000/assets/Uc.png");
        }

        // Set logo1 for mobile footer
        if (data && data.logo1) {
          const logo1Url = data.logo1.startsWith('http')
            ? data.logo1
            : `http://localhost:5000${data.logo1}`;
          console.log("Setting logo1 URL:", logo1Url);
          setLogo1(logo1Url);
        }
      } catch (error) {
        console.error("Error fetching logos:", error);
        setLogo("http://localhost:5000/assets/Uc.png");
        setLogo1("http://localhost:5000/assets/urban.png");
      }
    };

    fetchLogos();
    loadSavedAddresses();
  }, []);

  // Typing animation for placeholder
  useEffect(() => {
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const type = () => {
      const currentWord = words[wordIndex];
      if (!isDeleting) {
        setPlaceholder(fixedText + currentWord.substring(0, charIndex + 1));
        charIndex++;
        if (charIndex === currentWord.length) {
          isDeleting = true;
          setTimeout(type, delayBetweenWords);
          return;
        }
      } else {
        setPlaceholder(fixedText + currentWord.substring(0, charIndex - 1));
        charIndex--;
        if (charIndex === 0) {
          isDeleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
      }
      setTimeout(type, isDeleting ? erasingSpeed : typingSpeed);
    };

    type();
  }, []);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter locations based on search - ONLY when typing
  useEffect(() => {
    if (locationSearch.trim()) {
      const filtered = locationDatabase.filter(loc => 
        loc.mainText.toLowerCase().includes(locationSearch.toLowerCase()) ||
        loc.subText.toLowerCase().includes(locationSearch.toLowerCase()) ||
        loc.fullAddress.toLowerCase().includes(locationSearch.toLowerCase())
      );
      setSuggestedLocations(filtered);
    } else {
      setSuggestedLocations([]); // No suggestions when empty
    }
  }, [locationSearch]);

  // Listen for location modal open events from CartPage
  useEffect(() => {
    const handleOpenLocationModal = () => {
      console.log("Opening location modal from CartPage");
      setShowLocationPopup(true);
      loadSavedAddresses(); // Reload saved addresses when modal opens
    };

    window.addEventListener('openLocationModal', handleOpenLocationModal);
    
    const checkLocalStorage = setInterval(() => {
      if (localStorage.getItem('openLocationModal') === 'true') {
        console.log("Opening location modal via localStorage");
        setShowLocationPopup(true);
        localStorage.removeItem('openLocationModal');
        loadSavedAddresses();
      }
    }, 100);

    return () => {
      window.removeEventListener('openLocationModal', handleOpenLocationModal);
      clearInterval(checkLocalStorage);
    };
  }, []);

  const handleAccountClick = () => {
    setShowAccountModal(true);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setShowAddressMap(true);
    // Pre-fill landmark with selected location
    setAddressDetails(prev => ({
      ...prev,
      landmark: location.mainText
    }));
  };

  const handleUseCurrentLocation = () => {
    setCurrentLocationStatus("fetching");
    setIsGettingLocation(true);
    
    // Simulate getting current location with delay
    setTimeout(() => {
      const mockCurrentLocation = {
        id: 7,
        mainText: "Your Current Location",
        subText: "Coimbatore, Tamil Nadu",
        fullAddress: "Your current location in Coimbatore",
        coordinates: { lat: 11.0168, lng: 76.9558 }
      };
      setSelectedLocation(mockCurrentLocation);
      setShowAddressMap(true);
      setAddressDetails(prev => ({
        ...prev,
        landmark: "Current Location"
      }));
      setCurrentLocationStatus("fetched");
    }, 2000);
  };

  const handleAddressSubmit = () => {
    if (!addressDetails.doorNo.trim()) {
      alert("Please enter door number");
      return;
    }

    const finalAddress = {
      ...selectedLocation,
      doorNo: addressDetails.doorNo,
      landmark: addressDetails.landmark,
      addressType: addressDetails.addressType,
      completeAddress: `${addressDetails.doorNo}, ${selectedLocation.fullAddress}${addressDetails.landmark ? `, Near ${addressDetails.landmark}` : ''}`,
      id: Date.now() // Add unique ID
    };

    console.log("Final address:", finalAddress);
    
    // Save to selected address
    localStorage.setItem('selectedAddress', JSON.stringify(finalAddress));
    
    // Save to saved addresses if checkbox is checked
    if (addressDetails.saveAddress) {
      const existingAddresses = JSON.parse(localStorage.getItem('savedAddresses') || '[]');
      const exists = existingAddresses.find(addr => 
        addr.doorNo === finalAddress.doorNo && 
        addr.mainText === finalAddress.mainText
      );
      if (!exists) {
        const newAddresses = [...existingAddresses, finalAddress];
        localStorage.setItem('savedAddresses', JSON.stringify(newAddresses));
        setSavedAddresses(newAddresses);
      }
    }
    
    // Update the location input in navbar
    const locationInput = document.querySelector('.location-input');
    if (locationInput) {
      locationInput.value = `${addressDetails.doorNo}, ${selectedLocation.mainText}`;
    }

    // Close modal
    resetLocationModal();

    // Dispatch event to notify CartPage
    window.dispatchEvent(new Event('storage'));
    
    alert(`Address saved: ${finalAddress.completeAddress}`);
  };

  // Handle delete address from saved addresses
  const handleDeleteAddress = (addressId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this address?")) {
      const updatedAddresses = savedAddresses.filter(addr => addr.id !== addressId);
      setSavedAddresses(updatedAddresses);
      localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
      
      // Reload the list
      loadSavedAddresses();
    }
  };

  // Handle select saved address
  const handleSelectSavedAddress = (address) => {
    setSelectedLocation(address);
    setShowAddressMap(true);
    setAddressDetails(prev => ({
      ...prev,
      doorNo: address.doorNo,
      landmark: address.landmark,
      addressType: address.addressType
    }));
  };

  const getAddressTypeIcon = (type) => {
    switch (type) {
      case 'home': return <MdHome className="me-2" />;
      case 'work': return <MdBusinessCenter className="me-2" />;
      case 'other': return <MdApartment className="me-2" />;
      default: return <MdHome className="me-2" />;
    }
  };

  const resetLocationModal = () => {
    setShowLocationPopup(false);
    setShowAddressMap(false);
    setSelectedLocation(null);
    setLocationSearch("");
    setSuggestedLocations([]);
    setCurrentLocationStatus("idle");
    setAddressDetails({
      doorNo: "",
      landmark: "",
      addressType: "home",
      saveAddress: false
    });
  };

  return (
    <>
      <Navbar sticky="top" expand="md" className="urban-nav position-sticky top-0 d-flex justify-content-between">
        {location.pathname === "/cart" ? (
          <Container fluid className="py-2">
            <Row>
              <Col>
              <img 
                src={logo1} 
                alt="UC Logo" 
                style={{ height: "34px", marginLeft: "10px" }} 
                onError={(e) => {
                  console.error("Failed to load logo:", logo1);
                  e.target.src = "http://localhost:5000/assets/urban.png";
                }}
                onLoad={() => console.log("Logo loaded successfully:", logo1)}
              /> </Col>
              <Col><span className="fw-semibold" style={{fontSize:"20px"}}>Checkout</span></Col>
            </Row>
          </Container>
        ) : (       
          <Container fluid className="d-flex justify-content-between align-items-center">
            {/* Logo Section */}
            <Navbar.Brand className="d-flex align-items-center left display">
              <img 
                src={logo} 
                alt="UC Logo" 
                className="logo w-100 h-auto"
                style={{ maxHeight: "40px", objectFit: "contain" }}
                onError={(e) => {
                  console.error("Failed to load main logo:", logo);
                  e.target.src = "http://localhost:5000/assets/Uc.png";
                }}
                onLoad={() => console.log("Main logo loaded successfully:", logo)}
              />
              {!location.pathname.startsWith("/salon") && (
                <span
                  className="native-text"
                  style={{ color: "#545454ff", fontSize: "16px" }}
                >
                  Native
                </span>
              )}
            </Navbar.Brand>

            <Navbar.Toggle aria-controls="basic-navbar-nav" />

            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="d-flex gap-2 left flex-row flex-wrap">
                {/* Location input */}
                <div
                className="location-input-container position-relative desktop-only"
                onClick={() => setShowLocationPopup(true)}
                style={{ cursor: "pointer" }}
              >
                <CiLocationOn className="location-icon-inside position-absolute top-50 left1" />
                
                <FormControl
                  type="text"
                  placeholder="184, Balaji Nagar-New..."
                  readOnly
                  className="location-input"
                />

                <IoIosArrowDown className="location-icon-inside position-absolute top-50 right" />
              </div>

                {/* Search bar */}
                <div className="position-relative desktop-only" ref={dropdownRef}>
                  <CiSearch className="location-icon-inside position-absolute top-50 left" />
                  <FormControl
                    type="text"
                    placeholder={placeholder}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onClick={() => setShowDropdown(true)}
                    className="location-input"
                  />
                  {showDropdown && (
                    <Searchdropdown
                      searchValue={searchValue}
                      onSelect={(val) => {
                        setSearchValue(val);
                        setShowDropdown(false);
                      }}
                    />
                  )}
                </div>

                {/* Icons */}
                {!location.pathname.startsWith("/salon") && (
                  <div className="icons display desktop-only">
                    <LuNotepadText size={20} />
                    <CiShoppingCart size={20} />
                    <CgProfile size={20} onClick={handleAccountClick} style={{ cursor: 'pointer' }} />
                  </div>
                )}
              </Nav>
            </Navbar.Collapse>

            {/* Mobile View */}
            <div className="mobile-only w-100">
              <div className="location-line display">
                <div className="location-container">
                  <div className="location-top display">
                    <CiLocationOn style={{ fontWeight: "bold" }} />
                    <span className="location-text" style={{ fontWeight: "bold" }}>
                      184
                    </span>
                  </div>
                  <span
                    className="dropdown-toggle"
                    onClick={() => setShowLocationPopup(true)}
                  >
                    Balaji Nagar-New Siddhapudur-Coimbatore-...
                  </span>
                </div>

                {!location.pathname.startsWith("/salon") && (
                  <CiShoppingCart className="cart-icon" />
                )}
              </div>

              <div className="search-line">
                <div className="position-relative" ref={dropdownRef}>
                  <FormControl
                    type="text"
                    placeholder={placeholder}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onClick={() => setShowDropdown(true)}
                    className="location-input"
                  />
                  {showDropdown && (
                    <Searchdropdown
                      searchValue={searchValue}
                      onSelect={(val) => {
                        setSearchValue(val);
                        setShowDropdown(false);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </Container>
        )}
      </Navbar>

      {/* Mobile Bottom Navigation Bar */}
      {location.pathname !== "/cart" && (
        <div className="d-block d-sm-none">
          <nav className="mobile-bottom-nav fixed-bottom bg-white border-top shadow-sm">
            <div className="container-fluid">
              <div className="row text-center">
                <div className="col-3">
                  <div className="nav-item">
                    <img 
                      src={logo1} 
                      alt="UC Logo" 
                      style={{ 
                        height: "18px", 
                        width: "auto", 
                        marginBottom: "4px",
                        objectFit: "contain" 
                      }}
                      onError={(e) => {
                        console.error("Failed to load logo1:", logo1);
                        e.target.src = "http://localhost:5000/assets/uc.png";
                      }}
                      onLoad={() => console.log("Logo1 loaded successfully:", logo1)}
                    />
                    <div className="nav-label" style={{ fontSize: "12px" }}>UC</div>
                  </div>
                </div>
                <div className="col-3">
                  <div className="nav-item">
                    <IoMdHelpCircleOutline size={18} className="mb-1" style={{color:"#8b8b8bff"}} />
                    <div className="nav-label" style={{ fontSize: "12px" }}>help</div>
                  </div>
                </div>
                <div className="col-3">
                  <div className="nav-item">
                    <GoHomeFill size={18} className="mb-1" />
                    <div className="nav-label" style={{ fontSize: "12px" }}>Cart</div>
                  </div>
                </div>
                <div className="col-3">
                  <div className="nav-item" onClick={handleAccountClick} style={{ cursor: 'pointer' }}>
                    <MdAccountCircle size={18} className="mb-1" />
                    <div className="nav-label" style={{ fontSize: "12px" }}>Account</div>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Account Modal */}
      <AccountModal 
        show={showAccountModal}
        onHide={() => setShowAccountModal(false)}
      />

      {/* Enhanced Location Modal */}
      <Modal
        show={showLocationPopup}
        onHide={resetLocationModal}
        centered
        size={showAddressMap ? "xl" : "lg"}
        dialogClassName="location-modal"
      >
        <Modal.Header closeButton className="border-bottom-0">
          <Modal.Title className="fw-bold">
            {showAddressMap ? "Confirm Your Address" : "Select Location"}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="p-0" style={{ maxHeight: "80vh", overflowY: "auto" }}>
          {!showAddressMap ? (
            // Location Search View
            <>
              <div className="p-4 border-bottom">
                <div className="position-relative w-100">
                  <CiSearch className="position-absolute top-50 start-3 translate-middle-y" size={20} />
                  <input
                    type="text"
                    placeholder="Search for area, street, landmark..."
                    className="popup-search-input w-100 ps-5"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                
                <div className="mt-3">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleUseCurrentLocation();
                    }}
                    style={{
                      display: "inline-flex",
                      gap: "8px",
                      textDecoration: "none",
                      color: "#033870ff",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    <IoMdLocate size={20} /> 
                    {currentLocationStatus === "fetching" ? "Fetching your location..." : "Use my current location"}
                  </a>
                  {currentLocationStatus === "fetching" && (
                    <div className="mt-2 text-muted small">
                      <em>Location not fetched yet...</em>
                    </div>
                  )}
                </div>
              </div>

              {/* Saved Addresses Section */}
              {savedAddresses.length > 0 && (
                <div className="border-bottom">
                  <div className="p-4">
                    <h6 className="fw-semibold mb-3">Saved Addresses</h6>
                    <div className="d-grid gap-2">
                      {savedAddresses.map((address) => (
                        <div
                          key={address.id}
                          className="p-3 border rounded bg-white position-relative"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleSelectSavedAddress(address)}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <h6 className="fw-semibold mb-1">
                                {address.doorNo}, {address.mainText}
                              </h6>
                              <p className="text-muted small mb-1">
                                {address.landmark && `Near ${address.landmark}, `}
                                {address.subText}
                              </p>
                              <span className="badge bg-light text-dark border small">
                                {address.addressType || 'Home'}
                              </span>
                            </div>
                            <Dropdown>
                            <Dropdown.Toggle 
                              variant="light" 
                              size="sm"
                              className="border-0 p-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                            >
                              <MdMoreVert size={16} />
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                              <Dropdown.Item 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAddress(address.id, e);
                                }}
                                className="text-danger"
                              >
                                <MdDelete className="me-2" />
                                Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Location Suggestions - ONLY show when searching */}
              {suggestedLocations.length > 0 && (
                <div>
                  <div className="p-3 bg-light border-bottom">
                    <h6 className="fw-semibold mb-2">Search Results</h6>
                  </div>
                  {suggestedLocations.map((location) => (
                    <div
                      key={location.id}
                      className="p-3 border-bottom"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleLocationSelect(location)}
                    >
                      <div className="d-flex align-items-start">
                        <CiLocationOn size={20} className="text-muted mt-1 me-3" />
                        <div>
                          <h6 className="fw-semibold mb-1">{location.mainText}</h6>
                          <p className="text-muted mb-0 small">{location.subText}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Show message when no search results */}
              {locationSearch.trim() && suggestedLocations.length === 0 && (
                <div className="p-4 text-center text-muted">
                  <p>No locations found for "{locationSearch}"</p>
                  <p className="small">Try searching with different keywords</p>
                </div>
              )}

              {/* Show message when no addresses and no search */}
              {savedAddresses.length === 0 && !locationSearch.trim() && (
                <div className="p-4 text-center text-muted">
                  <p>No saved addresses yet</p>
                  <p className="small">Search for a location or use current location to add an address</p>
                </div>
              )}
            </>
          ) : (
            // Map & Address Details View - Split layout
            <Row className="g-0">
              {/* Left Side - Map */}
              <Col md={7}>
                <div 
                  className="position-relative bg-light"
                  style={{ height: "500px", backgroundColor: "#f8f9fa" }}
                >
                  {/* Mock Map */}
                  <div 
                    className="w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ 
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white"
                    }}
                  >
                    <div className="text-center">
                      <CiLocationOn size={48} className="mb-3" />
                      <h5>Map View</h5>
                      <p className="mb-0">Interactive map would be displayed here</p>
                      <small>Google Maps/Mapbox integration</small>
                      <div className="mt-3">
                        <div className="bg-white text-dark p-2 rounded d-inline-block">
                           {selectedLocation?.mainText}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>

              {/* Right Side - Address Details */}
              <Col md={5}>
                <div className="p-4" style={{ height: "500px", overflowY: "auto" }}>
                  <h6 className="fw-semibold mb-3">Add Address Details</h6>
                  
                  {/* Selected Location Preview */}
                  <div className="bg-light p-3 rounded mb-4">
                    <h6 className="fw-semibold mb-1">Selected Location</h6>
                    <p className="text-muted mb-0 small">{selectedLocation?.fullAddress}</p>
                  </div>

                  {/* Door Number */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Door / Flat / House No. *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter door number, flat number, etc."
                      value={addressDetails.doorNo}
                      onChange={(e) => setAddressDetails(prev => ({ ...prev, doorNo: e.target.value }))}
                      autoFocus
                    />
                  </div>

                  {/* Landmark */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Landmark (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nearby landmark, e.g., Near Central Mall"
                      value={addressDetails.landmark}
                      onChange={(e) => setAddressDetails(prev => ({ ...prev, landmark: e.target.value }))}
                    />
                  </div>

                  {/* Address Type */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Save as</label>
                    <div className="d-flex gap-2">
                      {[
                        { value: 'home', label: 'Home', icon: <MdHome /> },
                        { value: 'work', label: 'Work', icon: <MdBusinessCenter /> },
                        { value: 'other', label: 'Other', icon: <MdApartment /> }
                      ].map((type) => (
                        <Button
                          key={type.value}
                          variant={addressDetails.addressType === type.value ? "primary" : "outline-secondary"}
                          className="d-flex align-items-center gap-1 flex-grow-1"
                          onClick={() => setAddressDetails(prev => ({ ...prev, addressType: type.value }))}
                        >
                          {type.icon}
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Save Address Checkbox */}
                  <div className="form-check mb-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={addressDetails.saveAddress}
                      onChange={(e) => setAddressDetails(prev => ({ ...prev, saveAddress: e.target.checked }))}
                      id="saveAddress"
                    />
                    <label className="form-check-label" htmlFor="saveAddress">
                      Save this address for faster checkout
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      className="flex-grow-1"
                      onClick={() => setShowAddressMap(false)}
                    >
                      Back
                    </Button>
                    <Button
                      className="butn flex-grow-1"
                      onClick={handleAddressSubmit}
                      disabled={!addressDetails.doorNo.trim()}
                    >
                      Confirm Location
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Urbanav;