// src/pages/InboxPage.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const InboxPage: React.FC = () => (
  <Box sx={{ flexGrow: 1, p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 3, overflowY: 'auto' }}>
    <Typography variant="h4" component="h2" gutterBottom>
      Unified Inbox
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Reply to DMs and comments from all your linked accounts.
    </Typography>
    {/* Content for Inbox module will go here */}
  </Box>
);

export default InboxPage;