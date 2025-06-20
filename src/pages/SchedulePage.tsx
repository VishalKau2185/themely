// app/(pages)/scheduler/page.tsx
'use client'; // Required because we are using a component that has state.

import React from 'react';
import { Box, Typography } from '@mui/material';
import SchedulerForm from '../components/SchedulerForm'; // Import the form component

const SchedulePage: React.FC = () => (
  <Box sx={{ flexGrow: 1, p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 3, overflowY: 'auto' }}>
    <Typography variant="h4" component="h2" gutterBottom>
      Schedule Posts
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
      Plan and schedule your social media content.
    </Typography>
    
    {/* The functional Scheduler Form is now placed here */}
    <SchedulerForm />
  </Box>
);

export default SchedulePage;