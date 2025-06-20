// src/contexts/AccountsContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext'; // Correctly import from the context file now
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
  const { user } = useAuth(); // This will no longer crash
  const [profiles, setProfiles] = useState<SocialProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    if (!user) { // If there's no user, stop loading and clear profiles
      setProfiles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { jwt } = await generateUserJwt(user.id);
      const data = await getProfiles(jwt);
      setProfiles(data.profiles || []);
    } catch (err) {
      setError('Failed to fetch social profiles.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [user]); // This dependency array ensures profiles are fetched when the user logs in

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