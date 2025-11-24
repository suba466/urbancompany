import React, { useState, useRef, useEffect } from "react";
import { Button, Row, Col } from "react-bootstrap";

export default function FrequentlyAddedCarousel({
  items = [],
  carts = [],
  onAdd,
  onRemove
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(3);
  const containerRef = useRef(null);

  // Calculate how many items can fit based on container width
  useEffect(() => {
    const updateVisibleItems = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Each item takes approximately 180px (160px width + 20px gap)
        const calculatedVisible = Math.floor(containerWidth / 180);
        setVisibleItems(Math.max(1, Math.min(3, calculatedVisible))); // Max 3, min 1
      }
    };

    updateVisibleItems();
    window.addEventListener('resize', updateVisibleItems);
    return () => window.removeEventListener('resize', updateVisibleItems);
  }, []);

  const totalGroups = Math.ceil(items.length / visibleItems);
  const showLeftArrow = currentIndex > 0;
  const showRightArrow = currentIndex < totalGroups - 1;

  const nextSlide = () => {
    if (currentIndex < totalGroups - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Get current group of items to display
  const getCurrentItems = () => {
    const startIndex = currentIndex * visibleItems;
    return items.slice(startIndex, startIndex + visibleItems);
  };

  return (
    <div className="position-relative" ref={containerRef}>
      {/* Left Arrow */}
      {showLeftArrow && (
        <Button
           style={{backgroundColor:"transparent",color :"black"}}
          className="position-absolute border-0 end-0 top-50 translate-middle-y z-3 carousel-arrow left"
          onClick={prevSlide}
        >
          &#10094;
        </Button>
      )}

      {/* Carousel Container - Fixed 3 items */}
      <div
        className="d-flex justify-content-center gap-4"
        style={{
          minHeight: "220px",
          padding: "10px 50px" // Padding for arrows
        }}>
        {getCurrentItems().map((item) => {
          const cartItem = carts.find(c => c.title === item.name);
          const count = cartItem?.count || 0;

          return (
            <div 
              key={item.key} 
              className="text-center"
              style={{ 
                width: "160px",
                flexShrink: 0
              }}>
              <img
                src={`http://localhost:5000/${item.img}`}
                alt={item.name}
                style={{ 
                  width: "140px", 
                  height: "140px", 
                  borderRadius: "10px",
                  objectFit: "cover" 
                }}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/140x140?text=No+Image";
                }}
              />
              <p className="fw-semibold" style={{ 
                fontSize: "12px", 
                marginTop: "8px",
                marginBottom: "4px",
                minHeight: "32px",
              }}>
                {item.name}
              </p>
              
              <Row className="align-items-center justify-content-center">
                <Col xs={12} className="mb-2">
                  <p className="fw-semibold" style={{ 
                    fontSize: "14px", 
                    color: "#333",
                    marginBottom: "0"
                  }}>
                    ₹{item.price}
                  </p>
                </Col>
                <Col xs={12}>
                  {count === 0 ? (
                    <Button className="w-100"
                      size="sm"
                      style={{ 
                        color: "rgb(110, 66, 229)",
                        borderRadius: "8px",
                        backgroundColor: "transparent",
                        borderColor: "rgb(110, 66, 229)",
                        fontSize: "14px",
                        padding: "4px 20px",}}
                      onClick={() => onAdd(item)}
                    >
                      Add
                    </Button>
                  ) : (
                    <div
                      className="d-flex align-items-center justify-content-between mx-auto"
                      style={{
                        border: "1px solid #6e42e5",
                        borderRadius: "20px",
                        padding: "4px 12px",
                        backgroundColor: "#f5f1ff",
                        width: "120px"
                      }}
                    >
                      <Button
                        variant="link"
                        className="button border-0 d-flex align-items-center justify-content-center"
                        onClick={() => onRemove(item)}>−
                      </Button>
                      <span className="fw-bold" style={{ fontSize: "14px" }}>{count}</span>
                      <Button
                       className="button border-0 d-flex align-items-center justify-content-center"
                      onClick={() => onAdd(item)}>+</Button>
                    </div>
                  )}
                </Col>
              </Row>
            </div>
          );
        })}

        {/* Fill empty spaces if less than 3 items */}
        {getCurrentItems().length < 3 &&
          Array.from({ length: 3 - getCurrentItems().length }).map((_, index) => (
            <div 
              key={`empty-${index}`} 
              style={{ 
                width: "160px",
                visibility: "hidden" // Reserve space but make invisible
              }}
            />
          ))
        }
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <Button
          style={{backgroundColor:"transparent",color :"black"}}
          className="position-absolute border-0 end-0 top-50 translate-middle-y z-3 carousel-arrow right"
          onClick={nextSlide}
        >
          &#10095;
        </Button>
      )}  
    </div>
  );
}