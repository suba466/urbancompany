import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from "react-router-dom";


import Urban from './Urban.jsx';



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Urban/>
    </BrowserRouter>
  </StrictMode>
)
