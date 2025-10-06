import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useEffect, useState } from "react";
import { CiStar } from "react-icons/ci";
import { GoPeople } from "react-icons/go";
function Banner() {
  const [banner, setBanner] = useState(null);
  const [services, setServices] = useState([]);

  // Fetch banner image
  useEffect(() => {
    fetch("http://localhost:5000/api/banner")
      .then((res) => res.json())
      .then((data) => setBanner(data.banner))
      .catch((err) => console.error("Error fetching banner:", err));
  }, []);

  // Fetch services
  useEffect(() => {
    fetch("http://localhost:5000/api/services")
      .then((res) => res.json())
      .then((data) => setServices(data.services))
      .catch((err) => console.error("Error fetching services:", err));
  }, []);

  // Split into 2 rows: first (2 items), second (3 items)
  const firstRow = services.slice(0, 2);
  const secondRow = services.slice(2, 5);

  return (
    <Container className="contain"style={{ marginTop: "50px" }}>
      <Row>
        <Col md={6}>
          <h3 className="home"style={{ fontWeight: "bold" }}>
            Home services at your <br /> doorstep
          </h3>
          <div className="service-box">
            <p className="service-heading home">What are you looking for?</p>
            {/* First Row */}
            <div className="service-row first-row">
              {firstRow.map((s, index) => (
                <div key={index} className="services first-row-item">
                  <p className="first-row-text">{s.name}</p>
                  <img
                    src={`http://localhost:5000${s.img}`}
                    alt={s.name}
                    className="first-row-img"
                  />
                </div>
              ))}
            </div>

            {/* Second Row */}
            <div className="service-row second-row">
              {secondRow.map((s, index) => (
                <div key={index} className="services second-row-item">
                  <div className="img-box">
                    <img
                      src={`http://localhost:5000${s.img}`}
                      alt={s.name}
                      className="second-row-img"
                    />
                  </div>
                  <p className="second-row-text">{s.name}</p>
                </div>
              ))}
            </div>
          </div>
          <Row className="mt-4 img-fluid">
              <Col xs={6}>
                <Row>
                  <Col xs={3} style={{width:"40px",marginTop:"10px"}}>
                    <CiStar style={{fontSize:"32px"}} />
                  </Col>
                  <Col className="font">
                    <p style={{ color: "rgb(84,84,84)" }}>
                      <span style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          color: "black"}}>4.8</span><br /> Service Rating*</p></Col></Row></Col>
              <Col xs={6}>
                <Row>
                  <Col xs={3} style={{width:"40px",marginTop:"10px"}}>
                    <GoPeople style={{fontSize:"32px"}} />
                  </Col>
                  <Col className="font">
                    <p style={{ color: "rgb(84,84,84)" }}>
                      <span
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
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
          {banner && (
            <img
              src={`http://localhost:5000${banner.img}`}
              alt="Banner"
              className="banner-img"
            />
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Banner;
