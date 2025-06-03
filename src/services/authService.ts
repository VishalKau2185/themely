// src/services/authService.ts
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js'; // <--- ADD 'type' KEYWORD HERE

// Function to listen for authentication state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  // .data.subscription is used to get the subscription object for cleanup
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  }).data.subscription;
};

// Function for anonymous sign-in (useful for initial testing)
export const signInAnonymously = async (): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    console.log('Signed in anonymously:', data.user);
    return data.user;
  } catch (error: any) {
    console.error('Error signing in anonymously:', error.message);
    throw error;
  }
};

// Placeholder for future email/password sign-in
export const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
  // Implement later
  console.log('Sign in with email:', email);
  return null;
};

// Placeholder for sign out
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log('Signed out successfully.');
  } catch (error: any) {
    console.error('Error signing out:', error.message);
    throw error;
  }
};