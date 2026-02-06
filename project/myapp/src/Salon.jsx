import { Row, Col, Carousel } from "react-bootstrap";
import { MdStars } from "react-icons/md";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Salon1 from './Salon1.jsx';
import { Alert } from "react-bootstrap";
import API_URL, { getAssetPath } from "./config";
import { fetchData } from "./apiService";

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
      setLoading(true);
      try {
        const data = await fetchData("api/subcategories", "subcategories");

        const hardcoded = [

        ];

        let finalSubcategories = [];

        if (data && data.subcategories) {
          const filtered = data.subcategories.filter(sub => {
            const subName = (sub.name || "").toLowerCase();
            const isActive = sub.isActive !== false;

            // On the Salon page, we want to show everything the user manages in the subcategory form
            // that is active. We only limit to 6 for the sidebar display.
            return isActive;
          });

          if (filtered.length > 0) {
            // Priority to database subcategories. Fill up to 6.
            finalSubcategories = filtered.slice(0, 6);
          }
        }

        // Only if API returned nothing at all, use hardcoded as a safety net
        if (finalSubcategories.length === 0) {
          finalSubcategories = hardcoded;
        }

        setSalonSubcategories(finalSubcategories);
        setHasSubcategories(finalSubcategories.length > 0);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        setHasSubcategories(false);
      } finally {
        setLoading(false);
      }
    };

    fetchSalonSubcategories();
  }, []);

  // Fetch salon for women data
  useEffect(() => {
    const fetchSalonForWomen = async () => {
      const data = await fetchData("api/salonforwomen", "salonforwomen");
      if (data && data.salonforwomen) {
        setSalon(data.salonforwomen);
      }
    };
    fetchSalonForWomen();
  }, []);

  // Fetch advanced data
  useEffect(() => {
    const fetchAdvanced = async () => {
      const data = await fetchData("api/advanced", "advanced");
      if (data && data.advanced) {
        setAdvanced(data.advanced);
      } else {
        setAdvanced([
          {
            price: "₹799",
            value: "₹1,098",
            title: "Roll-on waxing",
            tit: "Full arms, legs & underarms",
            text: "Extra 25% off for new users*",
            key: "facial",
            img: "/assets/facial.jpg"
          }
        ]);
      }
    };
    fetchAdvanced();
  }, []);

  const handleSelect = (selectedIndex) => {
    setActiveIndex(selectedIndex);
  };

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
        <Col xs={12} lg={9} className="order-1 order-lg-2">
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
        <Col xs={12} lg={3} className="row1 order-2 order-lg-1">
          <h4 className="fw-semibold" style={{ fontSize: "24px" }}>Salon for women</h4>
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
                  if (subcategory.isActive === false) return null;

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
                          src={(() => {
                            const name = subcategory.name?.toLowerCase() || "";
                            if (name.includes("super saver") || name.includes("25%")) return getAssetPath("/assets/super.webp");
                            if (name.includes("pedicure") || name.includes("manicure")) return getAssetPath("/assets/foot.webp");
                            if (name.includes("facial")) return getAssetPath("/assets/facial.jpg");
                            if (name.includes("bleach") || name.includes("detan")) return getAssetPath("/assets/hairbleach.webp");
                            if (name.includes("waxing")) return getAssetPath("/assets/waxing.png");
                            if (name.includes("cleanup")) return getAssetPath("/assets/cleanup.png");

                            return subcategory.img && typeof subcategory.img === "string"
                              ? subcategory.img.startsWith("http")
                                ? subcategory.img
                                : getAssetPath(subcategory.img)
                              : getAssetPath("/assets/placeholder.png");
                          })()}
                          alt={subcategory.name || "Service"}
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
            ) : null}
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