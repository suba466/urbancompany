import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Dropdown, Modal } from 'react-bootstrap';
import { IoMdLocate } from "react-icons/io";
import { FaLocationDot } from "react-icons/fa6";
import { CiSearch } from "react-icons/ci";
import { useState, useEffect } from 'react';
import { LuNotepadText } from "react-icons/lu";
import { LuShoppingCart } from "react-icons/lu";
import { IoMdContact } from "react-icons/io";
import SearchDropdown from './Searchdropdown.jsx';
import './Urbanav.css';

function Urbloc() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);

  const placeholders = ["Facial", "AC Service", "Kitchen cleaning"];
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const currentWord = placeholders[index];
    const speed = deleting ? 80 : 120;
    const timer = setTimeout(() => {
      if (!deleting && subIndex < currentWord.length) {
        setSubIndex(subIndex + 1);
      } else if (!deleting && subIndex === currentWord.length) {
        setDeleting(true);
      } else if (deleting && subIndex > 0) {
        setSubIndex(subIndex - 1);
      } else if (deleting && subIndex === 0) {
        setDeleting(false);
        setIndex((prev) => (prev + 1) % placeholders.length);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [subIndex, deleting, index, placeholders]);

  return (
    <>

      <Row className="align-items-center justify-content-end g-5 w-100 desktop-layout">
        <Col xs="auto">
          <Dropdown className="location-box">
            <Dropdown.Toggle
              variant="outline-secondary"
              onClick={handleShow}
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                fontSize: "12px"
              }}>
              <FaLocationDot style={{ marginRight: "6px" }} />
              184, Balaji Nagar- New....
            </Dropdown.Toggle>
          </Dropdown>

          <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton></Modal.Header>
            <Modal.Body>
              <input
                type="text"
                placeholder="Search location..."
                className="mr-sm-2"
              />
              <a
                href="#"
                style={{
                  color: "#1a6692",
                  textDecoration: "none",
                  fontSize: "12px"
                }}
              >
                <IoMdLocate /> Use current location
              </a>
            </Modal.Body>
          </Modal>
        </Col>

        <Col xs="auto">
          <div className="search-wrapper w-100" style={{ position: "relative" }}>
            {searchValue === "" && <CiSearch className="search-icon" />}
            <input
              type="text"
              value={searchValue}
              onFocus={() => setOpen(true)}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={
                "     Search for " + placeholders[index].substring(0, subIndex) + "..."
              }
              className="form-control search-box"
              style={{
                width: "250px",
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                fontSize: "12px"
              }}
            />
            {open && (
              <SearchDropdown
                searchValue={searchValue}
                onSelect={(val) => {
                  setSearchValue(val);
                  setOpen(false);
                }}
              />
            )}
          </div>
        </Col>

        <Col xs="auto"><LuNotepadText className="note row-sm" /></Col>
        <Col xs="auto"><LuShoppingCart className="note row-sm" /></Col>
        <Col xs="auto"><IoMdContact className="note row-sm" /></Col>
      </Row>

 
      <Row className="mobile-layout w-100">
        <Col xs={12} className="location-box">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <FaLocationDot style={{ color: "black", fontSize: "18px" }} />
                  <strong style={{ color: "black", fontSize: "16px" }}>184</strong>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>
                    Balaji Nagar - New Sidhapudur - Coim...
                  </p>
                  <span style={{ fontSize: "12px", color: "#555" }}>▼</span>
                </div>
              </div>
            </div>
            <LuShoppingCart
              className="cart-icon"
              style={{
                fontSize: "22px",
                marginLeft: "8px",
                marginRight: "2px",
                flexShrink: 0
              }}
            />
          </div>
        </Col>

        <Modal show={show} onHide={handleClose} centered>
          <Modal.Header closeButton></Modal.Header>
          <Modal.Body>
            <input type="text" placeholder="Search location..." className="mr-sm-2" />
            <a
              href="#"
              style={{
                color: "#1a6692",
                textDecoration: "none",
                fontSize: "12px"
              }}
            >
              <IoMdLocate /> Use current location
            </a>
          </Modal.Body>
        </Modal>

        <Col xs={12} className="d-flex align-items-center mt-2">
          <div className="search-wrapper w-100" style={{ position: "relative" }}>
            {searchValue === "" && <CiSearch className="search-icon" />}
            <input
              type="text"
              value={searchValue}
              onFocus={() => setOpen(true)}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={
                "     Search for " + placeholders[index].substring(0, subIndex) + "..."
              }
              className="form-control search-box"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                fontSize: "12px"
              }}
            />
            {open && (
              <SearchDropdown
                searchValue={searchValue}
                onSelect={(val) => {
                  setSearchValue(val);
                  setOpen(false);
                }}
              />
            )}
          </div>
        </Col>
      </Row>
    </>
  );
}

export default Urbloc;
