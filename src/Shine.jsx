import React, { useEffect, useState } from "react";
import { Carousel, Card, Button, Row, Col } from "react-bootstrap";

function Shine() {
  const [carouselItems, setCarouselItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("http://localhost:5000/api/carousel")
      .then(res => res.json())
      .then(data => setCarouselItems(data.carousel))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading carousel...</p>;

  // Group images into slides of 3
  const chunkedItems = [];
  for (let i = 0; i < carouselItems.length; i += 3) {
    chunkedItems.push(carouselItems.slice(i, i + 3));
  }

  const colors = ["#00640", "#873902ff", "#92c103ff", "#000000", "#1792cfff", "#D3D3D3"];
  const getTextColor = bg => ["#006400", "#8B4513", "#000000"].includes(bg) ? "white" : "black";

  return (
    <div className="container mt-4">
      <Carousel interval={null} indicators={false}>
        {chunkedItems.map((group, groupIndex) => (
          <Carousel.Item key={groupIndex}>
            <Row className="justify-content-center">
              {group.map((item, idx) => {
                const overallIndex = groupIndex * 3 + idx;
                const bgColor = colors[overallIndex % colors.length];
                const textColor = getTextColor(bgColor);
                const buttonVariant = textColor === "white" ? "light" : "dark";

                return (
                  <Col key={idx} md={4} className="d-flex justify-content-center mb-3">
                    <Card
                      className="shine"
                      style={{
                        backgroundColor: bgColor,
                        color: textColor,
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        borderRadius: "15px",
                        overflow: "hidden",
                        height: "180px",
                        width: "100%"
                      }}
                    >
                      <Card.Img
                        variant="left"
                        src={`http://localhost:5000${item.img}`}
                        style={{
                          width: "50%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "0 15px 15px 0"
                        }}
                      />
                      <Card.Body className="d-flex flex-column justify-content-center">
                        <Card.Title className="fw-bold text-capitalize">{item.key}</Card.Title>
                        <Button variant={buttonVariant} size="sm">Book now</Button>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
}

export default Shine;
