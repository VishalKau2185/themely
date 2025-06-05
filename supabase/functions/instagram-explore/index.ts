// supabase/functions/instagram-explore/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import ApifyClient from 'npm:apify-client@2.0.0';
import 'npm:tslib'; // Ensure tslib is imported

console.log('Function: instagram-explore - Starting initialization...');

// Get the Apify API token from Supabase secrets (environment variables)
const APIFY_API_TOKEN = Deno.env.get('APIFY_API_TOKEN');
console.log(`APIFY_API_TOKEN status: ${APIFY_API_TOKEN ? 'Loaded' : 'MISSING'}`);

// IMPORTANT: Define the specific Actor ID for PROFILE scraping.
const INSTAGRAM_PROFILE_SCRAPER_ACTOR_ID = 'apify/instagram-profile-scraper'; // This is correct
console.log(`INSTAGRAM_PROFILE_SCRAPER_ACTOR_ID: ${INSTAGRAM_PROFILE_SCRAPER_ACTOR_ID}`);

// Initialize Apify Client outside serve, but handle potential missing token gracefully
let apifyClient: ApifyClient | undefined;

if (!APIFY_API_TOKEN) {
  console.error('SERVER_INIT_ERROR: APIFY_API_TOKEN is NOT SET. ApifyClient will not be initialized.');
} else {
  try {
    apifyClient = new ApifyClient({
      token: APIFY_API_TOKEN,
    });
    console.log('ApifyClient initialized successfully.');
  } catch (e) {
    console.error('SERVER_INIT_ERROR: Failed to initialize ApifyClient with provided token:', e);
  }
}

console.log('Function: instagram-explore - Initialization complete. Serving requests...');

serve(async (req) => {
  // --- CORS Handling ---
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // IMPORTANT: Change to your frontend domain in production
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Accept, Accept-Language, Content-Type, Authorization, x-client-info, apikey',
  };

  // Log all incoming request headers for debugging CORS issues
  console.log('--- Incoming Request Headers ---');
  for (const [key, value] of req.headers.entries()) {
    console.log(`${key}: ${value}`);
  }
  console.log('------------------------------');

  // Handle CORS preflight requests (OPTIONS method)
  if (req.method === 'OPTIONS') {
    console.log('Received OPTIONS request (CORS preflight). Responding with OK and CORS headers.');
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }
  // --- End CORS Handling ---

  // Check if ApifyClient was successfully initialized before proceeding with API calls
  if (!apifyClient) {
    console.error('RUNTIME_ERROR: ApifyClient not initialized at request time due to missing/invalid token or prior boot error.');
    return new Response(
      JSON.stringify({ error: 'Server initialization error. Please check function logs.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }

  // Ensure the request method is POST for actual data requests
  if (req.method !== 'POST') {
    console.warn(`Received unsupported method: ${req.method}. Only POST is allowed.`);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  let body;
  let rawBody: string = '';

  try {
    rawBody = await req.text();
    console.log('Received raw request body:', rawBody);

    if (!rawBody.trim()) {
      console.error('Request body is empty or contains only whitespace. Cannot parse as JSON.');
      const errorResponse = JSON.stringify({ error: 'Request body is empty.' });
      console.log(`Responding with 400 error (empty body): ${errorResponse}`);
      return new Response(
        errorResponse,
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    body = JSON.parse(rawBody);
    console.log('Parsed request body (successful):', JSON.stringify(body));
  } catch (e) {
    console.error('Failed to parse request body as JSON:', e);
    console.error('Raw body that failed parsing:', rawBody);
    const errorResponse = JSON.stringify({ error: 'Invalid JSON body provided. Raw body: ' + rawBody.substring(0, 100) + '...' });
    console.log(`Responding with 400 error (JSON parse failure): ${errorResponse}`);
    return new Response(
      errorResponse,
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }

  const { query, searchType, limit = 10 } = body;
  console.log(`Received request - Query: "${query}", SearchType: "${searchType}", Limit: ${limit}`);


  if (!query || searchType !== 'handle') {
    console.error(`Validation Error: Invalid or missing parameters. Query: "${query}", SearchType: "${searchType}".`);
    const errorResponse = JSON.stringify({
      error: 'Invalid or missing parameters. This function only supports "handle" searchType.',
    });
    console.log(`Responding with 400 error (validation failure): ${errorResponse}`);
    return new Response(
      errorResponse,
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }

  let actorId: string;
  let runInput: any;

  actorId = INSTAGRAM_PROFILE_SCRAPER_ACTOR_ID;
  runInput = {
    usernames: [query.replace('@', '').toLowerCase()],
    resultsLimit: limit,
    // IMPORTANT: Check the documentation for 'apify/instagram-profile-scraper'
    // This actor often has options to fetch posts, or posts are within a specific field.
    // Common parameters to get posts:
    // extractPosts: true, // if supported
    // maxPosts: limit, // if supported
    // postsInfo: 'full', // if supported
  };

  try {
    console.log(`Attempting to call Apify Actor ${actorId} with input: ${JSON.stringify(runInput)}`);
    const actorRun = await apifyClient.actor(actorId).call(runInput);
    console.log(`Apify Actor run started. Default Dataset ID: ${actorRun.defaultDatasetId}`);

    const { items } = await apifyClient.dataset(actorRun.defaultDatasetId).listItems();
    console.log(`Apify Actor returned ${items.length} items. Raw items structure:`, JSON.stringify(items[0] || {})); // Log first item for inspection

    // FIX: Process items to extract posts.
    // The 'instagram-profile-scraper' typically returns one main profile object,
    // and posts are usually within that object (e.g., in a field like 'posts' or 'edge_owner_to_timeline_media.edges').
    // If 'items' contains only profile data, you need to dig into it.
    let profileData: any = items[0]; // Assuming the first item is the main profile data
    let rawPosts: any[] = [];

    // Common paths where Instagram Profile Scrapers might store posts:
    if (profileData && Array.isArray(profileData.posts)) { // Check if 'posts' array exists directly
        rawPosts = profileData.posts;
    } else if (profileData && profileData.edge_owner_to_timeline_media && Array.isArray(profileData.edge_owner_to_timeline_media.edges)) {
        rawPosts = profileData.edge_owner_to_timeline_media.edges.map((edge: any) => edge.node);
    } else if (profileData && profileData.latestPosts && Array.isArray(profileData.latestPosts)) { // Another common field
        rawPosts = profileData.latestPosts;
    } else if (items.length > 1 && items[0].__typename === 'GraphProfile' && items[1].__typename === 'GraphImage') {
        // If the dataset contains profile data as first item, and then subsequent items are posts
        rawPosts = items.filter((item: any) => item.__typename === 'GraphImage' || item.__typename === 'GraphVideo');
    } else {
        // Fallback: Assume items themselves are posts if no specific structure is found.
        // This is less likely for profile scrapers.
        rawPosts = items;
        console.warn('Could not find expected post structure (posts/edge_owner_to_timeline_media), assuming items are direct posts.');
    }

    console.log(`Extracted ${rawPosts.length} raw posts for formatting.`);

    const formattedResults = rawPosts.map((item: any) => {
      // IMPORTANT: Adjust these field names based on the actual output structure of an individual post object
      // (whether it's from 'posts', 'edges', or a direct item).
      const postUrl = item.url || item.displayUrl || item.shortcodeUrl || item.post_url || `https://www.instagram.com/p/${item.shortcode}/`;
      const imageUrl = item.thumbnailSrc || item.displayUrl || item.mediaUrl || item.image_url || item.display_url || item.thumbnail_src;

      // Ensure that you're only processing actual post data, not other profile-related items
      if (!postUrl || !imageUrl) {
        console.warn('Skipping item during formatting due to missing essential post data (URL/Image):', item);
        return null;
      }

      return {
        platform: 'instagram',
        postUrl: postUrl,
        imageUrl: imageUrl, // Microlink might use this for preview image if embed fails
        caption: item.caption || item.text || item.description || item.edge_media_to_caption?.edges[0]?.node?.text || '',
        likes: item.likesCount || item.likes || item.edge_media_preview_like?.count || 0,
        comments: item.commentsCount || item.comments || item.edge_media_to_comment?.count || 0,
        username: item.ownerUsername || item.username || item.authorUsername || profileData.username || query.replace('@', '').toLowerCase(),
      };
    }).filter(Boolean); // Filter out any 'null' values from skipped items

    console.log(`Returning ${formattedResults.length} formatted results.`);
    return new Response(
      JSON.stringify({ success: true, data: formattedResults }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error(`Error during Apify Actor call or data processing for profile "${query}":`, error.message || error);
    let userErrorMessage = 'Failed to fetch Instagram data.';
    if (error.message && error.message.includes('No items in dataset')) {
        userErrorMessage = 'No posts found for this profile or the profile is private.';
    } else if (error.message && error.message.includes('API token is invalid')) {
        userErrorMessage = 'Server configuration error: Apify API token is invalid.';
    } else if (error.message && error.message.includes('Actor did not finish successfully')) {
        userErrorMessage = 'Apify scraper error. The Instagram profile might not be accessible.';
    }
    const errorResponse = JSON.stringify({ error: userErrorMessage });
    console.log(`Responding with 500 error (Apify call failure): ${errorResponse}`);
    return new Response(
      errorResponse,
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
