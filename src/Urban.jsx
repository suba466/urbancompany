import 'bootstrap/dist/css/bootstrap.min.css';
import Urbanav from './Urbanav';
import Urban1 from './Urban1';
import Native from './Native';             
import { Routes, Route } from "react-router-dom";   

function Urban(){
    return(
        <>
          <Urbanav/>
          <Routes>
              <Route path="/" element={<Urban1 />} />   
              <Route path="/native" element={<Native />} /> 
          </Routes>
        </>
    );
}
export default Urban;
