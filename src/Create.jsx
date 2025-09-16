import { createContext, useContext, useState } from "react"
const AuthContext = createContext();
export const Create = ({ children }) => { 
  const [accessBlog, setAccessBlog] = useState(false);
  const [showHome3, setShowHome3] = useState(false);
  return (
    <AuthContext.Provider value={{ accessBlog, setAccessBlog, showHome3, setShowHome3 }}>
      {children}   
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
