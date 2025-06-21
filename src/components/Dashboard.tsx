// src/components/Dashboard.tsx
import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme as useMuiTheme } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import HomePage from '../pages/HomePage';
import ExplorePage from '../pages/ExplorePage';
import LibraryPage from '../pages/LibraryPage';
import SchedulePage from '../pages/SchedulePage';
import AccountsPage from '../pages/AccountsPage';
import InboxPage from '../pages/InboxPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import ProfileSettings from '../pages/ProfileSettingsPage';

const Dashboard: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeModule, setActiveModule] = useState('accounts');

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
      case 'accounts': return <AccountsPage />;
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
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
          {renderActivePage()}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
