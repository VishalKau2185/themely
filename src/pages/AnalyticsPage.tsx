// src/pages/AnalyticsPage.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const AnalyticsPage: React.FC = () => (
  <Box sx={{ flexGrow: 1, p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 3, overflowY: 'auto' }}>
    <Typography variant="h4" component="h2" gutterBottom>
      Performance Analytics
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Gain insights into your page performance and track competitors.
    </Typography>
    {/* Content for Analytics module will go here */}
  </Box>
);

export default AnalyticsPage;