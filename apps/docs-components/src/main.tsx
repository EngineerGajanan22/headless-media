import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../../demo-web/src/App.css'; // Leverage original design styles (strictly read-only)
import './index.css';                 // Docs-specific styles

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
