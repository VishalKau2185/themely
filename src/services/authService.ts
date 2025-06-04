// src/services/authService.ts
import { supabase } from './supabaseClient'; // Import the single, shared Supabase client instance
import type { User } from '@supabase/supabase-js/src/lib/types'; // Import User type for type hinting

// --- Diagnostic Logs (can be removed in production) ---
console.log("authService.ts: Supabase client URL:", supabase.supabaseUrl);
// The anonKey property on the client is often not directly exposed for logging.
console.log("authService.ts: Supabase client anon key (first 5 chars):", supabase.anonKey ? supabase.anonKey.substring(0, 5) + '...' : 'Not directly exposed on client object');
// --- End Diagnostic Logs ---


// Function to listen for authentication state changes from Supabase
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  // Returns the subscription object for cleanup (e.g., in a useEffect hook)
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null); // Pass the user object (or null if logged out) to the callback
  }).data.subscription;
};

// Function to sign in anonymously (if enabled in Supabase dashboard)
export const signInAnonymously = async (): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error; // Throw any errors encountered during sign-in
    console.log('Signed in anonymously:', data.user);
    return data.user; // Return the anonymous user object
  } catch (error: any) {
    console.error('Error signing in anonymously:', error.message);
    throw error; // Re-throw the error for handling in the calling component
  }
};

// Function for user registration with Email and Password
export const signUpWithEmail = async (email: string, password: string): Promise<{ user: User | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error; // Throw any errors encountered during sign-up
    return { user: data.user, error: null }; // Return the newly signed-up user
  } catch (error: any) {
    console.error('Error signing up:', error.message);
    return { user: null, error: error }; // Return error object
  }
};

// Function for user login with Email and Password
export const signInWithEmail = async (email: string, password: string): Promise<{ user: User | null; session: any | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error; // Throw any errors encountered during sign-in
    return { user: data.user, session: data.session, error: null }; // Return user and session data
  } catch (error: any) {
    console.error('Error signing in with email:', error.message);
    return { user: null, session: null, error: error }; // Return error object
  }
};

// Function to sign out the current user
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error; // Throw any errors encountered during sign-out
    console.log('Signed out successfully.');
  } catch (error: any) {
    console.error('Error signing out:', error.message);
    throw error; // Re-throw the error
  }
};