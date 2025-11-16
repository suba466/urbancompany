import React from "react";
import { Row, Col, Button } from "react-bootstrap";
import { GoDotFill } from "react-icons/go";

function CartBlock({ carts, formatPrice, safePrice, handleIncrease, handleDecrease, navigate,hideViewButton }) {
  return (
    <div style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.2)", border: "1px solid rgba(192,192,195,1)", borderRadius: "8px", padding: "10px" }}>
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
        carts.map((c) => {
          const price = safePrice(c.price) * (c.count || 1);

          return (
            <div key={c._id} className="mb-3">
              <h5 className='fw-semibold mb-2'>Cart</h5>

              <Row className="align-items-center">
                <Col><p style={{ fontSize: "12px" }}>{c.title}</p></Col>

                <Col xs={8} className="d-flex justify-content-between gap-2">
                  <div className='button1' style={{ height: "33px" ,backgroundColor:"rgb(245, 241, 255)"}}>
                    <Button onClick={() => handleDecrease(c)} className='button'>−</Button>
                    <span className="count-box" style={{padding:"2px 10px"}}>{c.count}</span>
                    <Button onClick={() => handleIncrease(c)} className='button'>+</Button>
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
              {/* EDIT BUTTON INSIDE CARTBLOCK */}
<Button
  className="text-start fw-semibold"
  style={{
    height: "33px",
    width: "100%",
    fontSize: "12px",
    marginBottom: "5px",
    backgroundColor: "white",
    color: "#5e33d3ff",
   border:"none",

  }}
  onClick={() => window.openEditPackageFromCart(c)}    
>
  Edit
</Button>

            {!hideViewButton &&(
              <Button
                className='butn '
                style={{height:"36px", width:"100%", fontSize:"12px"}}
                onClick={() => navigate("/cart")}
              ><Row><Col className="text-start">{formatPrice(price)}</Col>
              <Col className="text-end">View Cart</Col></Row>    
              </Button>)}
            </div>
          );
        })
      )}
    </div>
  );
}

export default CartBlock;
