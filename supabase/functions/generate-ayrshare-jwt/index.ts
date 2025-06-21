// supabase/functions/generate-ayrshare-jwt/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// These keys are securely read from the environment variables you will set for the function.
const AYRSHARE_API_URL = "https://app.ayrshare.com/api/profiles/generateJWT";
const AYRSHARE_API_KEY = Deno.env.get("AYRSHARE_API_KEY");
const AYRSHARE_PRIVATE_KEY = Deno.env.get("AYRSHARE_PRIVATE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!AYRSHARE_API_KEY || !AYRSHARE_PRIVATE_KEY) {
      throw new Error("Missing Ayrshare API or Private key in server environment variables.");
    }
    
    const { userId } = await req.json();
    if (!userId) {
      throw new Error("Missing userId in request body.");
    }

    // Call Ayrshare from the secure server environment
    const response = await fetch(AYRSHARE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AYRSHARE_API_KEY}`,
      },
      body: JSON.stringify({
        privateKey: AYRSHARE_PRIVATE_KEY,
        domain: userId,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Ayrshare API error");
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
