// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import AuthProvider from './contexts/AuthContext.tsx';
import { AccountsProvider } from './contexts/AccountsContext.tsx';
import { AppMuiThemeProvider } from './contexts/ThemeContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AppMuiThemeProvider>
        <AccountsProvider>
          <App />
        </AccountsProvider>
      </AppMuiThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
);
