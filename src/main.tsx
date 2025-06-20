// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import AuthProvider from './contexts/AuthContext.tsx'; // Corrected: default import
import { AccountsProvider } from './contexts/AccountsContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AccountsProvider>
        <App />
      </AccountsProvider>
    </AuthProvider>
  </React.StrictMode>,
);