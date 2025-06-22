// src/contexts/AccountsContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { generateUserJwt, getProfiles } from '../../lib/ayrshare';

interface SocialProfile {
  profileKey: string;
  title: string;
  platform: string;
  profilePicture: string;
}

interface AccountsContextType {
  profiles: SocialProfile[];
  isLoading: boolean;
  error: string | null;
  refetchProfiles: () => void;
}

const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

export const AccountsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<SocialProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    // Crucial check: Ensure user and user.id are available before proceeding.
    // If user or user.id is null/undefined, stop and reset state.
    if (!user?.id) {
      setProfiles([]);
      setIsLoading(false);
      setError(null); // Clear any previous errors if user logs out or id disappears
      console.log('User ID not available, skipping profile fetch.');
      return;
    }

    setIsLoading(true);
    setError(null); // Clear any previous errors before a new attempt

    try {
      // user.id is guaranteed to be a string here due to the check above
      const { jwt } = await generateUserJwt(user.id);
      console.log('Received JWT:', jwt); // Log the JWT for debugging
      const data = await getProfiles(jwt);
      setProfiles(data.profiles || []);
    } catch (err: any) { // Type the error as 'any' or 'unknown' for safer catching
      console.error('Failed to fetch social profiles:', err);

      // Provide a more informative error message if possible
      if (err.message && typeof err.message === 'string') {
        setError(`Failed to fetch social profiles: ${err.message}`);
      } else {
        setError('Failed to fetch social profiles due to an unknown error.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // This effect runs whenever the 'user' object changes.
    // We only want to fetch profiles if the user object has a valid ID.
    if (user?.id) {
      console.log('User ID detected in useEffect, fetching profiles...');
      fetchProfiles();
    } else {
      // If user is null, or user.id is null (e.g., after logout or initial load),
      // reset the state to reflect no profiles and not loading.
      setProfiles([]);
      setIsLoading(false);
      setError(null);
      console.log('User or User ID not available in useEffect, resetting state.');
    }
  }, [user]); // Dependency array: re-run effect when 'user' object changes

  return (
    <AccountsContext.Provider value={{ profiles, isLoading, error, refetchProfiles: fetchProfiles }}>
      {children}
    </AccountsContext.Provider>
  );
};

export const useAccounts = () => {
  const context = useContext(AccountsContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountsProvider');
  }
  return context;
};