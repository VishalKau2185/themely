// lib/ayrshare.ts
import { Base64 } from 'js-base64';

const API_URL = import.meta.env.VITE_AYRSHARE_API_URL;

const makeApiRequest = async (endpoint: string, method: string = 'POST', body: object = {}) => {
  const apiKey = import.meta.env.VITE_AYRSHARE_API_KEY;
  if (!apiKey) {
    throw new Error("API key not configured in .env.local with 'VITE_' prefix.");
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

/**
 * Generates a short-lived JSON Web Token (JWT) for a specific user.
 */
export const generateUserJwt = (userId: string) => {
  // --- THIS IS THE DEFINITIVE FIX ---
  // The private key is now hardcoded directly into the code to bypass all .env file issues.
  const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAyx8iPayRBGSCV0lg8aMbBFACOoNGWCjhR0qgC23CVawhdW3t
rjNhHYWnX7czSdXjgRi/LNuX0sAyRuQJ9fy3nqwuKIn8nzQBWWoXezFP+SxvLb29
PhvsJeyjMaWwt3TSmRTV7p1VQ1tr2cpHcWB6O51w+402S03nOGf09H+wzBHL+oGn
n3ke7vYC7TZD/4kLuBRLGMs7k8BfTO95ycvajXY6lcVfnjD7ZPhvLnTF0BTVoJ2V
mYVvKNpngLW2ib3KAWH94OQ7eSJg00X+9GlGkf2kLYKlRrj0SuTwNKl0JDN2/16t
zkiSXWibDKGVuDZ0RZLcgONwy6hA3t/YW0bvBQIDAQABAoIBAA4g28JbcvjRvukw
XvBfznzFzenhAK8YJNdPHwO8fjR0VR10aIBh7YLerY4wUX50xK7RmFaX7Z8IpFae
/PxhuCnuwwUp1+sA9IkSIpD8lJn517/gPz4HNi1LIOzOoBSaqR1hwCGpSul0/fL3
qXF+6vGjmVy97UVepVMclAK/sP34rQXmX1kFCKv4TjgTCF1mK9/bEOriTubD3CGt
jQg64AZdDW817sWFMEhS/RrVNOU4upyNgwuorFu/yuELR6531i1fYgnRFe/Hnx2Y
2IC1o1e99bpnL6xtmM+qIWpDRSD9lGhBbNadKF8v2SjlI8d9HLsIu8gHx8QAI2OF
B8CerP8CgYEA/fJqQ+x2+wldDu0MyVUTw5jzmg+PeaX6VxEq6rW6b0PB2Pzdda5f
Jb8eeWFKQgTCFRWWHf7I5N8sYyr5avd4bQkk6M3kMLhghb5geTBV/lyDuAyOW4hF
3U9wZr05Qy4qjauK+Ks7f3EX7/k3dmjLmkkVaELMeho3y1YGAaWCk2MCgYEAzMOG
/b+8J9PoocNFj96grViqbw1gYphXYINU/NM1tiJca3dqJaoSmMVejh07JzE+mbi1
GtIKZ0bylGQ3L6WBG6UtI2ItWRLxQnxfEpvxInLlov1Th3TBBlg0bV10UzQM7rpa
tUZubREWNy2uF7/o3A5SjyC3FXr/q5tNvDkDpHcCgYEAm8EHNEngX/BKR1FVOlcY
HCu/nYpVsYL/nE9HR1XW109zoabWHcupR/mEs2XcqclJUK1AuXz/soC/NMOy3syR
7C5jmPZPMyKi8OTnPu1KkQwlLclltvZKA4cppZoBeRbjuqiwP/ymLXAsAl+UiOeV
mTeiDaSKzYkvF2PXo0LkZ4kCgYEAr8KN1rWDjjRJFMEGrq2MAf9/m/9BYqAdMEzK
4JFzIzlvVxeTV20atWOE/Dt/EO8mKtDvM2xjXa76fgFflVhc8BviGOMmxbSKvmT/
Pnv4iXdSQYts7XJ8VTPVHKMBPIILL8dqIPupwZjPFuHw85XZDTqGBzEvthJz7xtJ
qGzQAZUCgYEA3KN6ZBWLQ7d/n/B5tEQcnqVDCJW+tq++muR/6oJVLQxjOoWGusE+
LOs0+jaVgqA3cSzAVCTLi7BBf1TSB5eR9YtWSwxbqapZ8/yQjhkahQbNTkhvcIvK
vUD1QpOhl5toP7l9LMIvl7bBXcs9UOR31rH2bZKl1tr34wBgDpV1PcY=
-----END RSA PRIVATE KEY-----`;
  
  return makeApiRequest('profiles/generateJWT', 'POST', { 
    "privateKey": privateKey,
    "domain": userId
  });
};

// --- These endpoints do not need to be changed ---
export const getProfiles = (jwt: string) => makeApiRequest('profiles', 'POST', { jwt });
export const deleteSocial = (jwt: string, profileKeys: string[]) => makeApiRequest('profiles/delete', 'POST', { jwt, profileKeys });

interface SchedulePostData {
  post: string;
  destinations: string[];
  scheduleDate: string;
  media_urls?: string[];
}
export const schedulePost = (postData: SchedulePostData) => makeApiRequest('post', 'POST', postData);
