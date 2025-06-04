import React, { useEffect, useState } from 'react';
import { supabase }  from '../services/supabaseClient';
import AuthContext   from '../contexts/AuthContext';
import { saveProfile } from '../services/profileService';   // see §3

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user , setUser ] = useState<ReturnType<typeof supabase.auth.getUser>['data']['user'] | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { subscription } = supabase.auth.onAuthStateChange(async (evt, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (!ready) setReady(true);

      // one-liner: ensure a row exists
      if (u && (evt === 'INITIAL_SESSION' || evt === 'SIGNED_IN'))
        await saveProfile({ id: u.id, email: u.email, full_name: u.user_metadata?.full_name ?? null });
    }).data;

    return () => subscription.unsubscribe();
  }, [ready]);

  return (
    <AuthContext.Provider value={{ user, ready }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
