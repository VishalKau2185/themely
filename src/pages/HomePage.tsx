// src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Slide, useTheme as useMuiTheme } from '@mui/material';

interface HomePageProps {
  userName: string;
}

const HomePage: React.FC<HomePageProps> = ({ userName }) => {
  const [showGreeting, setShowGreeting] = useState(false);
  const muiTheme = useMuiTheme();

  useEffect(() => {
    const lastGreetingTime = localStorage.getItem('themely-last-greeting');
    const now = new Date();
    const lastTime = lastGreetingTime ? new Date(parseInt(lastGreetingTime)) : null;

    // Show greeting if it's been more than 24 hours or never shown
    if (!lastTime || (now.getTime() - lastTime.getTime()) > (24 * 60 * 60 * 1000)) {
      setShowGreeting(true);
      localStorage.setItem('themely-last-greeting', now.getTime().toString());
    }

    // Auto-dismiss greeting after 1.2s
    const timer = setTimeout(() => {
      setShowGreeting(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const skipGreeting = () => setShowGreeting(false);

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: muiTheme.palette.background.paper, borderRadius: 2, boxShadow: muiTheme.shadows[3], position: 'relative', overflowY: 'auto' }}>
      {showGreeting && (
        <Slide direction="up" in={showGreeting} timeout={500}>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(5px)',
              zIndex: 1000,
              cursor: 'pointer',
              borderRadius: 2,
            }}
            onClick={skipGreeting}
          >
            <Typography variant="h3" component="h2" color="white" sx={{ fontWeight: 'bold' }}>
              Welcome back, {userName}!
            </Typography>
          </Box>
        </Slide>
      )}
      <Typography variant="h4" component="h2" gutterBottom>
        Home Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        This is your main dashboard. Here you'll see quick stats, today's scheduled posts, and other important summaries.
      </Typography>

      {/* Placeholder widgets */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3, mt: 4 }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" component="h3">Today's Posts</Typography>
          <Typography variant="body2" color="text.secondary">0 scheduled posts</Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" component="h3">New Messages</Typography>
          <Typography variant="body2" color="text.secondary">5 unread messages</Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" component="h3">Weekly Views</Typography>
          <Typography variant="body2" color="text.secondary">📈 +15%</Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default HomePage;