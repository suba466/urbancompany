import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function CartSummary({ show, onHide, cartItems, formatPrice }) {
  const navigate = useNavigate();

  const totalPrice = cartItems.reduce((total, item) => {
    return total + (Number((item.price || "0").toString().replace(/[₹,]/g, "")) * (item.count || 1));
  }, 0);

  const handleCheckout = () => {
    onHide();
    navigate('/cart');
  };

  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton>
        <Modal.Title>Your Cart</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {cartItems.length === 0 ? (
          <p className="text-center text-muted">Your cart is empty</p>
        ) : (
          <div>
            {cartItems.map((item, index) => (
              <div key={index} className="mb-2 pb-2 border-bottom">
                <Row className="align-items-center">
                  <Col xs={8}>
                    <p className="mb-0 small fw-semibold">{item.title}</p>
                    {item.count > 1 && (
                      <p className="mb-0 text-muted small">Qty: {item.count}</p>
                    )}
                  </Col>
                  <Col xs={4} className="text-end">
                    <p className="mb-0 small">
                      {formatPrice(Number((item.price || "0").toString().replace(/[₹,]/g, "")) * (item.count || 1))}
                    </p>
                  </Col>
                </Row>
              </div>
            ))}
            <div className="mt-3 pt-2 border-top">
              <Row>
                <Col>
                  <p className="mb-0 fw-semibold">Total:</p>
                </Col>
                <Col className="text-end">
                  <p className="mb-0 fw-semibold">{formatPrice(totalPrice)}</p>
                </Col>
              </Row>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Continue Shopping
        </Button>
        {cartItems.length > 0 && (
          <Button className="butn" onClick={handleCheckout}>
            Checkout
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default CartSummary;