// src/hooks/useProfile.ts
import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js/src/lib/types';
import { fetchProfile, upsertProfile } from '../services/profileService'; // Import Profile type and functions
import type { Profile } from '../services/profileService';
import useAuth from './useAuth'; // Import useAuth hook

interface UseProfileResult {
  profile: Profile | null;
  profileLoading: boolean;
  profileError: string | null;
  refreshProfile: () => Promise<void>; // Function to manually refresh profile
}

const useProfile = (): UseProfileResult => {
  const { currentUser, isAuthReady } = useAuth(); // Get auth state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Function to fetch/ensure profile, made refreshable
  const loadAndEnsureProfile = async () => {
    console.log("useProfile: loadAndEnsureProfile triggered. isAuthReady:", isAuthReady, "currentUser:", currentUser?.id);
    if (!isAuthReady || !currentUser) {
      // If auth not ready or no user, we can't fetch.
      // This state will be handled by the parent Gate component.
      setProfileLoading(false); // Ensure loading is false if no user
      setProfile(null);
      return;
    }

    setProfileLoading(true);
    setProfileError(null);
    try {
      // 1. Fetch existing profile
      const [existingProfile, getError] = await fetchProfile(currentUser.id);
      if (getError) {
        console.error('useProfile: Error fetching profile:', getError.message);
        setProfileError('Failed to load profile: ' + getError.message);
        setProfile(null);
        return;
      }

      let currentProfile = existingProfile;

      // 2. If profile doesn't exist, create it via upsert
      if (!existingProfile) {
        console.log('useProfile: Profile not found, attempting auto-creation for', currentUser.id);
        const [newProfile, upsertError] = await upsertProfile(
          currentUser.id,
          currentUser.email ?? null,
          currentUser.user_metadata?.full_name ?? null // Pass full_name from auth metadata
        );
        if (upsertError) {
          console.error('useProfile: Error auto-creating profile:', upsertError.message);
          setProfileError('Failed to auto-create profile: ' + upsertError.message);
          setProfile(null);
          return;
        }
        console.log('useProfile: Profile auto-created successfully for', currentUser.id);
        currentProfile = newProfile;
      }

      // 3. Set the profile state
      setProfile(currentProfile);
    } catch (e: any) {
      console.error('useProfile: Unexpected error in loadAndEnsureProfile:', e.message);
      setProfileError('An unexpected error occurred: ' + e.message);
      setProfile(null);
    } finally {
      setProfileLoading(false);
      console.log('useProfile: Profile loading/ensuring finished.');
    }
  };

  useEffect(() => {
    // This effect runs when isAuthReady or currentUser changes.
    // It triggers the profile load/ensure process.
    loadAndEnsureProfile();
  }, [isAuthReady, currentUser]); // Depend on auth readiness and user object

  // Function to allow external components to trigger a profile refresh
  const refreshProfile = async () => {
    await loadAndEnsureProfile();
  };

  return { profile, profileLoading, profileError, refreshProfile };
};

export default useProfile;