// supabase/functions/instagram-explore/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import ApifyClient from 'npm:apify-client@2.0.0';
import 'npm:tslib'; // Ensure tslib is imported

console.log('Function: instagram-explore - Starting initialization...');

const APIFY_API_TOKEN = Deno.env.get('APIFY_API_TOKEN');
console.log(`APIFY_API_TOKEN status: ${APIFY_API_TOKEN ? 'Loaded' : 'MISSING'}`);

const INSTAGRAM_PROFILE_SCRAPER_ACTOR_ID = 'apify/instagram-profile-scraper';
console.log(`INSTAGRAM_PROFILE_SCRAPER_ACTOR_ID: ${INSTAGRAM_PROFILE_SCRAPER_ACTOR_ID}`);

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
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Accept, Accept-Language, Content-Type, Authorization, x-client-info, apikey',
  };

  if (req.method === 'OPTIONS') {
    console.log('Received OPTIONS request (CORS preflight). Responding with OK and CORS headers.');
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  if (!apifyClient) {
    console.error('RUNTIME_ERROR: ApifyClient not initialized at request time.');
    return new Response(
      JSON.stringify({ error: 'Server initialization error. Please check function logs.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }

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
    if (!rawBody.trim()) {
      const errorResponse = JSON.stringify({ error: 'Request body is empty.' });
      return new Response(errorResponse, { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }
    body = JSON.parse(rawBody);
  } catch (e) {
    console.error('Failed to parse request body as JSON:', e, 'Raw body:', rawBody);
    const errorResponse = JSON.stringify({ error: 'Invalid JSON body. Raw body: ' + rawBody.substring(0, 100) + '...' });
    return new Response(errorResponse, { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
  }

  const { query, searchType, limit = 10 } = body; // 'limit' from frontend will be 3
  console.log(`Received request - Query: "${query}", SearchType: "${searchType}", Limit: ${limit}`);

  if (!query || searchType !== 'handle') {
    const errorResponse = JSON.stringify({ error: 'Invalid parameters. Only "handle" searchType supported.' });
    return new Response(errorResponse, { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
  }

  const actorId = INSTAGRAM_PROFILE_SCRAPER_ACTOR_ID;
  const runInput = {
    usernames: [query.replace('@', '').toLowerCase()],
    // resultsLimit: limit, // This might limit total items, not specifically posts.
    // --- CHANGE IS HERE ---
    // Add or prioritize maxPosts (or similar field based on actor docs) for post count.
    // The 'apify/instagram-profile-scraper' typically uses 'maxPosts' or similar.
    // Let's try `resultsLimit` for overall items from the actor and `maxPosts` for posts.
    // If the actor only focuses on ONE profile when given one username, then 'maxPosts' is more direct.
    // resultsLimit might be more about how many profiles to process if usernames was an array of many.
    // For a single profile, the number of posts is the key.
    maxPosts: limit, // Request the actor to fetch this many posts
    // You might still keep resultsLimit if the actor's documentation suggests it,
    // but maxPosts is often more specific for post count.
    // For this actor, `maxPosts` seems to be the correct parameter.
    // Check actor documentation: https://apify.com/apify/instagram-profile-scraper
    // As of typical usage, 'resultsLimit' is often for the number of profiles when 'usernames' is a list.
    // 'maxPosts' or 'postsLimit' would be for posts per profile.
    // Let's assume 'maxPosts' is the correct field for this actor to limit posts.
    // If you still get more than 'limit', the actor might have a minimum fetch or 'resultsLimit' might interact.
  };

  try {
    console.log(`Calling Apify Actor ${actorId} with input: ${JSON.stringify(runInput)}`);
    const actorRun = await apifyClient.actor(actorId).call(runInput);
    console.log(`Apify Actor run started. Dataset ID: ${actorRun.defaultDatasetId}`);

    const { items } = await apifyClient.dataset(actorRun.defaultDatasetId).listItems();
    console.log(`Apify Actor returned ${items.length} items. First item (if any):`, JSON.stringify(items[0] || {}));

    let profileData: any = items[0];
    let rawPosts: any[] = [];

    if (profileData && Array.isArray(profileData.posts)) {
      rawPosts = profileData.posts;
    } else if (profileData && profileData.edge_owner_to_timeline_media?.edges) {
      rawPosts = profileData.edge_owner_to_timeline_media.edges.map((edge: any) => edge.node);
    } else if (profileData && Array.isArray(profileData.latestPosts)) {
      rawPosts = profileData.latestPosts;
    } else if (items.length > 0 && items[0].__typename === 'GraphProfile' && items.length > 1) {
        // This case might be when the first item is profile, and subsequent are posts
        rawPosts = items.slice(1).filter((item: any) => item.__typename === 'GraphImage' || item.__typename === 'GraphVideo' || item.postUrl || item.url); // Heuristic for posts
    } else if (items.length > 0 && !profileData.username && (items[0].postUrl || items[0].url)){ // If items look directly like posts
        rawPosts = items;
    } else {
      console.warn('Could not find expected post structure. items[0]:', JSON.stringify(items[0]));
      rawPosts = []; // Default to empty if no posts found in expected structures
    }
    
    // If rawPosts were extracted from a nested field (like profileData.posts),
    // they might already be limited by the actor. If they were the items directly,
    // and there were more items than 'limit' (e.g. profile + posts), we might need to slice.
    // However, the primary limiting should happen at the actor input level.
    // The map function will process what's in rawPosts.

    console.log(`Extracted ${rawPosts.length} raw posts for formatting.`);

    const formattedResults = rawPosts.map((item: any) => {
      const postUrl = item.url || item.displayUrl || item.shortcodeUrl || item.post_url || (item.shortcode ? `https://www.instagram.com/p/${item.shortcode}/` : undefined);
      const imageUrl = item.thumbnailSrc || item.displayUrl || item.mediaUrl || item.image_url || item.display_url || item.thumbnail_src;

      if (!postUrl) { // A post must have a URL
        console.warn('Skipping item: missing postUrl.', JSON.stringify(item).substring(0,200));
        return null;
      }

      return {
        platform: 'instagram',
        postUrl: postUrl,
        imageUrl: imageUrl,
        caption: item.caption || item.text || item.description || item.edge_media_to_caption?.edges[0]?.node?.text || '',
        likes: item.likesCount || item.likes || item.edge_media_preview_like?.count || 0,
        comments: item.commentsCount || item.comments || item.edge_media_to_comment?.count || 0,
        username: item.ownerUsername || item.username || item.authorUsername || profileData?.username || query.replace('@', '').toLowerCase(),
      };
    }).filter(Boolean);

    // Additional client-side slice if needed, though ideally actor respects the limit.
    const finalResults = formattedResults.slice(0, limit);

    console.log(`Returning ${finalResults.length} formatted results (after potential slice).`);
    return new Response(
      JSON.stringify({ success: true, data: finalResults }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error(`Error for profile "${query}":`, error.message || error);
    let userErrorMessage = 'Failed to fetch Instagram data.';
    if (error.message?.includes('No items in dataset')) {
      userErrorMessage = 'No posts found or profile is private.';
    } else if (error.message?.includes('API token is invalid')) {
      userErrorMessage = 'Server configuration error: Apify API token invalid.';
    } else if (error.message?.includes('Actor did not finish successfully')) {
      userErrorMessage = 'Apify scraper error: Profile might not be accessible.';
    }
    const errorResponse = JSON.stringify({ error: userErrorMessage });
    return new Response(errorResponse, { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
