import { Button } from 'react-bootstrap';
import { useAuth } from './CreateAuth.jsx';
import { useNavigate } from "react-router-dom";
const Dash = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <div>
      <h2>Welcome {user?.name}</h2>
      <p>This is your protected dashboard</p>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
};

export default Dash;
