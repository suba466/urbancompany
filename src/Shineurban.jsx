import { useState, useRef } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import shine from './assets/shine.webp';
import deepclean from './assets/deepclean.webp';
import rowater from './assets/rowater.webp';
import experts from './assets/experts.webp';
import perfect from './assets/perfect.webp';
import relax from './assets/relax.webp';
import intense from './assets/intense.webp';
import img from './assets/2.png';
import socket from './assets/switch.webp';
import wall from './assets/wall.png';

import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { Container } from 'react-bootstrap';

function Shineurban() {
  const [index, setIndex] = useState(0);
  const carouselRef = useRef(null);

  const handlePrev = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  const handleNext = () => {
    if (index < 1) {
      setIndex(index + 1);
    }
  };

  return (
    <Container >
      <div style={{ position: "relative" }}>
        {index > 0 && (
          <FaArrowLeft
            onClick={handlePrev}
            style={{
              position: "absolute", top: "40%",left: 0,zIndex: 10,cursor: "pointer",fontSize: "2rem",color: "#333",backgroundColor: "white",borderRadius: "15px",
            }}
          />
        )}
        {index < 1 && (
          <FaArrowRight
            onClick={handleNext}
            style={{
              position: "absolute",top: "40%",right: 0,zIndex: 10,cursor: "pointer",fontSize: "2rem",color: "#333",backgroundColor: "white",borderRadius: "15px",
            }}
          />
        )}

        <Carousel
          ref={carouselRef}activeIndex={index}onSelect={(selectedIndex) => setIndex(selectedIndex)}controls={false}interval={null}touch={true}
        >
          <Carousel.Item>
            <Row>
              {[shine, deepclean, rowater].map((img, idx) => (
                <Col key={idx}>
                  <Card
                    className="native1img shine"
                    style={{ width: "23rem", margin: "auto" }}
                  >
                    <Card.Img variant="top" src={img} />
                  </Card>
                </Col>
              ))}
            </Row>
          </Carousel.Item>

          <Carousel.Item>
            <Row>
              {[experts, perfect, relax].map((img, idx) => (
                <Col key={idx}>
                  <Card
                    className="native1img shine"
                    style={{ width: "23rem", margin: "auto" }}
                  >
                    <Card.Img variant="top" src={img} />
                  </Card>
                </Col>
              ))}
            </Row>
          </Carousel.Item>
        </Carousel>
      </div>
    </Container>
  );
}

export default Shineurban;
