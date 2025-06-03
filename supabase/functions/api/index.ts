// supabase/functions/api/index.ts
// This is a simple Edge Function that responds with a JSON message.
// It demonstrates the basic structure for your serverless functions.
Deno.serve(async (req) => {
  const { name } = await req.json();
  const data = {
    message: `Hello, ${name || 'world'}! This is your Supabase Edge Function.`,
  };

  return new Response(
    JSON.stringify(data),
    { headers: { 'Content-Type': 'application/json' } },
  );
});