import { useLocation } from "react-router-dom";

function Checkout() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const productId = queryParams.get("productId");
  const price = queryParams.get("price");
  const mode = queryParams.get("mode");

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Checkout Page</h2>
      <p>Product ID: {productId}</p>
      <p>Price: {price}</p>
      <p>Payment Mode: {mode}</p>
      <p>Order placed successfully!!</p>
    </div>
  );
}
export default Checkout;
