// src/App.tsx
import React from 'react';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './components/Dashboard';
import { CircularProgress, Box } from '@mui/material';

const App: React.FC = () => {
  const { session, isLoading } = useAuth();

  // Show a loading spinner while the initial auth check is happening
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // After loading, show the Dashboard for logged-in users, or the AuthPage for others
  return session ? <Dashboard /> : <AuthPage />;
};

export default App;
