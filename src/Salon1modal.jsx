import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { Button, ModalBody, Form, Row, Col } from "react-bootstrap";
import { IoTime } from "react-icons/io5";
import { TbCirclePercentageFilled } from "react-icons/tb";
import { FaStar, FaTag } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import ProgressBar from 'react-bootstrap/ProgressBar';
function Salon1modal({
  show,
  totalItems = 0,
  showFrequentlyAdded = false,
  setShowFrequentlyAdded = () => {},
  carts = [],
  setCarts = () => {},
  onHide = () => {},
  selectedItem = null,
  handleAddToCart = async () => {},
  basePrice = 0,
  baseServices = [],
  roundPrice = v => Math.round(v),
  showDiscountModal = false,
  setShowDiscountModal = () => {},
  handleDecrease = async () => {},
  handleIncrease = async () => {},
}) {
  // ---------- state ----------
  const [loadingDropdownKey, setLoadingDropdownKey] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [hasChange, setHasChange] = useState(false);
  const [index, setIndex] = useState(0);
  const [carouselCounts, setCarouselCounts] = useState({});
  const visibleCount = 3.5; // used for carousel boundary calculation

  const [dropdownModal, setDropdownModal] = useState({ show: false, label: "", options: [], selected: "", type: "" });
  const [totalPrice, setTotalPrice] = useState(basePrice || 0);
  const [discountedPrice, setDiscountedPrice] = useState(null);

  // ---------- static data (kept from your original file) ----------
  const initialServices = {
    "waxingOptions:Full arms (including underarms)": { title: "Full arms (including underarms)", price: 599, count: 1, content: "Chocolate Roll on" },
    "waxingOptions:Full legs": { title: "Full legs", price: 499, count: 1, content: "Chocolate Roll on" },
    "facialOptions:O3+ shine & glow facial": { title: "O3+ shine & glow facial", price: 1699, count: 1, content: "Facial" },
    "facialHairOptions:Eyebrow": { title: "Eyebrow", price: 49, count: 1, content: "Threading" },
    "facialHairOptions:Upper lip": { title: "Upper lip", price: 49, count: 1, content: "Threading" },
  };

  const [selectedServices, setSelectedServices] = useState(initialServices);

  const [addedImgs, setAddedImgs] = useState([]);     

  const waxingOptions = [
    { label: "Full arms (including underarms)", options: [ { name: "RICA White Chocolate Wax", price: 499 }, { name: "Chocolate Roll on", price: 599 }, { name: "Honey Wax", price: 319 }, { name: "RICA Roll on", price: 679 } ] },
    { label: "Full legs", options: [ { name: "Honey Wax", price: 319 }, { name: "RICA White Chocolate Wax", price: 549 }, { name: "Chocolate Roll on", price: 499 }, { name: "RICA Roll on", price: 629 } ] },
    { label: "Underarms", options: [ { name: "Honey Wax", price: 49 }, { name: "RICA peel-off", price: 149 } ] },
    { label: "Bikini line", options: [ { name: "Honey Premium Wax", price: 249 }, { name: "RICA peel-off", price: 249 } ] },
    { label: "Half arms", options: [ { name: "Honey Wax", price: 219 }, { name: "RICA White Chocolate Wax", price: 319 } ] },
    { label: "Half legs", options: [ { name: "RICA White Chocolate Wax", price: 369 }, { name: "Honey Wax", price: 219 } ] },
    { label: "Stomach", options: [ { name: "Chocolate Roll on", price: 569 }, { name: "Honey Wax", price: 319 }, { name: "RICA White Chocolate Wax", price: 469 }, { name: "RICA Roll on", price: 619 } ] },
    { label: "Back", options: [ { name: "RICA Roll on", price: 669 }, { name: "RICA White Chocolate Wax", price: 519 }, { name: "Chocolate Roll on", price: 619 }, { name: "Honey Wax", price: 469 } ] },
    { label: "Bikini", options: [ { name: "RICA peel-off", price: 1299 }, { name: "Honey Premium Wax", price: 949 } ] },
    { label: "Full body", options: [ { name: "Honey Wax", price: 1369 }, { name: "RICA White Chocolate Wax", price: 1919 }, { name: "RICA Roll on", price: 2019 }, { name: "Chocolate Roll on", price: 1619 } ] },
    { label: "I don't need anything", options: [] },
  ];

  const facial = [ { label: "Sara Lightening glow facial", price: 949 }, { label: "Elysian firming wine glow facial", price: 1049 }, { label: "O3+ shine & glow facial", price: 1699 }, { label: "O3+ power brightening facial", price: 1999 }, { label: "Sara fruit cleanup", price: 699 }, { label: "O3+ tan clear cleanup", price: 849 }, { label: "I don't need anything" } ];

  const pedicure = [ { label: "Elysian Chocolate & Vanilla pedicure", price: 849 }, { label: "Elysian Candle Spa pedicure", price: 999 }, { label: "Elysian British Rose pedicure", price: 759 }, { label: "I don't need anything" } ];

  const manicure = [ { label: "Cut,file & polish - Hands", price: 149 }, { label: "Elysian British Rose manicure", price: 649 }, { label: "Elysian Chocolate & Vanilla manicure", price: 699 }, { label: "Elysian Candle Spa manicure", price: 899 }, { label: "I don't need anything" } ];

  const bleach = [ { label: "Face & neck", options: [ { name: "Bleach", price: 299 }, { name: "Detan", price: 349 } ] }, { label: "Full legs", options: [ { name: "Detan", price: 499 }, { name: "Bleach", price: 499 } ] }, { label: "Full body", options: [ { name: "Detan", price: 1499 }, { name: "Bleach", price: 1499 } ] }, { label: "Full arms", options: [ { name: "Detan", price: 349 }, { name: "Bleach", price: 349 } ] }, { label: "Chest", options: [ { name: "Detan", price: 399 }, { name: "Bleach", price: 399 } ] }, { label: "Back", options: [ { name: "Detan", price: 399 }, { name: "Bleach", price: 399 } ] }, { label: "I don't need anything", options: [] } ];

  const facialHair = [ { label: "Eyebrow", options: [ { name: "Threading", price: 49 } ] }, { label: "Forehead", options: [ { name: "Threading", price: 59 }, { name: "Face waxing", price: 99 } ] }, { label: "Face", options: [ { name: "Face waxing", price: 399 }, { name: "Threading", price: 149 } ] }, { label: "Sidelocks", options: [ { name: "Threading", price: 49 }, { name: "Face waxing", price: 99 } ] }, { label: "Upper lip", options: [ { name: "Face waxing", price: 69 }, { name: "Threading", price: 49 } ] }, { label: "Neck", options: [ { name: "Threading", price: 149 }, { name: "Face waxing", price: 199 } ] }, { label: "Jawline", options: [ { name: "Face waxing", price: 99 }, { name: "Threading", price: 99 } ] }, { label: "Chin", options: [ { name: "Threading", price: 29 }, { name: "Face waxing", price: 99 } ] }, { label: "I don't need anything", options: [] } ];

  const hair = [ { label: "Hair color application", price: 249 }, { label: "Henna mehendi application", price: 399 }, { label: "Head massage (10 mins)", price: 199 }, { label: "Head massage (20 mins)", price: 349 }, { label: "I don't need anything" } ];

  const isInCart = (itemTitle) => (Array.isArray(carts) ? carts.some(c => c.title === itemTitle) : false);

  // ---------- effects ----------
  useEffect(() => {
    if (cartCount === 0) setShowFrequentlyAdded(false);
  }, [cartCount, setShowFrequentlyAdded]);

  useEffect(() => {
    // load added images/items from API (safe guard)
    fetch("http://localhost:5000/api/added")
      .then(res => res.json())
      .then(data => setAddedImgs(data.added || []))
      .catch(err => console.error("Failed to load added images:", err));
  }, []);

  useEffect(() => {
    if (selectedItem) {
      const cartItem = (Array.isArray(carts) ? carts.find(c => c.title === selectedItem.title) : null);
      setCartCount(cartItem?.count || 0);
    }
  }, [carts, selectedItem]);

  useEffect(() => {
    if (show && selectedItem) {
      fetch("http://localhost:5000/api/carts")
        .then(res => res.json())
        .then(data => {
          const found = (data?.carts || []).find(c => c.title === selectedItem.title);
          if (found?.savedSelections?.length > 0) {
            const restored = {};
            found.savedSelections.forEach(s => {
              const key = `restored:${s.title}`;
              restored[key] = { title: s.title, content: s.content, price: Number(s.price), count: 1 };
            });
            setSelectedServices(prev => ({ ...prev, ...restored }));
          }
        })
        .catch(err => console.error("Error syncing cart saved selections:", err));
    }
  }, [show, selectedItem]);

  useEffect(() => {
    const extraPrice = Object.values(selectedServices).reduce((sum, s) => {
      const isBase = Array.isArray(baseServices) && baseServices.some(bs => bs.title === s.title && bs.content === s.content);
      return sum + (isBase ? 0 : Number(s.price || 0));
    }, 0);

    const total = Number(basePrice || 0) + extraPrice;
    setTotalPrice(roundPrice(total));

    // If total exceeds base + 905, apply 25% off (your original logic used 0.75)
    if (total >= (Number(basePrice || 0) + 905)) {
      setDiscountedPrice(roundPrice(total * 0.75));
    } else {
      setDiscountedPrice(null);
    }
  }, [selectedServices, basePrice, baseServices, roundPrice]);

  // ---------- helpers ----------
  const handleCheckboxChange = (section, label, option, isChecked) => {
    setSelectedServices(prev => {
      const updated = { ...prev };
      const key = `${section}:${label}`;

      if (isChecked) {
        const price = Number(option?.price ?? option?.price ?? 0);
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
  };

  const formatPrice = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

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
                  onChange={(e) => handleCheckboxChange(sectionName, item.label, item.options ? item.options[0] : item, e.target.checked)}
                  className="fw-semibold"
                  style={{ fontSize: "14px" }}
                />

                {item.label !== "I don't need anything" && (
                  <div style={{ fontSize: "12px", marginLeft: "25px", color: "#7d7c7cff" }}>
                    {selectedServices[key]
                      ? `₹${selectedServices[key].price}`
                      : item.options
                        ? `₹${Number(item.options[0]?.price ?? 0)}`
                        : `₹${Number(item.price ?? 0)}`}
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
                      setDropdownModal({ show: true, label: item.label, options: item.options, selected: selectedOption || item.options[0].name, type: sectionName });
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {loadingDropdownKey === key ? (
                      <div className="spinner-border spinner-border-sm text-secondary" role="status"><span className="visually-hidden">Loading...</span></div>
                    ) : (
                      isChecked ? `${item.label} (${selectedOption || item.options[0].name})` : item.options[0].name
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

  // carousel controls (safe with addedImgs declared above)
  const handleNext = () => {
    if (index < Math.max(0, addedImgs.length - visibleCount)) setIndex(i => i + 1);
  };
  const handlePrev = () => { if (index > 0) setIndex(i => i - 1); };

  // ---------- render ----------
  return (
    <>
      <Modal show={show} onHide={onHide} centered contentClassName="custom-modal">
        <Button type="button" onClick={onHide} className="closebtn" style={{ padding: "0px" }}>X</Button>

        {selectedItem && (
          <>
            <div className="p-3" style={{ backgroundColor: "#ede1d4", borderRadius: "10px" }}>
              <h4 className="fw-semibold">{selectedItem.title}</h4>
              <p><IoTime /> Service time: {selectedItem.duration ?? "3 hrs 50 mins"}</p>
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

            <div className="text-center p-2">
              {discountedPrice ? (
                <div style={{ backgroundColor: "#166c34ff", color: "#ffffffff", fontSize: "12px" }}>
                  <span className="fw-semibold" style={{ fontSize: "14px" }}><TbCirclePercentageFilled /></span>
                  You saved {formatPrice(totalPrice - discountedPrice)}! in this package
                </div>
              ) : (
                <div style={{ backgroundColor: "#dce4ddff", color: "#37503bff", fontSize: "14px" }}>
                  <TbCirclePercentageFilled /> Add {formatPrice(Math.max(0, 3100 - totalPrice))} more to get 25% discount
                </div>
              )}
            </div>

            <Row>
              <Col className="p-4 d-flex align-items-center">
                {discountedPrice ? (
                  <>
                    <span className="fw-semibold" style={{ fontSize: "18px" }}>{formatPrice(roundPrice(discountedPrice))}</span>
                    <span className="text-muted ms-2" style={{ textDecoration: "line-through", fontSize: "14px" }}>{formatPrice(roundPrice(totalPrice))}</span>
                  </>
                ) : (
                  <span className="fw-semibold" style={{ fontSize: "18px" }}>{formatPrice(roundPrice(totalPrice))}</span>
                )}
              </Col>

              <Col className="p-3">
                <Button
                  className="butn"
                  onClick={async () => {
                    const extraSelected = Object.values(selectedServices).filter(s => !Array.isArray(baseServices) || !baseServices.some(bs => bs.title === s.title && bs.content === s.content));

                    await handleAddToCart(selectedItem, extraSelected, discountedPrice ? discountedPrice : totalPrice, discountedPrice ? totalPrice - discountedPrice : 0);

                    // Refresh cart from server
                    try {
                      const refreshed = await fetch("http://localhost:5000/api/carts").then(r => r.json()).then(d => d.carts || []);
                      setCarts(refreshed);
                    } catch (err) {
                      console.error("Failed to refresh cart:", err);
                    }

                    if (typeof window.updateCartInstantly === "function") window.updateCartInstantly(selectedItem.title);

                    onHide();
                    setShowFrequentlyAdded(true);
                  }}
                >Add to Cart</Button>
              </Col>
            </Row>
          </>
        )}
      </Modal>

      {/* DROPDOWN MODAL */}
      <Modal
        show={dropdownModal.show}
        onHide={() => { setDropdownModal({ ...dropdownModal, show: false }); setLoadingDropdownKey(null); setShowDiscountModal(false); setHasChange(false); }}
        centered
      >
        <Button type="button" onClick={() => { setDropdownModal({ ...dropdownModal, show: false }); setLoadingDropdownKey(null); }} className="closebtn" style={{ padding: "0px" }}>X</Button>
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
                    name={`dropdownOptions-${dropdownModal.label}`}
                    label={opt.name}
                    checked={isSelected}
                    onChange={() => {
                      const currentKey = `${dropdownModal.type}:${dropdownModal.label}`;
                      setDropdownModal({ ...dropdownModal, selected: opt.name, show: false });
                      setLoadingDropdownKey(null);
                      setSelectedServices(prev => {
                        const updated = { ...prev };
                        updated[currentKey] = {
                          title: dropdownModal.label,
                          price: roundPrice(Number(opt.price || 0)),
                          count: 1,
                          content: opt.name,
                        };
                        return updated;
                      });
                    }}
                  />

                  <div className="fw-semibold" style={{ fontSize: "12px" }}>₹{Number(opt.price || 0)}</div>
                </div>
              );
            })}
          </Form>
        </ModalBody>
      </Modal>

      {/* DISCOUNT / CART CHANGE MODAL */}
      <Modal show={showDiscountModal} onHide={() => { setShowDiscountModal(false); setShowFrequentlyAdded(false); }} centered>
        <Button type="button" onClick={() => setShowDiscountModal(false)} className="closebtn" style={{ padding: "0px" }}>X</Button>
        <ModalBody>
          <div className="p-3">
            <Row>
              {selectedItem && (
                <Col xs={9}>
                  <h5 className="fw-semibold">{selectedItem.title}</h5>
                  <p style={{ color: "#676767ff", fontSize: "14px", marginBottom: "4px" }}><FaStar /> {selectedItem.rating}</p>

                  <p style={{ fontSize: "13px", marginBottom: "4px" }}>
                    <span className="fw-semibold">{formatPrice(discountedPrice || totalPrice)}</span>
                    {discountedPrice && <span style={{ textDecoration: "line-through", color: "#888", fontSize: "14px", marginLeft: "8px" }}>{formatPrice(totalPrice)}</span>}
                    <span style={{ fontSize: "13px", color: "#676767ff" }}><GoDotFill style={{ fontSize: "10px" }} />{selectedItem.duration}</span>
                  </p>

                  {discountedPrice ? (
                    <div style={{ color: "rgb(7, 121, 76)", fontSize: "13px" }}><FaTag /> {formatPrice(totalPrice - discountedPrice)} off applied!</div>
                  ) : (
                    <div style={{ color: "rgb(7, 121, 76)" }}><p style={{ fontSize: "14px" }}><FaTag style={{ marginRight: "4px" }} /> Add {formatPrice(Math.max(0, 3100 - totalPrice))} more</p></div>
                  )}
                </Col>
              )}

              <Col xs={3} className="d-flex align-items-center justify-content-end">
                {cartCount === 0 ? (
                  <Button
                    type="button"
                    disabled={totalItems >= 3}
                    style={{ color: "rgb(110, 66, 229)", backgroundColor: "rgb(245, 241, 255)", border: "1px solid rgb(110, 66, 229)", padding: "5px 18px", zIndex: "2" }}
                    onClick={() => {
                      if (totalItems >= 3) { alert("You can only add up to 3 products."); return; }
                      setCartCount(1);
                      setHasChange(true);
                      setShowFrequentlyAdded(true);
                    }}
                  >Add</Button>
                ) : (
                  <div className='d-flex align-items-center gap-2 bn' style={{ border: "1px solid rgb(110, 66, 229)", backgroundColor: "rgb(245, 241, 255)", borderRadius: "6px", justifyContent: "center" }}>
                    <Button type="button" onClick={() => { setCartCount(prev => Math.max(0, prev - 1)); setHasChange(true); }} className='button'>−</Button>
                    <span className="count-box">{cartCount}</span>
                    <Button type="button" onClick={() => { if (cartCount >= 3) { alert("You can’t add more than 3 products."); return; } setCartCount(prev => prev + 1); setHasChange(true); }} className='button' style={{ opacity: cartCount >= 3 ? "0.6" : "1" }}>+</Button>
                  </div>
                )}
              </Col>
            </Row>
            {showFrequentlyAdded && (  
              <div className="mt-4">
                <hr style={{ border: "3px solid #676767ff" }} />
                <h4 className="fw-bold mb-3">Frequently added together</h4>
                <div className="position-relative overflow-hidden" style={{ width: "100%" }}>
                  {index > 0 && (<div onClick={handlePrev} className="carousel-arrow left">&#10094;</div>)}
                  <div className="d-flex transition" style={{ transform: `translateX(-${index * 160}px)`, transition: "transform 0.5s ease", gap: "20px" }}>
                    {addedImgs.map((img, i) => (
                      <div key={i} style={{ minWidth: "140px" }}>
                        <img src={`http://localhost:5000/${img.img}`} alt={img.key} style={{ width: "140px", height: "140px", borderRadius: "10px", objectFit: "cover" }} />
                        <p className="fw-semibold" style={{ fontSize: "12px", minHeight: "32px", marginBottom: "6px" }}>{img.name}</p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span className="fw-semibold" style={{ fontSize: "12px" }}>₹{img.price}</span>
                          {(carouselCounts[img.key] || 0) > 0 ? (
                            <div className="d-flex align-items-center" style={{ border: "1px solid rgb(110, 66, 229)", backgroundColor: "rgb(245, 241, 255)", borderRadius: "6px", width: "60px", height: "25px" }}>
                              <Button type="button" style={{ width: "5px", height: "23px" }} className="button" onClick={() => setCarouselCounts(prev => ({ ...prev, [img.key]: Math.max(0, (prev[img.key] || 0) - 1) }))}>−</Button>
                              <span className="count-box">{carouselCounts[img.key] || 0}</span>
                              <Button type="button" style={{ width: "5px", height: "24px" }} className="button" onClick={() => setCarouselCounts(prev => ({ ...prev, [img.key]: (prev[img.key] || 0) + 1 }))}>+</Button>
                            </div>
                          ) : (
                            <Button className="fw-semibold" style={{ width: "50px", border: "1px solid #d4d4d4ff", borderRadius: "6px", backgroundColor: "#fff", color: "rgb(110, 66, 229)", fontSize: "12px" }} onClick={async () => {
                              setCarouselCounts(prev => ({ ...prev, [img.key]: 1 }));
                              await handleAddToCart({ title: img.name, price: img.price }, [], img.price, 0);
                              try { const refreshed = await fetch("http://localhost:5000/api/carts").then(r => r.json()).then(d => d.carts || []); setCarts(refreshed); } catch (err) { console.error(err); }
                            }}>Add</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {index < Math.max(0, addedImgs.length - 1) && (<div onClick={handleNext} className="carousel-arrow right">&#10095;</div>)}
                </div>
              </div>
            )}
            <hr style={{ border: "3px solid #676767ff" }} />
            {/* Rating breakdown */}
            {Array.isArray(selectedItem?.ratingBreak) && selectedItem.ratingBreak.length > 0 && (
              <div style={{ marginTop: "10px" }}>
                {selectedItem.ratingBreak.map((rb, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "13px",
                      marginBottom: "6px",
                    }}>
                    <div style={{ display: "flex", alignItems: "center", width: "45px" }}>
                      <FaStar style={{ fontSize: "12px", marginRight: "3px" }} />
                      <span style={{ fontWeight: "600", fontSize: "14px" }}>{rb.stars}</span>
                    </div>
                    {/* Progress bar */}
                    <div
                      style={{
                        flexGrow: 1,
                        height: "8px",
                        background: "#e6e6e6",
                        borderRadius: "3px",
                        overflow: "hidden",
                        margin: "0 12px",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, Number(rb.value) || 0)}%`,
                          height: "100%",
                          background: "#000",
                        }}
                      ></div>
                    </div>
                    {/* Review count → 6.8M */}
                    <div style={{ width: "50px", textAlign: "right", fontWeight: "600" }}>
                      {rb.count}
                    </div>
                  </div>
                ))}

              </div>
            )}
          </div>
          {hasChange && (
            <div className="p-3 pt-0">
              <Button variant="success" className="butn" onClick={async () => {
                if (!hasChange) return;

                const extraSelected = Object.values(selectedServices).filter(s => !Array.isArray(baseServices) || !baseServices.some(bs => bs.title === s.title && bs.content === s.content));

                await handleAddToCart(selectedItem, extraSelected, discountedPrice ? discountedPrice : totalPrice, discountedPrice ? totalPrice - discountedPrice : 0);

                // fetch updated cart and adjust counts
                try {
                  const updatedCart = await fetch("http://localhost:5000/api/carts").then(r => r.json()).then(d => d.carts || []);
                  const existingItem = updatedCart.find(c => c.title === selectedItem.title);
                  if (existingItem) {
                    const diff = cartCount - existingItem.count;
                    if (diff > 0) {
                      for (let i = 0; i < diff; i++) await handleIncrease(existingItem);
                    } else if (diff < 0) {
                      for (let i = 0; i < Math.abs(diff); i++) await handleDecrease(existingItem);
                    }
                  }

                  const refreshed = await fetch("http://localhost:5000/api/carts").then(r => r.json()).then(d => d.carts || []);
                  setCarts(refreshed);
                } catch (err) {
                  console.error("Error updating cart counts:", err);
                }

                if (typeof window.updateCartInstantly === "function") window.updateCartInstantly(selectedItem.title);
                setShowDiscountModal(false);
              }}>Done</Button>
            </div>
          )}

        </ModalBody>
      </Modal>
    </>
  );
}

export default Salon1modal;
