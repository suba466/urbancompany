import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import { useState, useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { MdBackpack, MdStars } from "react-icons/md";
import { GoDotFill } from "react-icons/go";
import Salon1modal from './Salon1modal';
import { useNavigate } from 'react-router-dom';
import CartBlock from './CartBlock';
import { useCart } from "./hooks";
import API_URL, { getAssetPath, shouldCallApi } from "./config";
import { fetchData } from "./apiService";

function Salon1() {
  const [savedExtras, setSavedExtras] = useState({});
  const [superPack, setSuperPack] = useState([]);
  const [packages, setPackages] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [salon, setSalon] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const addButtonRefs = useRef({});
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const normalizeKey = (str) => str?.toLowerCase()?.trim()?.replace(/\s+/g, "-") || "";
  const roundPrice = (price) => Math.round(Number(price) || 0);
  const [showFrequentlyAdded, setShowFrequentlyAdded] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("Super Saver Package");

  // USE REDUX CART
  const { items: carts, addItem, removeItem, updateItem, count: totalItems } = useCart();

  // Calculate total price for mobile footer
  const calculateTotalPrice = () => {
    return carts.reduce((total, item) => {
      const price = safePrice(item.price) || 0;
      const count = item.count || 1;
      return total + (price * count);
    }, 0);
  };

  // Handle view cart navigation
  const handleViewCart = () => {
    // Use Redux cart data directly - no need to fetch
    if (carts.length === 0) {
      alert("Your cart is empty");
      return;
    }

    // Navigate to cart summary page
    navigate('/cart-summary');
  };

  // Group packages by subcategory (title)
  const groupPackagesBySubcategory = () => {
    const groups = {};

    packages.forEach(pkg => {
      const subcategory = pkg.subcategory || pkg.title || pkg.name || "Uncategorized";

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
        console.log("Salon1: Fetching all data...");
        // Use individual try-catches or a timeout to prevent hanging
        await Promise.allSettled([
          fetchSuperPackages(),
          fetchPackages(),
          fetchSalonForWomen()
        ]);
        console.log("Salon1: Data fetch completed (or settled)");
        updatePageTitle();
      } catch (error) {
        console.error("Error in Salon1 fetchAllData:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Update page title based on packages
  const updatePageTitle = () => {
    if (packages.length > 0) {
      const uniqueSubcats = new Set(packages.map(p => p.title || p.subcategory).filter(Boolean));

      if (uniqueSubcats.size > 1) {
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
      let packages = [];

      // 1. Try active packages
      const data1 = await fetchData("api/active-packages", "packages");
      if (data1 && data1.packages) {
        packages = data1.packages;
      }

      // 2. Try all packages if needed
      if (packages.length === 0) {
        const data2 = await fetchData("api/packages", "packages");
        if (data2 && data2.packages) {
          packages = data2.packages;
        }
      }

      // 3. Try specifically salon for women endpoint
      if (packages.length === 0) {
        const data3 = await fetchData("api/salonforwomen", "salonforwomen");
        if (data3 && data3.salonforwomen) {
          packages = data3.salonforwomen;
        }
      }

      // Ensure we only have active ones
      if (packages.length > 0) {
        packages = packages.filter(pkg => pkg.isActive !== false);
        packages.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      }

      // 4. Fallback to local data if still empty
      if (packages.length === 0) {
        const data = await fetchData("data.json");
        if (data) {
          const sourceItems = data.packages || data.added || data.book || [];
          packages = sourceItems.map((item, idx) => ({
            _id: item._id || item.key || `fallback-pkg-${idx}`,
            name: item.name,
            title: item.subcategory || item.category || "Salon for women",
            subcategory: item.subcategory || item.category || "Salon for women",
            price: (item.value || "").replace('₹', '') || item.price || "499",
            rating: item.rating || (item.title || "").split('(')[0] || "4.8",
            reviews: item.reviews || (item.title || "").match(/\(([^)]+)\)/)?.[1] || "1M",
            img: item.img,
            isActive: true,
            items: item.items || ["Service included", "Professional technician"]
          }));
        }
      }

      // 5. Final Subcategory Filtering (if applicable)
      const activeSubCategory = localStorage.getItem('activeSubCategory');
      if (activeSubCategory && packages.length > 0) {
        const filtered = packages.filter(pkg =>
          (pkg.subcategory && pkg.subcategory.toLowerCase() === activeSubCategory.toLowerCase()) ||
          (pkg.title && pkg.title.toLowerCase() === activeSubCategory.toLowerCase()) ||
          (pkg.category && pkg.category.toLowerCase() === activeSubCategory.toLowerCase())
        );
        // Only override if filtered results exist
        if (filtered.length > 0) {
          packages = filtered;
        }
      }

      setPackages(packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      setPackages([]);
    }
  };

  const fetchSuperPackages = async () => {
    try {
      const data = await fetchData("api/super", "super");
      if (data && data.super) {
        setSuperPack([data.super[0]]);
      } else {
        // Fallback already handled by fetchData or manual fallback
        setSuperPack([{
          key: "super",
          img: "/assets/super.jpg",
          title: "Festive ready package",
          price: "25% off",
          text: "Facials & more"
        }]);
      }
    } catch (error) {
      console.error("Super packages fetch error:", error);
    }
  };

  const fetchSalonForWomen = async () => {
    try {
      const data = await fetchData("api/salonforwomen", "salonforwomen");
      if (data && data.salonforwomen) {
        setSalon(data.salonforwomen);
      } else {
        const local = await fetchData("data.json");
        setSalon(local?.salonforwomen || local?.added || [
          { name: "Foot massage", price: "199", img: "/assets/foot.webp" }
        ]);
      }
    } catch (error) {
      console.error("Salon for women fetch error:", error);
    }
  };


  useEffect(() => {
    window.openEditPackageFromCart = handleShowModal;
  }, []);

  useEffect(() => { updatePageTitle(); }, [packages]);

  const isCustomPackage = (item) => {
    const name = item.name || item.title || "";
    return name.toLowerCase().includes("make your");
  };

  const handleShowModal = async (item) => {
    // Only allow modal for "Make Your Package" items
    if (!isCustomPackage(item)) {
      return;
    }

    try {
      let matched = item;
      let existingCartItem = carts.find(c =>
        c.productId === item._id || c.title === item.title || (item._id && c.productId === item._id.toString())
      );

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

  const handleShowCarouselModal = async (item) => {
    try {
      let matched = item;
      let existingCartItem = carts.find(c =>
        c.productId === item._id || c.title === item.title || (item._id && c.productId === item._id.toString())
      );

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
      setShowDiscountModal(true);
      setShowFrequentlyAdded(true);
    } catch (err) {
      setSelectedItem(item);
      setShowDiscountModal(true);
      setShowFrequentlyAdded(true);
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

      // Determine content based on package items or fallback
      let baseContentItems = [];

      if (!isExtraOnly) {
        if (pkg.items && pkg.items.length > 0) {
          // Use package items (description points) if available to match product description
          baseContentItems = pkg.items.map(item => ({
            details: item.name ? (item.description ? `${item.name}: ${item.description}` : item.name) : (item.description || item.title || item.details || "Service"),
            price: 0
          }));
        } else {
          // Fallback to baseServices (hardcoded) if no items defined
          baseContentItems = (pkg.baseServices || baseServices).map(s => ({
            details: s.content && s.content !== s.title ? `${s.title} (${s.content})` : s.title,
            price: s.price || 0,
          }));
        }
      }

      const content = [
        ...baseContentItems,
        ...selectedServices.map(s => ({
          details: s.content && s.content !== s.title ? `${s.title} (${s.content})` : s.title,
          price: s.price || 0,
        }))
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

      // USE REDUX TO UPDATE CART
      if (existing) {
        // Update item count in Redux
        updateItem(productId, existing.count + 1);

        // Also update in database
        if (shouldCallApi()) {
          await fetch(`${API_URL}/api/carts/${existing._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      } else {
        // Add new item to Redux
        addItem(payload);

        // Also add to database
        if (shouldCallApi()) {
          await fetch(`${API_URL}/api/addcarts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      }


      setShowFrequentlyAdded(true);
    } catch (error) { console.error(error); }
  };

  const handleIncrease = async (cartItem) => {
    try {
      // Check if this specific item has reached 3 counts
      if ((cartItem.count || 1) >= 3) {
        alert(`You can't add more than 3 of "${cartItem.title || cartItem.serviceName}"`);
        return;
      }

      // Update in Redux
      updateItem(cartItem._id || cartItem.productId, (cartItem.count || 1) + 1);

      // Update database
      if (shouldCallApi()) {
        await fetch(`${API_URL}/api/carts/${cartItem._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ count: (cartItem.count || 1) + 1 })
        });
      }
    } catch (err) { console.error(err); }

  };

  const handleDecrease = async (cartItem) => {
    try {
      if ((cartItem.count || 1) <= 1) {
        // Remove from Redux
        removeItem(cartItem._id || cartItem.productId);

        // Remove from database
        if (shouldCallApi()) {
          await fetch(`${API_URL}/api/carts/${cartItem._id}`, { method: "DELETE" });
        }
      } else {
        // Update in Redux
        updateItem(cartItem._id || cartItem.productId, cartItem.count - 1);

        // Update database
        if (shouldCallApi()) {
          await fetch(`${API_URL}/api/carts/${cartItem._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ count: cartItem.count - 1 })
          });
        }
      }
    } catch (err) { console.error(err); }

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
    <div className="mt-4 pb-5">
      <Row>
        <Col xs={12} md={8} style={{ border: "1px solid rgba(192,192,195,1)", padding: "15px" }} className='suppad'>
          {pageTitle && <h4 className="fw-semibold mt-4">{pageTitle}</h4>}

          {groupedPackages.length === 0 ? (
            <div className="text-center py-5"><p>No packages available</p></div>
          ) : (
            groupedPackages.map((group, groupIndex) => (
              <div key={groupIndex} className="subcategory-group" id={`section-${normalizeKey(group.title)}`}>

                {groupedPackages.length > 1 && (
                  <h5 className="fw-bold mb-3 mt-4 text-dark pb-2">
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
                  const isSuperSaver = [group.title, displayTitle, pkg.subcategory].some(t => t && t.toLowerCase().includes("super saver"));

                  const hasImage = pkg.img && pkg.img.trim() !== "";

                  // Check if this is one of the categories that should show a thumbnail image
                  const targetCategories = ["cleanup", "pedicure", "manicure", "hair bleach", "bleach"];
                  const checkText = (displayTitle + " " + (group.title || "")).toLowerCase();
                  const showThumbnailVariant = hasImage && targetCategories.some(t => checkText.includes(t));

                  const shouldShowDiscountBanner = !hasImage && isSuperSaver;

                  return (
                    <div key={pkg._id} className=' position-relative package-item' style={{ marginBottom: "40px" }}>

                      {/* --- BANNER IMAGE SECTION - Only show if has image AND not showing thumbnail variant --- */}
                      {hasImage && !showThumbnailVariant && (
                        <div
                          className="mb-3 position-relative shadow-sm"
                          onClick={() => {
                            if (isCustomPackage(pkg)) {
                              handleShowModal(pkg);
                            }
                          }}
                          style={{
                            cursor: isCustomPackage(pkg) ? "pointer" : "default",
                            borderRadius: "16px",
                            overflow: "hidden",
                            height: "150px",
                            marginTop: "10px",
                            width: "100%"
                          }}
                        >
                          <img
                            src={pkg.img.startsWith("http") ? pkg.img : getAssetPath(pkg.img)}
                            alt={pkg.name || "Service"}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              objectPosition: "center"
                            }}
                            onError={(e) => {
                              console.error("Failed to load image in Salon1:", pkg.img);
                              e.target.onerror = null;
                              e.target.src = getAssetPath("/assets/placeholder.png");
                            }}
                          />
                        </div>
                      )}

                      {/* --- DETAILS SECTION --- */}
                      <Row className="align-items-center mt-3">
                        <Col xs={8}>
                          <p style={{ color: "#095819ff", marginBottom: "5px" }}>
                            <MdBackpack /> <span className='fw-bold' style={{ fontSize: "13px" }}>PACKAGE</span>
                          </p>
                          <h6 className="fw-semibold" style={{ cursor: isCustomPackage(pkg) ? "pointer" : "default", fontSize: "16px" }} onClick={() => {
                            if (isCustomPackage(pkg)) {
                              handleShowModal(pkg);
                            }
                          }}>
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
                        <Col xs={4} className='position-relative' style={{ minHeight: "100px", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                          <div className="d-flex flex-column h-100 w-100 align-items-end">

                            {shouldShowDiscountBanner || showThumbnailVariant ? (
                              /* --- SUPER SAVER DISCOUNT BOX OR THUMBNAIL IMAGE LAYOUT --- */
                              <div
                                onClick={() => {
                                  if (showThumbnailVariant && isCustomPackage(pkg)) {
                                    handleShowModal(pkg);
                                  } else if (shouldShowDiscountBanner) {
                                    handleShowCarouselModal(pkg);
                                  }
                                }}
                                className="shadow-sm mt-auto"
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  position: "relative",
                                  width: "110px",
                                  height: "110px",
                                  marginBottom: "10px",
                                  overflow: "visible",
                                  backgroundColor: showThumbnailVariant ? "white" : "#f5f5f5",
                                  borderRadius: "8px",
                                  border: showThumbnailVariant ? "none" : "1px solid #ededed"
                                }}
                              >

                                {showThumbnailVariant ? (
                                  <img
                                    src={pkg.img.startsWith("http") ? pkg.img : getAssetPath(pkg.img)}
                                    alt={serviceName}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      borderRadius: "8px"
                                    }}
                                    onError={(e) => {
                                      console.warn("Failed to load thumbnail in Salon1:", pkg.img);
                                      e.target.onerror = null;
                                      e.target.src = getAssetPath("/assets/Uc.png");
                                    }}

                                  />
                                ) : (
                                  <div className="text-center">
                                    <h2 className="fw-bold m-0" style={{ color: "#0d5924", fontSize: "26px", lineHeight: "0.9" }}>25%</h2>
                                    <h6 className="fw-bold m-0" style={{ color: "#0d5924", fontSize: "14px", marginTop: "2px" }}>OFF</h6>
                                  </div>
                                )}

                                {!inCart ? (
                                  <Button
                                    ref={(el) => (addButtonRefs.current[pkg._id] = el)}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToCart({
                                        ...pkg,
                                        name: pkg.name,
                                        displayTitle: displayTitle,
                                        serviceName: serviceName,
                                        productId: pkg._id
                                      }, []);
                                    }}
                                    className="shadow-sm"
                                    style={{
                                      position: "absolute",
                                      bottom: "-12px", // Pop out
                                      left: "50%",
                                      transform: "translateX(-50%)",
                                      width: "70px", // Smaller width
                                      color: "rgb(110, 66, 229)",
                                      backgroundColor: "white",
                                      border: "1px solid rgb(110, 66, 229)",
                                      padding: "4px 0",
                                      fontWeight: "700",
                                      fontSize: "13px",
                                      borderRadius: "6px",
                                      height: "30px",
                                      lineHeight: "1",
                                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                                    }}
                                  >
                                    Add
                                  </Button>
                                ) : (
                                  <div
                                    className="d-flex align-items-center justify-content-between shadow-sm"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      position: "absolute",
                                      bottom: "-12px",
                                      left: "50%",
                                      transform: "translateX(-50%)",
                                      width: "70px",
                                      backgroundColor: "white",
                                      border: "1px solid rgb(110, 66, 229)",
                                      borderRadius: "6px",
                                      height: "30px",
                                      zIndex: 2,
                                      padding: "0 2px"
                                    }}>

                                    <Button
                                      onClick={() => handleDecrease(inCart)}
                                      className='button border-0 p-0 text-dark d-flex align-items-center justify-content-center bg-transparent'
                                      style={{ width: "20px", height: "100%", fontSize: "18px", fontWeight: "bold" }}
                                    >
                                      −
                                    </Button>
                                    <span className="fw-bold" style={{ fontSize: "13px", color: "rgb(110, 66, 229)" }}>{inCart.count || 1}</span>
                                    <Button
                                      onClick={() => handleIncrease(inCart)}
                                      className='button border-0 p-0 text-dark d-flex align-items-center justify-content-center bg-transparent'
                                      style={{
                                        width: "20px",
                                        height: "100%",
                                        fontSize: "18px",
                                        fontWeight: "bold",
                                        opacity: (inCart.count || 1) >= 3 ? "0.6" : "1",
                                        cursor: (inCart.count || 1) >= 3 ? "not-allowed" : "pointer"
                                      }}
                                      disabled={(inCart.count || 1) >= 3}
                                    >
                                      +
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* --- STANDARD LAYOUT --- */
                              <div className="mt-auto" style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
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
                                    className="shadow-sm"
                                    style={{
                                      color: "rgb(110, 66, 229)",
                                      backgroundColor: "white",
                                      border: "1px solid rgb(110, 66, 229)",
                                      padding: "0",
                                      fontWeight: "600",
                                      width: "70px",
                                      height: "36px",
                                      borderRadius: "8px",
                                      fontSize: "15px"
                                    }}
                                  >
                                    Add
                                  </Button>
                                ) : (
                                  <div
                                    className="d-flex align-items-center justify-content-between shadow-sm"
                                    style={{
                                      border: "1px solid rgb(110, 66, 229)",
                                      borderRadius: "8px",
                                      backgroundColor: "white",
                                      width: "70px",
                                      height: "36px",
                                      padding: "0 2px"
                                    }}
                                  >
                                    <Button onClick={() => handleDecrease(inCart)} className='button border-0 p-0 text-dark d-flex align-items-center justify-content-center bg-transparent' style={{ width: "24px", height: "100%", fontSize: "18px", fontWeight: "bold" }}>−</Button>
                                    <span className="fw-bold" style={{ fontSize: "14px", color: "rgb(110, 66, 229)" }}>{inCart.count || 1}</span>
                                    <Button onClick={() => handleIncrease(inCart)} className='button border-0 p-0 text-dark d-flex align-items-center justify-content-center bg-transparent' style={{ width: "24px", height: "100%", fontSize: "18px", opacity: totalItems >= 3 ? "0.6" : "1", fontWeight: "bold" }}>+</Button>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        </Col>
                      </Row>

                      {/* --- FOOTER DETAILS --- */}
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
                      {isCustomPackage(pkg) && (
                        <div>
                          <Button
                            className='edit '
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
                      )} <br />
                      <div className='border-bottom'></div>
                    </div>

                  );
                })}
              </div>
            ))
          )}
        </Col>
        <Col xs={12} md={4} className="mt-4 mt-md-0 sticky-cart d-none d-md-block">
          <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(192,192,195,1)" }}></div>
          <br />
          {/* CartBlock gets cart from Redux automatically */}
          <CartBlock
            formatPrice={formatPrice}
            navigate={navigate}
            onEdit={handleShowModal}
          />
        </Col>
      </Row>
      {carts.length > 0 && (
        <div className="mobile-cart-footer-wrapper position-fixed d-flex flex-column d-lg-none" style={{ bottom: 0, left: 0, right: 0, backgroundColor: "white", boxShadow: "0 -2px 10px rgba(0,0,0,0.1)", padding: "10px", zIndex: 999 }}>
          <Button
            className="mobile-cart-footer-button mobile-cart-footer-total w-100 border-0"
            onClick={handleViewCart}
            style={{ backgroundColor: "#6e42e5", color: "white", padding: "12px" }}
          >
            View cart ({carts.length} items) - ₹{calculateTotalPrice()}
          </Button>
        </div>
      )}

      {/* --- MOBILE BOTTOM NAVIGATION (Visible < 576px) --- */}
      <style>
        {`
          @media (max-width: 575.98px) {
            .mobile-cart-footer-wrapper {
              bottom: 60px !important;
            }
          }
        `}
      </style>


      <Salon1modal
        showFrequentlyAdded={showFrequentlyAdded}
        setShowFrequentlyAdded={setShowFrequentlyAdded}
        show={showModal}
        totalItems={totalItems}
        onHide={handleCloseModal}
        selectedItem={selectedItem}
        handleAddToCart={handleAddToCart}
        addButtonRefs={addButtonRefs}
        basePrice={basePrice}
        baseServices={baseServices}
        roundPrice={roundPrice}
        showDiscountModal={showDiscountModal}
        setShowDiscountModal={setShowDiscountModal}
        handleDecrease={handleDecrease}
        handleIncrease={handleIncrease}
        carts={carts}
        updateItem={updateItem}
        removeItem={removeItem}
      />
    </div>
  );
}

export default Salon1;