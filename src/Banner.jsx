import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { CiStar } from "react-icons/ci";
import { TiGroup } from "react-icons/ti";
import { Alert, Spinner } from "react-bootstrap";

function Banner() {
  const [banner, setBanner] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchBanner = async () => {
    try {
      setError(null);
      const res = await fetch("http://localhost:5000/api/banner");
      if (!res.ok) throw new Error("Failed to fetch banner");
      const data = await res.json();
      setBanner(data.banner);
    } catch (err) {
      console.error("Error fetching banner:", err);
      setError("Failed to load banner");
    }
  };

  const fetchServices = async () => {
    try {
      setError(null);
      const res = await fetch("http://localhost:5000/api/services");
      if (!res.ok) throw new Error("Failed to fetch services");
      const data = await res.json();
      
      // Ensure we have services data
      if (data.services && Array.isArray(data.services)) {
        setServices(data.services);
      } else {
        setServices([]);
        setError("No services available");
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Failed to load services");
      setServices([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanner();
    fetchServices();
  }, []);

  // Handle service click - now based on category field from MongoDB
  const handleServiceClick = (service) => {
    // Navigate based on service key or category
    if (service.key) {
      switch(service.key.toLowerCase()) {
        case 'salon':
          navigate("/salon");
          break;
        case 'ac':
          navigate("/ac-repair");
          break;
        case 'clean':
          navigate("/cleaning");
          break;
        case 'electric':
          navigate("/electrician");
          break;
        case 'native':
          navigate("/water-purifier");
          break;
        case 'plumbing':
          navigate("/plumbing");
          break;
        default:
          navigate("/services");
      }
    } else if (service.category) {
      switch(service.category.toLowerCase()) {
        case 'salon':
        case 'beauty':
          navigate("/salon");
          break;
        case 'ac repair':
        case 'appliance':
          navigate("/ac-repair");
          break;
        case 'cleaning':
          navigate("/cleaning");
          break;
        case 'repair':
        case 'electrician':
        case 'plumbing':
          navigate("/electrician");
          break;
        case 'water':
          navigate("/water-purifier");
          break;
        default:
          navigate("/services");
      }
    } else if (service.name.toLowerCase().includes("salon")) {
      navigate("/salon");
    } else {
      navigate("/services");
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  // Sort services by order if available
  const sortedServices = [...services].sort((a, b) => (a.order || 0) - (b.order || 0));
  
  // First row: first 2 services
  const firstRow = sortedServices.slice(0, 2);
  // Second row: next 3 services
  const secondRow = sortedServices.slice(2, 5);

  return (
    <Container className="contain" style={{ marginTop: "50px" }}>
      {error && (
        <Alert variant="warning" className="mb-3">
          {error}
        </Alert>
      )}
      
      <Row>
        <Col md={6}>
          <h3 className="home fw-bold">
            Home services at your <br /> doorstep
          </h3>

          <div className="service-box">
            <p className="service-heading home">What are you looking for?</p>

            {/* First Row */}
            <div className="first-row d-flex">
              {firstRow.map((s, index) => (
                <div
                  key={s._id || s.key || index}
                  className="services first-row-item d-flex align-items-center justify-content-between"
                  onClick={() => handleServiceClick(s)}
                  style={{ cursor: "pointer" }}
                >
                  <p className="first-row-text text-center">{s.name}</p>
                  <img
                    src={`http://localhost:5000${s.img}`}
                    alt={s.name}
                    className="first-row-img"
                    onError={(e) => {
                      e.target.src = 'http://localhost:5000/assets/default.png';
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Second Row */}
            <div className="first-row d-flex">
              {secondRow.map((s, index) => (
                <div
                  key={s._id || s.key || index}
                  className="services second-row-item d-flex flex-column align-items-center position-relative"
                  onClick={() => handleServiceClick(s)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="img-box w-100 d-flex justify-content-center align-items-center">
                    <img
                      src={`http://localhost:5000${s.img}`}
                      alt={s.name}
                      className="first-row-img"
                      onError={(e) => {
                        e.target.src = 'http://localhost:5000/assets/default.png';
                      }}
                    />
                  </div>
                  <p className="first-row-text text-center">{s.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ratings Row */}
          <Row className="mt-4 img-fluid">
            <Col xs={6}>
              <Row>
                <Col xs={3} style={{ width: "40px", marginTop: "10px" }}>
                  <CiStar style={{ fontSize: "32px" }} />
                </Col>
                <Col className="font">
                  <p style={{ color: "rgb(84,84,84)" }}>
                    <span 
                      className="fw-bold"
                      style={{
                        fontSize: "20px",
                        color: "black",
                      }}
                    >
                      4.8
                    </span>
                    <br /> Service Rating*
                  </p>
                </Col>
              </Row>
            </Col>

            <Col xs={6}>
              <Row>
                <Col xs={3} style={{ width: "40px", marginTop: "10px" }}>
                  <TiGroup style={{ fontSize: "32px" }} />
                </Col>
                <Col className="font">
                  <p style={{ color: "rgb(84,84,84)" }}>
                    <span 
                      className="fw-bold"
                      style={{
                        fontSize: "20px",
                        color: "black",
                      }}
                    >
                      12M+
                    </span>
                    <br /> Customers Globally*
                  </p>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>

        {/* Banner Image */}
        <Col md={6} className="text-center">
          {banner ? (
            <img
              src={`http://localhost:5000${banner.img}`}
              alt="Banner"
              className="banner-img w-100"
              onError={(e) => {
                e.target.src = 'http://localhost:5000/assets/default.png';
              }}
            />
          ) : (
            <div className="text-muted">No banner available</div>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Banner;