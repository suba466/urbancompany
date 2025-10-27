import { Routes, Route, useLocation } from 'react-router-dom';
import Shine from './Shine.jsx';
import Banner from './Banner.jsx';
import Urbanav from './Urbanav.jsx';
import Book from './Book.jsx';
import Salon from './Salon.jsx';

function Urban() {
  

  return (
    <>
      <Urbanav/>

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Banner /> <br />
              <Shine /> <br />
              <Book /> <br />
            </>
          }
        />
        <Route path="/salon" element={<Salon />} />
        {/* add other routes here */}
      </Routes>
    </>
  );
}

export default Urban;
