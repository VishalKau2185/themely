// src/components/Sidebar.tsx
import React from 'react';
import {
  Box,
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
  CalendarMonth as CalendarIcon,
  Mail as MailIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';

interface SidebarProps {
  drawerOpen: boolean;
  handleDrawerToggle: () => void;
  activeModule: string;
  setActiveModule: (module: string) => void;
  userId: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ drawerOpen, handleDrawerToggle, activeModule, setActiveModule, userId }) => {
  const navItems = [
    { name: 'Home', icon: HomeIcon, route: 'home' },
    { name: 'Explore', icon: SearchIcon, route: 'explore' },
    { name: 'Library', icon: BookmarkIcon, route: 'library' },
    { name: 'Scheduler', icon: CalendarIcon, route: 'scheduler' },
    { name: 'Inbox', icon: MailIcon, route: 'inbox' },
    { name: 'Analytics', icon: BarChartIcon, route: 'analytics' },
  ];

  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const drawerWidth = 240;
  const collapsedWidth = 56;

  const drawerContent = (
    <Box sx={{ width: drawerOpen ? drawerWidth : collapsedWidth, overflowX: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo and Toggle */}
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: drawerOpen ? 'flex-start' : 'center', py: 2 }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          edge="start"
          sx={{ mr: drawerOpen ? 1 : 0, color: muiTheme.palette.primary.light }}
        >
          <MenuIcon />
        </IconButton>
        {drawerOpen && (
          <Typography variant="h6" noWrap component="div" sx={{ color: muiTheme.palette.primary.light, fontWeight: 'bold' }}>
            Themely
          </Typography>
        )}
      </Toolbar>

      {/* Navigation Items */}
      <List sx={{ px: 1, flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.route} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={activeModule === item.route}
              onClick={() => setActiveModule(item.route)}
              sx={{
                minHeight: 48,
                justifyContent: drawerOpen ? 'initial' : 'center',
                px: 2.5,
                color: activeModule === item.route ? muiTheme.palette.primary.contrastText : muiTheme.palette.text.primary,
                backgroundColor: activeModule === item.route ? muiTheme.palette.primary.main : 'transparent',
                '&:hover': {
                  backgroundColor: activeModule === item.route ? muiTheme.palette.primary.dark : muiTheme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: drawerOpen ? 3 : 'auto',
                  justifyContent: 'center',
                  color: activeModule === item.route ? muiTheme.palette.primary.contrastText : muiTheme.palette.text.secondary,
                }}
              >
                <item.icon />
              </ListItemIcon>
              {drawerOpen && <ListItemText primary={item.name} sx={{ opacity: drawerOpen ? 1 : 0 }} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Display User ID */}
      <Box sx={{ p: 2, borderTop: `1px solid ${muiTheme.palette.divider}`, mt: 'auto', textAlign: drawerOpen ? 'left' : 'center' }}>
        {drawerOpen && (
          <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
            User ID: {userId || 'Loading...'}
          </Typography>
        )}
        {!drawerOpen && (
          <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
            ID
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: isMobile ? 'auto' : (drawerOpen ? drawerWidth : collapsedWidth),
        flexShrink: { sm: 0 },
        transition: 'width 200ms ease-in-out',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Permanent Drawer for Desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerOpen ? drawerWidth : collapsedWidth,
            [`& .MuiDrawer-paper`]: {
              width: drawerOpen ? drawerWidth : collapsedWidth,
              boxSizing: 'border-box',
              transition: 'width 200ms ease-in-out',
              backgroundColor: muiTheme.palette.background.paper,
              boxShadow: muiTheme.shadows[3],
              m: 1, // Margin around the drawer
              borderRadius: 2, // Rounded corners for the drawer paper
              height: 'calc(100vh - 16px)', // Adjust height for margin
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Temporary Drawer for Mobile */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: muiTheme.palette.background.paper,
              boxShadow: muiTheme.shadows[3],
              borderRadius: '0 8px 8px 0', // Rounded corners for mobile drawer
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;