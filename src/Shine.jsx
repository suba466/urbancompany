import React, { useEffect, useState, useRef } from "react";
import { Carousel, Card, Button, Row, Col } from "react-bootstrap";

function darkenHexColor(hex, amount = 20) {
  let c = hex.slice(0, 7);
  let num = parseInt(c.slice(1), 16);
  let r = Math.max(0, ((num >> 16) & 0xff) - amount);
  let g = Math.max(0, ((num >> 8) & 0xff) - amount);
  let b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}

function Shine() {
  const [carouselItems, setCarouselItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerSlide, setCardsPerSlide] = useState(3);
  const carouselRef = useRef(null);

  // Fetch data and handle responsive cards
  useEffect(() => {
    fetch("http://localhost:5000/api/carousel")
      .then((res) => res.json())
      .then((data) => setCarouselItems(data.carousel))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    const updateCardsPerSlide = () => {
      const width = window.innerWidth;
      if (width <= 425) setCardsPerSlide(1); // mobile
      else if (width <= 991) setCardsPerSlide(2); // tablet
      else setCardsPerSlide(3); // desktop
    };

    updateCardsPerSlide();
    window.addEventListener("resize", updateCardsPerSlide);
    return () => window.removeEventListener("resize", updateCardsPerSlide);
  }, []);

  if (loading) return <p>Loading carousel...</p>;

  // Split items into slides based on cardsPerSlide
  const chunkedItems = [];
  for (let i = 0; i < carouselItems.length; i += cardsPerSlide) {
    chunkedItems.push(carouselItems.slice(i, i + cardsPerSlide));
  }

  const colors = ["#0f8560ff", "#841b0bff", "#91B332", "#000000", "#1472D0", "#f6f6f6ff"];

  const handleSelect = (selectedIndex) => setCurrentIndex(selectedIndex);
  const handlePrev = () => carouselRef.current && carouselRef.current.prev();
  const handleNext = () => carouselRef.current && carouselRef.current.next();

  return (
    <div className="container mt-4 position-relative carousel-container">
      <Carousel
        ref={carouselRef}
        interval={null}
        indicators={false}
        nextIcon={null}
        prevIcon={null}
        activeIndex={currentIndex}
        onSelect={handleSelect}
        touch={true} // swipe enabled for mobile
      >
        {chunkedItems.map((group, groupIndex) => (
          <Carousel.Item key={groupIndex}>
            <Row className="justify-content-center">
              {group.map((item, idx) => {
                const overallIndex = groupIndex * cardsPerSlide + idx;
                const bgColor = colors[overallIndex % colors.length];
                const textColor = overallIndex === carouselItems.length - 1 ? "black" : "white";
                let buttonColor =
                  bgColor === "#841b0bff" || overallIndex === carouselItems.length - 1
                    ? "white"
                    : darkenHexColor(bgColor, 40);

                return (
                  <Col key={idx} md={12 / cardsPerSlide} className="d-flex justify-content-center mb-3">
                    <Card
                      className="shine"
                      style={{ backgroundColor: bgColor, color: textColor, display: "flex", flexDirection: "row" }}
                    >
                      <div style={{ flex: "1 1 50%" }}>
                        <Card.Body className="d-flex flex-column justify-content-center align-items-start p-3">
                          <Card.Title>
                            <h5 className="fw-semibold mb-2" style={{ fontSize: "19px" }}>
                              {item.name}
                            </h5>
                          </Card.Title>
                          <p className="mb-2" style={{ fontSize: "11px" }}>
                            {item.descriptions || " "}
                          </p>
                          <Button
                            style={{
                              backgroundColor: buttonColor,
                              color: buttonColor === "white" ? "black" : "white",
                              border: "none",
                            }}
                            size="sm"
                          >
                            Book now
                          </Button>
                        </Card.Body>
                      </div>
                      <div style={{ flex: "1 1 50%" }}>
                        <Card.Img
                          src={`http://localhost:5000${item.img}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Carousel.Item>
        ))}
      </Carousel>

      {/* Conditional arrows */}
      {currentIndex > 0 && (
        <div className="carousel-arrow left" onClick={handlePrev}>
          &#10094;
        </div>
      )}
      {currentIndex < chunkedItems.length - 1 && (
        <div className="carousel-arrow right" onClick={handleNext}>
          &#10095;
        </div>
      )}
    </div>
  );
}

export default Shine;
