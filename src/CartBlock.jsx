import React from "react";
import { Row, Col, Button } from "react-bootstrap";
import { GoDotFill } from "react-icons/go";

function CartBlock({
  carts = [],
  formatPrice = (x) => x,
  safePrice = (x) => x,
  handleIncrease,
  handleDecrease,
  navigate,
  hideViewButton = false,
  onEdit, 
}) {
  const totalPrice = carts.reduce((acc, c) => acc + safePrice(c.price) * (c.count || 1), 0);

 // Sort carts: carousel products first, then Wedding Glow Package pushed down, then others
const sortedCarts = [...carts].sort((a, b) => {
  const weddingTitle = "Wedding glow Package";

  // 1. Frequently added items from carousel first
  const aFreq = a.isFrequentlyAdded ? 1 : 0;
  const bFreq = b.isFrequentlyAdded ? 1 : 0;
  if (aFreq !== bFreq) return bFreq - aFreq;

  // 2. Push Wedding Glow Package to the bottom
  if (a.title === weddingTitle && b.title !== weddingTitle) return 1;
  if (b.title === weddingTitle && a.title !== weddingTitle) return -1;

  // 3. Maintain original order for others
  return 0;
});

  return (
    <div
      style={{
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        border: "1px solid rgba(192,192,195,1)",
        borderRadius: "8px",
        padding: "10px",
      }}
    >
      {carts.length === 0 ? (
        <div className="text-center">
          <img
            src="http://localhost:5000/assets/cart.png"
            alt="cart-placeholder"
            style={{ width: "50%", padding: "10px" }}
          />
          <p>No items in your cart</p>
        </div>
      ) : (
        <>
          <h5 className="fw-semibold mb-2">Cart</h5>

          {sortedCarts.map((c) => {
            const price = safePrice(c.price) * (c.count || 1);

            return (
              <div key={c._id} className="mb-3">
                <Row className="align-items-center">
                  <Col>
                    <p style={{ fontSize: "12px" }}>{c.title}</p>
                  </Col>
                  <Col xs={8} className="d-flex justify-content-between gap-2">
                    <div
                      className="button1"
                      style={{
                        height: "33px",
                        backgroundColor: "rgb(245, 241, 255)",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Button onClick={() => handleDecrease(c)} className="button">
                        −
                      </Button>
                      <span className="count-box" style={{ padding: "2px 10px" }}>
                        {c.count || 1}
                      </span>
                      <Button onClick={() => handleIncrease(c)} className="button">
                        +
                      </Button>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "13px", margin: 0 }}>{formatPrice(price)}</p>
                    </div>
                  </Col>
                </Row>

                {/* Content list */}
                <div style={{ marginTop: "10px", fontSize: "12px" }}>
                  {c.content?.map((item, i) => (
                    <p key={i}>
                      <GoDotFill style={{ fontSize: "10px", color: "#5a5959ff" }} />{" "}
                      {item.value ? `${item.value} : ${item.details}` : item.details}
                    </p>
                  ))}
                </div>

                {/* EDIT BUTTON */}
                {onEdit && (
                  <Button
                    className="text-start fw-semibold"
                    style={{
                      height: "33px",
                      width: "100%",
                      fontSize: "12px",
                      marginBottom: "5px",
                      backgroundColor: "white",
                      color: "#5e33d3ff",
                      border: "none",
                    }}
                    onClick={() => onEdit(c)}
                  >
                    Edit
                  </Button>
                )}
              </div>
            );
          })}

          {!hideViewButton && (
            <Button
              className="butn"
              style={{ height: "36px", width: "100%", fontSize: "12px" }}
              onClick={() => navigate("/cart")}
            >
              <Row>
                <Col className="text-start">{formatPrice(totalPrice)}</Col>
                <Col className="text-end">View Cart</Col>
              </Row>
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export default CartBlock;
