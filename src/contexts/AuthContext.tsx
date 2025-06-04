import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';

interface AuthCtx {
  user  : User | null;
  ready : boolean;          // true after the first onAuthStateChange fires
}
const AuthContext = createContext<AuthCtx>({ user: null, ready: false });
export default AuthContext;
