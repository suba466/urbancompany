import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { MdBackpack } from "react-icons/md";
import { MdStars } from "react-icons/md";
import { GoDotFill } from "react-icons/go";

function Salon1() {
  const [superPack, setSuperPack] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    fetch("http://localhost:5000/api/super")
      .then((res) => res.json())
      .then((data) => setSuperPack(data.super))
      .catch((err) => console.error("Error fetching image:", err));
  }, []);

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleAdd = () => setCount(1);
  const handleIncrease = () => setCount((prev) => prev + 1);
  const handleDecrease = () => setCount((prev) => (prev > 1 ? prev - 1 : 0));

  return (
    <Container className='mt-5'  >
      <Row >
        <Col xs={12} md={7} style={{border: "1px solid rgba(192, 192, 195, 1)",borderRadius: "5px", padding:"15px"}}>
          <h4 className='fw-semibold mt-4'>Super Saver Packages</h4>
          {superPack?.map((sp, index) => (
            <div key={index} className='superpackcard mb-3' onClick={() => handleOpenModal(sp)}>
              <img className='banner-img' src={`http://localhost:5000${sp.img}`} alt={sp.title} />
              <div className='sptext'>
                <p style={{ fontSize: "20px" }}>
                  {sp.title} <br />
                  <span className='fw-bold' style={{ fontSize: "30px" }}>{sp.price}</span>
                </p>
                <p style={{ fontSize: "15px" }}>
                  {sp.text} <br />
                  <span style={{ fontSize: "15px" }}>{sp.tex}</span>
                </p>
                <p style={{ fontSize: "15px" }}>
                  {sp.content} <br />
                  <span style={{ fontSize: "15px" }}>{sp.con}</span>
                </p>
              </div>
            </div>
          ))}
          <Row className="align-items-center mt-3">
            <Col xs={8}>
              <p style={{ color: "#095819ff" }}>
                <MdBackpack />{" "}
                <span style={{ fontSize: "13px", fontWeight: "bold" }}>PACKAGE</span>
              </p>
              <h6 className='fw-semibold'>Festive care package</h6>
              <p style={{ color: "#5a5959ff" }}>
                <MdStars style={{ fontSize: "13px", color: "#6800faff" }} />{" "}
                <span style={{textDecoration: "underline dashed",textUnderlineOffset: "7px",
                  fontSize: "12px"}}>
                  4.85 (15.4 bookings)
                </span>
              </p>
              <p style={{ fontSize: "12px" }}>
                <span className='fw-semibold'>₹2,920</span>{" "}
                <span style={{ textDecoration: "line-through", color: "#5a5959ff" }}>₹3,894</span>{" "}
                <span style={{ color: "#5a5959ff" }}>
                  <GoDotFill />3 hrs 50 mins
                </span>
              </p>
            </Col>
            <Col xs={4} className="d-flex justify-content-end align-items-center">
              {count === 0 ? (
                <Button onClick={handleAdd}
                  style={{backgroundColor: "white",
                    color: "#aa2ce0ff",border: "1px solid #aa2ce0ff",
                    padding: "5px 18px",fontWeight: "500"
                  }}>Add</Button>
              ) : (
                <div className="button1">
                  <Button onClick={handleDecrease} className="button">−</Button>
                  <span className="count-box">{count}</span>
                  <Button onClick={handleIncrease} className="button">+</Button>
                </div>
              )}
            </Col>
          </Row>
          <div style={{borderBottom:"1px dashed #bbb6b6ff"}}></div><br />
          <div style={{fontSize:"12px"}}>
          <p> <GoDotFill /> <span className='fw-semibold'>Waxing: </span> 
                <span>Full arms (including underarms) - Chocolate Roll on, Full legs-Chocolate Roll on</span></p>
          <p> <GoDotFill /> <span className='fw-semibold'>Facial & cleanup: </span> 
                <span>O3 + shine & glow facial</span></p>
          <p> <GoDotFill /> <span className='fw-semibold'>Pedicure: </span> 
                <span>Elysin Candle SPa pedicure</span></p>
          <p> <GoDotFill /> <span className='fw-semibold'>Facial hair removal: </span> 
                <span>Eyebrow, Upper lip - Threading</span></p>
          <Button style={{backgroundColor:"white",color:"#000000",border:"1px solid #000000"}}>Edit your package</Button>
          </div>
          
        </Col>
              <div style={{display: "flex",alignItems: "center",gap: "10px",marginBottom: "15px",}}></div>
        <Col xs={12} md={5}></Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Button onClick={handleCloseModal} className="display closebtn">
          ✕
        </Button>
        <Modal.Body></Modal.Body>
      </Modal>
    </Container>
  );
}

export default Salon1;
