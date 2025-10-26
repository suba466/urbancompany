import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import { useState, useEffect } from 'react';
import { Button, ModalBody, ModalHeader } from 'react-bootstrap';
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
  const [dropdownModal, setDropdownModal] = useState({
    show: false,
    label: "",
    options: [],
    selected: ""
  });
    const waxingOptions = [
    {
      label: "Full arms (including underarms)",
      options: [
        { name: "RICA White Chocolate Wax", price: 499 },
        { name: "Chocolate Roll on", price: 599 },
        { name: "Honey Wax", price: 319 },
        { name: "RICA Roll on", price: 679 }
      ]
    },
    {
      label: "Full legs",
      options: [
        { name: "Honey Wax", price: 319 },
        { name: "RICA White Chocolate Wax", price: 549 },
        { name: "Chocolate Roll on", price: 499 },
        { name: "RICA Roll on", price: 629 }
      ]
    },
    {
      label: "Underarms",
      options: [
        { name: "Honey Wax", price: 49 },
        { name: "RICA peel-off", price: 149 }
      ]
    },
    {
      label: "Bikini line",
      options: [
        { name: "Honey Premium Wax", price: 249 },
        { name: "RICA peel-off", price: 249 }
      ]
    },
    {
      label: "Half arms",
      options: [
        { name: "Honey Wax", price: 219 },
        { name: "RICA White Chocolate Wax", price: 319 }
      ]
    },
    {
      label: "Half legs",
      options: [
        { name: "RICA White Chocolate Wax", price: 369 },
        { name: "Honey Wax", price: 219 }
      ]
    },
    {
      label: "Stomach",
      options: [
        { name: "Chocolate Roll on", price: 569 },
        { name: "Honey Wax", price: 319 },
        { name: "RICA White Chocolate Wax", price: 469 },
        { name: "RICA Roll on", price: 619 }
      ]
    },
    {
      label: "Back",
      options: [
        { name: "RICA Roll on", price: 669 },
        { name: "RICA White Chocolate Wax", price: 519 },
        { name: "Chocolate Roll on", price: 619 },
        { name: "Honey Wax", price: 469 }
      ]
    },
    {
      label: "Bikini",
      options: [
        { name: "RICA peel-off", price: 1299 },
        { name: "Honey Premium Wax", price: 949 }
      ]
    },
    {
      label: "Full body",
      options: [
        { name: "Honey Wax", price: 1369 },
        { name: "RICA White Chocolate Wax", price: 1919 },
        { name: "RICA Roll on", price: 2019 },
        { name: "Chocolate Roll on", price: 1619 }
      ]
    },
    { label: "I don't need anything", options: [] }
  ];
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
          <div style={{flex: 1,height: "1px",backgroundColor: "rgba(192,192,195,1)"}}></div>
          <div className='mt-4' style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.2)",border: "1px solid rgba(192,192,195,1)", borderRadius: "8px", padding: "10px" }}>
            {carts.length === 0 ? (
              <div className="text-center">
                <img
                  src="http://localhost:5000/assets/cart.jpg"
                  alt="cart-placeholder"
                  style={{ width: "50%", padding: "10px" }}
                />
                <p>No items in your cart</p>
              </div>
            ) : (
              (Array.isArray(carts) ? carts : []).map((c) => {
                const price = safePrice(c.price) * (c.count || 1);
                const originalPrice = safePrice(c.originalPrice) * (c.count || 1);
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
                          <p style={{ fontSize: "12px", textDecoration: "line-through", color: "#5a5959ff", margin: 0 }}>{formatPrice(originalPrice)}</p>
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
                    <div style={{ width:"100%",backgroundColor: "#0e670fff", display: "flex",justifyContent: "center",alignItems: "center"}}>
                      <p className='fw-semibold mb-0' style={{color:"white",fontSize:"13px"}}>
                        <MdLocalOffer /> Congratulations! <span>{formatPrice(originalPrice - price)}</span> saved so far!
                      </p>
                    </div>
                    <br />
                    <Button style={{backgroundColor:"#7330deff",width:"100%"}}>
                      <Row style={{fontSize:"13px"}}>
                        <Col>
                          <span className='fw-semibold'>{formatPrice(price)}</span>
                          <span style={{textDecoration:"line-through"}}>{formatPrice(originalPrice)}</span>
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
          {/* Green box */}
          <div className="mobile-cart-footer">
            <MdLocalOffer /> Congratulations!{"  "}
            <span>
              {formatPrice(
                carts.reduce((acc, c) => acc + (Number(c.originalPrice.replace(/[₹,]/g, "")) - Number(c.price.replace(/[₹,]/g, ""))) * c.count, 0
              ))}
            </span> saved so far!
          </div>

          <div className='mobile-cart-footer-button-row'>
            <div className='mobile-cart-footer-total'>
              {carts.reduce((acc, c) => acc + Number(c.price.replace(/[₹,]/g, "")) * c.count, 0) === 0 ? null : (
          <>
            <span >
              {formatPrice(
                carts.reduce((acc, c) => acc + Number(c.price.replace(/[₹,]/g, "")) * c.count, 0)
              )}
            </span>{" "}
            <span style={{color:"#504e4eff"}}>
              <s>
                {formatPrice(
                  carts.reduce((acc, c) => acc + Number(c.originalPrice.replace(/[₹,]/g, "")) * c.count, 0)
                )}
              </s>
            </span>
          </>
        )}
        <Button className='mobile-cart-footer-button mobile-cart-footer-total'>View cart</Button>
            </div>
            
          </div>
          
        </div>
      )}

      {/* Modal for Super Pack */}
      <Modal
      show={showModal}
      onHide={handleCloseModal}
      centered
      size="lg"
      contentClassName="custom-modal">
      <Button onClick={handleCloseModal} className="closebtn" style={{padding:"0px"}}>X</Button>
      
      {selectedItem && (<>
        <div className="p-3" style={{ backgroundColor: "#ede1d4ff", borderRadius: "10px" }}>
          <h4 className='fw-semibold'>{selectedItem.title || ""}</h4>
          <p><IoTime /> service time:3 hrs 50 mins</p>
        </div>
        <div className='p-3'>
          <h5 className='fw-semibold'>Waxing</h5>
          <Form className='fw-semibold'>
            {waxingOptions.map((item, idx) => (
              <Row key={idx} className='mb-2 align-items-center'>
                <Col xs={6}>
                  <Form.Check type='checkbox' label={item.label} id={`check-${idx}`} />
                  {item.options.length > 0 && (
                    <div style={{ fontSize: "12px", marginLeft: "25px", marginTop: "2px" }}>
                      ₹{item.options[0].price} {/* Show only the first option's price */}
                    </div>
                  )}
                </Col>
                <Col xs={6} className='text-end'>
                  {item.options.length > 0 && (
                    <div
                      onClick={() =>
                        setDropdownModal({
                          show: true,
                          label: item.label,
                          options: item.options,
                          selected: ""
                        })
                      }
                      className='drop'
                    >
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {dropdownModal.selected && dropdownModal.label === item.label
                          ? dropdownModal.selected
                          : item.options[0].name}
                      </span>
                      <span style={{ marginLeft: "5px", fontSize: "12px", color: "#777" }}>▾</span>
                    </div>
                  )}
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
        <Modal.Header >
          <Button onClick={()=>setDropdownModal({...dropdownModal,show:false})} className="closebtn" style={{padding:"0px"}}>X</Button>
          <Modal.Title>Choose the type of waxing</Modal.Title>
        </Modal.Header>
        <Modal.Body >
          <Form>
            {dropdownModal.options.map((opt, idx) => (
              <div key={idx} className='d-flex justify-content-between align-items-center  py-2'
                   style={{fontSize:"14px",backgroundColor:dropdownModal.selected==opt.name?"#f4edff":"transparent",
                   paddingLeft:"8px",paddingRight:"8px"}}>
                <Form.Check type='radio'name='dropdownOptions' id={`radio-${idx}`}
                  checked={dropdownModal.selected==opt.name} onChange={()=>setDropdownModal({...dropdownModal,selected:opt.name,show:false})}
                  label={opt.name} style={{flex:1,marginBottom:0}}>
                </Form.Check>
                <span style={{fontWeight:"500"}}>₹{opt.price}</span>
                   </div>
            ))}
          </Form>
        </Modal.Body>
      </Modal>

    </Container>
  );
}

export default Salon1;




