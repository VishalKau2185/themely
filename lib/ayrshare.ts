// lib/ayrshare.ts

const API_URL = import.meta.env.VITE_AYRSHARE_API_URL;

const makeApiRequest = async (endpoint: string, method: string = 'POST', body: object = {}) => {
  const apiKey = import.meta.env.VITE_AYRSHARE_API_KEY;
  if (!apiKey) {
    throw new Error("API key not configured in .env.local with 'VITE_' prefix.");
  }
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `API Error on ${endpoint}.`);
  }
  return data;
};

export const generateUserJwt = (userId: string) => makeApiRequest('user/jwt', 'POST', { "privateId": userId });
export const getProfiles = (jwt: string) => makeApiRequest('user/profiles', 'POST', { jwt });
export const deleteSocial = (jwt: string, profileKeys: string[]) => makeApiRequest('user/deleteSocial', 'POST', { jwt, profileKeys });

interface SchedulePostData {
  post: string;
  destinations: string[];
  scheduleDate: string;
  media_urls?: string[];
}
export const schedulePost = (postData: SchedulePostData) => makeApiRequest('post', 'POST', postData);