// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import AuthProvider from './contexts/AuthContext.tsx';
import { AccountsProvider } from './contexts/AccountsContext.tsx';
import { AppMuiThemeProvider } from './contexts/ThemeContext.tsx'; // Import the Theme Provider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Wrap the entire app in the AuthProvider */}
    <AuthProvider>
      {/* Then wrap it in the ThemeProvider */}
      <AppMuiThemeProvider>
        {/* Then wrap it in the AccountsProvider */}
        <AccountsProvider>
          {/* Finally, render the App */}
          <App />
        </AccountsProvider>
      </AppMuiThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
);
