import { Row, Col, Carousel } from "react-bootstrap";
import { MdStars } from "react-icons/md";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Salon1 from './Salon1.jsx';

function Salon() {
  const [salon, setSalon] = useState([]);
  const [advanced, setAdvanced] = useState([]);
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch salon for women data
  useEffect(() => {
    const fetchSalonForWomen = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/salonforwomen");
        if (!response.ok) throw new Error('Failed to fetch salon for women');
        const data = await response.json();
        setSalon(data.salonforwomen || []);
      } catch (error) {
        console.error("Error fetching salon: ", error);
        // Fallback to static data
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

  // Fetch advanced data
  useEffect(() => {
    const fetchAdvanced = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/advanced");
        if (!response.ok) throw new Error('Failed to fetch advanced');
        const data = await response.json();
        setAdvanced(data.advanced || []);
      } catch (error) {
        console.error("Error fetching advanced: ", error);
        // Fallback to static data
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

  return (
    <div className="p-2 p-md-4 p-lg-5">
      <Row className="g-4">
        {/* Carousel first on smaller screens, second on desktop */}
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

        {/* Salon for women first on desktop, second on smaller screens */}
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

            <div className="d-flex flex-wrap left">
              {salon?.map((s, index) => (
                <div
                  key={index}
                  className="second-row-item select"
                  onClick={() => navigate("/salon")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="img-box" style={{ backgroundColor: "white" }}>
                    <img
                      src={
                        s.img && typeof s.img === "string"
                          ? s.img.startsWith("http")
                            ? s.img
                            : `http://localhost:5000${s.img}`
                          : "http://localhost:5000/assets/placeholder.png"
                      }
                      alt={s.key || s.name}
                      className="object-fit-contain"
                      style={{ width: "60px", height: "60px", borderRadius: "8px" }}
                      onError={(e) => {
                        e.target.src = "http://localhost:5000/assets/placeholder.png";
                      }}
                    />
                  </div>
                  <p className="text-center" style={{ fontSize: "13px", fontWeight: "450" }}>
                    {s.name}
                  </p>
                </div>
              ))}
            </div>
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