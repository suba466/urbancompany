import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import { useState, useEffect } from 'react';
import { Button, ModalBody} from 'react-bootstrap';
import { MdBackpack, MdStars, MdLocalOffer } from "react-icons/md";
import { GoDotFill } from "react-icons/go";
import Salon1modal from './Salon1modal';
function Salon1() {
  const [superPack, setSuperPack] = useState([]);
  const [packages, setPackages] = useState([]);
  const [carts, setCarts] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [salon, setSalon] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

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
const handleShowModal = async (item) => {
  try {
    const res = await fetch(`http://localhost:5000/api/packages`);
    const data = await res.json();

    // Find matching package by title
    const matched = data.packages.find(pkg => pkg.title === item.title);

    // Set the selected item (with DB content if found)
    setSelectedItem(matched || item);
    setShowModal(true);
  } catch (err) {
    console.error("Error loading modal data:", err);
  }
};
 const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleAddToCart = async (pkg) => {
  try {
    const payload = {
      title: pkg.title || "",
      price: pkg.price || "0",
      content: Array.isArray(pkg.content) ? pkg.content : []
    };
    console.log("🟢 Payload sent to backend:", payload);

    await fetch("http://localhost:5000/api/addcarts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    fetchCarts();
  } catch (err) {
    console.error("❌ Error in handleAddToCart:", err);
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
                onClick={() => handleShowModal(sp)}
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
                        {pkg.rating || 0} 
                      </span>
                    </p>
                    <p style={{ fontSize: "12px" }}>
                      <span className="fw-semibold">₹{pkg.price || 0}</span>{" "}
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
                <Button
                onClick={() =>  handleShowModal(pkg)}
                style={{
                  backgroundColor: "white",
                  color: "black",
                  border: "1px solid black",
                }}>
                Edit your package
              </Button>

              </div>
            )
          })}
        </Col>

        {/* Right Column - Desktop Sticky Cart */}
        <Col xs={12} md={5} className="mt-4 mt-md-0 sticky-cart d-none d-md-block">
          <div style={{flex: 1,height: "1px",backgroundColor: "rgba(192,192,195,1)"}}></div>
          <div className='mt-4' style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.2)",border: "1px solid rgba(192,192,195,1)", borderRadius: "8px", padding: "10px" }}>
            {carts.length === 0 ? (
              <div className="text-center">
                <img
                  src="http://localhost:5000/assets/cart.png"
                  alt="cart-placeholder"
                  style={{ width: "50%", padding: "10px" }}
                />
                <p>No items in your cart</p>
              </div>
            ) : (
              (Array.isArray(carts) ? carts : []).map((c) => {
                const price = safePrice(c.price) * (c.count || 1);
                return (
                  <div key={c._id}>
                    <h5 className='fw-semibold mb-2'>Cart</h5>
                    <Row className="align-items-center">
                      <Col><p style={{ fontSize: "12px" }}>{c.title}</p></Col>
                      <Col xs={8} className="d-flex justify-content-between gap-2">
                        <div className='button1' style={{ height: "33px" }}>
                          <Button onClick={() => handleDecrease(c)} className='button'>−</Button>
                          <span className="count-box">{c.count || 1}</span>
                          <Button onClick={() => handleIncrease(c)} className='button'>+</Button>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: "13px", margin: 0 }}>{formatPrice(price)}</p>
                        </div>
                      </Col>
                    </Row>

                    <div style={{ marginTop: "10px", fontSize: "12px" }}>
                      {(Array.isArray(c.content) ? c.content : []).map((item, i) => (
                        <p key={i}><GoDotFill style={{ fontSize: "10px", color: "#5a5959ff" }} />{" "}
                        {item.value ? `${item.value} : ${item.details}` : item.details}</p>
                      ))}
                    </div>
                    <Button className='fw-semibold' style={{backgroundColor:"white",color:"#7330deff",border:"0px",fontSize:"16px"}}>Edit</Button>
                    <br />
                    <Button style={{backgroundColor:"#7330deff",width:"100%"}}>
                      <Row style={{fontSize:"13px"}}>
                        <Col className='text-start'>
                          <span className='fw-semibold'>{formatPrice(price)}</span>
                        </Col>
                        <Col><span style={{marginLeft:"35px"}}>View cart</span></Col>
                      </Row>
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        </Col>
      </Row>

      {/* Mobile Menu */}
    <Button 
      className='menu-float d-md-none ' 
      style={{bottom:carts.length > 0 ? "120px" : "20px"}} 
      onClick={() => setShowMenu(!showMenu)}>
      {showMenu ? "X" :"Menu"}
    </Button>

    <Modal show={showMenu} onHide={() => setShowMenu(false)} centered size='sm'>
      <ModalBody>
        <Container>
          <Row className="g-2 justify-content-center">
            {(Array.isArray(salon) ? salon.slice(0,6) : []).map((item, index) => (
              <Col xs={4} key={index} className="text-center">
                <div style={{ cursor: "pointer" }}>
                  <img 
                    src={item.img && typeof item.img === "string"
                          ? item.img.startsWith("http")
                            ? item.img
                            : `http://localhost:5000${item.img}`
                          : "http://localhost:5000/assets/placeholder.png"
                      }
                    alt={item.title || "Menu item"}
                    style={{
                      width: "60%", 
                      borderRadius: "10px", 
                      aspectRatio: "1/1", 
                      objectFit: "cover"
                    }}
                  />
                  <p style={{fontSize:"12px", marginTop:"5px"}}>{item.name || ""}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </ModalBody>
    </Modal>
      {carts.length > 0 && (
        <div className="mobile-cart-footer-wrapper d-lg-none">
            <div className='mobile-cart-footer-button-row'>
            <div className='mobile-cart-footer-total'>
              {carts.reduce((acc, c) => acc + Number(c.price.replace(/[₹,]/g, "")) * c.count, 0) === 0 ? null : (
          <>
            <span >
              {formatPrice(
                carts.reduce((acc, c) => acc + Number(c.price.replace(/[₹,]/g, "")) * c.count, 0)
              )}
            </span>{" "}
          </>
        )}
        <Button className='mobile-cart-footer-button mobile-cart-footer-total'>View cart</Button>
            </div>
            
          </div>
          
        </div>
      )}

      {/* Modal for Super Pack */}
     <Salon1modal
  show={showModal}
  onHide={handleCloseModal}
  selectedItem={selectedItem}
  refreshCarts={fetchCarts}
  onUpdatePackage={(updatedPkg) => {
    // Update the specific package with user-selected content
    setPackages(prev =>
      prev.map(pkg =>
        pkg.title === updatedPkg.title ? { ...pkg, content: updatedPkg.content } : pkg
      )
    );
  }}
/>

    </Container>
  );
}

export default Salon1;




