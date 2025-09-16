import { Routes, Route } from "react-router-dom";
import { CreateAuth } from './CreateAuth.jsx';
import ProtectedRoute from "./ProtectedRoute";
import Mainpage from "./Mainpage";
import Login from "./Login";
import Prod from './Prod.jsx';
import Cart from './Cart.jsx';
function Protect() {
  return (
    <CreateAuth>
      <Routes>
        <Route path="/" element={<Mainpage />} />
        <Route path="/login" element={<Login />}/>
        <Route path="/prod" element={<ProtectedRoute><Prod /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      </Routes>
    </CreateAuth>
  );
}

export default Protect;
