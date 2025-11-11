import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { Button, Row, Col } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";

function Salon2modal({ show, onHide, selectedItem, handleAddToCart, handleDecrease, handleIncrease }) {
  const basePrice = 2195;
  const [cartData, setCartData] = useState([]);
  const [extraSelected, setExtraSelected] = useState([]);
  const [totalPrice, setTotalPrice] = useState(basePrice);
  const [discountedPrice, setDiscountedPrice] = useState(null);
  const [savedAmount, setSavedAmount] = useState(0);

  const formatPrice = (amount) => `₹${amount.toLocaleString("en-IN")}`;
  const safePrice = (price) => Number((price || "0").toString().replace(/[₹,]/g, ""));

  // fetch cart when modal opens
  useEffect(() => {
    if (show) fetchCartData();
  }, [show]);

  const fetchCartData = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/carts");
    const data = await res.json();
    console.log("CART DATA:",data);
    const carts = data.carts || [];
    const match = carts.find(c => c.title === selectedItem?.title);
    setCartData(carts);

    if (match) {
      const itemPrice = safePrice(match.price);
      const saved = safePrice(match.savedAmount || 0);
      setTotalPrice(itemPrice);
      setSavedAmount(saved);
      setDiscountedPrice(itemPrice - saved);
    } else {
      setDiscountedPrice(null);
      setSavedAmount(0);
    }
  } catch (err) {
    console.error("Error fetching cart data:", err);
  }
};

  return (
    <Modal show={show} onHide={onHide} centered>
      <Button onClick={onHide} className="closebtn">X</Button>

      {selectedItem && (
        <div className="p-4">
          <h5 className="fw-semibold">{selectedItem.title}</h5>
          <p style={{ color: "#5a5a5a", fontSize: "14px" }}>
            <FaStar /> {selectedItem.rating}
          </p>

          {/* PRICE & DURATION */}
          <Row className="align-items-center">
            <Col xs={8}>
              <p style={{ fontSize: "14px", marginBottom: "8px" }}>
                <span className="fw-semibold">
                  {formatPrice(discountedPrice || totalPrice)}
                </span>
                <span style={{ marginLeft: "8px", fontSize: "12px", color: "#5a5a5a" }}>
                  <GoDotFill style={{ position: "relative", top: "-1px" }} /> {selectedItem.duration}
                </span>
              </p>

              {discountedPrice ? (
              <p style={{ color: "#066018ff", fontSize: "12px", marginTop: "5px" }}>
                 You saved {formatPrice(totalPrice - discountedPrice)} in this package!
              </p>
            ) : (
              <p style={{ color: "#066018ff", fontSize: "12px", marginTop: "5px" }}>
                 Add {formatPrice(Math.max(0, basePrice + 905 - totalPrice))} more to get 25% discount
              </p>
            )}
            </Col>

            {/* COUNT BOX */}
            <Col xs={4} className="d-flex justify-content-end">
              {(() => {
                const item = cartData.find(c => c.title === selectedItem.title);
                if (!item) {
                  return (
                    <Button
                      style={{
                        color: "rgb(110, 66, 229)",
                        backgroundColor: "rgb(245, 241, 255)",
                        border: "1px solid rgb(110, 66, 229)",
                        padding: "4px 14px",
                      }}
                      onClick={() =>
                        handleAddToCart(selectedItem, extraSelected, discountedPrice || totalPrice, savedAmount)
                      }>Add
                    </Button>
                  );
                }
                return (
                  <div
                    className="d-flex align-items-center gap-2"
                    style={{
                      border: "1px solid rgb(110, 66, 229)",
                      borderRadius: "6px",
                      backgroundColor: "rgb(245, 241, 255)",
                      width: "85px",
                      justifyContent: "center",
                    }}>
                    <Button onClick={handleDecrease} className="button">−</Button>
                    <span className="count-box">{item.count || 1}</span>
                    <Button onClick={handleIncrease} className="button">+</Button>
                  </div>
                );
              })()}
            </Col>
          </Row>
        </div>
      )}
    </Modal>
  );
}

export default Salon2modal;
