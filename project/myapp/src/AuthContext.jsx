// AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    city: '',
    profileImage: '',
    title: 'Ms'
  });

  // Load from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('urbanUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log(" Loading user from localStorage:", userData);
        setUserInfo(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error(" Error parsing stored user:", error);
        localStorage.removeItem('urbanUser');
      }
    }
  }, []);

  const login = (userData) => {
    console.log(" Login called with data:", userData);
    
    // Accept either userId, customerId, or id
    const userId = userData.userId || userData.customerId || userData.id;
    
    if (!userId) {
      console.error(" No user ID provided during login!");
      alert("Login failed: User ID missing");
      return;
    }

    const userInfoToStore = {
      id: userId,
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      city: userData.city || '',
      profileImage: userData.profileImage || '',
      title: userData.title || 'Ms'
    };

    console.log(" Storing user info:", userInfoToStore);
    
    setUserInfo(userInfoToStore);
    setIsLoggedIn(true);
    
    // Save to localStorage
    localStorage.setItem('urbanUser', JSON.stringify(userInfoToStore));
    console.log(" User saved to localStorage");
  };

  const logout = () => {
    console.log(" Logging out user");
    setUserInfo({
      id: '',
      name: '',
      email: '',
      phone: '',
      city: '',
      profileImage: '',
      title: 'Ms'
    });
    setIsLoggedIn(false);
    localStorage.removeItem('urbanUser');
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
