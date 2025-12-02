import { Routes, Route } from 'react-router-dom';
import Shine from './Shine.jsx';
import Banner from './Banner.jsx';
import Urbanav from './Urbanav.jsx';
import Book from './Book.jsx';
import CartPage from './CartPage.jsx';
import Salon from './Salon.jsx';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext'; 
import CartSummary from './CartSummary'; // Add this import

function Urban() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Routes WITH navbar */}
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
          
          
          {/* Routes WITHOUT navbar */}
          <Route path='/cart-summary' element={<CartSummary/>}/>
          <Route path='/cart' element={<><Urbanav/><CartPage/></>}/>
        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}

export default Urban;