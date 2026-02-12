import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store';
import { setCustomerUser } from './store';
import Shine from './Shine.jsx';
import Banner from './Banner.jsx';
import Urbanav from './Urbanav.jsx';
import Book from './Book.jsx';
import CartPage from './CartPage.jsx';
import Salon from './Salon.jsx';
import CartSummary from './CartSummary';
import OrderSuccess from './OrderSuccess.jsx';
import AdminPanel from './AdminPanel.jsx';
import CategoryPage from './CategoryPage.jsx';

function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize auth state on app load
    const customerToken = localStorage.getItem('customerToken');
    const customerInfo = localStorage.getItem('customerInfo');

    if (customerToken && customerInfo) {
      try {
        const user = JSON.parse(customerInfo);
        dispatch(setCustomerUser(user));
        console.log("✅ Auth state initialized from localStorage");
      } catch (error) {
        console.error("Error initializing auth state:", error);
      }
    }
  }, [dispatch]);

  return null;
}

function Urban() {
  return (
    <Provider store={store}>
      <AuthInitializer />
      <Routes>
        {/* Public routes */}
        <Route path='/' element={
          <>
            <Urbanav />
            <Banner /> <br />
            <Shine /> <br />
            <Book /><br />
          </>
        } />
        <Route path='/salon' element={
          <>
            <Urbanav />
            <Salon />
          </>
        } />

        <Route path='/cart-summary' element={<CartSummary />} />
        <Route path='/cart' element={<><Urbanav /><CartPage /></>} />
        <Route path='/order-success' element={<><Urbanav /><OrderSuccess /></>} />

        {/* Dynamic category routes - catches all category URLs */}
        <Route path='/:categorySlug' element={
          <>
            <Urbanav />
            <CategoryPage />
          </>
        } />

        {/* Admin routes */}
        <Route path='/admin/*' element={<AdminPanel />} />
      </Routes>
    </Provider>
  );
}

export default Urban;
