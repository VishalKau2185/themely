// lib/ayrshare.ts
import { supabase } from '../src/services/supabaseClient';

// Edge Function to generate JWT
export const generateUserJwt = async (userId: string) => {
  const { data, error } = await supabase.functions.invoke('generate-ayrshare-jwt', {
    body: { userId },
  });
  if (error) throw error;
  // Ensure that 'data' is not null or undefined before accessing 'data.error'
  if (data && data.error) throw new Error(data.error); // Adjusted to handle null/undefined 'data'
  return data;
};

// Generic Ayrshare API request helper
const makeApiRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' = 'POST',
  body: object = {},
  jwt?: string
) => {
  // CORRECTED LINE: Removed backslashes
  const apiKey = import.meta.env.VITE_AYRSHARE_API_KEY;
  if (!apiKey) {
    throw new Error("API key not configured in .env.local.");
  }

  // CORRECTED LINE: Removed backslashes
  const baseUrl = import.meta.env.VITE_AYRSHARE_API_URL;
  const url = `${baseUrl}/${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwt ?? apiKey}`,
  };

  // CORRECTED LINE: Removed backslashes and ensuring profileKey is correctly sourced
  const profileKey = import.meta.env.VITE_AYRSHARE_PROFILE_KEY;
  if (profileKey) headers['Profile-Key'] = profileKey;

  const response = await fetch(url, {
    method,
    headers,
    body: method === 'GET' ? undefined : JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error(`Ayrshare API Error on ${endpoint}:`, data);
    throw new Error(data.message || `API Error on ${endpoint}.`);
  }
  return data;
};

// Ensure or create user profile (requires domain & title)
export const ensureUserProfile = async (domain: string, title: string) => {
  try {
    const profiles = await makeApiRequest('profiles', 'GET');
    // Ensure profiles is an array before calling .find
    const existing = Array.isArray(profiles) ? profiles.find(p => p.domain === domain) : undefined;
    if (existing) return existing;
  } catch (e) {
    // It's generally better to log the error even if ignoring, for debugging
    console.warn("Error checking for existing profile, attempting to create:", e);
  }
  return makeApiRequest('profiles', 'POST', { domain, title });
};

// Fetch connected social accounts using JWT
export const getProfiles = async (jwt: string) => {
  return makeApiRequest('profiles', 'GET', {}, jwt);
};

// Unlink social networks
export const deleteSocial = async (jwt: string, profileKeys: string[]) => {
  return makeApiRequest('profiles/delete', 'POST', { profileKeys }, jwt);
};

// Schedule a post
interface SchedulePostData {
  post: string;
  destinations: string[];
  scheduleDate: string;
  media_urls?: string[];
}
export const schedulePost = (postData: SchedulePostData) =>
  makeApiRequest('post', 'POST', postData);