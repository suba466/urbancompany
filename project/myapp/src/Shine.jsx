import { useEffect, useState, useRef } from "react";
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

  // Fetch carousel data from server
  useEffect(() => {
    const fetchCarouselData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/carousel");
        if (!response.ok) {
          throw new Error('Failed to fetch carousel data');
        }
        const data = await response.json();
        setCarouselItems(data.carousel || []);
      } catch (error) {
        console.error("Error fetching carousel:", error);
        // Fallback: Try static data API
        try {
          const staticResponse = await fetch("http://localhost:5000/api/static-data");
          const staticData = await staticResponse.json();
          setCarouselItems(staticData.carousel || []);
        } catch (staticError) {
          console.error("Error fetching static data:", staticError);
          setCarouselItems([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselData();

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

  if (!carouselItems || carouselItems.length === 0) {
    return <p>No carousel items found.</p>;
  }

  const chunkedItems = [];
  for (let i = 0; i < carouselItems.length; i += cardsPerSlide) {
    chunkedItems.push(carouselItems.slice(i, i + cardsPerSlide));
  }

  const colors = ["#0f8560ff", "#841b0bff", "#91B332", "#000000", "#1472D0", "#f6f6f6ff"];
  const handleSelect = (selectedIndex) => setCurrentIndex(selectedIndex);
  const handlePrev = () => carouselRef.current && carouselRef.current.prev();
  const handleNext = () => carouselRef.current && carouselRef.current.next();

  return (
    <div className="container mt-4 position-relative d-flex w-100" style={{overflow:"hidden"}}>
      <Carousel 
        ref={carouselRef} 
        interval={null}
        indicators={false} 
        nextIcon={null}
        prevIcon={null}
        activeIndex={currentIndex}
        onSelect={handleSelect}
        touch={true} 
      >
        {chunkedItems.map((group, groupIndex) => (
          <Carousel.Item key={groupIndex}>
            <Row className="justify-content-center">
              {group.map((item, idx) => {
                const overallIndex = groupIndex * cardsPerSlide + idx;
                const bgColor = colors[overallIndex % colors.length];
                const textColor = overallIndex === carouselItems.length - 1 ? "black" : "white";
                const buttonColor =
                  bgColor === "#841b0bff" || overallIndex === carouselItems.length - 1
                    ? "white"
                    : darkenHexColor(bgColor, 40);

                return (
                  <Col 
                    key={idx} 
                    md={12 / cardsPerSlide} 
                    className="d-flex justify-content-center mb-3" 
                    style={{
                      flex: `0 0 ${100 / cardsPerSlide}%`, 
                      maxWidth: `${100 / cardsPerSlide}%`
                    }}
                  >
                    <Card
                      className="shine d-flex flex-row w-100 align-items-stretch"
                      style={{ 
                        backgroundColor: bgColor, 
                        color: textColor, 
                        height: "200px" 
                      }}
                    >
                      {/* Text section */}
                      <div className="d-flex flex-column" style={{ flex: "1 1 50%"}}>
                        <Card.Body className="d-flex flex-column p-3" style={{ flex: 1 }}>
                          <Card.Title>
                            <h5 
                              className="fw-semibold mb-2" 
                              style={{ 
                                fontSize: overallIndex === 0 ? "25px" : "20px",
                                color: textColor 
                              }}
                            >
                              {item.name}
                            </h5>
                          </Card.Title>
                          <p 
                            className="mb-2" 
                            style={{ 
                              fontSize: "11px",
                              color: textColor 
                            }}
                          >
                            {item.descriptions || " "}
                          </p>
                          <Button 
                            className="w-100 mt-auto border-0" 
                            style={{
                              backgroundColor: buttonColor,
                              color: buttonColor === "white" ? "black" : "white",
                              fontSize: "12px"
                            }}
                            size="sm"
                          >
                            {item.name.toLowerCase().includes("water") ? "Buy Now" : "Book Now"}
                          </Button>
                        </Card.Body>
                      </div>

                      {/* Image section */}
                      <div style={{ flex: "1 1 50%" }}>
                        <Card.Img 
                          className="w-100 h-100" 
                          src={`http://localhost:5000${item.img}`}
                          alt={item.name}
                          style={{ objectFit: "cover" }}
                          onError={(e) => {
                            // Fallback if image fails to load
                            console.error(`Failed to load image: ${item.img}`);
                            e.target.src = "/assets/placeholder.png"; // Add a placeholder image
                          }}
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
        <div 
          className="carousel-arrow left" 
          onClick={handlePrev}
         
        >
          &#10094;
        </div>
      )}
      {currentIndex < chunkedItems.length - 1 && (
        <div 
          className="carousel-arrow right" 
          onClick={handleNext}
         
        >
          &#10095;
        </div>
      )}
    </div>
  );
}

export default Shine;