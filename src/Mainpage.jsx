import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
const Mainpage = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h2>HomePage (Public)</h2>
      <Button onClick={() => navigate("/login")}>Go to Login</Button>
      <Button onClick={() => navigate("/prod")}>Go to Products</Button>
      <Button onClick={() => navigate("/cart")}>Go to Cart</Button>
    </div>
  );
};

export default Mainpage;
