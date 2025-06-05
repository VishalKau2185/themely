// src/App.tsx
import React, { useState, useEffect, ReactNode } from 'react';
import {
  CssBaseline, ThemeProvider as MuiThemeProvider, createTheme,
  Box, Container, Typography, CircularProgress,
  useMediaQuery, useTheme as useMuiTheme, GlobalStyles
} from '@mui/material';

import type { User } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient'; // Ensure this path is correct

import AuthContext from './contexts/AuthContext'; // Ensure this path is correct
import ThemeContext from './contexts/ThemeContext'; // Ensure this path is correct
import useAuth from './hooks/useAuth'; // Ensure this path is correct

// Import your actual pages/components - adjust paths as needed
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage'; // Your main, fully styled ExplorePage
import ExplorePageSimplifiedDebug from './pages/ExplorePageSimplifiedDebug'; // Kept for potential future debugging
import LibraryPage from './pages/LibraryPage';
import SchedulePage from './pages/SchedulePage';
import InboxPage from './pages/InboxPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfileSettings from './pages/ProfileSettingsPage';
import AuthPage from './pages/AuthPage';

// --- DEBUG CONTROL ---
// 0: Normal Full App (using your main ExplorePage)
// 1: ExplorePageSimplifiedDebug ONLY (pure Tailwind test)
// 2: Your main ExplorePage with MUI Theme, NO CssBaseline
// 3: Your main ExplorePage with MUI Theme & CssBaseline, but OUTSIDE full Dashboard layout
// 4: Your main ExplorePage with MUI Theme & CssBaseline, INSIDE a simple MUI Container
const DEBUG_MODE: number = 0; // <--- SET TO 0 FOR NORMAL APP VIEW

/* ------------------------------------------------------------------ */
/* ------------------------- AUTH PROVIDER -------------------------- */
/* ------------------------------------------------------------------ */
const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setAuthReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      if (!isAuthReady) {
        setAuthReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [isAuthReady]);

  return (
    <AuthContext.Provider value={{ currentUser, userId: currentUser?.id ?? null, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};

/* ------------------------------------------------------------------ */
/* ------------------------- THEME PROVIDER (MUI) ------------------- */
/* ------------------------------------------------------------------ */
const AppMuiThemeProvider: React.FC<{ children: React.ReactNode, includeCssBaseline?: boolean }> = ({ children, includeCssBaseline = true }) => {
  const [mode, setMode] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('themely-theme') as 'light' | 'dark') || 'dark'
  );

  const toggleTheme = () =>
    setMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themely-theme', next);
      return next;
    });

  const muiThemeInstance = createTheme({
    palette: {
      mode,
      primary: { main: mode === 'light' ? '#1976d2' : '#90caf9' },
      secondary: { main: mode === 'light' ? '#dc004e' : '#f48fb1' },
      background: {
        default: mode === 'light' ? '#fafafa' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    typography: { fontFamily: 'Inter, sans-serif' },
  });

  return (
    <ThemeContext.Provider value={{ themeMode: mode, toggleTheme }}>
      <MuiThemeProvider theme={muiThemeInstance}>
        {includeCssBaseline && <CssBaseline />}
        <GlobalStyles styles={{
            'html, body, #root': {
                height: '100%', // Crucial for h-full on children
                margin: 0,
                padding: 0,
                display: 'flex', // Make body a flex container
                flexDirection: 'column', // Stack children vertically
            },
            'body': {
                // backgroundColor is handled by CssBaseline based on theme mode
            },
            '#root': { // Ensure root div also expands and is a flex container
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
            }
        }}/>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

/* ------------------------------------------------------------------ */
/* --------------------------- DASHBOARD ---------------------------- */
/* ------------------------------------------------------------------ */
const Dashboard: React.FC<{ pageToRender?: ReactNode }> = ({ pageToRender }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [active, setActive] = useState('explore');

  const { currentUser, userId } = useAuth();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const userName = currentUser?.is_anonymous
    ? 'Guest'
    : (currentUser?.user_metadata?.full_name || currentUser?.email || 'User');

  const renderActivePage = () => {
    // When DEBUG_MODE is 0, pageToRender will be undefined here,
    // so the switch statement will be used.
    if (pageToRender && DEBUG_MODE !== 0) return pageToRender;

    switch (active) {
      case 'home': return <HomePage userName={userName} />;
      case 'explore': return <ExplorePage />; // Use the main ExplorePage
      case 'library': return <LibraryPage />;
      case 'scheduler': return <SchedulePage />;
      case 'inbox': return <InboxPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'profile-settings': return <ProfileSettings />;
      default: return <ExplorePage />;
    }
  };

  return (
    // Ensure Dashboard itself fills the space given by Root (which is flex-grow: 1)
    <Box sx={{ display: 'flex', flexGrow: 1, height: '100%', overflow: 'hidden' /* Prevent double scrollbars on Dashboard level */ }}>
      <Sidebar
        drawerOpen={drawerOpen}
        handleDrawerToggle={() => setDrawerOpen(!drawerOpen)}
        activeModule={active}
        setActiveModule={setActive}
        userId={userId}
      />
      {/* Main content area beside sidebar */}
      <Box component="main" sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        // Width calculation remains the same
        width: { sm: `calc(100% - ${drawerOpen && !isMobile ? 240 : isMobile ? 0 : muiTheme.spacing(7)}px)` },
        transition: muiTheme.transitions.create('width', {
            easing: muiTheme.transitions.easing.sharp,
            duration: muiTheme.transitions.duration.leavingScreen,
        }),
        height: '100%', // Ensure this main area also tries to take full height
        overflow: 'hidden', // Let the child (PageWrapper) handle its own scrolling
      }}>
        <Header
          drawerOpen={drawerOpen}
          handleDrawerToggle={() => setDrawerOpen(!drawerOpen)}
          onBellClick={() => console.log('🔔')}
          onProfileClick={() => setActive('profile-settings')}
        />
        {/* Page Wrapper: This Box should allow ExplorePage to use its h-full and internal scrolling */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',       // Make it a flex container
            flexDirection: 'column', // Stack children vertically
            position: 'relative',    // For potential absolute positioned children in pages
            overflow: 'hidden',      // Important: Let the *page itself* (ExplorePage) handle scrolling
                                     // This prevents double scrollbars if ExplorePage has overflow-y-auto
          }}
        >
          {/* The rendered page (e.g., ExplorePage) should now be able to use h-full
              because its parent (this Box) is a flex item that grows and has a direction.
              ExplorePage's internal `overflow-y-auto` should now work. */}
          {renderActivePage()}
        </Box>
      </Box>
    </Box>
  );
};

/* ------------------------------------------------------------------ */
/* ----------------------------- GATE ------------------------------- */
/* ------------------------------------------------------------------ */
const Gate: React.FC<{ pageToRender?: ReactNode }> = ({ pageToRender }) => {
  const { currentUser, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow:1 }}>
        <CircularProgress size={60} />
        <Typography sx={{ mt: 2 }} variant="h6">Loading Themely…</Typography>
      </Box>
    );
  }
  // Pass pageToRender down to Dashboard if in a specific debug mode
  return currentUser ? <Dashboard pageToRender={pageToRender} /> : <AuthPage />;
};

/* ------------------------------------------------------------------ */
/* ----------------------- DEBUG RENDER LOGIC ----------------------- */
/* ------------------------------------------------------------------ */
const DebugAppContent: React.FC = () => {
  const { isAuthReady } = useAuth();

  // Render specific page based on DEBUG_MODE
  // Note: ExplorePage (main one) is used for modes 2, 3, 4
  // ExplorePageSimplifiedDebug is only for mode 1
  let pageElement: ReactNode = null;
  let muiThemeProviderProps: { includeCssBaseline: boolean } = { includeCssBaseline: true };

  switch (DEBUG_MODE) {
    case 1:
      console.log("DEBUG_MODE 1: Rendering ExplorePageSimplifiedDebug in isolation");
      // Mode 1 bypasses MUI ThemeProvider for pure Tailwind test
      return <ExplorePageSimplifiedDebug />;
    case 2:
      console.log("DEBUG_MODE 2: Your main ExplorePage with MUI Theme, NO CssBaseline");
      pageElement = <ExplorePage />;
      muiThemeProviderProps = { includeCssBaseline: false };
      break;
    case 3:
      console.log("DEBUG_MODE 3: Your main ExplorePage with MUI Theme & CssBaseline, OUTSIDE Dashboard");
      pageElement = <ExplorePage />;
      muiThemeProviderProps = { includeCssBaseline: true };
      break;
    case 4:
      console.log("DEBUG_MODE 4: Your main ExplorePage with MUI Theme & CssBaseline, in simple MUI Container");
      pageElement = (
        <Container maxWidth={false} sx={{p:0, flexGrow:1, display: 'flex', flexDirection: 'column'}}>
          <ExplorePage />
        </Container>
      );
      muiThemeProviderProps = { includeCssBaseline: true };
      break;
    case 0:
    default:
      console.log("DEBUG_MODE 0: Rendering Full Application via Gate");
      // Gate will handle rendering the Dashboard which renders ExplorePage by default
      pageElement = <Gate />;
      muiThemeProviderProps = { includeCssBaseline: true };
      break;
  }

  // For modes other than 1, ensure auth is ready if not rendering Gate directly
  if (DEBUG_MODE !== 1 && DEBUG_MODE !== 0 && !isAuthReady) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
        <CircularProgress size={60} /> <Typography sx={{ mt: 2 }} variant="h6">Loading Auth for Debug...</Typography>
      </Box>
    );
  }
  
  return (
    <AppMuiThemeProvider {...muiThemeProviderProps}>
      {pageElement}
    </AppMuiThemeProvider>
  );
};

/* ------------------------------------------------------------------ */
/* ------------------------------ ROOT ------------------------------ */
/* ------------------------------------------------------------------ */
const Root: React.FC = () => (
  <AuthProvider>
    <DebugAppContent />
  </AuthProvider>
);

export default Root;
