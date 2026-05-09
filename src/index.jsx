import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootEl = document.getElementById('root');

// Pastikan elemen root ada
if (!rootEl) {
  document.body.innerHTML = '<div style="padding:2rem;font-family:sans-serif;color:red">Error: element #root tidak ditemukan.</div>';
} else {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
