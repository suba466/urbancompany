import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    customerId: '', // Changed from userId
    name: '',
    email: '',
    phone: '',
    city: '',
    profileImage: '',
    title: 'Ms'
  });

  // Load from localStorage on initial render
  useEffect(() => {
    const storedCustomer = localStorage.getItem('urbanCustomer'); // Changed key
    if (storedCustomer) {
      try {
        const customerData = JSON.parse(storedCustomer);
        console.log("📂 Loading customer from localStorage:", customerData);
        setCustomerInfo(customerData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("❌ Error parsing stored customer:", error);
        localStorage.removeItem('urbanCustomer');
      }
    }
  }, []);

  const login = (customerData) => {
    console.log("🔑 Login called with data:", customerData);
    
    // Ensure customerId is present
    if (!customerData.customerId) {
      console.error("❌ No customerId provided during login!");
      alert("Login failed: Customer ID missing");
      return;
    }

    const customerInfoToStore = {
      customerId: customerData.customerId, // Changed from userId
      name: customerData.name || '',
      email: customerData.email || '',
      phone: customerData.phone || '',
      city: customerData.city || '',
      profileImage: customerData.profileImage || '',
      title: customerData.title || 'Ms'
    };

    console.log("💾 Storing customer info:", customerInfoToStore);
    
    setCustomerInfo(customerInfoToStore);
    setIsLoggedIn(true);
    
    // Save to localStorage with new key
    localStorage.setItem('urbanCustomer', JSON.stringify(customerInfoToStore));
    console.log("✅ Customer saved to localStorage");
  };

  const logout = () => {
    console.log("🚪 Logging out customer");
    setCustomerInfo({
      customerId: '', // Changed from userId
      name: '',
      email: '',
      phone: '',
      city: '',
      profileImage: '',
      title: 'Ms'
    });
    setIsLoggedIn(false);
    localStorage.removeItem('urbanCustomer'); // Changed key
  };

  const value = {
    isLoggedIn,
    customerInfo, // Changed from userInfo
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};