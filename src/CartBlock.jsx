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
      }}>
      {carts.length === 0 ? (
        <div className="text-center">
          <img
            src="http://localhost:5000/assets/cart.png"
            alt="cart-placeholder" 
            className="w-50"
            style={{ padding: "10px" }}
            onError={(e) => {
              // Fallback if cart image fails to load
              e.target.src = "http://localhost:5000/assets/placeholder.png";
            }}
          />
          <p>No items in your cart</p>
        </div>
      ) : (
        <>
          <h5 className="fw-semibold mb-2">Cart</h5>

          {sortedCarts.map((c) => {
            const price = safePrice(c.price) * (c.count || 1);
            const isMainPackage = c.title === "Wedding glow Package";

            return (
              <div key={c._id} className="mb-3">
                <Row className="align-items-center">
                  <Col>
                    <p className="m-0" style={{ fontSize: "12px", fontWeight: "500" }}>{c.title}</p>
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
                      >
                        −
                      </Button>
                      <span className="count-box fw-bold" style={{ padding: "2px 10px" }}>
                        {c.count || 1}
                      </span>
                      <Button 
                        onClick={() => handleIncrease(c)} 
                        className="button border-0 d-flex align-items-center justify-content-center"
                      >
                        +
                      </Button>
                    </div>

                    <div className="text-end">
                      <p style={{ fontSize: "13px", margin: 0 }}>{formatPrice(price)}</p>
                    </div>
                  </Col>
                </Row>

                {/* Content list - Show ALL services for main packages */}
                {isMainPackage && c.content && c.content.length > 0 && (
                  <div style={{ marginTop: "10px", fontSize: "12px" }}>
                    {c.content.map((item, i) => (
                      <p key={i} style={{ margin: "2px 0" }}>
                        <GoDotFill style={{ fontSize: "10px", color: "#5a5959ff" }} />{" "}
                        {item.value ? `${item.value} : ${item.details}` : item.details}
                      </p>
                    ))}
                  </div>
                )}

                {/* EDIT BUTTON - Only show for Wedding glow Package */}
                {onEdit && isMainPackage && (
                  <Button
                    className="text-start fw-semibold mt-2 editbtn"
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
              className="butn w-100 fw-bold"
              style={{ height: "36px", fontSize: "12px", marginTop: "10px" }}
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