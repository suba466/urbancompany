import React, { useState, useEffect, useMemo } from "react";
import Modal from "react-bootstrap/Modal";
import { Button, ModalBody, Form, Row, Col } from "react-bootstrap";
import { IoTime } from "react-icons/io5";
import { TbCirclePercentageFilled } from "react-icons/tb";
import { FaStar, FaTag } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import FrequentlyAddedCarousel from "./FrequentlyAddedCarousel";

function Salon1modal({
  show,
  totalItems = 0,
  showFrequentlyAdded = false,
  setShowFrequentlyAdded = () => { },
  carts = [],
  setCarts = () => { },
  onHide = () => { },
  selectedItem = null,
  handleAddToCart = async () => { },
  basePrice = 0,
  baseServices = [],
  roundPrice = v => Math.round(v),
  showDiscountModal = false,
  setShowDiscountModal = () => { },
  updateItem = () => { },
  removeItem = () => { },
  addItem = () => { }
}) {
  // ---------- state ----------
  const [loadingDropdownKey, setLoadingDropdownKey] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [hasChange, setHasChange] = useState(false);
  const [index, setIndex] = useState(0);
  const [carouselCounts, setCarouselCounts] = useState({});
  const visibleCount = 3.5;

  const [dropdownModal, setDropdownModal] = useState({ show: false, label: "", options: [], selected: "", type: "" });

  // ---------- static data ----------
  const initialServices = {
    "waxingOptions:Full arms (including underarms)": { title: "Full arms (including underarms)", price: 599, count: 1, content: "Chocolate Roll on", group: "Waxing" },
    "waxingOptions:Full legs": { title: "Full legs", price: 499, count: 1, content: "Chocolate Roll on", group: "Waxing" },
    "facialOptions:O3+ shine & glow facial": { title: "O3+ shine & glow facial", price: 1699, count: 1, content: "Facial", group: "Facial & cleanup" },
    "facialHairOptions:Eyebrow": { title: "Eyebrow", price: 49, count: 1, content: "Threading", group: "Facial hair removal" },
    "facialHairOptions:Upper lip": { title: "Upper lip", price: 49, count: 1, content: "Threading", group: "Facial hair removal" },
  };

  const [selectedServices, setSelectedServices] = useState(initialServices);
  const [addedImgs, setAddedImgs] = useState([]);

  // Compute effective carts for carousel display (merging real cart with pending changes)
  const effectiveCarts = useMemo(() => {
    // Create a map of current cart items for easy lookup
    const cartMap = new Map(carts.map(c => [c.title, c]));

    // Apply local carousel changes
    Object.entries(carouselCounts).forEach(([key, count]) => {
      const img = addedImgs.find(i => i.key === key);
      if (img) {
        if (count > 0) {
          // If item exists in cart, update count. If not, mock it.
          const existing = cartMap.get(img.name);
          cartMap.set(img.name, existing ? { ...existing, count } : { title: img.name, count, price: img.price, productId: img.key, isFrequentlyAdded: true });
        } else {
          // If count is 0, remove from view
          cartMap.delete(img.name);
        }
      }
    });

    return Array.from(cartMap.values());
  }, [carts, carouselCounts, addedImgs]);

  // Filter out items that are already in cart
  // Filter out items that are already in effectiveCarts for carousel display
  const visibleCarouselItems = addedImgs.filter(img => {
    const inCart = effectiveCarts.some(c => c.title === img.name);
    return !inCart;
  });

  const waxingOptions = [
    { label: "Full arms (including underarms)", options: [{ name: "RICA White Chocolate Wax", price: 499 }, { name: "Chocolate Roll on", price: 599 }, { name: "Honey Wax", price: 319 }, { name: "RICA Roll on", price: 679 }] },
    { label: "Full legs", options: [{ name: "Honey Wax", price: 319 }, { name: "RICA White Chocolate Wax", price: 549 }, { name: "Chocolate Roll on", price: 499 }, { name: "RICA Roll on", price: 629 }] },
    { label: "Underarms", options: [{ name: "Honey Wax", price: 49 }, { name: "RICA peel-off", price: 149 }] },
    { label: "Bikini line", options: [{ name: "Honey Premium Wax", price: 249 }, { name: "RICA peel-off", price: 249 }] },
    { label: "Half arms", options: [{ name: "Honey Wax", price: 219 }, { name: "RICA White Chocolate Wax", price: 319 }] },
    { label: "Half legs", options: [{ name: "RICA White Chocolate Wax", price: 369 }, { name: "Honey Wax", price: 219 }] },
    { label: "Stomach", options: [{ name: "Chocolate Roll on", price: 569 }, { name: "Honey Wax", price: 319 }, { name: "RICA White Chocolate Wax", price: 469 }, { name: "RICA Roll on", price: 619 }] },
    { label: "Back", options: [{ name: "RICA Roll on", price: 669 }, { name: "RICA White Chocolate Wax", price: 519 }, { name: "Chocolate Roll on", price: 619 }, { name: "Honey Wax", price: 469 }] },
    { label: "Bikini", options: [{ name: "RICA peel-off", price: 1299 }, { name: "Honey Premium Wax", price: 949 }] },
    { label: "Full body", options: [{ name: "Honey Wax", price: 1369 }, { name: "RICA White Chocolate Wax", price: 1919 }, { name: "RICA Roll on", price: 2019 }, { name: "Chocolate Roll on", price: 1619 }] },
    { label: "I don't need anything", options: [] },
  ];

  const facial = [{ label: "Sara Lightening glow facial", price: 949 }, { label: "Elysian firming wine glow facial", price: 1049 }, { label: "O3+ shine & glow facial", price: 1699 }, { label: "O3+ power brightening facial", price: 1999 }, { label: "Sara fruit cleanup", price: 699 }, { label: "O3+ tan clear cleanup", price: 849 }, { label: "I don't need anything" }];
  const pedicure = [{ label: "Elysian Chocolate & Vanilla pedicure", price: 849 }, { label: "Elysian Candle Spa pedicure", price: 999 }, { label: "Elysian British Rose pedicure", price: 759 }, { label: "I don't need anything" }];
  const manicure = [{ label: "Cut,file & polish - Hands", price: 149 }, { label: "Elysian British Rose manicure", price: 649 }, { label: "Elysian Chocolate & Vanilla manicure", price: 699 }, { label: "Elysian Candle Spa manicure", price: 899 }, { label: "I don't need anything" }];
  const bleach = [{ label: "Face & neck", options: [{ name: "Bleach", price: 299 }, { name: "Detan", price: 349 }] }, { label: "Full legs", options: [{ name: "Detan", price: 499 }, { name: "Bleach", price: 499 }] }, { label: "Full body", options: [{ name: "Detan", price: 1499 }, { name: "Bleach", price: 1499 }] }, { label: "Full arms", options: [{ name: "Detan", price: 349 }, { name: "Bleach", price: 349 }] }, { label: "Chest", options: [{ name: "Detan", price: 399 }, { name: "Bleach", price: 399 }] }, { label: "Back", options: [{ name: "Detan", price: 399 }, { name: "Bleach", price: 399 }] }, { label: "I don't need anything", options: [] }];
  const facialHair = [{ label: "Eyebrow", options: [{ name: "Threading", price: 49 }] }, { label: "Forehead", options: [{ name: "Threading", price: 59 }, { name: "Face waxing", price: 99 }] }, { label: "Face", options: [{ name: "Face waxing", price: 399 }, { name: "Threading", price: 149 }] }, { label: "Sidelocks", options: [{ name: "Threading", price: 49 }, { name: "Face waxing", price: 99 }] }, { label: "Upper lip", options: [{ name: "Face waxing", price: 69 }, { name: "Threading", price: 49 }] }, { label: "Neck", options: [{ name: "Threading", price: 149 }, { name: "Face waxing", price: 199 }] }, { label: "Jawline", options: [{ name: "Face waxing", price: 99 }, { name: "Threading", price: 99 }] }, { label: "Chin", options: [{ name: "Threading", price: 29 }, { name: "Face waxing", price: 99 }] }, { label: "I don't need anything", options: [] }];
  const hair = [{ label: "Hair color application", price: 249 }, { label: "Henna mehendi application", price: 399 }, { label: "Head massage (10 mins)", price: 199 }, { label: "Head massage (20 mins)", price: 349 }, { label: "I don't need anything" }];

  // ---------- ADD THE MISSING FUNCTION HERE ----------
  const handleCheckboxChange = (sectionName, label, item, isChecked, groupName) => {
    const key = `${sectionName}:${label}`;

    if (isChecked) {
      // Add service to selectedServices
      setSelectedServices(prev => ({
        ...prev,
        [key]: {
          title: label,
          price: roundPrice(Number(item.price || (item.options ? item.options[0]?.price : 0) || 0)),
          count: 1,
          content: item.options ? item.options[0]?.name : label,
          group: groupName
        }
      }));
    } else {
      // Remove service from selectedServices
      setSelectedServices(prev => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  };

  // ---------- effects ----------
  useEffect(() => {
    if (cartCount === 0) setShowFrequentlyAdded(false);
  }, [cartCount, setShowFrequentlyAdded]);

  // Fetch added images from server
  useEffect(() => {
    const fetchAddedImages = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/added");
        if (!response.ok) {
          throw new Error('Failed to fetch added items');
        }
        const data = await response.json();
        setAddedImgs(data.added || []);
      } catch (error) {
        console.error("Failed to load added images:", error);
        // Fallback: Try static data API
        try {
          const staticResponse = await fetch("http://localhost:5000/api/static-data");
          const staticData = await staticResponse.json();
          setAddedImgs(staticData.added || []);
        } catch (staticError) {
          console.error("Error fetching static data:", staticError);
          setAddedImgs([]);
        }
      }
    };

    fetchAddedImages();
  }, []);

  // Initialize cartCount from props/cart
  useEffect(() => {
    if (selectedItem) {
      const cartItem = (Array.isArray(carts) ? carts.find(c => c.title === selectedItem.title) : null);
      setCartCount(cartItem?.count || 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, showDiscountModal]); // Initialize only when item changes or modal opens

  // Initialize carouselCounts from props/cart
  useEffect(() => {
    const updatedCounts = {};
    addedImgs.forEach(img => {
      const cartItem = carts.find(c => c.title === img.name);
      updatedCounts[img.key] = cartItem ? cartItem.count : 0;
    });
    setCarouselCounts(updatedCounts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, addedImgs, showDiscountModal]); // Initialize when item changes, not on every cart update (to keep local state pending)



  const fetchCarts = () => {
    return fetch("http://localhost:5000/api/carts")
      .then(res => res.json())
      .then(data => {
        if (typeof setCarts === 'function') setCarts(data.carts || []);
        return data.carts || [];
      })
      .catch(err => console.error("Error fetching carts:", err));
  };

  useEffect(() => {
    if (show && selectedItem) {
      const foundInProps = Array.isArray(carts) ? carts.find(c => c.title === (selectedItem.title || selectedItem.name)) : null;

      const allSections = {
        waxingOptions,
        facialOptions: facial,
        pedicureOptions: pedicure,
        manicureOptions: manicure,
        facialHairOptions: facialHair,
        bleachOptions: bleach,
        hairOptions: hair
      };

      const processFound = (found) => {
        if (found?.savedSelections?.length > 0) {
          const restored = {};
          found.savedSelections.forEach(s => {
            let foundKey = null;
            // Try to find which section this title belongs to for correct UI state
            for (const [sectionName, items] of Object.entries(allSections)) {
              if (items.some(it => it.label === s.title)) {
                foundKey = `${sectionName}:${s.title}`;
                break;
              }
            }

            const key = foundKey || `restored:${s.title}`;
            restored[key] = {
              title: s.title,
              content: s.content,
              price: Number(s.price),
              count: 1,
              group: s.group || (foundKey ? foundKey.split(':')[0] : "Waxing")
            };
          });
          setSelectedServices(prev => ({ ...prev, ...restored }));
        }
      };

      if (foundInProps) {
        processFound(foundInProps);
      } else {
        fetch("http://localhost:5000/api/carts")
          .then(res => res.json())
          .then(data => {
            const found = (data?.carts || []).find(c => c.title === (selectedItem.title || selectedItem.name));
            processFound(found);
          })
          .catch(err => console.error("Error syncing cart saved selections:", err));
      }
    }
  }, [show, selectedItem, carts]);

  // No filtering - show all added items so user can edit qty


  const extraPrice = useMemo(() => {
    return Object.values(selectedServices).reduce((sum, s) => {
      const isBase = baseServices?.some(bs => bs.title === s.title && bs.content === s.content);
      return sum + (isBase ? 0 : Number(s.price || 0));
    }, 0);
  }, [selectedServices, baseServices]);

  const totalPrice = useMemo(() => roundPrice(Number(basePrice) + extraPrice), [basePrice, extraPrice]);

  const discountedPrice = useMemo(() => {
    return totalPrice >= Number(basePrice) + 905 ? roundPrice(totalPrice * 0.75) : null;
  }, [totalPrice, basePrice]);

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
                  onChange={(e) => handleCheckboxChange(sectionName, item.label, item.options ? item.options[0] : item, e.target.checked, displayName)}
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
                    className="drop position-relative"
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

  // Check if anything changed to enable Done button
  const hasPendingChanges = useMemo(() => {
    // Check main item changes
    const originalCartItem = carts.find(c => c.title === selectedItem?.title);
    const originalCount = originalCartItem?.count || 0;
    if (cartCount !== originalCount) return true;

    // Check carousel changes
    for (const [key, count] of Object.entries(carouselCounts)) {
      const img = addedImgs.find(i => i.key === key);
      if (img) {
        const originalCarouselItem = carts.find(c => c.title === img.name);
        const originalCarouselCount = originalCarouselItem?.count || 0;
        if (count !== originalCarouselCount) return true;
      }
    }
    return false;
  }, [cartCount, carouselCounts, carts, selectedItem, addedImgs]);

  // ---------- render ----------
  return (
    <>
      <Modal show={show} onHide={onHide} centered contentClassName="custom-modal">
        <Button type="button" onClick={onHide} className="position-absolute border-0 justify-content-center closebtn p-0" >X</Button>

        {selectedItem && (
          <>
            <div className="p-3" style={{ backgroundColor: "#ede1d4", borderRadius: "10px" }}>
              <h4 className="fw-semibold">{selectedItem.title}</h4>
              <p><IoTime /> Service time: {selectedItem.duration ?? "3 hrs 50 mins"}</p>
            </div>

            <div className="p-3 scroll position-relative" tabIndex={0}>
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
                    <span className="text-muted ms-2 text-decoration-line-through" style={{ fontSize: "14px" }}>{formatPrice(roundPrice(totalPrice))}</span>
                  </>
                ) : (
                  <span className="fw-semibold" style={{ fontSize: "18px" }}>{formatPrice(roundPrice(totalPrice))}</span>
                )}
              </Col>

              <Col className="p-3">
                <Button
                  className="butn w-100 fw-bold"
                  onClick={async () => {
                    const allSelected = Object.values(selectedServices);

                    // Get current count from cart or default to 1 (to keep count same when editing)
                    const existingItem = Array.isArray(carts) ? carts.find(c => c.title === (selectedItem.title || selectedItem.name)) : null;
                    const currentCount = existingItem ? existingItem.count || 1 : 1;

                    await handleAddToCart(selectedItem, allSelected, discountedPrice ? discountedPrice : totalPrice, false, currentCount);

                    // Refresh cart from server
                    try {
                      const refreshed = await fetch("http://localhost:5000/api/carts").then(r => r.json()).then(d => d.carts || []);
                      if (typeof setCarts === 'function') setCarts(refreshed);
                    } catch (err) {
                      console.error("Failed to refresh cart:", err);
                    }

                    if (typeof window.updateCartInstantly === "function") window.updateCartInstantly(selectedItem.title || selectedItem.name);

                    onHide();
                    // Don't modify showFrequentlyAdded here, it should be controlled by caller or specific logic
                    if (setShowFrequentlyAdded) setShowFrequentlyAdded(true);
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
        centered>
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
                          group: selectedServices[currentKey]?.group || dropdownModal.label
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
      <Modal show={showDiscountModal} onHide={() => { setShowDiscountModal(false); setShowFrequentlyAdded(false); }} centered contentClassName="custom-modal" dialogClassName="modal-bottom-fixed">
        <Button type="button" onClick={() => setShowDiscountModal(false)} className="position-absolute border-0 justify-content-center closebtn p-0" >X</Button>
        {selectedItem && (
          <div className="d-flex flex-column" style={{ height: "100%" }}>

            <ModalBody
              tabIndex={0}
              style={{
                maxHeight: 'calc(100vh - 150px)', // Adjust based on fixed footer height
                overflowY: 'auto',
                paddingBottom: "80px" // Padding for fixed footer
              }}
            >

              <div className="p-3 position-relative">
                <Row>
                  <Col xs={9}>
                    <h5 className="fw-semibold">{selectedItem.title}</h5>
                    <p style={{ color: "#676767ff", fontSize: "14px", marginBottom: "4px" }}><FaStar /> {selectedItem.rating}</p>

                    <p style={{ fontSize: "13px", marginBottom: "4px" }}>
                      <span className="fw-semibold">{formatPrice(discountedPrice || totalPrice)}</span>
                      {discountedPrice && <span className="text-decoration-line-through" style={{ color: "#888", fontSize: "14px", marginLeft: "8px" }}>{formatPrice(totalPrice)}</span>}
                      <span style={{ fontSize: "13px", color: "#676767ff" }}><GoDotFill style={{ fontSize: "10px" }} />{selectedItem.duration}</span>
                    </p>

                    {discountedPrice ? (
                      <div style={{ color: "rgb(7, 121, 76)", fontSize: "13px" }}><FaTag /> {formatPrice(totalPrice - discountedPrice)} off applied!</div>
                    ) : (
                      <div style={{ color: "rgb(7, 121, 76)" }}><p style={{ fontSize: "14px" }}><FaTag style={{ marginRight: "4px" }} /> Add {formatPrice(Math.max(0, 3100 - totalPrice))} more</p></div>
                    )}
                  </Col>

                  <Col xs={3} className="d-flex align-items-center justify-content-end">
                    {cartCount === 0 ? (
                      <Button
                        type="button"
                        disabled={totalItems >= 3}
                        style={{ color: "rgb(110, 66, 229)", backgroundColor: "rgb(245, 241, 255)", border: "1px solid rgb(110, 66, 229)", padding: "5px 18px", zIndex: "2" }}
                        onClick={() => {
                          if (totalItems >= 3) {
                            alert("You can only add up to 3 products.");
                            return;
                          }
                          setCartCount(1);
                        }}
                      >Add</Button>
                    ) : (
                      <div className='d-flex align-items-center gap-1 bn' style={{ border: "1px solid rgb(110, 66, 229)", backgroundColor: "rgb(245, 241, 255)", borderRadius: "6px" }}>
                        <Button
                          type="button"
                          onClick={() => {
                            setCartCount(prev => Math.max(0, prev - 1));
                          }}
                          className='button border-0 d-flex align-items-center justify-content-center'>−</Button>
                        <span className="count-box fw-bold">{cartCount}</span>
                        <Button
                          type="button"
                          onClick={() => {
                            if (cartCount >= 3) {
                              alert("You can't add more than 3 products.");
                              return;
                            }
                            setCartCount(prev => prev + 1);
                          }}
                          className='button border-0 d-flex align-items-center justify-content-center'
                          style={{ opacity: cartCount >= 3 ? "0.6" : "1" }}
                        >+</Button>
                      </div>
                    )}
                  </Col>
                </Row>

                {showFrequentlyAdded && (
                  <div className="mt-4">
                    <hr style={{ border: "3px solid #676767ff" }} />
                    <h4 className="fw-bold mb-3">Frequently added together</h4>

                    {/* Use your FrequentlyAddedCarousel component */}
                    <FrequentlyAddedCarousel
                      items={visibleCarouselItems}
                      carts={effectiveCarts} // Use effectiveCarts here
                      onAdd={async (item) => {
                        setCarouselCounts(prev => ({
                          ...prev,
                          [item.key]: (prev[item.key] || 0) + 1
                        }));
                      }}
                      onRemove={async (item) => {
                        setCarouselCounts(prev => ({
                          ...prev,
                          [item.key]: Math.max(0, (prev[item.key] || 0) - 1)
                        }));
                      }}
                    />
                  </div>
                )}

                <hr style={{ border: "3px solid #676767ff" }} />

                {/* Rating section remains the same */}
                {Array.isArray(selectedItem?.ratingBreak) && selectedItem.ratingBreak.length > 0 && (
                  <div className="mt-5">
                    <h3><FaStar style={{ marginBottom: "10px" }} /> <span className="fw-semibold" style={{ fontSize: "37px" }}>4.85</span></h3>
                    <p style={{ color: "#4c4c4cff", marginTop: "-5px" }}>  7.3M reviews</p>
                    {selectedItem.ratingBreak.map((rb, i) => (
                      <div className="d-flex align-items-center"
                        key={i}
                        style={{
                          fontSize: "13px",
                          marginBottom: "6px",
                        }}>
                        <div className="d-flex align-items-center" style={{ width: "45px" }}>
                          <FaStar style={{ fontSize: "12px", marginRight: "3px" }} />
                          <span className="fw-semibold" style={{ fontSize: "16px" }}>{rb.stars}</span>
                        </div>
                        <div
                          style={{
                            flexGrow: 1,
                            height: "8px",
                            background: "#e6e6e6",
                            borderRadius: "3px",
                            overflow: "hidden",
                            margin: "0 12px",
                          }}>
                          <div
                            style={{
                              width: `${Math.min(100, Number(rb.value) || 0)}%`,
                              height: "100%",
                              background: "#000",
                            }}
                          ></div>
                        </div>
                        <div className="text-end w-50" >
                          {rb.count}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ModalBody>

            {/* FIXED FOOTER */}
            <div
              className="position-absolute bottom-0 w-100 bg-white shadow-lg"
              style={{
                zIndex: 1050,
                borderTop: "1px solid #e0e0e0",
                paddingBottom: "10px"
              }}
            >
              <div className="p-3">
                <Row className="align-items-center mb-3">
                  <Col xs={12}>
                    <h5 className="fw-semibold mb-1">{selectedItem.title}</h5>
                    <p style={{ color: "#676767ff", fontSize: "14px", marginBottom: "0" }}>
                      <FaStar className="me-1" /> {selectedItem.rating}
                    </p>
                    <p style={{ fontSize: "13px", marginBottom: "0" }}>
                      <span className="fw-semibold">{formatPrice(discountedPrice || totalPrice)}</span>
                      {discountedPrice && <span className="text-decoration-line-through text-muted ms-2">{formatPrice(totalPrice)}</span>}
                    </p>
                  </Col>
                </Row>

                {/* DONE BUTTON */}
                {hasPendingChanges && (
                  <Button
                    variant="success"
                    className="w-100 fw-bold py-2"
                    onClick={async () => {
                      // 1. Commit Main Item Changes
                      const originalCartItem = carts.find(c => c.title === selectedItem.title);
                      const originalCount = originalCartItem?.count || 0;

                      if (cartCount > 0 && cartCount !== originalCount) {
                        if (originalCartItem) {
                          // Update existing
                          try {
                            await fetch(`http://localhost:5000/api/carts/${originalCartItem._id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ count: cartCount })
                            });
                            if (updateItem) updateItem(originalCartItem._id || originalCartItem.productId, cartCount);
                          } catch (e) { console.error(e); }
                        } else {
                          // Add new
                          const extraSelected = Object.values(selectedServices).filter(s => !Array.isArray(baseServices) || !baseServices.some(bs => bs.title === s.title && bs.content === s.content));
                          await handleAddToCart(selectedItem, extraSelected, discountedPrice || totalPrice, false, cartCount);
                        }
                      } else if (cartCount === 0 && originalCount > 0) {
                        // Remove
                        if (originalCartItem) {
                          try {
                            await fetch(`http://localhost:5000/api/carts/${originalCartItem._id}`, {
                              method: "DELETE"
                            });
                            if (removeItem) removeItem(originalCartItem._id || originalCartItem.productId);
                          } catch (e) { console.error(e); }
                        }
                      }

                      // 2. Commit Carousel Changes
                      for (const [key, count] of Object.entries(carouselCounts)) {
                        const img = addedImgs.find(img => img.key === key);
                        if (img) {
                          const existingCarouselItem = carts.find(c => c.title === img.name);
                          const originalCarouselCount = existingCarouselItem?.count || 0;

                          if (count !== originalCarouselCount) {
                            if (count > 0) {
                              const cartPayload = {
                                productId: img.key,
                                title: img.name,
                                price: img.price,
                                count: count,
                                content: [{ details: img.name, price: img.price }],
                                savedSelections: [],
                                isFrequentlyAdded: true
                              };

                              if (existingCarouselItem) {
                                // Update
                                await fetch(`http://localhost:5000/api/carts/${existingCarouselItem._id}`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ ...cartPayload, count: count })
                                });
                                if (updateItem) updateItem(existingCarouselItem._id || existingCarouselItem.productId, count);
                              } else {
                                // Add
                                await fetch("http://localhost:5000/api/addcarts", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify(cartPayload)
                                });
                                if (addItem) addItem(cartPayload);
                              }
                            } else {
                              // Remove
                              if (existingCarouselItem) {
                                await fetch(`http://localhost:5000/api/carts/${existingCarouselItem._id}`, {
                                  method: "DELETE"
                                });
                                if (removeItem) removeItem(existingCarouselItem._id || existingCarouselItem.productId);
                              }
                            }
                          }
                        }
                      }

                      // Refresh carts and close modal
                      await fetchCarts();
                      if (typeof window.updateCartInstantly === "function") {
                        window.updateCartInstantly(selectedItem.title);
                      }

                      setShowDiscountModal(false);
                      setShowFrequentlyAdded(true);
                    }}
                  >
                    Done
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export default Salon1modal;