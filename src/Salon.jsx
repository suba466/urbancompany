import { Row, Col, Carousel } from "react-bootstrap";
import { MdStars } from "react-icons/md";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Salon1 from './Salon1.jsx';
import { Alert } from "react-bootstrap";

function Salon() {
  const [salon, setSalon] = useState([]);
  const [advanced, setAdvanced] = useState([]);
  const [salonSubcategories, setSalonSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSubcategories, setHasSubcategories] = useState(false);
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch subcategories for "Salon for women" category
  useEffect(() => {
    const fetchSalonSubcategories = async () => {
      try {
        setLoading(true);
        console.log("Fetching subcategories for 'Salon for women' category...");
        
        // Clear previous data
        setSalonSubcategories([]);
        setHasSubcategories(false);
        
        // Try to get subcategories specifically for Salon for women category
        const categoriesResponse = await fetch("http://localhost:5000/api/categories");
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const categoriesData = await categoriesResponse.json();
        
        // Find "Salon for women" category
        const salonCategory = categoriesData.categories?.find(cat => 
          cat.name?.toLowerCase().includes('salon for women') || 
          cat.name?.toLowerCase().includes('salon') || 
          cat.key?.toLowerCase().includes('salon')
        );
        
        if (salonCategory) {
          console.log("Found Salon category:", salonCategory);
          
          // Try to fetch subcategories for this category
          try {
            // Method 1: Try the admin API first
            const token = localStorage.getItem('authToken');
            const adminSubcatsResponse = await fetch("http://localhost:5000/api/admin/subcategories", {
              headers: token ? {
                'Authorization': `Bearer ${token}`
              } : {}
            });
            
            if (adminSubcatsResponse.ok) {
              const adminSubcatsData = await adminSubcatsResponse.json();
              console.log("Subcategories from admin API:", adminSubcatsData);
              
              if (adminSubcatsData.subcategories && adminSubcatsData.subcategories.length > 0) {
                // Filter subcategories by:
                // 1. Belongs to salon category
                // 2. AND isActive === true
                const filteredSubcategories = adminSubcatsData.subcategories.filter(sub => 
                  (sub.categoryId === salonCategory._id || 
                  (sub.categoryName && sub.categoryName.toLowerCase().includes('salon'))) &&
                  (sub.isActive === true || sub.isActive === undefined) // Only active subcategories
                );
                
                console.log("Active salon subcategories:", filteredSubcategories);
                
                if (filteredSubcategories.length > 0) {
                  setSalonSubcategories(filteredSubcategories.slice(0, 6));
                  setHasSubcategories(true);
                } else {
                  // No ACTIVE subcategories found for salon
                  console.log("No active subcategories found for Salon category");
                  setHasSubcategories(false);
                }
              } else {
                console.log("No subcategories in admin API");
                setHasSubcategories(false);
              }
            } else {
              console.log("Admin API failed or no access");
              setHasSubcategories(false);
            }
          } catch (error) {
            console.error("Error from admin API:", error);
            setHasSubcategories(false);
          }
        } else {
          console.log("Salon category not found in database");
          setHasSubcategories(false);
        }
        
      } catch (error) {
        console.error("Error fetching salon subcategories: ", error);
        setHasSubcategories(false);
      } finally {
        setLoading(false);
      }
    };

    fetchSalonSubcategories();
  }, []);

  // Alternative: Fetch from public API (if admin API requires auth and you want non-auth access)
  useEffect(() => {
    const fetchFromPublicAPI = async () => {
      try {
        const publicSubcatsResponse = await fetch("http://localhost:5000/api/subcategories");
        
        if (publicSubcatsResponse.ok) {
          const publicSubcatsData = await publicSubcatsResponse.json();
          console.log("Subcategories from public API:", publicSubcatsData);
          
          if (publicSubcatsData.subcategories && publicSubcatsData.subcategories.length > 0) {
            // Filter for salon-related AND active subcategories
            const salonActiveSubcategories = publicSubcatsData.subcategories.filter(sub => 
              (sub.categoryName?.toLowerCase().includes('salon') ||
               sub.name?.toLowerCase().includes('salon')) &&
              (sub.isActive === true || sub.isActive === undefined)
            );
            
            console.log("Active salon subcategories from public API:", salonActiveSubcategories);
            
            if (salonActiveSubcategories.length > 0) {
              setSalonSubcategories(salonActiveSubcategories.slice(0, 6));
              setHasSubcategories(true);
            }
          }
        }
      } catch (error) {
        console.error("Error from public API:", error);
      }
    };
    
    // Uncomment if you want to try public API as fallback
    // fetchFromPublicAPI();
  }, []);

  // Fetch salon for women data (existing)
  useEffect(() => {
    const fetchSalonForWomen = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/salonforwomen");
        if (!response.ok) throw new Error('Failed to fetch salon for women');
        const data = await response.json();
        setSalon(data.salonforwomen || []);
      } catch (error) {
        console.error("Error fetching salon: ", error);
        try {
          const staticResponse = await fetch("http://localhost:5000/api/static-data");
          const staticData = await staticResponse.json();
          setSalon(staticData.salonforwomen || []);
        } catch (staticError) {
          console.error("Error fetching static data:", staticError);
        }
      }
    };
    fetchSalonForWomen();
  }, []);

  // Fetch advanced data (existing)
  useEffect(() => {
    const fetchAdvanced = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/advanced");
        if (!response.ok) throw new Error('Failed to fetch advanced');
        const data = await response.json();
        setAdvanced(data.advanced || []);
      } catch (error) {
        console.error("Error fetching advanced: ", error);
        try {
          const staticResponse = await fetch("http://localhost:5000/api/static-data");
          const staticData = await staticResponse.json();
          setAdvanced(staticData.advanced || []);
        } catch (staticError) {
          console.error("Error fetching static data:", staticError);
        }
      }
    };
    fetchAdvanced();
  }, []);

  const handleSelect = (selectedIndex) => {
    setActiveIndex(selectedIndex);
  };

  // Handle subcategory click
  const handleSubcategoryClick = (subcategory) => {
    console.log("Subcategory clicked:", subcategory);
    navigate(`/packages?subcategory=${subcategory.key}&category=salon&subcategoryId=${subcategory._id}`);
  };

  return (
    <div className="p-2 p-md-4 p-lg-5">
      <Row className="g-4">
        {/* Carousel section */}
        <Col xs={12} lg={8} className="order-1 order-lg-2">
          <Carousel 
            activeIndex={activeIndex} 
            onSelect={handleSelect}
            controls={true} 
            indicators={true} 
            wrap={false}
          >
            {advanced?.map((a, index) => (
              <Carousel.Item key={index}>
                <img
                  src={
                    a.img && typeof a.img === "string"
                      ? a.img.startsWith("http")
                        ? a.img
                        : `http://localhost:5000${a.img}`
                      : "http://localhost:5000/assets/placeholder.png"
                  }
                  alt={a.key || "Advanced service"}
                  className="extra w-100"
                  style={{ height: "400px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = "http://localhost:5000/assets/placeholder.png";
                  }}
                />
                <Carousel.Caption 
                  className="position-absolute d-flex align-items-center text-start justify-content-start"
                  style={{
                    inset: 0,
                    color: "#424141",
                    padding: "40px",
                    borderRadius: "10px",
                  }}
                >
                  <div>
                    {a.pri && (
                      <h3>
                        <span
                          className="fw-semibold"
                          style={{
                            backgroundColor: "#424141",
                            color: "#fff",
                            padding: "15px 15px",
                            fontSize: "18px",
                            borderRadius: "4px",
                          }}
                        >
                          {a.pri}
                        </span>
                      </h3>
                    )}
                    <br />
                    <p>
                      <span style={{ fontSize: "50px", color: "#0a8c17ff" }}>
                        {a.price}
                      </span>{" "}
                      <span className="text-decoration-line-through" style={{ fontSize: "30px" }}>
                        {a.value}
                      </span>
                    </p>
                    <h3 className="fw-semibold">{a.title || ""}</h3>
                    <h3 className="fw-semibold">{a.tit}</h3>
                    <p style={{ fontSize: "20px" }}>{a.text || " "}</p>
                  </div>
                </Carousel.Caption>
              </Carousel.Item>
            ))}
          </Carousel>
          <div className="d-none d-lg-block mt-4">
            <Salon1 />
          </div>
        </Col>

        {/* Salon subcategories section */}
        <Col xs={12} lg={4} className="row1 order-2 order-lg-1">
          <h4 className="fw-semibold" style={{ fontSize: "30px" }}>Salon for women</h4>
          <p>
            <MdStars style={{ fontSize: "23px", color: "#6800faff" }} />{" "}
            <span
              style={{
                textDecoration: "underline dashed",
                fontSize: "18px",
                textUnderlineOffset: "7px",
              }}
            >
              4.85 (15.4 bookings)
            </span>
          </p>

          <div className="mt-4 super position-sticky">
            <div className="d-flex align-items-center left" style={{ marginBottom: "15px" }}>
                <span className="fw-semibold" style={{ fontSize: "14px", color: "rgba(116,116,117,1)" }}>
                 Select a service
                </span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(227,227,227,1)" }}></div>
              </div>
            {!loading && (!hasSubcategories || salonSubcategories.length === 0) && (
            <div >
              <Alert variant="info" className="text-center">
                No services available. Please check back later.
              </Alert>
            </div>
          )}

            {/* Show loading only if actively fetching */}
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status" style={{ width: "1rem", height: "1rem" }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2" style={{ fontSize: "12px" }}>Checking services...</p>
              </div>
            ) : hasSubcategories && salonSubcategories.length > 0 ? (
              <div className="d-flex flex-wrap left">
                {salonSubcategories.map((subcategory, index) => {
                  if (subcategory.isActive === false) {
                    return null; 
                  }
                  
                  return (
                    <div
                      key={subcategory._id || index}
                      className="second-row-item"
                      onClick={() => handleSubcategoryClick(subcategory)}
                      style={{ 
                        cursor: "pointer",
                        transition: "transform 0.2s",
                        padding: "10px",
                        borderRadius: "8px",
                        flex: "0 0 calc(33.333% - 10px)",
                        margin: "0 5px 10px 5px",
                        textAlign: "center"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                      <div 
                        className="img-box d-flex align-items-center justify-content-center" 
                        style={{ 
                          backgroundColor: "white",
                          width: "60px",
                          height: "60px",
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0",
                          overflow: "hidden",
                          margin: "0 auto 5px"
                        }}
                      >
                        <img
                          src={
                            subcategory.img && typeof subcategory.img === "string"
                              ? subcategory.img.startsWith("http")
                                ? subcategory.img
                                : `http://localhost:5000${subcategory.img}`
                              : "http://localhost:5000/assets/placeholder.png"
                          }
                          alt={subcategory.name}
                          className="object-fit-cover"
                          style={{ 
                            width: "100%", 
                            height: "100%",
                            objectFit: "cover"
                          }}
                          onError={(e) => {
                            e.target.src = "http://localhost:5000/assets/placeholder.png";
                          }}
                        />
                      </div>
                      <p style={{
                        fontSize: "12px", 
                        fontWeight: "500",
                        margin: "0",
                        color: "#333",
                        lineHeight: "1.2"
                      }}>
                        {subcategory.name}
                      </p>
                      {/* Optional: Show active/inactive badge for debugging */}
                      {process.env.NODE_ENV === 'development' && (
                        <span 
                          style={{ 
                            fontSize: "8px", 
                            color: subcategory.isActive === false ? "red" : "green",
                            display: "block",
                            marginTop: "2px"
                          }}
                        >
                          {subcategory.isActive === false ? "Inactive" : "Active"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              // If no active subcategories, show nothing (completely empty box)
              <div style={{ minHeight: "50px" }}>
                {/* Completely empty - no message, no button, nothing */}
              </div>
            )}
          </div>
        </Col>

        <Col xs={12} className="d-lg-none order-3 mt-4">
          <Salon1 />
        </Col>
      </Row>
    </div>
  );
}

export default Salon;