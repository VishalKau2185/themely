// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './App'; // Import Root component from App.tsx
import './index.css'; // Your global CSS for fonts etc.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);