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
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import useTheme from '../hooks/useTheme'; // Import your custom useTheme hook
import { signOut } from '../services/authService'; // Import signOut function

interface HeaderProps {
  handleDrawerToggle: () => void;
  onBellClick: () => void;
  onProfileClick: () => void;
  drawerOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ handleDrawerToggle, onBellClick, onProfileClick }) => {
  const { themeMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openProfileMenu = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await signOut();
    handleProfileMenuClose();
  };

  const headerBackgroundColor = themeMode === 'dark' ? muiTheme.palette.grey[900] : muiTheme.palette.grey[100];
  const borderColor = themeMode === 'dark' ? muiTheme.palette.grey[800] : muiTheme.palette.grey[300];

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        backgroundColor: headerBackgroundColor,
        borderBottom: `1px solid ${borderColor}`,
        mb: 0, // Explicitly set margin-bottom to 0
        // Ensure other margins or paddings that could cause external space are not present
        // If this AppBar is a flex item, its flex properties are controlled by its parent in App.tsx
      }}
    >
      <Toolbar sx={{ minHeight: '56px' }}>
        {isMobile && (
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
        <Box sx={{ flexGrow: 1 }} /> {/* Spacer */}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          <IconButton onClick={toggleTheme} color="inherit" title={themeMode === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            {themeMode === 'dark' ? <Brightness7Icon sx={{ color: muiTheme.palette.warning.light }} /> : <Brightness4Icon sx={{ color: muiTheme.palette.primary.main }} />}
          </IconButton>
          <IconButton onClick={onBellClick} color="inherit" title="Notifications">
            <NotificationsIcon />
          </IconButton>
          <IconButton
            onClick={handleProfileMenuOpen}
            color="inherit"
            aria-controls={openProfileMenu ? 'profile-menu' : undefined}
            aria-haspopup="true"
            title="Profile"
          >
            <Avatar sx={{ bgcolor: muiTheme.palette.secondary.main, width: 32, height: 32 }}>U</Avatar>
          </IconButton>
          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            open={openProfileMenu}
            onClose={handleProfileMenuClose}
            MenuListProps={{ 'aria-labelledby': 'profile-button' }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { bgcolor: headerBackgroundColor, border: `1px solid ${borderColor}` }}}}
          >
            <MenuItem onClick={() => { onProfileClick(); handleProfileMenuClose(); }}>Profile Settings</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
