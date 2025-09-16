import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
//import Regis from './Regis.jsx';
//import Useparam from './Useparam.jsx';
//import Articles from './Articles.jsx';
//import Uses from './Uses.jsx';
//import Nestedrouting from './Nestedrouting.jsx';
import Urban from './Urban'
//import Protect from './Protect.jsx';
import Authen from './Authen.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Urban/>
    </BrowserRouter>
  </StrictMode>
);
