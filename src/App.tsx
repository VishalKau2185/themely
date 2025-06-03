import React, { useState, useEffect, createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js/src/lib/types'; // Import User type
import { supabase } from './services/supabaseClient'; // Import supabase client
import { onAuthStateChange, signInAnonymously } from './services/authService';

// Import components and hooks
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


// MUI Imports
import {
  CssBaseline,
  ThemeProvider as MuiThemeProvider,
  createTheme,
  Box,
  Typography, // Added in previous fix
  Container,  // Added in previous fix
  useMediaQuery,
  useTheme as useMuiTheme, // Rename to avoid conflict with custom useTheme
} from '@mui/material';

// --- Auth Provider Component ---
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Attempt anonymous sign-in if no user is already logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          await signInAnonymously();
        }
      } catch (error) {
        console.error("Supabase authentication error during init:", error);
      }
    };

    // Listen for auth state changes from authService
    const subscription = onAuthStateChange((user) => { // Store the subscription object
      setCurrentUser(user);
      setUserId(user?.id || null); // Supabase user ID is `id`
      setIsAuthReady(true);
      console.log("Current User ID:", user?.id || "No User / Anonymous");
    });

    initAuth(); // Call initAuth to ensure a session exists

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe(); // Cleanup subscription
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userId, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Theme Provider Component ---
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize theme from localStorage or default to 'light'
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('themely-theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  // Create MUI theme based on current mode
  const muiTheme = createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: '#3f51b5', // A shade of blue
      },
      secondary: {
        main: '#f50057', // A shade of pink
      },
      background: {
        default: themeMode === 'light' ? '#f4f6f8' : '#121212',
        paper: themeMode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8, // Apply rounded corners to Paper components
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8, // Apply rounded corners to Buttons
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRadius: '0 8px 8px 0', // Rounded corners for drawer
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderRadius: 8, // Rounded corners for app bar
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8, // Rounded corners for list items
            margin: '4px 0',
          },
        },
      },
    },
  });

  // Toggle theme function
  const toggleTheme = () => {
    setThemeMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themely-theme', newMode);
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline /> {/* Resets CSS to a consistent baseline */}
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// --- Main App Component ---
const App: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeModule, setActiveModule] = useState('home'); // Default active module
  const { currentUser, userId, isAuthReady } = useAuth();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  // Set document title based on active module
  useEffect(() => {
    document.title = `Themely - ${activeModule.charAt(0).toUpperCase() + activeModule.slice(1)}`;
  }, [activeModule]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleBellClick = () => {
    // Implement notification dropdown logic here
    console.log('Notifications clicked!');
  };

  const handleProfileClick = () => {
    // Implement profile menu logic here (e.g., settings, logout)
    console.log('Profile clicked!');
  };

  if (!isAuthReady) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: muiTheme.palette.background.default }}>
        <Typography variant="h5" color="text.primary">Loading Themely...</Typography>
      </Box>
    );
  }

  // Determine user name for greeting (can be fetched from Supabase later)
  const userName = currentUser?.is_anonymous ? 'Guest' : (currentUser?.user_metadata?.full_name || 'User');

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: muiTheme.palette.background.default }}> {/* <--- FIXED SYNTAX HERE */}
      {/* Sidebar */}
      <Sidebar
        drawerOpen={drawerOpen}
        handleDrawerToggle={handleDrawerToggle}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        userId={userId}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0, // Remove default padding as components will have their own
          display: 'flex',
          flexDirection: 'column',
          width: { sm: `calc(100% - ${drawerOpen && !isMobile ? 240 : (isMobile ? 0 : 56)}px)` },
          transition: 'width 200ms ease-in-out',
        }}
      >
        {/* Header */}
        <Header
          handleDrawerToggle={handleDrawerToggle}
          onBellClick={handleBellClick}
          onProfileClick={handleProfileClick}
          drawerOpen={drawerOpen}
        />

        {/* Content based on active module */}
        <Container maxWidth={false} sx={{ flexGrow: 1, py: 0, px: 1, display: 'flex', flexDirection: 'column' }}>
          {activeModule === 'home' && <HomePage userName={userName} />}
          {activeModule === 'explore' && <ExplorePage />}
          {activeModule === 'library' && <LibraryPage />}
          {activeModule === 'scheduler' && <SchedulePage />}
          {activeModule === 'inbox' && <InboxPage />}
          {activeModule === 'analytics' && <AnalyticsPage />}
        </Container>
      </Box>
    </Box>
  );
};

// --- Root Component for Providers ---
const Root: React.FC = () => (
  <AuthProvider>
    <ThemeProvider> {/* Use the custom ThemeProvider here */}
      <App />
    </ThemeProvider>
  </AuthProvider>
);

export default Root;
