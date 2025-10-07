import { useEffect, useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { FaStar } from "react-icons/fa";

function Book() {
  const [carouselItems, setCarouselItems] = useState([]);
  const [salonItems, setSalonItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerSlide, setCardsPerSlide] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both book & salon data
        const [bookRes, salonRes] = await Promise.all([
          fetch("http://localhost:5000/api/book"),
          fetch("http://localhost:5000/api/salon"),
        ]);

        if (!bookRes.ok || !salonRes.ok)
          throw new Error("Failed to fetch data");

        const bookData = await bookRes.json();
        const salonData = await salonRes.json();

        setCarouselItems(bookData.book);
        setSalonItems(salonData.salon);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch service data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const updateCardsPerSlide = () => {
      const width = window.innerWidth;
      if (width <= 425) setCardsPerSlide(1);
      else if (width <= 991) setCardsPerSlide(2);
      else setCardsPerSlide(5);
    };

    updateCardsPerSlide();
    window.addEventListener("resize", updateCardsPerSlide);
    return () => window.removeEventListener("resize", updateCardsPerSlide);
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // --- Visible book items ---
  const visibleItems = [];
  for (let i = 0; i < cardsPerSlide; i++) {
    const index = currentIndex + i;
    if (index < carouselItems.length) {
      visibleItems.push(carouselItems[index]);
    }
  }

  // --- Move one image at a time ---
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? prev : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev + cardsPerSlide < carouselItems.length ? prev + 1 : prev
    );
  };

  const showLeftArrow = currentIndex > 0;
  const showRightArrow = currentIndex + cardsPerSlide < carouselItems.length;

  return (
    <>
      {/* Most Booked Services Section */}
      <div className="container mt-4 position-relative">
        <h2 className="fw-semibold mb-4">Most booked services</h2>

        <Row className="justify-content-center">
          {visibleItems.map((item, idx) => (
            <Col
              key={idx}
              md={12 / cardsPerSlide}
              className="mb-3"
              style={{
                flex: `0 0 ${100 / cardsPerSlide}%`,
                maxWidth: `${100 / cardsPerSlide}%`,
                transition: "transform 0.4s ease",
              }}
            >
              <img
                src={`http://localhost:5000${item.img}`}
                alt={item.name}
                style={{
                  width: "101%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
              <p
                className="mt-2"
                style={{ fontSize: "11px", fontWeight: "bold" }}
              >
                {item.name}
              </p>
              <p style={{ fontSize: "13px" }}>
                <FaStar
                  style={{
                    marginBottom: "5px",
                    marginRight: "5px",
                    color: "#656464ff",
                    fontSize: "12px",
                  }}
                />
                {item.title} <br /> {item.value}{" "}
                <span
                  style={{
                    textDecoration: "line-through",
                    color: "#656464ff",
                  }}
                >
                  {item.option}
                </span>
              </p>
            </Col>
          ))}
        </Row>

        {/* Arrows */}
        {showLeftArrow && (
          <div className="carousel-arrow left" onClick={handlePrev}>
            &#10094;
          </div>
        )}
        {showRightArrow && (
          <div className="carousel-arrow right" onClick={handleNext}>
            &#10095;
          </div>
        )}
      </div>

      {/* Salon Section */}
      <div className="container mt-5">
        <h2 className="fw-semibold mb-4">Salon for women</h2>
        <Row className="g-4">
          {salonItems.map((item, idx) => (
            <Col key={idx} xs={12} sm={6} md={4} lg={3}>
              <Card style={{ borderRadius: "10px", boxShadow: "0 0 6px #ddd" }}>
                <Card.Img
                  variant="top"
                  src={`http://localhost:5000${item.img}`}
                  alt={item.key}
                  style={{
                    height: "200px",
                    objectFit: "cover",
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",
                  }}
                />
                <Card.Body>
                  <Card.Title
                    className="text-center"
                    style={{ fontSize: "15px", fontWeight: "600" }}
                  >
                    {item.key.charAt(0).toUpperCase() + item.key.slice(1)}
                  </Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
}

export default Book;
