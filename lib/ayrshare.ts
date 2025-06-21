// lib/ayrshare.ts
import { supabase } from '../src/services/supabaseClient'; // Correct path to your client

const API_URL = import.meta.env.VITE_AYRSHARE_API_URL;

// This function now securely calls your own Supabase Edge Function.
export const generateUserJwt = async (userId: string) => {
  const { data, error } = await supabase.functions.invoke('generate-ayrshare-jwt', {
    body: { userId },
  });

  if (error) throw error;
  if (data.error) throw new Error(data.error); // Handle errors from the edge function
  
  return data;
};

// This is a generic function to make all other Ayrshare requests.
const makeApiRequest = async (endpoint: string, method: string = 'POST', body: object = {}) => {
  const apiKey = import.meta.env.VITE_AYRSHARE_API_KEY;
  if (!apiKey) {
    throw new Error("API key not configured in .env.local.");
  }

  const baseUrl = endpoint === 'post' ? 'https://app.ayrshare.com/api' : API_URL;
  
  const response = await fetch(`${baseUrl}/${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error(`Ayrshare API Error on ${endpoint}:`, data);
    throw new Error(data.message || `API Error on ${endpoint}.`);
  }
  return data;
};

// --- These functions use the generic request function ---
export const getProfiles = (jwt: string) => makeApiRequest('profiles', 'POST', { jwt });
export const deleteSocial = (jwt: string, profileKeys: string[]) => makeApiRequest('profiles/delete', 'POST', { jwt, profileKeys });

interface SchedulePostData {
  post: string;
  destinations: string[];
  scheduleDate: string;
  media_urls?: string[];
}
export const schedulePost = (postData: SchedulePostData) => makeApiRequest('post', 'POST', postData);
