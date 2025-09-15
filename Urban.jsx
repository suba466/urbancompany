import { Routes, Route, Navigate } from "react-router-dom";   
import { useEffect, useState } from "react";
import Urbanav from './Urbanav.jsx';
import Urban1 from './Urban1.jsx';
import Native from './Native.jsx';             

function Urban() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 425);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return(
    <>
      <Urbanav /> 
      <Routes>
        <Route path="/" element={<Urban1 />} />
        <Route 
          path="/native" 
          element={isMobile ? <Navigate to="/" /> : <Native />} 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default Urban;
