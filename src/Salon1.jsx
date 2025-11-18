import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import { useState, useEffect, useRef } from 'react';
import { Button, ModalBody} from 'react-bootstrap';
import { MdBackpack, MdStars } from "react-icons/md";
import { GoDotFill } from "react-icons/go";
import Salon1modal from './Salon1modal';
import { useNavigate } from 'react-router-dom';
import CartBlock from './CartBlock';
function Salon1() {
  const [savedExtras, setSavedExtras] = useState({});
  const [superPack, setSuperPack] = useState([]);
  const [packages, setPackages] = useState([]);
  const [carts, setCarts] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [salon, setSalon] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const addButtonRefs=useRef({});
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const normalizeKey = (str) => str.toLowerCase().trim().replace(/\s+/g, "-");
  const roundPrice = (price) => Math.round(Number(price) || 0);
  const totalItems=carts.reduce((sum,item)=>sum+(item.count || 0),0);
  const [showFrequentlyAdded, setShowFrequentlyAdded] = useState(false);
  const navigate=useNavigate();
  // --- Fetch Data ---
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

  useEffect(() => {
    window.updateCartInstantly = async(title) => {
      await fetchCarts();
      setCarts(prev=>[...prev]);
    };
    window.openEditPackageFromCart = handleShowModal;
  }, []);

  const fetchCarts = () => {
    fetch("http://localhost:5000/api/carts")
      .then(res => res.json())
      .then(data => setCarts(data.carts || []))
      .catch(err => console.error("Error fetching carts:", err));
  };

  // --- Modal handlers ---
  const handleShowModal = async (item) => {
    try {
      const res = await fetch(`http://localhost:5000/api/packages`);
      const data = await res.json();
      const matched = data.packages.find(pkg => pkg.title === item.title);

      const cartsRes = await fetch("http://localhost:5000/api/carts");
      const cartsData = await cartsRes.json();
      const existingCartItem = cartsData.carts?.find(c => c.title === item.title);

      const mergedItem = {
        ...(matched || item),
        savedSelections: existingCartItem?.savedSelections || [],
        productId: existingCartItem?.productId || matched?._id || Date.now().toString()
      };

      setSelectedItem(mergedItem);
      setShowModal(true);
    } catch (err) {
      console.error("Error loading modal data:", err);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const baseServices=[
    { title: "Full arms (including underarms)", price: 599, content: "Chocolate Roll on" },
    { title: "Full legs", price: 499, content: "Chocolate Roll on" },
    { title: "O3+ shine & glow facial", price: 1699, content: "Facial" },
    { title: "Eyebrow", price: 49, content: "Threading" },
    { title: "Upper lip", price: 49, content: "Threading" },
  ];
  const basePrice = 2195;
const handleAddToCart = async (pkg, selectedServices = [], overridePrice = null, isExtraOnly = false) => {
  const productId = pkg.productId || pkg._id || Date.now().toString();
  const existing = carts.find(c => c.productId === productId);

  // Only include base services if it's NOT extra-only
  const content = isExtraOnly
    ? selectedServices.map(s => ({
        details: s.content && s.content !== s.title ? `${s.title} (${s.content})` : s.title,
        price: s.price || 0,
      }))
    : [
        ...(pkg.baseServices || baseServices).map(s => ({
          details: s.content && s.content !== s.title ? `${s.title} (${s.content})` : s.title,
          price: s.price || 0,
        })),
        ...selectedServices.map(s => ({
          details: s.content && s.content !== s.title ? `${s.title} (${s.content})` : s.title,
          price: s.price || 0,
        })),
      ];

  const totalPrice = overridePrice || content.reduce((sum, s) => sum + s.price, 0);

  const payload = {
    productId,
    title: pkg.title,
    price: totalPrice,
    count: existing ? existing.count : 1,
    content,
    savedSelections: selectedServices,
  };

  if (existing) {
    await fetch(`http://localhost:5000/api/carts/${existing._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } else {
    await fetch("http://localhost:5000/api/addcarts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  await fetchCarts();
};

  const handleIncrease = async (cartItem) => {
    try {
      const totalItems=carts.reduce((sum,item)=>sum+(item.count||0),0);
      if(totalItems>=3){
        alert("You can't add anymore in this item");return;
      }
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
          <h4 className="fw-semibold mt-4">Wedding essentials</h4>
          {/* PACKAGES */}
          {(Array.isArray(packages) ? packages : []).map((pkg) => {
            const inCart = carts.find(c => c.title === pkg.title);
            return (
              <div 
              key={pkg._id || pkg.title} 
              style={{ position: "relative", marginBottom: "50px" }} >
              <Row className="align-items-center mt-3">
                <Col xs={8}>
                  <p style={{ color: "#095819ff" }}>
                    <MdBackpack />{" "}
                    <span style={{ fontSize: "13px", fontWeight: "bold" }}>PACKAGE</span>
                  </p>
                  <h6 
                    className="fw-semibold" 
                    style={{ cursor: "pointer" }}
                    onClick={() => handleShowModal(pkg)}>
                    {pkg.title}
                  </h6>
                  <p style={{ color: "#5a5959ff" }}>
                    <MdStars style={{ fontSize: "13px", color: "#6800faff" }} />{" "}
                    <span style={{ textDecoration: "underline dashed", textUnderlineOffset: "7px", fontSize: "12px" }}>
                      {pkg.rating || 0} 
                    </span>
                  </p>
                  <p style={{ fontSize: "12px" }}>
                    <span className="fw-semibold"><span className="fw-semibold">{formatPrice(roundPrice(pkg.price))}</span></span>{" "}
                    <span style={{ color: "#5a5959ff" }}><GoDotFill /> {pkg.duration || "N/A"}</span>
                  </p>
                </Col>

                {/* Button Column */}
                <Col xs={4} style={{ position: "relative", minHeight: "120px" }}> 
                <Button
                variant="outline-success"
                size="sm"
                className='button2'
              onClick={() =>{setSelectedItem(pkg); setShowDiscountModal(true)}}
              ><h2 className='fw-semibold text-center' style={{fontSize:"33px"}}>25% OFF</h2>
              </Button>
                  {/* ABSOLUTE BUTTON AT BOTTOM */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, textAlign: "center" }}>
                    {!inCart ? (
                      <Button
                      ref={(el) => (addButtonRefs.current[normalizeKey(pkg.title)] = el)}
                      onClick={() => {
                        // Use saved extras from state if cart is empty
                        const extras = savedExtras[pkg.title] || [];
                        handleAddToCart(pkg, extras);
                         setShowFrequentlyAdded(true);
                      }}
                      style={{color: "rgb(110, 66, 229)",backgroundColor: "rgb(245, 241, 255)",border: "1px solid rgb(110, 66, 229)",padding: "5px 18px",zIndex: "2"}}>Add
                    </Button>
                    ) : (
                      <div 
                        className="d-flex align-items-center gap-2 bn" 
                        style={{border:"1px solid rgb(110, 66, 229)", borderRadius:"6px", justifyContent: "center",backgroundColor:"rgb(245, 241, 255)",width:"50%",marginLeft:"36px"}}>
                        <Button onClick={() => handleDecrease(inCart)} className='button '>−</Button>
                        <span className="count-box">{inCart.count || 1}</span>
                        <Button onClick={() => handleIncrease(inCart)} className='button'  style={{
                    opacity: totalItems >= 3 ? "0.6" : "1",}}>+</Button>
                      </div>
                    )}
                  </div>
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
              <Button className='edit' onClick={() => handleShowModal(pkg)}> 
                Edit your package
              </Button>
            </div>
            )
          })}
        </Col>
        {/* Right Column - Desktop Sticky Cart */}
        <Col xs={12} md={5} className="mt-4 mt-md-0 sticky-cart d-none d-md-block">
          <div style={{flex: 1,height: "1px",backgroundColor: "rgba(192,192,195,1)"}}></div>     
            <CartBlock
            carts={carts}
            formatPrice={formatPrice}
            safePrice={safePrice}
            handleIncrease={handleIncrease}
            handleDecrease={handleDecrease}
            navigate={navigate}/>       
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
        <div className="mobile-cart-footer-button-row">
          <div className="mobile-cart-footer-total">
            {(() => {
              const total = (Array.isArray(carts) ? carts : []).reduce(
                (acc, c) => acc + safePrice(c.price) * (c.count || 1),
                0
              );
              if (total === 0) return null;
              return (
                <>
                  <span>{formatPrice(total)}</span>{" "}
                </>
              );
            })()}
            <Button className="mobile-cart-footer-button mobile-cart-footer-total" onClick={()=>navigate("/cart")}>
              View cart
            </Button>
          </div>
        </div>
      </div>
    )}
      <Salon1modal
      showFrequentlyAdded={showFrequentlyAdded} setShowFrequentlyAdded={setShowFrequentlyAdded}
        show={showModal} totalItems={totalItems}
        onHide={handleCloseModal}
        selectedItem={selectedItem}
        handleAddToCart={handleAddToCart} 
        fetchCarts={fetchCarts}  
        carts={carts} setCarts={setCarts}
        addButtonRefs={addButtonRefs}
        basePrice={basePrice}
        baseServices={baseServices}
        roundPrice={roundPrice}
        showDiscountModal={showDiscountModal}
      setShowDiscountModal={setShowDiscountModal}
      handleDecrease={handleDecrease} handleIncrease={handleIncrease}/>
    </Container>
  );
}

export default Salon1;




