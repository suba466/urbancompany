import { Routes, Route } from 'react-router-dom';
import Shine from './Shine.jsx';
import Banner from './Banner.jsx';
import Urbanav from './Urbanav.jsx';
import Book from './Book.jsx';
import CartPage from './CartPage.jsx';
import Salon from './Salon.jsx';
import { AuthProvider } from './AuthContext';
import PaymentPage from './PaymentPage.jsx';
function Urban(){

  return(
    <AuthProvider>
      <Urbanav/> 
      <Routes>
        <Route path='/' element={
          <>
          <Banner/> <br />
          <Shine/> <br />
          <Book/><br/>
          </>
        }/>
        <Route path='/salon' element={<Salon/>}/>
        <Route path='/cart' element={<CartPage/>}/>
        <Route path="/payment" element={<PaymentPage />} />

      </Routes>
    </AuthProvider>
  )
}

export default Urban;