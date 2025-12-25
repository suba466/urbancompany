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
  customerEmail = "" // Add this parameter
}) {
  const totalPrice = carts.reduce((acc, c) => safePrice(c.price) * (c.count || 1), 0);

  return (
    <div
      style={{
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        border: "1px solid rgba(192,192,195,1)",
        borderRadius: "8px",
        padding: "10px",
      }}>
      {carts.length === 0 ? (
        <div className="text-center">
          <img
            src="http://localhost:5000/assets/cart.png"
            alt="cart-placeholder" 
            className="w-50"
            style={{ padding: "10px" }}
            onError={(e) => {
              e.target.src = "http://localhost:5000/assets/placeholder.png";
            }}
          />
          <p>No items in your cart</p>
        </div>
      ) : (
        <>
          <h5 className="fw-semibold mb-2">Cart</h5>

          {carts.map((c) => {
            const price = safePrice(c.price) * (c.count || 1);
            
            // Get the product name from cart item
            const productName = c.name || c.serviceName || c.title || "Service";
            
            console.log("Cart item debug:", {
              id: c._id,
              name: c.name,
              serviceName: c.serviceName,
              title: c.title,
              finalName: productName,
              customerEmail: customerEmail
            });

            return (
              <div key={c._id} className="mb-3">
                <Row className="align-items-center">
                  <Col>
                    <p className="m-0" style={{ fontSize: "12px", fontWeight: "500" }}>
                      {productName}
                    </p>
                  </Col>
                  <Col xs={8} className="d-flex align-items-center justify-content-between gap-2">
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        height: "33px",
                        backgroundColor: "rgb(245, 241, 255)",
                        borderRadius: "8px"
                      }}>
                      <Button 
                        onClick={() => handleDecrease(c)} 
                        className="button border-0 d-flex align-items-center justify-content-center"
                        style={{
                          backgroundColor: "transparent",
                          color: "#000",
                          minWidth: "36px",
                          fontSize: "18px",
                          fontWeight: "bold"
                        }}
                      >
                        −
                      </Button>
                      <span className="count-box fw-bold" style={{ padding: "2px 10px", fontSize: "14px" }}>
                        {c.count || 1}
                      </span>
                      <Button 
                        onClick={() => handleIncrease(c)} 
                        className="button border-0 d-flex align-items-center justify-content-center"
                        style={{
                          backgroundColor: "transparent",
                          color: "#000",
                          minWidth: "36px",
                          fontSize: "18px",
                          fontWeight: "bold"
                        }}
                      >
                        +
                      </Button>
                    </div>

                    <div className="text-end">
                      <p style={{ fontSize: "13px", margin: 0, fontWeight: "500" }}>{formatPrice(price)}</p>
                    </div>
                  </Col>
                </Row>

                {/* Content list - Show services if available */}
                {c.content && c.content.length > 0 && (
                  <div style={{ marginTop: "10px", fontSize: "12px", color: "#555" }}>
                    {c.content.map((item, i) => (
                      <p key={i} style={{ margin: "2px 0", lineHeight: "1.3" }}>
                        <GoDotFill style={{ fontSize: "10px", color: "#5a5959ff", marginRight: "4px" }} />
                        {item.details || item.title || "Service item"}
                      </p>
                    ))}
                  </div>
                )}

                {/* EDIT BUTTON */}
                {onEdit && (
                  <Button
                    className="text-start fw-semibold mt-2 editbtn"
                    onClick={() => onEdit(c)}
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid #ccc",
                      color: "#333",
                      padding: "2px 10px",
                      fontSize: "12px"
                    }}
                  >
                    Edit
                  </Button>
                )}
              </div>
            );
          })}

          {!hideViewButton && (
            <Button
              className="butn w-100 fw-bold"
              style={{ 
                height: "36px", 
                fontSize: "12px", 
                marginTop: "10px",
              }}
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