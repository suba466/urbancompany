import { Link } from "react-router-dom";
import { useAuth } from "./Create.jsx";
function Navbar() {
  const { setShowHome3 } = useAuth();
  const handleHomeClick = () => {
    setShowHome3(true); 
  };

  return (
    <nav style={{ margin: "20px", textAlign: "center" }}>
      <Link to="/" onClick={handleHomeClick}>Home</Link> |{" "}
      <Link to="/about">About</Link> |{" "}
      <Link to="/contact">Contact</Link> |{" "}
      <Link to="/blog">Blog</Link>
    </nav>
  );
}

export default Navbar;
