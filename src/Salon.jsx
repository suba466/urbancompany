import { Row, Col ,Carousel} from "react-bootstrap";
import { MdStars } from "react-icons/md";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Salon() {
  const [salon, setSalon] = useState([]);
  const [advanced,setAdvanced]=useState([]);
 const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/salonforwomen")
      .then((res) => res.json())
      .then((data) => setSalon(data.salonforwomen))
      .catch((err) => console.error("Error fetching salon: ", err));
  }, []);
  useEffect(() => {
    fetch("http://localhost:5000/api/advanced")
      .then((res) => res.json())
      .then((data) => setAdvanced(data.advanced))
      .catch((err) => console.error("Error fetching salon: ", err));
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <Row className="g-4">
        <Col xs={12} md={4}>
          <h4 className="fw-semibold" style={{ fontSize: "30px" }}>Salon for women</h4>
          <p>
            <MdStars style={{ fontSize: "23px", color: "#6800faff" }} />{" "}
            <span style={{textDecoration: "underline dashed",fontSize: "18px",textUnderlineOffset: "7px",}}>
              4.85 (15.4 bookings)</span></p>
          {/* Bordered box containing text, line, and services */}
          <div
            className="mt-4"style={{border: "1px solid rgba(192, 192, 195, 1)",borderRadius: "5px",padding: "15px",}}>
            {/* Select a service with line on right */}
            <div style={{display: "flex",alignItems: "center",gap: "10px",marginBottom: "15px",}}>
              <span
                style={{fontSize: "14px",fontWeight: 600,color: "rgba(116,116,117,1)",}}>Select a service
              </span>
              <div style={{flex: 1,height: "1px",backgroundColor: "rgba(227,227,227,1)",}}></div>
            </div>
            {/* Salon services inside the border */}
            <div style={{display: "flex",flexWrap: "wrap",gap: "10px",}}>
              {salon?.map((s, index) => (
                <div
                  key={index}
                  className="second-row-item" 
                  onClick={() => navigate("/salon")}>
                  <div
                    className="img-box"
                    style={{backgroundColor:"white" }}>
                    <img
                      src={`http://localhost:5000${s.img}`}
                      alt={s.key}
                      style={{ width: "60px", height: "60px", objectFit: "contain",borderRadius:"8px" }}/>
                  </div>
                  <p style={{ fontSize: "13px", fontWeight: "450", textAlign:"center" }}>{s.name}</p>
                </div>
              ))}
            </div>
          </div>
        </Col>
        <Col xs={12} md={8}>
         <Carousel indicators={true}>
        {advanced?.map((a, index) => (
          <Carousel.Item key={index}>
            <img
              src={`http://localhost:5000${a.img}`}
              alt={a.key}
              className="extra"/>
            {/* Vertically centered caption (no top used) */}
                <Carousel.Caption
                  style={{
                    position: "absolute",
                    inset: 0, // replaces top, right, bottom, left
                    display: "flex",
                    alignItems: "center", // vertically center
                    justifyContent: "flex-start", // keep text left
                    textAlign: "left",
                    color: "#424141",
                    padding: "40px",
                    borderRadius: "10px",
                  }}
                >
                  <div>
                    {/* Price Label */}
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

                    {/* Price + original value */}
                    <p>
                      <span
                        style={{
                          fontSize: "50px",
                          color: "#0a8c17ff",
                        }}
                      >
                        {a.price}
                      </span>{" "}
                      <span
                        style={{
                          fontSize: "30px",
                          textDecoration: "line-through",
                        }}
                      >
                        {a.value}
                      </span>
                    </p>

                    {/* Titles */}
                    <h3 className="fw-semibold">{a.title || ""}</h3>
                    <h3 className="fw-semibold">{a.tit}</h3>

                    {/* Description */}
                    <p style={{ fontSize: "20px" }}>{a.text || " "}</p>
                  </div>
                </Carousel.Caption>
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>
      </Row>
    </div>
  );
}

export default Salon;
