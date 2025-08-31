import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Carousel from 'react-bootstrap/Carousel';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { useState, useRef } from 'react';

import native1 from './assets/native1.webp';
import native2 from './assets/native2.webp';
import native3 from './assets/native3.webp';
import native4 from './assets/native4.webp';
import native5 from './assets/native5.webp';
import native6 from './assets/native6.webp';
import native7 from './assets/native7.webp';
import native8 from './assets/native8.webp';

function Native() {
  const [show, setShow] = useState(false);
  const [index, setIndex] = useState(0); // Carousel index
  const carouselRef = useRef(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handlePrev = () => {
    if (index > 0) carouselRef.current.prev();
  };
  const handleNext = () => carouselRef.current.next();

  return (
    <>
      <Container>
        {/* Main image */}
        <div className='native1' onClick={handleShow}>
          <img src={native1} alt="water purifier" className="native1img w-100" />
        </div>

        {/* Modal */}
        <Modal show={show} onHide={handleClose} centered>
          <Button onClick={handleClose} variant="light" className='close-btn'>✕</Button>
          <Modal.Body>
            <FaArrowLeft onClick={handleClose} /><br /><br />
            <h6 style={{ color: "#5d5f5fff" }}>Native Water Purifiers</h6>
            <h2 style={{ fontWeight: "bold" }}>No service for 2 years</h2>
            <img src={native2} className='native2 w-100' alt="Native Details" />
          </Modal.Body>
        </Modal>

        {/* Carousel */}
        <h2>Best-in-class features</h2>
        <div style={{ position: "relative" }}>
          <FaArrowLeft onClick={handlePrev} className="custom-arrow left" style={{
            position: "absolute", top: "40%", left: 0, zIndex: 10, cursor: "pointer", fontSize: "2rem", color: "#333"
          }} />
          <FaArrowRight onClick={handleNext} className="custom-arrow right" style={{
            position: "absolute", top: "40%", right: 0, zIndex: 10, cursor: "pointer", fontSize: "2rem", color: "#333"
          }} />

          <Carousel ref={carouselRef} activeIndex={index} onSelect={setIndex} controls={false} interval={null} touch={true}>
            <Carousel.Item>
              <Row>
                {[native3, native4, native5].map((img, idx) => (
                  <Col key={idx}>
                    <Card className="native-card" style={{ width: '18rem', margin: "auto" }}>
                      <Card.Img variant="top" src={img} />
                    </Card>
                  </Col>
                ))}
              </Row>
            </Carousel.Item>

            <Carousel.Item>
              <Row>
                {[native6, native7, native8].map((img, idx) => (
                  <Col key={idx}>
                    <Card className="native-card" style={{ width: '18rem', margin: "auto" }}>
                      <Card.Img variant="top" src={img} />
                    </Card>
                  </Col>
                ))}
              </Row>
            </Carousel.Item>
          </Carousel>
        </div>
      </Container>

      
    </>
  );
}

export default Native;
