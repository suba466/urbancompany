import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { Button, ModalBody, Form, Row, Col } from "react-bootstrap";
import { TbCirclePercentageFilled } from "react-icons/tb";
import { GoDotFill } from "react-icons/go";

function Salon2modal({ show, onHide, selectedItem, handleAddToCart, basePrice, baseServices, roundPrice }) {
  const [selectedServices, setSelectedServices] = useState({});
  const [totalPrice, setTotalPrice] = useState(basePrice);
  const [discountedPrice, setDiscountedPrice] = useState(null);

 

  useEffect(() => {
    const extraPrice = Object.values(selectedServices).reduce((sum, s) => sum + Number(s.price || 0), 0);
    const total = basePrice + extraPrice;
    setTotalPrice(roundPrice(total));
    setDiscountedPrice(total > basePrice + 1000 ? roundPrice(total * 0.8) : null);
  }, [selectedServices]);


  const formatPrice = (amount) => `₹${amount.toLocaleString("en-IN")}`;

  return (
   <Modal show={show} onHide={onHide} centered>
  <Button onClick={onHide} className="closebtn">X</Button>
  {selectedItem && (
    <>
      <div className="p-3" style={{ backgroundColor: "#ede1d4", borderRadius: "10px" }}>
        <h4>{selectedItem.title}</h4> {/* Only package title */}
      </div>
      <ModalBody>
        <Form>
          
                  
               
        </Form>
      </ModalBody>

      {/* Price + Add Button */}
      <Row className="p-3">
        <Col>
          <span className="fw-semibold" style={{ fontSize: "18px" }}>
            {discountedPrice ? formatPrice(discountedPrice) : formatPrice(totalPrice)}
          </span>
          {discountedPrice && (
            <span className="text-muted ms-2" style={{ textDecoration: "line-through", fontSize: "14px" }}>
              {formatPrice(totalPrice)}
            </span>
          )}
        </Col>
        <Col>
          <Button
            onClick={async () => {
              const extraSelected = Object.values(selectedServices);
              if (handleAddToCart) {
                await handleAddToCart(selectedItem, extraSelected, discountedPrice || totalPrice);
              }
              onHide();
            }}
            style={{ width: "100%" }}
          >
            Add to Cart
          </Button>
        </Col>
      </Row>
    </>
  )}
</Modal>


  );
}

export default Salon2modal;
