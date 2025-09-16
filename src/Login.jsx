import { Button } from "react-bootstrap";
import { useAuth } from "./CreateAuth.jsx";
import { useNavigate} from "react-router-dom";
function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleLogin = () => {
    login("Suba");
    alert("Logged in successfully!!")
    navigate("/prod");
  };
  return (
    <div>
      <h2>Login Page</h2>
      <Button onClick={handleLogin}>Login as Suba</Button>
    </div>
  );
}

export default Login;
