// src/components/Header.tsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  useMediaQuery,
  useTheme as useMuiTheme,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  // ADD THESE TWO ICONS HERE
  Brightness4 as Brightness4Icon, // <--- ADD THIS LINE
  Brightness7 as Brightness7Icon, // <--- ADD THIS LINE
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon, // This one isn't actually used, but it's fine to keep
} from '@mui/icons-material';
import useTheme from '../hooks/useTheme'; // Import your custom useTheme hook
import { signOut } from '../services/authService'; // Import signOut function

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

  // State for the profile menu anchor element
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openProfileMenu = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await signOut(); // Call the signOut service
    handleProfileMenuClose(); // Close the menu
    // App.tsx's AuthProvider will detect the signed out state and redirect to AuthPage
  };

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
            {themeMode === 'dark' ? <Brightness7Icon sx={{ color: 'yellow' }} /> : <Brightness4Icon sx={{ color: 'purple' }} />}
          </IconButton>
          {/* Notifications */}
          <IconButton onClick={onBellClick} color="inherit">
            <NotificationsIcon />
          </IconButton>
          {/* Profile Avatar */}
          <IconButton
            onClick={handleProfileMenuOpen} // Use new handler
            color="inherit"
            aria-controls={openProfileMenu ? 'profile-menu' : undefined}
            aria-haspopup="true"
          >
            <Avatar sx={{ bgcolor: muiTheme.palette.secondary.main }}>U</Avatar> {/* Placeholder for user initial/avatar */}
          </IconButton>
          {/* Profile Menu */}
          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            open={openProfileMenu}
            onClose={handleProfileMenuClose}
            MenuListProps={{
              'aria-labelledby': 'profile-button',
            }}
          >
            <MenuItem onClick={onProfileClick}>Profile Settings</MenuItem> {/* Keep original click handler */}
            <MenuItem onClick={handleLogout}>Logout</MenuItem> {/* New Logout button */}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;