import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import AlipayQuery from './AlipayQuery';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/alipay" element={<AlipayQuery />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);