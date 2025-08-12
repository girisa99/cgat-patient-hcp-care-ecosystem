import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    const apiKey = Deno.env.get("PERPLEXITY_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "PERPLEXITY_API_KEY not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sys = {
      role: "system",
      content:
        "You are a planner for a visual AI workflow builder. Return JSON only with an array 'suggestions' of objects: {type: one of ['agent','touchpoint','decision','mcp','labelstudio'], label, description, capabilities?: string[]}. No prose.",
    };

    const resp = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [sys, { role: "user", content: prompt || "Generate a simple agent with one touchpoint" }],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 600,
      }),
    });

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content ?? "{\"suggestions\": []}";
    let json;
    try {
      json = JSON.parse(content);
    } catch {
      json = { suggestions: [] };
    }

    return new Response(JSON.stringify(json), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("perplexity-recommend error", e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
