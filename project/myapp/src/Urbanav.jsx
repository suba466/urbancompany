import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch, getAssetPath } from "./config";
import {
  Navbar, Container, Nav, FormControl, Modal, Button, Row, Col, Dropdown, Badge
} from "react-bootstrap";
import { CiLocationOn, CiShoppingCart, CiSearch } from "react-icons/ci";
import { IoIosArrowDown } from "react-icons/io";
import { LuNotepadText } from "react-icons/lu";
import { CgProfile } from "react-icons/cg";
import { IoMdLocate } from "react-icons/io";
import Searchdropdown from "./Searchdropdown.jsx";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { GoHomeFill } from "react-icons/go";
import { MdAccountCircle, MdHome, MdApartment, MdBusinessCenter, MdDelete, MdMoreVert } from "react-icons/md";
import AccountModal from "./AccountModal";
import { useCart, useAuth } from "./hooks"; // Import from hooks
import "./Urbancom.css";
// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with React
// Note: In some build setups, you might need to import images explicitly.
// For a simple Vite setup, we try to use the CDN or local node_modules referencing if possible,
// but often explicit imports work best.
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function Urbanav() {
  const navigate = useNavigate();
  const [logo, setLogo] = useState(getAssetPath("assets/Uc.png"));
  const [logo1, setLogo1] = useState(getAssetPath("assets/urban.png"));
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
  const [currentLocationStatus, setCurrentLocationStatus] = useState("idle");
  const [savedAddresses, setSavedAddresses] = useState([]);

  // Use Redux hooks
  const { items, count, clear: clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const dropdownRef = useRef(null);
  const location = useLocation();
  const fixedText = "Search for ";
  const words = ["'AC Service'", "'Facial'", "'Kitchen Cleaning'"];
  const typingSpeed = 120;
  const erasingSpeed = 80;
  const delayBetweenWords = 1200;

  // Mock location database
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
        const data = await apiFetch("/api/static-data");
        console.log("Static data received:", data);

        if (data && data.logo) {
          setLogo(getAssetPath(data.logo));
        } else {
          setLogo(getAssetPath("assets/Uc.png"));
        }

        if (data && data.logo1) {
          setLogo1(getAssetPath(data.logo1));
        }
      } catch (error) {
        console.error("Error fetching logos:", error);
        setLogo(getAssetPath("assets/Uc.png"));
        setLogo1(getAssetPath("assets/urban.png"));
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

  // Filter locations based on search
  useEffect(() => {
    if (locationSearch.trim()) {
      const filtered = locationDatabase.filter(loc =>
        loc.mainText.toLowerCase().includes(locationSearch.toLowerCase()) ||
        loc.subText.toLowerCase().includes(locationSearch.toLowerCase()) ||
        loc.fullAddress.toLowerCase().includes(locationSearch.toLowerCase())
      );
      setSuggestedLocations(filtered);
    } else {
      setSuggestedLocations([]);
    }
  }, [locationSearch]);

  // Listen for location modal open events from CartPage
  useEffect(() => {
    const handleOpenLocationModal = () => {
      console.log("Opening location modal from CartPage");
      setShowLocationPopup(true);
      loadSavedAddresses();
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

  // Auto-fetch location when modal opens
  useEffect(() => {
    if (showLocationPopup && !selectedLocation && savedAddresses.length === 0) {
      // Automatically trigger location fetch when modal opens for the first time
      handleUseCurrentLocation();
    }
  }, [showLocationPopup]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      // Cart count will update automatically through context
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const handleAccountClick = () => {
    setShowAccountModal(true);
  };

  const handleCartClick = () => {
    navigate('/cart-summary');
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setShowAddressMap(true);
    setAddressDetails(prev => ({
      ...prev,
      landmark: location.mainText
    }));
  };

  const handleUseCurrentLocation = () => {
    setCurrentLocationStatus("fetching");
    setIsGettingLocation(true);
    setLocationSearch("");
    setSuggestedLocations([]);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Set coordinates immediately and show map
          const tempLocation = {
            id: Date.now(),
            mainText: "Fetching address...",
            subText: "Please wait...",
            fullAddress: "Locating your address...",
            coordinates: { lat, lng }
          };
          setSelectedLocation(tempLocation);
          setShowAddressMap(true);

          // Reverse geocode to get address
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();

            if (data && data.display_name) {
              const parts = data.display_name.split(', ');
              const mainText = parts.length > 0 ? parts[0] : "Your Current Location";
              const subText = parts.slice(1, 3).join(', ');

              setSelectedLocation({
                id: Date.now(),
                mainText: mainText,
                subText: subText,
                fullAddress: data.display_name,
                coordinates: { lat, lng }
              });

              setAddressDetails(prev => ({
                ...prev,
                landmark: mainText
              }));
            }
          } catch (error) {
            console.error("Reverse geocoding failed:", error);
            setSelectedLocation({
              id: Date.now(),
              mainText: "Your Current Location",
              subText: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
              fullAddress: `Current location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
              coordinates: { lat, lng }
            });
          }

          setCurrentLocationStatus("fetched");
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Unable to get your location. Please check your browser permissions or search for your address manually.");
          setCurrentLocationStatus("idle");
          setIsGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert("Geolocation is not supported by your browser. Please search for your address manually.");
      setCurrentLocationStatus("idle");
      setIsGettingLocation(false);
    }
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
      id: Date.now()
    };

    console.log("Final address:", finalAddress);

    localStorage.setItem('selectedAddress', JSON.stringify(finalAddress));

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

    const locationInput = document.querySelector('.location-input');
    if (locationInput) {
      locationInput.value = `${addressDetails.doorNo}, ${selectedLocation.mainText}`;
    }

    resetLocationModal();
    window.dispatchEvent(new Event('storage'));
    alert(`Address saved: ${finalAddress.completeAddress}`);
  };

  const handleDeleteAddress = (addressId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this address?")) {
      const updatedAddresses = savedAddresses.filter(addr => addr.id !== addressId);
      setSavedAddresses(updatedAddresses);
      localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
      loadSavedAddresses();
    }
  };

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
    setIsGettingLocation(false);
    setAddressDetails({
      doorNo: "",
      landmark: "",
      addressType: "home",
      saveAddress: false
    });
  };

  // Cart count badge component
  const CartBadge = ({ count, size = "sm" }) => {
    if (count === 0) return null;

    const badgeSize = size === "lg" ? {
      fontSize: "11px",
      padding: "4px 8px",
      minWidth: "20px",
      height: "20px"
    } : {
      fontSize: "10px",
      padding: "2px 6px",
      minWidth: "18px",
      height: "18px"
    };

    return (
      <Badge
        bg="danger"
        className="position-absolute top-0 start-100 translate-middle"
        style={{
          ...badgeSize,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {count > 9 ? "9+" : count}
      </Badge>
    );
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
                    e.target.src = getAssetPath("assets/urban.png");
                  }}
                />
              </Col>
              <Col>
                <span className="fw-semibold" style={{ fontSize: "20px" }}>Checkout</span>
              </Col>
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
                  e.target.src = getAssetPath("assets/Uc.png");
                }}
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
                  <CiSearch className="location-icon-inside position-absolute top-50 " />
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


                {/* Icons - Desktop */}
                {!location.pathname.startsWith("/salon") && (
                  <div className="icons display desktop-only d-flex align-items-center gap-3"
                    style={{ marginLeft: 'auto' }}>
                    {/* Cart Icon with Badge - Navigates to CartSummary page */}
                    <div
                      className="position-relative"
                      onClick={handleCartClick}
                      style={{ cursor: "pointer" }}
                    >
                      <CiShoppingCart size={20} className="text-muted" />
                      <CartBadge count={count} />
                    </div>

                    <CgProfile
                      size={20}
                      className="text-muted"
                      onClick={handleAccountClick}
                      style={{ cursor: 'pointer' }}
                    />
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

                {/* Mobile Cart Icon with Badge - Navigates to CartSummary page */}
                {!location.pathname.startsWith("/salon") && (
                  <div
                    className="position-relative "
                    onClick={handleCartClick}
                    style={{ cursor: "pointer" }}
                  >
                    <CiShoppingCart />
                    <CartBadge count={count} size="lg" />
                  </div>
                )}
              </div>

              <div className="search-line ">
                <div className="position-relative w-100" ref={dropdownRef}>
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
                        e.target.src = getAssetPath("assets/Uc.png");
                      }}
                    />
                    <div className="nav-label" style={{ fontSize: "12px" }}>UC</div>
                  </div>
                </div>
                <div className="col-3">
                  <div className="nav-item">
                    <IoMdHelpCircleOutline size={18} className="mb-1" style={{ color: "#8b8b8bff" }} />
                    <div className="nav-label" style={{ fontSize: "12px" }}>help</div>
                  </div>
                </div>
                <div className="col-3">
                  {/* Mobile Bottom Cart Icon - Navigates to CartSummary page */}
                  <div
                    className="nav-item position-relative"
                    onClick={handleCartClick}
                    style={{ cursor: 'pointer' }}
                  >
                    <GoHomeFill size={18} className="mb-1" />
                    <div className="nav-label" style={{ fontSize: "12px" }}>Cart</div>
                    <CartBadge count={count} size="sm" />
                  </div>
                </div>
                <div className="col-3">
                  <div className="nav-item" onClick={handleAccountClick} style={{ cursor: 'pointer' }}>
                    <MdAccountCircle size={18} className="mb-1" />
                    <div className="nav-label" style={{ fontSize: "12px" }}>Account</div>
                    {isAuthenticated && user?.name && (
                      <span className="position-absolute top-0 start-100 translate-middle badge bg-success" style={{ fontSize: "8px" }}>
                        ✓
                      </span>
                    )}
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
        <Modal.Header className="border-bottom-0 position-relative">
          <Modal.Title className="fw-bold">
            {showAddressMap ? "Confirm Your Address" : "Select Location"}
          </Modal.Title>
          <Button
            type="button"
            onClick={resetLocationModal}
            className="position-absolute border-0 justify-content-center closebtn p-0">X
          </Button>
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

              {/* Location Suggestions */}
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

              {/* Loading State */}
              {currentLocationStatus === "fetching" && (
                <div className="p-4 text-center">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted">Fetching your current location...</p>
                  <div className="border-top pt-3">
                    <span className="text-muted small">Location not fetched yet...</span>
                  </div>
                </div>
              )}

              {/* Default State */}
              {currentLocationStatus !== "fetching" && savedAddresses.length === 0 && !locationSearch.trim() && (
                <div className="p-4">
                  <div className="text-center text-muted mb-4">
                    <p>Search for a location or use current location to add an address</p>
                  </div>
                  <div className="border-top pt-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted small">Powered by Google</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Map & Address Details View
            <Row className="g-0">
              <Col md={7}>
                {/* Map View */}
                <div className="position-relative" style={{ height: "320px" }}>
                  <MapContainer
                    center={[selectedLocation?.coordinates?.lat || 11.0168, selectedLocation?.coordinates?.lng || 76.9558]}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                    <MapController selectedLocation={selectedLocation} />
                    <DraggableMarker
                      position={[selectedLocation?.coordinates?.lat || 11.0168, selectedLocation?.coordinates?.lng || 76.9558]}
                      onDragEnd={async (newPos) => {
                        const lat = newPos.lat;
                        const lng = newPos.lng;

                        // Optimistically update coordinates first
                        setSelectedLocation(prev => ({
                          ...prev,
                          coordinates: { lat, lng },
                          mainText: "Fetching address...",
                          subText: "Please wait..."
                        }));

                        try {
                          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                          const data = await response.json();

                          if (data && data.display_name) {
                            // Extract relevant parts for better display
                            const parts = data.display_name.split(', ');
                            const mainText = parts.length > 0 ? parts[0] : "Pinned Location";
                            const subText = parts.slice(1).join(', ');

                            setSelectedLocation(prev => ({
                              ...prev,
                              mainText: mainText,
                              subText: subText,
                              fullAddress: data.display_name,
                              coordinates: { lat, lng }
                            }));

                            // Auto-fill landmark if possible
                            setAddressDetails(prev => ({
                              ...prev,
                              landmark: mainText
                            }));
                          }
                        } catch (error) {
                          console.error("Reverse geocoding failed:", error);
                          setSelectedLocation(prev => ({
                            ...prev,
                            mainText: "Pinned Location",
                            subText: "Address lookup failed"
                          }));
                        }
                      }}
                    />
                  </MapContainer>
                </div>
              </Col>

              <Col md={5}>
                <div className="p-4" style={{ height: "320px", overflowY: "auto" }}>
                  <h6 className="fw-semibold mb-3">Add Address Details</h6>

                  <div className="bg-light p-3 rounded mb-4">
                    <h6 className="fw-semibold mb-1">Selected Location</h6>
                    <p className="text-muted mb-0 small">{selectedLocation?.fullAddress}</p>
                  </div>

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

// Helper to re-center map when location changes
function MapController({ selectedLocation }) {
  const map = useMap();
  useEffect(() => {
    if (selectedLocation?.coordinates) {
      map.flyTo([selectedLocation.coordinates.lat, selectedLocation.coordinates.lng], map.getZoom());
    }
  }, [selectedLocation, map]);
  return null;
}

// Draggable Marker Component
function DraggableMarker({ position, onDragEnd }) {
  const markerRef = useRef(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          onDragEnd(marker.getLatLng());
        }
      },
    }),
    [onDragEnd],
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    >
      <Popup minWidth={90}>
        <span className="fw-semibold">Drag to adjust location</span>
      </Popup>
    </Marker>
  );
}

export default Urbanav;
