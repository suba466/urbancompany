import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { Button, ModalBody, Form, Row, Col } from "react-bootstrap";
import { IoTime } from "react-icons/io5";
import { TbCirclePercentageFilled, TbClockHour4 } from "react-icons/tb";
import { FaStar } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import { FaTag } from "react-icons/fa6";
function Salon1modal({ show,totalItems,carts,setCarts, onHide, selectedItem,handleAddToCart,basePrice,baseServices,roundPrice,showDiscountModal,setShowDiscountModal,handleDecrease,handleIncrease}) {
  const [loadingDropdownKey, setLoadingDropdownKey] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [hasChange,setHasChange]=useState(false);
  const [added, setAdded]=useState({});
  const [dropdownModal, setDropdownModal] = useState({
    show: false,
    label: "",
    options: [],
    selected: "",
    type: "",
  });
  const [totalPrice, setTotalPrice] = useState(2195);
  const [discountedPrice, setDiscountedPrice] = useState(null);
  const initialServices = {
    "waxingOptions:Full arms (including underarms)": {
      title: "Full arms (including underarms)",
      price: 599,
      count: 1,
      content: "Chocolate Roll on",
    },
    "waxingOptions:Full legs": {
      title: "Full legs",
      price: 499,
      count: 1,
      content: "Chocolate Roll on",
    },
    "facialOptions:O3+ shine & glow facial": {
      title: "O3+ shine & glow facial",
      price: 1699,
      count: 1,
      content: "Facial",
    },
    "facialHairOptions:Eyebrow": {
      title: "Eyebrow",
      price: 49,
      count: 1,
      content: "Threading",
    },
    "facialHairOptions:Upper lip": {
      title: "Upper lip",
      price: 49,
      count: 1,
      content: "Threading",
    },
  };

  const [selectedServices, setSelectedServices] = useState(initialServices);

  const waxingOptions = [
    {
      label: "Full arms (including underarms)",
      options: [
        { name: "RICA White Chocolate Wax", price: 499 },
        { name: "Chocolate Roll on", price: 599 },
        { name: "Honey Wax", price: 319 },
        { name: "RICA Roll on", price: 679 },
      ],
    },
    {
      label: "Full legs",
      options: [
        { name: "Honey Wax", price: 319 },
        { name: "RICA White Chocolate Wax", price: 549 },
        { name: "Chocolate Roll on", price: 499 },
        { name: "RICA Roll on", price: 629 },
      ],
    },
    {
      label: "Underarms",
      options: [
        { name: "Honey Wax", price: 49 },
        { name: "RICA peel-off", price: 149 },
      ],
    },
    {
      label: "Bikini line",
      options: [
        { name: "Honey Premium Wax", price: 249 },
        { name: "RICA peel-off", price: 249 },
      ],
    },
    {
      label: "Half arms",
      options: [
        { name: "Honey Wax", price: 219 },
        { name: "RICA White Chocolate Wax", price: 319 },
      ],
    },
    {
      label: "Half legs",
      options: [
        { name: "RICA White Chocolate Wax", price: 369 },
        { name: "Honey Wax", price: 219 },
      ],
    },
    {
      label: "Stomach",
      options: [
        { name: "Chocolate Roll on", price: 569 },
        { name: "Honey Wax", price: 319 },
        { name: "RICA White Chocolate Wax", price: 469 },
        { name: "RICA Roll on", price: 619 },
      ],
    },
    {
      label: "Back",
      options: [
        { name: "RICA Roll on", price: 669 },
        { name: "RICA White Chocolate Wax", price: 519 },
        { name: "Chocolate Roll on", price: 619 },
        { name: "Honey Wax", price: 469 },
      ],
    },
    {
      label: "Bikini",
      options: [
        { name: "RICA peel-off", price: 1299 },
        { name: "Honey Premium Wax", price: 949 },
      ],
    },
    {
      label: "Full body",
      options: [
        { name: "Honey Wax", price: 1369 },
        { name: "RICA White Chocolate Wax", price: 1919 },
        { name: "RICA Roll on", price: 2019 },
        { name: "Chocolate Roll on", price: 1619 },
      ],
    },
    { label: "I don't need anything", options: [] },
  ];

  // ---------------- Facial ----------------
  const facial = [
    { label: "Sara Lightening glow facial", price: 949 },
    { label: "Elysian firming wine glow facial", price: 1049 },
    { label: "O3+ shine & glow facial", price: 1699 },
    { label: "O3+ power brightening facial", price: 1999 },
    { label: "Sara fruit cleanup", price: 699 },
    { label: "O3+ tan clear cleanup", price: 849 },
    { label: "I don't need anything" },
  ];

  // ---------------- Pedicure ----------------
  const pedicure = [
    { label: "Elysian Chocolate & Vanilla pedicure", price: 849 },
    { label: "Elysian Candle Spa pedicure", price: 999 },
    { label: "Elysian British Rose pedicure", price: 759 },
    { label: "I don't need anything" },
  ];

  // ---------------- Manicure ----------------
  const manicure = [
    { label: "Cut,file & polish - Hands", price: 149 },
    { label: "Elysian British Rose manicure", price: 649 },
    { label: "Elysian Chocolate & Vanilla manicure", price: 699 },
    { label: "Elysian Candle Spa manicure", price: 899 },
    { label: "I don't need anything" },
  ];

  // ---------------- Bleach ----------------
  const bleach = [
    {
      label: "Face & neck",
      options: [
        { name: "Bleach", price: 299 },
        { name: "Detan", price: 349 },
      ],
    },
    {
      label: "Full legs",
      options: [
        { name: "Detan", price: 499 },
        { name: "Bleach", price: 499 },
      ],
    },
    {
      label: "Full body",
      options: [
        { name: "Detan", price: 1499 },
        { name: "Bleach", price: 1499 },
      ],
    },
    {
      label: "Full arms",
      options: [
        { name: "Detan", price: 349 },
        { name: "Bleach", price: 349 },
      ],
    },
    {
      label: "Chest",
      options: [
        { name: "Detan", price: 399 },
        { name: "Bleach", price: 399 },
      ],
    },
    {
      label: "Back",
      options: [
        { name: "Detan", price: 399 },
        { name: "Bleach", price: 399 },
      ],
    },
    { label: "I don't need anything", options: [] },
  ];

  // ---------------- Facial Hair ----------------
  const facialHair = [
    {
      label: "Eyebrow",
      options: [{ name: "Threading", price: 49 }],
    },
    {
      label: "Forehead",
      options: [
        { name: "Threading", price: 59 },
        { name: "Face waxing", price: 99 },
      ],
    },
    {
      label: "Face",
      options: [
        { name: "Face waxing", price: 399 },
        { name: "Threading", price: 149 },
      ],
    },
    {
      label: "Sidelocks",
      options: [
        { name: "Threading", price: 49 },
        { name: "Face waxing", price: 99 },
      ],
    },
    {
      label: "Upper lip",
      options: [
        { name: "Face waxing", price: 69 },
        { name: "Threading", price: 49 },
      ],
    },
    {
      label: "Neck",
      options: [
        { name: "Threading", price: 149 },
        { name: "Face waxing", price: 199 },
      ],
    },
    {
      label: "Jawline",
      options: [
        { name: "Face waxing", price: 99 },
        { name: "Threading", price: 99 },
      ],
    },
    {
      label: "Chin",
      options: [
        { name: "Threading", price: 29 },
        { name: "Face waxing", price: 99 },
      ],
    },
    { label: "I don't need anything", options: [] },
  ];

  // ---------------- Hair Care ----------------
  const hair = [
    { label: "Hair color application", price: 249 },
    { label: "Henna mehendi application", price: 399 },
    { label: "Head massage (10 mins)", price: 199 },
    { label: "Head massage (20 mins)", price: 349 },
    { label: "I don't need anything" },
  ];
   useEffect(() => {
    if (selectedItem) {
      const cartItem = carts.find(c => c.title === selectedItem.title);
      setCartCount(cartItem?.count || 0);
    }
  }, [carts, selectedItem]);
  useEffect(() => {
  if (selectedItem && window.cart) {
    const itemInCart = window.cart.find(item => item.title === selectedItem.title);
    setCartCount(itemInCart ? itemInCart.count : 0);
  }
}, [window.cart, selectedItem]);

useEffect(() => {
  if (show && selectedItem) {
    // Step 1: Fetch latest cart data for this item
    fetch("http://localhost:5000/api/carts")
      .then(res => res.json())
      .then(async data => {
        const found = data.carts.find(c => c.title === selectedItem.title);
        if (found?.savedSelections?.length > 0) {
          // Step 2: Add or update this item in the cart immediately
          const extraSelected = found.savedSelections;
          await handleAddToCart(selectedItem, extraSelected);
          console.log(" Existing saved selections instantly added to cart.");
        }
      })
      .catch(err => console.error("Error syncing cart with saved selections:", err));
  }
}, [show, selectedItem]);

useEffect(() => {
  const extraPrice = Object.values(selectedServices).reduce((sum, s) => {
    const isBase = baseServices.some(bs => bs.title === s.title && bs.content === s.content);
    return sum + (isBase ? 0 : Number(s.price || 0));
  }, 0);
  const total = basePrice + extraPrice;
  setTotalPrice(roundPrice(total));

  if (total >= basePrice + 905) {
    setDiscountedPrice(roundPrice(total * 0.75));
  } else {
    setDiscountedPrice(null);
  }
}, [selectedServices]);

const handleCheckboxChange = (section, label, option, isChecked) => {
  setSelectedServices(prev => {
    const updated = { ...prev };
    const key = `${section}:${label}`;

    if (isChecked) {
      const price = Number(option?.price ?? 0);
      updated[key] = {
        title: label,
        price: roundPrice(price),
        count: 1,
        content: option?.name ?? option?.label ?? option ?? "No option",
      };
    } else {
      delete updated[key];
    }

    return updated;
  });
};const formatPrice = (amount) => `₹${amount.toLocaleString("en-IN")}`;
  const safePrice = (price) => Number((price || "0").toString().replace(/[₹,]/g, ""));
  // Render service sections
  const renderSection = (sectionName, items, displayName) => (
    <>
      <h5 className="fw-semibold mt-3">{displayName}</h5>
      <Form>
        {items.map((item, idx) => {
          const key = `${sectionName}:${item.label}`;
          const isChecked = !!selectedServices[key];
          const selectedOption = selectedServices[key]?.content;

          return (
            <Row key={idx} className="mb-3 align-items-center">
              <Col xs={7}>
                <Form.Check
                  type="checkbox"
                  label={item.label}
                  checked={isChecked}
                  onChange={(e) =>
                    handleCheckboxChange(
                      sectionName,
                      item.label,
                      item.options ? item.options[0] : item,
                      e.target.checked
                    )}className="fw-semibold"style={{ fontSize: "14px" }}/>
                {/* don't show price for "I don't need anything" */}
                {item.label !== "I don't need anything" && (
                  <div
                    style={{
                      fontSize: "12px",
                      marginLeft: "25px",
                      color: "#7d7c7cff",
                    }}>
                    ₹
                    {selectedServices[key]
                      ? selectedServices[key].price
                      : item.options
                      ? Number(item.options[0]?.price ?? 0)
                      : Number(item.price ?? 0)}
                  </div>
                )}
              </Col>

              <Col xs={5} className="d-flex justify-content-end">
                {item.options && item.options.length > 0 && item.label !== "I don't need anything" && (
                  <div
                    className="drop"
                    onClick={() => {
                      const k = `${sectionName}:${item.label}`;
                      setLoadingDropdownKey(k);
                      setDropdownModal({
                        show: true,
                        label: item.label,
                        options: item.options,
                        selected: selectedOption || item.options[0].name,
                        type: sectionName,
                      });
                    }}
                    style={{ cursor: "pointer" }}>
                    {loadingDropdownKey === key ? (
                      <div
                        className="spinner-border spinner-border-sm text-secondary"
                        role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      isChecked ? `${item.label} (${selectedOption || item.options[0].name})`
                                : item.options[0].name
                    )}
                  </div>
                )}
              </Col>
            </Row>
          );
        })}
      </Form>
      <hr />
    </>
  );

  return (
    <>
      {/* MAIN MODAL */}
      <Modal show={show} onHide={onHide} centered contentClassName="custom-modal">
        <Button onClick={onHide} className="closebtn" style={{ padding: "0px" }}>
          X
        </Button>

        {selectedItem && (
          <>
            <div
              className="p-3"
              style={{ backgroundColor: "#ede1d4", borderRadius: "10px" }}>
              <h4 className="fw-semibold">{selectedItem.title}</h4>
              <p>
                <IoTime /> Service time: 3 hrs 50 mins
              </p>
            </div>
            <div className="p-3 scroll">
              {renderSection("waxingOptions", waxingOptions, "Waxing")}
              {renderSection("facialOptions", facial, "Facial & cleanup")}
              {renderSection("pedicureOptions", pedicure, "Pedicure")}
              {renderSection("manicureOptions", manicure, "Manicure")}
              {renderSection("facialHairOptions", facialHair, "Facial hair removal")}
              {renderSection("bleachOptions", bleach, "Bleach & detan")}
              {renderSection("hairOptions", hair, "Hair Care")}
            </div>
            {/* DISCOUNT BOX */}
            <div 
              className="text-center p-2 ">
              {discountedPrice ? (
                <div style={{backgroundColor: "#166c34ff",color: "#ffffffff",fontSize: "12px",}}>
                  <span className="fw-semibold"style={{fontSize:"14px",}}>
                    <TbCirclePercentageFilled  /> </span>You saved ₹{(totalPrice - discountedPrice).toFixed(0)}! in this package</div>
              ) : (
                < div style={{
                backgroundColor: "#dce4ddff",
                color: "#37503bff",
                fontSize: "14px",}}>
                  <TbCirclePercentageFilled /> Add ₹
                  {Math.max(0, 3100 - totalPrice)} more to get 25% discount
                </div>
              )}
            </div>
            {/* PRICE + BUTTON */}
            <Row>
              <Col className="p-4 d-flex align-items-center">
                {discountedPrice ? (
                  <>
                    <span className="fw-semibold" style={{ fontSize: "18px" }}>
                     {formatPrice(roundPrice(discountedPrice))}
                    </span>
                    <span className="text-muted ms-2" style={{ textDecoration: "line-through", fontSize: "14px" }}>
                      {formatPrice(roundPrice(totalPrice))}
                    </span>
                  </>
                ) : (
                  <span className="fw-semibold" style={{ fontSize: "18px" }}>
                   {formatPrice(roundPrice(totalPrice))}
                  </span>
                )}
              </Col>
              <Col className="p-3 ">
               <Button
                className="butn"
                onClick={async () => {
                  const extraSelected = Object.values(selectedServices).filter(
                    s => !baseServices.some(bs => bs.title === s.title && bs.content === s.content)
                  );

                  // Step 1: Add to cart
                  await handleAddToCart(
                    selectedItem,
                    extraSelected,
                    discountedPrice ? discountedPrice : totalPrice,
                    discountedPrice ? totalPrice - discountedPrice : 0
                  );

                  // Step 2: Refresh global cart instantly
                  await fetch("http://localhost:5000/api/carts")
                    .then(res => res.json())
                    .then(data => setCarts(data.carts || []));

                  // Optional: If you have a window sync
                  if (typeof window.updateCartInstantly === "function") {
                    window.updateCartInstantly(selectedItem.title);
                  }
                 // Close modal
                  onHide();
                }}>Add to Cart</Button>
              </Col>
            </Row>
          </>
        )}
      </Modal>
      {/* DROPDOWN MODAL */}
      <Modal
        show={dropdownModal.show}
        onHide={() => {
          setDropdownModal({ ...dropdownModal, show: false });
          setLoadingDropdownKey(null);
          setShowDiscountModal(false);
          setHasChange(false);
        }}
        centered>
        <Button
          onClick={() => {
            setDropdownModal({ ...dropdownModal, show: false });
            setLoadingDropdownKey(null);}}
          className="closebtn"
          style={{ padding: "0px" }}>X</Button>
        <Modal.Header>
          <Modal.Title className="fw-semibold">{dropdownModal.label}</Modal.Title>
        </Modal.Header>
        <ModalBody>
          <Form>
            {dropdownModal.options?.map((opt, i) => {
              const key = `${dropdownModal.type}:${dropdownModal.label}`;
              const isSelected = selectedServices[key]?.content === opt.name;
              return (
                <div key={i} className="d-flex justify-content-between align-items-center mb-2 px-2">
                  <Form.Check
                    type="radio"
                    name="dropdownOptions"
                    label={opt.name}
                    checked={isSelected}
                    onChange={() => {
                      const currentKey = `${dropdownModal.type}:${dropdownModal.label}`;
                      setDropdownModal({ ...dropdownModal, selected: opt.name, show: false });
                    setLoadingDropdownKey(null);
                    setSelectedServices((prev) => {
                      const updated = { ...prev };
                      if (updated[currentKey]) {
                        updated[currentKey] = {
                          ...updated[currentKey],
                          content: opt.name,
                          price: Number(opt.price || 0),
                        };
                      } else {
                        updated[currentKey] = {
                          title: dropdownModal.label,
                          price:roundPrice( Number(opt.price || 0)),
                          count: 1,
                          content: opt.name,
                        };
                      }
                      return updated;
                    });
                    }}/>
                  <div className="fw-semibold" style={{ fontSize: "12px" }}>₹{Number(opt.price || 0)}</div>
                </div>
              );})}
          </Form>
        </ModalBody>
      </Modal>
    
      <Modal
          show={showDiscountModal}
          onHide={() => setShowDiscountModal(false)}
          centered>
          <Button
            onClick={() => setShowDiscountModal(false)}
            className="closebtn"
            style={{ padding: "0px" }}>X
          </Button>
          <ModalBody>
            <div className="p-3">
              <Row>{selectedItem && (
                <Col xs={9}>
                  <h5 className="fw-semibold">{selectedItem.title}</h5>
                  <p style={{ color: "#676767ff", fontSize: "14px", marginBottom: "4px" }}>
                    <FaStar /> {selectedItem.rating}
                  </p>
                  <p style={{ fontSize: "13px", marginBottom: "4px" }} >
                    <span className="fw-semibold">{formatPrice(discountedPrice || totalPrice)}</span>
                    {discountedPrice && (
                      <span style={{ textDecoration: "line-through", color: "#888", fontSize: "14px", marginLeft: "8px" }}>
                        {formatPrice(totalPrice)}
                      </span>
                    )}  <span style={{fontSize:"13px" ,color:"#676767ff"}}><GoDotFill style={{fontSize:"10px"}}/>{selectedItem.duration}</span>
                  </p>
                  {discountedPrice ? (
                    <div style={{ color: "rgb(7, 121, 76)", fontSize: "13px" }}>
                      <FaTag /> ₹{(totalPrice - discountedPrice).toFixed(0)} off applied!
                    </div>
                  ) : (
                    <div style={{ color: "rgb(7, 121, 76)" }}>
                      <p style={{ fontSize: "14px" }}>
                        <FaTag style={{ marginRight: "4px" }} />
                        Add ₹{Math.max(0, 3100 - totalPrice)} more
                      </p>
                    </div>
                  )}
                </Col>)}
                <Col xs={3} className="d-flex align-items-center justify-content-end">
                  {cartCount === 0 ? (
                    <Button
                    disabled={totalItems >= 3}
                    style={{
                      color: "rgb(110, 66, 229)",
                      backgroundColor: "rgb(245, 241, 255)",
                      border: "1px solid rgb(110, 66, 229)",
                      padding: "5px 18px",
                      zIndex: "2"
                    }}
                    onClick={() => {
                      if (totalItems >= 3) {
                        alert("You can only add up to 3 products.");
                        return;
                      }
                      setCartCount(1);
                      setHasChange(true);
                    }}
                  >
                    Add
                  </Button>
                  ) : (
                    <div className='d-flex align-items-center gap-2 bn' style={{border:"1px solid rgb(110, 66, 229)",backgroundColor:"rgb(245, 241, 255)", borderRadius:"6px", justifyContent: "center"}}>
                      <Button
                      onClick={() => {
                        setCartCount(prev => Math.max(0, prev - 1));
                        setHasChange(true); // mark pending update
                      }}
                      className='button'>−</Button>
                    <span className="count-box">{cartCount}</span>
                 <Button
                  onClick={() => {
                    if (cartCount >= 3) {
                      alert("You can’t add more than 3 products.");
                      return;
                    }
                    setCartCount(prev => prev + 1);
                    setHasChange(true);
                  }}
                  className='button'
                  style={{
                    opacity: cartCount >= 3 ? "0.6" : "1",              
                  }}>+</Button>
                    </div>
                  )}
                </Col>
              </Row>
            </div>
            <hr style={{border:"3px solid #676767ff"}}/>
            <div>
              <h3 className="fw-semibold">Frequently added together</h3>
            </div>
          </ModalBody>
          {hasChange && (
          <div className="p-3 pt-0">
            <Button
        variant="success" className="butn"
        onClick={async () => {
          if (hasChange) {
            const extraSelected = Object.values(selectedServices).filter(
              s => !baseServices.some(bs => bs.title === s.title && bs.content === s.content)
            );
          //Ensure item exists in cart (if not already)
            await handleAddToCart(
              selectedItem,
              extraSelected,
              discountedPrice ? discountedPrice : totalPrice,
              discountedPrice ? totalPrice - discountedPrice : 0
            );
            //Update quantity correctly
            const updatedCart = await fetch("http://localhost:5000/api/carts")
              .then(res => res.json())
              .then(data => data.carts || []);
            const existingItem = updatedCart.find(c => c.title === selectedItem.title);
            if (existingItem) {
              // Compare current count in DB vs. modal
              const diff = cartCount - existingItem.count;
              if (diff > 0) {
                // user increased quantity
                for (let i = 0; i < diff; i++) {
                  await handleIncrease(existingItem);
                }
              } else if (diff < 0) {
                // user decreased quantity
                for (let i = 0; i < Math.abs(diff); i++) {
                  await handleDecrease(existingItem);
                }
              }
            }
            //Refresh global cart
            await fetch("http://localhost:5000/api/carts")
              .then(res => res.json())
              .then(data => setCarts(data.carts || []));

            if (typeof window.updateCartInstantly === "function") {
              window.updateCartInstantly(selectedItem.title);
            }
          }
          setShowDiscountModal(false);
        }}>Done</Button>
          </div>
        )}
        </Modal>
            
    </>);}
    
export default Salon1modal;
