// src/pages/ExplorePage.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const ExplorePage: React.FC = () => (
  <Box sx={{ flexGrow: 1, p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 3, overflowY: 'auto' }}>
    <Typography variant="h4" component="h2" gutterBottom>
      Explore Viral Posts
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Find and analyze viral content from various social media platforms.
    </Typography>
    {/* Content for Explore module will go here */}
  </Box>
);

export default ExplorePage;