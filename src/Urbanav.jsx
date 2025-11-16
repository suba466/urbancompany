import React, { useState, useEffect, useRef } from "react";
import {
  Navbar,
  Container,
  Nav,
  FormControl,
  Modal,
  Button,
} from "react-bootstrap";
import { CiLocationOn, CiShoppingCart, CiSearch } from "react-icons/ci";
import { IoIosArrowDown } from "react-icons/io";
import { BiLeftArrowAlt } from "react-icons/bi";
import { LuNotepadText } from "react-icons/lu";
import { CgProfile } from "react-icons/cg";
import { IoMdLocate } from "react-icons/io";
import { useLocation } from "react-router-dom";
import Searchdropdown from "./Searchdropdown.jsx";
import "./Urbancom.css";

function Urbanav() {
  const [logo, setLogo] = useState("/assets/Uc.png");
  const [searchValue, setSearchValue] = useState("");
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [placeholder, setPlaceholder] = useState("Search for ");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation(); //  Detects current route
  const fixedText = "Search for ";
  const words = ["'AC Service'", "'Facial'", "'Kitchen Cleaning'"];
  const typingSpeed = 120;
  const erasingSpeed = 80;
  const delayBetweenWords = 1200;

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

  // Fetch logo from backend (development mode)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      fetch("http://localhost:5000/api/logo")
        .then((res) => res.json())
        .then((data) => setLogo(`http://localhost:5000${data.logo}`))
        .catch((err) => console.error("Error fetching logo:", err));
    }
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

  return (
    <>
      <Navbar sticky="top" expand="md" className="urban-nav display">
         {location.pathname === "/cart" ? (
        <Container fluid className=" py-2">
          <span>
            <img 
            src={logo} 
            alt="UC Logo" 
            style={{ height: "34px", marginLeft: "10px" }} /> <span className="fw-semibold" style={{fontSize:"20px"}}>Checkout</span>
          </span>
          
        </Container>
      ) : (       
        <Container fluid className="d-flex justify-content-between align-items-center">
          {/*  Show logo always, hide only 'Native' on /salon */}
          <Navbar.Brand className="d-flex align-items-center left display">
            {logo && <img src={logo} alt="UC Logo" className="logo" />}
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
            <Nav className="d-flex gap-2 right-menu left display">
              {/* 📍 Location input */}
              <div className="location-input-container display desktop-only">
                <CiLocationOn className="location-icon-inside left1 display" />
                <FormControl
                  type="text"
                  placeholder="184, Balaji Nagar-New..."
                  readOnly
                  className="location-input"
                />
                <IoIosArrowDown className="location-icon-inside right" />
              </div>

              {/* 🔍 Search bar */}
              <div className="search-container desktop-only" ref={dropdownRef}>
                <CiSearch className="location-icon-inside display left" />
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

              {/* 🧾 Icons (hide only on /salon) */}
              {!location.pathname.startsWith("/salon") && (
                <div className="icons display desktop-only">
                  <LuNotepadText size={20} />
                  <CiShoppingCart size={20} />
                  <CgProfile size={20} />
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
              <div className="search-container" ref={dropdownRef}>
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
        </Container>)}
      </Navbar>

      {/* 📍 Location Modal */}
      <Modal
        show={showLocationPopup}
        onHide={() => setShowLocationPopup(false)}
        centered
        dialogClassName="location-modal"
      >
        <Button
          onClick={() => setShowLocationPopup(false)}
          className="display closebtn"
        >
          ✕
        </Button>
        <Modal.Body className="p-4">
          <div className="modal-search-container">
            <BiLeftArrowAlt
              className="modal-left-icon"
              onClick={() => setShowLocationPopup(false)}
              style={{ cursor: "pointer" }}
            />
            <input
              type="text"
              placeholder="Search location/city/apartment..."
              className="popup-search-input"
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
