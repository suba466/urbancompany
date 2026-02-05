import { Row, Col, Carousel } from "react-bootstrap";
import { MdStars } from "react-icons/md";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Salon1 from './Salon1.jsx';
import { Alert } from "react-bootstrap";
import API_URL, { getAssetPath } from "./config";

function Salon() {
  const [salon, setSalon] = useState([]);
  const [advanced, setAdvanced] = useState([]);
  const [salonSubcategories, setSalonSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSubcategories, setHasSubcategories] = useState(false);
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchSalonSubcategories = async () => {
      try {
        setLoading(true);
        console.log("Fetching ALL active subcategories from public API...");

        // Clear previous data
        setSalonSubcategories([]);
        setHasSubcategories(false);

        // 1. Get ALL active subcategories from PUBLIC API
        const response = await fetch(`${API_URL}/api/subcategories`);

        if (!response.ok) {
          console.error("Failed to fetch subcategories");
          setHasSubcategories(false);
          return;
        }

        const data = await response.json();
        console.log("All subcategories from public API:", data);

        if (data.success && data.subcategories && Array.isArray(data.subcategories)) {

          // 2. Filter for "Salon for women" subcategories
          // Find subcategories where categoryName contains "salon"
          const salonSubcategories = data.subcategories.filter(sub => {
            // Check if subcategory belongs to salon category
            const hasSalonCategory =
              sub.categoryName?.toLowerCase().includes('salon') ||
              (sub.categoryId && sub.categoryId.name?.toLowerCase().includes('salon'));

            // Also check if subcategory name contains "salon" as backup
            const hasSalonName = sub.name?.toLowerCase().includes('salon');

            // IMPORTANT: Only show ACTIVE subcategories
            const isActive = sub.isActive === true || sub.isActive === undefined;

            return (hasSalonCategory || hasSalonName) && isActive;
          });

          console.log("Filtered salon subcategories:", salonSubcategories);

          if (salonSubcategories.length > 0) {
            // Limit to 6 items for display
            setSalonSubcategories(salonSubcategories.slice(0, 6));
            setHasSubcategories(true);
          } else {
            console.log("No active salon subcategories found");
            setHasSubcategories(false);
          }
        } else {
          console.log("No subcategories data received");
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
        const publicSubcatsResponse = await fetch(`${API_URL}/api/subcategories`);

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
        const response = await fetch(`${API_URL}/api/salonforwomen`);
        if (!response.ok) throw new Error('Failed to fetch salon for women');
        const data = await response.json();
        setSalon(data.salonforwomen || []);
      } catch (error) {
        console.error("Error fetching salon: ", error);
        try {
          const staticResponse = await fetch(`${API_URL}/api/static-data`);
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
        const response = await fetch(`${API_URL}/api/advanced`);
        if (!response.ok) throw new Error('Failed to fetch advanced');
        const data = await response.json();
        setAdvanced(data.advanced || []);
      } catch (error) {
        console.error("Error fetching advanced: ", error);
        try {
          const staticResponse = await fetch(`${API_URL}/api/static-data`);
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
  // Handle subcategory click
  const handleSubcategoryClick = (subcategory) => {
    const normalizeKey = (str) => str?.toLowerCase()?.trim()?.replace(/\s+/g, "-") || "";
    const sectionId = `section-${normalizeKey(subcategory.name)}`;
    const element = document.getElementById(sectionId);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
                        : getAssetPath(a.img)
                      : getAssetPath("/assets/placeholder.png")
                  }
                  alt={a.key || "Advanced service"}
                  className="extra w-100"
                  style={{ height: "400px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = getAssetPath("/assets/placeholder.png");
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", padding: "5px" }}>
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
                        textAlign: "center",
                        transition: "transform 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                      <div
                        className=" d-flex align-items-center justify-content-center shadow-sm"
                        style={{
                          backgroundColor: "white",
                          width: "70px",
                          height: "70px",
                          borderRadius: "12px",
                          overflow: "hidden",
                          margin: "0 auto 8px",
                          border: "1px solid #f0f0f0"
                        }}
                      >
                        <img
                          src={
                            subcategory.img && typeof subcategory.img === "string"
                              ? subcategory.img.startsWith("http")
                                ? subcategory.img
                                : getAssetPath(subcategory.img)
                              : getAssetPath("/assets/placeholder.png")
                          }
                          alt={subcategory.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                          onError={(e) => {
                            e.target.src = getAssetPath("/assets/placeholder.png");
                          }}
                        />
                      </div>
                      <p style={{ fontSize: "12px", lineHeight: "1.3", margin: 0, fontWeight: "500" }}>
                        {subcategory.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              ""
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