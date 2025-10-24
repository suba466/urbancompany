import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { MdBackpack, MdStars, MdLocalOffer } from "react-icons/md";
import { GoDotFill } from "react-icons/go";
import { IoTime } from "react-icons/io5";
import Form from 'react-bootstrap/Form';

function Salon1() {
  const [superPack, setSuperPack] = useState([]);
  const [packages, setPackages] = useState([]);
  const [carts, setCarts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [salon, setSalon] = useState([]);

  // Dropdown modal state
  const [dropdownModal, setDropdownModal] = useState({ show: false, label: "", options: [], selected: "" });

  // Fetch Data
  useEffect(() => {
    fetch("http://localhost:5000/api/super")
      .then(res => res.json())
      .then(data => setSuperPack(data.super ? [data.super[0]] : []))
      .catch(err => console.error("Error fetching super packages:", err));

    fetch("http://localhost:5000/api/packages")
      .then(res => res.json())
      .then(data => setPackages(data.packages || []))
      .catch(err => console.error("Error fetching packages:", err));

    fetchCarts();

    fetch("http://localhost:5000/api/salonforwomen")
      .then(res => res.json())
      .then(data => setSalon(data.salonforwomen))
      .catch(err => console.error("Error fetching salon:", err));
  }, []);

  const fetchCarts = () => {
    fetch("http://localhost:5000/api/carts")
      .then(res => res.json())
      .then(data => setCarts(data.carts || []))
      .catch(err => console.error("Error fetching carts:", err));
  };

  // Modal handlers
  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  // Cart handlers
  const handleAddToCart = async (pkg) => {
    try {
      await fetch("http://localhost:5000/api/addcarts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pkg.title || "",
          price: pkg.price || "0",
          originalPrice: pkg.originalPrice || "0",
          content: pkg.content || []
        })
      });
      fetchCarts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleIncrease = async (cartItem) => {
    try {
      await fetch(`http://localhost:5000/api/carts/${cartItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: (cartItem.count || 1) + 1 })
      });
      fetchCarts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecrease = async (cartItem) => {
    try {
      if ((cartItem.count || 1) <= 1) {
        await fetch(`http://localhost:5000/api/carts/${cartItem._id}`, { method: "DELETE" });
      } else {
        await fetch(`http://localhost:5000/api/carts/${cartItem._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ count: cartItem.count - 1 })
        });
      }
      fetchCarts();
    } catch (err) {
      console.error(err);
    }
  };

  const formatPrice = (amount) => `₹${amount.toLocaleString("en-IN")}`;
  const safePrice = (price) => Number((price || "0").toString().replace(/[₹,]/g, ""));

  return (
    <Container className="mt-5">
      <Row>
        {/* Left Column */}
        <Col xs={12} md={7} style={{ border: "1px solid rgba(192,192,195,1)", padding: "15px" }} className='suppad'>
          <h4 className="fw-semibold mt-4">Super Saver Packages</h4>

          {/* SUPER PACKS */}
          {(Array.isArray(superPack) ? superPack : []).map((sp, index) => {
            const imgUrl = sp.img && typeof sp.img === "string" 
              ? sp.img.startsWith("http") 
                ? sp.img 
                : `http://localhost:5000${sp.img}`
              : "";
            return (
              <div
                key={index}
                className="superpackcard mb-3"
                onClick={() => handleOpenModal(sp)}
                style={{
                  backgroundImage: `url(${imgUrl})`,
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  aspectRatio: "16/9",
                  position: "relative",
                  cursor: "pointer",
                  overflow: "hidden"
                }}>
                <div className='sptext'>
                  <p>{sp.title} <br /> <span style={{ fontSize: "25px", fontWeight: "bold" }}>{sp.price}</span></p>
                  <p style={{ fontSize: "12px" }}>{sp.text} <br /><span>{sp.tex}</span></p>
                  <p style={{ fontSize: "12px" }}>{sp.content} <br /><span>{sp.con}</span></p>
                </div>
              </div>
            )
          })}

          {/* PACKAGES */}
          {(Array.isArray(packages) ? packages : []).map((pkg) => {
            const inCart = carts.find(c => c.title === pkg.title);
            return (
              <div key={pkg._id || pkg.title}>
                <Row className="align-items-center mt-3">
                  <Col xs={8}>
                    <p style={{ color: "#095819ff" }}>
                      <MdBackpack />{" "}
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>PACKAGE</span>
                    </p>
                    <h6 className="fw-semibold">{pkg.title}</h6>
                    <p style={{ color: "#5a5959ff" }}>
                      <MdStars style={{ fontSize: "13px", color: "#6800faff" }} />{" "}
                      <span style={{ textDecoration: "underline dashed", textUnderlineOffset: "7px", fontSize: "12px" }}>
                        {pkg.rating || 0} ({pkg.bookings || 0} bookings)
                      </span>
                    </p>
                    <p style={{ fontSize: "12px" }}>
                      <span className="fw-semibold">₹{pkg.price || 0}</span>{" "}
                      <span style={{ textDecoration: "line-through", color: "#5a5959ff" }}>₹{pkg.originalPrice || 0}</span>{" "}
                      <span style={{ color: "#5a5959ff" }}><GoDotFill /> {pkg.duration || "N/A"}</span>
                    </p>
                  </Col>

                  <Col xs={4} className="d-flex justify-content-end align-items-center">
                    {!inCart ? (
                      <Button
                        onClick={() => handleAddToCart(pkg)}
                        style={{
                          backgroundColor: "white",
                          color: "#aa2ce0ff",
                          border: "1px solid #aa2ce0ff",
                          padding: "5px 18px",
                          fontWeight: "500"
                        }}
                      >
                        Add
                      </Button>
                    ) : (
                      <div className="d-flex align-items-center gap-2">
                        <Button onClick={() => handleDecrease(inCart)} className='button'>−</Button>
                        <span className="count-box">{inCart.count || 1}</span>
                        <Button onClick={() => handleIncrease(inCart)} className='button'>+</Button>
                      </div>
                    )}
                  </Col>
                </Row>

                <div style={{ borderBottom: "1px dashed #bbb6b6ff" }}></div>
                <br />

                <div style={{ fontSize: "12px" }}>
                  {(Array.isArray(pkg.items) ? pkg.items : []).map((item, idx) => (
                    <p key={idx} style={{ margin: "2px 0" }}>
                      <GoDotFill style={{ fontSize: "10px", color: "#5a5959ff" }} />{" "}
                      {item.text && <span style={{ fontWeight: "bold" }}>{item.text}</span>}
                      {item.text && <span> : </span>}
                      <span>{item.description}</span>
                    </p>
                  ))}
                </div>
                <br />
                <Button style={{ backgroundColor: "white", color: "black", border: "1px solid black" }}>Edit your package</Button>
              </div>
            )
          })}
        </Col>

        {/* Right Column - Desktop Sticky Cart */}
        <Col xs={12} md={5} className="mt-4 mt-md-0 sticky-cart d-none d-md-block">
          {/* Cart content here ... (same as your original code) */}
        </Col>
      </Row>

      {/* Mobile Menu */}
      {/* ...same as your original code... */}

      {/* Modal for Super Pack */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        size="lg"
        contentClassName="custom-modal"
      >
        <Button onClick={handleCloseModal} className="closebtn" style={{padding:"0px"}}>X</Button>

        {selectedItem && (
          <>
            <div className="p-3" style={{ backgroundColor: "#ede1d4ff", borderRadius: "10px" }}>
              <h4 className='fw-semibold'>{selectedItem.title || ""}</h4>
              <p><IoTime /> service time:3 hrs 50 mins</p>
            </div>

            <div className='p-3'>
              <h5 className='fw-semibold'>Waxing</h5>
              <Form className='fw-semibold'>
                {[
                  { label: "Full arms (including underarms)", options: ["RICA White Chocolate Wax", "Chocolate Roll on", "Honey Wax", "RICA Roll on"] },
                  { label: "Full legs", options: ["Honey Wax", "RICA White Chocolate Wax", "Chocolate Roll on", "RICA Roll on"] },
                  { label: "Underarms", options: ["Honey Wax", "RICA peel-off"] },
                  { label: "Bikini line", options: ["Honey Premium Wax", "RICA peel-off"] },
                  { label: "Half arms", options: ["Honey Wax",  "RICA White Chocolate Wax"] },
                  { label: "Half legs", options: ["RICA White Chocolate Wax", "Honey Wax"] },
                  { label: "Stomach", options: ["Chocolate Roll on", "Honey Wax", "RICA White Chocolate Wax"] },
                  { label: "Back", options: ["RICA Roll on", "RICA White Chocolate Wax", "Chocolate Roll on","Honey Wax"] },
                  { label: "Bikini", options: ["RICA peel-off", "Honey Premium Wax"] },
                  { label: "Full body", options: ["Honey Wax", "RICA White Chocolate Wax", "RICA Roll on", "Chocolate Roll on"] },
                  { label: "I don't need anything", options: [""] },
                  

                ].map((item, idx) => (
                  <Row key={idx} className="mb-2 align-items-center">
                    <Col xs={6}>
                      <Form.Check type="checkbox" label={item.label} id={`check-${idx}`} />
                    </Col>
                    <Col xs={6}>
                      <Form.Control
                        type="text"
                        placeholder={item.options[0]}
                        readOnly
                        value={dropdownModal.selected && dropdownModal.label === item.label ? dropdownModal.selected : ""}
                        onClick={() => setDropdownModal({ show: true, label: item.label, options: item.options, selected: "" })}
                        style={{ cursor: "pointer" }}
                      />
                    </Col>
                  </Row>
                ))}
              </Form>
            </div>
          </>
        )}
      </Modal>

      {/* Dropdown Modal */}
      <Modal
        show={dropdownModal.show}
        onHide={() => setDropdownModal({ ...dropdownModal, show: false })}
        centered>
        <Modal.Header closeButton>
          <Modal.Title>{dropdownModal.label}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
          {dropdownModal.options.map((opt, idx) => (
            <Form.Check
              key={idx}
              type="radio"
              name="dropdownOptions"
              label={opt}
              id={`radio-${idx}`}
              checked={dropdownModal.selected === opt}
              onChange={() =>
                setDropdownModal({ ...dropdownModal, selected: opt, show: false })
              }
            />
          ))}
        </Form>
        </Modal.Body>
      </Modal>

    </Container>
  );
}

export default Salon1;
