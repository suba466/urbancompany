import { useEffect, useState, useRef } from "react";
import { Carousel, Row, Col } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
function Book() {
  const [carouselItems, setCarouselItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerSlide, setCardsPerSlide] = useState(5);
  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/book");
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setCarouselItems(data.book);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch book data");
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

  if (loading) return <p>Loading carousel...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // Split items into slides
  const chunkedItems = [];
  for (let i = 0; i < carouselItems.length; i += cardsPerSlide) {
    chunkedItems.push(carouselItems.slice(i, i + cardsPerSlide));
  }

  const handleSelect = (selectedIndex) => setCurrentIndex(selectedIndex);
  const handlePrev = () => carouselRef.current && carouselRef.current.prev();
  const handleNext = () => carouselRef.current && carouselRef.current.next();

  return (
    <div className="container mt-4 position-relative">
        <h2 className="fw-semibold">Most booked services</h2> <br />
      <Carousel ref={carouselRef}interval={null}
        indicators={false}nextIcon={null}
        prevIcon={null}activeIndex={currentIndex}
        onSelect={handleSelect}touch={true}>
        {chunkedItems.map((group, groupIndex) => (
          <Carousel.Item key={groupIndex}>
            <Row className="justify-content-center ">
              {group.map((item, idx) => (
                <Col key={idx}md={12 / cardsPerSlide}
                  className="mb-3"style={{flex: `0 0 ${100 / cardsPerSlide}%`,maxWidth: `${100 / cardsPerSlide}%`}}>
                  <img
                    src={`http://localhost:5000${item.img}`}
                    alt={item.name}
                    style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }}/>
                  <p className="mt-2 " style={{ fontSize: "14px",fontWeight:"bold" }}>{item.name}</p>
                  <p ><FaStar style={{marginBottom:"5px", marginRight:"5px",color:"#656464ff"}}/>{item.title}</p>
                  <p >{item.value} <span style={{textDecoration:"line-through",color:"#656464ff"}}>{item.option}</span></p>
                </Col>
              ))}
            </Row>
          </Carousel.Item>
        ))}
      </Carousel>

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

export default Book;
