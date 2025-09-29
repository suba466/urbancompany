import React, { useState, useEffect, useRef } from "react";
import { Navbar, Container, Nav, FormControl, Modal, Button } from "react-bootstrap";
import { CiLocationOn, CiShoppingCart } from "react-icons/ci";
import { IoIosArrowDown } from "react-icons/io";
import { BiLeftArrowAlt } from "react-icons/bi";
import { LuNotepadText } from "react-icons/lu";
import { CgProfile } from "react-icons/cg";
import { IoMdLocate } from "react-icons/io";
import Searchdropdown from "./Searchdropdown.jsx";
import "./Urbancom.css";

function Urbanav() {
  const [logo, setLogo] = useState("");
  const [logo1,setLogo1]=useState("");
  const [searchValue, setSearchValue] = useState("");
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [placeholder, setPlaceholder] = useState("Search for ");
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const dropdownRef = useRef(null);

  const fixedText = "Search for ";
  const words = ["'AC Service'", "'Facial'", "'Kitchen Cleaning'"];
  const typingSpeed = 120;
  const erasingSpeed = 80;
  const delayBetweenWords = 1200;

  // Typing effect
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

  // Fetch logo
  useEffect(() => {
    fetch("http://localhost:5000/api/logo")
      .then((res) => res.json())
      .then((data) => setLogo(`http://localhost:5000${data.logo}`))
      .catch((err) => console.log(err));
  }, []);
  //Fetch logo for bottom menu
  useEffect(()=>{
    fetch("http://localhost:5000/api/logo1")
    .then((res)=>res.json())
    .then((data)=>setLogo1(`http://localhost:5000${data.logo1}`))
    .catch((err)=>console.log(err));
  },[]);
  // Close dropdown when clicking outside
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
      <Navbar sticky="top" className="urban-nav">
        <Container fluid className="d-flex justify-content-between align-items-center">

          {/* Desktop Left */}
          <Navbar.Brand className="d-flex align-items-center left">
            {logo && <img src={logo} alt="UC Logo" className="logo" />}
            <span className="native-text">Native</span>
          </Navbar.Brand>

          {/* Desktop Right */}
          <Nav className="d-flex gap-2 right-menu">
            <div className="location-input-container d-none d-lg-flex">
              <CiLocationOn className="location-icon-inside left" />
              <FormControl
                type="text"
                placeholder="184, Balaji Nagar-New..."
                readOnly
                className="location-input"
              />
              <IoIosArrowDown className="location-icon-inside right" />
            </div>

            <div className="search-container d-none d-lg-flex" ref={dropdownRef}>
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

            <div className="icons d-none d-lg-flex">
              <LuNotepadText size={20} />
              <CiShoppingCart size={20} />
              <CgProfile size={20} />
            </div>
          </Nav>

          {/* Tablet / Mobile Top */}
          <div className="d-lg-none w-100">
            <div className="location-line">
              <div className="location-container">
                <div className="location-top">
                  <CiLocationOn style={{ fontWeight: "bold" }} />
                  <span className="location-text" style={{ fontWeight: "bold" }}>184</span>
                </div>
                <span
                  className="dropdown-toggle"
                  onClick={() => setShowLocationPopup(true)}
                >
                  Balaji Nagar-New Siddhapudur-Coimbatore-...
                </span>
              </div>
              <CiShoppingCart className="cart-icon" />
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

        </Container>
      </Navbar>

      {/* Location Modal */}
      <Modal
        show={showLocationPopup}
        onHide={() => setShowLocationPopup(false)}
        centered
        dialogClassName="location-modal"
      >
        <Button onClick={() => setShowLocationPopup(false)} className="closebtn">✕</Button>
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
          <div className="use-location-container mt-3">
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

      {/* Bottom Menu for Tablet/Mobile */}
      <div className="d-lg-none bottom-menu">
        {[
          { type: "logo1", src: logo1, label: "" },
          { type: "icon", icon: <LuNotepadText size={22} />, label: "Bookings" },
          { type: "icon", icon: <CiShoppingCart size={22} />, label: "Help" },
          { type: "text", label: "Native" },
          { type: "icon", icon: <CgProfile size={22} />, label: "Account" },
        ].map((item, idx) => (
          <button
            key={idx}
            className={activeTab === idx ? "active" : ""}
            onClick={() => setActiveTab(idx)}
          >
            {item.type === "logo1" && item.src && (
              <img src={item.src} alt="Logo1" style={{ width: 24, height: 24 }} />
            )}
            {item.type === "icon" && item.icon}
            {item.type === "text" && <span>{item.label}</span>}
            {item.type !== "logo1" && <span>{item.label}</span>}
          </button>
        ))}
      </div>
    </>
  );
}

export default Urbanav;
