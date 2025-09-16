import { Button } from "react-bootstrap";
import { useAuth } from "./Create.jsx";
import { useNavigate } from "react-router-dom";
import slide from './assets/slider-image1.jpg'
function Home3() {
  const { setAccessBlog } = useAuth();
  const navigate = useNavigate();

  const handleReadMore = () => {
    setAccessBlog(true); 
    navigate("/blog");   
  };

  return (
    <div style={{textAlign: "center",marginTop: "50px",backgroundImage: `url(${slide})`,backgroundSize: "cover",minHeight: "400px", color: "white", padding: "50px 20px",height:"300px"  }}>
      <h2>Home Page</h2>
      <p>Welcome to our website! Learn more about our content below.</p>
      <Button variant="outline-secondary" onClick={handleReadMore}>
        Read More
      </Button>
    </div>
  );
}

export default Home3;
