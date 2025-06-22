import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const AYRSHARE_API_URL     = "https://app.ayrshare.com/api/profiles/generateJWT";
const AYRSHARE_API_KEY     = Deno.env.get("AYRSHARE_API_KEY");
const AYRSHARE_PROFILE_KEY = Deno.env.get("AYRSHARE_PROFILE_KEY");

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, Profile-Key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Max-Age":       "3600",
};

// Load Private Key (must include real newlines via supabase secrets)
const AYRSHARE_PRIVATE_KEY = Deno.env.get("AYRSHARE_PRIVATE_KEY");
if (!AYRSHARE_PRIVATE_KEY) {
  throw new Error(
    "Missing AYRSHARE_PRIVATE_KEY env var. Run:\n" +
    "  supabase secrets set AYRSHARE_PRIVATE_KEY \"$(< private.key)\""
  );
}

// Validate API & Profile keys
if (!AYRSHARE_API_KEY) {
  throw new Error("Missing AYRSHARE_API_KEY env var");
}
if (!AYRSHARE_PROFILE_KEY) {
  throw new Error("Missing AYRSHARE_PROFILE_KEY env var");
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // You can ignore userId here since domain is fixed
    // const { userId } = await req.json();
    // if (!userId) throw new Error("Missing userId in request body");

    const payload = {
      privateKey: AYRSHARE_PRIVATE_KEY,
      profileKey: AYRSHARE_PROFILE_KEY,
      domain:     "id-wrm16",  // ← your Ayrshare RefId
      verify:     true,    // set to false in prod if desired
    };

    // 1) Log the exact payload
    console.log("⇢ JWT Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(AYRSHARE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${AYRSHARE_API_KEY}`,
        "Profile-Key":   AYRSHARE_PROFILE_KEY,
      },
      body: JSON.stringify(payload),
    });

    // 2) Log response status & headers
    console.log("⇠ Ayrshare status:", response.status);
    console.log(
      "⇠ Ayrshare headers:",
      Object.fromEntries(response.headers.entries())
    );

    // 3) Log raw response body
    const text = await response.text();
    console.log("⇠ Ayrshare raw response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("JSON.parse error:", e);
      throw new Error(`Invalid JSON from Ayrshare: ${text}`);
    }

    if (!response.ok) {
      // 4) Log parsed error payload
      console.error("Ayrshare error payload:", data);
      throw new Error(data.message || `Ayrshare API error ${response.status}`);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });

  } catch (err: any) {
    // 5) Log full error
    console.error("❌ Edge Function Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});
