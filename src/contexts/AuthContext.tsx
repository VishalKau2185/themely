// src/contexts/AuthContext.tsx
import { createContext } from 'react';
// import { User } from '@supabase/supabase-js'; // REMOVE THIS LINE

interface AuthContextType {
  // Use a generic type for User here, or define it locally if needed
  // For simplicity, we can use 'any' or define a minimal interface if the full User type is causing issues
  currentUser: any | null; // Changed to 'any' for now to bypass the import error
  userId: string | null;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export default AuthContext;