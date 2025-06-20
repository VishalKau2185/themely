// src/pages/ProfileSettingsPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Paper, TextField, Button,
  Typography, CircularProgress, Alert, AlertTitle,
} from '@mui/material';

import { useAuth } from "../contexts/AuthContext";
import { fetchProfile, upsertProfile } from '../services/profileService';
import type { Profile } from '../services/profileService'; // Import Profile type

// Helper components (can be moved to a common place like src/components/common)
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

const ProfileSettings: React.FC = () => {
  const { currentUser: user, userId, isAuthReady } = useAuth(); // Get auth states from context

  const [profile, setProfile] = useState<Profile | null>(null); // State for the fetched profile object
  const [fullName, setFullName] = useState(''); // State for the full name input field
  // Removed bio, setBio states
  // Removed avatarUrl, setAvatarUrl states

  const [isLoading, setIsLoading] = useState(true); // Manages loading state for fetching profile
  const [isSaving, setIsSaving] = useState(false); // Manages loading state for saving profile
  const [error, setError] = useState<string | null>(null); // Stores error messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Stores success messages

  // Effect to fetch profile data when auth is ready and user is logged in
  useEffect(() => {
    console.log("ProfileSettings: useEffect triggered. isAuthReady:", isAuthReady, "userId:", userId);

    // Reset state when user or auth readiness changes
    setIsLoading(true); // Always show loading when this effect triggers
    setError(null);
    setSuccessMessage(null);
    setProfile(null); // Clear previous profile data (important on re-auth/user change)
    setFullName(''); // Clear fields
    // Removed setBio('');
    // Removed setAvatarUrl('');

    // Only proceed with fetching if authentication is ready AND user is logged in
    if (!isAuthReady || !userId) {
      // If we are waiting for auth, or userId is null (logged out),
      // ensure isLoading is true and return. The parent (Gate) handles the primary loading screen.
      return;
    }

    const loadProfile = async () => {
      console.log("ProfileSettings: Initiating profile fetch for userId:", userId);
      try {
        const [fetchedProfile, fetchError] = await fetchProfile(userId); // Consume tuple
        if (fetchError) {
          console.error('ProfileSettings: Error fetching profile:', fetchError.message);
          setError('Failed to load profile: ' + fetchError.message);
          setProfile(null); // Clear profile on error
          setFullName(''); // Clear fields on error
          return;
        }
        // If successful, update state
        setProfile(fetchedProfile);
        setFullName(fetchedProfile?.full_name ?? '');
        // Removed setBio(fetchedProfile?.bio ?? '');
        // Removed setAvatarUrl(fetchedProfile?.avatar_url ?? '');
      } catch (e: any) {
        // This catch block should ideally not be hit if profileService returns errors
        console.error('ProfileSettings: Unexpected error during profile fetch:', e.message);
        setError('Unexpected error during load: ' + e.message);
      } finally {
        setIsLoading(false); // Stop loading regardless of success or failure
        console.log("ProfileSettings: Finished profile fetch.");
      }
    };

    loadProfile(); // Execute the fetch
  }, [isAuthReady, userId]); // Re-run when auth status or userId changes

  // Handler for saving profile
  const handleSave = useCallback(async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission

    if (!user) {
      setError('You must be logged in to save your profile.');
      return;
    }

    // Check if anything has actually changed (compare with current profile state)
    const hasChanged = fullName !== (profile?.full_name ?? '');
    // Removed bio/avatarUrl checks

    if (!hasChanged) {
      setSuccessMessage('No changes to save.');
      setTimeout(() => setSuccessMessage(null), 3000); // Clear after 3 seconds
      return;
    }

    try {
      setIsSaving(true); // Start saving spinner
      setError(null); // Clear previous errors
      setSuccessMessage(null); // Clear previous messages

      const [updatedProfile, saveError] = await upsertProfile(
        user.id,
        user.email ?? null,
        fullName
        // Removed bio, avatarUrl parameters
      ); // Consume tuple and pass all fields

      if (saveError) {
        console.error("Error saving profile:", saveError.message);
        setError(saveError.message || 'Failed to save profile. Please try again.');
        return;
      }

      setProfile(updatedProfile); // <--- FIX: This line needs setProfile to be in dependencies
      setSuccessMessage('Profile saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000); // Clear after 3 seconds
    } catch (e: any) {
      console.error("ProfileSettings: Unexpected error during save:", e.message);
      setError('Error occurred during save: ' + e.message);
    } finally {
      setIsSaving(false); // Stop saving spinner
    }
  }, [user, fullName, profile, setProfile]); // <--- FIX: Added setProfile to dependency array

  // UI branches for different states
  // 1️⃣ Global auth not ready: Show global spinner (handled by Gate)
  if (!isAuthReady) {
    console.log("ProfileSettings: Rendering global loading due to !isAuthReady (should be handled by parent Gate).");
    return <CenterSpin />;
  }

  // 2️⃣ Auth ready but no user: Session expired or logged out.
  if (!user) {
    console.log("ProfileSettings: Rendering 'You need to be logged in' due to !user.");
    return <ErrorDisplay text="You need to be logged in to access profile settings." />;
  }

  // 3️⃣ Profile-specific loading: Auth is ready and user exists, but profile data is still loading.
  if (isLoading) {
    console.log("ProfileSettings: Rendering profile-specific loading spinner.");
    return <CenterSpin />;
  }

  // 4️⃣ If there was an error loading the profile initially, display it.
  if (error && !profile) { // Only show error if profile couldn't be loaded at all
    console.log("ProfileSettings: Rendering error display due to initial load error.");
    return <ErrorDisplay text={error} />;
  }

  // 5️⃣ Normal editable form: All data loaded, ready for interaction.
  console.log("ProfileSettings: Rendering normal form.");
  return (
    <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
      <Typography variant="h4" gutterBottom>Profile Settings</Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSave}> {/* Use a form element */}
          <TextField label="Email" value={user.email ?? ''} fullWidth margin="normal" disabled InputProps={{ readOnly: true }} />
          <TextField label="User ID" value={user.id} fullWidth margin="normal" disabled InputProps={{ readOnly: true }} />
          <TextField label="Full name" fullWidth margin="normal"
            value={fullName} onChange={e => setFullName(e.target.value)} disabled={isSaving}
            helperText="This name will be displayed on your public profile." />
          {/* Removed Bio TextField */}
          {/* Removed Avatar URL TextField */}

          <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={isSaving}>
            {isSaving ? <CircularProgress size={22} /> : 'Save Profile'}
          </Button>

          {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </form>
      </Paper>

      {/* -------- SOCIAL PLACEHOLDER -------- */}
      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Linked Social Media Accounts
        </Typography>
        <Typography variant="body2" color="text.secondary">
          (Coming soon: link Instagram, TikTok, YouTube, X…)
        </Typography>
        <Button variant="outlined" sx={{ mt: 2 }}>Link Instagram</Button> {/* Placeholder */}
        <Button variant="outlined" sx={{ mt: 2, ml: 2 }}>Link TikTok</Button> {/* Placeholder */}
      </Paper>
    </Box>
  );
};

export default ProfileSettings;