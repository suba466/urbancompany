import { useEffect, useState } from "react";
import { Carousel, Card, Button, Row, Col } from "react-bootstrap";

function Shine() {
  const [carouselItems, setCarouselItems] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/carousel")
      .then((res) => res.json())
      .then((data) => setCarouselItems(data))
      .catch((err) => console.error("Error fetching carousel:", err));
  }, []);

  // Group images into slides of 3
  const chunkedItems = [];
  for (let i = 0; i < carouselItems.length; i += 3) {
    chunkedItems.push(carouselItems.slice(i, i + 3));
  }

  // Specific colors as per your requirement
  const colors = [
    "#006400", // Green
    "#8B4513", // Brown
    "#90EE90", // Leaf light green
    "#000000", // Black
    "#87CEEB", // Skyblue
    "#D3D3D3"  // Lightgray
  ];

  // Function to determine text color for contrast
  const getTextColor = (bgColor) => {
    // Light colors get dark text, dark colors get white text
    const darkColors = ["#006400", "#8B4513", "#000000"];
    return darkColors.includes(bgColor) ? "white" : "black";
  };

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
                        variant="right"
                        src={`http://localhost:5000${item.img}`}
                        style={{
                          width: "50%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "0 15px 15px 0"
                        }}
                      />
                      <Card.Body className="d-flex flex-column justify-content-center">
                        <Card.Title className="fw-bold text-capitalize">
                          {item.name}
                        </Card.Title>
                        <Button variant={buttonVariant} size="sm">
                          Book now
                        </Button>
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
