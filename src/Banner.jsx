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
    console.log("Fetching services from API...");
    const res = await fetch("http://localhost:5000/api/services");
    
    if (!res.ok) {
      console.error("Failed to fetch services:", res.status, res.statusText);
      throw new Error(`HTTP ${res.status}: Failed to fetch services`);
    }
    
    const data = await res.json();
    console.log("API Response:", data);
    
    if (data.services && Array.isArray(data.services)) {
      // Debug: Log each service's isActive status
      data.services.forEach(service => {
        console.log(`Service: ${service.name}, isActive: ${service.isActive}`);
      });
      
      console.log(`Found ${data.services.length} active services`);
      
      // Sort by order if available, otherwise by name
      const sortedServices = data.services.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return a.name?.localeCompare(b.name) || 0;
      });
      
      setServices(sortedServices);
      
      // Show message if no active services
      if (sortedServices.length === 0) {
        setError("No services currently available");
      }
    } else {
      console.warn("No services array in response:", data);
      setServices([]);
      setError("No services available");
    }
  } catch (err) {
    console.error("Error fetching services:", err);
    setError("Failed to load services");
    setServices([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchBanner();
    fetchServices();
  }, []);



  // Handle service click
  const handleServiceClick = (service) => {
    const category = service.category || service.key || service.name || "";
    
    console.log("Service clicked:", {
      name: service.name,
      category: service.category,
      key: service.key,
      routeCategory: category.toLowerCase()
    });
    
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

  // Render service image with fallback
  const renderServiceImage = (service) => {
    const imageUrl = service.img 
      ? `http://localhost:5000${service.img}`
      : 'http://localhost:5000/assets/default-category.png';
    
    return (
      <div >
        <img
          src={imageUrl}
          alt={service.name}
        />
      </div>
    );
  };

  // Dynamic layout based on number of services
  const renderServicesGrid = () => {
    const totalServices = services.length;
    
    if (totalServices === 0) {
      return (
        <Alert variant="info" className="text-center">
          No services available. Add categories in the admin panel.
        </Alert>
      );
    }
    
    // For 1-2 services: show in first row only
    if (totalServices <= 2) {
      return (
        <>
          <div className="first-row d-flex">
            {services.map((s, index) => (
              <div
                key={s._id || index}
                className="services first-row-item d-flex align-items-center justify-content-between"
                onClick={() => handleServiceClick(s)}
                style={{ cursor: "pointer" }}
              >
                <p className="first-row-text text-center">{s.name}</p>
                {renderServiceImage(s)}
              </div>
            ))}
          </div>
          {/* Empty second row */}
          <div className="first-row d-flex" style={{ visibility: 'hidden', height: '0' }}>
            <div className="services second-row-item" style={{ width: '33.33%' }}></div>
            <div className="services second-row-item" style={{ width: '33.33%' }}></div>
            <div className="services second-row-item" style={{ width: '33.33%' }}></div>
          </div>
        </>
      );
    }
    
    // For 3 services: show 2 in first row, 1 in second row
    if (totalServices === 3) {
      const firstRow = services.slice(0, 2);
      const secondRow = services.slice(2, 3);
      
      return (
        <>
          <div className="first-row d-flex">
            {firstRow.map((s, index) => (
              <div
                key={s._id || index}
                className="services first-row-item d-flex align-items-center justify-content-between"
                onClick={() => handleServiceClick(s)}
                style={{ cursor: "pointer" }}
              >
                <p className="first-row-text text-center">{s.name}</p>
                {renderServiceImage(s)}
              </div>
            ))}
          </div>
          <div className="first-row d-flex">
            {secondRow.map((s, index) => (
              <div
                key={s._id || index}
                className="services second-row-item d-flex flex-column align-items-center position-relative"
                onClick={() => handleServiceClick(s)}
                style={{ cursor: "pointer" }}
              >
                <div className="img-box w-100 d-flex justify-content-center align-items-center">
                  {renderServiceImage(s)}
                </div>
                <p className="first-row-text text-center">{s.name}</p>
              </div>
            ))}
            {/* Add empty items to complete the row */}
            <div className="services second-row-item" style={{ width: '33.33%', visibility: 'hidden' }}></div>
            <div className="services second-row-item" style={{ width: '33.33%', visibility: 'hidden' }}></div>
          </div>
        </>
      );
    }
    
    // For 4 services: show 2 in first row, 2 in second row
    if (totalServices === 4) {
      const firstRow = services.slice(0, 2);
      const secondRow = services.slice(2, 4);
      
      return (
        <>
          <div className="first-row d-flex">
            {firstRow.map((s, index) => (
              <div
                key={s._id || index}
                className="services first-row-item d-flex align-items-center justify-content-between"
                onClick={() => handleServiceClick(s)}
                style={{ cursor: "pointer" }}
              >
                <p className="first-row-text text-center">{s.name}</p>
                {renderServiceImage(s)}
              </div>
            ))}
          </div>
          <div className="first-row d-flex">
            {secondRow.map((s, index) => (
              <div
                key={s._id || index}
                className="services second-row-item d-flex flex-column align-items-center position-relative"
                onClick={() => handleServiceClick(s)}
                style={{ cursor: "pointer" }}
              >
                <div className="img-box w-100 d-flex justify-content-center align-items-center">
                  {renderServiceImage(s)}
                </div>
                <p className="first-row-text text-center">{s.name}</p>
              </div>
            ))}
            {/* Add empty item to complete the row */}
            <div className="services second-row-item" style={{ width: '33.33%', visibility: 'hidden' }}></div>
          </div>
        </>
      );
    }
    
    // For 5 services: show 2 in first row, 3 in second row
    if (totalServices === 5) {
      const firstRow = services.slice(0, 2);
      const secondRow = services.slice(2, 5);
      
      return (
        <>
          <div className="first-row d-flex">
            {firstRow.map((s, index) => (
              <div
                key={s._id || index}
                className="services first-row-item d-flex align-items-center justify-content-between"
                onClick={() => handleServiceClick(s)}
                style={{ cursor: "pointer" }}
              >
                <p className="first-row-text text-center">{s.name}</p>
                {renderServiceImage(s)}
              </div>
            ))}
          </div>
          <div className="first-row d-flex">
            {secondRow.map((s, index) => (
              <div
                key={s._id || index}
                className="services second-row-item d-flex flex-column align-items-center position-relative"
                onClick={() => handleServiceClick(s)}
                style={{ cursor: "pointer" }}
              >
                <div className="img-box w-100 d-flex justify-content-center align-items-center">
                  {renderServiceImage(s)}
                </div>
                <p className="first-row-text text-center">{s.name}</p>
              </div>
            ))}
          </div>
        </>
      );
    }
    
    // For 6 or more services: show 2 in first row, 3 in second row, and add more rows if needed
    if (totalServices >= 6) {
      const firstRow = services.slice(0, 2);
      const secondRow = services.slice(2, 5);
      const extraRows = services.slice(5);
      
      return (
        <>
          <div className="first-row d-flex">
            {firstRow.map((s, index) => (
              <div
                key={s._id || index}
                className="services first-row-item d-flex align-items-center justify-content-between"
                onClick={() => handleServiceClick(s)}
                style={{ cursor: "pointer" }}
              >
                <p className="first-row-text text-center">{s.name}</p>
                {renderServiceImage(s)}
              </div>
            ))}
          </div>
          <div className="first-row d-flex">
            {secondRow.map((s, index) => (
              <div
                key={s._id || index}
                className="services second-row-item d-flex flex-column align-items-center position-relative"
                onClick={() => handleServiceClick(s)}
                style={{ cursor: "pointer" }}
              >
                <div className="img-box w-100 d-flex justify-content-center align-items-center">
                  {renderServiceImage(s)}
                </div>
                <p className="first-row-text text-center">{s.name}</p>
              </div>
            ))}
          </div>
          
          {/* Additional rows for extra services */}
          {extraRows.length > 0 && (
            <div className="mt-3">
              <div className="d-flex flex-wrap">
                {extraRows.map((s, index) => (
                  <div
                    key={s._id || index}
                    className="first-row-img "
                    onClick={() => handleServiceClick(s)}
                   
                  >
                    {renderServiceImage(s)}
                    <p className="mb-0" style={{ fontSize: "12px" }}>{s.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      );
    }
  };

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
            
            {/* Dynamic services grid */}
            {renderServicesGrid()}
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