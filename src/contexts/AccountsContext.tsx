// src/contexts/AccountsContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react'; // <-- CHANGED: Simplified React import
import useAuth from '../hooks/useAuth'; // <-- CHANGED: Corrected to handle a default export
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

// CHANGED: Using React.ReactNode directly
export const AccountsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<SocialProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    if (!user) {
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
  }, [user]);

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