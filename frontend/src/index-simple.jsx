// frontend/src/index-simple.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SimplePage from './pages/SimplePage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<SimplePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);