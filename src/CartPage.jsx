import React, { useState, useEffect } from "react";
import CartBlock from "./CartBlock";
import { Row,Col,Button } from "react-bootstrap";

function CartPage() {
  const [carts, setCarts] = useState([]);

  const fetchCarts = () => {
    fetch("http://localhost:5000/api/carts")
      .then(res => res.json())
      .then(data => setCarts(data.carts || []));
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  const safePrice = (price) => Number((price || "0").toString().replace(/[₹,]/g, ""));
  const formatPrice = (amount) => `₹${amount.toLocaleString("en-IN")}`;

  const handleIncrease = async (item) => {
    await fetch(`http://localhost:5000/api/carts/${item._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: item.count + 1 })
    });
    fetchCarts();
  };

  const handleDecrease = async (item) => {
    if (item.count <= 1) {
      await fetch(`http://localhost:5000/api/carts/${item._id}`, { method: "DELETE" });
    } else {
      await fetch(`http://localhost:5000/api/carts/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: item.count - 1 })
      });
    }
    fetchCarts();
  };

  return (
    <div className="container mt-4">
        <Row>
<Col 
  style={{
    border: "1px solid rgba(0,0,0,0.2)",
    borderRadius: "10px",
    padding: "15px",
    height:"150px"
  }}
>
  <p className="fw-semibold mb-1">Account</p>
  <p style={{ fontSize: "13px", color: "#555" }}>
    To book the service, please login or sign up
  </p>
  <Button className="butn w-100 fw-bold" style={{ height: "40px" }}>
    Login
  </Button>
</Col>
  <Col>
    <CartBlock
        carts={carts}
        formatPrice={formatPrice}
        safePrice={safePrice}
        handleIncrease={handleIncrease}
        handleDecrease={handleDecrease}
        hideViewButton={true}/></Col>
        </Row>
    </div>
  );
}
export default CartPage;
