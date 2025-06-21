// src/App.tsx
import React, { useState } from 'react';
import {
  Box,
  useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material';
import { useAuth } from './contexts/AuthContext'; // Using the new, correct hook

// Import your page components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import LibraryPage from './pages/LibraryPage';
import SchedulePage from './pages/SchedulePage';
import AccountsPage from './pages/AccountsPage';
import InboxPage from './pages/InboxPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfileSettings from './pages/ProfileSettingsPage';
import AuthPage from './pages/AuthPage';

/* ------------------------------------------------------------------ */
/* --------------------------- DASHBOARD ---------------------------- */
/* ------------------------------------------------------------------ */
const Dashboard: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeModule, setActiveModule] = useState('accounts'); // Default to 'accounts'

  // This now correctly uses the robust useAuth hook
  const { user } = useAuth();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const userName = user?.user_metadata?.full_name || user?.email || 'User';

  const renderActivePage = () => {
    switch (activeModule) {
      case 'home': return <HomePage userName={userName} />;
      case 'explore': return <ExplorePage />;
      case 'library': return <LibraryPage />;
      case 'scheduler': return <SchedulePage />;
      case 'accounts': return <AccountsPage />; // Added the new Accounts page
      case 'inbox': return <InboxPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'profile-settings': return <ProfileSettings />;
      default: return <AccountsPage />;
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        drawerOpen={drawerOpen}
        handleDrawerToggle={() => setDrawerOpen(!drawerOpen)}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        userId={user?.id ?? null}
      />
      <Box component="main" sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}>
        <Header
          drawerOpen={drawerOpen}
          handleDrawerToggle={() => setDrawerOpen(!drawerOpen)}
          onBellClick={() => console.log('🔔')}
          onProfileClick={() => setActiveModule('profile-settings')}
        />
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: 3,
          }}
        >
          {renderActivePage()}
        </Box>
      </Box>
    </Box>
  );
};

/* ------------------------------------------------------------------ */
/* ---------------------- MAIN APP COMPONENT ------------------------ */
/* ------------------------------------------------------------------ */
// This is the main gatekeeper component
const App: React.FC = () => {
  const { session, isLoading } = useAuth();

  // --- DEBUG LOGS ADDED ---
  console.log('Auth Loading:', isLoading);
  console.log('Auth Session:', session);
  
  if (isLoading) {
    console.log('App State: Loading...');
    // We can return a loading indicator here if we want, but for now, null is fine for debugging.
    return null; 
  }

  if (session) {
    console.log('App State: Rendering Dashboard');
    return <Dashboard />;
  } else {
    console.log('App State: Rendering AuthPage');
    return <AuthPage />;
  }
};

export default App;