import { useEffect, useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API_URL, { getAssetPath } from "./config";
import { fetchData } from "./apiService";

function Book() {
  const [carouselItems, setCarouselItems] = useState([]);
  const [salonItems, setSalonItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerSlide, setCardsPerSlide] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComponentsData = async () => {
      setLoading(true);
      try {
        const bookData = await fetchData("api/book", "book");
        setCarouselItems(bookData && bookData.book ? bookData.book : []);

        const salonData = await fetchData("api/salon", "salon");
        setSalonItems(salonData && salonData.salon ? salonData.salon : []);

        // Fallback for salon items if data is empty (handled by fetchData usually, but just in case)
        if (!salonData || !salonData.salon) {
          setSalonItems([{ key: "waxing", img: "/assets/waxing.png" }]);
        }
      } catch (err) {
        console.error("Book component error:", err);
        setError("Failed to load services");
      } finally {
        setLoading(false);
      }
    };

    fetchComponentsData();

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
      <div className="container mt-4 position-relative px-0">
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
                src={getAssetPath(item.img || "/assets/placeholder.png")}
                alt={item.name}
                style={{
                  width: "101%",
                  height: "230px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
                onError={(e) => {
                  e.target.src = getAssetPath("/assets/placeholder.png");
                }}
              />
              <p
                className="mt-2 fw-bold"
                style={{ fontSize: "11px" }}
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
                <span className="text-decoration-line-through"
                  style={{
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
          <div
            className="carousel-arrow left"
            onClick={handlePrev}

          >
            &#10094;
          </div>
        )}
        {showRightArrow && (
          <div
            className="carousel-arrow right"
            onClick={handleNext}

          >
            &#10095;
          </div>
        )}
      </div>

      {/* Salon Section */}
      <div className="container mt-5 position-relative">
        <h2 className="fw-semibold mb-1">Salon for women</h2>
        <p className="mb-4" style={{ color: "#666", fontSize: "14px" }}>
          <FaStar className="me-1" style={{ color: "#6e42e5", fontSize: "12px" }} />
          <span className="fw-bold">4.85 (1.5M+ bookings)</span>
        </p>
        <style>
          {`
            .saloncard {
              cursor: pointer;
              transition: transform 0.2s ease;
              border: 1px solid #ededed;
              border-radius: 12px;
              overflow: hidden;
            }
            .saloncard:hover {
              transform: translateY(-5px);
            }
          `}
        </style>
        {cardsPerSlide === 1 ? (
          <Row className="justify-content-center">
            {salonItems
              .slice(currentIndex, currentIndex + cardsPerSlide)
              .map((item, idx) => (
                <Col
                  key={idx}
                  xs={12}
                  className="mb-3"
                  style={{
                    flex: `0 0 100%`,
                    maxWidth: "100%",
                    transition: "transform 0.4s ease",
                  }}
                >
                  <Card className="saloncard" onClick={() => navigate('/salon')}>
                    <Card.Body style={{ flex: 1 }}>
                      <Card.Title className="fw-semibold"
                        style={{
                          fontSize: "15px",
                          padding: "28px",
                        }}
                      >
                        {item.name || (item.key?.charAt(0).toUpperCase() + item.key?.slice(1))}
                      </Card.Title>
                    </Card.Body>
                    <Card.Img
                      variant="bottom"
                      src={getAssetPath(item.img || "/assets/placeholder.png")}
                      alt={item.key}
                      style={{ height: "200px", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src = getAssetPath("/assets/placeholder.png");
                      }}
                    />
                  </Card>
                </Col>
              ))}
          </Row>
        ) : (
          <Row className="g-4">
            {salonItems.map((item, idx) => (
              <Col key={idx} xs={12} sm={6} md={4} lg={3}>
                <Card className="saloncard" onClick={() => navigate('/salon')}>
                  <Card.Body style={{ flex: 1 }}>
                    <Card.Title className="fw-semibold"
                      style={{
                        fontSize: "15px",
                        padding: "28px",
                      }}
                    >
                      {item.name || (item.key?.charAt(0).toUpperCase() + item.key?.slice(1))}
                    </Card.Title>
                  </Card.Body>
                  <Card.Img
                    variant="bottom"
                    src={getAssetPath(item.img || "/assets/placeholder.png")}
                    alt={item.key}
                    style={{
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "0 0 10px 10px",
                    }}
                    onError={(e) => {
                      e.target.src = getAssetPath("/assets/placeholder.png");
                    }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Carousel arrows for mobile */}
        {cardsPerSlide === 1 && currentIndex > 0 && (
          <div
            className="carousel-arrow left"
            onClick={() => setCurrentIndex((prev) => prev - 1)}

          >
            &#10094;
          </div>
        )}
        {cardsPerSlide === 1 &&
          currentIndex + cardsPerSlide < salonItems.length && (
            <div
              className="carousel-arrow right"
              onClick={() => setCurrentIndex((prev) => prev + 1)}

            >
              &#10095;
            </div>
          )}
      </div>
    </>
  );
}

export default Book;