import React, { useState, useEffect, useRef } from "react";
import {
  Navbar,
  Container,
  Nav,
  FormControl,
  Modal,
  Button,
} from "react-bootstrap";
import { CiLocationOn, CiShoppingCart, CiSearch, CiHome, CiUser } from "react-icons/ci";
import { IoIosArrowDown } from "react-icons/io";
import { BiLeftArrowAlt } from "react-icons/bi";
import { LuNotepadText } from "react-icons/lu";
import { CgProfile } from "react-icons/cg";
import { IoMdLocate } from "react-icons/io";
import { useLocation } from "react-router-dom";
import Searchdropdown from "./Searchdropdown.jsx";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { GoHomeFill } from "react-icons/go";
import { MdAccountCircle } from "react-icons/md";
import AccountModal from "./AccountModal"; // Import from separate file
import "./Urbancom.css";

function Urbanav() {
  const [logo, setLogo] = useState("/assets/Uc.png");
  const [searchValue, setSearchValue] = useState("");
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [placeholder, setPlaceholder] = useState("Search for ");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const fixedText = "Search for ";
  const words = ["'AC Service'", "'Facial'", "'Kitchen Cleaning'"];
  const typingSpeed = 120;
  const erasingSpeed = 80;
  const delayBetweenWords = 1200;

  // Fetch logo from backend
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

  const handleAccountClick = () => {
    setShowAccountModal(true);
  };

  return (
    <>
      <Navbar sticky="top" expand="md" className="urban-nav position-sticky top-0 d-flex justify-content-between">
        {location.pathname === "/cart" ? (
          <Container fluid className="py-2">
            <span>
              <img 
                src={logo} 
                alt="UC Logo" 
                style={{ height: "34px", marginLeft: "10px" }} 
                onError={(e) => {
                  e.target.src = "/assets/Uc.png";
                }}
              /> 
              <span className="fw-semibold" style={{fontSize:"20px"}}>Checkout</span>
            </span>
            
            {/* Cart Icon positioned to the right in cart page */}
            <div className="position-absolute" style={{ right: "20px", top: "50%", transform: "translateY(-50%)" }}>
              <CiShoppingCart size={24} className="text-dark" />
            </div>
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
                  e.target.src = "/assets/Uc.png";
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
                <div className="location-input-container position-relative desktop-only">
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

                {/* Icons (hide only on /salon) */}
                {!location.pathname.startsWith("/salon") && (
                  <div className="icons display desktop-only">
                    <LuNotepadText size={20} />
                    <CiShoppingCart size={20} />
                    <CgProfile size={20} onClick={handleAccountClick} style={{ cursor: 'pointer' }} />
                  </div>
                )}
              </Nav>
            </Navbar.Collapse>

            {/* 📱 Mobile View */}
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

      {/* 📱 Mobile Bottom Navigation Bar - Visible only at 425px and below */}
      <div className="d-block d-sm-none">
        <nav className="mobile-bottom-nav fixed-bottom bg-white border-top shadow-sm">
          <div className="container-fluid">
            <div className="row text-center">
              <div className="col-3">
                <div className="nav-item">
                  <CiHome size={18} className="mb-1" />
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

      {/* Account Modal */}
      <AccountModal 
        show={showAccountModal}
        onHide={() => setShowAccountModal(false)}
      />

      {/* Location Modal */}
      <Modal
        show={showLocationPopup}
        onHide={() => setShowLocationPopup(false)}
        centered
        dialogClassName="location-modal"
      >
        <Button
          onClick={() => setShowLocationPopup(false)}
          className="d-flex align-items-center position-absolute border-0 justify-content-center closebtn"
        >
          ✕
        </Button>
        <Modal.Body className="p-4">
          <div className="position-relative w-100" style={{marginBottom:"10px"}}>
            <BiLeftArrowAlt
              className="modal-left-icon top-50 position-absolute"
              onClick={() => setShowLocationPopup(false)}
              style={{ cursor: "pointer" }}
            />
            <input
              type="text"
              placeholder="Search location/city/apartment..."
              className="popup-search-input w-100"
            />
          </div>
          <div className="mt-3">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("Using current location...");
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
              <IoMdLocate size={20} /> Use my current location
            </a>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Urbanav;