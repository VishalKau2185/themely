// src/pages/ProfileSettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  AlertTitle,
  Container
} from "@mui/material";

// --- THIS IS THE CRITICAL FIX ---
// Import useAuth from its new, correct location in the AuthContext file.
import { useAuth } from "../contexts/AuthContext";

// These imports were already correct
import { fetchProfile, upsertProfile } from "../services/profileService";

const CenterSpin = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, minHeight: '80vh' }}>
    <CircularProgress size={60} />
  </Box>
);

const ProfileSettings: React.FC = () => {
  const { user } = useAuth(); // This will now work correctly
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getProfile();
    }
  }, [user]);

  const getProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const profileData = await fetchProfile(user.id);
      if (profileData) {
        setUsername(profileData.username || '');
        setWebsite(profileData.website || '');
        setAvatarUrl(profileData.avatar_url || '');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await upsertProfile({ id: user.id, username, website, avatar_url: avatarUrl });
      setSuccess("Profile updated successfully!");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) {
      return;
    }

    try {
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // We get the public URL from Supabase storage
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      if (data) {
        setAvatarUrl(data.publicUrl);
        await upsertProfile({ id: user.id, avatar_url: data.publicUrl });
      }

    } catch (error: any) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading && !error) {
    return <CenterSpin />;
  }

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={handleUpdateProfile} sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Your Profile</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}><AlertTitle>Error</AlertTitle>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}><AlertTitle>Success</AlertTitle>{success}</Alert>}
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar src={avatarUrl} sx={{ width: 80, height: 80, mr: 2 }} />
          <Button variant="contained" component="label" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Avatar'}
            <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
          </Button>
        </Box>

        <TextField
          label="Email"
          value={user?.email || ''}
          fullWidth
          disabled
          sx={{ mb: 2 }}
        />
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          fullWidth
          type="url"
          sx={{ mb: 2 }}
        />
        
        <Button type="submit" variant="contained" fullWidth disabled={loading}>
          {loading ? 'Saving...' : 'Update Profile'}
        </Button>
      </Box>
    </Container>
  );
};

export default ProfileSettings;