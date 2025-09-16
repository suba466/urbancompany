import { createContext, useState, useContext } from "react";
const AuthContext = createContext();
export const CreateAuth = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart]=useState([]);
  const login=(username)=>setUser({name:username});
  const logout =()=>{setUser(null); setCart([]);}
  const addToCart=(item)=>setCart([...cart, item]);
  const removeFromCart=(itemName)=> setCart(cart.filter((i)=>i.name !==itemName));
  return (
    <AuthContext.Provider value={{ user, login, logout,cart, addToCart, removeFromCart }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
