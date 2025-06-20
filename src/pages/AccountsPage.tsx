// src/pages/AccountsPage.tsx
import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import AccountManager from '../components/AccountManager';

const AccountsPage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manage Social Accounts
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Connect or disconnect your social media profiles.
        </Typography>
        <AccountManager />
      </Box>
    </Container>
  );
};

export default AccountsPage;