import { Row, Col ,Carousel} from "react-bootstrap";
import { MdStars } from "react-icons/md";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Salon1 from './Salon1.jsx';
function Salon() {
  const [salon, setSalon] = useState([]);
  const [advanced,setAdvanced]=useState([]);
 const navigate = useNavigate();
 const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
    fetch("http://localhost:5000/api/salonforwomen")
      .then((res) => res.json())
      .then((data) => setSalon(data.salonforwomen))
      .catch((err) => console.error("Error fetching salon: ", err));
  }}, []);
  useEffect(() => {
     if (process.env.NODE_ENV === "development") {
    fetch("http://localhost:5000/api/advanced")
      .then((res) => res.json())
      .then((data) => setAdvanced(data.advanced))
      .catch((err) => console.error("Error fetching salon: ", err));
  }}, []);
const handleSelect = (selectedIndex) => {
    setActiveIndex(selectedIndex);
  };

  return (
    <div  className="p-2 p-md-4 p-lg-5">
      <Row className="g-4">
  {/* Carousel first on smaller screens, second on desktop */}
  <Col xs={12} lg={8} className=" order-1 order-lg-2">
    <Carousel activeIndex={activeIndex} onSelect={handleSelect}
      controls={true} indicators={true} wrap={false} >
      {advanced?.map((a, index) => (
        <Carousel.Item key={index}>
          <img
            src={`http://localhost:5000${a.img}`}
            alt={a.key}
            className="extra"/>
          <Carousel.Caption
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              textAlign: "left",
              color: "#424141",
              padding: "40px",
              borderRadius: "10px",
            }}>
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
                    }}>
                    {a.pri}
                  </span>
                </h3>
              )}
              <br />
              <p>
                <span style={{ fontSize: "50px", color: "#0a8c17ff" }}>
                  {a.price}
                </span>{" "}
                <span style={{ fontSize: "30px", textDecoration: "line-through" }}>
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

    <div className="mt-4 super">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "rgba(116,116,117,1)" }}>
          Select a service
        </span>
        <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(227,227,227,1)" }}></div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px",}}>
        {salon?.map((s, index) => (
          <div
            key={index}
            className="second-row-item select"
            onClick={() => navigate("/salon")}>
            <div className="img-box" style={{ backgroundColor: "white" }}>
              <img
                src={`http://localhost:5000${s.img}`}
                alt={s.key}
                style={{ width: "60px", height: "60px", objectFit: "contain", borderRadius: "8px" }}
              />
            </div>
            <p style={{ fontSize: "13px", fontWeight: "450", textAlign: "center" }}>{s.name}</p>
          </div>
        ))}
      </div>
    </div>
  </Col>
   <Col xs={12} className="d-lg-none order-3  mt-4">
    <Salon1 />
  </Col>
</Row>

    </div>
  );
}

export default Salon;
