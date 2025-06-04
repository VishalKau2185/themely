// src/App.tsx
import React, { useState, useEffect, ReactNode } from 'react';
import {
  CssBaseline, ThemeProvider as MuiThemeProvider, createTheme,
  Box, Container, Typography, CircularProgress,
  useMediaQuery, useTheme as useMuiTheme,
} from '@mui/material';

import type { User } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
// Removed createProfile, getProfile from dbService as they are now handled by useProfile hook
// Removed upsertProfile from profileService as it's now called within useProfile hook

import AuthContext from './contexts/AuthContext';
import ThemeContext from './contexts/ThemeContext';
import useAuth from './hooks/useAuth';
import useTheme from './hooks/useTheme';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import LibraryPage from './pages/LibraryPage';
import SchedulePage from './pages/SchedulePage';
import InboxPage from './pages/InboxPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfileSettings from './pages/ProfileSettingsPage';
import AuthPage from './pages/AuthPage';

/* ------------------------------------------------------------------ */
/* ------------------------- AUTH PROVIDER -------------------------- */
/* ------------------------------------------------------------------ */
const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setAuthReady] = useState(false);

  useEffect(() => {
    /* real-time listener – fires INITIAL_SESSION instantly */
    // This listener is the single source of truth for auth state.
    // It will fire immediately on component mount with the current session.
    const sub = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);

      // Set auth ready after the very first event (INITIAL_SESSION or SIGNED_IN).
      // This ensures the loading screen is dismissed as soon as auth state is known.
      if (!isAuthReady) { // Check if not already ready to avoid re-setting
        setAuthReady(true); // 🔑 unblock UI
      }

      // Profile ensuring logic is now handled by the useProfile hook,
      // which will react to currentUser changes.
    }).data.subscription;

    // Cleanup function: Unsubscribe from auth state changes when the component unmounts
    return () => sub.unsubscribe();
  }, [isAuthReady]); // isAuthReady as dependency ensures the effect itself doesn't re-run unnecessarily,
                     // but the core logic is driven by onAuthStateChange.

  return (
    <AuthContext.Provider
      value={{ currentUser, userId: currentUser?.id ?? null, isAuthReady }}
    >
      {children}
    </AuthContext.Provider>
  );
};


/* ------------------------------------------------------------------ */
/* ------------------------- THEME PROVIDER ------------------------- */
/* ------------------------------------------------------------------ */
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('themely-theme') as 'light' | 'dark') || 'light'
  );

  const toggleTheme = () =>
    setMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themely-theme', next);
      return next;
    });

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: '#3f51b5' },
      secondary: { main: '#f50057' },
      background: {
        default: mode === 'light' ? '#f4f6f8' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    typography: { fontFamily: 'Inter, sans-serif' },
  });

  return (
    <ThemeContext.Provider value={{ themeMode: mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

/* ------------------------------------------------------------------ */
/* --------------------------- DASHBOARD ---------------------------- */
/* ------------------------------------------------------------------ */
const Dashboard: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [active, setActive] = useState('home'); // Default to 'home'

  const { currentUser, userId } = useAuth();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const userName = currentUser?.is_anonymous
    ? 'Guest'
    : (currentUser?.user_metadata?.full_name || currentUser?.email || 'User');

  return (
    <Box sx={{ display:'flex', minHeight:'100vh', bgcolor:muiTheme.palette.background.default }}>
      <Sidebar
        drawerOpen={drawerOpen}
        handleDrawerToggle={() => setDrawerOpen(!drawerOpen)}
        activeModule={active}
        setActiveModule={setActive}
        userId={userId}
      />
      <Box component="main" sx={{
        flexGrow:1, display:'flex', flexDirection:'column',
        width:{ sm:`calc(100% - ${drawerOpen && !isMobile ? 240 : isMobile ? 0 : muiTheme.spacing(7)}px)` },
        transition:'width .2s',
      }}>
        <Header
          drawerOpen={drawerOpen}
          handleDrawerToggle={() => setDrawerOpen(!drawerOpen)}
          onBellClick={() => console.log('🔔')}
          onProfileClick={() => setActive('profile-settings')}
        />
        <Container maxWidth={false} sx={{ flexGrow:1, py:2, px:1, display:'flex', flexDirection:'column' }}>
          {active==='home' && <HomePage userName={userName} />}
          {active==='explore' && <ExplorePage />}
          {active==='library' && <LibraryPage />}
          {active==='scheduler' && <SchedulePage />}
          {active==='inbox' && <InboxPage />}
          {active==='analytics' && <AnalyticsPage />}
          {active==='profile-settings' && <ProfileSettings />}
        </Container>
      </Box>
    </Box>
  );
};

/* ------------------------------------------------------------------ */
/* ----------------------------- GATE ------------------------------- */
/* ------------------------------------------------------------------ */
const Gate: React.FC = () => {
  const { currentUser, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh'
      }}>
        <CircularProgress size={60} />
        <Typography sx={{ mt: 2 }} variant="h6">Loading Themely…</Typography>
      </Box>
    );
  }
  return currentUser ? <Dashboard/> : <AuthPage/>;
};

/* ------------------------------------------------------------------ */
/* ------------------------------ ROOT ------------------------------ */
/* ------------------------------------------------------------------ */
const Root: React.FC = () => (
  <AuthProvider>
    <ThemeProvider>
      <Gate />
    </ThemeProvider>
  </AuthProvider>
);

export default Root;