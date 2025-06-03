// src/pages/SchedulePage.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const SchedulePage: React.FC = () => (
  <Box sx={{ flexGrow: 1, p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 3, overflowY: 'auto' }}>
    <Typography variant="h4" component="h2" gutterBottom>
      Schedule Posts
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Plan and schedule your social media content.
    </Typography>
    {/* Content for Scheduler module will go here */}
  </Box>
);

export default SchedulePage;