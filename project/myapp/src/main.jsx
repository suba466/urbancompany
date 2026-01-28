import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Urban from './Urban.jsx';
createRoot(document.getElementById('root')).render(
  <StrictMode>

    <BrowserRouter basename={import.meta.env.BASE_URL} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Urban />
    </BrowserRouter>

  </StrictMode>
);
