// src/components/Header.tsx
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import useTheme from '../hooks/useTheme'; // Import your custom useTheme hook

interface HeaderProps {
  handleDrawerToggle: () => void;
  onBellClick: () => void;
  onProfileClick: () => void;
  drawerOpen: boolean; // Not directly used in Header, but passed from App
}

const Header: React.FC<HeaderProps> = ({ handleDrawerToggle, onBellClick, onProfileClick, drawerOpen }) => {
  const { themeMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        flexGrow: 1,
        mb: 2, // Margin bottom for spacing
        borderRadius: 2, // Rounded corners
        backgroundColor: muiTheme.palette.background.paper,
        boxShadow: muiTheme.shadows[3],
        m: 1, // Margin around the app bar
        width: 'calc(100% - 16px)', // Adjust width for margin
      }}
    >
      <Toolbar>
        {isMobile && ( // Show menu icon only on mobile
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }} /> {/* Spacer */}

        {/* Top-right utility cluster */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Theme Switch */}
          <IconButton onClick={toggleTheme} color="inherit">
            {themeMode === 'dark' ? <LightModeIcon sx={{ color: 'yellow' }} /> : <DarkModeIcon sx={{ color: 'purple' }} />}
          </IconButton>
          {/* Notifications */}
          <IconButton onClick={onBellClick} color="inherit">
            <NotificationsIcon />
          </IconButton>
          {/* Profile Avatar */}
          <IconButton onClick={onProfileClick} color="inherit">
            <Avatar sx={{ bgcolor: muiTheme.palette.secondary.main }}>U</Avatar> {/* Placeholder for user initial/avatar */}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;