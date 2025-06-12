import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Paper, TextField, Button,
  Typography, CircularProgress, Alert, AlertTitle,
} from '@mui/material';

import useAuth from '../hooks/useAuth';
import { fetchProfile, upsertProfile } from '../services/profileService';
// TODO: When ready, add `tiktok_username?: string;` to your Profile type definition
import type { Profile } from '../services/profileService';

// Helper components
const CenterSpin: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, minHeight: '80vh' }}>
    <CircularProgress size={60} />
  </Box>
);

const ErrorDisplay: React.FC<{ text: string }> = ({ text }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, minHeight: '80vh' }}>
    <Alert severity="error">
      <AlertTitle>Error</AlertTitle>
      {text}
    </Alert>
  </Box>
);

// ====================================================================
// == PKCE HELPER FUNCTIONS for TIKTOK ==
// ====================================================================

// Helper to generate a random string for the verifier
function generateRandomString(length: number): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Helper to create the SHA-256 hash and then Base64-URL-encode it
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  
  // Base64-URL encode
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
// ====================================================================


const ProfileSettings: React.FC = () => {
  const { currentUser: user, userId, isAuthReady } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [tikTokUsername, setTikTokUsername] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    console.log("ProfileSettings: useEffect triggered. isAuthReady:", isAuthReady, "userId:", userId);

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setProfile(null);
    setFullName('');
    setTikTokUsername('');

    if (!isAuthReady || !userId) {
      return;
    }

    const loadProfile = async () => {
      console.log("ProfileSettings: Initiating profile fetch for userId:", userId);
      try {
        const [fetchedProfile, fetchError] = await fetchProfile(userId);
        if (fetchError) {
          console.error('ProfileSettings: Error fetching profile:', fetchError.message);
          setError('Failed to load profile: ' + fetchError.message);
          return;
        }
        setProfile(fetchedProfile);
        setFullName(fetchedProfile?.full_name ?? '');
        setTikTokUsername((fetchedProfile as any)?.tiktok_username ?? '');
      } catch (e: any) {
        console.error('ProfileSettings: Unexpected error during profile fetch:', e.message);
        setError('Unexpected error during load: ' + e.message);
      } finally {
        setIsLoading(false);
        console.log("ProfileSettings: Finished profile fetch.");
      }
    };

    loadProfile();
  }, [isAuthReady, userId]);

  const handleSave = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      setError('You must be logged in to save your profile.');
      return;
    }

    const hasChanged = fullName !== (profile?.full_name ?? '');

    if (!hasChanged) {
      setSuccessMessage('No changes to save.');
      setTimeout(() => setSuccessMessage(null), 3000);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const [updatedProfile, saveError] = await upsertProfile(
        user.id,
        user.email ?? null,
        fullName
      );

      if (saveError) {
        console.error("Error saving profile:", saveError.message);
        setError(saveError.message || 'Failed to save profile. Please try again.');
        return;
      }

      setProfile(updatedProfile);
      setSuccessMessage('Profile saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      console.error("ProfileSettings: Unexpected error during save:", e.message);
      setError('Error occurred during save: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  }, [user, fullName, profile]);

  // ====================================================================
  // == UPDATED ASYNC TIKTOK FUNCTION with PKCE ==
  // ====================================================================
  const handleLinkTikTok = async () => {
    try {
      // 1. Create a secret code_verifier
      const codeVerifier = generateRandomString(128);
      // 2. Create the code_challenge from the verifier
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // 3. Store the secret code_verifier in localStorage.
      // We will need this later in the backend to exchange the code for a token.
      localStorage.setItem('tiktok_code_verifier', codeVerifier);

      // Use your SANDBOX Client Key
      const TIKTOK_CLIENT_KEY = 'sbawqjnh6t6lr36w0f'; // <-- PASTE YOUR KEY!

      // Use the localhost Redirect URI
      const REDIRECT_URI = 'http://localhost:5173/api/tiktok/callback';

      // Generate a 'state' string for security
      const csrfState = Math.random().toString(36).substring(2);
      localStorage.setItem('tiktok_csrf_state', csrfState);

      // 4. Construct the URL with the new PKCE parameters
      let url = 'https://www.tiktok.com/v2/auth/authorize/';
      url += `?client_key=${TIKTOK_CLIENT_KEY}`;
      url += '&scope=user.info.basic';
      url += '&response_type=code';
      url += `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
      url += `&state=${csrfState}`;
      url += `&code_challenge=${codeChallenge}`; // <-- NEW
      url += '&code_challenge_method=S256';     // <-- NEW

      // 5. Redirect the browser to TikTok
      console.log('Redirecting to TikTok with PKCE...');
      window.location.href = url;
    } catch (error) {
        console.error("Failed to generate PKCE challenge or redirect.", error);
        setError("Could not initiate TikTok login. Please try again.");
    }
  };
  // ====================================================================

  if (!isAuthReady) {
    return <CenterSpin />;
  }

  if (!user) {
    return <ErrorDisplay text="You need to be logged in to access profile settings." />;
  }

  if (isLoading) {
    return <CenterSpin />;
  }

  if (error && !profile) {
    return <ErrorDisplay text={error} />;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
      <Typography variant="h4" gutterBottom>Profile Settings</Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSave}>
          <TextField label="Email" value={user.email ?? ''} fullWidth margin="normal" disabled InputProps={{ readOnly: true }} />
          <TextField label="User ID" value={user.id} fullWidth margin="normal" disabled InputProps={{ readOnly: true }} />
          <TextField label="Full name" fullWidth margin="normal"
            value={fullName} onChange={e => setFullName(e.target.value)} disabled={isSaving}
            helperText="This name will be displayed on your public profile." />

          <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={isSaving}>
            {isSaving ? <CircularProgress size={22} /> : 'Save Profile'}
          </Button>

          {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </form>
      </Paper>

      {/* -------- NEW TIKTOK LINKING SECTION -------- */}
      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Linked Social Media Accounts
        </Typography>

        {tikTokUsername ? (
          <Box>
            <Typography sx={{ mt: 2 }}>
              <strong>TikTok:</strong> Linked as @{tikTokUsername}
            </Typography>
            <Button variant="outlined" color="error" sx={{ mt: 1 }}>Unlink</Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary">
              Connect your social media accounts to complete your profile.
            </Typography>
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={handleLinkTikTok}
            >
              Link TikTok
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ProfileSettings;