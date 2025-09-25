import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Button, Dropdown, Modal } from 'react-bootstrap';
import { IoMdLocate } from "react-icons/io";
import { FaLocationDot } from "react-icons/fa6";
import { CiSearch } from "react-icons/ci";
import { useState, useEffect } from 'react';
import { LuNotepadText, LuShoppingCart } from "react-icons/lu";
import { IoMdContact } from "react-icons/io";
import { PiNotepadBold } from "react-icons/pi";
import SearchDropdown from './Searchdropdown.jsx';
import { PiQuestionThin } from "react-icons/pi";
import { VscAccount } from "react-icons/vsc";
import uc from './assets/uc.png';
import './Urbanav.css';
import { FaArrowLeft } from "react-icons/fa";
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
      <Row className="align-items-center justify-content-end  w-100 desktop-layout" >
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
      <Row className="mobile-layout">
        <Col xs={12} className="d-flex justify-content-between align-items-start mb-2">
          <Dropdown className="location-box" style={{ flex: 1 }}>
            <Dropdown.Toggle
              variant="outline-secondary"
              onClick={handleShow}
              className="w-100"
              style={{
                padding: "8px 12px",border:"0",display: "flex",flexDirection: "row",alignItems: "flex-start", fontSize: "14px",lineHeight: "1",gap: "8px"
              }} >
              <FaLocationDot 
                style={{ color: 'black',fontSize: "22px",flexShrink: 0,marginTop: "2px" }}/>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <span style={{ fontWeight: "bold", fontSize: "20px", color: 'black' }}>184,</span> <br />
                <span style={{ fontSize: "18px"}}>Balaji Nagar-New ...</span>
              </div>
            </Dropdown.Toggle>
          </Dropdown>
          <div className='cart-Wrapper'>
          <LuShoppingCart className="cart-icon" style={{ fontSize: "24px", marginLeft: "12px", flexShrink: 0 }} />
        </div></Col>

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
              style={{width: "100%",padding: "8px",borderRadius: "5px",border: "1px solid #ccc",fontSize: "15px"}}/>
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
       <div className="sticky-bottom d-flex justify-content-around align-items-center">
  <div className="text-center">
    <img src={uc} alt="UC" style={{width:"15px"}} />
    <p style={{margin:0, fontSize:"10px"}}>UC</p>
  </div>
  <div className="text-center">
    <PiNotepadBold />
    <p style={{margin:0, fontSize:"10px"}}>Bookings</p>
  </div>
  <div className="text-center">
    <PiQuestionThin />
    <p style={{margin:0, fontSize:"10px"}}>Help</p>
  </div>
  <div className="text-center">
    <VscAccount />
    <p style={{margin:0, fontSize:"10px"}}>Account</p>
  </div>
</div>
      

      </Row>
      <Modal show={show} onHide={handleClose} centered contentClassName='"location-model'>
        <Button className='close-btn' onClick={handleClose}>x</Button>
        <Modal.Body>
          <div style={{position:"relative"}}>
            <FaArrowLeft onClick={handleClose}style={{position:"absolute", top:"27%",left:"10px", cursor:"pointer"}}/>
            <input
            type="text"
            placeholder="Search location/city/apartment..."
            className="location-input" style={{padding:"8px 8px 8px 34px"}}/> 
          </div>
          <br />
          <a href="#" className='use-location'>
            <IoMdLocate style={{marginRight:"6px"}}/> Use current location
          </a>
          
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Urbloc;
