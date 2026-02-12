import React, { useState } from "react";
import { Button, Row, Col } from "react-bootstrap";

export default function FrequentlyAddedCarousel({
  items = [],
  carts = [],
  onAdd,
  onRemove,
  onViewProduct, // must be passed from parent (opens modal)
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleItems = 3;
  const totalGroups = Math.ceil(items.length / visibleItems);

  const getCurrentItems = () => {
    const startIndex = currentIndex * visibleItems;
    return items.slice(startIndex, startIndex + visibleItems);
  };

  return (
    <div className="position-relative" style={{ width: "100%" }}>

      {currentIndex > 0 && (
        <Button
          style={{
            backgroundColor: "transparent",
            color: "black"
          }}
          className="position-absolute carousel-arrow left border-0"
          onClick={() => setCurrentIndex(currentIndex - 1)}
        >
          &#10094;
        </Button>
      )}

      <div className="d-flex justify-content-center gap-3">
        {getCurrentItems().map((item) => {
          const cartItem = carts.find(c => c.title === item.name);
          const count = cartItem?.count || 0;

          return (
            <div
              key={item.key}
              style={{
                width: "160px",
                textAlign: "center",
                cursor: "pointer"
              }}
              onClick={() => onViewProduct(item)} // 👈 Open product on click
            ><Row><Col style={{height:"140px"}}>
              <img
              src={`${window.API_URL}/${item.img}`}
              alt={item.name}
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />
            <p className="fw-semibold" style={{ fontSize: "11px", minHeight: "28px", margin: "4px 0" }}>
              {item.name}
            </p></Col>
            <p className="fw-semibold" style={{ fontSize: "12px", margin: "3px 0" }}>
              ₹{item.price}
            </p></Row>

            <div style={{ height: "28px" }} onClick={(e) => e.stopPropagation()}>
                {count === 0 ? (
                  <Button
                    size="sm"
                    className="w-100"
                    style={{
                      color: "rgb(110, 66, 229)",
                      borderRadius: "8px",
                      backgroundColor: "transparent",
                      borderColor: "rgb(110, 66, 229)",
                      padding: "4px 10px",
                    }}
                    onClick={() => onAdd(item)}
                  >
                    Add
                  </Button>
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-between mx-auto"
                    style={{
                      width: "100%",
                      border: "1px solid #6e42e5",
                      borderRadius: "20px",
                      padding: "4px 10px",
                      backgroundColor: "#f5f1ff",
                    }}
                  >
                    <Button
                      variant="link"
                      className="border-0 p-0"
                      onClick={() => onRemove(item)}
                    >
                      −
                    </Button>
                    <span className="fw-bold">{count}</span>
                    <Button
                      variant="link"
                      className="border-0 p-0"
                      onClick={() => onAdd(item)}
                    >
                      +
                    </Button>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {currentIndex < totalGroups - 1 && (
        <Button
          style={{
            backgroundColor: "transparent",
            color: "black"
          }}
          className="position-absolute carousel-arrow right border-0"
          onClick={() => setCurrentIndex(currentIndex + 1)}
        >
          &#10095;
        </Button>
      )}

    </div>
  );
}
