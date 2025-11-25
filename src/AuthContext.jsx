// AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", phone: "" });

  // Check for existing login on app start
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    const userName = localStorage.getItem('userName');
    const userPhone = localStorage.getItem('userPhone');
    
    if (loggedIn === 'true' && userName) {
      setIsLoggedIn(true);
      setUserInfo({ 
        name: userName, 
        phone: userPhone || "" 
      });
    }
  }, []);

  const login = (userData) => {
    setIsLoggedIn(true);
    setUserInfo({
      name: userData.name || "User",
      phone: userData.phone || ""
    });
    
    // Store in localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', userData.name || "User");
    localStorage.setItem('userPhone', userData.phone || "");
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserInfo({ name: "", phone: "" });
    
    // Clear localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhone');
  };

  const value = {
    isLoggedIn,
    userInfo,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};