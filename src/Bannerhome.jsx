import { useEffect, useState } from "react";
import { CiStar } from "react-icons/ci";
import { GoPeople } from "react-icons/go";
import "./Urbancom.css";

function Bannerhome() {
  const [services, setServices] = useState([]);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/services")
      .then((res) => res.json())
      .then((data) => setServices(data));

    fetch("http://localhost:5000/api/banner")
      .then((res) => res.json())
      .then((data) => setBanner(data));
  }, []);

  return (
    <div className="container my-5">
      <div className="row align-items-center">
        {/* Left Side */}
        <div className="col-md-6 home">
          <h4 className="banner" style={{ fontSize: "35px", fontWeight: "bold" }}>
            Home services at your doorstep
          </h4>

          <div className="mt-4 p-3 service-container">
            <h3 className="look" >
              What are you looking for?
            </h3>

            {/* First row → Salon + AC */}
            <div className="d-flex mt-3 services-row flex-wrap">
              {services
                .filter((s) => s.key === "salon" || s.key === "ac")
                .map((service, idx) => (
                  <div
                    key={idx}
                    className="service-box d-flex justify-content-between align-items-center row1 p-2"
                  >
                    <span>{service.name}</span>
                    <img
                      src={`http://localhost:5000${service.img}`}
                      alt={service.name}
                      width="35"
                      height="35"
                    />
                  </div>
                ))}
            </div>

            {/* Second row → Clean + Electric + Water + Plumbing */}
            <div className="d-flex mt-3 services-row flex-wrap">
              {services
                .filter((s) => ["clean", "electric", "water", "plumbing"].includes(s.key))
                .map((service, idx) => (
                  <div
                    key={idx}
                    className="service1 d-flex flex-column align-items-center"
                    style={{ width: "120px", marginBottom: "10px"}}>
                    <div
                      className="d-flex justify-content-center w-100 align-items-center service"
                      >
                      <img
                        src={`http://localhost:5000${service.img}`}
                        alt={service.name}
                        width="40"
                        height="40"/>
                    </div>
                    <span className="mt-2 text-center" style={{ fontSize: "11px" }}>
                      {service.name}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Ratings */}
          <div className="d-flex mt-4 flex-wrap rating">
            <div className="me-4 d-flex align-items-center">
              <CiStar style={{ fontSize: "30px", marginRight: "8px" }} />
              <div>
                <span style={{fontSize: "20px", fontWeight: "bold" }}>4.8</span>
                <br />
                <span style={{ fontSize: "15px", color: "#1616167e" }}>Service Rating</span>
              </div>
            </div>
            <div className="d-flex align-items-center">
              <GoPeople style={{ fontSize: "30px", marginRight: "8px" }} />
              <div>
                <span style={{ fontWeight: "bold", fontSize: "18px" }}>12M+</span>
                <br />
                <span style={{ fontSize: "15px", color: "#1616167e" }}>Customers Globally</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Banner */}
        <div className="col-md-6 banner text-center mt-4 mt-md-0">
          {banner && (
            <img
              src={`http://localhost:5000${banner.img}`}
              alt="banner"
              className="img-fluid rounded shadow"
              style={{ width: "100%", objectFit: "cover" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Bannerhome;
