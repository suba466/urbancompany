import { Row, Col, Button } from "react-bootstrap";
import { GoDotFill } from "react-icons/go";
import { useCart } from "./hooks";
import { useNavigate } from "react-router-dom";
import API_URL, { getAssetPath } from "./config";

function CartBlock({
  formatPrice = (x) => x,
  hideViewButton = false,
  onEdit,
  customerEmail = ""
}) {
  const { items: carts, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  const safePrice = (price) => {
    if (!price) return 0;
    const priceStr = price.toString();
    const cleaned = priceStr.replace(/[₹,]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  // Calculate TOTAL PRICE of ALL items in cart
  const calculateTotalPrice = () => {
    return carts.reduce((total, item) => {
      const itemPrice = safePrice(item.price);
      const itemCount = item.count || 1;
      return total + (itemPrice * itemCount);
    }, 0);
  };

  const totalPrice = calculateTotalPrice();

  const handleIncrease = (item) => {
    updateItem(item._id || item.productId, (item.count || 1) + 1);
  };

  const handleDecrease = (item) => {
    if (item.count <= 1) {
      removeItem(item._id || item.productId);
    } else {
      updateItem(item._id || item.productId, (item.count || 1) - 1);
    }
  };

  // Fixed: Handle view cart navigation
  const handleViewCart = () => {
    // Navigate to cart page using react-router
    navigate('/cart');
    // Scroll to top
    window.scrollTo(0, 0);
  };

  return (
    <div
      style={{
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        border: "1px solid rgba(192,192,195,1)",
        borderRadius: "8px",
        padding: "10px",
      }}>
      {carts.length === 0 ? (
        <div className="text-center py-4">
          <img
            src={getAssetPath("/assets/cart.jpg")}
            alt="cart-empty"
            className="w-50 mb-3"
            style={{ maxWidth: "120px", objectFit: "contain" }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <p className="text-muted fw-semibold">No items in your cart</p>
        </div>
      ) : (
        <>
          <h5 className="fw-semibold mb-2">Cart ({carts.length} items)</h5>

          {carts.map((c) => {
            const itemPrice = safePrice(c.price) * (c.count || 1);
            const productName = c.name || c.serviceName || c.title || "Service";

            return (
              <div key={c._id || c.productId} className="mb-3">
                <Row className="align-items-center">
                  <Col className="pe-0">
                    <div className="d-flex align-items-center gap-2">
                      <p className="m-0" style={{ fontSize: "12px", fontWeight: "500", lineHeight: "1.2" }}>
                        {productName}
                      </p>
                    </div>
                  </Col>
                  <Col xs={7} className="d-flex align-items-center justify-content-end gap-2 ps-1">
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
                          fontSize: "18px",
                          fontWeight: "bold"
                        }}
                      >
                        −
                      </Button>
                      <span className="count-box fw-bold" style={{ padding: "2px 8px", fontSize: "14px" }}>
                        {c.count || 1}
                      </span>
                      <Button
                        onClick={() => handleIncrease(c)}
                        className="button border-0 d-flex align-items-center justify-content-center"
                        style={{
                          backgroundColor: "transparent",
                          color: "#000",
                          fontSize: "18px",
                          fontWeight: "bold",
                          opacity: (c.count || 1) >= 3 ? "0.5" : "1",
                          cursor: (c.count || 1) >= 3 ? "not-allowed" : "pointer"
                        }}
                        disabled={(c.count || 1) >= 3}
                      >
                        +
                      </Button>
                    </div>

                    <div className="text-end">
                      <p style={{ fontSize: "13px", margin: 0, fontWeight: "500" }}>{formatPrice(itemPrice)}</p>
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

          {/* TOTAL SECTION - Shows sum of all items */}
          <div className="border-top pt-2 mt-2">
            <Row className="align-items-center">
              <Col>
                <p className="fw-semibold mb-0" style={{ fontSize: "14px" }}>
                  Total
                </p>
              </Col>
              <Col className="text-end">
                <p className="fw-semibold mb-0" style={{ fontSize: "14px" }}>
                  {formatPrice(totalPrice)}
                </p>
              </Col>
            </Row>
          </div>

          {!hideViewButton && (
            <Button
              className="butn w-100 fw-bold mt-3"
              style={{
                height: "36px",
                fontSize: "12px",
              }}
              onClick={handleViewCart} // Use the fixed handler
            >
              <Row>
                <Col className="text-start">View Cart</Col>
                <Col className="text-end">{formatPrice(totalPrice)}</Col>
              </Row>
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export default CartBlock;