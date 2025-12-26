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
  const [pageTitle, setPageTitle] = useState("Super Saver Package"); // Default title

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
      // Get the first package's subcategory or title
      const firstPackage = packages[0];
      const subcategoryName = firstPackage.title || firstPackage.subcategory;
      
      if (subcategoryName) {
        setPageTitle(subcategoryName);
      } else {
        // If no subcategory, use category
        setPageTitle(firstPackage.category || "Super Saver Package");
      }
    }
  };
const fetchPackages = async () => {
  try {
    console.log("Fetching packages...");
    
    // Try multiple endpoints for fallback
    let packages = [];
    
    // FIRST and BEST OPTION: Get only active packages sorted by latest first
    try {
      const response1 = await fetch('http://localhost:5000/api/active-packages');
      if (response1.ok) {
        const data1 = await response1.json();
        packages = data1.packages || [];
        
        // Sort by createdAt in descending order (newest first)
        packages.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA; // Newest first
        });
        
        console.log(`Active packages (newest first): ${packages.length}`);
      }
    } catch (error) {
      console.error("Error with active-packages endpoint:", error);
    }
    
    // If no active packages, try all packages but filter for active ones
    if (packages.length === 0) {
      try {
        const response2 = await fetch('http://localhost:5000/api/packages');
        if (response2.ok) {
          const data2 = await response2.json();
          // Filter for active packages only
          packages = (data2.packages || []).filter(pkg => pkg.isActive !== false);
          
          // Sort by createdAt in descending order (newest first)
          packages.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA; // Newest first
          });
          
          console.log(`Filtered active packages: ${packages.length}`);
        }
      } catch (error) {
        console.error("Error with packages endpoint:", error);
      }
    }
    
    // If still no packages, try salonforwomen but filter for active
    if (packages.length === 0) {
      try {
        const response3 = await fetch('http://localhost:5000/api/salonforwomen');
        if (response3.ok) {
          const data3 = await response3.json();
          packages = data3.salonforwomen || [];
          
          // Filter for active packages if the field exists
          if (packages[0] && packages[0].isActive !== undefined) {
            packages = packages.filter(pkg => pkg.isActive !== false);
          }
          
          console.log(`Salon packages: ${packages.length}`);
        }
      } catch (error) {
        console.error("Error with salonforwomen endpoint:", error);
      }
    }
    
    // Log the packages for debugging
    if (packages.length > 0) {
      console.log("Packages found (newest first):");
      packages.forEach((pkg, index) => {
        console.log(`${index + 1}. ${pkg.name} - Active: ${pkg.isActive} - Created: ${pkg.createdAt || 'No date'}`);
      });
    }
    
    setPackages(packages);
    
  } catch (error) {
    console.error("Error fetching packages:", error);
    setPackages([]);
  }
};

  // Fetch super packages (for other sections)
  const fetchSuperPackages = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/super");
      if (!response.ok) throw new Error('Failed to fetch super packages');
      const data = await response.json();
      setSuperPack(data.super ? [data.super[0]] : []);
    } catch (error) {
      console.error("Error fetching super packages:", error);
      try {
        const staticResponse = await fetch("http://localhost:5000/api/static-data");
        const staticData = await staticResponse.json();
        setSuperPack(staticData.super ? [staticData.super[0]] : []);
      } catch (staticError) {
        console.error("Error fetching static data:", staticError);
      }
    }
  };

  // Fetch salon for women
  const fetchSalonForWomen = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/salonforwomen");
      if (!response.ok) throw new Error('Failed to fetch salon for women');
      const data = await response.json();
      setSalon(data.salonforwomen || []);
    } catch (error) {
      console.error("Error fetching salon:", error);
      try {
        const staticResponse = await fetch("http://localhost:5000/api/static-data");
        const staticData = await staticResponse.json();
        setSalon(staticData.salonforwomen || []);
      } catch (staticError) {
        console.error("Error fetching static data:", staticError);
      }
    }
  };

  // Fetch carts
  const fetchCarts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/carts");
      const data = await response.json();
      setCarts(data.carts || []);
    } catch (err) {
      console.error("Error fetching carts:", err);
    }
  };

  useEffect(() => {
    window.updateCartInstantly = async (title) => {
      await fetchCarts();
    };
    window.openEditPackageFromCart = handleShowModal;
  }, []);

  // Update page title when packages change
  useEffect(() => {
    updatePageTitle();
  }, [packages]);

  // --- Modal handlers ---
  const handleShowModal = async (item) => {
    try {
      console.log("Opening modal for item:", item);
      
      let matched = item;
      
      // Get cart data
      let existingCartItem = null;
      try {
        const cartsRes = await fetch("http://localhost:5000/api/carts");
        const cartsData = await cartsRes.json();
        existingCartItem = cartsData.carts?.find(c => 
          c.productId === item._id || 
          c.title === item.title ||
          (item._id && c.productId === item._id.toString())
        );
      } catch (cartError) {
        console.error("Error fetching cart data:", cartError);
      }

      // Prepare the item for modal
      const mergedItem = {
        ...matched,
        savedSelections: existingCartItem?.savedSelections || [],
        productId: existingCartItem?.productId || matched?._id || item._id || Date.now().toString(),
        // Use title as display title (this should be subcategory name from admin)
        displayTitle: matched?.title || matched?.subcategory || matched?.name || item.title || item.name || "Package",
        // The actual service name
        serviceName: matched?.name || item.name || "Service",
        // Ensure we have items array
        items: matched?.items || item.items || [],
        // Ensure we have price
        price: matched?.price || item.price || "0",
        // Ensure we have rating
        rating: matched?.rating || item.rating || "0",
        // Ensure we have duration
        duration: matched?.duration || item.duration || "N/A"
      };

      console.log("Merged item for modal:", mergedItem);
      setSelectedItem(mergedItem);
      setShowModal(true);
    } catch (err) {
      console.error("Error loading modal data:", err);
      // Fallback to the item we have
      setSelectedItem({
        ...item,
        productId: item._id || Date.now().toString(),
        displayTitle: item.title || item.subcategory || item.name || "Package",
        serviceName: item.name || "Service",
        items: item.items || [],
        price: item.price || "0",
        rating: item.rating || "0",
        duration: item.duration || "N/A"
      });
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

      // Use title (subcategory name) for grouping
      const displayTitle = pkg.title || pkg.subcategory || "Package";
      
      // CRITICAL: Get the product name - use pkg.name from the admin panel
      const productName = pkg.name || "Make Your Package";
      
      console.log("DEBUG - Product being added to cart:", {
        pkgObject: pkg,
        pkgName: pkg.name, // This should be "Premium Hair Care" etc.
        pkgTitle: pkg.title, // This should be "Super Saver Package"
        productName: productName
      });

      // Prepare content
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
        title: displayTitle, // This is "Super Saver Package" (subcategory)
        name: productName, // THIS IS THE KEY: Should be "Premium Hair Care" etc.
        serviceName: productName, // Same as name for compatibility
        price: totalPrice,
        count: existing ? existing.count + 1 : 1,
        content,
        savedSelections: selectedServices,
        category: pkg.category || "Salon for women"
      };

      console.log("DEBUG - Cart payload:", payload);

      let response;
      if (existing) {
        response = await fetch(`http://localhost:5000/api/carts/${existing._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch("http://localhost:5000/api/addcarts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        await fetchCarts();
        setShowFrequentlyAdded(true);
      } else {
        console.error("Failed to add to cart:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const handleIncrease = async (cartItem) => {
    try {
      const totalItems = carts.reduce((sum, item) => sum + (item.count || 0), 0);
      if (totalItems >= 3) {
        alert("You can't add anymore in this item");
        return;
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

  if (isLoading) {
    return (
      <Container className="mt-5">
        <Row>
          <Col className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading packages...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  const groupedPackages = groupPackagesBySubcategory();

  return (
    <Container className="mt-5">
      <Row>
        {/* Left Column */}
        <Col xs={12} md={7} style={{ border: "1px solid rgba(192,192,195,1)", padding: "15px" }} className='suppad'>
          {/* DYNAMIC PAGE TITLE - Shows subcategory name instead of "Super Saver Package" */}
          <h4 className="fw-semibold mt-4">
            {pageTitle}
          </h4>
          
          {/* GROUPED PACKAGES BY SUBCATEGORY */}
          {groupedPackages.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No packages available</p>
              <p style={{ fontSize: "14px" }}>Create packages in the admin panel first</p>
            </div>
          ) : (
            groupedPackages.map((group, groupIndex) => (
              <div key={groupIndex} className="subcategory-group">
                
                {/* PACKAGES UNDER THIS SUBCATEGORY */}
                {group.packages.map((pkg) => {
                  const displayTitle = pkg.title || pkg.subcategory || "Unnamed Package";
                  const serviceName = pkg.name || "Service"; // This is the product name
                  const displayItems = Array.isArray(pkg.items) ? pkg.items : [];
                  const inCart = carts.find(c => 
                    c.productId === pkg._id || 
                    (c.title === displayTitle && c.serviceName === serviceName)
                  );
                  
                  const pkgPrice = safePrice(pkg.price);
                  const displayPrice = roundPrice(pkgPrice);
                  const displayRating = pkg.rating || "0";
                  const displayDuration = pkg.duration || "N/A";

                  // Check if this is a Super Saver Package
                  const isSuperSaver = group.title === "Super Saver Package" || 
                                      displayTitle === "Super Saver Package" || 
                                      pkg.subcategory === "Super Saver Package";

                  return (
                    <div 
                      key={pkg._id} 
                      className='position-relative package-item'
                      style={{ marginBottom: "40px" }}
                    >
                      <Row className="align-items-center mt-3">
                        <Col xs={8}>
                          <p style={{ color: "#095819ff" }}>
                            <MdBackpack />{" "}
                            <span className='fw-bold' style={{ fontSize: "13px" }}>PACKAGE</span>
                          </p>
                          {/* SERVICE NAME (not the subcategory) */}
                          <h6 
                            className="fw-semibold" 
                            style={{ cursor: "pointer", fontSize: "16px" }}
                            onClick={() => handleShowModal(pkg)}
                          >
                            {serviceName}
                          </h6>
                          <p style={{ color: "#5a5959ff" }}>
                            <MdStars style={{ fontSize: "13px", color: "#6800faff" }} />{" "}
                            <span style={{ textDecoration: "underline dashed", textUnderlineOffset: "7px", fontSize: "12px" }}>
                              {displayRating}
                            </span>
                          </p>
                          <p style={{ fontSize: "12px" }}>
                            <span className="fw-semibold">{formatPrice(displayPrice)}</span>{" "}
                            <span style={{ color: "#5a5959ff" }}><GoDotFill /> {displayDuration}</span>
                          </p>
                        </Col>

                        {/* Button Column */}
                        <Col xs={4} className='position-relative' style={{ minHeight: "120px" }}> 
                          {/* Conditional rendering based on Super Saver Package */}
                          {isSuperSaver ? (
                            // DISCOUNT IMAGE FOR SUPER SAVER PACKAGE
                            <div 
                              className='position-absolute'
                              onClick={() => { 
                                setSelectedItem({
                                  ...pkg,
                                  displayTitle: displayTitle,
                                  serviceName: serviceName
                                }); 
                                setShowDiscountModal(true); 
                              }}
                              style={{
                                cursor: 'pointer',
                                width: '100%',
                                height: '120px',
                                border: 'none',
                                padding: 0,
                                background: 'transparent',
                                overflow: 'hidden',
                                top: 0,
                                left: 0
                              }}
                            >
                              <img 
                                src="http://localhost:5000/assets/discount-25.png" 
                                alt="25% OFF"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                  border: '1px solid #ddd'
                                }}
                                onError={(e) => {
                                  // Fallback if image doesn't load
                                  e.target.style.display = 'none';
                                  const fallbackDiv = document.createElement('div');
                                  fallbackDiv.style.cssText = `
                                    width: 100%;
                                    height: 100%;
                                    background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
                                    border-radius: 8px;
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    justify-content: center;
                                    color: white;
                                    font-weight: bold;
                                    font-size: 24px;
                                  `;
                                  fallbackDiv.innerHTML = '<div>25% OFF</div>';
                                  e.target.parentElement.appendChild(fallbackDiv);
                                }}
                              />
                            </div>
                          ) : (
                            // REGULAR BUTTON FOR OTHER PACKAGES
                            <Button
                              variant="outline-success"
                              size="sm"
                              className='button2 position-absolute'
                              onClick={() => { 
                                setSelectedItem({
                                  ...pkg,
                                  displayTitle: displayTitle,
                                  serviceName: serviceName
                                }); 
                                setShowDiscountModal(true); 
                              }}
                              
                            >
                              <h2 className="fw-semibold text-center" style={{ fontSize: "20px", margin: 0 }}>25% off</h2>
                            </Button>
                          )}

                          {/* ABSOLUTE BUTTON AT BOTTOM */}
                          <div className='position-absolute bottom-0 start-0 end-0 text-center'>
                            {!inCart ? (
                              <Button
                              ref={(el) => (addButtonRefs.current[pkg._id] = el)}
                              onClick={() => {
                                handleAddToCart({
                                  ...pkg,
                                  name: pkg.name, // Make sure name is explicitly passed
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
                                zIndex: "2"
                              }}
                            >
                              Add
                            </Button>
                            ) : (
                              <div 
                                className="d-flex align-items-center gap-1 bn w-50 justify-content-center" 
                                style={{
                                  border: "1px solid rgb(110, 66, 229)", 
                                  borderRadius: "6px",
                                  backgroundColor: "rgb(245, 241, 255)",
                                  marginLeft: "36px"
                                }}
                              >
                                <Button 
                                  onClick={() => handleDecrease(inCart)} 
                                  className='button border-0 d-flex align-items-center justify-content-center'
                                >
                                  −
                                </Button>
                                <span className="count-box fw-bold">{inCart.count || 1}</span>
                                <Button 
                                  onClick={() => handleIncrease(inCart)} 
                                  className='button border-0 d-flex align-items-center justify-content-center'  
                                  style={{ opacity: totalItems >= 3 ? "0.6" : "1" }}
                                >
                                  +
                                </Button>
                              </div>
                            )}
                          </div>
                        </Col>
                      </Row>
                      
                      <div style={{ borderBottom: "1px dashed #bbb6b6ff" }}></div>
                      <br />
                      
                      {/* Service Items */}
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

        {/* Right Column - Desktop Sticky Cart */}
        <Col xs={12} md={5} className="mt-4 mt-md-0 sticky-cart d-none d-md-block">
          <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(192,192,195,1)" }}></div>     
          <br />
          <CartBlock 
            carts={carts}
            formatPrice={formatPrice}
            safePrice={safePrice}
            handleIncrease={handleIncrease}
            handleDecrease={handleDecrease}
            navigate={navigate}
            onEdit={handleShowModal}
          />       
        </Col>
      </Row>

      {/* Mobile Menu */}
      <Button 
        className='menu-float position-fixed border-0 d-md-none' 
        style={{ 
          bottom: carts.length > 0 ? "120px" : "20px",
          right: "20px",
          backgroundColor: "#6e42e5",
          color: "white",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          zIndex: 1000
        }} 
        onClick={() => setShowMenu(!showMenu)}
      >
        {showMenu ? "X" : "≡"}
      </Button>

      <Modal show={showMenu} onHide={() => setShowMenu(false)} centered size='sm'>
        <ModalBody>
          <Container>
            <Row className="g-2 justify-content-center">
              {(Array.isArray(salon) ? salon.slice(0, 6) : []).map((item, index) => (
                <Col xs={4} key={index} className="text-center">
                  <div style={{ cursor: "pointer" }}>
                    <img 
                      src={
                        item.img && typeof item.img === "string"
                          ? item.img.startsWith("http")
                            ? item.img
                            : `http://localhost:5000${item.img}`
                          : "http://localhost:5000/assets/placeholder.png"
                      }
                      alt={item.name || "Menu item"}
                      style={{
                        width: "60%", 
                        borderRadius: "10px", 
                        aspectRatio: "1/1", 
                        objectFit: "cover"
                      }}
                      onError={(e) => {
                        e.target.src = "http://localhost:5000/assets/placeholder.png";
                      }}
                    />
                    <p style={{ fontSize: "12px", marginTop: "5px" }}>{item.name || ""}</p>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </ModalBody>
      </Modal>

      {/* Mobile Cart Footer */}
      {carts.length > 0 && (
        <div className="mobile-cart-footer-wrapper position-fixed d-flex flex-column d-lg-none"
          style={{
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "white",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
            padding: "10px",
            zIndex: 999
          }}
        >
          <Button 
            className="mobile-cart-footer-button mobile-cart-footer-total w-100 border-0" 
            onClick={() => navigate("/cart")}
            style={{
              backgroundColor: "#6e42e5",
              color: "white",
              padding: "12px"
            }}
          >
            View cart ({carts.length} items)
          </Button>
        </div>
      )}

      {/* Salon Modal */}
      <Salon1modal
        showFrequentlyAdded={showFrequentlyAdded} 
        setShowFrequentlyAdded={setShowFrequentlyAdded}
        show={showModal} 
        totalItems={totalItems}
        onHide={handleCloseModal}
        selectedItem={selectedItem}
        handleAddToCart={handleAddToCart} 
        fetchCarts={fetchCarts}  
        carts={carts} 
        setCarts={setCarts}
        addButtonRefs={addButtonRefs}
        basePrice={basePrice}
        baseServices={baseServices}
        roundPrice={roundPrice}
        showDiscountModal={showDiscountModal}
        setShowDiscountModal={setShowDiscountModal}
        handleDecrease={handleDecrease} 
        handleIncrease={handleIncrease}
      />
    </Container>
  );
}

export default Salon1;