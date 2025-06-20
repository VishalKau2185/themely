// src/components/AccountManager.tsx
'use client';

import React from 'react';
import { generateUserJwt, deleteSocial } from '../../lib/ayrshare';
import { useAuth } from '../contexts/AuthContext';
import { useAccounts } from '../contexts/AccountsContext'; // <-- USE THE NEW CONTEXT
import { Box, Button, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, IconButton, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const AccountManager: React.FC = () => {
  const { user } = useAuth();
  const { profiles, isLoading, error, refetchProfiles } = useAccounts(); // <-- GET DATA FROM CONTEXT

  const handleConnect = async () => {
    if (!user) return;
    const { jwt } = await generateUserJwt(user.id);
    const ayrshareConnectUrl = `https://app.ayrshare.com/social-link?jwt=${jwt}`;
    window.open(ayrshareConnectUrl, 'ayrshare-connect', 'width=800,height=600');
  };

  const handleDelete = async (profileKey: string) => {
    if (!user) return;
    const { jwt } = await generateUserJwt(user.id);
    await deleteSocial(jwt, [profileKey]);
    refetchProfiles(); // Re-fetch profiles after deleting
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Button variant="contained" onClick={handleConnect} sx={{ mb: 3 }}>
        Connect a New Social Account
      </Button>
      <Typography variant="h6">Connected Accounts:</Typography>
      {profiles.length > 0 ? (
        <List>
          {profiles.map((p) => (
            <ListItem key={p.profileKey} secondaryAction={
              <IconButton onClick={() => handleDelete(p.profileKey)}><DeleteIcon /></IconButton>
            }>
              <ListItemAvatar><Avatar src={p.profilePicture} /></ListItemAvatar>
              <ListItemText primary={p.title} secondary={p.platform} />
            </ListItem>
          ))}
        </List>
      ) : ( <Typography>No accounts connected yet.</Typography> )}
    </Box>
  );
};

export default AccountManager;