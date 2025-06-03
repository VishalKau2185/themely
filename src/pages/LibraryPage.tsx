// src/pages/LibraryPage.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const LibraryPage: React.FC = () => (
  <Box sx={{ flexGrow: 1, p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 3, overflowY: 'auto' }}>
    <Typography variant="h4" component="h2" gutterBottom>
      Content Library
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Manage your saved posts and uploaded media here.
    </Typography>
    {/* Content for Library module will go here */}
  </Box>
);

export default LibraryPage;