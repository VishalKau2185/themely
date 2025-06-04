// src/services/profileService.ts
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js/src/lib/types'; // Import User type for type hinting

export interface Profile {
  id: string;
  email: string | null; // Profile table might store email for convenience
  full_name: string | null;
  // Removed bio and avatar_url fields from interface
  linked_accounts?: Record<string, any> | null; // Ensure this matches your DB schema
}

/* ------- one helper does insert OR update in a single call ------- */
// Returns [data, error] tuple. Data is null if error.
export const upsertProfile = async (
  id: string,
  email: string | null, // Keeping email parameter for consistency with original signature, though not used in upsert object
  full_name: string | null
): Promise<[Profile | null, Error | null]> => {
  console.log("profileService: upsertProfile called for ID:", id);
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          full_name: full_name,
        },
        { onConflict: 'id' } // Use onConflict: 'id' to ensure it updates if row exists
      )
      .select()
      .single();

    if (error) {
      console.error('profileService: upsertProfile error from Supabase:', error);
      return [null, error];
    }
    console.log('profileService: upsertProfile successful:', data);
    return [data as Profile, null];
  } catch (e: any) {
    console.error('profileService: upsertProfile unexpected error (caught):', e.message);
    return [null, e];
  }
};

// Returns [data, error] tuple. Data is null if not found or error.
export const fetchProfile = async (id: string): Promise<[Profile | null, Error | null]> => {
  console.log("profileService: fetchProfile called for ID:", id);
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle(); // Use maybeSingle() as profile might not exist

    if (error) { // Supabase returns error object even for no rows found if single() is used. maybeSingle() returns null data, no error for no rows.
      console.error('profileService: fetchProfile error from Supabase:', error);
      return [null, error];
    }
    console.log('profileService: fetchProfile successful:', data);
    return [data as Profile | null, null];
  } catch (e: any) {
    console.error('profileService: fetchProfile unexpected error (caught):', e.message);
    return [null, e];
  }
};