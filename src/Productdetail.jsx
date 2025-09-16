import { useParams, useNavigate } from "react-router-dom";

const Productdetail = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  function handleBuy() {
    navigate(`/checkout?productId=${id}&price=500&mode=COD`);
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Product Detail Page</h2>
      <p>Showing details for Product #{id}</p>
      <button onClick={handleBuy}>Buy Now</button>
    </div>
  );
};

export default Productdetail;
