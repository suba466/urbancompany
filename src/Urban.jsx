import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Shine from './Shine.jsx';
import Banner from './Banner.jsx';
import Urbanav from './Urbanav.jsx';
import Book from './Book.jsx';
import CartPage from './CartPage.jsx';
import Salon from './Salon.jsx';
import CartSummary from './CartSummary'; 
import AdminPanel from './AdminPanel.jsx'; 

function Urban() {
  return (
    <Provider store={store}>
      <Routes>
        {/* Public routes */}
        <Route path='/' element={
          <>
            <Urbanav/> 
            <Banner/> <br />
            <Shine/> <br />
            <Book/><br/>
          </>
        }/>
        <Route path='/salon' element={
          <>
            <Urbanav/>
            <Salon/>
          </>
        }/>
        
        <Route path='/cart-summary' element={<CartSummary/>}/>
        <Route path='/cart' element={<><Urbanav/><CartPage/></>}/>
        
        {/* Admin routes */}
        <Route path='/admin/*' element={<AdminPanel/>}/>
      </Routes>
    </Provider>
  );
}

export default Urban;