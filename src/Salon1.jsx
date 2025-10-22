import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { MdBackpack, MdStars } from "react-icons/md";
import { GoDotFill } from "react-icons/go";
import { MdLocalOffer } from "react-icons/md";

function Salon1() {
  const [superPack, setSuperPack] = useState([]);
  const [packages, setPackages] = useState([]);
  const [carts, setCarts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // ------------------ FETCH DATA ------------------
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
  }, []);

  const fetchCarts = () => {
    fetch("http://localhost:5000/api/carts")
      .then(res => res.json())
      .then(data => setCarts(data.carts || []))
      .catch(err => console.error("Error fetching carts:", err));
  };

  // ------------------ MODAL ------------------
  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleAddToCart = async (pkg) => {
  try {
    const res = await fetch("http://localhost:5000/api/addcarts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: pkg.title,
        price: pkg.price,
        originalPrice: pkg.originalPrice,
        content: pkg.content || []
      })
    });
    await fetchCarts(); // refresh cart from server
  } catch (err) {
    console.error(err);
  }
};

const handleIncrease = async (cartItem) => {
  try {
    await fetch(`http://localhost:5000/api/carts/${cartItem._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: cartItem.count + 1 })
    });
    await fetchCarts(); // refresh cart from server
  } catch (err) {
    console.error(err);
  }
};

const handleDecrease = async (cartItem) => {
  try {
    if (cartItem.count === 1) {
      await fetch(`http://localhost:5000/api/carts/${cartItem._id}`, { method: "DELETE" });
    } else {
      await fetch(`http://localhost:5000/api/carts/${cartItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: cartItem.count - 1 })
      });
    }
    await fetchCarts(); // refresh cart from server
  } catch (err) {
    console.error(err);
  }
};


  return (
    <Container className="mt-5">
      <Row>
        {/* Left Column */}
        <Col xs={12} md={7} style={{ border: "1px solid rgba(192,192,195,1)", padding: "15px" }}>
          <h4 className="fw-semibold mt-4">Super Saver Packages</h4>

          {/* SUPER PACKS */}
          {superPack.map((sp, index) => (
            <div
              key={index}
              className="superpackcard mb-3"
              onClick={() => handleOpenModal(sp)}
              style={{
                backgroundImage: `url(${sp.img?.startsWith('http') ? sp.img : `http://localhost:5000${sp.img}`})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                aspectRatio: "16/9",
                position: "relative",
                cursor: "pointer",
                overflow: "hidden"
              }}
            >
              <div className='sptext'>
                <p>{sp.title} <br /> <span style={{ fontSize: "25px", fontWeight: "bold" }}>{sp.price}</span></p>
                <p style={{ fontSize: "12px" }}>{sp.text} <br /><span>{sp.tex}</span></p>
                <p style={{ fontSize: "12px" }}>{sp.content} <br /><span>{sp.con}</span></p>
              </div>
            </div>
          ))}

          {/* PACKAGES FROM MONGO */}
          {packages.map((pkg) => {
            const inCart = carts.find(c => c.title === pkg.title);

            return (
              <div key={pkg._id}>
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
                        {pkg.rating} ({pkg.bookings} bookings)
                      </span>
                    </p>
                    <p style={{ fontSize: "12px" }}>
                      <span className="fw-semibold">₹{pkg.price}</span>{" "}
                      <span style={{ textDecoration: "line-through", color: "#5a5959ff" }}>₹{pkg.originalPrice}</span>{" "}
                      <span style={{ color: "#5a5959ff" }}><GoDotFill /> {pkg.duration}</span>
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
                        <span className="count-box">{inCart.count}</span>
                        <Button onClick={() => handleIncrease(inCart)} className='button'>+</Button>
                      </div>
                    )}
                  </Col>
                </Row>

                <div style={{ borderBottom: "1px dashed #bbb6b6ff" }}></div>
                <br />

                <div style={{ fontSize: "12px" }}>
                  {pkg.items?.map((item, idx) => (
                    <p key={idx} style={{ margin: "2px 0" }}>
                      <GoDotFill style={{ fontSize: "10px", color: "#5a5959ff" }} />{" "}
                      {item.text && <span style={{ fontWeight: "bold" }}>{item.text}</span>}
                      {item.text && <span> : </span>}
                      <span>{item.description}</span>
                    </p>
                  ))}
                </div>
                <Button style={{backgroundColor:"white",color:"black",border:"1px solid black"}}>Edit your package</Button>
              </div>
            );
          })}
        </Col>

        {/* Right Column - Cart */}
        <Col xs={12} md={5} className="mt-4 mt-md-0">
          <div style={{flex: 1,height: "1px",backgroundColor: "rgba(192,192,195,1)",}}></div>
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
              carts.map((c) => (
                <div key={c._id}>
                  <h5 className='fw-semibold mb-2'>Cart</h5>
                  <Row className="align-items-center">
                    <Col><p style={{ fontSize: "12px" }}>{c.title}</p></Col>
                    <Col xs={8} className="d-flex justify-content-between gap-2">
                      <div className='button1' style={{ height: "33px" }}>
                        <Button onClick={() => handleDecrease(c)}className='button'>−</Button>
                        <span className="count-box">{c.count}</span>
                        <Button onClick={() => handleIncrease(c)} className='button'>+</Button>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "13px", margin: 0 }}>{c.totalPrice || `₹${Number(c.price.replace(/[₹,]/g,"")) * c.count}`}</p>
                        <p style={{ fontSize: "12px", textDecoration: "line-through", color: "#5a5959ff", margin: 0 }}>{c.originalPrice}</p>
                      </div>
                    </Col>
                  </Row>

                  <div style={{ marginTop: "10px", fontSize: "12px" }}>
                    {c.content?.map((item, i) => (
                      <p key={i}><GoDotFill style={{ fontSize: "10px", color: "#5a5959ff" }} />{" "}
                      {item.value ? `${item.value} : ${item.details}` : item.details}</p>
                    ))}
                  </div>
                  <Button className='fw-semibold' style={{backgroundColor:"white",color:"#4d35ebff",border:"0px",fontSize:"16px"}}>Edit</Button>
                  <div style={{ width:"100%",backgroundColor: "#117b13ff", display: "flex",justifyContent: "center",alignItems: "center",     height: "30px",}}><p className='fw-semibold mb-0' style={{color:"white",fontSize:"13px"}}> <MdLocalOffer />Congratulations! ₹974 saved so far! </p></div> <br />
                  <Button><span className='fw-semibold'>₹2,920</span> <span style={{textDecoration:"line-through"}}>₹3,894</span> <span style={{textAlign:"right"}}>View cart</span></Button>
                </div>
              ))
            )}
          </div>
          
        </Col>
      </Row>

      {/* Modal Section */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Button onClick={handleCloseModal} className="display closebtn">✕</Button>
        {selectedItem && (
          <div className="p-3">
            <h5>{selectedItem.title}</h5>
            <p>{selectedItem.text} {selectedItem.tex}</p>
          </div>
        )}
      </Modal>
    </Container>
  );
}

export default Salon1;
