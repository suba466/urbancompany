import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import { useState, useEffect, useRef } from 'react';
import { Button, ModalBody } from 'react-bootstrap';
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
  const addButtonRefs = useRef({});
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const normalizeKey = (str) => str?.toLowerCase()?.trim()?.replace(/\s+/g, "-") || "";
  const roundPrice = (price) => Math.round(Number(price) || 0);
  const totalItems = carts.reduce((sum, item) => sum + (item.count || 0), 0);
  const [showFrequentlyAdded, setShowFrequentlyAdded] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("Super Saver Package");

  // Group packages by subcategory (title)
  const groupPackagesBySubcategory = () => {
    const groups = {};

    packages.forEach(pkg => {
      // Use title (which is subcategory name from admin) for grouping
      const subcategory = pkg.title || pkg.subcategory || pkg.name || "Uncategorized";

      if (!groups[subcategory]) {
        groups[subcategory] = {
          title: subcategory,
          packages: []
        };
      }

      groups[subcategory].packages.push(pkg);
    });

    return Object.values(groups);
  };

  // --- Fetch Data ---
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchSuperPackages(),
          fetchPackages(),
          fetchCarts(),
          fetchSalonForWomen()
        ]);
        // After fetching packages, update page title
        updatePageTitle();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Update page title based on packages
  const updatePageTitle = () => {
    if (packages.length > 0) {
      // Check for multiple subcategories
      const uniqueSubcats = new Set(packages.map(p => p.title || p.subcategory).filter(Boolean));

      if (uniqueSubcats.size > 1) {
        // If multiple subcategories, hide the main title so we can use section headers
        setPageTitle("");
      } else {
        const firstPackage = packages[0];
        const subcategoryName = firstPackage.title || firstPackage.subcategory;

        if (subcategoryName) {
          setPageTitle(subcategoryName);
        } else {
          setPageTitle(firstPackage.category || "Super Saver Package");
        }
      }
    }
  };

  const fetchPackages = async () => {
    try {
      // Try active-packages first
      let packages = [];
      try {
        const response1 = await fetch('http://localhost:5000/api/active-packages');
        if (response1.ok) {
          const data1 = await response1.json();
          packages = data1.packages || [];
          packages.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }
      } catch (error) { console.error(error); }

      if (packages.length === 0) {
        try {
          const response2 = await fetch('http://localhost:5000/api/packages');
          if (response2.ok) {
            const data2 = await response2.json();
            packages = (data2.packages || []).filter(pkg => pkg.isActive !== false);
            packages.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          }
        } catch (error) { console.error(error); }
      }

      if (packages.length === 0) {
        try {
          const response3 = await fetch('http://localhost:5000/api/salonforwomen');
          if (response3.ok) {
            const data3 = await response3.json();
            packages = data3.salonforwomen || [];
            if (packages[0] && packages[0].isActive !== undefined) {
              packages = packages.filter(pkg => pkg.isActive !== false);
            }
          }
        } catch (error) { console.error(error); }
      }
      setPackages(packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      setPackages([]);
    }
  };

  const fetchSuperPackages = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/super");
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setSuperPack(data.super ? [data.super[0]] : []);
    } catch (error) {
      try {
        const staticResponse = await fetch("http://localhost:5000/api/static-data");
        const staticData = await staticResponse.json();
        setSuperPack(staticData.super ? [staticData.super[0]] : []);
      } catch (e) { }
    }
  };

  const fetchSalonForWomen = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/salonforwomen");
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setSalon(data.salonforwomen || []);
    } catch (error) {
      try {
        const staticResponse = await fetch("http://localhost:5000/api/static-data");
        const staticData = await staticResponse.json();
        setSalon(staticData.salonforwomen || []);
      } catch (e) { }
    }
  };

  const fetchCarts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/carts");
      const data = await response.json();
      setCarts(data.carts || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    window.updateCartInstantly = async () => { await fetchCarts(); };
    window.openEditPackageFromCart = handleShowModal;
  }, []);

  useEffect(() => { updatePageTitle(); }, [packages]);

  const handleShowModal = async (item) => {
    try {
      let matched = item;
      let existingCartItem = null;
      try {
        const cartsRes = await fetch("http://localhost:5000/api/carts");
        const cartsData = await cartsRes.json();
        existingCartItem = cartsData.carts?.find(c =>
          c.productId === item._id || c.title === item.title || (item._id && c.productId === item._id.toString())
        );
      } catch (cartError) { }

      const mergedItem = {
        ...matched,
        savedSelections: existingCartItem?.savedSelections || [],
        productId: existingCartItem?.productId || matched?._id || item._id || Date.now().toString(),
        displayTitle: matched?.title || matched?.subcategory || matched?.name || item.title || "Package",
        serviceName: matched?.name || item.name || "Service",
        items: matched?.items || item.items || [],
        price: matched?.price || item.price || "0",
        rating: matched?.rating || item.rating || "0",
        duration: matched?.duration || item.duration || "N/A"
      };
      setSelectedItem(mergedItem);
      setShowModal(true);
    } catch (err) {
      setSelectedItem(item);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const baseServices = [
    { title: "Full arms (including underarms)", price: 599, content: "Chocolate Roll on" },
    { title: "Full legs", price: 499, content: "Chocolate Roll on" },
    { title: "O3+ shine & glow facial", price: 1699, content: "Facial" },
    { title: "Eyebrow", price: 49, content: "Threading" },
    { title: "Upper lip", price: 49, content: "Threading" },
  ];
  const basePrice = 2195;

  const handleAddToCart = async (pkg, selectedServices = [], overridePrice = null, isExtraOnly = false) => {
    try {
      const productId = pkg.productId || pkg._id || Date.now().toString();
      const existing = carts.find(c => c.productId === productId || c._id === productId);
      const displayTitle = pkg.title || pkg.subcategory || "Package";
      const productName = pkg.name || "Make Your Package";

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

      const totalPrice = overridePrice || (pkg.price ? Number(pkg.price) : content.reduce((sum, s) => sum + s.price, 0));

      const payload = {
        productId,
        title: displayTitle,
        name: productName,
        serviceName: productName,
        price: totalPrice,
        count: existing ? existing.count + 1 : 1,
        content,
        savedSelections: selectedServices,
        category: pkg.category || "Salon for women"
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
      setShowFrequentlyAdded(true);
    } catch (error) { console.error(error); }
  };

  const handleIncrease = async (cartItem) => {
    try {
      const totalItems = carts.reduce((sum, item) => sum + (item.count || 0), 0);
      if (totalItems >= 3) { alert("You can't add anymore in this item"); return; }
      await fetch(`http://localhost:5000/api/carts/${cartItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: (cartItem.count || 1) + 1 })
      });
      fetchCarts();
    } catch (err) { }
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
    } catch (err) { }
  };

  const formatPrice = (amount) => {
    if (typeof amount === 'string') {
      const numericValue = parseFloat(amount.replace(/[^0-9.-]+/g, ''));
      return `₹${isNaN(numericValue) ? '0' : numericValue.toLocaleString("en-IN")}`;
    }
    return `₹${(amount || 0).toLocaleString("en-IN")}`;
  };

  const safePrice = (price) => {
    if (!price) return 0;
    const strPrice = price.toString();
    return Number(strPrice.replace(/[₹,]/g, '')) || 0;
  };

  if (isLoading) return <Container className="mt-5"><p className="text-center">Loading...</p></Container>;

  const groupedPackages = groupPackagesBySubcategory();

  return (
    <Container className="mt-5">
      <Row>
        <Col xs={12} md={7} style={{ border: "1px solid rgba(192,192,195,1)", padding: "15px" }} className='suppad'>
          {pageTitle && <h4 className="fw-semibold mt-4">{pageTitle}</h4>}

          {groupedPackages.length === 0 ? (
            <div className="text-center py-5"><p>No packages available</p></div>
          ) : (
            groupedPackages.map((group, groupIndex) => (
              <div key={groupIndex} className="subcategory-group" id={`section-${normalizeKey(group.title)}`}>

                {groupedPackages.length > 1 && (
                  <h5 className="fw-bold mb-3 mt-4 text-dark border-bottom pb-2">
                    {group.title}
                  </h5>
                )}

                {group.packages.map((pkg) => {
                  const displayTitle = pkg.title || pkg.subcategory || "Unnamed Package";
                  const serviceName = pkg.name || "Service";
                  const displayItems = Array.isArray(pkg.items) ? pkg.items : [];
                  const inCart = carts.find(c => c.productId === pkg._id || (c.title === displayTitle && c.serviceName === serviceName));
                  const pkgPrice = safePrice(pkg.price);
                  const displayPrice = roundPrice(pkgPrice);
                  const displayRating = pkg.rating || "0";
                  const displayDuration = pkg.duration || "N/A";
                  const isSuperSaver = group.title === "Super Saver Package" || displayTitle === "Super Saver Package" || pkg.subcategory === "Super Saver Package";

                  return (
                    <div key={pkg._id} className='position-relative package-item' style={{ marginBottom: "40px" }}>

                      {/* --- BANNER IMAGE SECTION (New Requirement) --- */}
                      {(pkg.img || isSuperSaver) && (
                        <div
                          className="mb-3 position-relative shadow-sm"
                          onClick={() => handleShowModal(pkg)}
                          style={{
                            cursor: "pointer",
                            borderRadius: "16px",
                            overflow: "hidden",
                            height: "180px",
                            marginTop: "10px"
                          }}
                        >
                          <img
                            src={
                              pkg.img
                                ? (pkg.img.startsWith("http") ? pkg.img : `http://localhost:5000${pkg.img}`)
                                : "http://localhost:5000/assets/discount-25.png"
                            }
                            alt={pkg.name || "Service"}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              objectPosition: "center"
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "http://localhost:5000/assets/placeholder.png";
                            }}
                          />
                        </div>
                      )}

                      {/* --- DETAILS SECTION (Old Code Requirement) --- */}
                      <Row className="align-items-center mt-3">
                        <Col xs={8}>
                          <p style={{ color: "#095819ff", marginBottom: "5px" }}>
                            <MdBackpack /> <span className='fw-bold' style={{ fontSize: "13px" }}>PACKAGE</span>
                          </p>
                          <h6 className="fw-semibold" style={{ cursor: "pointer", fontSize: "16px" }} onClick={() => handleShowModal(pkg)}>
                            {serviceName}
                          </h6>
                          <p style={{ color: "#5a5959ff", marginBottom: "5px" }}>
                            <MdStars style={{ fontSize: "13px", color: "#6800faff" }} /> <span style={{ textDecoration: "underline dashed", textUnderlineOffset: "7px", fontSize: "12px" }}>{displayRating}</span>
                          </p>
                          <p style={{ fontSize: "12px", marginBottom: "5px" }}>
                            <span className="fw-semibold">{formatPrice(displayPrice)}</span> <span style={{ color: "#5a5959ff" }}><GoDotFill /> {displayDuration}</span>
                          </p>
                        </Col>

                        {/* --- ACTION COLUMN --- */}
                        <Col xs={4} className='position-relative' style={{ minHeight: "80px", display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          {/* Logic: If Image/Banner was shown above, we just need the button here. 
                               If Image was NOT shown (no pkg.img and not superSaver?), we show badge + button. 
                               But the Banner block above covers (pkg.img || isSuperSaver).
                               So effectively, if we have a banner, we just show button. 
                               If we DON'T have a banner, we show badge? 
                               Actually, isSuperSaver logic in User code puts a badge if NO image. 
                               My banner logic puts a banner if NO image but is super saver.
                               So: Banner covers almost everything. 
                               If Banner is NOT shown (no image, not super saver), then we probably just need the button.
                               Let's keep it clean: Just Button here since visuals are handled.
                           */}

                          <div className="w-100 text-end">
                            {!inCart ? (
                              <Button
                                ref={(el) => (addButtonRefs.current[pkg._id] = el)}
                                onClick={() => {
                                  handleAddToCart({
                                    ...pkg,
                                    name: pkg.name,
                                    displayTitle: displayTitle,
                                    serviceName: serviceName,
                                    productId: pkg._id
                                  }, []);
                                }}
                                style={{
                                  color: "rgb(110, 66, 229)",
                                  backgroundColor: "rgb(245, 241, 255)",
                                  border: "1px solid rgb(110, 66, 229)",
                                  padding: "5px 18px",
                                  zIndex: "2",
                                  fontWeight: "600"
                                }}
                              >
                                Add
                              </Button>
                            ) : (
                              <div
                                className="d-flex align-items-center justify-content-between ms-auto"
                                style={{
                                  border: "1px solid rgb(110, 66, 229)",
                                  borderRadius: "6px",
                                  backgroundColor: "rgb(245, 241, 255)",
                                  padding: "4px",
                                  width: "90px"
                                }}
                              >
                                <Button onClick={() => handleDecrease(inCart)} className='button border-0 p-0 text-dark d-flex align-items-center justify-content-center bg-transparent' style={{ width: "24px" }}>−</Button>
                                <span className="fw-bold" style={{ fontSize: "14px" }}>{inCart.count || 1}</span>
                                <Button onClick={() => handleIncrease(inCart)} className='button border-0 p-0 text-dark d-flex align-items-center justify-content-center bg-transparent' style={{ width: "24px", opacity: totalItems >= 3 ? "0.6" : "1" }}>+</Button>
                              </div>
                            )}
                          </div>
                        </Col>
                      </Row>

                      {/* --- FOOTER DETAILS (Old Code) --- */}
                      <div style={{ borderBottom: "1px dashed #bbb6b6ff" }}></div>
                      <br />
                      <div style={{ fontSize: "12px" }}>
                        {displayItems.length > 0 ? (
                          displayItems.map((item, idx) => (
                            <p key={idx} style={{ margin: "2px 0" }}>
                              <GoDotFill style={{ fontSize: "10px", color: "#5a5959ff" }} />{" "}
                              {item.name && <span className='fw-bold'>{item.name}</span>}
                              {item.name && item.description && <span> : </span>}
                              <span>{item.description || ""}</span>
                            </p>
                          ))
                        ) : pkg.description ? (
                          <p style={{ margin: "2px 0" }}>
                            <GoDotFill style={{ fontSize: "10px", color: "#5a5959ff" }} />{" "}
                            <span>{pkg.description.substring(0, 100)}...</span>
                          </p>
                        ) : (
                          <p className="text-muted">No service details available</p>
                        )}
                      </div>
                      <br />
                      <Button
                        className='edit'
                        onClick={() => handleShowModal(pkg)}
                        style={{
                          backgroundColor: "transparent",
                          border: "1px solid #ccc",
                          color: "#333",
                          padding: "5px 15px",
                          fontSize: "14px"
                        }}
                      >
                        Edit your package
                      </Button>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </Col>
        <Col xs={12} md={5} className="mt-4 mt-md-0 sticky-cart d-none d-md-block">
          <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(192,192,195,1)" }}></div>
          <br />
          <CartBlock carts={carts} formatPrice={formatPrice} safePrice={safePrice} handleIncrease={handleIncrease} handleDecrease={handleDecrease} navigate={navigate} onEdit={handleShowModal} />
        </Col>
      </Row>
      {carts.length > 0 && (
        <div className="mobile-cart-footer-wrapper position-fixed d-flex flex-column d-lg-none" style={{ bottom: 0, left: 0, right: 0, backgroundColor: "white", boxShadow: "0 -2px 10px rgba(0,0,0,0.1)", padding: "10px", zIndex: 999 }}>
          <Button className="mobile-cart-footer-button mobile-cart-footer-total w-100 border-0" onClick={() => navigate("/cart")} style={{ backgroundColor: "#6e42e5", color: "white", padding: "12px" }}>View cart ({carts.length} items)</Button>
        </div>
      )}
      <Salon1modal showFrequentlyAdded={showFrequentlyAdded} setShowFrequentlyAdded={setShowFrequentlyAdded} show={showModal} totalItems={totalItems} onHide={handleCloseModal} selectedItem={selectedItem} handleAddToCart={handleAddToCart} fetchCarts={fetchCarts} carts={carts} setCarts={setCarts} addButtonRefs={addButtonRefs} basePrice={basePrice} baseServices={baseServices} roundPrice={roundPrice} showDiscountModal={showDiscountModal} setShowDiscountModal={setShowDiscountModal} handleDecrease={handleDecrease} handleIncrease={handleIncrease} />
    </Container>
  );
}

export default Salon1;