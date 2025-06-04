// src/services/dbService.ts
// This file will now contain only general database operations if needed,
// profile-specific operations are moved to profileService.ts
import { supabase } from './supabaseClient';

// --- Diagnostic Logs (can be removed in production) ---
console.log("dbService.ts: Supabase client URL:", supabase.supabaseUrl);
// The anonKey property on the client is often not directly exposed for logging.
console.log("dbService.ts: Supabase client anon key (first 5 chars):", supabase.anonKey ? supabase.anonKey.substring(0, 5) + '...' : 'Not directly exposed on client object');
// --- End Diagnostic Logs ---

// Placeholder for other database operations (e.g., fetching library items)
export const getLibraryItems = async (userId: string) => {
  console.log('Fetching library items for user:', userId);
  return []; // Return an empty array for now
};

// You can add other generic database functions here as your app grows
// Example:
// export const fetchGenericData = async (tableName: string) => {
//   try {
//     const { data, error } = await supabase.from(tableName).select('*');
//     if (error) throw error;
//     return data;
//   } catch (error) {
//     console.error(`Error fetching from ${tableName}:`, error);
//     return null;
//   }
// };